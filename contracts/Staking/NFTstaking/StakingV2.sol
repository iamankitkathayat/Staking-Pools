// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../Registry/IAdminRegistry.sol";
import "../Tokens/IPremiumNFT.sol";
import "../Tokens/Enoch.sol";
import "hardhat/console.sol";

// APY - 90%
// Staking period - 3 Months
// APY && term fixed => Interest changes with compound frequency
// caln in how many decimals ??

contract StakingV2 is
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{

    using SafeMath for uint256;

    address public stakingToken; // ERC721
    address public rewardToken; // ERC20 - Enoch Tokens

    // in month
    uint256 public STAKING_MONTHS; // initialize  
    uint256 public APY;
    uint256 public REWARD_CONSTANT;

    uint256 public constant PRECISION_CONSTANT = 10000;
    uint256 public constant oneMonthTimeConstant = 2592000;
    uint256 public maxUnclaimableToken;

    address public adminRegistry;


    // userAddress => (tokenId => UserStakeInfo)
    mapping(address => mapping(uint256 => StakingDetails)) public UserInfo;

    event NFTStaked(
        address indexed user,
        uint256 indexed tokenId,
        uint256 nftValue,
        uint256 timestamp
    );

    // emitted when the user collects all the rewards
    event RewardsClaimed(address indexed _user, uint256 _stakedTokenId, uint256 _rewardAmount, uint256 _timestamp);

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "AdminRegistry: Restricted to admin."
        );
        _;
    }

    struct StakingDetails {
        uint256 stakingTimestamp;
        uint256 NFTvalue;
        uint256 totalClaimableRewards; 
        uint256 claimedRewards;
        uint256 rewardInstallment;
        uint256 lastWithdrawalTime;
        uint256 lastRewardAccumulatedTime;
    }

    function initialize(
        address _stakingToken,
        address _rewardToken,
        uint256 _interestRate,
        uint256 _stakingPeriod,
        address _adminRegistry
    ) external initializer {
        __UUPSUpgradeable_init();
        stakingToken = _stakingToken;
        rewardToken = _rewardToken;
        APY = _interestRate;
        STAKING_MONTHS = _stakingPeriod;
        maxUnclaimableToken = _stakingPeriod - 1;
        adminRegistry = _adminRegistry;
    }

    //        ,-.
    //        `-'
    //        /|\
    //         |                    ,----------------.              
    //        / \                   |    Staking     |              
    //      Caller                  `-------+--------'              
    //        |                          stake()                         
    //        | --------------------------------------------------------->
    //        |                             |check owner & token approval|                        |
    //        |                             |----------------------------|
    //        |                             |     transfers NFT          |
    //        |                             |                            |
    //        |                             |                            |
    //        |                             |     update stake info      |
    //        |                             | --------------------------->
    //        |                             |   _calculateRewards()      |
    //        |                             |NFTvalue*REWARD_CONSTANT|
    //        |                             | --------------------------->
    //        |                             |   update reward info       |
    //        |                             |----.                       |
    //        |                             |    | emit NFTStaked        |
    //        |                             |<---'                       |
    //        |                             |                            |
    //        |                             |                            |
    //        | <----------------------------                            |
    //      Caller                  ,-------+--------.              
    //        ,-.                   |    Staking     |              
    //        `-'                   `----------------'              
    //        /|\
    //         |
    //        / \

    function stake(
        address _user,
        uint256 _tokenId,
        uint256 _nftValue
    ) external whenNotPaused onlyAdmin {

        // check token stake update, if false, then only stake
        require((IPremiumNFT(stakingToken).getTokenStakedInfo(_tokenId) == false), "Token already staked earlier");

        require(
            IPremiumNFT(stakingToken).ownerOf(_tokenId) == msg.sender,
            "Owner does not owns this NFT!"
        );
        // Check approval NFT -> this contract
        require(
            IPremiumNFT(stakingToken).getApproved(_tokenId) == address(this),

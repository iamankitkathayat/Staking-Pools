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
            "Staking Contract is not approved for this NFT!"
        );

        // transfer the tokens to this contract
        IPremiumNFT(stakingToken).transferFrom(_user, address(this), _tokenId);

        // keep track of how much this user has staked
        UserInfo[_user][_tokenId].stakingTimestamp = block.timestamp;
        UserInfo[_user][_tokenId].NFTvalue = _nftValue.mul(PRECISION_CONSTANT);

        // do calcn here and store in mapping
        (uint256 _totalRewards, uint256 _rewardInstallment) = _calculateRewards(
            _nftValue
        );
        UserInfo[_user][_tokenId].totalClaimableRewards = _totalRewards;
        UserInfo[_user][_tokenId].rewardInstallment = _rewardInstallment;

        emit NFTStaked(_user, _tokenId, _nftValue, block.timestamp);
    }


    //        ,-.
    //        `-'
    //        /|\
    //         |                    ,----------------.            
    //        / \                   |    Staking     |              
    //      Caller                  `-------+--------'              
    //        |                          stake()                         |
    //        | --------------------------------------------------------->
    //        |                             |calculate remaining reward |                        |
    //        |                             |----------------------------|
    //        |                             |checks if reward to claim is|          
    //        |                             |greater than maxUnclaimable |
    //        |                             |                            |
    //        |                             |checks if valid withdrawTime|
    //        |                             | --------------------------->
    //        |                             |update withdraw info        |
    //        |                             |transfer rewardInstallment  |
    //        |                             | --------------------------->
    //        |                             |  if (lastWithdrawal)       |
    //        |                             |      burns the STAKED NFT  |
    //        |                             |      set rewardClaimed true|
    //        |                             |----.                       |
    //        |                             |    | emit UserClaimedReward|
    //        |                             |<---'                       |
    //        | <----------------------------                            |
    //      Caller                  ,-------+--------.             
    //        ,-.                   |    Staking     |              
    //        `-'                   `----------------'              
    //        /|\
    //         |
    //        / \

    // time-reward check
    function claimReward(address _user, uint256 _tokenId) external onlyAdmin {
        uint256 remainingRewards = UserInfo[_user][_tokenId].totalClaimableRewards.sub(
            UserInfo[_user][_tokenId].claimedRewards
        );

        // dummy test time conditions keeping claiming just after staking and next after 3 mins i.e 180 sec.
        require((block.timestamp - UserInfo[_user][_tokenId].stakingTimestamp) >= 0 && (block.timestamp - UserInfo[_user][_tokenId].lastRewardAccumulatedTime) >= 180, "User cannot claim rewards before due time!");

        require(remainingRewards > maxUnclaimableToken, "You have claimed your rewards!");

        // one month = 30*24*60*60 = 2592000
        // require((block.timestamp - UserInfo[_user][_tokenId].stakingTimestamp) >= oneMonthTimeConstant && (block.timestamp - UserInfo[_user][_tokenId].lastRewardAccumulatedTime) >= oneMonthTimeConstant, "User cannot claim rewards before due time!");

        uint256 installment = UserInfo[_user][_tokenId].rewardInstallment;
        // pay one installments
        UserInfo[_user][_tokenId].claimedRewards += installment;
        UserInfo[_user][_tokenId].lastWithdrawalTime = block.timestamp;
        // UserInfo[_user][_tokenId].lastRewardAccumulatedTime += oneMonthTimeConstant;
        UserInfo[_user][_tokenId].lastRewardAccumulatedTime += 180;
        // transfer
        Enoch(rewardToken).mint(msg.sender, installment);

        if (UserInfo[_user][_tokenId].totalClaimableRewards.sub(UserInfo[_user][_tokenId].claimedRewards) <= 2) {
            // burn the token
            // change the token state
            IPremiumNFT(stakingToken).stakeToken(_tokenId);

            // all rewards claimed by the user
        }
        emit RewardsClaimed(_user, _tokenId, UserInfo[_user][_tokenId].claimedRewards, block.timestamp);
    }

    // APY and REWARDS Calculation
    // Compound Frequency fixed
    // APY = [{ 1 + r/n } ^ n] - 1
    // where, r - interest rate
    // n is number of times the interest is compounded per year
    // Since compound frequency is fixed to annually, therefore
    // n = 1
    //
    // APY = [{ 1 + r/1 } ^ 1] - 1
    //     = 1 + r - 1
    // APY = r = Interest Rate
    //
    // Total Staking Earnings Calculation
    // Suppose, your initial stake is d, and you stake for y years, interest rate - r
    // Earned Amount = Initial Stake * [1 + r/n] ^ (n * y)
    // Since n = 1,
    // Total Earning = d * [1 + r] ^ y
    //

    function _calculateRewards(
        uint256 _nftValue
    ) public view returns (uint256, uint256) {
    
        uint256 totalRewards = _nftValue.mul(REWARD_CONSTANT);

        uint256 rewardInstallment = totalRewards.div(STAKING_MONTHS);

        return (totalRewards, rewardInstallment);
    }

    // suppose, interest rate = 85% for term of 3 months
    // suppose x**y; x = 1.85, y = 0.25;
    // x**y = 1.1663
    // REWARD_CONSTANT = 11663
    function setRewardConstant(uint256 _rewardConstant) public onlyAdmin returns(uint256) {
        REWARD_CONSTANT = _rewardConstant;
        return REWARD_CONSTANT;
    }

    function getStakedInfo(address _user, uint256 _tokenId)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        // return all details
        return (
            UserInfo[_user][_tokenId].stakingTimestamp,
            UserInfo[_user][_tokenId].NFTvalue,
            UserInfo[_user][_tokenId].totalClaimableRewards,
            UserInfo[_user][_tokenId].claimedRewards,
            UserInfo[_user][_tokenId].rewardInstallment,
            UserInfo[_user][_tokenId].lastWithdrawalTime
        );
    }

    function getPendingRewardsInfo(address _user, uint256 _tokenId) public view returns (uint256) {
        return UserInfo[_user][_tokenId].totalClaimableRewards.sub(UserInfo[_user][_tokenId].claimedRewards);
    }

    function _authorizeUpgrade(address) internal override {}

    // admin functions => implement later
    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function pauseStatus() public view virtual returns (bool) {
        return paused();
    }

    function _msgSender() internal view override returns (address) {
        return msg.sender;
    }

    function _msgData() internal pure override returns (bytes calldata) {
        return msg.data;
    }
}

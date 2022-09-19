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

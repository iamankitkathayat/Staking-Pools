// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

import "../../Registry/IAdminRegistry.sol";
import "./Staking.sol";
import "./StakingProxy.sol";

contract StakeFactory is UUPSUpgradeable, PausableUpgradeable {

     /// @notice Address for implementation of Staking to clone
    address public implementation;
    address public adminRegistry;

    event StakeCreated(address _stake, address _stakingToken, address _rewardToken);

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "AdminRegistry: Restricted to admin."
        );
        _;
    }

    /// @dev Initializes the proxy contract
    function initialize(address _implementation, address _adminRegistry) external initializer {
        __UUPSUpgradeable_init();
        implementation = _implementation;
        adminRegistry = _adminRegistry;
    }

    //        ,-.
    //        `-'
    //        /|\
    //         |                    ,----------------.              ,----------.
    //        / \                   |  StakeFactory  |              | Staking  |
    //      Caller                  `-------+--------'              `----+-----'
    //        |                       setupStakeContract()               |
    //        | --------------------------------------------------------->
    //        |                             |                            |
    //        |                             |----.
    //        |                             |    | initialize 
    //        |                             |<---'
    //        |                             |                            |
    //        |                             |           deploy           |
    //        |                             | --------------------------->
    //        |                             |                            |
    //        |                             |       initialize stake     |
    //        |                             | --------------------------->
    //        |                             |                            |
    //        |                             |----.                       |
    //        |                             |    | emit StakeCreated     |
    //        |                             |<---'                       |
    //        |                             |                            |
    //        | return stake contract address|                            |
    //        | <----------------------------                            |
    //      Caller                  ,-------+--------.              ,----+-----.
    //        ,-.                   |  StakeFactory  |              | Staking  |
    //        `-'                   `----------------'              `----------'
    //        /|\
    //         |
    //        / \

    function setupStakeContract(
        address _stakingToken,
        address _rewardToken,
        uint256 _interestRate,
        uint256 _stakingPeriod,
        address _adminRegistry
    ) public returns (address) {
        StakingProxy newStake = new StakingProxy(implementation, "");

        address payable newStakeAddress = payable(address(newStake));

        Staking(newStakeAddress).initialize(
            _stakingToken,
            _rewardToken,
            _interestRate,
            _stakingPeriod,
            _adminRegistry
        );

        emit StakeCreated(newStakeAddress, _stakingToken, _rewardToken);
        return newStakeAddress;
    }

     function _authorizeUpgrade(address _newImplementation)
        internal
        override
        onlyAdmin
    {}

     function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }


}

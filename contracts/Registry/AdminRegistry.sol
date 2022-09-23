// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract AdminRegistry is AccessControlEnumerable {

    constructor(address account) {
        _setupRole(DEFAULT_ADMIN_ROLE, account);
    }

    // @notice only admin registered in admin registry contract can call it
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "AdminRegistry: Restricted to admin.");
        _;
    }

    /*
     * @dev Checks if the given address is the admin
     * @param address of the user
     */
    function isAdmin(address account) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /*
     * @dev Adds the admin role for the given address
     * @param address of the user
     */
    function addAdmin(address account) external onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, account);
    }

    /*
     * @dev Removes oneself as the admin member of th community
     */
    function leaveRole() external {
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /*
     * @dev Removes the given address from the admin role
     * @param address of the user
     */
    function removeAdmin(address account) external onlyAdmin {
        revokeRole(DEFAULT_ADMIN_ROLE, account);
    }

    /*
    * @dev Lists out the list of all the admin addresses
    * @returns total number of admins and list of admin addresses
    */
    function getRoleMembers()
        external
        view
        returns (uint256, address[] memory)
    {
        uint256 roleMemberCount = getRoleMemberCount(DEFAULT_ADMIN_ROLE);
        address[] memory roleMembers = new address[](roleMemberCount);

        for (uint256 index = 0; index < roleMemberCount; index++) {
            roleMembers[index] = getRoleMember(DEFAULT_ADMIN_ROLE, index);
        }

        return (roleMemberCount, roleMembers);
    }

}

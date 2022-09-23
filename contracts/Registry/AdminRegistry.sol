// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract AdminRegistry is AccessControlEnumerable {

    constructor(address account) {
        _setupRole(DEFAULT_ADMIN_ROLE, account);
    }

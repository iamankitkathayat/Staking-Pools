// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


abstract contract Stakable {

    mapping(uint256 => bool) public tokenStaked; 

    function stakeToken(uint256 _tokenId) public {
        tokenStaked[_tokenId] = true;
    }

    function getTokenStakedInfo(uint256 _tokenId) public view returns (bool) {
        return tokenStaked[_tokenId];
    }

   
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "../Registry/IAdminRegistry.sol";
import "../Staking/Stakable.sol";

// Premium NFTS are collections from KTDs and AZTECH.
contract PremiumNFT is Stakable, ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string public baseURI = "";
    address public adminRegistry;

    constructor(string memory _name, string memory _symbol, address _adminRegistry) 
        ERC721(_name, _symbol)
    {
        adminRegistry = _adminRegistry;
    }

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "AdminRegistry: Restricted to admin."
        );
        _;
    }

    function mint(address _owner) public onlyAdmin returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
    
        string memory tokenURI = string(
            abi.encodePacked(baseURI, Strings.toString(newItemId))
        );
        _mint(_owner, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function burn(uint256 _tokenId) public {
        _burn(_tokenId);
    }

    function setBaseURI(string memory _uri) public onlyAdmin {
        baseURI = _uri;
    }

}

import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { log } from "console";

const { expectRevert, time } = require("@openzeppelin/test-helpers");

describe("===================>Staking<==================",function () {
    let accounts: Signer[];
    let owner: Signer;
    let ownerAddress: string; 
    let user: Signer;
    let Staking: any;
    let staking: any; 
    let enoch: any;
    let Enoch: any;
    let premiumNFT: any;
    let PremiumNFT: any;
    let AdminRegistry: any;
    let adminRegistry: any;
    let StakeFactory: any;
    let stakeFactory: any;

    let StakingInstance: any;

    this.beforeAll(async function () {
        accounts = await ethers.getSigners();
    
        AdminRegistry = await ethers.getContractFactory("AdminRegistry");
        PremiumNFT = await ethers.getContractFactory('PremiumNFT');
    
      });

    this.beforeEach(async () => {
        
        owner = accounts[0];
        user = accounts[1];
        ownerAddress = await accounts[0].getAddress();

        adminRegistry = await AdminRegistry.deploy(ownerAddress);
        await adminRegistry.deployed();
    // console.log("AdminRegistry deployed at ", adminRegistry.address);

        premiumNFT = await PremiumNFT.deploy("Knight Templer Distillery", "KTD", adminRegistry.address);
        await premiumNFT.deployed();
        // console.log("PremiumNFT deployed at ", premiumNFT.address);
    });

    it('should Mint', async () => {
        
        console.log("\nHere are the steps involved in minting: \n");
        
        let tx1 = await premiumNFT.connect(owner).mint(ownerAddress);
        console.log("Minting done");
        console.log("New Token ID is: ", tx1);
        
    });

    it('should Burn', async () => {
        
        console.log("\nHere are the steps involved in minting: \n");
        
        let tx1 = await premiumNFT.connect(owner).mint(ownerAddress);
        console.log("Minting done");
        console.log("New Token ID is: ", tx1);
        
        let tx2 = await premiumNFT.connect(owner).burn(1);
        console.log("Burning done");
        console.log("Token burn: ", tx2);

    });
    
    it('should set Base URI', async () => {
        
        console.log("\nHere are the steps involved in minting: \n");
        
        let tx1 = await premiumNFT.connect(owner).mint(ownerAddress);
        console.log("Minting done");
        console.log("New Token ID is: ", tx1);
        
        let tx2 = await premiumNFT.connect(owner).setBaseURI('https://gateway.pinata.cloud/ipfs/QmS3sgWDdbKgH3g3FHM5yNGFBghLxN5eigamLLJXf4WfNT');
        console.log("Base URI set");
        console.log("Token burn: ", tx2);

    });

    });

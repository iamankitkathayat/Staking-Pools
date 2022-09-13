import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { log } from "console";

const { expectRevert, time } = require("@openzeppelin/test-helpers");

describe("===================>Staking<==================",function () {
    let accounts: Signer[];
    let owner: Signer;
    let ownerAddress: string; 
    let userAddress: string; 
    let user: Signer;
    let premiumNFT: any;
    let PremiumNFT: any;
    let AdminRegistry: any;
    let adminRegistry: any;


    let StakingInstance: any;

    this.beforeAll(async function () {
        accounts = await ethers.getSigners();
    
        AdminRegistry = await ethers.getContractFactory("AdminRegistry");
    
      });

    this.beforeEach(async () => {
        
        owner = accounts[0];
        user = accounts[1];
        ownerAddress = await accounts[0].getAddress();
        userAddress = await accounts[1].getAddress();

        adminRegistry = await AdminRegistry.deploy(ownerAddress);
        await adminRegistry.deployed();
        console.log("AdminRegistry deployed at ", adminRegistry.address);

    });

    it('should say the admin', async () => {
        
        console.log("\nHere are the steps involved: \n");
        
        let tx1 = await adminRegistry.connect(owner).isAdmin(ownerAddress);
        console.log("isAdmin done");
        console.log("Admin is: ", tx1);
        
    });
    
    it('should add admin', async () => {
        let tx1 = await adminRegistry.connect(owner).isAdmin(ownerAddress);
        console.log("isAdmin done");
        console.log("Admin is: ", tx1);

        let tx2 = await adminRegistry.connect(owner).addAdmin(userAddress);
        console.log("Admin added");
        console.log("Admin is: ", tx2);
        
    });
    it('should leave Admin Role', async () => {
        
        console.log("\nHere are the steps involved: \n");
        let tx1 = await adminRegistry.connect(owner).isAdmin(ownerAddress);
        console.log("isAdmin done");
        console.log("Admin is: ", tx1);
        
        let tx2 = await adminRegistry.connect(owner).leaveRole();
        console.log("Admin left the role");
        console.log("Admin left is: ", tx2);
        
    });
    it('should remove Admin', async () => {
        
        console.log("\nHere are the steps involved: \n");
        let tx1 = await adminRegistry.connect(owner).isAdmin(ownerAddress);
        console.log("isAdmin done");
        console.log("Admin is: ", tx1);
        
        let tx2 = await adminRegistry.connect(owner).removeAdmin(ownerAddress);
        console.log("Admin removed from role");
        console.log("Admin removed is: ", tx2);
        
    });
    it('should get Role members', async () => {
        let tx1 = await adminRegistry.connect(owner).isAdmin(ownerAddress);
        console.log("isAdmin done");
        console.log("Admin is: ", tx1);

        let tx2 = await adminRegistry.connect(owner).addAdmin(userAddress);
        console.log("Admin added");
        console.log("Admin is: ", tx2);

        let tx3 = await adminRegistry.connect(owner).getRoleMembers();
        console.log("Total members and their addresses are: ", tx3.toString());
        
        
    });


});

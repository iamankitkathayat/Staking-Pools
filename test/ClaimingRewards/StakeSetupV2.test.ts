import { ethers } from "hardhat";

describe("===================>Staking<==================",function () {
    let StakingInstance: any;

    it('should Stake', async () => {
        const [owner] = await ethers.getSigners();
        let ownerAddress = await owner.getAddress();
        console.log('owner Address: ', ownerAddress);


        const AdminRegistry = await ethers.getContractFactory("AdminRegistry");
        const adminRegistry = await AdminRegistry.deploy(owner.address);
        await adminRegistry.deployed();
        console.log("AdminRegistry deployed at ", adminRegistry.address);

        const StakingV2 = await ethers.getContractFactory("StakingV2");

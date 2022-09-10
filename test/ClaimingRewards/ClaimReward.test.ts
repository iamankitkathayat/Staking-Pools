import { ethers } from "hardhat";
import stakingABI  from "../../artifacts/contracts/Staking/Staking.sol/Staking.json";

describe("Staking contract", function () {

    it('should CLAIM REWARD', async () => {
        const [owner] = await ethers.getSigners();
        let ownerAddress = owner.getAddress();
        console.log('Owner Address: ', ownerAddress);


        let stakingProxyAddress = '0xC5999Ef9Fe837eDB1fE6611983fb1Bf8ceB477d4';
        let stakingInstance = new ethers.Contract(stakingProxyAddress, stakingABI.abi, owner);

        let PremiumNFTAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';
        console.log("Staked NFT is deployed at: ", PremiumNFTAddress);


        console.log("\n=> Let's make the rewards claimable\n");

        console.log("~ CLAIMING INSTALLMENTS");

        console.log("\nNOTE: This test might fail because the rewards claiming time has been set to 'One Month' in the 'Staking.sol' contract under 'claimReward' function. Please make it 30 secs. Comment the One Month's (line 205) and uncomment the 30 secs (line 200);  \n");

        let tx = await stakingInstance.connect(owner).claimReward(ownerAddress, 1);
        const Tx = await tx.wait();

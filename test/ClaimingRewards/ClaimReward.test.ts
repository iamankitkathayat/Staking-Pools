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

        console.log("=> Getting Stake Info: ");
        let tx8 = await stakingInstance.getStakedInfo(ownerAddress, 1);
        console.log(
        " 1. Staking Timestamp",tx8[0].toString(), "\n",
        "2. NFT Value",tx8[1].toString(), "\n",
        "3. Total Claimable Rewards",tx8[2].toString(), "\n",
        "4. Claimed Rewards",tx8[3].toString(), "\n",
        "5. Reward Installment",tx8[4].toString(), "\n",
        "6. Last Withdrawal Time",tx8[5].toString(), "\n"
        );




  });

import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

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
        Staking = await ethers.getContractFactory("Staking");
        StakeFactory = await ethers.getContractFactory("StakeFactory");
        Enoch = await ethers.getContractFactory('Enoch');
        PremiumNFT = await ethers.getContractFactory('PremiumNFT');
    
      });

    this.beforeEach(async () => {
        
        owner = accounts[0];
        user = accounts[1];
        ownerAddress = await accounts[0].getAddress();
        // userAddress = await accounts[1].getAddress();
        
        adminRegistry = await AdminRegistry.deploy(ownerAddress);
        await adminRegistry.deployed();
    // console.log("AdminRegistry deployed at ", adminRegistry.address);

        staking = await Staking.deploy();
        await staking.deployed();
    // console.log("Staking deployed at ", staking.address);

        stakeFactory = await StakeFactory.deploy();    
        await stakeFactory.deployed();
    // console.log("Factory deployed at ", stakeFactory.address);
    
    enoch = await Enoch.deploy(adminRegistry.address);
    await enoch.deployed();
    // console.log("Enoch deployed at ", enoch.address);
    
    premiumNFT = await PremiumNFT.deploy("Knight Templer Distillery", "KTD", adminRegistry.address);
    await premiumNFT.deployed();
    // console.log("PremiumNFT deployed at ", premiumNFT.address);
    
    await stakeFactory.initialize(staking.address, adminRegistry.address);
    
});


    it('INITIALIZING STAKING CONTRACT', async () => {
        console.log("\n=> Setting Up Staking Contract from stakeFactory");
        let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
        const receipt = await tx.wait();
        let event = receipt.events?.find((event:any) => event.event === "StakeCreated");
        console.log("Staking Contract Created, here are the addresses: ");
    
        console.log("Proxy Contract address: ", event?.args._stake.toString());
        console.log("Staking Token address: ", event?.args._stakingToken.toString());
        console.log("Reward Token address: ", event?.args._rewardToken.toString());

        StakingInstance = await Staking.attach(event?.args?._stake);
        console.log("Staking Instance created\n");
        
    });

    it('should STAKE', async () => {
        console.log("\n=> Setting Up Staking Contract from stakeFactory");
        let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);

        const receipt = await tx.wait();
        let event = receipt.events?.find((event:any) => event.event === "StakeCreated");
        console.log("\n Proxy contract: ", event?.args._stake);


        StakingInstance = await Staking.attach(event?.args?._stake);
        console.log("\n=> Creating Staking contract's Instance");
        let stakingAddress: any = event?.args?._stake;

        console.log("\nHere are the steps involved in staking: \n");

        let tx1 = await premiumNFT.connect(owner).mint(ownerAddress);
        console.log("Minting done");

        let tx2 = await premiumNFT.connect(owner).approve(stakingAddress, 1);
        console.log("Approve done");

        let tx3 = await StakingInstance.connect(owner).setRewardConstant(11663);
        console.log("Reward Constant set");
        
        let tx4 = await StakingInstance.connect(owner).stake(ownerAddress, 1, 100);
        console.log("Staked!");

        const receipt2 = await tx4.wait();
        const event2 = receipt2.events?.find((event:any) => event.event === "NFTStaked");
        console.log("\nHere are the events emitted out of 'NFTStaked' :\n");
        
        console.log("User staking the NFT is: ", event2?.args.user);
        console.log("Token ID is: ", event2?.args.tokenId.toString());
        console.log("NFT Value: ", event2?.args.nftValue.toString());
        console.log("Timestamp is: ", event2?.args.timestamp.toString());

    });


    it('should CLAIM REWARD', async () => {
        let ownerBal = await enoch.balanceOf(ownerAddress);
    console.log("\n=> Owner's Balance (Enoch Tokens): ", ownerBal.toString());
    
    console.log("\n=> Setting Up Staking Contract from stakeFactory");
    let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
    const receipt = await tx.wait();
    let event = receipt.events?.find((event:any) => event.event === "StakeCreated");
    console.log("Staking Contract Created, here are the addresses: ");
    
    console.log("Stake Contract address: ", event?.args._stake.toString());
    console.log("Staking Token address: ", event?.args._stakingToken.toString());
    console.log("Reward Token address: ", event?.args._rewardToken.toString());
    
    StakingInstance = await Staking.attach(event?.args?._stake);
    console.log("\n=> Creating Staking contract's Instance");
    let stakingAddress: any = event?.args?._stake;
    
    console.log("=> Adding this Staking Instance as the Admin in Registry");
    let txn = await adminRegistry.connect(owner).addAdmin(stakingAddress);
    
    console.log("=> Setting up the reward Constant");
    
    let tx2 = await StakingInstance.connect(owner).setRewardConstant(11000);
    
    let rewardConstant = await StakingInstance.REWARD_CONSTANT();
    console.log("Reward Constant: ", rewardConstant.toString());
    
    console.log("\n => Minting NFT and Approving Stake for staking:");
    let tx3 = await premiumNFT.connect(owner).mint(ownerAddress);
    console.log("Minted");
    let tx4 = await premiumNFT.connect(owner).approve(stakingAddress, 1);
    console.log("Approved");
    
    console.log("=> LET'S STAKE NOW");
    let tx5 = await StakingInstance.stake(ownerAddress, 1, 100);
    const receipt2 = await tx5.wait();
    const event2 = receipt2.events?.find((event:any) => event.event === "NFTStaked");
    console.log("Staker: ", event2?.args.user.toString());
    console.log("Token ID: ", event2?.args.tokenId.toString());
    console.log("NFT Value: ", event2?.args.nftValue.toString());
    console.log("Timestamp: ", event2?.args.timestamp.toString());
    
    let ownerBal1 = await enoch.balanceOf(ownerAddress);
    console.log("\n=> Owner's Balance (Enoch Tokens):", ownerBal1.toString());
    
    console.log("\n=> GETTING STAKE INFO:");
    let tx7 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      "Staking Timestamp",tx7[0].toString(), "\n",
      "NFT Value in 10**4",tx7[1].toString(), "\n",
      "Total Claimable Rewards",tx7[2].toString(), "\n",
      "Claimed Rewards",tx7[3].toString(), "\n",
      "Reward Installment",tx7[4].toString(), "\n",
      "Last Withdrawal Time",tx7[5].toString(), "\n"
    );
    
    
    // owner of staked NFT
    let txn1 = await premiumNFT.ownerOf(1);
    console.log("NFT Owner: ", txn1);
    
    await new Promise((res) => setTimeout(() => res(null), 3000));
    
    console.log("\n=> Let's make the rewards claimable\n");
    
    console.log("~ CLAIMING FIRST INSTALLMENT");

    console.log("\nNOTE: This test might fail because the rewards claiming time has been set to 'One Month' in the Staking contract under claimReward function. Please make it 7 secs. Comment the One Month's (line 205) and uncomment the 7 secs (line 200);  \n");
    
    let firstTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);
    
    console.log("=> Getting Stake Info: ");
    let tx8 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      " 1. Staking Timestamp",tx8[0].toString(), "\n",
      "2. NFT Value in 10**4",tx8[1].toString(), "\n",
      "3. Total Claimable Rewards",tx8[2].toString(), "\n",
      "4. Claimed Rewards",tx8[3].toString(), "\n",
      "5. Reward Installment",tx8[4].toString(), "\n",
      "6. Last Withdrawal Time",tx8[5].toString(), "\n"
    );

    // --------------------------------------

    await new Promise((res) => setTimeout(() => res(null), 3000));

    console.log("CLAIMING SECOND INSTALLMENT");
    
    let secondTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);

    console.log("=> Getting Stake Info: ");
    let tx9 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      " 1. Staking Timestamp",tx9[0].toString(), "\n",
      "2. NFT Value in 10**4",tx9[1].toString(), "\n",
      "3. Total Claimable Rewards",tx9[2].toString(), "\n",
      "4. Claimed Rewards",tx9[3].toString(), "\n",
      "5. Reward Installment",tx9[4].toString(), "\n",
      "6. Last Withdrawal Time",tx9[5].toString(), "\n"
    );
    
    // --------------------------------------
    
    await new Promise((res) => setTimeout(() => res(null), 3000));
    
    
    console.log("CLAIMING THIRD INSTALLMENT");
    
    let thirdTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);
    
    console.log("=> Getting Stake Info: ");
    let tx10 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      " 1. Staking Timestamp",tx10[0].toString(), "\n",
      "2. NFT Value in 10**4",tx10[1].toString(), "\n",
      "3. Total Claimable Rewards",tx10[2].toString(), "\n",
      "4. Claimed Rewards",tx10[3].toString(), "\n",
      "5. Reward Installment",tx10[4].toString(), "\n",
      "6. Last Withdrawal Time",tx10[5].toString(), "\n"
    );
        const receipt3 = await thirdTx.wait();
        const event3 = receipt3.events?.find((event:any) => event.event === "RewardsClaimed");
        console.log("\nHere are the events emitted out of 'RewardsClaimed' :\n");
    
        console.log("User staking the NFT is: ", event3?.args._user.toString());
        console.log("Staked Token ID is: ", event3?.args._stakedTokenId.toString());
        console.log("Rewarded amount is: ", event3?.args._rewardAmount.toString());
        console.log("Timestamp is: ", event3?.args._timestamp.toString());

    // --------------------------------------

    // owner of staked NFT
    let txn2 = await premiumNFT.ownerOf(1);
    console.log("\n NFT owner", txn2);

    await new Promise((res) => setTimeout(() => res(null), 3000));

    console.log("\nCLAIMING FOURTH INSTALLMENT");
    
    console.log('Expecting Fourth Installment to equal an error saying "You have already claimed all of your rewards!"');
    let fourthTx = await expect(StakingInstance.connect(owner).claimReward(ownerAddress, 1)).to.be.rejectedWith("You have claimed your rewards!");
        console.log("You have already claimed all of your rewards!\n");

    });


    it('should CALCULATE REWARD', async () => {
        console.log("\n=> Setting Up Staking Contract from stakeFactory");
        let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
        const receipt1 = await tx.wait();
        let event = receipt1.events?.find((event:any) => event.event === "StakeCreated");

        StakingInstance = await Staking.attach(event?.args?._stake);
        let stakingAddress: any = event?.args?._stake;

        console.log("\nHere are the steps involved in calculating the Rewards: \n");
        let tx1 = await StakingInstance.connect(owner).setRewardConstant(11663);
        console.log("Reward Constant set");

        let tx2 = await StakingInstance.connect(owner)._calculateRewards(100);
        console.log("Rewards Calculated");
        
    });
    

    it('should SET REWARD CONSTANT', async () => {
        console.log("\n=> Setting Up Staking Contract from stakeFactory");
        let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
        const receipt1 = await tx.wait();
        let event = receipt1.events?.find((event:any) => event.event === "StakeCreated");

        StakingInstance = await Staking.attach(event?.args?._stake);
        let stakingAddress: any = event?.args?._stake;

        console.log("\nSetting Up Reward Constant");
            
        let tx1 = await StakingInstance.connect(owner).setRewardConstant(11663);
        console.log("=> Reward Constant set\n");

});


    it('should GET STAKED INFO', async () => {
        console.log("\n=> Setting Up Staking Contract from stakeFactory");
        let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
        const receipt = await tx.wait();
        let event = receipt.events?.find((event:any) => event.event === "StakeCreated");

        StakingInstance = await Staking.attach(event?.args?._stake);
        let stakingAddress: any = event?.args?._stake;
        
        console.log("\nHere are the steps involved in Staking: \n");
        let tx1 = await premiumNFT.connect(owner).mint(ownerAddress);
        console.log("Minted");
        
        let tx2 = await premiumNFT.connect(owner).approve(stakingAddress, 1);
        console.log("Approved");
        let tx3 = await StakingInstance.connect(owner).setRewardConstant(11663);
        console.log("Reward Constant Set");
        
        let tx4 = await StakingInstance.connect(owner).stake(ownerAddress, 1, 100);
        console.log("Staked!");

        console.log("\nUser Stake Info:");
        let tx5 = await StakingInstance.connect(owner).getStakedInfo(ownerAddress, 1);
        console.log(
            " 1.Staking timestamp is:",tx5[0].toString(), "\n",
            "2. NFT Value is:",tx5[1].toString(), "\n",
            "3. Total Claimable rewards is:",tx5[2].toString(), "\n",
            "4. ClaimedRewards is:",tx5[3].toString(), "\n",
            "5. Reward Installment is:",tx5[4].toString(), "\n",
            "6. Last withdrawal time is:",tx5[5].toString(), "\n"
            );
    });


    it('should GET PENDING REWARDS INFO', async () => {
        console.log("\n=> Setting Up Staking Contract from stakeFactory");
        let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
        const receipt = await tx.wait();
        let event = receipt.events?.find((event:any) => event.event === "StakeCreated");
        console.log("Stake created");
    
        StakingInstance = await Staking.attach(event?.args?._stake);
        console.log("Staking Instance created");
        let stakingAddress: any = event?.args?._stake;
        
        console.log("\n=> Getting Pending Rewards Info:");
        
        let tx1 = await StakingInstance.connect(owner).getPendingRewardsInfo(ownerAddress, 1);
        console.log("Pending rewards are: ",tx1.toString());
        
        expect(tx1).to.equal(0);
    });
    
});

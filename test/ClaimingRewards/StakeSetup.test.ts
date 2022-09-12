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

        const Staking = await ethers.getContractFactory("Staking");
        const staking = await Staking.deploy();
        await staking.deployed();
        console.log("Staking deployed at ", staking.address);

        const StakeFactory = await ethers.getContractFactory('StakeFactory');
        const stakeFactory = await StakeFactory.deploy();
        await stakeFactory.deployed();
        console.log("Stake Factory deployed at ", stakeFactory.address);

        const Enoch = await ethers.getContractFactory('Enoch');
        const enoch = await Enoch.deploy(adminRegistry.address);
        await enoch.deployed();
        console.log("Enoch deployed at ", enoch.address);

        const PremiumNFT = await ethers.getContractFactory('PremiumNFT');
        const premiumNFT = await PremiumNFT.deploy("Knight Templer Distillery", "KTD", adminRegistry.address);
        await premiumNFT.deployed();
        console.log("PremiumNFT deplyed at ", premiumNFT.address);

        await stakeFactory.initialize(staking.address, adminRegistry.address);
        console.log("Initialized");

        // console.log("Deploying Staking from Factory!");

        let apy = 90;
        let staking_months = 3;

        let tx = await stakeFactory.setupStakeContract(premiumNFT.address, enoch.address, apy, staking_months, adminRegistry.address)
        console.log("New Stake Instance ", tx);
        const receipt = await tx.wait();
        
        let event = receipt.events?.find((event:any) => event.event === "StakeCreated");
        console.log("\n Proxy contract: ", event?.args._stake);


        StakingInstance = await Staking.attach(event?.args?._stake);
        console.log("\n=> Creating Staking contract's Instance");
        let stakingAddress: any = event?.args?._stake;

        console.log("=> Adding this Staking Instance as the Admin in Registry");
        let txn = await adminRegistry.connect(owner).addAdmin(stakingAddress);
        const receiptTxn = await txn.wait();

        console.log("=> Setting up the reward Constant");

        let reward_constant = 11000;
        let tx2 = await StakingInstance.connect(owner).setRewardConstant(reward_constant);
        const receipt2 = await tx2.wait();


        let rewardConstant = await StakingInstance.REWARD_CONSTANT();
        console.log("Reward Constant: ", rewardConstant.toString());
        // do not hardcode reward constant value. use reward constant function to calculate the value.

        console.log("\n => Minting NFT and Approving Stake for staking:");
        let tx3 = await premiumNFT.connect(owner).mint(ownerAddress);
        console.log("Minted");
        const receipt3 = await tx3.wait();

        let tx4 = await premiumNFT.connect(owner).approve(stakingAddress, 1);
        console.log("Approved");
        const receipt4 = await tx4.wait();

        console.log("=> LET'S STAKE NOW");
        let tx5 = await StakingInstance.stake(ownerAddress, 1, 100);
        const receipt5 = await tx5.wait();
        const event5 = receipt5.events?.find((event:any) => event.event === "NFTStaked");
        console.log("Staker: ", event5?.args.user.toString());
        console.log("Token ID: ", event5?.args.tokenId.toString());
        console.log("NFT value: ", event5?.args.nftValue.toString());
        console.log("Timestamp: ", event5?.args.timestamp.toString());

        let ownerBal1 = await enoch.balanceOf(ownerAddress);
        console.log("\n=> owner's Balance (Enoch Tokens):", ownerBal1.toString());

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



    });

});

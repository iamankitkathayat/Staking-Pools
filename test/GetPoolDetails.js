const { expect } = require("chai");
const { ethers } = require("hardhat");

let accounts, owner, Staking, StakingInstance;
describe("====>Staking<====", () => {
    beforeEach(async () => {
        accounts = await ethers.getSigners();
        Staking = await ethers.getContractFactory("Staking");
        StakingInstance = await Staking.deploy();

        owner = accounts[0];
        user = accounts[1];
        ownerAddress = await accounts[0].getAddress();
    });


    it('should GET THE POOL STATUS', async () => {
        const PoolStatus = await StakingInstance.pauseStatus();
        expect(PoolStatus.toString()).to.equal('false');
        console.log("The Pool's Status is: ", PoolStatus);
    })

    it('should get the Staking Period', async () => {
        const staking_period = await StakingInstance.STAKING_MONTHS();
        expect(staking_period.toString()).to.equal('0');
        console.log("The staking months is ", staking_period, "months, because it is not set yet");
    })

    // it('should get the Reward Composition', async () => {
        
    // })

    // it('should get the Total Pool Size', async () => {
        
    // })

    // it('should get the volume in 24 hours', async () => {
        
    // })

    it('should get the address of stakers', async () => {
        console.log("The stakers address is: ", ownerAddress);
    })

    it('should get the APY', async () => {
        const apy = await StakingInstance.APY();
        expect(apy.toString()).to.equal('0');
        console.log("The APY of the stake is: ", apy, "%, because it is not set yet");
    })

    it('should get the Reward Constant', async () => {
            // Earned Amount = Initial Stake * [1 + r/n] ^ (n * y)
            // Since n = 1,
            // Total Earning = d * [1 + r] ^ y
            // suppose x**y; x = 1.90, y = 0.25;
            // x**y = 1.1741
            // REWARD_CONSTANT = 11741
    let x = 0.90;
    x += 1; 
    console.log("x", x);
    let y = 0.25;
    console.log("y", y);
    
    let val = (x**y).toPrecision(5);
    console.log("exponent", val);
    
    const reward_constant = val*10**4;
    console.log('Reward Constant', reward_constant);
    expect(reward_constant.toString()).to.equal('11741');
    })


})

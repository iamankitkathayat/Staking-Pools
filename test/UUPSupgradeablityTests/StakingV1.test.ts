import { expect } from "chai";
import { ethers } from "hardhat";
import { upgrades } from "hardhat";

describe("Contract Version 1 test", function () {
  it("Should return 'Staking Token' , 'Reward Token' , 'APY' , 'Staking Months' and 'Admin Registry' after deployment", async function () {
    const Staking = await ethers.getContractFactory("Staking");

    const staking = await upgrades.deployProxy(Staking, ["0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9","90","3","0x5FbDB2315678afecb367f032d93F642f64180aa3"], { initializer: 'initialize', kind: 'uups'});
    await staking.deployed();

    expect(await staking.stakingToken()).to.equal("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
    expect(await staking.rewardToken()).to.equal("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    expect(await staking.APY()).to.equal(90);
    expect(await staking.STAKING_MONTHS()).to.equal(3);
    expect(await staking.adminRegistry()).to.equal("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { upgrades } from "hardhat";
import { Signer } from "ethers";

describe("Contract Version 2 test", function () {
  let stakingV1:any;
  let stakingV2:any;  
  let accounts: Signer[];

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    let owner = accounts[0];
    let addr1 = accounts[1];

    const StakingV1 = await ethers.getContractFactory("Staking");
    const StakingV2 = await ethers.getContractFactory("Staking");

    stakingV1 = await upgrades.deployProxy(StakingV1, ["0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9","0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9","90","3","0x5FbDB2315678afecb367f032d93F642f64180aa3"], { initializer: 'initialize', kind: 'uups'});
    await stakingV1.deployed();

    stakingV2 = await upgrades.deployProxy(StakingV2, ["0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9","0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9","80","12","0xaC099D7d6057B7871D1076f2600e1163643d0822"], { initializer: 'initialize', kind: 'uups'});
    await stakingV2.deployed();
  });


  it("Old contract APY is 90", async function () {
    expect(await stakingV1.APY()).to.equal(90);
  });

  it("Old contract Staking Months is 3", async function () {
    expect(await stakingV1.STAKING_MONTHS()).to.equal(3);
  });

  it("Old contract admin registry address is equal to the deployed admin", async function () {
    expect(await stakingV1.adminRegistry()).to.equal("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  });

  
  it("New contract APY is 80", async function () {
    expect(await stakingV2.APY()).to.equal(80);
  });

  it("New contract Staking Months is 12", async function () {
    expect(await stakingV2.STAKING_MONTHS()).to.equal(12);
  });

  it("New contract admin registry address is equal to the deployed admin", async function () {
    expect(await stakingV2.adminRegistry()).to.equal("0xaC099D7d6057B7871D1076f2600e1163643d0822");
  });


})

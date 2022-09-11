NOTE: There are two test files inside ClaimingRewards folder to test 'Claim Rewards' function. a) StakeSetup.test.ts b) ClaimReward.test.ts

Development Procedure
Open two terminals terminal 1: run the following command: " npx hardhat node " This will start a local development blockchain at port 8545

terminal 2:
    after setting up terminal 1, run all the other comands in here.

    Before running scripts, re-check 'claimReward' function in 'Staking.sol' contract what the due time has been set to. It is set to 'oneMonthTimeConstant' always but for testing change the time according to the requirement for example 1 mins, 3 mins or 5 mins.

    Start with running script:

    a) npx hardhat test .\test\ClaimingRewards\StakeSetup.test.ts --network localhost
        Wait for the time after which the user can claim rewards, for example 3 mins. Then run the next script.

        Once you get the stakingProxy address from the console, use that address in the below script. Paste the address at stakingProxyAddress in the below script.

    b) npx hardhat test .\test\ClaimingRewards\ClaimReward.test.ts --network localhost
        This test throw two types of error: 
            i) If user claims before the due time.
            ii) If user is claiming more than 3 installments.

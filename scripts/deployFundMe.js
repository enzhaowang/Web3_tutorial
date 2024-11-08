

//import ethers.js
const { ethers } = require("hardhat");

//create main function 
async function main() {
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("contract deploying");
    //deploy contract from factory
    const fundMe = await fundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log(`Contract has been deployed successfully, contract address is ${fundMe.target}`);

    //verify fundMe
    // if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    //     console.log("Waiting for 5 confirmations")
    //     await fundMe.deploymentTransaction().wait(5);
    //     verifyFundMe(fundMe.target, [300])
    // } else {
    //     console.log("verification skipped...")
    // }


    //init 2 accounts
    const [firstAccount, secondAccount] = await ethers.getSigners();

    //fund contract with first account
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.5") });
    await fundTx.wait();

    //check balance of contract
    const balanceOfContract = ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of contract is ${balanceOfContract}`);

    //fund contract with second account
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.5") })
    await fundTxWithSecondAccount.wait()

    //check balance of contract
    const balanceOfContractAfterSecondFund = ethers.provider.getBalance(fundMe.target);
    console.log(`Balance of contract is ${balanceOfContractAfterSecondFund}`);

    //check mapping fundersToAmount
    const firstAccoundBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
    const secondAccoundBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);
    console.log(`First accound balance ${firstAccount.address} is: ${firstAccoundBalanceInFundMe}`)
    console.log(`Second accound balance ${secondAccount.address} is: ${secondAccoundBalanceInFundMe}`)
}


async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

//execute mainfunction
main().then().catch((err) => {
    console.error(err);
    process.exit(0);
});
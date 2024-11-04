const {task} = require("hardhat/config")

task("interact-fundme", "Interact with FundMe contract").addParam("addr", "fundme contract address").setAction(async(taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundMe = await fundMeFactory.attach(taskArgs.addr)
    
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
})

module.exports = {}
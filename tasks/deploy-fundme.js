const {task} = require("hardhat/config")

task("deploy-fundme", "Deploy and verify FundMe contract").setAction(async(taskArgs, hre) => {
        //create factory
        const fundMeFactory = await ethers.getContractFactory("FundMe");
        console.log("contract deploying");
        //deploy contract from factory
        const fundMe = await fundMeFactory.deploy(300);
        await fundMe.waitForDeployment();
        console.log(`Contract has been deployed successfully, contract address is ${fundMe.target}`);
    
        //verify fundMe
        if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
            console.log("Waiting for 5 confirmations")
            await fundMe.deploymentTransaction().wait(5);
            verifyFundMe(fundMe.target, [300])
            console.log("verification finished")
        } else {
            console.log("verification skipped...")
        }
})


async function verifyFundMe(fundMeAddr, args) {
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
    });
}

module.exports = {}
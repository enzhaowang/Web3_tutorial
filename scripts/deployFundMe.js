

//import ethers.js
const {ethers} = require("hardhat");

//create main function 
async function main() {
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("contract deploying");
    //deploy contract from factory
    const fundMe = await fundMeFactory.deploy(10);
    await fundMe.waitForDeployment();
    console.log(`Contract has been deployed successfully, contract address is ${fundMe.target}`);

}

//execute mainfunction
main().then().catch((err) => {
    console.error(err);
    process.exit(0);
});
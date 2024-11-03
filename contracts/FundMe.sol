//SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


 //1. 创建收款函数
 //2. 记录投资人并查看
 //3. 在锁定期内，达到目标值，生产商可以提款
 //4. 在锁定期内，没有达到目标值，生产商可以退款

 contract FundMe {

    uint256 constant MINIUM_VALUE = 100 * 10 ** 18; //USD

    mapping(address => uint256) public fundersToAmount;

    AggregatorV3Interface internal dataFeed;

    uint256 constant TARGET = 1000 * 10 ** 18;

    address public owner;

    uint256 deploymentTimestamp;

    uint256 lockTime;

    address erc20Addr;

    bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        //sepolia testnet
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(block.timestamp < deploymentTimestamp + lockTime, "window is closed");
        require(convertETHToUSD(msg.value) >= MINIUM_VALUE, "Send more ETH");
        fundersToAmount[msg.sender] = msg.value;
    }

     /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertETHToUSD(uint256 ethAmount) internal view returns(uint256) {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ethAmount * ethPrice / (10 ** 8);
    }

    function withdrawFund() external windowClosed onlyOwner{
        require(convertETHToUSD(address(this).balance) >= TARGET, "Target is not reached");
        //transfer: tansfer ETH and revert if tx failed
        //payable(msg.sender).transfer(address(this).balance);
        
        //send
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "tx failed")
        
        //call: transfer ETH with data and return value of function and bool status
        bool success;
        (success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "tx failed");
        getFundSuccess = true; 

    }

    function refund() external windowClosed {
        require(convertETHToUSD(address(this).balance) < TARGET, "Target is reached");
        require(fundersToAmount[msg.sender] > 0, "there are no funds for you");
        bool success;
        (success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
        require(success, "transfer tx failed");
        fundersToAmount[msg.sender] = 0;
    }

    function transferOwnership(address newOwner) public onlyOwner{
        owner = newOwner;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate) external {
        require(msg.sender == erc20Addr);
        fundersToAmount[funder] = amountToUpdate;
    }

    function setERC20Addr(address _erc20Addr) public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    modifier windowClosed() {
        require(block.timestamp <= deploymentTimestamp + lockTime, "Window is not closed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "This function can only be called by owner");
        _;
    }
 } 
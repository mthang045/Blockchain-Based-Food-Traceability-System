// Deploy FoodTraceability contract
const FoodTraceability = artifacts.require("FoodTraceability");

module.exports = async function (deployer, network, accounts) {
  console.log("Deploying FoodTraceability contract...");
  console.log("Network:", network);
  console.log("Deployer account:", accounts[0]);

  // Deploy the contract
  await deployer.deploy(FoodTraceability);
  
  const instance = await FoodTraceability.deployed();
  console.log("FoodTraceability deployed at:", instance.address);
  
  // Save the contract address to a file for backend use
  const fs = require('fs');
  const contractAddress = {
    network: network,
    address: instance.address,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    './contract-address.json',
    JSON.stringify(contractAddress, null, 2)
  );
  
  console.log("Contract address saved to contract-address.json");
};

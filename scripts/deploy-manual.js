const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  const artifactPath = path.resolve(__dirname, 'CharacterRegistryArtifact.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found. Please run compile-manual.js first.');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error('PRIVATE_KEY not found in .env');
    process.exit(1);
  }

  // Network Configuration
  const network = process.env.NETWORK || 'sepolia';
  const rpcUrl = network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
  
  console.log(`Connecting to network: ${network} (${rpcUrl})`);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deploying from account: ${wallet.address}`);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  // Estimate Gas
  const deployTx = await factory.getDeployTransaction();
  const estimatedGas = await provider.estimateGas(deployTx);
  const feeData = await provider.getFeeData();
  const estimatedCost = estimatedGas * (feeData.gasPrice || 0n);

  console.log(`Estimated deployment cost: ${ethers.formatEther(estimatedCost)} ETH`);

  if (balance < estimatedCost) {
    console.error("Insufficient funds for deployment");
    process.exit(1);
  }
  
  // Deploy the contract
  const contract = await factory.deploy();
  
  console.log('Deploying contract... Waiting for transaction confirmation...');
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log(`CharacterRegistry deployed to: ${contractAddress}`);

  // Update contracts.ts with new address
  const configPath = path.resolve(__dirname, '../src/config/contracts.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace address
  configContent = configContent.replace(
    /export const CHARACTER_REGISTRY_ADDRESS = ".*";/,
    `export const CHARACTER_REGISTRY_ADDRESS = "${contractAddress}";`
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log(`Updated src/config/contracts.ts with new address.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

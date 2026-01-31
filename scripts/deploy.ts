import { ethers } from "hardhat";

async function main() {
  const CharacterRegistry = await ethers.getContractFactory("CharacterRegistry");
  const registry = await CharacterRegistry.deploy();

  await registry.waitForDeployment();

  console.log(`CharacterRegistry deployed to ${await registry.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
  console.log("Starting deployment to Base Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer found. Check your PRIVATE_KEY in .env.local");
  }

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${(await hre.ethers.provider.getBalance(deployer.address)).toString()}`);

  // 1. Deploy MockUSDC
  console.log("\nDeploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log(`✅ MockUSDC deployed to: ${usdcAddress}`);

  // 2. Deploy BE4T_Vault
  console.log("\nDeploying BE4T_Vault...");
  const BE4TVault = await hre.ethers.getContractFactory("BE4T_Vault");
  const vault = await BE4TVault.deploy(usdcAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ BE4T_Vault deployed to: ${vaultAddress}`);

  // Wait a few blocks before verification
  console.log("\nWaiting for 5 block confirmations before verification...");
  // Sleep implementation for hardhat execution
  await new Promise((r) => setTimeout(r, 10000));

  try {
    console.log(`\nVerifying MockUSDC...`);
    await hre.run("verify:verify", {
      address: usdcAddress,
      constructorArguments: [],
    });
  } catch (err) {
    console.log("Verification for MockUSDC failed:", err.message);
  }

  try {
    console.log(`\nVerifying BE4T_Vault...`);
    await hre.run("verify:verify", {
      address: vaultAddress,
      constructorArguments: [usdcAddress],
    });
  } catch (err) {
    console.log("Verification for BE4T_Vault failed:", err.message);
  }

  console.log("\n Deployment and Verification Finished!");
  console.log("---------------------------------------");
  console.log(`MockUSDC:   ${usdcAddress}`);
  console.log(`BE4T_Vault: ${vaultAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployContract(contractName, artifactPath, wallet) {
    try {
        console.log(`\n🚀 Deploying ${contractName}...`);

        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

        const factory = new ethers.ContractFactory(
            artifact.abi,
            artifact.bytecode,
            wallet
        );

        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const address = await contract.getAddress();

        console.log(`✅ ${contractName} deployed at: ${address}`);

        return address;
    } catch (error) {
        console.error(`❌ Failed to deploy ${contractName}`);
        throw error;
    }
}

async function main() {
    try {
        const rpcUrl = process.env.RPC_URL;
        const mnemonic = process.env.MNEMONIC;

        if (!rpcUrl) throw new Error("RPC_URL missing in .env");
        if (!mnemonic) throw new Error("MNEMONIC missing in .env");

        console.log("🔗 Connecting to network...");
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).connect(provider);

        console.log(`👛 Deploying with wallet: ${wallet.address}`);

        // Artifact paths
        const electionFactoryArtifact = path.join(
            __dirname,
            "../artifacts/contracts/Election.sol/ElectionFactory.json"
        );

        const votingArtifact = path.join(
            __dirname,
            "../artifacts/contracts/Voting.sol/Voting.json"
        );

        // Deploy contracts
        const electionFactoryAddress = await deployContract(
            "ElectionFactory",
            electionFactoryArtifact,
            wallet
        );

        const votingAddress = await deployContract(
            "Voting",
            votingArtifact,
            wallet
        );

        // Save deployment details
        const deploymentData = {
            network: rpcUrl,
            deployedAt: new Date().toISOString(),
            deployer: wallet.address,
            contracts: {
                ElectionFactory: electionFactoryAddress,
                Voting: votingAddress,
            },
        };

        const outputPath = path.join(
            __dirname,
            "../deployment.json"
        );

        fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));

        console.log("\n🎉 Deployment Successful!");
        console.log("📄 Contract addresses saved to .env");
    } catch (error) {
        console.error("\n🔥 Deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

main();
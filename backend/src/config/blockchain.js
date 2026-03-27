import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    BLOCKCHAIN_RPC_URL,
    BLOCKCHAIN_MNEMONIC,
    BLOCKCHAIN_ELECTION_FACTORY_ADDRESS,
    BLOCKCHAIN_VOTING_ADDRESS
} from "./env.js";

export { BLOCKCHAIN_MNEMONIC };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load ABI from backend's src/abis directory
const loadABI = (filename) => {
    const abiPath = path.join(__dirname, "../abis", filename);
    return JSON.parse(fs.readFileSync(abiPath, "utf8"));
};

const electionFactoryABI = loadABI("ElectionABI.json");
const votingABI = loadABI("VotingABI.json");

// Provider (Ganache)
export const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);

// Admin wallet (used to send transactions) derived from mnemonic
export const wallet = ethers.HDNodeWallet.fromPhrase(BLOCKCHAIN_MNEMONIC).connect(provider);

// Election Contract Instance
export const electionFactoryContract = new ethers.Contract(
    BLOCKCHAIN_ELECTION_FACTORY_ADDRESS,
    electionFactoryABI,
    wallet
);

// Voting Hash Contract Instance
export const votingContract = new ethers.Contract(
    BLOCKCHAIN_VOTING_ADDRESS,
    votingABI,
    wallet
);

export default {
    provider,
    wallet,
    electionFactoryContract,
    votingContract
};
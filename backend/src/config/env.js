import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = '30d';
export const MAGIC_LINK_TOKEN_EXPIRE = 30 * 60 * 1000; // 30 minutes
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_PORT;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const MAIL_FROM = process.env.MAIL_FROM || process.env.MAIL_USER;
export const APP_URL = process.env.APP_URL || 'http://localhost:5174';
export const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
export const BLOCKCHAIN_MNEMONIC = process.env.BLOCKCHAIN_MNEMONIC;
export const BLOCKCHAIN_ELECTION_FACTORY_ADDRESS = process.env.BLOCKCHAIN_ELECTION_FACTORY_ADDRESS;
export const BLOCKCHAIN_VOTING_ADDRESS = process.env.BLOCKCHAIN_VOTING_ADDRESS;

export default {
    PORT,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRE,
    MAGIC_LINK_TOKEN_EXPIRE,
    NODE_ENV,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USER,
    MAIL_PASS,
    MAIL_FROM,
    APP_URL,
    BLOCKCHAIN_RPC_URL,
    BLOCKCHAIN_MNEMONIC,
    BLOCKCHAIN_ELECTION_FACTORY_ADDRESS,
    BLOCKCHAIN_VOTING_ADDRESS
};

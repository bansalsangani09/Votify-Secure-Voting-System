import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

// Import models (Direct paths)
import Vote from '../src/modules/vote/vote.model.js';
import Election from '../src/modules/election/election.model.js';
import AuditLog from '../src/modules/audit/audit.model.js';

async function wipeData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        console.log('Wiping Votes...');
        const voteResult = await Vote.deleteMany({});
        console.log(`Deleted ${voteResult.deletedCount} votes.`);

        console.log('Wiping Audit Logs...');
        const auditResult = await AuditLog.deleteMany({});
        console.log(`Deleted ${auditResult.deletedCount} audit logs.`);

        console.log('Resetting Election Counts...');
        const elections = await Election.find({});
        for (const election of elections) {
            console.log(`Resetting counts for: ${election.title}`);
            election.candidates.forEach(c => {
                c.voteCount = 0;
            });
            await election.save();
        }
        console.log('Election counts reset.');

        console.log('SUCCESS: System data wiped successfully.');
        process.exit(0);
    } catch (error) {
        console.error('ERROR during wipe:', error);
        process.exit(1);
    }
}

wipeData();

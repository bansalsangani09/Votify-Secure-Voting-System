import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './modules/auth/auth.model.js';
import { MONGO_URI } from './config/env.js';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@voting.com';
        const adminPassword = 'StrongPassword123';
        const adminName = 'System Admin';

        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        await User.create({
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: 'system_admin'
        });

        console.log('Admin user created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedAdmin();

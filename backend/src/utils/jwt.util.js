import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRE } from '../config/env.js';

export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

export default {
    generateAccessToken,
    verifyAccessToken
};

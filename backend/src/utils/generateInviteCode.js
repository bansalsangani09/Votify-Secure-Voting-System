import crypto from 'crypto';

/**
 * Generates a unique invite code for elections.
 * Format: ELC-XXXXXX (where X is an uppercase alphanumeric character)
 * @returns {string} The generated invite code.
 */
export const generateInviteCode = () => {
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ELC-${randomStr}`;
};

export default generateInviteCode;

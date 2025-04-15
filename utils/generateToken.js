// utils.js
import crypto from 'crypto';

export const generateToken = () => {
  // Generates a 64-character hex string token.
  return crypto.randomBytes(32).toString('hex');
};

import jwt from 'jsonwebtoken';

export const generateToken = (email) => {
  const payload = { email };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: '1h' }; // 1 hour

  return jwt.sign(payload, secret, options);
};

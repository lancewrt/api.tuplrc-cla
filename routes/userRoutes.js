import express from 'express';
import { changePassword, checkEmail, checkIsEmailVerified, checkSession, checkUsername, login, logout, profile, searchEmail, updateAccount, verifyEmail, verifyPassword, verifyToken } from '../controller/userController.js';

const router = express.Router();

router.post('/login',login);
router.post('/logout',logout);
router.get('/check-session', checkSession);
router.get('/search-email', searchEmail);
router.post('/verify-email', verifyEmail)
router.get('/verify-token', verifyToken)
router.get('/check-verified', checkIsEmailVerified);
router.get('/verify-password', verifyPassword);
router.put('/change-password/:userId', changePassword)
router.put('/update/:id', updateAccount)
router.get('/profile/:id', profile)
router.get('/check-username/:username', checkUsername)
router.get('/check-email', checkEmail)

export default router;
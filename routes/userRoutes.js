import express from 'express';
import { checkSession, checkUsername, login, logout, profile, updateAccount } from '../controller/userController.js';

const router = express.Router();

router.post('/login',login);
router.post('/logout',logout);
router.get('/check-session', checkSession);
router.put('/update/:id', updateAccount)
router.get('/profile/:id', profile)
router.get('/check-username/:username', checkUsername)

export default router;
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from "../config/db.js";
import { logAuditAction } from "./auditController.js";

dotenv.config();

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const query = `
        SELECT staff_id, staff_uname, staff_password, role_name
        FROM staffaccount
        JOIN roles ON staffaccount.role_id = roles.role_id
        WHERE staff_uname = ? AND staff_status = 'active'`;

    try {
        db.query(query, [username], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Database query failed' });

            if (results.length === 0) {
                return res.status(404).json({ message: 'Invalid username or password' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.staff_password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const payload = {
                id: user.staff_id,
                username: user.staff_uname,
                role: user.role_name
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

            res.cookie('authToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000,
            });

            logAuditAction(username, 'SELECT', 'staffaccount', null, null, JSON.stringify("Logged In"));

            return res.status(200).json({
                message: 'Login successful',
                user: { id: user.staff_id, username: user.staff_uname, role: user.role_name }
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = (req, res) => {
    const username = req.body.username;
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    logAuditAction(username, 'SELECT', 'staffaccount', null, null, JSON.stringify("Logged Out"));

    return res.status(200).json({ message: 'Logged out successfully' });
};

export const checkSession = (req, res) => {
    const token = req.cookies.authToken;

    if (!token) return res.status(401).json({ loggedIn: false });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || decoded.exp < Math.floor(Date.now() / 1000)) {
            return res.status(401).json({ loggedIn: false });
        }

        return res.status(200).json({
            loggedIn: true,
            userID: decoded.id,
            userRole: decoded.role,
            username: decoded.username
        });
    });
};

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'stocksense_super_secret_jwt_key_2026_gcet_odoo';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'Inventory Manager') RETURNING id, name, email, role`,
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ message: 'User registered successfully', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await query(`SELECT id, name, email, role, created_at FROM users WHERE id = $1`, [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Request Password Reset (OTP mechanism)
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await query(`UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3`, [otp, expires, userRes.rows[0].id]);

    console.log(`[DEV OTP] Password reset OTP for ${email}: ${otp}`);

    res.json({
      message: 'Password reset OTP generated. In development mode, check console/response.',
      devOtp: otp // Documented development OTP for easy test flow
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];
    if (user.reset_otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.reset_otp_expires)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE id = $2`, [password_hash, user.id]);

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

module.exports = router;

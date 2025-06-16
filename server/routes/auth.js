import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email, role], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // ✅ Set token in httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Set false if testing locally without HTTPS
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Log the login
      db.run(`
        INSERT INTO system_logs (user_id, action, details)
        VALUES (?, ?, ?)`,
        [user.id, 'login', `User logged in as ${role}`]
      );

      res.json({ message: 'Login successful' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔓 Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  res.json({ message: 'Logged out successfully' });
});

// 🔐 Get current user from token
router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) return res.status(401).json({ error: 'Unauthorized' });

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        specialization: user.specialization,
        licenseNumber: user.license_number
      });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRoutes };

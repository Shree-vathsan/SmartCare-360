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
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Log the login
      db.run(`
        INSERT INTO system_logs (user_id, action, details)
        VALUES (?, ?, ?)
      `, [user.id, 'login', `User logged in as ${role}`]);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          specialization: user.specialization,
          licenseNumber: user.license_number
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register (for demo purposes)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, specialization, licenseNumber } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      db.run(`
        INSERT INTO users (email, password, role, first_name, last_name, phone, specialization, license_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [email, hashedPassword, role, firstName, lastName, phone, specialization, licenseNumber], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };
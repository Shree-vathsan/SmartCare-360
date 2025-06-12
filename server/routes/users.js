import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRole('admin'), (req, res) => {
  try {
    db.all(`
      SELECT id, email, role, first_name, last_name, phone, specialization, license_number, created_at
      FROM users ORDER BY created_at DESC
    `, (err, users) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(users);
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctors
router.get('/doctors', authenticateToken, (req, res) => {
  try {
    db.all(`
      SELECT id, first_name, last_name, specialization, license_number
      FROM users WHERE role = 'doctor'
      ORDER BY first_name, last_name
    `, (err, doctors) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(doctors);
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patients assigned to doctor
router.get('/patients', authenticateToken, authorizeRole('doctor'), (req, res) => {
  try {
    db.all(`
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.phone
      FROM users u
      JOIN appointments a ON u.id = a.patient_id
      WHERE a.doctor_id = ? AND u.role = 'patient'
      ORDER BY u.first_name, u.last_name
    `, [req.user.id], (err, patients) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(patients);
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log the action
      db.run(`
        INSERT INTO system_logs (user_id, action, details)
        VALUES (?, ?, ?)
      `, [req.user.id, 'delete_user', `Deleted user with ID: ${id}`]);

      res.json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as userRoutes };
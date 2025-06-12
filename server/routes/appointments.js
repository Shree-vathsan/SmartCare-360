import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get appointments
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT a.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             d.first_name as doctor_first_name, d.last_name as doctor_last_name,
             d.specialization
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
    `;
    
    let params = [];

    if (req.user.role === 'doctor') {
      query += ' WHERE a.doctor_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' WHERE a.patient_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    db.all(query, params, (err, appointments) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(appointments);
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create appointment
router.post('/', authenticateToken, (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, notes, bookingMethod = 'form' } = req.body;
    
    let patientId = req.body.patientId;
    
    // If user is a patient, use their ID
    if (req.user.role === 'patient') {
      patientId = req.user.id;
    }

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    db.run(`
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, booking_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [patientId, doctorId, appointmentDate, appointmentTime, notes, bookingMethod], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Log the action
      db.run(`
        INSERT INTO system_logs (user_id, action, details)
        VALUES (?, ?, ?)
      `, [req.user.id, 'create_appointment', `Created appointment for ${appointmentDate} at ${appointmentTime}`]);

      res.status(201).json({ message: 'Appointment created successfully', appointmentId: this.lastID });
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status
router.patch('/:id/status', authenticateToken, authorizeRole('doctor', 'admin'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({ message: 'Appointment status updated successfully' });
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as appointmentRoutes };
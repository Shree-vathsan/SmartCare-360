import express from 'express';
import { db } from '../database/init.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get prescriptions
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = `
      SELECT p.*, 
             patient.first_name as patient_first_name, patient.last_name as patient_last_name,
             doctor.first_name as doctor_first_name, doctor.last_name as doctor_last_name,
             doctor.specialization
      FROM prescriptions p
      JOIN users patient ON p.patient_id = patient.id
      JOIN users doctor ON p.doctor_id = doctor.id
    `;
    
    let params = [];

    if (req.user.role === 'doctor') {
      query += ' WHERE p.doctor_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' WHERE p.patient_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY p.created_at DESC';

    db.all(query, params, (err, prescriptions) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json(prescriptions);
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create prescription (Doctor only)
router.post('/', authenticateToken, authorizeRole('doctor'), (req, res) => {
  try {
    const { patientId, medication, dosage, frequency, duration, instructions } = req.body;

    if (!patientId || !medication || !dosage || !frequency || !duration) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    db.run(`
      INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency, duration, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [patientId, req.user.id, medication, dosage, frequency, duration, instructions], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Log the action
      db.run(`
        INSERT INTO system_logs (user_id, action, details)
        VALUES (?, ?, ?)
      `, [req.user.id, 'create_prescription', `Created prescription for patient ID: ${patientId}`]);

      res.status(201).json({ message: 'Prescription created successfully', prescriptionId: this.lastID });
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as prescriptionRoutes };
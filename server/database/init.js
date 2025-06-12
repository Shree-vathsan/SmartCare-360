import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('smartcare.db');

export const initDatabase = () => {
  // Users table
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('doctor', 'patient', 'admin')),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        specialization TEXT,
        license_number TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Appointments table
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
        notes TEXT,
        booking_method TEXT DEFAULT 'form' CHECK(booking_method IN ('form', 'chatbot')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // Prescriptions table
    db.run(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        medication TEXT NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration TEXT NOT NULL,
        instructions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      )
    `);

    // System logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create default admin user if not exists
    db.get('SELECT id FROM users WHERE role = ? AND email = ?', ['admin', 'admin@smartcare.com'], (err, row) => {
      if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', 12);
        db.run(`
          INSERT INTO users (email, password, role, first_name, last_name, phone)
          VALUES (?, ?, ?, ?, ?, ?)
        `, ['admin@smartcare.com', hashedPassword, 'admin', 'System', 'Administrator', '+1234567890']);

        // Create sample doctor
        const doctorPassword = bcrypt.hashSync('doctor123', 12);
        db.run(`
          INSERT INTO users (email, password, role, first_name, last_name, phone, specialization, license_number)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['doctor@smartcare.com', doctorPassword, 'doctor', 'Dr. Sarah', 'Johnson', '+1234567891', 'General Medicine', 'MD12345']);

        // Create sample patient
        const patientPassword = bcrypt.hashSync('patient123', 12);
        db.run(`
          INSERT INTO users (email, password, role, first_name, last_name, phone)
          VALUES (?, ?, ?, ?, ?, ?)
        `, ['patient@smartcare.com', patientPassword, 'patient', 'John', 'Doe', '+1234567892']);

        console.log('Default users created:');
        console.log('Admin: admin@smartcare.com / admin123');
        console.log('Doctor: doctor@smartcare.com / doctor123');
        console.log('Patient: patient@smartcare.com / patient123');
      }
    });
  });
};

export { db };
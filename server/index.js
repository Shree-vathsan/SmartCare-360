import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // ✅ Add this
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { appointmentRoutes } from './routes/appointments.js';
import { prescriptionRoutes } from './routes/prescriptions.js';
import { initDatabase } from './database/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['https://smart-care-360.vercel.app', 'http://localhost:5173'];

// ✅ Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(cookieParser()); // ✅ Add this
app.use(express.json());

// ✅ Initialize SQLite database
initDatabase();

// ✅ Routes
app.use('/api/auth', authRoutes);           // Handle login/logout using cookies here
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

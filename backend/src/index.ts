import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import feedbackRoutes from './routes/feedback';
import adminRoutes from './routes/admin';
import managerRoutes from './routes/manager';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'sgec_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);

// Route de test
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Serveur SGEC démarré sur http://localhost:${PORT}`);
});

export default app;
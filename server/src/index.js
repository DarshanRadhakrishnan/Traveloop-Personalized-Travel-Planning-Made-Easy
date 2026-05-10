import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import stopRoutes from './routes/stops.js';
import activityRoutes from './routes/activities.js';
import budgetRoutes from './routes/budget.js';
import checklistRoutes from './routes/checklist.js';
import notesRoutes from './routes/notes.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', stopRoutes);
app.use('/api', activityRoutes);
app.use('/api', budgetRoutes);
app.use('/api', checklistRoutes);
app.use('/api', notesRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Traveloop server running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import profileRouter from './routes/profile';
import compareRouter from './routes/compare';
import leaderboardRouter from './routes/leaderboard';

// Load environment variables
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for React client
app.use(cors());

// Parse JSON request payloads
app.use(express.json());

// Register API Routes
app.use('/api/profile', profileRouter);
app.use('/api/compare', compareRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

export default app;

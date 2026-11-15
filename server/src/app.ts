import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Practice Server Is Running Properly!');
});

// routes imports
import mobileRoutes from './routes/mobile.routes.js';
import authRoutes from './routes/auth.routes.js';

// routes
app.use('/api', mobileRoutes);
app.use('/api', authRoutes);

export default app;
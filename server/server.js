// Load env vars first before any other imports
import dotenv from 'dotenv';
dotenv.config();
console.log('Environment loaded. GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('Environment loaded. OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import { testGptConnection } from './test-gpt.js';
import chatRoutes from './routes/chatRoutes.js';

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/authRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import accRoutes from './routes/accRoutes.js';
import userRoutes from './routes/userRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import tripbotRoutes from './routes/tripbot.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Updated CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure file upload
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/',
  abortOnLimit: false,
  parseNested: true,
  debug: process.env.NODE_ENV !== 'production'
}));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make images folder static
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Simplified request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/accommodation', accRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/tripbot', tripbotRoutes);
app.use('/api/chat', chatRoutes);

// API Root
app.get('/api', (req, res) => {
  res.json({
    message: 'Ceylon Circuit API is running',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  // Test GPT API connection
  await testGptConnection();
}); 
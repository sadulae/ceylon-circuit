const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accommodation', require('./routes/accRoutes'));
app.use('/api/tripbot', require('./routes/tripbot'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ceylon Circuit API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
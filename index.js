const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables from backend/.env regardless of CWD
dotenv.config({ path: path.join(__dirname, '.env') });

const analysisRoutes = require('./routes/analysisRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Set security-related HTTP headers
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // To parse JSON bodies

// Define Routes
app.use('/api/analysis', analysisRoutes);

// Simple route for testing if the server is up
app.get('/', (req, res) => {
  res.send('DocDigest AI Wizard Backend is running!');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

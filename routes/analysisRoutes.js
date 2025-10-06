const express = require('express');
const router = express.Router();
const { processRequest } = require('../controllers/analysisController');

// @route   POST /api/analysis/process
// @desc    Process user input with Claude API
// @access  Public
router.post('/process', processRequest);

module.exports = router;

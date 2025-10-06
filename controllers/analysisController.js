const geminiService = require('../services/geminiService');

const processRequest = async (req, res) => {
  const { input, inputType, mode } = req.body;

  if (!input || !inputType || !mode) {
    return res.status(400).json({ error: 'Missing required fields: input, inputType, and mode are required.' });
  }

  try {
    const result = await geminiService.analyzeContent({ input, inputType, mode });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing request in controller:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

module.exports = {
  processRequest,
};

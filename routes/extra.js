const express = require('express');
const router = express.Router();

router.use('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Message Manager API Home' });
});

router.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

module.exports = router;

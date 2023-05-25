const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.post('/auth/signup', authController.postSignup);
router.post('/auth/login', authController.postLogin);

module.exports = router;

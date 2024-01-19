const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const checkAuth = require('../middleware/check-auth');

router.post('/auth/signup/approve', checkAuth, authController.postApproveUser);
router.post('/auth/signup/reject', checkAuth, authController.postRejectUser);
router.post('/auth/signup/remove', checkAuth, authController.postRemoveUser);
router.post('/auth/signup', authController.postSignup);
router.post('/auth/login', authController.postLogin);

module.exports = router;

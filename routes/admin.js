const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authController = require('../controllers/auth');
const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

router.post('/auth/signup', authController.postSignup);
router.post('/auth/login', authController.postLogin);

router.get('/message/list', adminController.getMessageList);
router.get('/message/find', checkAuth, isBodyArray, adminController.getMessageById);
router.post('/message/add', checkAuth, isBodyArray, adminController.postAddMessage);
router.post('/message/update', checkAuth, isBodyArray, adminController.postUpdateMessage);
router.post('/message/delete', checkAuth, isBodyArray, adminController.getDeleteMessage);

module.exports = router;

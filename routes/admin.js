const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

router.get('/message/pending/list', adminController.getPendingMessageList);
router.get('/message/pending/find/:messageId', adminController.getPendingMessageById);
router.post('/message/add', isBodyArray, adminController.postAddMessage);
router.post('/message/update', isBodyArray, adminController.postUpdateMessage);
router.post('/message/delete', isBodyArray, adminController.postDeleteMessage);

router.get('/user/pending/list', adminController.getPendingUserList);
router.get('/user/pending/find/:userId', adminController.getPendingUserById);
router.get('/user/list', adminController.getUserList);
router.get('/user/find/:userId', adminController.getUserById);

module.exports = router;

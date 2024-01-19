const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

router.get('/message/pending/list', checkAuth, adminController.getPendingMessageList);
router.get('/message/pending/find/:messageId', checkAuth, adminController.getPendingMessageById);

router.post('/message/approve/add', checkAuth, isBodyArray, adminController.postApproveAddMessage);
router.post('/message/approve/update', checkAuth, isBodyArray, adminController.postApproveUpdateMessage);
router.post('/message/approve/delete', checkAuth, isBodyArray, adminController.postApproveDeleteMessage);

router.post('/message/reject', checkAuth, isBodyArray, adminController.postRejectMessage);

router.get('/user/pending/list', checkAuth, adminController.getPendingUserList);
router.get('/user/pending/find/:userId', checkAuth, adminController.getPendingUserById);

router.get('/user/list', checkAuth, adminController.getUserList);
router.get('/user/find/:userId', checkAuth, adminController.getUserById);

module.exports = router;

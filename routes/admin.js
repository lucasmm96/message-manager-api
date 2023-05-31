const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');

//(TBD)const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

router.get('/user/pending/list', adminController.getPendingUserList);
router.get('/message/pending/list', adminController.getPendingMessageList);
//(TBD)router.get('/message/pending/find', isBodyArray, adminController.getPendingMessageById);

router.post('/message/add', isBodyArray, adminController.postAddMessage);

module.exports = router;

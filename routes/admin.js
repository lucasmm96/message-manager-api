const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

router.get('/message/find/:messageId', adminController.getMessageById);
router.get('/message/list', adminController.getMessageList);
router.post('/message/add', adminController.postAddMessage);
router.post('/message/update', adminController.postUpdateMessage);

module.exports = router;

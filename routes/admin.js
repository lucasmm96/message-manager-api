const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isBodyArray = require('../middleware/isBodyArray');

router.get('/message/find/:messageId', adminController.getMessageById);
router.get('/message/list', adminController.getMessageList);
router.post('/message/add', isBodyArray, adminController.postAddMessage);
router.post('/message/update', isBodyArray ,adminController.postUpdateMessage);
router.get('/message/delete', isBodyArray, adminController.getDeleteMessage)

module.exports = router;

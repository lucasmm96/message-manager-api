const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isBodyArray = require('../middleware/isBodyArray');

router.get('/message/list', adminController.getMessageList);
router.get('/message/find', isBodyArray, adminController.getMessageById);
router.post('/message/add', isBodyArray, adminController.postAddMessage);
router.post('/message/update', isBodyArray ,adminController.postUpdateMessage);
router.post('/message/delete', isBodyArray, adminController.getDeleteMessage)

module.exports = router;

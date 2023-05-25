const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

router.get('/message/list', userController.getMessageList);
router.get('/message/find', checkAuth, isBodyArray, userController.getMessageById);
router.post('/message/add', checkAuth, isBodyArray, userController.postAddMessage);
router.post('/message/update', checkAuth, isBodyArray, userController.postUpdateMessage);
router.post('/message/delete', checkAuth, isBodyArray, userController.getDeleteMessage);

module.exports = router;

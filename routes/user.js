const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

// router.get('/message/list', userController.getMessageList);
// router.get('/message/find', checkAuth, isBodyArray, userController.getMessageById);
// router.post('/message/add', checkAuth, isBodyArray, userController.postAddMessage);
// router.post('/message/update', checkAuth, isBodyArray, userController.postUpdateMessage);
// router.post('/message/delete', checkAuth, isBodyArray, userController.getDeleteMessage);

router.get('/message/list', userController.getMessageList);
//(TBD)router.get('/user/list', userController.getUserList);
router.get('/message/find', isBodyArray, userController.getMessageById);

router.post('/message/pending/add', isBodyArray, userController.postAddMessage);
router.post('/message/pending/update', isBodyArray, userController.postUpdateMessage);
router.post('/message/pending/delete', isBodyArray, userController.postDeleteMessage);

module.exports = router;

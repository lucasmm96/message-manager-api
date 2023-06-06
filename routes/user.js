const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');
const isBodyArray = require('../middleware/isBodyArray');

// exemple to use checkAuth:
// router.get('/message/list', userController.getMessageList);
// router.use('/teste', checkAuth, (req, res) => {
// 	res.status(201).json({message: 'OK'})
// });


router.get('/message/list', userController.getMessageList);
router.get('/message/find/:messageId', userController.getMessageById);
router.post('/message/pending/add', isBodyArray, userController.postAddMessage);
router.post('/message/pending/update', isBodyArray, userController.postUpdateMessage);
router.post('/message/pending/delete', isBodyArray, userController.postDeleteMessage);

module.exports = router;

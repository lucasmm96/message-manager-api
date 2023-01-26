const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')

router.get('/message/list', adminController.getMessageList);

module.exports = router
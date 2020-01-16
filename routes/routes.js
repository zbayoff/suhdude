const express = require('express');
const messagesController = require('../messagesController');

const router = express.Router();

router.get('/group/:group_id', messagesController.getGroup);

module.exports = router;

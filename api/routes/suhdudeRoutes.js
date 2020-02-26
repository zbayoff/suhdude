const express = require('express');
const suhdudeController = require('../controllers/suhdudeController');

const router = express.Router();

router.get('/messages', suhdudeController.getMessages);
router.get('/addMessages/:group_id', suhdudeController.addMessages);
router.get('/updateMessages/:group_id', suhdudeController.updateMessages);
router.get('/deleteMessages', suhdudeController.deleteMessages);

module.exports = router;

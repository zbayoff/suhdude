const express = require('express');
const suhdudeController = require('../controllers/suhdudeController');

const router = express.Router();

router.get('/messages', suhdudeController.getMessages);
router.get('/addMessages/:group_id', suhdudeController.addMessages);
router.get('/updateMessages/:group_id', suhdudeController.updateMessages);
router.get('/deleteMessages', suhdudeController.deleteMessages);
router.get('/userStats', suhdudeController.getUserStats);
router.get('/users', suhdudeController.getUsers);

module.exports = router;

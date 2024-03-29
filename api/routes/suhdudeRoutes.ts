import express from 'express';
import suhdudeController from '../controllers/suhdudeController';
import { getAllMessageGifs } from '../controllers/messages';
import { getUserStats } from '../controllers/userstats';

const router = express.Router();

router.get('/messages', suhdudeController.getMessages);
router.get('/randomMessage', suhdudeController.randomMessage);
router.get('/addMessages/:group_id', suhdudeController.addMessages);
router.get('/updateMessages/:group_id', suhdudeController.updateMessages);
router.get('/deleteMessages', suhdudeController.deleteMessages);
router.get('/userStats', getUserStats);
router.get('/users', suhdudeController.getUsers);
router.get('/userTopTen', suhdudeController.getUserTopTen);
router.get('/topTen', suhdudeController.topTen);
router.get('/allGifs', getAllMessageGifs);

module.exports = router;

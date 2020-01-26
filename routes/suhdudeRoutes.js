const express = require('express');
const suhdudeController = require('../controllers/suhdudeController');
const groupmeController = require('../controllers/groupmeController');

const router = express.Router();

// router.get('/uploadGroup/:group_id', suhdudeController.uploadGroup);

// router.get('/group', suhdudeController.getGroup);

router.get('/messages', suhdudeController.getMessages);
router.get('/addMessages/:group_id', suhdudeController.addMessages);
router.get('/updateMessages/:group_id', suhdudeController.updateMessages);

// get lastmsgID and update messages

// last msg entered into DB
// suhdudeController
// 	.getLastMsgID()
// 	.then(data => {
// 		const lastMsgID = data.created_at;
// 		console.log('lastmsgid: ', lastMsgID);
// 		let count = 0;
// 		while()
// 		groupmeController.getMessages(groupID, '', );

// 		// get Messages from GroupME with lastiD as since_id
// 		res.send(lastMsgID);
// 	})
// 	.catch(err => {
// 		res.send(err);
// 	});

// GOOD CODE BELOW
// groupmeController
// 	.uploadAllMessages(groupID)
// 	.then(messages => {
// 		console.log('uploaded messages: ', messages);
// 		res.send(messages);
// 	})
// 	.catch(err => {
// 		res.send(err);
// 	});

// router.get('/messages/:group_id', );

module.exports = router;

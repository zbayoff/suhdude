const express = require('express');
const groupmeController = require('../controllers/groupmeController');

const router = express.Router();

router.get('/group/:group_id', function(req, res) {
	const groupID = req.params.group_id;

	groupmeController
		.getGroup(groupID)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.send(err);
		});
});

router.get('/groups', function(req, res) {
	groupmeController
		.getGroups()
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.send(err);
		});
});

router.get('/uploadAllMessages/:group_id', groupmeController.uploadAllMessages);
router.get('/messages/:group_id', groupmeController.getMessages);

// router.get('/updateMessages/:group_id', function(req, res) {
// 	const groupID = req.params.group_id;

// 	// groupmeController
// 	// 	.getAllMessages(groupID)
// 	// 	.then(data => {
// 	// 		res.send(data);
// 	// 	})
// 	// 	.catch(err => {
// 	// 		res.send(err);
// 	// 	});
// });

// router.get('/uploadGroup/:group_id', function(req, res) {
// 	const groupID = req.params.group_id;

// 	groupmeController
// 		.uploadGroup(groupID)
// 		.then(data => {
// 			res.send(data);
// 		})
// 		.catch(err => {
// 			res.send(err);
// 		});
// });

module.exports = router;

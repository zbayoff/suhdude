// Create functions to query the suh-dude db.
// Retreiving messages, group info from db for frontend app to hit.

const async = require('async');
const mongoose = require('mongoose');

const groupmeController = require('../controllers/groupmeController');

const Message = mongoose.model('Message');

function getLastMsgID() {
	return Message.findOne().sort({ created_at: -1 });
}

async function addMessages(req, res) {
	const groupID = req.params.group_id;
	const lastMsg = await getLastMsgID();
	let lastMsgID = lastMsg.id;
	const lastMsgIDfromGroupMe = await groupmeController.lastMsgID(groupID);
	// const totalMessageCount = await groupmeController.totalMessageCountHandler(
	// 	groupID
	// );

	console.log('lastMsgIDfromGroupMe', lastMsgIDfromGroupMe);
	console.log('lastMsgID in DB', lastMsgID);

	const all = [];
	// let messageCount = 0;

	// gets last messages from GroupMe that aren't in DB and uploads
	while (lastMsgIDfromGroupMe !== lastMsgID) {
		console.log('Getting messages from lastID: ', lastMsgID);
		// console.log('messageCount: ', messageCount);
		const lastMessages = await groupmeController.getMessages(
			groupID,
			'',
			'',
			lastMsgID // after_id
		);

		console.log('lastMessages.length', lastMessages.length);

		lastMsgID = lastMessages.slice(-1)[0].id;
		console.log('updated lastMsgID: ', lastMsgID);

		all.push(...lastMessages);
	}

	Message.insertMany(all)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.send(err);
		});
}

async function updateMessages(req, res) {
	const numMsgstoRefresh = req.query.num;
	const groupID = req.params.group_id;
	const lastMsg = await getLastMsgID();
	let lastMsgID = lastMsg.id + 1;
	let messageCount = 0;

	const all = [];

	// gets last messages from GroupMe that aren't in DB and uploads
	while (messageCount < numMsgstoRefresh) {
		const lastMessages = await groupmeController.getMessages(
			groupID,
			lastMsgID, // before_id
			'',
			'',
			100
		);

		lastMsgID = lastMessages[0].id;

		all.push(...lastMessages);

		messageCount += 100;
	}

	async.eachSeries(
		all,
		function updateObject(obj, done) {
			Message.updateOne(
				{ id: obj.id },
				{ $set: { favorited_by: obj.favorited_by } },
				done
			);
		},
		function allDone(err) {
			if (err) {
				res.send(err);
			}
			res.send('done');
		}
	);
}

function getMessages(req, res) {
	const { fromTS, toTS, userID, favoritedBy, text, limit } = req.query;

	const query = {};
	let newLimit = null;

	if (fromTS && toTS) {
		query.created_at = {
			$gte: Number(fromTS),
			$lt: Number(toTS),
		};
	}

	if (userID) {
		query.user_id = userID;
	}

	if (favoritedBy) {
		query.favorited_by = favoritedBy;
	}

	if (text) {
		query.$text = { $search: text };
	}

	if (limit) {
		newLimit = Number(limit);
	}

	console.log('query: ', query);

	// console.log('user_id: ', typeof user_id);
	// Message.ch;
	Message.find(query)
		.limit(newLimit)
		.then(data => {
			// console.log();
			res.send(data);
		})
		.catch(err => {
			res.send(err);
		});
}

module.exports = {
	getLastMsgID,
	getMessages,
	addMessages,
	updateMessages,
};

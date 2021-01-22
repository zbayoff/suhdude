const request = require('request-promise');
// const { Parser } = require('json2csv');
const fs = require('fs');
const mongoose = require('mongoose');

const Message = mongoose.model('Message');

require('dotenv').config();

const config = require('../../config');

function getMessages(
	groupID,
	beforeID = '',
	sinceID = '',
	afterID = '',
	limit = 100
) {
	const options = {
		uri: `${config.url}/groups/${groupID}/messages?before_id=${beforeID}&since_id=${sinceID}&after_id=${afterID}&limit=${limit}&token=${config.TOKEN}`,
		json: true,
	};

	return request
		.get(options)
		.then(data => {
			return data.response.messages;
		})
		.catch(err => {
			console.log(err);
		});
}

function getGroupMeMessages(req, res) {
	const {
		before_id = '',
		since_id = '',
		after_id = '',
		limit = 20,
	} = req.query;
	const { group_id } = req.params;

	const options = {
		uri: `${config.url}/groups/${group_id}/messages?before_id=${before_id}&since_id=${since_id}&after_id=${after_id}&limit=${limit}&token=${config.TOKEN}`,
		json: true,
	};

	request
		.get(options)
		.then(data => {
			res.send(data.response.messages);
		})
		.catch(err => {
			res.send(err);
		});
}

function getGroup(groupID) {
	const options = {
		uri: `${config.url}/groups/${groupID}?token=${config.TOKEN}`,
		json: true,
	};

	return request
		.get(options)
		.then(data => {
			return data.response;
		})
		.catch(err => {
			return err;
		});
}

function getGroups() {
	const options = {
		uri: `${config.url}/groups?token=${config.TOKEN}`,
		json: true,
	};

	return request
		.get(options)
		.then(data => {
			return data.response;
		})
		.catch(err => {
			return err;
		});
}

function lastMsgID(groupID) {
	return getGroup(groupID)
		.then(data => {
			return data.messages.last_message_id;
		})
		.catch(err => {
			return err;
		});
}

function totalMessageCountHandler(groupID) {
	return getGroup(groupID)
		.then(data => {
			return data.messages.count;
		})
		.catch(err => {
			return err;
		});
}

// async function uploadGroup(groupID) {
// 	const group = await getGroup(groupID);

// 	return Group.findOneAndUpdate(
// 		{ id: groupID },
// 		group,
// 		{
// 			upsert: true,
// 			new: true,
// 			runValidators: true,
// 			useFindAndModify: false,
// 		},
// 		function(err, res) {
// 			if (err) {
// 				return err;
// 			}

// 			return res;
// 		}
// 	);
// }

// upload all messages
async function uploadAllMessages(req, res) {
	const groupID = req.params.group_id;

	let messageCount = 0;
	let lastMsgIDs = (await lastMsgID(groupID)) + 1;
	const totalMessageCount = await totalMessageCountHandler(groupID);

	// console.log('lastMsgIDs: ', lastMsgIDs);
	const all = [];
	while (messageCount < 100) {
		console.log('Getting messages from lastID: ', lastMsgIDs);
		console.log('messageCount: ', messageCount);
		const lastMessages = await getMessages(groupID, lastMsgIDs);

		lastMsgIDs = lastMessages.slice(-1)[0].id;

		messageCount += 100;
		all.push(...lastMessages);
	}

	// console.log(all);

	Message.insertMany(all)
		.then(response => {
			console.log('Got all messages: ', response);
			res.send(response);
		})
		.catch(err => {
			res.send(err);
		});
}

function writeToCSV(csvResults) {
	fs.writeFile(`test.csv`, csvResults, function(err) {
		if (err) {
			throw err;
		}

		console.log('Messages written to CSV');

		// const fileName = `${outputFileName}.csv`;

		// const filePath = `${projectDirPath}/${outputFileName}.csv`;
		// uploadFileToS3(options, filePath, fileName);
	});
}

// uploadAllMessages(18834987)
// 	.then(messages => {
// 		console.log('Got all messages');
// 		// const json2csvParser = new Parser();

// 		// // choice to output pa11y results as csv or json.
// 		// const csvResults = json2csvParser.parse(messages);
// 		// // const jsonResults = JSON.stringify(messages);
// 		// writeToCSV(csvResults);
// 		return messages;
// 	})
// 	.catch(err => {
// 		throw err;
// 	});

module.exports = {
	getMessages,
	uploadAllMessages,
	getGroup,
	lastMsgID,
	totalMessageCountHandler,
	getGroups,
	getGroupMeMessages,
};

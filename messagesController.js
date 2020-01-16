const request = require('request-promise');

require('dotenv').config();

const config = require('./config');

async function main() {
	const groupID = 18834987;
	const beforeID = '';
	const sinceID = '';

	try {
		const options = {
			uri: `${config.url}/groups/${groupID}/messages?before_id=${beforeID}&since_id=${sinceID}&token=${config.TOKEN}`,
			json: true,
		};
		const res = await request.get(options);
		console.log('res: ', res);
	} catch (e) {
		console.log(e.message);
	}
}

main();

// main();

// function getGroup(groupID) {
// 	return rp
// 		.get({
// 			uri: `${config.url}/groups/${groupID}?token=${config.TOKEN}`,
// 			json: true,
// 		})
// 		.then(data => {
// 			return data.response;
// 		})
// 		.catch(err => {
// 			console.log(err);
// 		});
// }

// function getMessages(groupID, beforeID = '', sinceID = '') {
// 	const options = {
// 		uri: `${config.url}/groups/${groupID}/messages?before_id=${beforeID}&since_id=${sinceID}&token=${config.TOKEN}`,
// 		json: true,
// 	};

// 	return rp
// 		.get(options)
// 		.then(data => {
// 			return data.response;
// 		})
// 		.catch(err => {
// 			console.log(err);
// 		});
// }

// async function getAllMessages() {
// 	const messages = [];

// 	// loop through
// 	// const message =

// 	for (let i = 0; i < 3; i++) {
// 		console.log('requesting: ', i);
// 		messages.push(await getMessages(18834987));
// 	}

// 	return messages;

// 	// console.log('messages: ', messages);
// }

// getAllMessages().then(messages => {
// 	console.log('messages: ', messages);
// });

// getGroup(18834987).then(group => {
// 	console.log(group);
// });

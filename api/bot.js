const moment = require('moment');

require('dotenv').config();

const axios = require('axios');
const config = require('../config');

function getMessages(fromTS, toTS, dashboard) {
	return axios.get(`http://localhost:8080/api/messages`, {
		params: {
			fromTS,
			toTS,
			userIDs: [],
			favorited: false,
			dashboard,
			skip: 0,
		},
	});
}

async function postMessage() {
	const URI = 'https://api.groupme.com/v3/bots/post';

	// 8998138

	// const attachments = [
	// 	{
	// 		loci: [[10, 8]],
	// 		type: 'mentions',
	// 		user_ids: ['8998138'],
	// 	},
	// ];

	const now = moment().unix();
	const startDate = moment()
		.startOf('day')
		.unix();

	const response = await getMessages(startDate, now, true);
	console.log('messagesSentToday: ', response.data.length);

	axios
		.post(URI, {
			bot_id: config.BOT_ID,
			text: `Y'all have sent ${response.data.length} messages today. Swell!`,
		})
		.then(function(response) {
			console.log('response: ', response);
		})
		.catch(function(error) {
			console.log('error: ', error);
		});
}

postMessage();

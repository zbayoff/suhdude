const express = require('express');
const request = require('request');

const port = process.env.PORT || 8080;

const app = express();

const routes = require('./routes/routes');

require('dotenv').config();

const url = 'https://api.groupme.com/v3';
const TOKEN = process.env.GROUP_ME_TOKEN;

const groupID = 18834987;

app.use('/api', routes);

// const options = {};

// const getMessages = function(groupID, beforeID = '', sinceID = '') {
// 	// let messages;
// 	// let count = 0;
// 	request.get(
// 		`${url}/groups/${groupID}/messages?token=${TOKEN}`,
// 		options,
// 		function(error, response, body) {
// 			// if (!error && response.statusCode === 200) {
// 			const jsonResponse = JSON.parse(body).response;
// 			const { count, messages } = jsonResponse;

// 			// const totalMessageCount = count;
// 			console.log('messages: ', messages);
// 			// console.log('totalMessageCount: ', totalMessageCount);
// 			// }
// 			// console.log('error:', error); // Print the error if one occurred

// 			return { messages };
// 		}
// 	);

// 	// return hello;

// 	// return messages;
// };

// const getAllMessages = function() {
// 	console.log('getMessages(groupID);: ', getMessages(groupID));
// };

// getAllMessages();

app.all('*', function(req, resp, next) {
	console.info(`${req.method} ${req.originalUrl}`);
	next();
});

// app.get('/group', (req, res) => {
// 	request.get(
// 		`${url}/groups/${groupID}?token=${TOKEN}`,
// 		(error, response, body) => {
// 			if (!error && response.statusCode === 200) {
// 				const jsonResponse = JSON.parse(body).response;
// 				// console.log('jsonResponse: ', jsonResponse);
// 				const group = jsonResponse;
// 				res.send(group);
// 			} else {
// 				res.send({ error, response });
// 			}
// 		}
// 	);
// });

// app.get('/messages', (req, res) => {
// 	// res.send('Hello World!');
// 	const sinceID = req.query.since_id || '';
// 	const beforeID = req.query.before_id || '';

// 	request.get(
// 		`${url}/groups/${groupID}/messages?before_id=${beforeID}&since_id=${sinceID}&token=${TOKEN}`,
// 		(error, response, body) => {
// 			if (!error && response.statusCode === 200) {
// 				const jsonResponse = JSON.parse(body).response;
// 				const { count, messages } = jsonResponse;
// 				res.send({ count, messages });
// 			} else {
// 				res.send({ error });
// 			}
// 		}
// 	);
// });

app.listen(port, function() {
	console.log(`App listening on port ${port}`);
});

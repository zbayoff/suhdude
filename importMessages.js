const rp = require('request-promise');
const mongo = require('mongodb').MongoClient;

require('dotenv').config();

const { DB_PASS, DB_NAME } = process.env;

const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://zbayoff:${DB_PASS}@suhdude-6eldc.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const url = 'https://api.groupme.com/v3';
const TOKEN = process.env.GROUP_ME_TOKEN;

// get all messages from GroupMe and upload to DB

const sinceID = '';
const beforeID = '';

const totalMessages = [];

const groupID = 18834987;

const currentCount = 0;

// Promise.all create promise chain when looping through groupme api calls
// get 100 messages and populate messages array, once all finsihed, push to DB

function loadMessages() {
	const messageRequests = [];
}

function getLastMessageID(groupID) {}

// TODO make this an async function with promises
// like: const messages = await getMessages();
function getMessages() {
	// const messages = [];

	return new Promise((resolve, reject) => {
		request.get(
			`${url}/groups/${groupID}/messages?before_id=${beforeID}&since_id=${sinceID}&token=${TOKEN}`,
			(error, response, body) => {
				if (!error && response.statusCode === 200) {
					const jsonResponse = JSON.parse(body).response;
					const { count, messages } = jsonResponse;

					// totalMessages.push(...messages);
					resolve(messages);

					// res.send({ count, messages });
				} else {
					// res.send({ error });
					reject(error);
				}
			}
		);
	});
}

client.connect(err => {
	const collection = client.db(DB_NAME).collection('messages');

	collection.insertMany(messages, function(err, result) {
		if (err) {
			console.log('MONGO ERR', err);
		}
	});

	client.close();
});

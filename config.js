const url = 'https://api.groupme.com/v3';
const TOKEN = process.env.GROUP_ME_TOKEN;
const { BOT_ID } = process.env;

const config = {
	url,
	TOKEN,
	BOT_ID,
};

module.exports = config;

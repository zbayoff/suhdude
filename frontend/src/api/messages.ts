import axios from 'axios';

export const addMessages = async () => {
	try {
		const { data } = await axios.get(`/api/addMessages/18834987`);

		return data;
	} catch (error) {
		console.error('error adding messages: ', error);
	}
};

export const updateMessages = async () => {
	try {
		const { data } = await axios.get(`/api/updateMessages/18834987?num=1000`);

		return data;
	} catch (error) {
		console.error('error updating messages: ', error);
	}
};

export const getMessages = (
	fromTS: string,
	toTS: string,
	dashboard: boolean
) => {
	return axios.get(`/api/messages`, {
		params: {
			fromTS: fromTS,
			toTS: toTS,
			userIDs: [],
			favorited: false,
			dashboard,
			skip: 0,
		},
	});
};

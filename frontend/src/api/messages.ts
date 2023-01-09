import axios from 'axios';

export const addMessages = async () => {
	try {
		const { data } = await axios.get(`/api/addMessages/18834987`);

		return data;
	} catch (error) {
		console.error('error fetching group: ', error);
	}
};

export const updateMessages = async () => {
	try {
		const { data } = await axios.get(`/api/updateMessages/18834987?num=1000`);

		return data;
	} catch (error) {
		console.error('error fetching group: ', error);
	}
};

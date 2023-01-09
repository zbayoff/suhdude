import axios from 'axios';

export const fetchGroup = async () => {
	try {
		const { data } = await axios.get(`/groupmeApi/group/18834987`);

		return data;
	} catch (error) {
		console.error('error fetching group: ', error);
	}
};

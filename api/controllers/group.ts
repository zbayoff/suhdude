require('dotenv').config();

import axios from 'axios';
import config from '../../config';
import { Group } from '../types/group';

export const fetchGroup = async () => {
	try {
		const { data } = await axios.get(
			`${config.url}/groups/${config.GROUP_ID}?token=${config.TOKEN}`
		);
		return data.response as Group;
	} catch (error) {
		console.log('error fetching group: ', error);
		throw error;
	}
};

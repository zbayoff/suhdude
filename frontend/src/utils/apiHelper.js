import axios from 'axios';

export function getMessages(fromTS, toTS, dashboard) {
	return axios
		.get(`/api/messages`, {
			params: {
				fromTS: fromTS,
				toTS: toTS,
				userIDs: [],
				favorited: false,
				dashboard,
				skip: 0,
			},
		});
}

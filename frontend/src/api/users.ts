import axios from 'axios';

export interface User {
	user_id: string;
	nickname: string;
	image_url: string;
	id: string;
	muted: boolean;
	autokicked: boolean;
	roles: string[];
	name: string;
	distinctNicknames: string[];
};

export const fetchUsers = async () => {
	try {
		const { data }: { data: User[] } = await axios.get(`/api/users`);

		return data;
	} catch (error) {
		console.error('error fetching users: ', error);
	}
};

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
}

export const fetchUsers = async () => {
	try {
		const { data }: { data: User[] } = await axios.get(`/api/users`);

		return data;
	} catch (error) {
		console.error('error fetching users: ', error);
	}
};

export interface UserStatsAggregationResponse extends User {
	numMessages: number;
	numGifs: number;
	numLikesReceived: number;
	numLikedMsgs: number;
	numSelfLikes: number;
	distinctNicknames: string[];
	numDistinctNicknames: number;
	avgLikesPerMessage: number;
	numMessageZeroLikes: number;
	likesToMsgs: number;
}

export const fetchUserStats = async () => {
	try {
		const { data }: { data: UserStatsAggregationResponse[] } = await axios.get(
			`/api/userStats`
		);

		return data;
	} catch (error) {
		console.error('error fetching users: ', error);
	}
};

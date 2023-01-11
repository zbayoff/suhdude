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

type topTenMessageDays = {
	_id: string;
	count: number;
};

type topTenLikesReceivedDays = {
	_id: string;
	count: number;
};

type topTenLikesGivenOutDays = {
	_id: string;
	count: number;
};

export interface UserStats {
	user_id: string;
	nickname: string;
	image_url: string;
	id: string;
	muted: boolean;
	autokicked: boolean;
	roles: string[];
	name: string;
	distinctNicknames: string[];
	numMessages: number;
	numLikesReceived: number;
	numLikedMsgs: number;
	numSelfLikes: number;
	likesToMsgs: number;
	numdistinctNicknames: number;
	avgLikesPerMessage: number;
	numMessageZeroLikes: number;
	topTenMessageDays: topTenMessageDays[];
	topTenLikesReceivedDays: topTenLikesReceivedDays[];
	topTenLikesGivenOutDays: topTenLikesGivenOutDays[];
}

export const fetchUserStats = async () => {
	try {
		const { data }: { data: UserStats[] } = await axios.get(`/api/userStats`);

		return data;
	} catch (error) {
		console.error('error fetching users: ', error);
	}
};

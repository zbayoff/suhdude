import axios from 'axios';

export interface TopTen {
	[key: number]: {
		topTenMessageDays: [
			{
				_id: string;
				count: number;
			}
		];
		topTenLikesDays: [
			{
				_id: string;
				count: number;
			}
		];
	};
}

export interface UserTopTen {
	user_id: string;
	nickname: string;
	image_url: string;
	id: string;
	muted: boolean;
	autokicked: boolean;
	roles: string[];
	name: string;
	topTenMessageDays: [
		{
			_id: string;
			count: number;
		}
	];
	topTenLikesReceivedDays: [
		{
			_id: string;
			count: number;
		}
	];
	topTenLikesGivenOutDays: [
		{
			_id: string;
			count: number;
		}
	];
}

export const fetchTopTen = async () => {
	try {
		const { data }: { data: TopTen } = await axios.get(`/api/topTen`);
		return data;
	} catch (error) {
		console.error('error fetching top ten: ', error);
	}
};

export const fetchUserTopTen = async () => {
	try {
		const { data }: { data: UserTopTen[] } = await axios.get(`/api/userTopTen`);

		return data;
	} catch (error) {
		console.error('error fetching user top ten: ', error);
	}
};

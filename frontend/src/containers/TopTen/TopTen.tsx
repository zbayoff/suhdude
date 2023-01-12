import React from 'react';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';

import TopTenItem from '../../components/TopTen/TopTenItem';
import { useQuery } from '@tanstack/react-query';
import { fetchTopTen, fetchUserTopTen } from '../../api/topTen';

const TopTen = () => {
	const { data: topTenData, isLoading: loadingTopTen } = useQuery({
		queryKey: ['fetchTopTen'],
		queryFn: fetchTopTen,
	});

	const { data: userTopTen, isLoading: loadingUserTopTen } = useQuery({
		queryKey: ['fetchUserTopTen'],
		queryFn: fetchUserTopTen,
	});

	const topTenMessageDays =
		topTenData &&
		topTenData[0].topTenMessageDays
			.sort((a, b) => {
				return b.count - a.count;
			})
			.slice(0, 10);

	const topTenLikesDays =
		topTenData &&
		topTenData[0].topTenLikesDays
			.sort((a, b) => {
				return b.count - a.count;
			})
			.slice(0, 10);

	const topTenMessageDaysByUser = userTopTen
		?.map(user => {
			return user.topTenMessageDays.map(topTenItem => {
				return {
					user: user.nickname,
					count: topTenItem.count,
					_id: topTenItem._id,
				};
			});
		})
		.flat()
		.sort((a, b) => {
			return b.count - a.count;
		})
		.slice(0, 10);

	const topTenLikesReceivedDaysByUser = userTopTen
		?.map(user => {
			return user.topTenLikesReceivedDays.map(topTenItem => {
				return {
					user: user.nickname,
					count: topTenItem.count,
					_id: topTenItem._id,
				};
			});
		})
		.flat()
		.sort((a, b) => {
			return b.count - a.count;
		})
		.slice(0, 10);
	const topTenLikesGivenOutDaysByUser = userTopTen
		?.map(user => {
			return user.topTenLikesGivenOutDays.map(topTenItem => {
				return {
					user: user.nickname,
					count: topTenItem.count,
					_id: topTenItem._id,
				};
			});
		})
		.flat()
		.sort((a, b) => {
			return b.count - a.count;
		})
		.slice(0, 10);

	return (
		<>
			<Box pb={4}>
				<Typography variant="h6" align="center">
					Top Ten: By Group
				</Typography>
			</Box>
			<Container>
				<Grid container spacing={3}>
					<TopTenItem
						title="Most Messages by Day"
						data={topTenMessageDays}
						isLoading={loadingTopTen}
					/>
					<TopTenItem
						title="Most Likes by Day"
						data={topTenLikesDays}
						isLoading={loadingTopTen}
					/>
				</Grid>
			</Container>
			<Box py={4}>
				<Typography variant="h6" align="center">
					Top Ten: By User
				</Typography>
			</Box>
			<Container>
				<Grid container spacing={3}>
					<TopTenItem
						title="Most Messages By Day"
						data={topTenMessageDaysByUser}
						isLoading={loadingUserTopTen}
					/>
					<TopTenItem
						title="Most Likes Received By Day"
						data={topTenLikesReceivedDaysByUser}
						isLoading={loadingUserTopTen}
					/>
					<TopTenItem
						title="Most Likes Given By Day"
						data={topTenLikesGivenOutDaysByUser}
						isLoading={loadingUserTopTen}
					/>
				</Grid>
			</Container>
		</>
	);
};

export default TopTen;

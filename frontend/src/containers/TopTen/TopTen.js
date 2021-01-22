import React, { Component } from 'react';

import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';

import TopTenItem from '../../components/TopTen/TopTenItem';

class TopTen extends Component {
	state = {
		topTenData: null,
		userStats: [],
		topTenMessageDays: null,
		topTenLikesReceivedDays: null,
		topTenLikesGivenOutDays: null,
	};

	componentDidMount() {
		this.fetchTopTen();
		this.fetchUserStats();
	}

	fetchTopTen() {
		axios
			.get('/api/topTen')
			.then(response => {
				const topTenData = response.data[0];
				// console.log('topTen: ', topTenData)

				this.setState({
					topTenData,
				});
			})
			.catch(err => console.log(err));
	}

	fetchUserStats() {
		axios
			.get('/api/userTopTen')
			.then(response => {
				const userStats = response.data;
				// console.log('userStats: ', userStats)
				this.findTopTen(userStats);
				this.setState(
					{
						userStats: [...userStats],
					},
					() => {}
				);
			})
			.catch(err => console.log(err));
	}

	findTopTen(userStats) {
		console.log('findTopTen...');
		let topMessageDays = [];
		let topLikesReceivedDays = [];
		let topLikesGivenOutDays = [];

		userStats.forEach(user => {
			// topTenMessageDays
			user.topTenMessageDays.forEach(topTenItem => {
				topMessageDays.push({
					user: user.nickname,
					count: topTenItem.count,
					_id: topTenItem._id,
				});
			});

			// topTenLikesReceivedDays
			user.topTenLikesReceivedDays.forEach(topTenItem => {
				topLikesReceivedDays.push({
					user: user.nickname,
					count: topTenItem.count,
					_id: topTenItem._id,
				});
			});

			// topTenLikesGivenOutDays
			user.topTenLikesGivenOutDays.forEach(topTenItem => {
				topLikesGivenOutDays.push({
					user: user.nickname,
					count: topTenItem.count,
					_id: topTenItem._id,
				});
			});
		});

		let topTenMessageDays = topMessageDays
			.sort((a, b) => {
				return b.count - a.count;
			})
			.splice(0, 10);

		let topTenLikesReceivedDays = topLikesReceivedDays
			.sort((a, b) => {
				return b.count - a.count;
			})
			.splice(0, 10);

		let topTenLikesGivenOutDays = topLikesGivenOutDays
			.sort((a, b) => {
				return b.count - a.count;
			})
			.splice(0, 10);

		this.setState({
			topTenMessageDays,
			topTenLikesReceivedDays,
			topTenLikesGivenOutDays,
		});
	}

	render() {
		let topTenItems = null;
		let topTenMessageDays = null;
		let topTenLikesDays = null;

		let topTenMessageDaysUser = null;
		let topTenLikesReceivedDays = null;
		let topTenLikesGivenOutDays = null;

		if (this.state.topTenData) {
			topTenItems = this.state.topTenData;
			topTenMessageDays = topTenItems.topTenMessageDays;
			topTenLikesDays = topTenItems.topTenLikesDays;
		}

		if (
			this.state.topTenMessageDays &&
			this.state.topTenLikesReceivedDays &&
			this.state.topTenLikesGivenOutDays
		) {
			topTenMessageDaysUser = this.state.topTenMessageDays;
			topTenLikesReceivedDays = this.state.topTenLikesReceivedDays;
			topTenLikesGivenOutDays = this.state.topTenLikesGivenOutDays;
		}

		return (
			<>
				<Box pb={4}>
					<Typography variant="h6" align="center">
						Top Ten: By Group
					</Typography>
				</Box>
				<Container>
					<Grid container spacing={3}>
						<TopTenItem title="Most Messages by Day" data={topTenMessageDays} />
						<TopTenItem title="Most Likes by Day" data={topTenLikesDays} />
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
							data={topTenMessageDaysUser}
						/>
						<TopTenItem
							title="Most Likes Received By Day"
							data={topTenLikesReceivedDays}
						/>
						<TopTenItem
							title="Most Likes Given By Day"
							data={topTenLikesGivenOutDays}
						/>
					</Grid>
				</Container>
			</>
		);
	}
}

export default TopTen;

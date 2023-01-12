import React from 'react';

import moment from 'moment';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
	number: {
		width: '25px',
	},
	user: {
		width: '45%',
		fontSize: '0.8rem',
	},
	count: {
		width: '40px',
	},
	date: {
		margin: 0,
		flexGrow: 1,
		textAlign: 'right',
		width: '38%',
	},
	dateLink: {},
	rowContainer: {
		padding: '4px',
		textDecoration: 'none',
		display: 'flex',
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.04)',
		},
		color: '#000',
		'&:visited': {
			color: '#000',
		},
	},
}));

interface TopTenItemProps {
	data: any;
	title: string;
	isLoading: boolean;
}

const TopTenItem = ({ data, title, isLoading }: TopTenItemProps) => {
	const classes = useStyles();

	return (
		<Grid item xs={12} sm={12} md={12} lg={6} xl={4}>
			<Paper>
				<Box justifyContent={'center'} p={2} position={'relative'}>
					<h3>{title}</h3>
					{isLoading ? (
						<CircularProgress />
					) : (
						data?.map((item: any, index: number) => {
							let date = moment(item._id).format('MMM D, YYYY');
							let user = null;
							if (item.user) {
								user = (
									<Typography className={classes.user}>{item.user}</Typography>
								);
							}
							return (
								<a
									href={
										'/#/messages?date=' + moment(date, 'MMM D, YYYY').unix()
									}
									key={index}
									className={classes.rowContainer}
								>
									<Typography className={classes.number}>
										{index + 1}.
									</Typography>

									<Typography className={classes.count}>
										{item.count}
									</Typography>

									{user}

									<Typography className={classes.date}>
										<span className={classes.dateLink}>{date}</span>
									</Typography>
								</a>
							);
						})
					)}
				</Box>
			</Paper>
		</Grid>
	);
};

export default TopTenItem;

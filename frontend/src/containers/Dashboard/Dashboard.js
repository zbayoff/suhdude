import React, { Component } from 'react';
import axios from 'axios';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { TimeSeries } from 'pondjs';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { getMessages } from '../../utils/apiHelper';

import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import MessageTimeSeriesChart from '../../components/Dashboard/MessageTimeSeriesChart';
import Message from '../../components/Messages/Message/Message';

import './Dashboard.scss';

const timeSelectOptions = [
	{ key: '1d', text: 'Today', past_text: 'yesterday' },
	{ key: '1w', text: 'This week', past_text: 'last week' },
	{ key: '1m', text: 'This month', past_text: 'last month' },
	{ key: 'custom', text: 'Select Range' },
];

const styles = theme => {
	return {
		menuItem: {
			'&:focus': {
				backgroundColor: theme.palette.primary.main,
				'& $primary, & $icon': {
					color: theme.palette.common.white,
				},
			},
		},
		timeSelect: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.common.white,
		},

		primary: {},
		icon: {},
		rowContainer: {
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
	};
};

class Dashboard extends Component {
	state = {
		numMessages: 0,
		messages: [],
		startDate: moment().startOf('day'),
		// .unix(), // set default to 1 days from now
		endDate: moment(),
		anchorEl: null,
		selectedKey: '1d',
		datePickerOpen: false,
		focusedInput: 'startDate',
		selectedUsers: [],
		numMsgsPercentChange: null,
		numMessagesSent: null,
		series: null,
		loadingMessages: false,
		randomMessage: null,
	};

	componentDidMount() {
		this.fetchMessages();
		this.getMessage();
	}

	getMessage() {
		axios
			.get('/api/randomMessage')
			.then(response => {
				this.setState({ randomMessage: response.data });
			})
			.catch(err => console.log(err));
	}

	fetchMessages() {
		const fromTS = this.state.startDate.unix();
		const toTS = this.state.endDate.unix();

		this.setState({ loadingMessages: true });

		axios
			.get(`/api/messages`, {
				params: {
					sort: 'asc',
					fromTS: fromTS,
					toTS: toTS,
					userIDs: [],
					favorited: false,
					dashboard: true,
					skip: 0,
				},
			})
			.then(response => {
				const messages = response.data;
				let series = new TimeSeries({
					name: 'messages',
					columns: ['time', 'value'],
					utc: false,
					points: messages.map((message, index) => {
						return [moment.unix(message.created_at).valueOf(), index];
					}),
				});

				this.setState({ messages: [] });
				this.setState(
					{
						messages: [...this.state.messages, ...messages],
						series,
						loadingMessages: false,
						numMessagesSent: messages.length,
					},
					() => {
						this.calcNumMessages();
						this.renderChart();
					}
				);
			})
			.catch(err => console.log(err));
	}

	renderChart() {
		if (this.state.loadingMessages === false && this.state.messages.length) {
			return (
				<MessageTimeSeriesChart
					messages={this.state.messages}
					series={this.state.series}
				/>
			);
		}

		return <CircularProgress />;
	}

	startDateChangeHandler = date => {
		const newDate = moment(date);

		this.setState(
			{
				startDate: newDate,
			},
			() => {
				this.fetchMessages();
			}
		);
	};

	handleClickListItem = event => {
		this.setState({ anchorEl: event.currentTarget });
	};

	handleMenuItemClick = (event, key) => {
		let startDate = null;
		let endDate = null;

		switch (key) {
			case '1d':
				startDate = moment().startOf('day');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
			case '1w':
				startDate = moment().startOf('isoWeek');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
			case '1m':
				startDate = moment().startOf('month');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
			case 'custom':
				this.setState({
					numMsgsPercentChange: null,
				});
				break;
			default:
				startDate = moment().startOf('isoWeek');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
		}

		this.setState({
			selectedKey: key,
			anchorEl: null,
			chart: <CircularProgress />,
		});
	};

	handleClose = () => {
		this.setState({ anchorEl: null });
	};

	calcNumMessages() {
		// get # of messages from current day to the last monday. Compare this to

		let now = moment().unix();

		let startDate = null;
		let beforeStartDate = null;
		let nowMinusTimePeriod = null;

		switch (this.state.selectedKey) {
			case '1d':
				startDate = moment()
					.startOf('day')
					.unix();
				beforeStartDate = moment
					.unix(startDate)
					.subtract('1', 'day')
					.unix();
				nowMinusTimePeriod = moment
					.unix(now)
					.subtract('1', 'day')
					.unix();

				break;
			case '1w':
				startDate = moment()
					.startOf('isoWeek')
					.unix();
				beforeStartDate = moment
					.unix(startDate)
					.subtract('1', 'week')
					.unix();
				nowMinusTimePeriod = moment
					.unix(now)
					.subtract('1', 'week')
					.unix();

				break;
			case '1m':
				startDate = moment()
					.startOf('month')
					.unix();
				beforeStartDate = moment
					.unix(startDate)
					.subtract('1', 'month')
					.unix();
				nowMinusTimePeriod = moment
					.unix(now)
					.subtract('1', 'month')
					.unix();

				break;
			case 'custom':
				break;
			default:
				startDate = moment()
					.startOf('isoWeek')
					.unix();
				beforeStartDate = moment
					.unix(startDate)
					.subtract('1', 'week')
					.unix();
				nowMinusTimePeriod = moment
					.unix(now)
					.subtract('1', 'week')
					.unix();
				break;
		}

		getMessages(startDate, now, true)
			.then(response => {
				const numMessagesSentThisTimePeriod = response.data;

				getMessages(beforeStartDate, nowMinusTimePeriod, true)
					.then(response => {
						const numMessagesSentLastTimePeriod = response.data;

						const numMsgsPercentChange = Math.floor(
							((numMessagesSentThisTimePeriod.length -
								numMessagesSentLastTimePeriod.length) /
								numMessagesSentLastTimePeriod.length) *
								100
						);

						this.setState({
							numMsgsPercentChange,
						});
					})
					.catch(err => console.log(err));
			})
			.catch(err => console.log(err));
	}

	onDatesChange = ({ startDate, endDate }) => {
		this.setState({ startDate, endDate, chart: <CircularProgress /> }, () => {
			if (startDate && endDate) {
				if (startDate.isValid() && endDate.isValid()) {
					this.fetchMessages();
				}
			}
		});
	};

	onFocusChange = focusedInput => {
		this.setState({ focusedInput });
	};

	render() {
		let numMessages = <CircularProgress />;
		let numMessagesSent = <CircularProgress />;
		let randomMessage = null;

		const selectedOption = timeSelectOptions.find(
			element => element.key === this.state.selectedKey
		);

		let numMsgsPercentChange = null;
		if (
			this.state.numMsgsPercentChange &&
			isFinite(this.state.numMsgsPercentChange)
		) {
			if (Math.sign(this.state.numMsgsPercentChange) === -1) {
				numMsgsPercentChange = (
					<Typography style={{ color: 'red' }}>
						{this.state.numMsgsPercentChange}% down from{' '}
						{selectedOption['past_text']}
					</Typography>
				);
			} else if (Math.sign(this.state.numMsgsPercentChange) === 0) {
				numMsgsPercentChange = (
					<Typography>
						{this.state.numMsgsPercentChange}% change from{' '}
						{selectedOption['past_text']}
					</Typography>
				);
			} else {
				numMsgsPercentChange = (
					<Typography style={{ color: 'green' }}>
						{this.state.numMsgsPercentChange}% up from{' '}
						{selectedOption['past_text']}
					</Typography>
				);
			}
		}

		if (this.state.numMessagesSent !== null) {
			numMessagesSent = (
				<Typography variant={'h6'}>{this.state.numMessagesSent}</Typography>
			);
		}

		const { anchorEl } = this.state;
		const { classes } = this.props;

		if (!this.state.error && this.props.group) {
			numMessages = this.props.group.messages.count;
		}

		let datePicker = null;

		if (this.state.selectedKey === 'custom') {
			datePicker = (
				<DateRangePicker
					startDate={this.state.startDate} // momentPropTypes.momentObj or null,
					startDateId="your_unique_start_date_id"
					endDate={this.state.endDate} // momentPropTypes.momentObj or null,
					endDateId="your_unique_end_date_id"
					isOutsideRange={() => false}
					onDatesChange={this.onDatesChange}
					focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
					onFocusChange={this.onFocusChange} // PropTypes.func.isRequired,
				/>
			);
		}

		if (this.state.randomMessage && this.props.group) {
			randomMessage = (
				<a
					href={
						'/#/messages?date=' + moment(this.state.randomMessage.created_at)
					}
					className={classes.rowContainer}
				>
					<Message
						message={this.state.randomMessage}
						key={this.state.randomMessage.id}
						group={this.props.group}
					></Message>
				</a>
			);
		}

		return (
			<Grid container spacing={3}>
				<Grid item xs={12} sm={12} md={4} lg={4}>
					<Box boxShadow={2} p={2} align={'center'}>
						<Typography>Message of the Day</Typography>

						{randomMessage}
					</Box>
				</Grid>
				<Grid item xs={12} sm={12} md={4} lg={4}>
					<Box height={150} boxShadow={2} p={2} align={'center'}>
						<Typography>Total Messages Sent:</Typography>
						<Typography variant={'h6'}>{numMessages}</Typography>
					</Box>
				</Grid>
				<Grid item xs={12} sm={12} md={4} lg={4}>
					<Box height={150} boxShadow={2} p={2} align={'center'}>
						<Box display="flex" alignItems="center">
							<Typography>Messages Sent:</Typography>
							<List style={{ padding: 0 }}>
								<ListItem
									style={{ paddingTop: 0, paddingBottom: 0, margin: 0 }}
									button
									onClick={this.handleClickListItem}
								>
									<ListItemText
										style={{ padding: 0, margin: 0 }}
										primary={selectedOption['text']}
									/>
									<ListItemIcon>
										<ExpandMoreIcon />
									</ListItemIcon>
								</ListItem>
							</List>
							<Menu
								id="lock-menu-2"
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={this.handleClose}
							>
								{timeSelectOptions.map((option, index) => {
									return (
										<MenuItem
											className={classes.menuItem}
											key={option.key}
											selected={option.key === this.state.selectedKey}
											onClick={event =>
												this.handleMenuItemClick(event, option.key)
											}
										>
											{option.text}
										</MenuItem>
									);
								})}
							</Menu>
						</Box>
						{numMessagesSent}
						{numMsgsPercentChange}
					</Box>
				</Grid>
				<Grid container item xs={12} alignItems="center">
					<Grid item xs={8} sm={6}>
						{datePicker}
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Box textAlign="center">{this.renderChart()}</Box>
				</Grid>
			</Grid>
		);
	}
}

export default withStyles(styles)(Dashboard);

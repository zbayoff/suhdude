import React, { Component } from 'react';
import axios from 'axios';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Moment from 'react-moment';
import { TimeSeries } from 'pondjs';
import {
	Charts,
	ChartContainer,
	ChartRow,
	YAxis,
	LineChart,
	Resizable,
	styler,
} from 'react-timeseries-charts';

import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';
import moment from 'moment';

import { withStyles } from '@material-ui/core/styles';

import { getMessages } from '../../utils/apiHelper';

import './Dashboard.scss';

const timeSelectOptions = [
	{ key: '1d', text: 'Past 1 day' },
	{ key: '1w', text: 'Past 1 week' },
	{ key: '1m', text: 'Past 1 month' },
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
	};
};

class Dashboard extends Component {
	state = {
		numMessages: 0,
		messages: [],
		startDate: moment().subtract(1, 'd'),
		// .unix(), // set default to 1 days from now
		endDate: moment(),
		anchorEl: null,
		selectedKey: '1d',
		datePickerOpen: false,
		focusedInput: 'startDate',
		selectedUsers: [],
		chart: <CircularProgress />,
		numMsgsPercentChange: null,
		numMessagesSentThisWeek: null,
	};

	componentDidMount() {
		this.fetchMessages();
	}

	fetchMessages() {
		const fromTS = this.state.startDate.unix();
		const toTS = this.state.endDate.unix();

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
				this.setState({ messages: [] });
				this.setState(
					{
						messages: [...this.state.messages, ...messages],
						chart: <CircularProgress />,
					},
					() => {
						this.calcNumMessages();
						this.createChart();
					}
				);
			})
			.catch(err => console.log(err));
	}

	createChart() {
		let messages = this.state.messages;

		let series = new TimeSeries({
			name: 'messages',
			columns: ['time', 'value'],
			utc: false,
			points: messages.map((message, index) => {
				return [moment.unix(message.created_at).valueOf(), index];
			}),
		});

		const style = styler([{ key: 'value', color: '#3f51b5', width: 2 }]);

		const yAxisStyles = {
			label: {
				'font-size': 16,
			},
		};

		const seriesTimerange = series.timerange();

		if (seriesTimerange) {
			this.setState({
				chart: (
					<Resizable>
						<ChartContainer
							titleStyle={{ fill: '#555', fontWeight: 500 }}
							timeRange={seriesTimerange}
						>
							<ChartRow height="300">
								<YAxis
									id="messages"
									label="# messages"
									min={0}
									max={messages.length}
									style={yAxisStyles} // Default label color fontWeight: 100, fontSize: 12, font: '"Goudy Bookletter 1911", sans-serif"' }
									format=".0f"
								/>
								<Charts>
									<LineChart axis="messages" series={series} style={style} />
								</Charts>
							</ChartRow>
						</ChartContainer>
					</Resizable>
				),
			});
		}
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
				startDate = moment().subtract(1, 'day');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
			case '1w':
				startDate = moment().subtract(1, 'week');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
			case '1m':
				startDate = moment().subtract(1, 'month');
				endDate = moment();
				this.onDatesChange({ startDate, endDate });
				break;
			case 'custom':
				break;
			default:
				startDate = moment().subtract(1, 'week');
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

		let startOfWeek = moment()
			.startOf('isoWeek')
			.unix();

		let oneWeekBeforeStartOfWeek = moment
			.unix(startOfWeek)
			.subtract('1', 'week')
			.unix();

		let nowMinusOneWeek = moment
			.unix(now)
			.subtract('1', 'week')
			.unix();

		getMessages(startOfWeek, now, true)
			.then(response => {
				const numMessagesSentThisWeek = response.data;

				getMessages(oneWeekBeforeStartOfWeek, nowMinusOneWeek, true)
					.then(response => {
						const numMessagesSentLastWeek = response.data;

						const numMsgsPercentChange = Math.floor(
							((numMessagesSentThisWeek.length -
								numMessagesSentLastWeek.length) /
								numMessagesSentLastWeek.length) *
								100
						);

						this.setState({
							numMsgsPercentChange,
							numMessagesSentThisWeek: numMessagesSentThisWeek.length,
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
		let numMessagesSentThisWeek = <CircularProgress />;
		let groupName = '';
		let groupStartDate = '';
		let groupStartDateWrapper = <CircularProgress />;

		let numMsgsPercentChange = null;
		if (this.state.numMsgsPercentChange) {
			if (Math.sign(this.state.numMsgsPercentChange) === -1) {
				numMsgsPercentChange = (
					<Typography style={{ color: 'red' }}>
						{this.state.numMsgsPercentChange}% down from last week
					</Typography>
				);
			} else if (Math.sign(this.state.numMsgsPercentChange) === 0) {
				numMsgsPercentChange = (
					<Typography>
						{this.state.numMsgsPercentChange}% change from last week
					</Typography>
				);
			} else {
				numMsgsPercentChange = (
					<Typography style={{ color: 'green' }}>
						{this.state.numMsgsPercentChange}% up from last week
					</Typography>
				);
			}
		}

		if (this.state.numMessagesSentThisWeek) {
			numMessagesSentThisWeek = (
				<Typography variant={'h6'}>
					{this.state.numMessagesSentThisWeek}
				</Typography>
			);
		}

		const { anchorEl } = this.state;
		const { classes } = this.props;

		if (!this.state.error && this.props.group) {
			numMessages = this.props.group.messages.count;
			groupName = this.props.group.name;
			groupStartDate = new Date(this.props.group.created_at);
			groupStartDateWrapper = (
				<Moment unix date={groupStartDate} format="MMM D, YYYY LT" />
			);
		}

		const selectedOption = timeSelectOptions.find(
			element => element.key === this.state.selectedKey
		);

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

		return (
			<Grid container spacing={3}>
				<Grid item xs={12} sm={12} md={4} lg={3}>
					<Box height={150} boxShadow={2} p={2} align={'center'}>
						<Typography>{groupName} start date: </Typography>
						<Typography variant={'h6'}>{groupStartDateWrapper}</Typography>
					</Box>
				</Grid>
				<Grid item xs={12} sm={12} md={4} lg={3}>
					<Box height={150} boxShadow={2} p={2} align={'center'}>
						<Typography>Total Messages Sent:</Typography>
						<Typography variant={'h6'}>{numMessages}</Typography>
					</Box>
				</Grid>
				<Grid item xs={12} sm={12} md={4} lg={3}>
					<Box height={150} boxShadow={2} p={2} align={'center'}>
						<Typography>Messages Sent This Week</Typography>
						{numMessagesSentThisWeek}
						{numMsgsPercentChange}
					</Box>
				</Grid>
				<Grid container item xs={12} alignItems="center">
					<Grid item xs={4} sm={3}>
						<Box>
							<List>
								<ListItem button onClick={this.handleClickListItem}>
									<ListItemText primary={selectedOption['text']} />
								</ListItem>
							</List>
							<Menu
								id="lock-menu"
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
					</Grid>
					<Grid item xs={8} sm={6}>
						{datePicker}
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Box textAlign="center">{this.state.chart}</Box>
				</Grid>
			</Grid>
		);
	}
}

export default withStyles(styles)(Dashboard);

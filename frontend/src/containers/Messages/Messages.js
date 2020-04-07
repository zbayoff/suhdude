import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import moment from 'moment';
import { SingleDatePicker } from 'react-dates';
import queryString from 'query-string';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import { Typography, CircularProgress } from '@material-ui/core';

import Message from '../../components/Messages/Message/Message';

import './Messages.scss';

const WAIT_INTERVAL = 1000;
const ENTER_KEY = 13;

const styles = theme => {
	return {
		formField: {
			width: '100%',
			paddingLeft: '0',
			paddingRight: '0',
			marginTop: '10px',
			marginBottom: '10px',

			[theme.breakpoints.up('sm')]: {
				width: 'auto',
				paddingLeft: '10px',
				paddingRight: '10px',
			},
			[theme.breakpoints.up('md')]: {
				width: '100%',
				paddingLeft: '0',
				paddingRight: '0',
				marginTop: '10px',
				marginBottom: '10px',
			},
		},
	};
};

class Messages extends Component {
	state = {
		messages: [],
		detailMessages: [],
		selectedUser: ['all'],
		searchText: null,
		selectedPopularity: 'none',
		startDate: null,
		endDate: moment(),
		detailMessageID: null,
		favorited: false,
		sort: 'desc',
		beforeDate: null,
		skip: 0,
		open: false,
		loadingMessages: true,
	};

	timer = null;

	messageLimit = 50;

	componentDidMount() {
		let params = queryString.parse(this.props.location.search);
		if (params.date) {
			this.setState(
				{
					endDate: moment.unix(params.date).endOf('day'),
				},
				() => {
					this.fetchMessages();
				}
			);
		} else {
			this.fetchMessages();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		// need to check if state has changed.
		if (
			JSON.stringify(prevState.messages) !== JSON.stringify(this.state.messages)
		) {
			if (this.scrollAtBottom && this.state.favorited === false) {
				this.scrollToBottom();
			}
			if (this.topMessage && this.state.favorited === false) {
				ReactDOM.findDOMNode(this.topMessage).scrollIntoView();
			}
		}
	}

	getSnapshotBeforeUpdate(prevProps, prevState) {
		const { messageList } = this.refs;

		const scrollPos = messageList.scrollTop;
		const scrollBottom = messageList.scrollHeight - messageList.clientHeight;

		this.scrollAtBottom = scrollBottom <= 0 || scrollPos === scrollBottom;

		if (!this.scrollAtBottom) {
			const numMessages = messageList.childNodes.length;

			this.topMessage = numMessages === 0 ? null : messageList.childNodes[0];
			return this.topMessage;
		}

		if (this.topMessage && this.state.favorited === false) {
			ReactDOM.findDOMNode(this.topMessage).scrollIntoView();
		}

		return null;
	}

	fetchMessages = () => {
		let fromTS = this.state.startDate;
		let toTS = this.state.endDate;
		let beforeTS = this.state.beforeDate;
		let skip = this.state.skip;

		if (fromTS && toTS) {
			fromTS = fromTS.unix();
			toTS = toTS.unix();
		} else if (toTS) {
			toTS = toTS.unix();
		}

		if (beforeTS) {
			beforeTS = beforeTS.unix();
		}

		this.setState({ loadingMessages: true });

		axios
			.get('/api/messages', {
				params: {
					sort: this.state.sort,
					limit: this.messageLimit,
					userIDs: this.state.selectedUser,
					text: this.state.searchText,
					favorited: this.state.favorited,
					fromTS: fromTS,
					detailMessage: false,
					toTS: toTS,
					beforeTS: beforeTS,
					dashboard: false,
					skip: skip,
				},
			})
			.then(response => {
				const messages = response.data;

				if (this.state.messages.length && this.state.favorited !== true) {
					if (messages.length) {
						this.setState(prevState => ({
							messages: [...messages, ...prevState.messages],
							beforeDate: moment.unix(messages[0].created_at),
						}));
					}

					// keep scroll position
				} else if (this.state.favorited === true) {
					if (messages.length) {
						skip += this.messageLimit;
						this.setState(prevState => ({
							messages: [...prevState.messages, ...messages],
							skip,
						}));
					}
				} else {
					if (messages.length) {
						this.setState({
							messages,
							beforeDate: moment.unix(messages[0].created_at),
						});
					}

					if (this.state.favorited === false) {
						this.scrollToBottom();
					}
				}

				this.setState({ loadingMessages: false });
			})
			.catch(err => console.log(err));
	};

	fetchDetailMessages = () => {
		let fromTS = this.state.startDate;
		let toTS = this.state.endDate;

		if (fromTS && toTS) {
			fromTS = fromTS.unix();
			toTS = toTS.unix();
		} else if (toTS) {
			toTS = toTS.unix();
		}

		axios
			.get('/api/messages', {
				params: {
					limit: 60,
					favorited: false,
					fromTS: fromTS,
					toTS: toTS,
					detailMessageID: this.state.detailMessageID,
					detailMessage: true,
					dashboard: false,
				},
			})
			.then(response => {
				const detailMessages = response.data;

				this.setState(
					{
						detailMessages,
					},
					() => {
						const { detailMessageList } = this.refs;
						if (detailMessageList) {
							detailMessageList
								.querySelector(`li[data-key="${this.state.detailMessageID}"]`)
								.scrollIntoView();
						}
					}
				);
			})
			.catch(err => console.log(err));
	};

	onScroll = () => {
		const { messageList } = this.refs;

		const scrollTop = messageList.scrollTop;
		const scrollPos = messageList.scrollTop;
		const scrollBottom = messageList.scrollHeight - messageList.clientHeight;

		this.scrollAtBottom = scrollBottom <= 0 || scrollPos === scrollBottom;

		if (
			scrollTop === 0 &&
			this.state.messages.length &&
			this.state.favorited === false
		) {
			this.fetchMessages();
		} else if (
			this.state.favorited === true &&
			this.state.messages.length &&
			this.scrollAtBottom === true
		) {
			if (!this.state.loadingMessages) {
				this.fetchMessages();
			}
		}
	};

	scrollToBottom = () => {
		const { messageList } = this.refs;
		const scrollHeight = messageList.scrollHeight;
		const height = messageList.clientHeight;
		const maxScrollTop = scrollHeight - height;
		ReactDOM.findDOMNode(messageList).scrollTop =
			maxScrollTop > 0 ? maxScrollTop : 0;
	};

	handleUserChange = event => {
		this.setState(
			{
				beforeDate: null,
				messages: [],
				selectedUser: [event.target.value],
				skip: 0,
			},
			() => {
				this.fetchMessages();
			}
		);
	};

	textSearchKeyDownHandler = event => {
		this.setState({ loadingMessages: true });
		if (event.keyCode === ENTER_KEY) {
			clearTimeout(this.timer);
			this.triggerChange();
		}
	};

	textSearchChangeHandler = event => {
		clearTimeout(this.timer);

		this.setState({
			searchText: [event.target.value],
			messages: [],
			beforeDate: null,
		});

		this.timer = setTimeout(this.fetchMessages, WAIT_INTERVAL);
	};

	popularityChangeHandler = event => {
		let startDate = null;
		let endDate = null;
		let beforeDate = null;
		let favorited = this.state.favorited;

		switch (event.target.value) {
			case 'none':
				startDate = null;
				beforeDate = null;
				endDate = moment();
				favorited = false;
				break;
			case '1d':
				startDate = moment().subtract(1, 'day');
				endDate = moment();
				favorited = true;
				break;
			case '1w':
				startDate = moment().subtract(1, 'week');
				endDate = moment();
				favorited = true;
				break;
			case '1m':
				startDate = moment().subtract(1, 'month');
				endDate = moment();
				favorited = true;
				break;
			case '1y':
				startDate = moment().subtract(1, 'year');
				endDate = moment();
				favorited = true;
				break;
			case '2016':
				startDate = moment.unix(1452100025);
				endDate = moment('2016-12-31');
				favorited = true;
				break;
			case '2017':
				startDate = moment('2017-01-01');
				endDate = moment('2017-12-31');
				favorited = true;
				break;
			case '2018':
				startDate = moment('2018-01-01');
				endDate = moment('2018-12-31');
				favorited = true;
				break;
			case '2019':
				startDate = moment('2019-01-01');
				endDate = moment('2019-12-31');
				favorited = true;
				break;
			case 'all':
				startDate = moment.unix(this.props.group.created_at);
				endDate = moment();
				favorited = true;
				break;
			default:
				startDate = moment().subtract(1, 'week');
				endDate = moment();
				favorited = true;
				break;
		}

		this.setState(
			{
				selectedPopularity: event.target.value,
				favorited: favorited,
				startDate,
				endDate,
				beforeDate,
				messages: [],
				skip: 0,
			},
			() => {
				this.fetchMessages();
			}
		);
	};

	sortChangeHandler = event => {
		let sort = this.state.sort;
		switch (event.target.value) {
			case 'asc':
				sort = 'asc';
				break;

			case 'desc':
				sort = 'desc';
				break;

			default:
				sort = 'desc';
				break;
		}

		this.setState(
			{
				sort: sort,
			},
			() => {
				this.fetchMessages();
			}
		);
	};

	isMessageWithinNTime(firstMessageTime, secondMessageTime, time) {
		let isMessageWithinNTime = false;

		if (
			moment
				.unix(firstMessageTime)
				.isAfter(moment.unix(secondMessageTime).add(time, 'minutes'))
		) {
			isMessageWithinNTime = false;
		} else {
			isMessageWithinNTime = true;
		}
		// }

		return isMessageWithinNTime;
	}

	onDatesChange = date => {
		if (date) {
			if (date.isValid()) {
				this.setState(
					{
						endDate: moment(date).endOf('day'),
						messages: [],
						beforeDate: null,
					},
					() => {
						// if (startDate && endDate) {

						this.fetchMessages();
						this.scrollToBottom();
						// }
					}
				);
			}
		}
	};

	messageClickHandler = (message, data) => {
		this.handleClickOpen();
		const monthBeforeMessage = moment
			.unix(message.created_at)
			.subtract('1', 'day');
		const monthAfterMessage = moment.unix(message.created_at).add('1', 'day');
		this.setState(
			{
				startDate: monthBeforeMessage,
				endDate: monthAfterMessage,
				detailMessageID: message.id,
			},
			() => {
				this.fetchDetailMessages();
			}
		);
	};

	handleClose = () => {
		this.setState({
			open: false,
			detailMessages: [],
		});
	};

	handleClickOpen = () => {
		this.setState({
			open: true,
		});
	};

	createMessagesArray = messagesArray => {
		let messagesMap = null;
		let attachments = null;
		let messageTime = false;

		messagesMap = messagesArray.map((message, index, msgsArray) => {
			// build dynamic display based on attachments
			if (message.attachments) {
				attachments = message.attachments.map(attachment => {
					let jsx = [];
					if (attachment.type === 'image') {
						jsx.push(
							<Box maxWidth={300} key={message.id}>
								<img
									src={attachment.url}
									className=""
									width={'100%'}
									alt="attachment"
								/>
							</Box>
						);
					}

					return jsx;
				});
			}

			if (index === 0) {
				messageTime = true;
			} else if (
				this.isMessageWithinNTime(
					message.created_at,
					msgsArray[index - 1]['created_at'],
					2
				)
			) {
				messageTime = false;
			} else {
				messageTime = true;
			}

			// if first item in array, display current time.
			// check next message, if sent after N minutes, display the message time.
			return (
				<Message
					clickHandler={event => this.messageClickHandler(message)}
					displayMessageTime={messageTime}
					message={message}
					attachments={attachments}
					key={message.id}
					group={this.props.group}
				></Message>
			);
		});

		return messagesMap;
	};

	render() {
		const { classes } = this.props;

		let messagesMap = null;
		let detailMessagesMap = null;
		let loadingMessages = null;
		let usersSelect = null;

		if (!this.state.error && this.state.messages) {
			messagesMap = this.createMessagesArray(this.state.messages);

			if (this.state.messages.length) {
				if (this.state.loadingMessages) {
					loadingMessages = (
						<Box display="flex" justifyContent="center" alignItems="center">
							<CircularProgress />
						</Box>
					);
				}
			} else {
				if (this.state.loadingMessages) {
					loadingMessages = (
						<Box display="flex" justifyContent="center" alignItems="center">
							<CircularProgress />
						</Box>
					);
				} else {
					messagesMap = <Typography>No messages found.</Typography>;
				}
			}
		}

		if (!this.state.error && this.state.detailMessages) {
			detailMessagesMap = this.createMessagesArray(this.state.detailMessages);
		}

		if (this.props.group) {
			let allUserIDs = [];
			let userOption = this.props.group.members.map(user => {
				allUserIDs.push(user.user_id);
				return (
					<MenuItem value={user.user_id} key={user.user_id}>
						{user.nickname}
					</MenuItem>
				);
			});

			usersSelect = (
				<FormControl className={classes.formField}>
					<Select
						value={this.state.selectedUser}
						onChange={this.handleUserChange}
					>
						<MenuItem value={'all'}>All Users</MenuItem>
						{userOption}
					</Select>
					<FormHelperText>Messages by user</FormHelperText>
				</FormControl>
			);
		}

		return (
			<>
				<Grid container spacing={3}>
					<Grid item xs={12} md={4}>
						<Box boxShadow={2} p={2} position={'relative'}>
							<Box pb={1}>
								<Typography variant="h6">Filters</Typography>
							</Box>
							<TextField
								className={classes.formField}
								id="input-with-icon-textfield"
								// label="Search message content"
								helperText="Search message content"
								onChange={this.textSearchChangeHandler}
								onKeyDown={this.textSearchKeyDownHandler}
								disabled={this.state.favorited ? true : false}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									),
								}}
							/>
							{usersSelect}
							<FormControl className={classes.formField}>
								<Select
									value={this.state.selectedPopularity}
									onChange={this.popularityChangeHandler}
									// displayEmpty
									// className={classes.selectEmpty}
								>
									<MenuItem value={'none'}>None</MenuItem>
									<MenuItem value={'1d'}>Today</MenuItem>
									<MenuItem value={'1w'}>This Week</MenuItem>
									<MenuItem value={'1m'}>This Month</MenuItem>
									<MenuItem value={'1y'}>This Year</MenuItem>
									<MenuItem value={'2019'}>2019</MenuItem>
									<MenuItem value={'2018'}>2018</MenuItem>
									<MenuItem value={'2017'}>2017</MenuItem>
									<MenuItem value={'2016'}>2016</MenuItem>
									<MenuItem value={'all'}>All Time</MenuItem>
								</Select>
								<FormHelperText>Messages by popularity</FormHelperText>
							</FormControl>
							<FormControl className={classes.formField}>
								<SingleDatePicker
									date={this.state.endDate}
									onDateChange={this.onDatesChange}
									isOutsideRange={() => false}
									focused={this.state.focused} // PropTypes.bool
									placeholder={moment().format('MM/DD/YYYY')}
									onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
									id="your_unique_id" // PropTypes.string.isRequired,
								/>
								<FormHelperText>Messages by date</FormHelperText>
							</FormControl>
						</Box>
					</Grid>
					<Grid item xs={12} md={8}>
						<Box boxShadow={2} overflow="auto" p={2} position={'relative'}>
							<Box pb={1}>
								<Typography variant="h6">Messages</Typography>
							</Box>
							{this.state.favorited ? null : loadingMessages}
							<List
								ref="messageList"
								onScroll={this.onScroll}
								style={{
									overflowY: 'scroll',
									overflowX: 'hidden',
									height: '500px',
								}}
							>
								{messagesMap}
							</List>
							{this.state.favorited ? loadingMessages : null}
						</Box>
					</Grid>
				</Grid>
				<Dialog
					onClose={this.handleClose}
					aria-labelledby="simple-dialog-title"
					open={this.state.open}
				>
					<DialogTitle id="simple-dialog-title">Messages Detail</DialogTitle>
					<List
						ref="detailMessageList"
						style={{ overflowY: 'scroll', height: '500px' }}
					>
						{detailMessagesMap}
					</List>
				</Dialog>
			</>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Messages);

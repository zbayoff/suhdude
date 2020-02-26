import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import moment from 'moment';
// import Button from '@material-ui/core/Button';
// import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import { SingleDatePicker } from 'react-dates';

import Message from '../../components/Messages/Message/Message';

import './Messages.scss';
import { Typography } from '@material-ui/core';

const WAIT_INTERVAL = 1000;
const ENTER_KEY = 13;

class Messages extends Component {
	state = {
		messages: [],
		selectedUser: ['all'],
		searchText: null,
		selectedPopularity: 'none',
		startDate: null,
		endDate: moment(),
		favorited: false,
		sort: 'desc',
		beforeDate: null,
		skip: 0,
	};

	timer = null;

	messageLimit = 50;

	componentDidMount() {
		console.log('[Messages.js] - ComponentDidMount');
		this.updatedMessages()
			.then(() => {
				console.log('updateMessages successfully');
				this.addMessages()
					.then(() => {
						console.log('addedMessages successfully');
						this.fetchMessages();
					})
					.catch(err => {
						console.log(err);
					});
			})
			.catch(err => {
				console.log(err);
			});
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('[Messages.js] - ComponentDidUpdate');

		if (this.scrollAtBottom && this.state.favorited === false) {
			this.scrollToBottom();
		}
		if (this.topMessage) {
			ReactDOM.findDOMNode(this.topMessage).scrollIntoView();
		}
	}

	getSnapshotBeforeUpdate(prevProps, prevState) {
		console.log('[Messages.js] - getSnapshotBeforeUpdate');

		const { messageList } = this.refs;

		const scrollPos = messageList.scrollTop;
		const scrollBottom = messageList.scrollHeight - messageList.clientHeight;

		this.scrollAtBottom = scrollBottom <= 0 || scrollPos === scrollBottom;

		if (!this.scrollAtBottom) {
			const numMessages = messageList.childNodes.length;
			this.topMessage = numMessages === 0 ? null : messageList.childNodes[0];
			return this.topMessage;
		}
		if (this.topMessage) {
			ReactDOM.findDOMNode(this.topMessage).scrollIntoView();
		}

		return null;
	}

	updatedMessages() {
		// console.log('updateAndAddMessages');
		return axios
			.get('http://localhost:8080/api/updateMessages/18834987?num=200')
			.then(response => {
				console.log('updateMessages response: ', response);
			})
			.catch(err => console.log(err));
	}

	addMessages() {
		return axios
			.get('http://localhost:8080/api/addMessages/18834987')
			.then(response => {
				console.log('addMessages repspone: ', response);
			})
			.catch(err => console.log(err));
	}

	fetchMessages = () => {
		console.log('fetchMessages');

		let fromTS = this.state.startDate;
		let toTS = this.state.endDate;
		let beforeTS = this.state.beforeDate;

		if (fromTS && toTS) {
			fromTS = fromTS.unix();
			toTS = toTS.unix();
		} else if (toTS) {
			toTS = toTS.unix();
		}

		if (beforeTS) {
			beforeTS = beforeTS.unix();
		}

		// console.log('beforeTS: ', beforeTS);

		// console.log('fromTS', fromTS)
		// console.log('toTS', toTS)

		axios
			.get('http://localhost:8080/api/messages', {
				params: {
					sort: this.state.sort,
					limit: this.messageLimit,
					userIDs: this.state.selectedUser,
					text: this.state.searchText,
					favorited: this.state.favorited,
					fromTS: fromTS,
					toTS: toTS,
					beforeTS: beforeTS,
					dashboard: false,
					skip: this.state.skip,
				},
			})
			.then(response => {
				const messages = response.data;
				let skip = this.state.skip;

				// console.log('this.state.favorited: ', this.state.favorited);

				// initially fetching messages?
				if (this.state.messages.length && this.state.favorited !== true) {
					// this.setState({ messages: [...this.state.messages, ...messages] });
					if (messages.length) {
						this.setState(prevState => ({
							messages: [...messages, ...prevState.messages],
							beforeDate: moment.unix(messages[0].created_at),
						}));
						// this.scrollToBottom();
					}

					// keep scroll position
				} else if (this.state.favorited === true) {
					// console.log('favorited true');
					if (messages.length) {
						this.setState(prevState => ({
							messages: [...prevState.messages, ...messages],
							skip: skip + this.messageLimit,
						}));
					}
				} else {
					if (messages.length) {
						this.setState({
							messages,
							beforeDate: moment.unix(messages[0].created_at),
						});
					}

					// console.log('calling this.scrollBottom');
					if (this.state.favorited === false) {
						this.scrollToBottom();
					}
				}

				// console.log('this.state.messages', this.state.messages);

				// this.setState({
				// 	beforeDate: moment.unix(messages[0].created_at),
				// });

				// console.log('this.state.startDate: ', this.state.startDate);
				// console.log('this.state.endDate: ', this.state.endDate);
				// console.log('messages[0] text', messages[0].text)
				// console.log('messages[0]', messages[0].created_at)

				// console.log('messages[messages.length - 1] text', messages[messages.length - 1].text)
				// console.log('messages[messages.length - 1]', messages[messages.length - 1].created_at)
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
			this.fetchMessages();
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

		// if (this.state.sort === 'desc') {
		// 	if (
		// 		moment
		// 			.unix(secondMessageTime)
		// 			.isAfter(moment.unix(firstMessageTime).add(time, 'minutes'))
		// 	) {
		// 		isMessageWithinNTime = false;
		// 	} else {
		// 		isMessageWithinNTime = true;
		// 	}
		// } else {
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
		console.log('date: ', date);

		this.setState(
			{
				endDate: date,
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

		// this.setState({ startDate, endDate }, () => {
		// 	if (startDate && endDate) {
		// 		this.fetchMessages();
		// 	}
		// });
	};

	messageClickHandler = (message) => {
		console.log('message: ', message);
	}

	render() {
		console.log('[Messages.js] - render');

		let messagesMap = null;
		let attachments = null;
		let usersSelect = null;
		let messageTime = false;

		// console.log('this.state.favorited', this.state.favorited);

		if (!this.state.error && this.state.messages) {
			messagesMap = this.state.messages.map((message, index, messagesArray) => {
				// build dynamic display based on attachments
				if (message.attachments) {
					attachments = message.attachments.map(attachment => {
						let jsx = [];
						// console.log('attachment.type: ', attachment.type);
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

						// replace the "@name" with a link to the user's page.
						// if (attachment.type === "mentions") {
						// 	let attachment.user_ids.map((userid) => {
						// 		return
						// 	})

						// }

						return jsx;
					});
				}

				if (index === 0) {
					messageTime = true;
				} else if (
					this.isMessageWithinNTime(
						message.created_at,
						messagesArray[index - 1]['created_at'],
						5
					)
				) {
					messageTime = false;
				} else {
					messageTime = true;
				}

				// console.log('messageTime: ', messageTime)
				// if first item in array, display current time.
				// check next message, if sent after N minutes, display the message time.
				return (
					// <Grid item xs={12} key={message.id}>
					<Message
						clickHandler={() => this.messageClickHandler(message)}
						displayMessageTime={messageTime}
						message={message}
						attachments={attachments}
						key={message.id}
						group={this.props.group}
					></Message>
					// </Grid>
				);
			});
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
				<FormControl>
					<Select
						value={this.state.selectedUser}
						onChange={this.handleUserChange}
						// displayEmpty
						// className={classes.selectEmpty}
					>
						<MenuItem value={'all'}>All Users</MenuItem>
						{userOption}
					</Select>
					<FormHelperText>Users</FormHelperText>
				</FormControl>
			);
		}

		return (
			<Grid container spacing={3}>
				<Grid item xs={3}>
					<Box
						boxShadow={2}
						// height={500}
						// overflow="scroll"
						p={2}
						position={'relative'}
					>
						<Typography variant="h4">Filters</Typography>
						<TextField
							id="input-with-icon-textfield"
							label="TextField"
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
						<FormControl>
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
								<MenuItem value={'all'}>All Time</MenuItem>
							</Select>
							<FormHelperText>Popularity</FormHelperText>
						</FormControl>
						<SingleDatePicker
							date={this.state.endDate} // momentPropTypes.momentObj or null
							// onDateChange={date => this.setState({ date })} // PropTypes.func.isRequired
							onDateChange={this.onDatesChange}
							isOutsideRange={() => false}
							focused={this.state.focused} // PropTypes.bool
							placeholder={moment().format('MM/DD/YYYY')}
							// monthFormat="MMMM YYYY"
							// initialDate={Fri Feb 28 2020 22:47:04 GMT-0500}
							onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
							id="your_unique_id" // PropTypes.string.isRequired,
						/>
						{/* <FormControl>
							<Select
								value={this.state.sort}
								onChange={this.sortChangeHandler}
								disabled={this.state.favorited ? true : false}
								// displayEmpty
								// className={classes.selectEmpty}
							>
								<MenuItem value={'asc'}>Oldest</MenuItem>
								<MenuItem value={'desc'}>Newest</MenuItem>
							</Select>
							<FormHelperText>Sort</FormHelperText>
						</FormControl> */}
					</Box>
				</Grid>
				<Grid item xs={9}>
					<Box
						boxShadow={2}
						overflow="scroll"
						p={2}
						position={'relative'}
						style={{ overflowY: 'scroll' }}
					>
						<Typography variant="h4">Messages</Typography>
						{/* <button onClick={this.fetchMessages}>Fetch earlier Messages</button> */}
						<List
							ref="messageList"
							onScroll={this.onScroll}
							style={{ overflowY: 'scroll', height: '500px' }}
						>
							{messagesMap}
						</List>
						{/* <button onClick={this.fetchMessages}>Fetch earlier Messages</button> */}
					</Box>
				</Grid>
			</Grid>
		);
	}
}

export default Messages;

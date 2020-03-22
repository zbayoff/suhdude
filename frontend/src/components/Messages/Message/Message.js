import React, { Component } from 'react';
import moment from 'moment';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Linkify from 'linkifyjs/react';

const HtmlTooltip = withStyles(theme => ({
	tooltip: {
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#f5f5f9',
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(12),
		border: '1px solid #dadde9',
	},
}))(Tooltip);

class Message extends Component {
	state = {
		favoritedUsers: '',
	};

	getUserInfo = userId => {
		const users = this.props.group.members;

		const userInfo = users.find(user => {
			return user.user_id === userId;
		});

		return userInfo;
	};

	hoverFavoritedMessageHandler = event => {
		let favoritedBy = [];
		if (this.props.message.favorited_by) {
			favoritedBy = this.props.message.favorited_by.map(user => {
				return (
					<p style={{ margin: '0' }} key={user}>
						{this.getUserInfo(user)['nickname']}
					</p>
				);
			});
			this.setState({ favoritedUsers: favoritedBy });
		}
	};

	messageClickHandler = data => {
		this.props.messageClickHandler(data);
	};

	render() {
		let likedMessageIcon = <FavoriteBorderIcon />;
		let favoritedUsers = '';
		let attachment = null;
		let messageText = null;

		if (this.props.message.text) {
			if (this.props.message.text.includes('.gif')) {
				messageText = (
					<img
						style={{ width: '100%', maxWidth: '300px' }}
						alt="gif"
						src={this.props.message.text}
					></img>
				);
			} else {
				messageText = <Linkify>{this.props.message.text}</Linkify>;
			}
		}

		if (this.props.attachments) {
			attachment = this.props.attachments;
		}

		if (this.state.favoritedUsers) {
			favoritedUsers = this.state.favoritedUsers;
		}

		if (this.props.message.favorited_by.length) {
			likedMessageIcon = (
				<HtmlTooltip title={<React.Fragment>{favoritedUsers}</React.Fragment>}>
					<Badge
						onMouseEnter={this.hoverFavoritedMessageHandler}
						badgeContent={this.props.message.favorited_by.length}
						color="primary"
					>
						<FavoriteIcon />
					</Badge>
				</HtmlTooltip>
			);
		}

		let avatar = null;

		if (
			this.props.message.user_id === 'system' ||
			this.props.message.user_id === 'calendar'
		) {
			avatar = (
				<ListItemAvatar>
					<Avatar alt="System" src="" />
				</ListItemAvatar>
			);
		} else {
			avatar = (
				<ListItemAvatar>
					<Avatar
						alt={this.props.message.name}
						src={this.getUserInfo(this.props.message.user_id)['image_url']}
					/>
				</ListItemAvatar>
			);
		}

		let messageTime = null;

		if (this.props.displayMessageTime) {
			let format = '';

			// first check if same year

			if (moment.unix(this.props.message.created_at).isSame(moment(), 'day')) {
				format = 'HH:mm';
			} else if (
				moment.unix(this.props.message.created_at).isSame(moment(), 'week')
			) {
				format = 'ddd, HH:mm';
			} else if (
				moment.unix(this.props.message.created_at).isSame(moment(), 'month')
			) {
				format = 'MMM D, HH:mm';
			} else if (
				moment.unix(this.props.message.created_at).isSame(moment(), 'year')
			) {
				format = 'MMM D, HH:mm';
			} else {
				format = 'MMM D, YYYY [at] HH:mm';
			}

			// check if current year

			// check if current month

			messageTime = (
				<Typography
					align={'center'}
					style={{ position: 'absolute', width: '100%', top: '-10px' }}
				>
					{moment.unix(this.props.message.created_at).format(format)}
				</Typography>
			);
		}

		return (
			<ListItem
				key={this.props.message.id}
				data-key={this.props.message.id}
				alignItems="flex-start"
				style={{ paddingTop: '12px', paddingBottom: '12px', cursor: 'pointer' }}
				onClick={this.props.clickHandler}
			>
				{messageTime}
				{avatar}

				{/* How to handle messages sent by system? */}

				{/* if message contains an external link, wrap in an iframe like <iframe src="https://en.wikipedia.org/" width = "500px" height = "500px"></iframe>  */}

				<ListItemText
					primary={
						<Typography variant={'body2'}>{this.props.message.name}</Typography>
					}
					secondary={
						<Typography
							component={'div'}
							variant={'body1'}
							style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
						>
							{attachment}
							{messageText}
						</Typography>
					}
				/>

				{likedMessageIcon}
			</ListItem>
		);
	}
}

export default Message;

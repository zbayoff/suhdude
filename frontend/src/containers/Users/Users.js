import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';

import User from '../../components/User/User';

import { fetchUsers } from '../../store/actions/users';

class Users extends Component {
	state = {
		open: false,
		selectedUser: null,
	};

	componentDidMount() {
		this.props.onFetchUsers();
	}

	handleClickOpen = () => {
		this.setState({
			open: true,
		});
	};

	handleClose = () => {
		this.setState({ open: false });
	};

	userClickHandler = user => {
		this.handleClickOpen();
		this.setState({ selectedUser: user });
	};

	render() {
		let userMap = null;
		let selectedUser = null;

		if (this.state.selectedUser) {
			const nicknames = this.state.selectedUser.distinctNicknames.map(
				(nickname, index) => {
					return <span key={index}>{nickname} * </span>;
				}
			);
			selectedUser = <Box>{nicknames}</Box>;
		}

		if (this.props.users) {
			let users = this.props.users;
			userMap = users.map(user => {
				return (
					<User
						user={user}
						key={user.user_id}
						clickHandler={() => this.userClickHandler(user)}
					></User>
				);
			});
		}
		return (
			<>
				<Box pb={2}>
					<Typography variant="h6" align="center">
						Users
					</Typography>
				</Box>
				<Container>
					<Grid container spacing={3}>
						{userMap}
					</Grid>
				</Container>
				<Dialog
					open={this.state.open}
					onClose={this.handleClose}
					aria-labelledby="simple-dialog-title"
				>
					<DialogTitle id="simple-dialog-title">Known Aliases: </DialogTitle>
					<DialogContent dividers>{selectedUser}</DialogContent>
				</Dialog>
			</>
		);
	}
}

const mapStateToProps = state => {
	return {
		users: state.users.users,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		onFetchUsers: () => dispatch(fetchUsers()),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);

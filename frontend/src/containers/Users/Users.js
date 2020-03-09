import React, { Component } from 'react';
import axios from 'axios';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import { Typography } from '@material-ui/core';

import User from '../../components/User/User';

class Users extends Component {
	state = {
		users: [],
		open: false,
		selectedUser: null,
	};

	componentDidMount() {
		console.log('[Users.js] - ComponentDidMount');
		axios
			.get('http://localhost:8080/api/users')
			.then(response => {
				const users = response.data;
				this.setState({ users: [...users] });
			})
			.catch(err => console.log(err));
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

		if (this.state.users) {
			let users = this.state.users;
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

		console.log('[User.js] - render');
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

export default Users;

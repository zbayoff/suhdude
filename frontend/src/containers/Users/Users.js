import React, { Component } from 'react';
import axios from 'axios';
// import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';

class Users extends Component {
	state = {
		users: [],
	};

	componentDidMount() {
		console.log('[User.js] - ComponentDidMount');
		axios
			.get('http://localhost:8080/groupmeApi/group/18834987')
			.then(response => {
				const users = response.data.members;
				this.setState({ users });
			})
			.catch(err => console.log(err));
	}
	render() {
		let users = <p style={{ textAlign: 'center' }}>Something went wrong!</p>;
		if (!this.state.error) {
			users = this.state.users;
		}

		const userMap = users.map(user => {
			return (
				<Grid item xs={3} key={user.user_id}>
					<Card>
						<CardMedia
							component="img"
							alt=""
							height="140"
							image={user.image_url}
							title=""
						/>
						<p>{user.nickname}</p>
						<p>({user.name})</p>
					</Card>
				</Grid>
			);
		});
		console.log('[User.js] - render');
		return (
			<Grid container spacing={3}>
				{userMap}
			</Grid>
		);
	}
}

export default Users;

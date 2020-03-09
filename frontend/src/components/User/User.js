import React, { Component } from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => {
	return {
		user: {
			'&:hover': {
				boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12);'
			}
		},
	};
};

class User extends Component {
	state = {
		open: false,
	};

	componentDidMount() {
		console.log('[User.js] - ComponentDidMount');
	}

	userClickHandler = user => {
		this.props.userClickHandler(user);
	};

	render() {
		const { classes } = this.props;

		
		let user = null;
		let notificationsIcon = null;

		if (!this.state.error && this.props.user) {
			user = this.props.user;
			if (user.muted) {
				notificationsIcon = <NotificationsOffIcon />;
			}
		}

		return (
			<>
				<Grid item xs={6} sm={6} md={3} lg={3}>
					<Paper align="center" className={classes.user}>
						<Box
							p={2}
							height={180}
							position={'relative'}
							onClick={this.props.clickHandler}
							style={{ cursor: 'pointer' }}
						>
							<span
								style={{ position: 'absolute', top: '10px', right: '10px' }}
							>
								{notificationsIcon}
							</span>

							<Avatar
								alt="Remy Sharp"
								src={user.image_url}
								style={{ width: '60px', height: '60px' }}
							/>
							<p>
								{user.nickname}
								<br></br>({user.name})
							</p>
						</Box>
					</Paper>
				</Grid>
			</>
		);
	}
}

export default withStyles(styles, { withTheme: true })(User);

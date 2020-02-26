import React, { Component } from 'react';
import { Route } from 'react-router-dom';
// import Grid from '@material-ui/core/Grid';
// import Container from '@material-ui/core/Container';
// import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';

import Typography from '@material-ui/core/Typography';
import { NavLink } from 'react-router-dom';
// import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
// import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import axios from 'axios';

import './App.scss';

// import Navbar from './components/Layouts/Navigation/Navbar/Navbar';
import Users from './containers/Users/Users';
import Messages from './containers/Messages/Messages';
import Dashboard from './containers/Dashboard/Dashboard';

import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
// import ListItemText from '@material-ui/core/ListItemText';
// import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import HomeIcon from '@material-ui/icons/Home';
import GroupIcon from '@material-ui/icons/Group';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';

const drawerWidth = 240;

const styles = theme => {
	return {
		root: {
			display: 'flex',
		},
		appBar: {
			zIndex: theme.zIndex.drawer + 1,
		},
		drawer: {
			width: drawerWidth,
			flexShrink: 0,
		},
		drawerPaper: {
			width: drawerWidth,
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(3),
		},
		toolbar: theme.mixins.toolbar,
		groupMeImge: {
			width: '100%',
		},
	};
};

class App extends Component {
	state = {
		group: null,
	};

	componentDidMount() {
		console.log('[App.js] - ComponentDidMount');
		axios
			.get(`${process.env.REACT_APP_API_URL}/groupmeApi/group/18834987`)
			.then(response => {
				// console.log('response', response)
				this.setState({ group: response.data });
			})
			.catch(err => {
				console.log(err);
			});
	}

	render() {
		console.log('[App.js] render');
		const { classes } = this.props;

		let groupAvatar = <img src="" alt=""></img>;
		let groupDescription = null;
		let groupName = "";

		// console.log('this.state.group: ', this.state.group)

		if (this.state.group) {

			// console.log('this.state.group: ', this.state.group)
			
			groupAvatar = (
				<img
					className={classes.groupMeImge}
					src={this.state.group.image_url}
					alt="groupMe avatar"
				></img>
			);

			groupDescription = <p>{this.state.group.description}</p>;
			groupName = this.state.group.name;
		}

		return (
			<div className={classes.root}>
				<CssBaseline />

				{/* {this.state.group ? <Navbar group={this.state.group} /> : null} */}

				<AppBar position="fixed" className={classes.appBar}>
					<Toolbar>
						<Typography variant="h6" noWrap>
							<NavLink to="/">{groupName}</NavLink>
						</Typography>
					</Toolbar>
				</AppBar>

				<Drawer
					className={classes.drawer}
					variant="permanent"
					classes={{
						paper: classes.drawerPaper,
					}}
				>
					<div className={classes.toolbar} />

					<Box height={250}>{groupAvatar}</Box>
					<Box textAlign="center">{groupDescription}</Box>

					<Divider />
					{/* <Menu>
						<MenuItem component={Dashboard} to={'/'}>
							Dashboard
						</MenuItem>
						<MenuItem component={Messages} to={'/messages'}>
							Messages
						</MenuItem>
					</Menu> */}
					<List>
						<ListItem button>
							<ListItemIcon>
								<HomeIcon />
							</ListItemIcon>
							<NavLink to="/">Dashboard</NavLink>
						</ListItem>
						<ListItem button>
							<ListItemIcon>
								<MailIcon />
							</ListItemIcon>
							<NavLink to="/messages">Messages</NavLink>
						</ListItem>
						<ListItem button>
							<ListItemIcon>
								<GroupIcon />
							</ListItemIcon>
							<NavLink to="/users">Users</NavLink>
						</ListItem>
					</List>
				</Drawer>

				{/* <Container fixed> */}
				<main className={classes.content}>
					<div className={classes.toolbar} />

					<Route
						path="/"
						exact
						render={props => <Dashboard group={this.state.group} {...props} />}
					/>
					<Route path="/users" component={Users} />
					<Route path="/messages" render={props => <Messages group={this.state.group} {...props} />} />
				</main>
				{/* </Container> */}
			</div>
		);
	}
}

export default withStyles(styles)(App);

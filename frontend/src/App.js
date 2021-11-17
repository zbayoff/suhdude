import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';

import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Hidden from '@material-ui/core/Hidden';
import MailIcon from '@material-ui/icons/Mail';
import HomeIcon from '@material-ui/icons/Home';
import GroupIcon from '@material-ui/icons/Group';
import MenuIcon from '@material-ui/icons/Menu';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';

import Moment from 'react-moment';

import './App.scss';

import Users from './containers/Users/Users';
import UserStats from './containers/Users/UserStats';
import Messages from './containers/Messages/Messages';
import Dashboard from './containers/Dashboard/Dashboard';
import TopTen from './containers/TopTen/TopTen';

import { fetchGroup } from './store/actions/group';
import { addMessages } from './store/actions/messages'

const drawerWidth = 240;

const styles = theme => {
	return {
		root: {
			marginLeft: 0,
			[theme.breakpoints.up('md')]: {
				marginLeft: drawerWidth,
			},
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
		homeLink: {
			color: '#fff',
		},
		menuButton: {
			marginRight: 20,
			[theme.breakpoints.up('md')]: {
				display: 'none',
			},
		},
		menuLink: {
			'&.active': {
				color: theme.palette.primary.main,
			},
		},
	};
};

class App extends Component {
	state = {
		mobileOpen: false,
	};

	componentDidMount() {
		this.props.onfetchGroup();

		this.props.onAddMessages();

		// this.addMessages()
		// 	.then(() => {
		// 		console.log('addedMessages successfully');
		// 	})
		// 	.catch(err => {
		// 		console.log(err);
		// 	});

		this.updatedMessages()
			.then(() => {
				console.log('updateMessages successfully');
			})
			.catch(err => {
				console.log(err);
			});
	}

	// addMessages() {
	// 	return axios
	// 		.get('/api/addMessages/18834987')
	// 		.then(response => {
	// 			console.log('addMessages response: ', response);
	// 		})
	// 		.catch(err => console.log(err));
	// }

	updatedMessages() {
		return axios
			.get('/api/updateMessages/18834987?num=1000')
			.then(response => {
				console.log('updateMessages response: ', response);
			})
			.catch(err => console.log(err));
	}

	handleDrawerToggle = () => {
		this.setState(state => ({ mobileOpen: !state.mobileOpen }));
	};

	render() {
		const { classes, theme, group } = this.props;

		let groupAvatar = <img src="" alt=""></img>;
		let groupDescription = null;
		let groupName = '';
		let groupStartDate = null;
		let routes = null;

		if (group) {
			groupAvatar = (
				<img
					className={classes.groupMeImge}
					src={group.image_url}
					alt="groupMe avatar"
				></img>
			);

			groupDescription = <p>{group.description}</p>;
			groupName = group.name;
			groupStartDate = group.created_at;

			routes = (
				<>
					<Route path="/users" exact={true} component={Users} />
					<Route
						path="/user-stats"
						exact={true}
						render={props => <UserStats group={group} {...props} />}
					/>
					<Route
						path="/top-ten"
						exact={true}
						render={props => <TopTen group={group} {...props} />}
					/>
					<Route
						path="/messages"
						exact={true}
						render={props => <Messages group={group} {...props} />}
					/>{' '}
				</>
			);
		}

		let drawer = (
			<div>
				<div className={classes.toolbar} />

				<Box height={250} overflow={'hidden'}>
					{groupAvatar}
				</Box>
				<Box textAlign="center">{groupDescription}</Box>

				<Divider />
				<List>
					<ListItem
						className={classes.menuLink}
						button
						component={NavLink}
						exact={true}
						to="/"
						color="secondary"
						onTouchEnd={this.handleDrawerToggle}
					>
						<ListItemIcon>
							<HomeIcon />
						</ListItemIcon>
						<Typography>Overview</Typography>
					</ListItem>
					<ListItem
						className={classes.menuLink}
						button
						component={NavLink}
						exact={true}
						to="/messages"
						onTouchEnd={this.handleDrawerToggle}
					>
						<ListItemIcon>
							<MailIcon />
						</ListItemIcon>
						<Typography>Messages</Typography>
					</ListItem>
					<ListItem
						className={classes.menuLink}
						button
						component={NavLink}
						exact={true}
						to="/users"
						onTouchEnd={this.handleDrawerToggle}
						color="secondary"
					>
						<ListItemIcon>
							<GroupIcon />
						</ListItemIcon>
						<Typography>Users</Typography>
					</ListItem>
					<ListItem
						className={classes.menuLink}
						button
						component={NavLink}
						exact={true}
						to="/user-stats"
						onTouchEnd={this.handleDrawerToggle}
						color="secondary"
					>
						<ListItemIcon>
							<EqualizerIcon />
						</ListItemIcon>
						<Typography>User Stats</Typography>
					</ListItem>
					<ListItem
						className={classes.menuLink}
						button
						component={NavLink}
						exact={true}
						to="/top-ten"
						onTouchEnd={this.handleDrawerToggle}
						color="secondary"
					>
						<ListItemIcon>
							<FormatListNumberedIcon />
						</ListItemIcon>
						<Typography>Top Ten</Typography>
					</ListItem>
				</List>
			</div>
		);

		return (
			<div className={classes.root}>
				<CssBaseline />

				<AppBar position="fixed" className={classes.appBar}>
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							edge="start"
							onClick={this.handleDrawerToggle}
							className={classes.menuButton}
						>
							<MenuIcon />
						</IconButton>
						<Typography variant="h6" noWrap>
							<Link
								component={NavLink}
								to="/"
								underline="none"
								className={classes.homeLink}
							>
								{groupName}
							</Link>
						</Typography>
						<Box ml={1}>
							<Typography>
								- since{' '}
								<Moment unix date={groupStartDate} format="MMM D, YYYY" />
							</Typography>
						</Box>
					</Toolbar>
				</AppBar>
				<Hidden smUp implementation="css">
					<Drawer
						variant="temporary"
						anchor={theme.direction === 'rtl' ? 'right' : 'left'}
						open={this.state.mobileOpen}
						onClose={this.handleDrawerToggle}
						classes={{
							paper: classes.drawerPaper,
						}}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile.
						}}
					>
						{drawer}
					</Drawer>
				</Hidden>
				<Hidden smDown implementation="css">
					<Drawer
						classes={{
							paper: classes.drawerPaper,
						}}
						variant="permanent"
						open
					>
						{drawer}
					</Drawer>
				</Hidden>

				<main className={classes.content}>
					<div className={classes.toolbar} />
					<Route
						path="/"
						exact={true}
						render={props => <Dashboard group={group} {...props} />}
					/>
					{routes}
				</main>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		group: state.group.group,
		error: state.group.error,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		// setGroup: () => dispatch(setGroup()),
		onfetchGroup: () => dispatch(fetchGroup()),
		onAddMessages: () => dispatch(addMessages())
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles, { withTheme: true })(App));

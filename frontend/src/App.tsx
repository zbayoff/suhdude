import React, { useState } from 'react';
import { Route, NavLink } from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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
import { useQuery } from '@tanstack/react-query';
import { fetchGroup } from './api/group';
import { addMessages, updateMessages } from './api/messages';

const drawerWidth = 240;

const useStyles = makeStyles((theme: any) => ({
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
}));

const App = () => {
	const [mobileOpen, setMobileOpen] = useState(false);

	const { data: group } = useQuery({
		queryKey: ['fetchGroup'],
		queryFn: fetchGroup,
	});

	useQuery({
		queryKey: ['addMessages'],
		queryFn: addMessages,
	});

	useQuery({
		queryKey: ['updateMessages'],
		queryFn: updateMessages,
	});

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen);
	};

	const theme = useTheme();

	// const { classes, theme } = this.props;
	const classes = useStyles();

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
					onTouchEnd={handleDrawerToggle}
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
					onTouchEnd={handleDrawerToggle}
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
					onTouchEnd={handleDrawerToggle}
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
					onTouchEnd={handleDrawerToggle}
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
					onTouchEnd={handleDrawerToggle}
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
						onClick={handleDrawerToggle}
						className={classes.menuButton}
					>
						<MenuIcon />
					</IconButton>
					{group ? (
						<>
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
						</>
					) : null}
				</Toolbar>
			</AppBar>
			<Hidden smUp implementation="css">
				<Drawer
					variant="temporary"
					anchor={theme.direction === 'rtl' ? 'right' : 'left'}
					open={mobileOpen}
					onClose={handleDrawerToggle}
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
};

export default App;

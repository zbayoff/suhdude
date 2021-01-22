import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';

function desc(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function stableSort(array, cmp) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
	return order === 'desc'
		? (a, b) => desc(a, b, orderBy)
		: (a, b) => -desc(a, b, orderBy);
}

const rows = [
	{
		id: 'name',
		numeric: false,
		disablePadding: true,
		label: 'Name',
		tooltip: '',
	},
	{
		id: 'numMessages',
		numeric: true,
		disablePadding: false,
		label: '# Msgs',
		tooltip: 'Total # of messages',
	},
	{
		id: 'numLikesReceived',
		numeric: true,
		disablePadding: false,
		label: '# Likes Received',
		tooltip: 'Total # of likes received',
	},
	{
		id: 'numMessageZeroLikes',
		numeric: true,
		disablePadding: false,
		label: '# Msgs with 0 Likes',
		tooltip: '# of messages with 0 Likes',
	},
	{
		id: 'numLikedMsgs',
		numeric: true,
		disablePadding: false,
		label: '# Liked Msgs',
		tooltip: 'Total # of liked messages',
	},
	{
		id: 'numSelfLikes',
		numeric: true,
		disablePadding: false,
		label: '# Self Liked Msgs',
		tooltip: 'Total # of self liked messages',
	},
	{
		id: 'likesToMsgs',
		numeric: true,
		disablePadding: false,
		label: '# Total Likes/Msgs',
		tooltip: 'Ratio of total # of likes received to total # of messages',
	},
	{
		id: 'avgLikesPerMessage',
		numeric: true,
		disablePadding: false,
		label: 'Avg Likes Per Liked Msg',
		tooltip: 'Average # of likes per liked message',
	},
	{
		id: 'numdistinctNicknames',
		numeric: true,
		disablePadding: false,
		label: '# Names',
		tooltip: 'Total # of nicknames',
	},
];

class EnhancedTableHead extends React.Component {
	createSortHandler = property => event => {
		this.props.onRequestSort(event, property);
	};

	render() {
		const { order, orderBy } = this.props;

		return (
			<TableHead>
				<TableRow>
					<TableCell padding="checkbox"></TableCell>
					{rows.map(
						row => (
							<TableCell
								key={row.id}
								align={row.numeric ? 'right' : 'left'}
								padding={row.disablePadding ? 'none' : 'default'}
								sortDirection={orderBy === row.id ? order : false}
							>
								<Tooltip
									title={row.tooltip}
									placement={row.numeric ? 'bottom-end' : 'bottom-start'}
									enterDelay={300}
								>
									<TableSortLabel
										active={orderBy === row.id}
										direction={order}
										onClick={this.createSortHandler(row.id)}
									>
										{row.label}
									</TableSortLabel>
								</Tooltip>
							</TableCell>
						),
						this
					)}
				</TableRow>
			</TableHead>
		);
	}
}

EnhancedTableHead.propTypes = {
	numSelected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	order: PropTypes.string.isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
};

const styles = theme => ({
	root: {
		width: '100%',
		marginTop: theme.spacing(3),
	},
	table: {
		minWidth: 1020,
	},
	tableWrapper: {
		overflowX: 'auto',
	},
});

class UserStats extends React.Component {
	state = {
		order: 'desc',
		orderBy: 'numMessages',
		selected: [],
		userStats: [],
		emptyRows: null,
	};

	componentDidMount() {
		this.fetchUserStats();
	}

	fetchUserStats() {
		const emptyRows = Array(13)
			.fill()
			.map((val, index) => {
				return (
					<TableRow key={index} style={{ height: '53px' }}>
						<TableCell colSpan={12}>
							<LinearProgress />
						</TableCell>
					</TableRow>
				);
			});
		this.setState({ emptyRows });

		axios
			.get('/api/userStats')
			.then(response => {
				const userStats = response.data;
				this.setState({
					userStats: [...userStats],
					emptyRows: null,
				});
			})
			.catch(err => console.log(err));
	}

	handleRequestSort = (event, property) => {
		const orderBy = property;
		let order = 'desc';

		if (this.state.orderBy === property && this.state.order === 'desc') {
			order = 'asc';
		}

		this.setState({ order, orderBy });
	};

	isSelected = id => this.state.selected.indexOf(id) !== -1;

	render() {
		const { classes } = this.props;
		const { userStats, order, orderBy, selected } = this.state;

		const emptyRows = this.state.emptyRows;

		return (
			<>
				<Box>
					<Typography variant="h6" align="center">
						User Stats
					</Typography>
				</Box>
				<Paper className={classes.root}>
					<div className={classes.tableWrapper}>
						<Table className={classes.table} aria-labelledby="tableTitle">
							<EnhancedTableHead
								numSelected={selected.length}
								order={order}
								orderBy={orderBy}
								onRequestSort={this.handleRequestSort}
								rowCount={userStats.length}
							/>
							<TableBody>
								{stableSort(userStats, getSorting(order, orderBy)).map(user => {
									return (
										<TableRow hover key={user.user_id}>
											<TableCell padding="checkbox"></TableCell>
											<TableCell component="th" scope="row" padding="none">
												{user.name}
											</TableCell>
											<TableCell align="right" style={{whiteSpace: 'nowrap'}}>
												{user.numMessages}{' '}
												({((user.numMessages / this.props.group.messages.count) *
													100).toFixed(1)}
												%)
											</TableCell>
											<TableCell align="right">
												{user.numLikesReceived}
											</TableCell>
											<TableCell align="right" style={{whiteSpace: 'nowrap'}}>
												{user.numMessageZeroLikes}{' '}
												({
													((user.numMessageZeroLikes / user.numMessages) * 100).toFixed(1)
												})%
											</TableCell>
											<TableCell align="right">{user.numLikedMsgs}</TableCell>
											<TableCell align="right">{user.numSelfLikes}</TableCell>
											<TableCell align="right">{user.likesToMsgs}</TableCell>
											<TableCell align="right">
												{user.avgLikesPerMessage}
											</TableCell>
											<TableCell align="right">
												{user.numdistinctNicknames}
											</TableCell>
										</TableRow>
									);
								})}
								{emptyRows}
							</TableBody>
						</Table>
					</div>
				</Paper>
			</>
		);
	}
}

export default withStyles(styles)(UserStats);

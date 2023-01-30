import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { CircularProgress, Typography } from '@material-ui/core';
import { useQuery } from '@tanstack/react-query';
import {
	fetchUserStats,
	UserStatsAggregationResponse as UserStatsType,
} from '../../api/users';
import { useGroupContext } from '../../group-context';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
	order: Order,
	orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
	array: readonly T[],
	comparator: (a: T, b: T) => number
) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map(el => el[0]);
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof UserStatsType;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'name',
		numeric: false,
		disablePadding: true,
		label: 'Name',
	},
	{
		id: 'numMessages',
		numeric: true,
		disablePadding: false,
		label: '# Msgs',
	},
	{
		id: 'numGifs',
		numeric: true,
		disablePadding: false,
		label: '# Gifs',
	},
	{
		id: 'numLikesReceived',
		numeric: true,
		disablePadding: false,
		label: '# Likes Received',
	},
	{
		id: 'numMessageZeroLikes',
		numeric: true,
		disablePadding: false,
		label: '# Msgs with 0 Likes',
	},
	{
		id: 'numLikedMsgs',
		numeric: true,
		disablePadding: false,
		label: '# Liked Msgs',
	},
	{
		id: 'numSelfLikes',
		numeric: true,
		disablePadding: false,
		label: '# Self Liked Msgs',
	},
	{
		id: 'likesToMsgs',
		numeric: true,
		disablePadding: false,
		label: '# Total Likes/Msgs',
	},
	{
		id: 'avgLikesPerMessage',
		numeric: true,
		disablePadding: false,
		label: 'Avg Likes Per Liked Msg',
	},
	{
		id: 'numDistinctNicknames',
		numeric: true,
		disablePadding: false,
		label: '# Names',
	},
];

interface EnhancedTableProps {
	numSelected?: number;
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof UserStatsType
	) => void;
	onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

const EnhancedTableHead = (props: EnhancedTableProps) => {
	const { order, orderBy, onRequestSort } = props;
	const createSortHandler = (property: keyof UserStatsType) => (
		event: React.MouseEvent<unknown>
	) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				<TableCell padding="checkbox"></TableCell>
				{headCells.map(
					headCell => (
						<TableCell
							key={headCell.id}
							align={headCell.numeric ? 'right' : 'left'}
							padding={headCell.disablePadding ? 'none' : 'default'}
							sortDirection={orderBy === headCell.id ? order : false}
						>
							<TableSortLabel
								active={orderBy === headCell.id}
								direction={order}
								onClick={createSortHandler(headCell.id)}
							>
								{headCell.label}
							</TableSortLabel>
						</TableCell>
					),
					this
				)}
			</TableRow>
		</TableHead>
	);
};

const useStyles = makeStyles((theme: any) => ({
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
}));

const UserStats = () => {
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof UserStatsType>('numMessages');

	const { group } = useGroupContext();

	const { data: userStats, isLoading: loadingUserStats } = useQuery({
		queryKey: ['fetchUserStats'],
		queryFn: fetchUserStats,
		enabled: !!group,
	});

	const classes = useStyles();

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof UserStatsType
	) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	return (
		<>
			<Box>
				<Typography variant="h6" align="center">
					User Stats
				</Typography>
			</Box>
			{loadingUserStats ? (
				<Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
					<CircularProgress />
				</Box>
			) : userStats && group ? (
				<Paper className={classes.root}>
					<div className={classes.tableWrapper}>
						<Table className={classes.table} aria-labelledby="tableTitle">
							<EnhancedTableHead
								order={order}
								orderBy={orderBy}
								onRequestSort={handleRequestSort}
								rowCount={userStats.length}
							/>
							<TableBody>
								{stableSort(userStats, getComparator(order, orderBy)).map(
									user => {
										return (
											<TableRow hover key={user.user_id}>
												<TableCell padding="checkbox"></TableCell>
												<TableCell component="th" scope="row" padding="none">
													{user.name}
												</TableCell>
												<TableCell
													align="right"
													style={{ whiteSpace: 'nowrap' }}
												>
													{user.numMessages} (
													{(
														(user.numMessages / group.messages.count) *
														100
													).toFixed(1)}
													%)
												</TableCell>
												<TableCell
													align="right"
													style={{ whiteSpace: 'nowrap' }}
												>
													{user.numGifs} (
													{((user.numGifs / user.numMessages) * 100).toFixed(1)}
													%)
												</TableCell>
												<TableCell align="right">
													{user.numLikesReceived}
												</TableCell>
												<TableCell
													align="right"
													style={{ whiteSpace: 'nowrap' }}
												>
													{user.numMessageZeroLikes} (
													{(
														(user.numMessageZeroLikes / user.numMessages) *
														100
													).toFixed(1)}
													)%
												</TableCell>
												<TableCell align="right">{user.numLikedMsgs}</TableCell>
												<TableCell align="right">{user.numSelfLikes}</TableCell>
												<TableCell align="right">{user.likesToMsgs}</TableCell>
												<TableCell align="right">
													{user.avgLikesPerMessage}
												</TableCell>
												<TableCell align="right">
													{user.numDistinctNicknames}
												</TableCell>
											</TableRow>
										);
									}
								)}
							</TableBody>
						</Table>
					</div>
				</Paper>
			) : null}
		</>
	);
};

export default UserStats;

import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import { CircularProgress, Typography } from '@material-ui/core';

import User from '../../components/User/User';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, User as UserType } from '../../api/users';

const Users = () => {
	const [userOpen, setUserOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

	const { data: users, isLoading: loadingUsers } = useQuery({
		queryKey: ['fetchUsers'],
		queryFn: fetchUsers,
	});

	const handleClickOpen = () => {
		setUserOpen(true);
	};

	const handleClose = () => {
		setUserOpen(false);
	};

	const userClickHandler = (user: UserType) => {
		handleClickOpen();
		setSelectedUser(user);
	};

	return (
		<>
			<Box pb={2}>
				<Typography variant="h6" align="center">
					Users
				</Typography>
			</Box>
			{loadingUsers ? (
				<Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
					<CircularProgress />
				</Box>
			) : (
				<>
					<Container>
						<Grid container spacing={3}>
							{users
								? users.map(user => {
										return (
											<User
												user={user}
												key={user.user_id}
												clickHandler={() => userClickHandler(user)}
											/>
										);
								  })
								: null}
						</Grid>
					</Container>
					<Dialog
						open={userOpen}
						onClose={handleClose}
						aria-labelledby="simple-dialog-title"
					>
						<DialogTitle id="simple-dialog-title">Known Aliases: </DialogTitle>
						<DialogContent dividers>
							<Box>
								{selectedUser
									? selectedUser.distinctNicknames.map((nickname, index) => {
											return <span key={index}>{nickname} * </span>;
									  })
									: null}
							</Box>
						</DialogContent>
					</Dialog>
				</>
			)}
		</>
	);
};

export default Users;

import axios from 'axios';

export const SET_USERS = 'SET_USERS';

export const FETCH_USERS_FAILED = 'FETCH_USERS_FAILED';

// action creators (function that returns 'creates' actions)

// synchronous action creator
export const setUsers = (users) => {
    return {
        type: SET_USERS,
        users: users
    }
}

// action creator for async action
export const fetchUsers = () => {
    return dispatch => {

        axios
			.get('/api/users')
			.then(response => {
				// const users = response.data;

                dispatch(setUsers(response.data));

				// this.setState({ users: [...users] });
			})
			.catch(err => {
				dispatch(fetchUsersFailed());
			});

    }
}

export const fetchUsersFailed = () => {
    return {
        type: FETCH_USERS_FAILED,
    }
}
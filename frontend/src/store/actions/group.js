import axios from 'axios';

// export const ADD_MESSAGES = 'ADD_MESSAGES';
// export const UPDATE_MESSAGES = 'UPDATE_MESSAGES';
// export const GET_MESSAGES = 'GET_MESSAGES';

// export const GET_USER_STATS = 'GET_USER_STATS';

export const SET_GROUP = 'SET_GROUP';

export const FETCH_GROUP_FAILED = 'FETCH_GROUP_FAILED';

// action creators (function that returns 'creates' actions)

// synchronous action creator
export const setGroup = (group) => {
    return {
        type: SET_GROUP,
        group: group
    }
}

// action creator for async action
export const fetchGroup = () => {
    return dispatch => {
        axios
			.get(`/groupmeApi/group/18834987`)
			.then(response => {

                dispatch(setGroup(response.data));

				// this.setState({ group: response.data });
			})
			.catch(err => {
				dispatch(fetchGroupFailed());
			});
    }
}

export const fetchGroupFailed = () => {
    return {
        type: FETCH_GROUP_FAILED,
    }
}
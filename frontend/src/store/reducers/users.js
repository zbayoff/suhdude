import * as actionTypes from '../actions/users';

const initialState = {
	users: [],
    loading: false
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_USERS:
			return {
				...state,
				users: action.users,
                error: false
			};
		// case actionTypes.FETCH_USERS_FAILED:
		// 	return {
		// 		...state,
		// 		error: true,
		// 	};
		default:
			return state;
	}
};

export default reducer;

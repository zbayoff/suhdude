import * as actionTypes from '../actions/messages';

const initialState = {
	// users: [],
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_MESSAGES:
			return {
				...state,
				// addMessagesResponse: action.response,
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

import * as actionTypes from '../actions/group';

const initialState = {
	group: null,
	error: false,
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case actionTypes.SET_GROUP:
			return {
				...state,
				group: action.group,
                error: false
			};
		case actionTypes.FETCH_GROUP_FAILED:
			return {
				...state,
				error: true,
			};
		default:
			return state;
	}
};

export default reducer;

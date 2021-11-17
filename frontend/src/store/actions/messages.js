import axios from 'axios';

export const ADD_MESSAGES = 'ADD_MESSAGES';
export const SET_MESSAGES = 'SET_MESSAGES';
export const UPDATE_MESSAGES = 'UPDATE_MESSAGES';


export const setMessages = (response) => {
    return {
        type: SET_MESSAGES,
        // response
    }
}

// action creator for async action
export const addMessages = () => {
    return dispatch => {

        axios
        .get('/api/addMessages/18834987')
        .then(response => {
            dispatch(setMessages());
            console.log('addMessages response: ', response);
        })
        .catch(err => console.log(err));

    }
}
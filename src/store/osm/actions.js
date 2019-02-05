import * as types from './actionTypes';
import OSM from '../../services/OSM';

export function fetchLocation(lat, long) {
    return async (dispatch, getState) => {
        try {
            const location = await OSM.reverseLocation(lat, long);
            dispatch({type: types.OSM_REVERSE_GEO, location: location});
        } catch (error) {
            console.error(error);
        }
    };
}

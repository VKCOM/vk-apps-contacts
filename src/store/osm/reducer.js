import Immutable from 'seamless-immutable';
import * as types from './actionTypes';

const initialState = Immutable({
    osm: undefined,
});

export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case types.OSM_REVERSE_GEO:
            return state.merge({
                location: action.location
            });
        default:
            return state;
    }
}

export function getGetGeoLocation(state) {
    return state.osm.location;
}

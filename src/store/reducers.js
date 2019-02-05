import {routerReducer} from 'react-router-redux';
import {combineReducers} from 'redux';
import osm from './osm/reducer';

export const rootReducer = combineReducers({
    osm: osm,
    router: routerReducer,
});

import {combineReducers} from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth';
import client from './client';
import challenge from './challenge';
import admin from './admin';
import content from './content';
import reviewers from './reviewers';
import dashboard from './dashboard';
import widget from './widget';
import fileclients from './fileclients';
import { reducer as formReducer } from 'redux-form'

const rootReducer = combineReducers({
  routing: routerReducer,
  form: formReducer,
  auth,
  client,
  challenge,
  admin,
  content,
  reviewers,
  routing: routerReducer,
  dashboard,
  widget,
  fileclients
});

export default rootReducer;

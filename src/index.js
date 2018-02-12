import 'babel-polyfill';

import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import configureStore from './redux/store/configureStore';
import {Router, IndexRoute, Route, browserHistory} from 'react-router';
import { syncHistoryWithStore, routerReducer, push } from 'react-router-redux';

//import container
import getRoutes from './routes';
//end import container

//css import
import 'bootstrap/dist/css/bootstrap.css';
import './assets/css/style.css';
import './assets/css/icon-font-entribe.css';
import './index.scss';
//end css import

import ApiClient from './helpers/ApiClient';


const client = new ApiClient();
const store = configureStore(browserHistory, client);
const history = syncHistoryWithStore(browserHistory, store);

const component = (
  <Router history={history}>
      {getRoutes(store)}
  </Router>
);

render(
  <Provider store={store}>
    {component}
  </Provider>,
  document.getElementById('root')
);

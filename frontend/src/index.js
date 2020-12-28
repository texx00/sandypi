import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';

import {check_software_updates} from "./utils/SWUpdates";

import store from './store.js';

check_software_updates(); // TODO move the check to a dedicated component and add the value to the local storage (redux) instead of using cookies? (https://developer.aliyun.com/mirror/npm/package/redux-persist-transform-expire-in/v/0.1.0)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

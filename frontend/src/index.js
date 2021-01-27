import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { HashRouter } from 'react-router-dom';
import 'typeface-roboto';

import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
    applicationId: '8431fa34-0dc3-4da0-bc0e-8e32c50a3418',
    clientToken: 'pub5d2ec4cb918f9309a6a4153f7e943fb6',
    site: 'datadoghq.com',
    service: 'suhdude',
    sampleRate: 100,
    trackInteractions: true
});

datadogLogs.init({
	clientToken: 'pub04fa4edf13403c58b97b2d4403403911',
	forwardErrorsToLogs: true,
	sampleRate: 100,
  })

const app = (
	<HashRouter>
		<App />
	</HashRouter>
);

ReactDOM.render(app, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

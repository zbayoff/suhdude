import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';
import 'typeface-roboto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const app = (
	<HashRouter>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</HashRouter>
);

ReactDOM.render(app, document.getElementById('root'));

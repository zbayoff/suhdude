const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
require('./api/models/group');
require('./api/models/message');

const { DB_PASS, DB_NAME } = process.env;

const port = process.env.PORT || 8080;
const uri = `mongodb+srv://zbayoff:${DB_PASS}@suhdude-6eldc.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	.then(() => {
		console.log('Successfully connected to the database');
	})
	.catch(err => {
		console.log('Could not connect to the database. Exiting now...', err);
		process.exit();
	});

mongoose.set('debug', true);

const groupmeRoutes = require('./api/routes/groupmeRoutes');
const suhdudeRoutes = require('./api/routes/suhdudeRoutes');

const app = express();

app.use(cors());

app.use('/groupmeApi', groupmeRoutes);
app.use('/api', suhdudeRoutes);

app.all('*', function(req, resp, next) {
	console.info(`${req.method} ${req.originalUrl}`);
	next();
});

app.listen(process.env.PORT || port, function() {
	console.log(`App listening on port ${port}`);
});

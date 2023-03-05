const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const app = express();
app.use(bodyParser.json());
mongoose.set('strictQuery', false);

const adminRoute = require('./routes/admin');

app.use(adminRoute);
app.use((req, res) => {
	res.status(404).json({ message: 'Route not found.' });
});

mongoose
	.connect(process.env.mongoURI)
	.then(() => {
		app.listen(3000);
		console.log('App running on port 3000');
	})
	.catch((err) => console.log(err));

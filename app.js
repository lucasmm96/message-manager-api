const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = express();
app.use(bodyParser.json());
mongoose.set('strictQuery', false);
dotenv.config();

const adminRoute = require('./routes/admin');

app.use(adminRoute);
app.use((req, res) => {
	res.status(404).json({ message: 'Something went wrong...', data: {} });
});

mongoose
	.connect(process.env.mongoURI)
	.then(() => {
		app.listen(3000);
		console.log('App running on port 3000');
	})
	.catch((err) => console.log(err));
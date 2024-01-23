const config =  require('./config.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const extraRoutes = require('./routes/extra');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(extraRoutes);

mongoose.set('strictQuery', true);
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    app.listen(config.PORT);
    console.log(`App listening on http://${config.HOST}:${config.PORT}`);
  })
  .catch((err) => console.log(err));

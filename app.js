const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const extraRoutes = require('./routes/extra');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(authRoutes);
app.use(adminRoutes);
app.use(userRoutes);
app.use(extraRoutes);

mongoose.set('strictQuery', true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 3000);
    console.log(`App running on port ${process.env.PORT || '3000'}`);
  })
  .catch((err) => console.log(err));

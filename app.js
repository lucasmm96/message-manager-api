const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const adminRoute = require("./routes/admin");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(adminRoute);
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(3000);
    console.log("App running on port 3000");
  })
  .catch((err) => console.log(err));

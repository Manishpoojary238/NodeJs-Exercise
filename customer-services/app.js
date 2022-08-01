const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const customerRoutes = require("./routes/customer");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/customer", customerRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://Manish:Manish26@cluster0.peqyeiz.mongodb.net/customer1"
  )
  .then((result) => {
    app.listen(8082);
  })
  .catch((err) => console.log(err));

module.exports = app;
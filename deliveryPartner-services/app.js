const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const deliveryPartnerRoutes = require("./routes/deliveryPartner");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/deliveryPartner", deliveryPartnerRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://Manish:Manish26@cluster0.peqyeiz.mongodb.net/deliveryPartner1"
  )
  .then((result) => {
    app.listen(8083);
  })
  .catch((err) => console.log(err));

module.exports = app;
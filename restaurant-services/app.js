const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const restaurantAdminRoutes = require("./routes/restaurantAdmin");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/restaurantAdmin", restaurantAdminRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://Manish:Manish26@cluster0.peqyeiz.mongodb.net/restaurant1"
  )
  .then((result) => {
    app.listen(8081);
  })
  .catch((err) => console.log(err));

module.exports = app;
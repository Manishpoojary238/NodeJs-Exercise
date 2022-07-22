const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const restaurantAdminRoutes = require('./routes/restaurantAdmin');
const customerRoutes = require('./routes/customer');
const deliveryPartnerRoutes = require('./routes/deliveryPartner');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/restaurantAdmin', restaurantAdminRoutes);
app.use('/customer', customerRoutes);
app.use('/deliveryPartner', deliveryPartnerRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });

mongoose
  .connect(
    'mongodb+srv://Manish:Manish26@cluster0.peqyeiz.mongodb.net/food'
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
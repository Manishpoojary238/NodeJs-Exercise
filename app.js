const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
// const csrf = require('csurf');
// const flash = require('connect-flash');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const restaurantAdminRoutes = require('./routes/restaurantAdmin');

const app = express();

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/restaurantAdmin', restaurantAdminRoutes);


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
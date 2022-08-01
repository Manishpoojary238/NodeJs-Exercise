const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const axios = require("axios");
const { validationResult } = require("express-validator/check");

const { response } = require("express");
const restaurantURL = "http://localhost:8081/restaurantAdmin/";

//to get all the restaurants
exports.getRestaurants = (req, res, next) => {
  const userId = req.body.userId;
  axios
    .get(`${restaurantURL}restaurants`, { params: { userId: userId } })
    .then((response) => {
      if (!response.data.restaurants) {
        const error = new Error("No restaurants found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restraunts: response.data.restaurants,
        totalItems: response.data.totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//add restaurant
exports.createRestaurant = (req, res, next) => {
  req.body.file = req.file;
  axios
    .post(`${restaurantURL}restaurant`, req.body)
    .then((response) => {
      if (!response.data.restaurant) {
        const error = new Error("cant add restaurant...");
        error.statusCode = 400;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restraunt: response.data.restaurant,
        totalItems: response.data.restaurant,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get restaurant by id
exports.getRestaurant = (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  axios
    .get(`${restaurantURL}restaurant/${restaurantId}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.restaurant) {
        const error = new Error("restaurant not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restraunt: response.data.restaurant,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//updating restaurant details
exports.updateRestaurant = (req, res, next) => {
  req.body.file = req.file;
  const restaurantId = req.params.restaurantId;
  axios
    .put(`${restaurantURL}restaurant/${restaurantId}`, req.body)
    .then((response) => {
      if (!response.data.restaurant) {
        const error = new Error("restaurant not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restaurant: response.data.restaurant,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//deleting restaurant
exports.deleteRestaurant = (req, res, next) => {
  const userId = req.body.userId;
  const isAdmin = req.body.isAdmin;
  const restaurantId = req.params.restaurantId;
  axios
    .delete(`${restaurantURL}restaurant/${restaurantId}`, {
      data: { userId: userId, isAdmin: isAdmin },
    })
    .then((response) => {
      if (!response.data) {
        const error = new Error("restaurant not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get all restaurant admins
exports.getRestaurantAdmins = (req, res, next) => {
  axios
    .get(`${restaurantURL}restaurantAdmins`, {
      params: { userId: req.body.userId, isAdmin: req.body.isAdmin },
    })
    .then((response) => {
      if (!response.data.restaurantAdmins) {
        const error = new Error("No restaurant admin found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restaurantAdmins: response.data.restaurantAdmins,
        totalItems: response.data.totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get restaurant by id
exports.getRestaurantAdmin = (req, res, next) => {
  const restaurantAdminId = req.params.restaurantAdminId;
  axios
    .get(`${restaurantURL}restaurantAdmin/${restaurantAdminId}`, {
      params: { userId: req.body.userId, isAdmin: req.body.isAdmin },
    })
    .then((response) => {
      if (!response.data.restaurantAdmin) {
        const error = new Error("restaurant admin not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restraunt: response.data.restaurantAdmin,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//deleting restaurant admin
exports.deleteRestaurantAdmin = (req, res, next) => {
  const restaurantAdminId = req.params.restaurantAdminId;
  const userId = req.body.userId;
  const isAdmin = req.body.isAdmin;
  axios
    .delete(`${restaurantURL}restaurantAdmin/${restaurantAdminId}`, {
      data: { userId: userId, isAdmin: isAdmin },
    })
    .then((response) => {
      if (!response.data) {
        const error = new Error("restaurantAdmin not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//admin signup
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const admin = new Admin({
        email: email,
        password: hashedPw,
        name: name,
      });
      return admin.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//admin login
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  Admin.findOne({ email: email })
    .then((admin) => {
      if (!admin) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = admin;
      return bcrypt.compare(password, admin.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
      return err;
    });
};

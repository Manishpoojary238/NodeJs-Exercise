const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator/check");
const axios = require("axios");

const DeliveryPartner = require("../models/deliveryPartner");

const restaurantURL = "http://localhost:8081/restaurantAdmin/";
const customerURL = "http://localhost:8082/customer/";

//get all delivery partners
exports.getDeliveryPartners = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  if (!req.query.isRestaurantAdmin) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  DeliveryPartner.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return DeliveryPartner.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((deliveryPartners) => {
      console.log(deliveryPartners);
      res.status(200).json({
        message: "Fetched delivery partners successfully.",
        deliveryPartners: deliveryPartners,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//request delivery partner to deliver the order
exports.requestDeliveryPartner = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isRestaurantAdmin) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const userID = req.body.userId;
  const deliveryPartnerId = req.params.deliveryPartnerId;
  const orderId = req.params.orderId;
  DeliveryPartner.findById(deliveryPartnerId)
    .then((deliveryPartner) => {
      if (!deliveryPartner) {
        const error = new Error("Could not find the delivery partner.");
        error.statusCode = 404;
        throw error;
      }
      deliveryPartner.deliveryRequests.pendingRequests.push({
        orderId: orderId,
        restaurantAdminId: userID,
      });
      return deliveryPartner.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Request sent",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//delivery partner signup
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
      const deliveryPartner = new DeliveryPartner({
        email: email,
        password: hashedPw,
        name: name,
      });
      return deliveryPartner.save();
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

//delivery partner login
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  DeliveryPartner.findOne({ email: email })
    .then((deliveryPartner) => {
      if (!deliveryPartner) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = deliveryPartner;
      return bcrypt.compare(password, deliveryPartner.password);
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
    });
};

//accept order delivery requet
exports.acceptDeliveryRequest = (req, res, next) => {
  const orderId = req.params.orderId;
  let flag;
  let restaurantAdminID;
  for (let i = 0; i < req.user.deliveryRequests.pendingRequests.length; i++) {
    if (req.user.deliveryRequests.pendingRequests[i].orderId == orderId) {
      req.user.deliveryRequests.acceptedRequests.push({
        orderId: orderId,
        restaurantAdminId:
          req.user.deliveryRequests.pendingRequests[i].restaurantAdminId,
      });
      restaurantAdminID =
        req.user.deliveryRequests.pendingRequests[i].restaurantAdminId;
      req.user.deliveryRequests.pendingRequests.splice(i, 1);
      flag = 1;
      req.user.save();
    }
  }
  req.body.flag = flag;
  req.body.restaurantAdminID = restaurantAdminID;
  req.body.userId = req.user._id;

  axios
    .post(`${restaurantURL}acceptDeliveryRequest/${orderId}`, req.body)
    .then((response) => {
      if (!response.data) {
        const error = new Error("cant accept request...");
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

//reject order delivery request
exports.rejectDeliveryRequest = (req, res, next) => {
  const orderId = req.params.orderId;
  let flag;
  let restaurantAdminID;
  for (let i = 0; i < req.user.deliveryRequests.pendingRequests.length; i++) {
    if (req.user.deliveryRequests.pendingRequests[i].orderId == orderId) {
      restaurantAdminID =
        req.user.deliveryRequests.pendingRequests[i].restaurantAdminId;
      req.user.deliveryRequests.pendingRequests.splice(i, 1);
      flag = 1;
      req.user.save();
    }
  }
  req.body.flag = flag;
  req.body.restaurantAdminID = restaurantAdminID;
  req.body.userId = req.user._id;

  axios
    .post(`${restaurantURL}rejectDeliveryRequest/${orderId}`, req.body)
    .then((response) => {
      if (!response.data) {
        const error = new Error("something went wrong");
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

//update order status as order picked up/ order delivered
exports.updateOrderStatus = (req, res, next) => {
  const orderId = req.params.orderId;
  let flag;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const orderStatus = req.body.orderStatus;
  for (let i = 0; i < req.user.deliveryRequests.acceptedRequests.length; i++) {
    if (req.user.deliveryRequests.acceptedRequests[i].orderId == orderId) {
      flag = 1;
    }
  }
  if (flag !== 1) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  console.log(orderId);
  axios
    .put(`${customerURL}orderStatus/${orderId}`, req.body)
    .then((response) => {
      if (!response.data) {
        const error = new Error("something went wrong");
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

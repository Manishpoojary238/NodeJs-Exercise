const { validationResult } = require('express-validator/check');
const Order = require('../models/order');
const DeliveryPartner = require('../models/deliveryPartner');
const RestaurantAdmin = require('../models/restaurantAdmin');
const deliveryPartner = require('../models/deliveryPartner');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const restaurantAdmin = require('../models/restaurantAdmin');

exports.updateOrderStatus = (req, res, next) => {
    const orderId = req.params.orderId;
    let flag;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const orderStatus = req.body.orderStatus;
    for( let i=0; i< req.user.deliveryRequests.acceptedRequests.length; i++){
      if(req.user.deliveryRequests.acceptedRequests[i].orderId == orderId){
          flag=1;
      }
    }
    if(flag!==1){
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }

    Order.findById(orderId)
      .then(order => {
        if (!order) {
          const error = new Error('Could not find the order.');
          error.statusCode = 404;
          throw error;
        }
        order.orderStatus = orderStatus;
        return order.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Order Status updated!', order: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  
  exports.acceptDeliveryRequest = (req, res, next) => {
    const orderId = req.params.orderId;
    let restaurantAdminID;
    for( let i=0; i< req.user.deliveryRequests.pendingRequests.length; i++){
      if(req.user.deliveryRequests.pendingRequests[i].orderId == orderId){
        req.user.deliveryRequests.acceptedRequests.push({"orderId": orderId, "restaurantAdminId":req.user.deliveryRequests.pendingRequests[i].restaurantAdminId  })
        restaurantAdminID = req.user.deliveryRequests.pendingRequests[i].restaurantAdminId;
        req.user.deliveryRequests.pendingRequests.splice(i,1);
        flag=1;
        req.user.save(); 
      }
    }
    if(flag!==1){
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    RestaurantAdmin.findById(restaurantAdminID)
    .then(restaurantAdmin => {
      restaurantAdmin.deliveryRequests.acceptedRequests.push({"orderId": orderId, "deliveryPartnerId": req.user._id});
      return restaurantAdmin.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'delivery order accepted'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  };

  exports.rejectDeliveryRequest = (req, res, next) => {
    const orderId = req.params.orderId;
    let restaurantAdminID;
    for( let i=0; i< req.user.deliveryRequests.pendingRequests.length; i++){
      if(req.user.deliveryRequests.pendingRequests[i].orderId == orderId){
        //req.user.deliveryRequests.acceptedRequests.push({"orderId": orderId, "restaurantAdminId":req.user.deliveryRequests.pendingRequests[i].restaurantAdminId  })
        restaurantAdminID = req.user.deliveryRequests.pendingRequests[i].restaurantAdminId;
        req.user.deliveryRequests.pendingRequests.splice(i,1);
        flag=1;
        req.user.save(); 
      }
    }
    if(flag!==1){
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    RestaurantAdmin.findById(restaurantAdminID)
    .then(restaurantAdmin => {
      restaurantAdmin.deliveryRequests.rejectedRequests.push({"orderId": orderId, "deliveryPartnerId": req.user._id});
      return restaurantAdmin.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'delivery order rejected'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  };





  // exports.getDeliveryRequests = (req, res, next) => {
  //   let requests;
  //   
  //     
  //       requests = req.user.deliveryRequests;
  //     
  //     .then(foods => {
  //       res.status(200).json({
  //         message: 'Fetched requests successfully.',
  //         requests: requests
  //       });
  //     })
  //     .catch(err => {
  //       if (!err.statusCode) {
  //         err.statusCode = 500;
  //       }
  //       next(err);
  //     });
  // };

  exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt
      .hash(password, 12)
      .then(hashedPw => {
        const deliveryPartner = new DeliveryPartner({
          email: email,
          password: hashedPw,
          name: name
        });
        return deliveryPartner.save();
      })
      .then(result => {
        res.status(201).json({ message: 'User created!', userId: result._id });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  
  exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    DeliveryPartner.findOne({ email: email })
      .then(deliveryPartner => {
        if (!deliveryPartner) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = deliveryPartner;
        return bcrypt.compare(password, deliveryPartner.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          const error = new Error('Wrong password!');
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            userId: loadedUser._id.toString()
          },
          'somesupersecretsecret',
          { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

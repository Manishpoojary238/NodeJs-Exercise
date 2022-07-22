const Admin = require('../models/admin');
const RestaurantAdmin = require('../models/restaurantAdmin');
const User = require('../models/user');
const DeliveryPartner = require('../models/deliveryPartner');

module.exports.isAdmin = (req, res, next) => {
    if(!req.userId){
        const error = new Error('Not authenticated(admin).');
        error.statusCode = 401;
        throw error;
    }
    Admin.findById(req.userId)
    .then(user => {
        if (!user) {
            const error = new Error('Not authenticated(admin).');
            error.statusCode = 401;
            throw error;
        }
        next();
      })
      .catch(err => {
        next(new Error(err));
      });
};

module.exports.isRestaurantAdmin = (req, res, next) => {
  if(!req.userId){
      const error = new Error('Not authenticated(restaurantAdmin).');
      error.statusCode = 401;
      throw error;
  }
  RestaurantAdmin.findById(req.userId)
  .then(user => {
      if (!user) {
          const error = new Error('Not authenticated(restaurantAdmin).');
          error.statusCode = 401;
          throw error;
      }
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
};

module.exports.isCustomer = (req, res, next) => {
  if(!req.userId){
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
  }
  User.findById(req.userId)
  .then(user => {
      if (!user) {
          const error = new Error('Not authenticated.');
          error.statusCode = 401;
          throw error;
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
};

module.exports.isDeliveryPartner = (req, res, next) => {
  if(!req.userId){
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
  }
  DeliveryPartner.findById(req.userId)
  .then(user => {
      if (!user) {
          const error = new Error('Not authenticated.');
          error.statusCode = 401;
          throw error;
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
};
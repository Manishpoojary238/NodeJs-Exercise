const RestaurantAdmin = require("../models/restaurantAdmin");

module.exports = (req, res, next) => {
  if (!req.userId) {
    const error = new Error("Not authenticated(restaurantAdmin).");
    error.statusCode = 401;
    throw error;
  }
  RestaurantAdmin.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Not authenticated(restaurantAdmin).");
        error.statusCode = 401;
        throw error;
      }
      req.user = user;
      req.body.isRestaurantAdmin = true;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
};

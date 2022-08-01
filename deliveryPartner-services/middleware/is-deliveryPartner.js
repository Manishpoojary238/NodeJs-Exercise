const DeliveryPartner = require("../models/deliveryPartner");

module.exports = (req, res, next) => {
  if (!req.userId) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  DeliveryPartner.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
      }
      req.user = user;
      req.body.isDeliveryPartner = true;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
};

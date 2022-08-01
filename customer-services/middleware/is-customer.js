const User = require("../models/user");

module.exports = (req, res, next) => {
  if (!req.userId) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
      }
      req.user = user;
      req.body.isCustomer = true;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
};

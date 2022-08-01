const Admin = require("../models/admin");

module.exports = (req, res, next) => {
  if (!req.userId) {
    const error = new Error("Not authenticated(admin).");
    error.statusCode = 401;
    throw error;
  }
  Admin.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Not authenticated(admin).");
        error.statusCode = 401;
        throw error;
      }
      req.body.isAdmin = true;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
};

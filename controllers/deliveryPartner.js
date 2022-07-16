const { validationResult } = require('express-validator/check');
const Order = require('../models/order');

exports.updateOrderStatus = (req, res, next) => {
    const orderId = req.params.orderId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const orderStatus = req.body.orderStatus;
    // if (req.file) {
    //   imageUrl = req.file.path.replace("\\","/");
    // }
    
    Order.findById(orderId)
      .then(order => {
        if (!order) {
          const error = new Error('Could not find the order.');
          error.statusCode = 404;
          throw error;
        }
        // if (post.creator.toString() !== req.userId) {
        //   const error = new Error('Not authorized!');
        //   error.statusCode = 403;
        //   throw error;
        // }
        // if (imageUrl !== post.imageUrl) {
        //   clearImage(post.imageUrl);
        // }
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
  
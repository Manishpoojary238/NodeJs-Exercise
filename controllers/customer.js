// const fs = require('fs');
// const path = require('path');

// const { validationResult } = require('express-validator/check');

const Food = require('../models/food');
const User = require('../models/user');

exports.getFoods = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Food.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Food.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      })
      .then(foods => {
        res.status(200).json({
          message: 'Fetched foods successfully.',
          foods: foods,
          totalItems: totalItems
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };


//   exports.getCart = (req, res, next) => {
//     req.user
//       .populate('cart.items.foodId')
//       .execPopulate()
//       .then(user => {
//         const foods = user.cart.items;
//         res.status(200).json({
//             message: 'Fetched cart successfully.',
//             foods: foods
//           });
//       })
//       .catch(err => {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//           }
//           next(err);
//       });
//   };


  exports.postCart = (req, res, next) => {
    const foodId = req.body.foodId;
    Food.findById(foodId)
      .then(food => {
        return req.user.addToCart(food);
      })
      .then(result => {
        res.status(200).json({
            message: 'Food added to cart.',
            result: result
          });
      })
      .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
      });
  };


//   exports.postCartDeleteFood = (req, res, next) => {
//     const foodId = req.body.foodId;
//     req.user
//       .removeFromCart(foodId)
//       .then(result => {
//         res.status(200).json({
//             message: 'Food deleted from cart.',
//             //result: result
//           });
//       })
//       .catch(err => {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//           }
//           next(err);
//       });
//   };
const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Food = require('../models/food');
const Restaurant = require('../models/restaurant');
const Order = require('../models/order');


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


  exports.getFood= (req, res, next) => {
    const foodId = req.params.foodId;
    Food.findById(foodId)
      .then(food => {
        if (!food) {
          const error = new Error('Could not find food.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Food fetched.', food: food });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };  

  exports.getCart = (req, res, next) => {
    req.user
      .populate('cart.items.foodId')
      .execPopulate()
      .then(user => {
        const foods = user.cart.items;
        res.status(200).json({
            message: 'Fetched cart successfully.',
            foods: foods
          });
      })
      .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
      });
  };


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


  exports.postCartDeleteFood = (req, res, next) => {
    const foodId = req.body.foodId;
    req.user
      .removeFromCart(foodId)
      .then(result => {
        res.status(200).json({
            message: 'Food deleted from cart.',
            //result: result
          });
      })
      .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
      });
  };


  exports.postOrder = (req, res, next) => {
    let cartFoods;
    let total =0;
    req.user
      .populate('cart.items.foodId')
      .execPopulate()
      .then(user => {
        cartFoods = user.cart.items;
        total = 0;
        cartFoods.forEach(p => {
          total += p.quantity * p.foodId.price;
        });
        const foods = user.cart.items.map(i => {
          return { quantity: i.quantity, food: { ...i.foodId._doc } };
        });
        const order = new Order({
          user : {
            email: req.user.email,
            userId: req.user
          },
          totalAmount: total,
          foods: foods,
          orderStatus : "Order placed"
        });
        return order.save();
      })
      .then(result => {
        return req.user.clearCart();
      })
      .then(() => {
        res.status(200).json({
          message: 'Order placed.',
          //result: result
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
      .then(orders => {
        res.status(200).json({
          orders: orders
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };


  exports.cancelOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
      .then(order => {
        if (!order) {
          const error = new Error('Could not find the order.');
          error.statusCode = 404;
          throw error;
        }
        return Order.findByIdAndRemove(orderId);
      })
      .then(result => {
        res.status(200).json({ message: 'Order Cancelled.' });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };


  exports.giveFoodRating = (req, res, next) => {
    const foodId = req.params.foodId;
    const foodRating =req.body.foodRating;
    let food;
    let flag;
    Food.findById(foodId)
      .then(food => {
        if (!food) {
          const error = new Error('Could not find the food.');
          error.statusCode = 404;
          throw error;
        }
        if(foodRating!=1 && foodRating!=2 && foodRating!=3 && foodRating!=4 && foodRating!=5){
          const error = new Error('Please enter any rating value from 1 to 5 .');
          error.statusCode = 404;
          throw error;
        }

        let oldFoodRating;
        userFoodRatingArray = req.user.allRatings.foodRatings;
        for(let i=0; i<userFoodRatingArray.length; i++){
          if(userFoodRatingArray[i].foodId == foodId)
          {
            //oldFoodRating = userFoodRatingArray[i].rating;
            oldFoodRating =req.user.allRatings.foodRatings[i].rating;
            req.user.allRatings.foodRatings[i].rating = foodRating;
            flag = 1;
            req.user.save();

            for(let j=0;j<food.ratings; j++){
              if(food.ratings[j] == oldFoodRating){
                food.ratings.splice(j,1);
                food.ratings.push(foodRating);
                food.avgRating();
                return food.save();
              }
            }
          }
        }

        if(flag !== 1){
          food.ratings.push(foodRating);
          food.avgRating();
          food.save();
          req.user.allRatings.foodRatings.push({"foodId":foodId, "rating": foodRating});
          return req.user.save();
        }
      })
      .then(result => {
        res.status(201).json({
          message: 'Rating submitted'
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };


  exports.giveRestaurantRating = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    const restaurantRating =req.body.restaurantRating;
    let flag;
    Restaurant.findById(restaurantId)
      .then(restaurant => {
        if (!restaurant) {
          const error = new Error('Could not find the restaurant.');
          error.statusCode = 404;
          throw error;
        }
        if(restaurantRating!=1 && restaurantRating!=2 && restaurantRating!=3 && restaurantRating!=4 && restaurantRating!=5){
          const error = new Error('Please enter any rating value from 1 to 5 .');
          error.statusCode = 404;
          throw error;
        }

        let oldRestaurantRating;
        userRestaurantRatingArray = req.user.allRatings.restaurantRatings;
        for(let i=0; i<userRestaurantRatingArray.length; i++){
          if(userRestaurantRatingArray[i].restaurantId == restaurantId)
          {
            //oldFoodRating = userFoodRatingArray[i].rating;
            oldRestaurantRating =req.user.allRatings.restaurantRatings[i].rating;
            req.user.allRatings.restaurantRatings[i].rating = restaurantRating;
            flag = 1;
            req.user.save();

            for(let j=0;j<restaurant.ratings; j++){
              if(restaurant.ratings[j] == oldRestaurantRating){
                restaurant.ratings.splice(j,1);
                restaurant.ratings.push(restaurantRating);
                restaurant.avgRating();
                return restaurant.save();
              }
            }
          }
        }

        if(flag !== 1){
          restaurant.ratings.push(restaurantRating);
          restaurant.avgRating();
          restaurant.save();
          req.user.allRatings.restaurantRatings.push({"restaurantId":restaurantId, "rating": restaurantRating});
          return req.user.save();
        }
      })
      .then(result => {
        res.status(201).json({
          message: 'Rating submitted'
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };


  exports.search = (req, res, next) => {
    console.log(req.params.key);
    //res.send("search done");
    let data = Food.find(
      {
        "$or": [
          { "name": {$regex:req.params.key}},
          { "description": {$regex:req.params.key}}
        ]
      }
    )
    .then(data => {
      res.status(201).json({
        message: 'result for the search',
        data : data
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
    //res.send(data);
  };
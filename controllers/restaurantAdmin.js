const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Food = require('../models/food');
const Restaurant = require('../models/restaurant');
const restaurant = require('../models/restaurant');


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


  exports.createFood = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    // if (!req.file) {
    //   const error = new Error('No image provided.');
    //   error.statusCode = 422;
    //   throw error;
    // }

    //const imageUrl = req.file.path.replace("\\","/");
    const imageUrl=req.body.imageUrl;
    const name = req.body.name;
    const description = req.body.description;
    const price = req. body.price;
    const restaurantId = req.body.restaurantId
    let restaurant;
    const food = new Food({
      name: name,
      description: description,
      imageUrl: imageUrl,
      price: price,
      restaurantId: restaurantId
      //creator: req.userId
    });
    food
      .save()
      .then(result => {
        return Restaurant.findById(restaurantId);
      })
      .then(restaurant => {
        restaurant = restaurant;
        restaurant.foods.push(food);
        return restaurant.save();
      })
      .then(result => {
        res.status(201).json({
          message: 'Food added successfully!',
          food: food,
          //restaurant: {  name: restaurant.name }
          //creator: { _id: creator._id, name: creator.name }
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


  exports.updateFood = (req, res, next) => {
    const foodId = req.params.foodId;
    //const restaurantId = req.params.restaurantId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const name = req.body.name;
    const description = req.body.description;
    let imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const restaurantId = req.body.restaurantId;
    // if (req.file) {
    //   imageUrl = req.file.path.replace("\\","/");
    // }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    Food.findById(foodId)
      .then(food => {
        if (!food) {
          const error = new Error('Could not find food.');
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
        food.name = name;
        food.imageUrl = imageUrl;
        food.description = description;
        food.price = price;
        food.restaurantId = restaurantId;
        return food.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Food updated!', food: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };


  exports.deleteFood = (req, res, next) => {
    const foodId = req.params.foodId;
    let restaurantId;
    Food.findById(foodId)
      .then(food => {
        if (!food) {
          const error = new Error('Could not find food.');
          error.statusCode = 404;
          throw error;
        }
        // if (post.creator.toString() !== req.userId) {
        //   const error = new Error('Not authorized!');
        //   error.statusCode = 403;
        //   throw error;
        // }
        // Check logged in user
        
        //clearImage(post.imageUrl);
        restaurantId= food.restaurantId;
        return Food.findByIdAndRemove(foodId);
      })
      .then(result => {
        return Restaurant.findById(restaurantId);
      })
      .then(restaurant => {
        restaurant.foods.pull(foodId);
        return restaurant.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Deleted food.' });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
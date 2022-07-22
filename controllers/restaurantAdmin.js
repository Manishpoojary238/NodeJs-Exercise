const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');

const Food = require('../models/food');
const DeliveryPartner = require('../models/deliveryPartner');
const RestaurantAdmin = require('../models/restaurantAdmin');
const Restaurant = require('../models/restaurant');
const deliveryPartner = require('../models/deliveryPartner');

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
    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
    }
    const imageUrl = req.file.path.replace("\\","/");
    //const imageUrl=req.body.imageUrl;
    const name = req.body.name;
    const description = req.body.description;
    const availability = req.body.availability;
    const price = req. body.price;
    const restaurantId = req.body.restaurantId
    let restaurant;
    const food = new Food({
      name: name,
      description: description,
      imageUrl: imageUrl,
      availability: availability,
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
    const availability = req.body.availability;
    const price = req.body.price;
    const restaurantId = req.body.restaurantId;
    if (req.file) {
      imageUrl = req.file.path.replace("\\","/");
    }
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
        if (imageUrl !== food.imageUrl) {
          clearImage(food.imageUrl);
        }
        food.name = name;
        food.imageUrl = imageUrl;
        food.description = description;
        food.availability = availability;
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
        clearImage(food.imageUrl);
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


  exports.getDeliveryPartners = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    DeliveryPartner.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return DeliveryPartner.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      })
      .then(deliveryPartners => {
        res.status(200).json({
          message: 'Fetched delivery partners successfully.',
          deliveryPartners: deliveryPartners,
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


  exports.requestDeliveryPartner = (req, res, next) => {
    const deliveryPartnerId = req.params.deliveryPartnerId;
    const orderId = req.params.orderId;
    DeliveryPartner.findById(deliveryPartnerId)
      .then(deliveryPartner => {
        if (!deliveryPartner) {
          const error = new Error('Could not find the delivery partner.');
          error.statusCode = 404;
          throw error;
        }
        deliveryPartner.deliveryRequests.pendingRequests.push({"orderId": orderId, "restaurantAdminId": req.userId });
        return deliveryPartner.save();
      })
      .then(result => {
        res.status(201).json({
          message: 'Request sent'
        });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

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
        const restaurantAdmin = new RestaurantAdmin({
          email: email,
          password: hashedPw,
          name: name
        });
        return restaurantAdmin.save();
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
    RestaurantAdmin.findOne({ email: email })
      .then(restaurantAdmin => {
        if (!restaurantAdmin) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = restaurantAdmin;
        return bcrypt.compare(password, restaurantAdmin.password);
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

  const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
  };
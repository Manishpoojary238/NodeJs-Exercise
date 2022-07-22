const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const { validationResult } = require('express-validator/check');

const Restaurant = require('../models/restaurant');
const RestaurantAdmin = require('../models/restaurantAdmin');
//const User = require('../models/user');

exports.getRestaurants = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Restaurant.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return Restaurant.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      })
      .then(restraunts => {
        res.status(200).json({
          message: 'Fetched restraunts successfully.',
          restraunts: restraunts,
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


 exports.createRestaurant = (req, res, next) => {
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
    const location = req. body.location;
    const restaurantAdminId =req.body.restaurantAdminId;
    //let creator;
    const restaurant = new Restaurant({
      name: name,
      description: description,
      imageUrl: imageUrl,
      location: location,
      restaurantAdminId: restaurantAdminId
    });
    restaurant
      .save()
      .then(result => {
        res.status(201).json({
          message: 'Restaurant added successfully!',
          restaurant: restaurant,
          //restaurantAdmin: { _id: restaurantAdmin._id, name: restaurantAdmin.name }
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

  exports.getRestaurant = (req, res, next) => {
    const restrauntID = req.params.restaurantId;
    Restaurant.findById(restrauntID)
      .then(restaurant => {
        if (!restaurant) {
          const error = new Error('Could not find restaurant.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Restaurant fetched.', restaurant: restaurant });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.updateRestaurant = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const name = req.body.name;
    const description = req.body.description;
    const location = req.body.location;
    let imageUrl = req.body.imageUrl;
    const restaurantAdminId = req.body.restaurantAdminId;
    if (req.file) {
      imageUrl = req.file.path.replace("\\","/");
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }
    Restaurant.findById(restaurantId)
      .then(restaurant => {
        if (!restaurant) {
          const error = new Error('Could not find restaurant.');
          error.statusCode = 404;
          throw error;
        }
        if (imageUrl !== restaurant.imageUrl) {
          clearImage(restaurant.imageUrl);
        }
        restaurant.name = name;
        restaurant.imageUrl = imageUrl;
        restaurant.description = description;
        restaurant.location = location;
        restaurant.restaurantAdminId = restaurantAdminId;
        return restaurant.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Restaurant updated!', restaurant: result });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  
 
  exports.deleteRestaurant = (req, res, next) => {
    const restaurantId = req.params.restaurantId;
    Restaurant.findById(restaurantId)
      .then(restaurant => {
        if (!restaurant) {
          const error = new Error('Could not find restaurant.');
          error.statusCode = 404;
          throw error;
        }
        // Check logged in user

        clearImage(restaurant.imageUrl);
        return Restaurant.findByIdAndRemove(restaurantId);
      })
      .then(result => {
        res.status(200).json({ message: 'Deleted restaurant.' });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };

  exports.getRestaurantAdmins = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    RestaurantAdmin.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        return RestaurantAdmin.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      })
      .then(restrauntAdmins => {
        res.status(200).json({
          message: 'Fetched restraunt admins successfully.',
          restrauntAdmins: restrauntAdmins,
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


  exports.getRestaurantAdmin = (req, res, next) => {
    const restrauntAdminID = req.params.restaurantAdminId;
    RestaurantAdmin.findById(restrauntAdminID)
      .then(restaurantAdmin => {
        if (!restaurantAdmin) {
          const error = new Error('Could not find restaurant admin.');
          error.statusCode = 404;
          throw error;
        }
        res.status(200).json({ message: 'Restaurant admin fetched.', restaurantAdmin: restaurantAdmin });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
  
  exports.deleteRestaurantAdmin = (req, res, next) => {
    const restaurantAdminId = req.params.restaurantAdminId;
    RestaurantAdmin.findById(restaurantAdminId)
      .then(restaurantAdmin => {
        if (!restaurantAdmin) {
          const error = new Error('Could not find restaurant admin.');
          error.statusCode = 404;
          throw error;
        }
        return RestaurantAdmin.findByIdAndRemove(restaurantAdminId);
      })
      .then(result => {
        res.status(200).json({ message: 'Deleted restaurant admin.' });
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
        const admin = new Admin({
          email: email,
          password: hashedPw,
          name: name
        });
        return admin.save();
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
    Admin.findOne({ email: email })
      .then(admin => {
        if (!admin) {
          const error = new Error('A user with this email could not be found.');
          error.statusCode = 401;
          throw error;
        }
        loadedUser = admin;
        return bcrypt.compare(password, admin.password);
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
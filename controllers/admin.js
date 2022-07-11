const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Restaurant = require('../models/restaurant');
const RestaurantAdmin = require('../models/restaurantAdmin');
//const restaurant = require('../models/restaurant');
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
    // if (!req.file) {
    //   const error = new Error('No image provided.');
    //   error.statusCode = 422;
    //   throw error;
    // }

    //const imageUrl = req.file.path.replace("\\","/");
    const imageUrl=req.body.imageUrl;
    const name = req.body.name;
    const description = req.body.description;
    const location = req. body.location;
    //let creator;
    const restaurant = new Restaurant({
      name: name,
      description: description,
      imageUrl: imageUrl,
      location: location
      //creator: req.userId
    });
    restaurant
      .save()
    //   .then(result => {
    //     return User.findById(req.userId);
    //   })
    //   .then(user => {
    //     creator = user;
    //     user.posts.push(post);
    //     return user.save();
    //   })
      .then(result => {
        res.status(201).json({
          message: 'Restaurant added successfully!',
          restaurant: restaurant,
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
    // if (req.file) {
    //   imageUrl = req.file.path.replace("\\","/");
    // }
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
        // if (post.creator.toString() !== req.userId) {
        //   const error = new Error('Not authorized!');
        //   error.statusCode = 403;
        //   throw error;
        // }
        // if (imageUrl !== post.imageUrl) {
        //   clearImage(post.imageUrl);
        // }
        restaurant.name = name;
        restaurant.imageUrl = imageUrl;
        restaurant.description = description;
        restaurant.location = location;
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
        // if (post.creator.toString() !== req.userId) {
        //   const error = new Error('Not authorized!');
        //   error.statusCode = 403;
        //   throw error;
        // }

        // Check logged in user

        //clearImage(post.imageUrl);
        return Restaurant.findByIdAndRemove(restaurantId);
      })
      // .then(result => {
      //   return User.findById(req.userId);
      // })
      // .then(user => {
      //   user.posts.pull(postId);
      //   return user.save();
      // })
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






  exports.createRestaurantAdmin = (req, res, next) => {
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
    const name = req.body.name;
    const phone = req.body.phone;
    //let creator;
    const restaurantAdmin = new RestaurantAdmin({
      name: name,
      phone: phone
      //creator: req.userId
    });
    restaurantAdmin
      .save()
    //   .then(result => {
    //     return User.findById(req.userId);
    //   })
    //   .then(user => {
    //     creator = user;
    //     user.posts.push(post);
    //     return user.save();
    //   })
      .then(result => {
        res.status(201).json({
          message: 'Restaurant admin added successfully!',
          restaurantAdmin: restaurantAdmin,
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


  exports.updateRestaurantAdmin = (req, res, next) => {
    const restaurantAdminId = req.params.restaurantAdminId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const name = req.body.name;
    const phone = req.body.phone;
    // if (req.file) {
    //   imageUrl = req.file.path.replace("\\","/");
    // }
    
    RestaurantAdmin.findById(restaurantAdminId)
      .then(restaurantAdmin => {
        if (!restaurantAdmin) {
          const error = new Error('Could not find restaurant admin.');
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
        restaurantAdmin.name = name;
        restaurantAdmin.phone = phone;
        return restaurantAdmin.save();
      })
      .then(result => {
        res.status(200).json({ message: 'Restaurant admin updated!', restaurantAdmin: result });
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
        // if (post.creator.toString() !== req.userId) {
        //   const error = new Error('Not authorized!');
        //   error.statusCode = 403;
        //   throw error;
        // }

        // Check logged in user

        //clearImage(post.imageUrl);
        return RestaurantAdmin.findByIdAndRemove(restaurantAdminId);
      })
      // .then(result => {
      //   return User.findById(req.userId);
      // })
      // .then(user => {
      //   user.posts.pull(postId);
      //   return user.save();
      // })
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
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const { validationResult } = require("express-validator/check");

const Restaurant = require("../models/restaurant");
const Food = require("../models/food");
const RestaurantAdmin = require("../models/restaurantAdmin");

const deliveryPartnerURL = "http://localhost:8083/deliveryPartner/";

//get all restaurants
exports.getRestaurants = (req, res, next) => {
  console.log("restaurant service...");
  if (!req.query.userId) {
    const error = new Error("you have not logged in");
    error.statusCode = 401;
    throw error;
  }
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Restaurant.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Restaurant.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((restaurants) => {
      res.status(200).json({
        message: "Fetched restraunts successfully.",
        restaurants: restaurants,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//add restaurant
exports.createRestaurant = (req, res, next) => {
  req.file = req.body.file;
  if (!req.body.userId) {
    const error = new Error("you have not logged in");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isAdmin) {
    const error = new Error("you are not an admin to add restaurant");
    error.statusCode = 401;
    throw error;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path.replace("\\", "/");
  const name = req.body.name;
  const description = req.body.description;
  const location = req.body.location;
  const restaurantAdminId = req.body.restaurantAdminId;
  const restaurant = new Restaurant({
    name: name,
    description: description,
    imageUrl: imageUrl,
    location: location,
    restaurantAdminId: restaurantAdminId,
  });
  restaurant
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Restaurant added successfully!",
        restaurant: restaurant,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get restaurant by id
exports.getRestaurant = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("you have not logged in");
    error.statusCode = 401;
    throw error;
  }
  const restrauntID = req.params.restaurantId;
  Restaurant.findById(restrauntID)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find restaurant.");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "Restaurant fetched.", restaurant: restaurant });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//update restaurant details
exports.updateRestaurant = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isAdmin) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.file = req.body.file;
  const restaurantId = req.params.restaurantId;
  console.log(restaurantId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const description = req.body.description;
  const location = req.body.location;
  let imageUrl = req.body.imageUrl;
  const restaurantAdminId = req.body.restaurantAdminId;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find restaurant.");
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
    .then((result) => {
      res
        .status(200)
        .json({ message: "Restaurant updated!", restaurant: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//delete restaurant
exports.deleteRestaurant = (req, res, next) => {
  const restaurantId = req.params.restaurantId;
  if (!req.body.userId) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isAdmin) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find restaurant.");
        error.statusCode = 404;
        throw error;
      }
      // Check logged in user

      clearImage(restaurant.imageUrl);
      return Restaurant.findByIdAndRemove(restaurantId);
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted restaurant." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get restaurant admins
exports.getRestaurantAdmins = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("you have not logged in");
    error.statusCode = 401;
    throw error;
  }
  if (!req.query.isAdmin) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  RestaurantAdmin.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return RestaurantAdmin.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((restaurantAdmins) => {
      res.status(200).json({
        message: "Fetched restraunt admins successfully.",
        restaurantAdmins: restaurantAdmins,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get restaurant admin by id
exports.getRestaurantAdmin = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("you have not logged in");
    error.statusCode = 401;
    throw error;
  }
  if (!req.query.isAdmin) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const restrauntAdminID = req.params.restaurantAdminId;
  RestaurantAdmin.findById(restrauntAdminID)
    .then((restaurantAdmin) => {
      if (!restaurantAdmin) {
        const error = new Error("Could not find restaurant admin.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Restaurant admin fetched.",
        restaurantAdmin: restaurantAdmin,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//delete restaurant admin
exports.deleteRestaurantAdmin = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("you have not logged in");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isAdmin) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const restaurantAdminId = req.params.restaurantAdminId;
  RestaurantAdmin.findById(restaurantAdminId)
    .then((restaurantAdmin) => {
      if (!restaurantAdmin) {
        const error = new Error("Could not find restaurant admin.");
        error.statusCode = 404;
        throw error;
      }
      return RestaurantAdmin.findByIdAndRemove(restaurantAdminId);
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted restaurant admin." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//accept order delivery request
exports.acceptDeliveryRequest = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isDeliveryPartner) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  console.log("inside restaurant");
  const orderId = req.params.orderId;
  const flag = req.body.flag;
  const restaurantAdminID = req.body.restaurantAdminID;
  const deliveryPartnerId = req.body.userId;
  if (flag !== 1) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  RestaurantAdmin.findById(restaurantAdminID)
    .then((restaurantAdmin) => {
      restaurantAdmin.deliveryRequests.acceptedRequests.push({
        orderId: orderId,
        deliveryPartnerId: deliveryPartnerId,
      });
      return restaurantAdmin.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "delivery order accepted",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//reject order delivery request
exports.rejectDeliveryRequest = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isDeliveryPartner) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const orderId = req.params.orderId;
  const flag = req.body.flag;
  const restaurantAdminID = req.body.restaurantAdminID;
  const deliveryPartnerId = req.body.userId;

  if (flag !== 1) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  RestaurantAdmin.findById(restaurantAdminID)
    .then((restaurantAdmin) => {
      restaurantAdmin.deliveryRequests.rejectedRequests.push({
        orderId: orderId,
        deliveryPartnerId: deliveryPartnerId,
      });
      return restaurantAdmin.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "delivery order rejected",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//submit food rating
exports.giveFoodRating = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isCustomer) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const foodId = req.params.foodId;
  const foodRating = req.body.foodRating;
  const flag = req.body.flag;
  const oldFoodRating = req.body.oldFoodRating;
  Food.findById(foodId)
    .then((food) => {
      if (!food) {
        const error = new Error("Could not find the food.");
        error.statusCode = 404;
        throw error;
      }
      if (req.body.flag !== 1) {
        food.ratings.push(foodRating);
        food.avgRating();
        return food.save();
      }
      if (req.body.flag == 1) {
        for (let j = 0; j < food.ratings; j++) {
          if (food.ratings[j] == oldFoodRating) {
            food.ratings.splice(j, 1);
            food.ratings.push(foodRating);
            food.avgRating();
            return food.save();
          }
        }
      }
    })
    .then((result) => {
      res.status(201).json({
        message: "Rating submitted",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//submit restaurant rating
exports.giveRestaurantRating = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isCustomer) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const restaurantId = req.params.restaurantId;
  const restaurantRating = req.body.restaurantRating;
  const flag = req.body.flag;
  const oldRestaurantRating = req.body.oldRestaurantRating;
  Restaurant.findById(restaurantId)
    .then((restaurant) => {
      if (!restaurant) {
        const error = new Error("Could not find the restaurant.");
        error.statusCode = 404;
        throw error;
      }
      if (req.body.flag !== 1) {
        restaurant.ratings.push(restaurantRating);
        restaurant.avgRating();
        return restaurant.save();
      }
      if (req.body.flag == 1) {
        for (let j = 0; j < restaurant.ratings; j++) {
          if (restaurant.ratings[j] == oldRestaurantRating) {
            restaurant.ratings.splice(j, 1);
            restaurant.ratings.push(restaurantRating);
            restaurant.avgRating();
            return restaurant.save();
          }
        }
      }
    })
    .then((result) => {
      res.status(201).json({
        message: "Rating submitted",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//search food by name and ingredients
exports.searchByFood = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  console.log(req.params.key);
  let data = Food.find({
    $or: [
      { name: { $regex: req.params.key } },
      { description: { $regex: req.params.key } },
    ],
  })
    .then((data) => {
      res.status(201).json({
        message: "result for the search",
        result: data,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//search restaurant by location
exports.searchByLocation = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  console.log(req.params.key);
  let data = Restaurant.find({
    $or: [{ location: { $regex: req.params.key } }],
  })
    .then((data) => {
      res.status(201).json({
        message: "result for the search",
        result: data,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// get all foods
exports.getFoods = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Food.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Food.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((foods) => {
      res.status(200).json({
        message: "Fetched foods successfully.",
        foods: foods,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// add food
exports.createFood = (req, res, next) => {
  const errors = validationResult(req);
  let savedRestaurant;
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const name = req.body.name;
  const description = req.body.description;
  const availability = req.body.availability;
  const price = req.body.price;
  const restaurantId = req.body.restaurantId;
  const restaurantAdminID = req.user._id;
  let restaurant;
  const food = new Food({
    name: name,
    description: description,
    imageUrl: imageUrl,
    availability: availability,
    price: price,
    restaurantId: restaurantId,
    restaurantAdminID: restaurantAdminID,
  });
  food
    .save()
    .then((result) => {
      return Restaurant.findById(restaurantId);
    })
    .then((restaurant) => {
      restaurant = restaurant;
      restaurant.foods.push(food);
      savedRestaurant = restaurant.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Food added successfully!",
        food: food,
      });
      return savedRestaurant;
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get food by id
exports.getFood = (req, res, next) => {
  if (!req.query.userId) {
    const error = new Error("not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const foodId = req.params.foodId;
  console.log(typeof foodId);
  Food.findById(foodId)
    .then((food) => {
      if (!food) {
        const error = new Error("Could not find food.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Food fetched.", food: food });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//update food detais
exports.updateFood = (req, res, next) => {
  const foodId = req.params.foodId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
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
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  Food.findById(foodId)
    .then((food) => {
      if (!food) {
        const error = new Error("Could not find food.");
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
    .then((result) => {
      res.status(200).json({ message: "Food updated!", food: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//delete food
exports.deleteFood = (req, res, next) => {
  const foodId = req.params.foodId;
  let restaurantId;
  Food.findById(foodId)
    .then((food) => {
      if (!food) {
        const error = new Error("Could not find food.");
        error.statusCode = 404;
        throw error;
      }
      clearImage(food.imageUrl);
      restaurantId = food.restaurantId;
      return Food.findByIdAndRemove(foodId);
    })
    .then((result) => {
      return Restaurant.findById(restaurantId);
    })
    .then((restaurant) => {
      restaurant.foods.pull(foodId);
      return restaurant.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted food." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//restaurant admin signup
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const restaurantAdmin = new RestaurantAdmin({
        email: email,
        password: hashedPw,
        name: name,
      });
      return restaurantAdmin.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//restaurant admin login
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  RestaurantAdmin.findOne({ email: email })
    .then((restaurantAdmin) => {
      if (!restaurantAdmin) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = restaurantAdmin;
      return bcrypt.compare(password, restaurantAdmin.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//to clear the image while updating and deleting the food/restaurant details
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

//get all delivery partners
exports.getDeliveryPartners = (req, res, next) => {
  axios
    .get(`${deliveryPartnerURL}deliveryPartners`, {
      params: {
        userId: req.body.userId,
        isRestaurantAdmin: req.body.isRestaurantAdmin,
      },
    })
    .then((response) => {
      if (!response.data.deliveryPartners) {
        const error = new Error("No deliveryPartners found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        deliveryPartners: response.data.deliveryPartners,
        totalItems: response.data.totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//request delivery partner to deliver the order
exports.requestDeliveryPartner = (req, res, next) => {
  const deliveryPartnerId = req.params.deliveryPartnerId;
  const orderId = req.params.orderId;
  req.body.userId = req.user._id;
  axios
    .post(
      `${deliveryPartnerURL}/requestDeliveryPartner/${deliveryPartnerId}/${orderId}`,
      req.body
    )
    .then((response) => {
      if (!response) {
        const error = new Error("cant send restaurant...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

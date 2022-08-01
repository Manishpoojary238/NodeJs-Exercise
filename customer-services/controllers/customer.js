const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Order = require("../models/order");
const axios = require("axios");
const restaurantURL = "http://localhost:8081/restaurantAdmin/";

//updating delivery order status
exports.updateOrderStatus = (req, res, next) => {
  if (!req.body.userId) {
    const error = new Error("not auathenticated.");
    error.statusCode = 401;
    throw error;
  }
  if (!req.body.isDeliveryPartner) {
    const error = new Error("not auathenticated.");
    error.statusCode = 401;
    throw error;
  }
  const orderId = req.params.orderId;
  console.log(orderId);
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        const error = new Error("Could not find the order.");
        error.statusCode = 404;
        throw error;
      }
      order.orderStatus = req.body.orderStatus;
      return order.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Order Status updated!", order: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get cart items
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.foodId")
    .execPopulate()
    .then((user) => {
      const foods = user.cart.items;
      res.status(200).json({
        message: "Fetched cart successfully.",
        foods: foods,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//delete food from cart
exports.cartDeleteFood = (req, res, next) => {
  const foodId = req.params.foodId;
  req.user
    .removeFromCart(foodId)
    .then((result) => {
      res.status(200).json({
        message: "Food deleted from cart.",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//create order
exports.postOrder = (req, res, next) => {
  let cartFoods;
  let total = 0;
  req.user
    .populate("cart.items.foodId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      cartFoods = user.cart.items;
      total = 0;
      cartFoods.forEach((p) => {
        console.log(p);
        total += p.quantity * p.foodId.price;
      });
      const foods = user.cart.items.map((i) => {
        return { quantity: i.quantity, food: { ...i.foodId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        totalAmount: total,
        foods: foods,
        orderStatus: "Order placed",
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.status(200).json({
        message: "Order placed.",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get order details
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.status(200).json({
        orders: orders,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//cancel order
exports.cancelOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        const error = new Error("Could not find the order.");
        error.statusCode = 404;
        throw error;
      }
      return Order.findByIdAndRemove(orderId);
    })
    .then((result) => {
      res.status(200).json({ message: "Order Cancelled." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//customer signup
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
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
      });
      return user.save();
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

//customer login
exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
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

//get all foods
exports.getFoods = (req, res, next) => {
  axios
    .get(`${restaurantURL}foods`, { params: { userId: req.body.userId } })
    .then((response) => {
      if (!response.data.foods) {
        const error = new Error("No foods found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        foods: response.data.foods,
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

//get food by id
exports.getFood = (req, res, next) => {
  const foodId = req.params.foodId;
  axios
    .get(`${restaurantURL}food/${foodId}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.food) {
        const error = new Error("food not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        food: response.data.food,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//get all restaurants
exports.getRestaurants = (req, res, next) => {
  axios
    .get(`${restaurantURL}restaurants`, { params: { userId: req.body.userId } })
    .then((response) => {
      if (!response.data.restaurants) {
        const error = new Error("restaurants not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restraunt: response.data.restaurants,
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
  const restaurantId = req.params.restaurantId;
  axios
    .get(`${restaurantURL}restaurant/${restaurantId}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.restaurant) {
        const error = new Error("restaurant not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        restraunt: response.data.restaurant,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//add food to the cart
exports.postCart = (req, res, next) => {
  const foodId = req.body.foodId;
  console.log(typeof foodId);
  axios
    .get(`${restaurantURL}food/${foodId}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.food) {
        const error = new Error("food not found.");
        error.statusCode = 404;
        throw error;
      }
      console.log(response.data.food);
      req.user.addToCart(response.data.food);
      res.status(200).json({
        message: "food added to cart",
        food: response.data.food,
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
  const foodId = req.params.foodId;
  const foodRating = req.body.foodRating;
  axios
    .get(`${restaurantURL}food/${foodId}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.food) {
        const error = new Error("food not found.");
        error.statusCode = 404;
        throw error;
      }
      if (
        foodRating != 1 &&
        foodRating != 2 &&
        foodRating != 3 &&
        foodRating != 4 &&
        foodRating != 5
      ) {
        const error = new Error("Please enter any rating value from 1 to 5 .");
        error.statusCode = 404;
        throw error;
      }
      let oldFoodRating;
      userFoodRatingArray = req.user.allRatings.foodRatings;
      for (let i = 0; i < userFoodRatingArray.length; i++) {
        if (userFoodRatingArray[i].foodId == foodId) {
          oldFoodRating = req.user.allRatings.foodRatings[i].rating;
          req.user.allRatings.foodRatings[i].rating = foodRating;
          req.body.flag = 1;
          req.body.oldFoodRating = oldFoodRating;
          req.user.save();
          axios
            .post(`${restaurantURL}food-rating/${foodId}`, req.body)
            .then((response) => {
              if (!response.data) {
                const error = new Error("something went wrong");
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
        }
      }
      if (req.body.flag !== 1) {
        req.user.allRatings.foodRatings.push({
          foodId: foodId,
          rating: foodRating,
        });
        axios
          .post(`${restaurantURL}food-rating/${foodId}`, req.body)
          .then((response) => {
            if (!response.data) {
              const error = new Error("something went wrong");
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
        return req.user.save();
      }
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
  const restaurantId = req.params.restaurantId;
  const restaurantRating = req.body.restaurantRating;
  axios
    .get(`${restaurantURL}restaurant/${restaurantId}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.restaurant) {
        const error = new Error("restaurant not found.");
        error.statusCode = 404;
        throw error;
      }
      if (
        restaurantRating != 1 &&
        restaurantRating != 2 &&
        restaurantRating != 3 &&
        restaurantRating != 4 &&
        restaurantRating != 5
      ) {
        const error = new Error("Please enter any rating value from 1 to 5 .");
        error.statusCode = 404;
        throw error;
      }
      let oldRestaurantRating;
      userRestaurantRatingArray = req.user.allRatings.restaurantRatings;
      for (let i = 0; i < userRestaurantRatingArray.length; i++) {
        if (userRestaurantRatingArray[i].restaurantId == restaurantId) {
          oldRestaurantRating = req.user.allRatings.restaurantRatings[i].rating;
          req.user.allRatings.restaurantRatings[i].rating = restaurantRating;
          req.body.flag = 1;
          req.body.oldRestaurantRating = oldRestaurantRating;
          req.user.save();
          axios
            .post(`${restaurantURL}restaurant-rating/${restaurantId}`, req.body)
            .then((response) => {
              if (!response.data) {
                const error = new Error("something went wrong");
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
        }
      }
      if (req.body.flag !== 1) {
        req.user.allRatings.restaurantRatings.push({
          restaurantId: restaurantId,
          rating: restaurantRating,
        });
        axios
          .post(`${restaurantURL}restaurant-rating/${restaurantId}`, req.body)
          .then((response) => {
            if (!response.data) {
              const error = new Error("something went wrong");
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
        return req.user.save();
      }
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
  const key = req.params.key;
  axios
    .get(`${restaurantURL}searchByFood/${key}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.result) {
        const error = new Error("No result found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        result: response.data.result,
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
  const key = req.params.key;
  axios
    .get(`${restaurantURL}searchByLocation/${key}`, {
      params: { userId: req.body.userId },
    })
    .then((response) => {
      if (!response.data.result) {
        const error = new Error("No result found...");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: response.data.message,
        result: response.data.result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

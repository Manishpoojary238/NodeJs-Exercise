const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/user");
const customerController = require("../controllers/customer");
const isAuth = require("../middleware/is-auth");
const isCustomer = require("../middleware/is-customer");

const router = express.Router();

router.get("/foods", isAuth,  customerController.getFoods);

router.get("/food/:foodId", isAuth, isCustomer, customerController.getFood);

router.get(
  "/restaurants",
  isAuth,
  isCustomer,
  customerController.getRestaurants
);

router.get(
  "/restaurant/:restaurantId",
  isAuth,
  isCustomer,
  customerController.getRestaurant
);

router.post("/cart", isAuth, isCustomer, customerController.postCart);

router.get("/cart", isAuth, isCustomer, customerController.getCart);

router.delete(
  "/cart/:foodId",
  isAuth,
  isCustomer,
  customerController.cartDeleteFood
);

router.post("/order", isAuth, isCustomer, customerController.postOrder);

router.get("/orders", isAuth, isCustomer, customerController.getOrders);

router.delete(
  "/order/:orderId",
  isAuth,
  isCustomer,
  customerController.cancelOrder
);

router.put("/orderStatus/:orderId", customerController.updateOrderStatus);

router.post(
  "/food-rating/:foodId",
  isAuth,
  isCustomer,
  customerController.giveFoodRating
);

router.post(
  "/restaurant-rating/:restaurantId",
  isAuth,
  isCustomer,
  customerController.giveRestaurantRating
);

router.get(
  "/searchByFood/:key",
  isAuth,
  isCustomer,
  customerController.searchByFood
);

router.get(
  "/searchByLocation/:key",
  isAuth,
  isCustomer,
  customerController.searchByLocation
);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  customerController.signup
);

router.post("/login", customerController.login);

module.exports = router;

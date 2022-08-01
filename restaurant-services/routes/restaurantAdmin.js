const express = require("express");
const { body } = require("express-validator/check");
const RestaurantAdmin = require("../models/restaurantAdmin");

const restaurantAdminController = require("../controllers/restaurantAdmin");
const isAuth = require("../middleware/is-auth");
const isRestaurantAdmin = require("../middleware/is-restaurantAdmin");

const router = express.Router();

router.get("/restaurants", restaurantAdminController.getRestaurants);

router.post(
  "/restaurant",
  // [
  //   body('name')
  //     .trim()
  //     .isLength({ min: 2 }),
  //   body('description')
  //     .trim()
  //     .isLength({ min: 5 })
  // ],
  restaurantAdminController.createRestaurant
);

router.get(
  "/restaurant/:restaurantId",
  restaurantAdminController.getRestaurant
);

router.put(
  "/restaurant/:restaurantId",
  [
    body("name").trim().isLength({ min: 2 }),
    body("description").trim().isLength({ min: 5 }),
  ],
  restaurantAdminController.updateRestaurant
);

router.delete(
  "/restaurant/:restaurantId",
  restaurantAdminController.deleteRestaurant
);

router.get("/restaurantAdmins", restaurantAdminController.getRestaurantAdmins);

router.get(
  "/restaurantAdmin/:restaurantAdminId",
  restaurantAdminController.getRestaurantAdmin
);

router.delete(
  "/restaurantAdmin/:restaurantAdminId",
  restaurantAdminController.deleteRestaurantAdmin
);

router.post("/food-rating/:foodId", restaurantAdminController.giveFoodRating);

router.post(
  "/restaurant-rating/:restaurantId",
  restaurantAdminController.giveRestaurantRating
);

router.get("/searchByFood/:key", restaurantAdminController.searchByFood);

router.get(
  "/searchByLocation/:key",
  restaurantAdminController.searchByLocation
);

router.get("/foods", restaurantAdminController.getFoods);

router.post(
  "/food",
  isAuth,
  isRestaurantAdmin,
  [
    body("name").trim().isLength({ min: 2 }),
    body("description").trim().isLength({ min: 5 }),
  ],
  restaurantAdminController.createFood
);

router.get("/food/:foodId", restaurantAdminController.getFood);

router.put(
  "/food/:foodId",
  isAuth,
  isRestaurantAdmin,
  [
    body("name").trim().isLength({ min: 2 }),
    body("description").trim().isLength({ min: 5 }),
  ],
  restaurantAdminController.updateFood
);

router.delete(
  "/food/:foodId",
  isAuth,
  isRestaurantAdmin,
  restaurantAdminController.deleteFood
);

router.get(
  "/deliveryPartners",
  isAuth,
  isRestaurantAdmin,
  restaurantAdminController.getDeliveryPartners
);

router.post(
  "/requestDeliveryPartner/:deliveryPartnerId/:orderId",
  isAuth,
  isRestaurantAdmin,
  restaurantAdminController.requestDeliveryPartner
);

router.post(
  "/acceptDeliveryRequest/:orderId",
  restaurantAdminController.acceptDeliveryRequest
);

router.post(
  "/rejectDeliveryRequest/:orderId",
  restaurantAdminController.rejectDeliveryRequest
);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return RestaurantAdmin.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  restaurantAdminController.signup
);

router.post("/login", restaurantAdminController.login);

module.exports = router;

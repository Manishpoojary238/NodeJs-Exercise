const express = require("express");
const { body } = require("express-validator/check");
const Admin = require("../models/admin");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

router.get("/restaurants", isAuth, isAdmin, adminController.getRestaurants);

router.post(
  "/restaurant",
  isAuth,
  isAdmin,
  [
    body("name").trim().isLength({ min: 2 }),
    body("description").trim().isLength({ min: 5 }),
  ],
  adminController.createRestaurant
);

router.get(
  "/restaurant/:restaurantId",
  isAuth,
  isAdmin,
  adminController.getRestaurant
);

router.put(
  "/restaurant/:restaurantId",
  isAuth,
  isAdmin,
  [
    body("name").trim().isLength({ min: 2 }),
    body("description").trim().isLength({ min: 5 }),
  ],
  adminController.updateRestaurant
);

router.delete(
  "/restaurant/:restaurantId",
  isAuth,
  isAdmin,
  adminController.deleteRestaurant
);

router.get(
  "/restaurantAdmins",
  isAuth,
  isAdmin,
  adminController.getRestaurantAdmins
);

router.get(
  "/restaurantAdmin/:restaurantAdminId",
  isAuth,
  isAdmin,
  adminController.getRestaurantAdmin
);

router.delete(
  "/restaurantAdmin/:restaurantAdminId",
  isAuth,
  isAdmin,
  adminController.deleteRestaurantAdmin
);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return Admin.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  adminController.signup
);

router.post("/login", adminController.login);

module.exports = router;

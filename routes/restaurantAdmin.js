const express = require('express');
const { body } = require('express-validator/check');
const RestaurantAdmin = require('../models/restaurantAdmin');

const restaurantAdminController = require('../controllers/restaurantAdmin');
const isAuth = require('../middleware/is-auth');
const isUser = require('../middleware/is-user');

const router = express.Router();

router.get('/foods', isAuth, restaurantAdminController.getFoods);

router.post(
  '/food',
  isAuth,
  isUser.isRestaurantAdmin,
  [
    body('name')
      .trim()
      .isLength({ min: 2 }),
    body('description')
      .trim()
      .isLength({ min: 5 })
  ],
  restaurantAdminController.createFood
);

router.get('/food/:foodId', isAuth, restaurantAdminController.getFood);

  router.put(
    '/food/:foodId',
     isAuth,
     isUser.isRestaurantAdmin,
    [
      body('name')
        .trim()
        .isLength({ min: 2 }),
      body('description')
        .trim()
        .isLength({ min: 5 })
    ],
    restaurantAdminController.updateFood
  );

router.delete('/food/:foodId', isAuth, isUser.isRestaurantAdmin, restaurantAdminController.deleteFood);

router.get('/deliveryPartners', isAuth, isUser.isRestaurantAdmin, restaurantAdminController.getDeliveryPartners);

router.post('/requestDeliveryPartner/:deliveryPartnerId/:orderId', isAuth, isUser.isRestaurantAdmin, restaurantAdminController.requestDeliveryPartner);

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return RestaurantAdmin.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  restaurantAdminController.signup
);

router.post('/login', restaurantAdminController.login);

module.exports = router;

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
//const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /admin/Restaurants
router.get('/restaurants', adminController.getRestaurants);

// POST /admin/restaurant
router.post(
    '/restaurant',
    // [
    //   body('name')
    //     .trim()
    //     .isLength({ min: 3 }),
    //   body('description')
    //     .trim()
    //     .isLength({ min: 5 })
    // ],
    adminController.createRestaurant
  );

  router.get('/restaurant/:restaurantId', adminController.getRestaurant);


  router.put(
    '/restaurant/:restaurantId',
    // isAuth,
    // [
    //   body('title')
    //     .trim()
    //     .isLength({ min: 5 }),
    //   body('content')
    //     .trim()
    //     .isLength({ min: 5 })
    // ],
    adminController.updateRestaurant
  );

  router.delete('/restaurant/:restaurantId', adminController.deleteRestaurant);

  module.exports = router;
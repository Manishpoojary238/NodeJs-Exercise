const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /admin/Restaurants
router.get('/restaurants', adminController.getRestaurants);

// POST /admin/restaurant
router.post(
    '/restaurant',
    isAuth,
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

  router.get('/restaurant/:restaurantId', isAuth,  adminController.getRestaurant);


  router.put(
    '/restaurant/:restaurantId',
    isAuth,
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

  router.delete('/restaurant/:restaurantId', isAuth, adminController.deleteRestaurant);





  router.post(
    '/restaurantAdmin',
    isAuth,
    // [
    //   body('name')
    //     .trim()
    //     .isLength({ min: 3 }),
    //   body('description')
    //     .trim()
    //     .isLength({ min: 5 })
    // ],
    adminController.createRestaurantAdmin
  );

  router.get('/restaurantAdmins', isAuth, adminController.getRestaurantAdmins);

  router.get('/restaurantAdmin/:restaurantAdminId', isAuth, adminController.getRestaurantAdmin);

  router.put(
    '/restaurantAdmin/:restaurantAdminId',
    isAuth,
    // [
    //   body('title')
    //     .trim()
    //     .isLength({ min: 5 }),
    //   body('content')
    //     .trim()
    //     .isLength({ min: 5 })
    // ],
    adminController.updateRestaurantAdmin
  );

  router.delete('/restaurantAdmin/:restaurantAdminId', isAuth,  adminController.deleteRestaurantAdmin);
  module.exports = router;
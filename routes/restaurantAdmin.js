const express = require('express');
const { body } = require('express-validator/check');

const restaurantAdminController = require('../controllers/restaurantAdmin');
//const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /restaurantAdmin/Foods
router.get('/foods', restaurantAdminController.getFoods);

// POST /restaurantAdmin/food
router.post(
  '/food',
  // [
  //   body('name')
  //     .trim()
  //     .isLength({ min: 3 }),
  //   body('description')
  //     .trim()
  //     .isLength({ min: 5 })
  // ],
  restaurantAdminController.createFood
);

router.get('/food/:foodId', restaurantAdminController.getFood);


  router.put(
    '/food/:foodId',
    // isAuth,
    // [
    //   body('title')
    //     .trim()
    //     .isLength({ min: 5 }),
    //   body('content')
    //     .trim()
    //     .isLength({ min: 5 })
    // ],
    restaurantAdminController.updateFood
  );


router.delete('/food/:foodId', restaurantAdminController.deleteFood);

module.exports = router;

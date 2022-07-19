const express = require('express');
const { body } = require('express-validator/check');

const customerController = require('../controllers/customer');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /restaurantAdmin/Foods
router.get('/foods', isAuth, customerController.getFoods);

router.get('/food/:foodId', isAuth, customerController.getFood);

router.post('/cart', isAuth, customerController.postCart);

router.get('/cart', isAuth, customerController.getCart);

router.delete('/cart', isAuth, customerController.postCartDeleteFood);

router.post('/create-order', isAuth, customerController.postOrder);

router.get('/orders', isAuth, customerController.getOrders);

router.delete('/order/:orderId', isAuth, customerController.cancelOrder);

router.post('/food-rating/:foodId', isAuth, customerController.giveFoodRating);

module.exports = router;
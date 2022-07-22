const express = require('express');
const { body } = require('express-validator/check');
const customerController = require('../controllers/customer');
const isAuth = require('../middleware/is-auth');
const isUser = require('../middleware/is-user');

const router = express.Router();

router.get('/foods', isAuth, customerController.getFoods);

router.get('/food/:foodId', isAuth, customerController.getFood);

router.post('/cart', isAuth, isUser.isCustomer, customerController.postCart);

router.get('/cart', isAuth, isUser.isCustomer, customerController.getCart);

router.delete('/cart', isAuth, isUser.isCustomer, customerController.postCartDeleteFood);

router.post('/create-order', isAuth, isUser.isCustomer, customerController.postOrder);

router.get('/orders', isAuth, customerController.getOrders);

router.delete('/order/:orderId', isUser.isCustomer, isAuth, customerController.cancelOrder);

router.post('/food-rating/:foodId', isAuth, isUser.isCustomer, customerController.giveFoodRating);

router.post('/restaurant-rating/:restaurantId', isAuth, isUser.isCustomer, customerController.giveRestaurantRating);

router.get('/search/:key', isAuth, customerController.search);

module.exports = router;
const express = require('express');
const { body } = require('express-validator/check');

const customerController = require('../controllers/customer');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /restaurantAdmin/Foods
router.get('/foods', isAuth, customerController.getFoods);

router.post('/cart', isAuth, customerController.postCart);

module.exports = router;
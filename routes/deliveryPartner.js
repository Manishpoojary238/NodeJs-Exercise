const express = require('express');
const { body } = require('express-validator/check');

const deliveryPartnerController = require('../controllers/deliveryPartner');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
    '/order/:orderId',
     isAuth,
    // [
    //   body('title')
    //     .trim()
    //     .isLength({ min: 5 }),
    //   body('content')
    //     .trim()
    //     .isLength({ min: 5 })
    // ],
    deliveryPartnerController.updateOrderStatus
  );

module.exports = router;
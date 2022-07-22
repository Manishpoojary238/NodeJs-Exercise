const express = require('express');
const { body } = require('express-validator/check');
const DeliveryPartner = require('../models/deliveryPartner');
const deliveryPartnerController = require('../controllers/deliveryPartner');
const isAuth = require('../middleware/is-auth');
const isUser = require('../middleware/is-user');

const router = express.Router();

router.put(
    '/orderStatus/:orderId',
     isAuth,
     isUser.isDeliveryPartner,
    deliveryPartnerController.updateOrderStatus
  );

//router.get('/deliveryRequests', deliveryPartnerController.getDeliveryRequests);

router.post('/acceptDeliveryRequest/:orderId', isAuth, isUser.isDeliveryPartner, deliveryPartnerController.acceptDeliveryRequest);

router.post('/rejectDeliveryRequest/:orderId', isAuth, isUser.isDeliveryPartner, deliveryPartnerController.rejectDeliveryRequest);

  router.put(
    '/signup',
    [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
          return DeliveryPartner.findOne({ email: value }).then(userDoc => {
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
    deliveryPartnerController.signup
  );
  
  router.post('/login', deliveryPartnerController.login);

module.exports = router;
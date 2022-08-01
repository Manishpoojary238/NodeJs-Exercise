const express = require("express");
const { body } = require("express-validator/check");
const DeliveryPartner = require("../models/deliveryPartner");
const deliveryPartnerController = require("../controllers/deliveryPartner");
const isAuth = require("../middleware/is-auth");
const isDeliveryPartner = require("../middleware/is-deliveryPartner");

const router = express.Router();

router.get("/deliveryPartners", deliveryPartnerController.getDeliveryPartners);

router.post(
  "/requestDeliveryPartner/:deliveryPartnerId/:orderId",
  deliveryPartnerController.requestDeliveryPartner
);

router.post(
  "/acceptDeliveryRequest/:orderId",
  isAuth,
  isDeliveryPartner,
  deliveryPartnerController.acceptDeliveryRequest
);

router.post(
  "/rejectDeliveryRequest/:orderId",
  isAuth,
  isDeliveryPartner,
  deliveryPartnerController.rejectDeliveryRequest
);

router.put(
  "/orderStatus/:orderId",
  isAuth,
  isDeliveryPartner,
  deliveryPartnerController.updateOrderStatus
);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return DeliveryPartner.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  deliveryPartnerController.signup
);

router.post("/login", deliveryPartnerController.login);

module.exports = router;

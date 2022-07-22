const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliveryPartnerSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    deliveryRequests:{
        pendingRequests:[
          {
            orderId: {type :Schema.Types.ObjectId, ref: 'Order', required: true},
            restaurantAdminId: { type :Schema.Types.ObjectId, ref: 'RestaurantAdmin', required: true}
          }
        ],
        acceptedRequests:[
            {
              orderId: {type :Schema.Types.ObjectId, ref: 'Order', required: true},
              restaurantAdminId: { type :Schema.Types.ObjectId, ref: 'RestaurantAdmin', required: true}
            }
          ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantAdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    deliveryRequests: {
      acceptedRequests: [
        {
          orderId: { type: Schema.Types.ObjectId, required: true },
          deliveryPartnerId: { type: Schema.Types.ObjectId, required: true },
        },
      ],
      rejectedRequests: [
        {
          orderId: { type: Schema.Types.ObjectId, required: true },
          deliveryPartnerId: { type: Schema.Types.ObjectId, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantAdmin", restaurantAdminSchema);

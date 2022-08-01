const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deliveryPartnerSchema = new Schema(
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
      pendingRequests: [
        {
          orderId: { type: Schema.Types.ObjectId, required: true },
          restaurantAdminId: { type: Schema.Types.ObjectId, required: true },
        },
      ],
      acceptedRequests: [
        {
          orderId: { type: Schema.Types.ObjectId, required: true },
          restaurantAdminId: { type: Schema.Types.ObjectId, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

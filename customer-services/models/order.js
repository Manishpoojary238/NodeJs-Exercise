const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  foods: [
    {
      food: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);

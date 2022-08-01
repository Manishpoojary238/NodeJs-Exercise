const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    restaurantAdminId: {
      type: Schema.Types.ObjectId,
      ref: "RestaurantAdmin",
      required: true,
    },
    foods: [
      {
        type: Schema.Types.ObjectId,
        ref: "Food",
      },
    ],
    ratings: [],
    averageRating: {
      type: Number,
    },
  },
  { timestamps: true }
);

restaurantSchema.methods.avgRating = function () {
  let sum = 0;
  for (let i = 0; i < this.ratings.length; i++) {
    sum += parseInt(this.ratings[i]);
  }
  this.averageRating = sum / this.ratings.length;
};

module.exports = mongoose.model("Restaurant", restaurantSchema);

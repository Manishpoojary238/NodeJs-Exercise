const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    restaurantAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'RestaurantAdmin',
      required: true
    },
    foods: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Food'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
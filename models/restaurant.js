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
    // creator: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
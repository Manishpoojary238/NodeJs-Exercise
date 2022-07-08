const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    price: {
        type: Number,
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

module.exports = mongoose.model('Food', foodSchema);
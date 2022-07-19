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
    availability: {
      type: String,
      required: true
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    ratings : [],
    averageRating: {
      type: Number
    }
    // ratings: {
    //   individualRatings: [],
    //   totalRatings: Number
    // }
  },
  { timestamps: true }
);


foodSchema.methods.avgRating = function() {
  let sum = 0;
  //Food.findById(foodId)
  
    for( let i=0; i< this.ratings.length ; i++){
      sum+= this.ratings[i];
    }
    this.averageRating = (sum/this.ratings.length)
    //return this.save();

}


module.exports = mongoose.model('Food', foodSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
  cart: {
    items: [
      {
        foodId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  allRatings: {
    foodRatings: [
      {
        foodId: { type: Schema.Types.ObjectId, required: true },
        rating: { type: Number, required: true },
      },
    ],
    restaurantRatings: [
      {
        restaurantId: { type: Schema.Types.ObjectId, required: true },
        rating: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (food) {
  const cartFoodIndex = this.cart.items.findIndex((cp) => {
    return cp.foodId.toString() === food._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartFoodIndex >= 0) {
    newQuantity = this.cart.items[cartFoodIndex].quantity + 1;
    updatedCartItems[cartFoodIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      foodId: food._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (foodId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.foodId.toString() !== foodId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

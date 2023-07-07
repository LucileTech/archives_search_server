const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    archives: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Archive",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    date: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;

const mongoose = require("mongoose");

const ArchiveSchema = new mongoose.Schema(
  {
    title: { type: String, required: true},
    description: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array, required: true },
    price: { type: Number, required: true },
    user: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    contributorId: 
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contributor",
      },
  },
  { timestamps: true }
);

const Archive = mongoose.model("Archive", ArchiveSchema);
module.exports = Archive;

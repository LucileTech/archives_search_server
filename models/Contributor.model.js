const mongoose = require("mongoose");

const ContributorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    picture: { type: String, required: true },
    user: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
  },
  { timestamps: true }
);

const Contributor = mongoose.model("Contributor", ContributorSchema);

module.exports = Contributor;

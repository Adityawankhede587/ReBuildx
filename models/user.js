
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["Contractor", "Builder", "Homeowner", "Recycler", "Buyer", "Other"],
    default: "Contractor",
  },
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
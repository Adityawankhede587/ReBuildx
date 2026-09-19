const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Cement",
      "Steel & Iron",
      "Bricks & Blocks",
      "Tiles & Marble",
      "Doors & Windows",
      "Pipes & Plumbing",
      "Electrical",
      "Paints & Finishes",
      "Wood & Timber",
      "Other",
    ],
    default: "Other",
  },
  condition: {
    type: String,
    enum: [
      "Brand New / Surplus",
      "Like New / Unused",
      "Gently Used / Salvaged",
      "Scrap / Recyclable",
    ],
    default: "Brand New / Surplus",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unit: {
    type: String,
    enum: [
      "Bags",
      "Pieces",
      "Sq. Ft.",
      "Tonnes",
      "Kg",
      "Meters",
      "Liters",
      "Units",
      "Lots",
    ],
    default: "Units",
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "India",
  },
  contactPhone: {
    type: String,
    default: "",
  },
  contactEmail: {
    type: String,
    default: "",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

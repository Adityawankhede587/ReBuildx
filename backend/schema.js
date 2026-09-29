const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid(
        "Cement",
        "Steel & Iron",
        "Bricks & Blocks",
        "Tiles & Marble",
        "Doors & Windows",
        "Pipes & Plumbing",
        "Electrical",
        "Paints & Finishes",
        "Wood & Timber",
        "Other"
      )
      .default("Other"),
    condition: Joi.string()
      .valid(
        "Brand New / Surplus",
        "Like New / Unused",
        "Gently Used / Salvaged",
        "Scrap / Recyclable"
      )
      .default("Brand New / Surplus"),
    quantity: Joi.number().min(1).required(),
    unit: Joi.string()
      .valid(
        "Bags",
        "Pieces",
        "Sq. Ft.",
        "Tonnes",
        "Kg",
        "Meters",
        "Liters",
        "Units",
        "Lots"
      )
      .default("Units"),
    price: Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0).allow(null, "").default(0),
    location: Joi.string().required(),
    country: Joi.string().default("India").allow("", null),
    contactPhone: Joi.string().allow("", null),
    contactEmail: Joi.string().email().allow("", null),
    image: Joi.string().allow("", null),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
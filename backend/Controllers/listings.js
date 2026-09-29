const Listing = require("../models/listing.js");
const User = require("../models/user.js");

module.exports.index = async (req, res) => {
  const { search, category, condition } = req.query;
  let filter = {};

  if (category && category !== "All") {
    filter.category = category;
  }

  if (condition && condition !== "All") {
    filter.condition = condition;
  }

  if (search && search.trim() !== "") {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
      { category: searchRegex },
    ];
  }

  const allListings = await Listing.find(filter).sort({ createdAt: -1 });

  res.render("listings/index.ejs", {
    allListings,
    search: search || "",
    activeCategory: category || "All",
    activeCondition: condition || "All",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Kept for backward compatibility
module.exports.rederNewForm = module.exports.renderNewForm;

module.exports.createListing = async (req, res) => {
  let url = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60";
  let filename = "default_material_image";

  if (typeof req.file !== "undefined") {
    url = req.file.path;
    filename = req.file.filename;
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  if (!newListing.contactEmail && req.user.email) {
    newListing.contactEmail = req.user.email;
  }
  if (!newListing.contactPhone && req.user.phone) {
    newListing.contactPhone = req.user.phone;
  }

  await newListing.save();

  req.flash("success", "Surplus material listed successfully on ReBuildX!");
  res.redirect(`/listing/${newListing._id}`);
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "The material listing you are looking for does not exist.");
    return res.redirect("/listing");
  }

  let discountPercent = 0;
  if (listing.originalPrice && listing.originalPrice > listing.price) {
    discountPercent = Math.round(
      ((listing.originalPrice - listing.price) / listing.originalPrice) * 100
    );
  }

  let isWishlisted = false;
  if (req.user && req.user.wishlist) {
    isWishlisted = req.user.wishlist.some(
      (wishId) => wishId.toString() === listing._id.toString()
    );
  }

  res.render("listings/show.ejs", { listing, discountPercent, isWishlisted });
};

module.exports.renderEditListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The material listing you are looking for does not exist.");
    return res.redirect("/listing");
  }
  let originalImageUrl = listing.image ? listing.image.url : "";
  if (originalImageUrl && originalImageUrl.includes("/upload")) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Material listing updated successfully!");
  res.redirect(`/listing/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Material listing removed successfully.");
  res.redirect("/listing");
};

module.exports.toggleWishlist = async (req, res) => {
  let { id } = req.params;
  let user = await User.findById(req.user._id);

  const index = user.wishlist.indexOf(id);
  if (index > -1) {
    user.wishlist.splice(index, 1);
    await user.save();
    req.flash("success", "Removed from saved materials.");
  } else {
    user.wishlist.push(id);
    await user.save();
    req.flash("success", "Added to saved materials!");
  }

  res.redirect(req.get("referer") || `/listing/${id}`);
};

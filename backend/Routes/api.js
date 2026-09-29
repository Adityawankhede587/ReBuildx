const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const passport = require("passport");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const { listingSchema, reviewSchema } = require("../schema.js");

// API Auth Middleware
const isApiLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Please log in first to perform this action." });
  }
  next();
};

const isApiOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Material listing not found." });
  }
  if (!listing.owner.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "You are not authorized to edit or delete this listing." });
  }
  next();
};

const isApiReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found." });
  }
  if (!review.author.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: "You are not authorized to delete this review." });
  }
  next();
};

// ==========================================
// 1. LISTINGS ENDPOINTS
// ==========================================

// GET /api/listings (List, Search, Filter, Sort)
router.get("/listings", wrapAsync(async (req, res) => {
  const { search, category, condition, sort } = req.query;
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

  let sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { price: 1 };
  if (sort === "price-high") sortOption = { price: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };

  const listings = await Listing.find(filter).sort(sortOption).populate("owner", "username role email phone");

  res.json({
    success: true,
    count: listings.length,
    listings,
    activeCategory: category || "All",
    activeCondition: condition || "All",
    search: search || ""
  });
}));

// GET /api/listings/:id (Single Material Details)
router.get("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author", select: "username role createdAt" } })
    .populate("owner", "username email phone role");

  if (!listing) {
    return res.status(404).json({ success: false, message: "Material listing not found." });
  }

  let isOwner = false;
  let isSaved = false;

  if (req.user) {
    if (listing.owner && listing.owner._id && req.user._id.equals(listing.owner._id)) {
      isOwner = true;
    }
    const userDoc = await User.findById(req.user._id);
    if (userDoc && userDoc.wishlist) {
      isSaved = userDoc.wishlist.some(wId => wId.equals(listing._id));
    }
  }

  const originalPrice = listing.originalPrice || 0;
  const price = listing.price || 0;
  const discountPercent = (originalPrice > price && originalPrice > 0)
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  res.json({
    success: true,
    listing,
    discountPercent,
    isOwner,
    isSaved
  });
}));

// POST /api/listings (Create Listing)
router.post("/listings", isApiLoggedIn, upload.single("image"), wrapAsync(async (req, res) => {
  let url = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60";
  let filename = "default_material_image";

  if (req.file) {
    url = req.file.path;
    filename = req.file.filename;
  } else if (req.body.imageUrl) {
    url = req.body.imageUrl;
    filename = "custom_image";
  }

  const listingData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category || "Other",
    condition: req.body.condition || "Brand New / Surplus",
    quantity: Number(req.body.quantity) || 1,
    unit: req.body.unit || "Units",
    price: Number(req.body.price) || 0,
    originalPrice: Number(req.body.originalPrice) || 0,
    location: req.body.location,
    country: req.body.country || "India",
    contactPhone: req.body.contactPhone || req.user.phone || "",
    contactEmail: req.body.contactEmail || req.user.email || "",
    owner: req.user._id,
    image: { url, filename }
  };

  const newListing = new Listing(listingData);
  await newListing.save();

  res.status(201).json({
    success: true,
    message: "Surplus material listed successfully on ReBuildX!",
    listing: newListing
  });
}));

// PUT /api/listings/:id (Update Listing)
router.put("/listings/:id", isApiLoggedIn, isApiOwner, upload.single("image"), wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found." });
  }

  if (req.body.title) listing.title = req.body.title;
  if (req.body.description) listing.description = req.body.description;
  if (req.body.category) listing.category = req.body.category;
  if (req.body.condition) listing.condition = req.body.condition;
  if (req.body.quantity) listing.quantity = Number(req.body.quantity);
  if (req.body.unit) listing.unit = req.body.unit;
  if (req.body.price) listing.price = Number(req.body.price);
  if (typeof req.body.originalPrice !== "undefined") listing.originalPrice = Number(req.body.originalPrice);
  if (req.body.location) listing.location = req.body.location;
  if (req.body.country) listing.country = req.body.country;
  if (req.body.contactPhone) listing.contactPhone = req.body.contactPhone;
  if (req.body.contactEmail) listing.contactEmail = req.body.contactEmail;

  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
  } else if (req.body.imageUrl) {
    listing.image = { url: req.body.imageUrl, filename: "custom_image" };
  }

  await listing.save();

  res.json({
    success: true,
    message: "Material listing updated successfully!",
    listing
  });
}));

// DELETE /api/listings/:id (Delete Listing)
router.delete("/listings/:id", isApiLoggedIn, isApiOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.json({
    success: true,
    message: "Listing deleted successfully."
  });
}));

// POST /api/listings/:id/wishlist (Toggle Saved Material)
router.post("/listings/:id/wishlist", isApiLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (!user.wishlist) {
    user.wishlist = [];
  }

  const isSaved = user.wishlist.some(wId => wId.equals(id));

  if (isSaved) {
    user.wishlist = user.wishlist.filter(wId => !wId.equals(id));
  } else {
    user.wishlist.push(id);
  }

  await user.save();

  res.json({
    success: true,
    isSaved: !isSaved,
    message: !isSaved ? "Saved to your Wishlist!" : "Removed from your Wishlist.",
    wishlistCount: user.wishlist.length
  });
}));

// ==========================================
// 2. REVIEWS ENDPOINTS
// ==========================================

// POST /api/listings/:id/reviews
router.post("/listings/:id/reviews", isApiLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ success: false, message: "Rating and comment are required." });
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found." });
  }

  const newReview = new Review({
    rating: Number(rating),
    comment: comment.trim(),
    author: req.user._id,
  });

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  const populatedReview = await Review.findById(newReview._id).populate("author", "username role createdAt");

  res.status(201).json({
    success: true,
    message: "Review submitted successfully!",
    review: populatedReview
  });
}));

// DELETE /api/listings/:id/reviews/:reviewId
router.delete("/listings/:id/reviews/:reviewId", isApiLoggedIn, isApiReviewAuthor, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  res.json({
    success: true,
    message: "Review deleted successfully."
  });
}));

// ==========================================
// 3. AUTHENTICATION & USER ENDPOINTS
// ==========================================

// POST /api/auth/signup
router.post("/auth/signup", wrapAsync(async (req, res, next) => {
  try {
    const { username, email, password, phone, role } = req.body;
    const user = new User({ email, username, phone, role: role || "Contractor" });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.status(201).json({
        success: true,
        message: "Welcome to ReBuildX! Account created successfully.",
        user: {
          _id: registeredUser._id,
          username: registeredUser.username,
          email: registeredUser.email,
          phone: registeredUser.phone,
          role: registeredUser.role,
          wishlist: registeredUser.wishlist || []
        }
      });
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
}));

// POST /api/auth/login (Login via Email or Mobile Number or Username)
router.post("/auth/login", wrapAsync(async (req, res, next) => {
  const identifier = (req.body.identifier || req.body.username || req.body.email || req.body.phone || "").trim();
  const { password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter your email / mobile number and password."
    });
  }

  const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escaped = escapeRegex(identifier);

  const searchConditions = [
    { email: new RegExp(`^${escaped}$`, "i") },
    { username: new RegExp(`^${escaped}$`, "i") },
    { phone: identifier }
  ];

  // If identifier contains digits, match against clean phone number or ending digits
  const digitsOnly = identifier.replace(/\D/g, "");
  if (digitsOnly.length >= 7) {
    searchConditions.push({ phone: new RegExp(`${digitsOnly}$`) });
  }

  const user = await User.findOne({ $or: searchConditions });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "No account found with this email or mobile number."
    });
  }

  const authResult = await user.authenticate(password);
  if (!authResult.user) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password. Please try again."
    });
  }

  req.login(user, (loginErr) => {
    if (loginErr) return next(loginErr);
    res.json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wishlist: user.wishlist || []
      }
    });
  });
}));

// GET /api/auth/current_user
router.get("/auth/current_user", wrapAsync(async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.json({ success: true, user: null });
  }

  const userDoc = await User.findById(req.user._id).select("-salt -hash");
  res.json({
    success: true,
    user: userDoc
  });
}));

// POST /api/auth/logout
router.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error during logout." });
    }
    res.json({ success: true, message: "Logged out successfully." });
  });
});

// GET /api/auth/wishlist (User's Saved Materials)
router.get("/auth/wishlist", isApiLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "owner", select: "username role email phone" }
  });

  res.json({
    success: true,
    wishlist: user ? user.wishlist : []
  });
}));

// GET /api/auth/profile (Full user profile with stats)
router.get("/auth/profile", isApiLoggedIn, wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("-salt -hash");
  const listingsCount = await Listing.countDocuments({ owner: req.user._id });
  const wishlistCount = user.wishlist ? user.wishlist.length : 0;

  res.json({
    success: true,
    user,
    stats: {
      listingsCount,
      wishlistCount
    }
  });
}));

// PUT /api/auth/profile (Update Profile Information)
router.put("/auth/profile", isApiLoggedIn, wrapAsync(async (req, res) => {
  const { username, email, phone, role } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  // Check if username changed and is already taken
  if (username && username.trim() !== user.username) {
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser && !existingUser._id.equals(user._id)) {
      return res.status(400).json({ success: false, message: "Username is already taken by another user." });
    }
    user.username = username.trim();
  }

  if (email) user.email = email.trim();
  if (typeof phone !== "undefined") user.phone = phone.trim();
  if (role) user.role = role;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully!",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wishlist: user.wishlist || []
    }
  });
}));

// PUT /api/auth/change-password (Change Password)
router.put("/auth/change-password", isApiLoggedIn, wrapAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new passwords are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  try {
    await user.changePassword(currentPassword, newPassword);
    res.json({
      success: true,
      message: "Password changed successfully!"
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.name === "IncorrectPasswordError" || err.message?.includes("Password or username is incorrect")
        ? "The current password you entered is incorrect."
        : (err.message || "Failed to change password.")
    });
  }
}));

// GET /api/auth/my-listings (Surplus Materials created by current user)
router.get("/auth/my-listings", isApiLoggedIn, wrapAsync(async (req, res) => {
  const myListings = await Listing.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .populate("owner", "username role email phone");

  res.json({
    success: true,
    count: myListings.length,
    listings: myListings
  });
}));

module.exports = router;

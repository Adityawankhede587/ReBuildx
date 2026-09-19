const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../Controllers/listings.js");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Wishlist toggle
router.post(
  "/:id/wishlist",
  isLoggedIn,
  wrapAsync(listingController.toggleWishlist)
);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditListing)
);

module.exports = router;

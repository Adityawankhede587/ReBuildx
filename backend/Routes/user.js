const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../Controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    wrapAsync(async (req, res, next) => {
      const identifier = (req.body.identifier || req.body.username || req.body.email || req.body.phone || "").trim();
      const { password } = req.body;

      if (!identifier || !password) {
        req.flash("error", "Please enter your email/mobile number and password.");
        return res.redirect("/login");
      }

      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escaped = escapeRegex(identifier);
      const searchConditions = [
        { email: new RegExp(`^${escaped}$`, "i") },
        { username: new RegExp(`^${escaped}$`, "i") },
        { phone: identifier }
      ];
      const digitsOnly = identifier.replace(/\D/g, "");
      if (digitsOnly.length >= 7) {
        searchConditions.push({ phone: new RegExp(`${digitsOnly}$`) });
      }

      const user = await User.findOne({ $or: searchConditions });
      if (!user) {
        req.flash("error", "No account found with this email or mobile number.");
        return res.redirect("/login");
      }

      const authResult = await user.authenticate(password);
      if (!authResult.user) {
        req.flash("error", "Incorrect password. Please try again.");
        return res.redirect("/login");
      }

      req.login(user, (err) => {
        if (err) return next(err);
        userController.login(req, res);
      });
    })
  );

router.get("/logout", userController.logout);

router.get("/wishlist", isLoggedIn, wrapAsync(userController.getWishlist));

module.exports = router;

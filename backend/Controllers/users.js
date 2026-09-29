const User = require("../models/user.js");
const Listing = require("../models/listing.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password, phone, role } = req.body;
    const newUser = new User({
      email,
      username,
      phone: phone || "",
      role: role || "Contractor",
    });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to ReBuildX! Start buying & selling surplus materials.");
      res.redirect("/listing");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to ReBuildX!");
  let redirectUrl = res.locals.redirectUrl || "/listing";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out successfully.");
    res.redirect("/listing");
  });
};

module.exports.getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "owner" },
  });

  res.render("users/wishlist.ejs", { wishlistItems: user.wishlist || [] });
};

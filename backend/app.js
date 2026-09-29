require("dotenv").config();


const PORT = process.env.PORT || 3001;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cors = require("cors");
const User = require("./models/user.js");
const listingRouter = require("./Routes/listings.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");
const apiRouter = require("./Routes/api.js");

const dbUrl= process.env.ATLASDB_URL;

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));


main()
  .then(() => {
    console.log("connected to DB succesfully");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/+$/, "");

app.locals.basePath = BASE_PATH;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

if (BASE_PATH) {
  app.use(BASE_PATH, express.static(path.join(__dirname, "public")));
}
app.use(express.static(path.join(__dirname, "public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error",(err) =>{
  console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOption ={
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  }

}

app.use(session(sessionOption));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());



passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.basePath = BASE_PATH;
  res.locals.success= req.flash("success");
  res.locals.error= req.flash("error");
  res.locals.currUser = req.user;

  const origRedirect = res.redirect.bind(res);
  res.redirect = function (first, second) {
    let url = typeof first === "number" ? second : first;
    let status = typeof first === "number" ? first : null;
    if (BASE_PATH && typeof url === "string" && url.startsWith("/") && !url.startsWith(BASE_PATH)) {
      url = `${BASE_PATH}${url}`;
    }
    return status ? origRedirect(status, url) : origRedirect(url);
  };

  next();
})


app.get(["/favicon.ico", "/sw.js", "/service-worker.js"], (req, res) => res.status(204).end());

const mainRouter = express.Router();
mainRouter.get(["/favicon.ico", "/sw.js", "/service-worker.js"], (req, res) => res.status(204).end());

const fs = require("fs");
const frontendDist = fs.existsSync(path.join(__dirname, "..", "frontend", "dist"))
  ? path.join(__dirname, "..", "frontend", "dist")
  : path.join(__dirname, "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

mainRouter.use("/api", apiRouter);
mainRouter.use("/listing",listingRouter);
mainRouter.use("/listing/:id/reviews",reviewRouter);
mainRouter.use("/",userRouter);

if (BASE_PATH) {
  app.use(BASE_PATH, mainRouter);
}
app.use("/", mainRouter);
app.use("/api", apiRouter);

if (fs.existsSync(frontendDist)) {
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next(new ExpressError(404, "API route not found"));
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  mainRouter.get("/", (req, res) => {
    res.redirect(`${BASE_PATH}/listing`);
  });
}

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    err.statusCode = 400;
  }

  let { statusCode = 500, message = "Something went wrong!" } = err;

  // Return JSON error response for API requests
  if (req.originalUrl.startsWith("/api") || req.xhr || req.headers.accept?.includes("application/json")) {
    return res.status(statusCode).json({ success: false, message });
  }

  if (statusCode === 404) {
    console.warn(`[404 Not Found] ${req.method} ${req.originalUrl}`);
  } else {
    console.error(`[${statusCode} Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.locals.currUser = req.user || null;
  res.status(statusCode).render("error.ejs", { message, basePath: BASE_PATH, currUser: req.user || null });
});



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
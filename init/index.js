require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");
const User = require("../models/user");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB successfully for seeding");
    return initDB();
  })
  .then(() => {
    console.log("Database initialized with ReBuildX surplus materials data!");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Find a default user or create one if none exists
  let defaultUser = await User.findOne({});
  if (!defaultUser) {
    const demoUser = new User({
      email: "contractor@rebuildx.com",
      username: "ReBuildX_Partner",
      phone: "+91 98200 12345",
      role: "Contractor",
    });
    defaultUser = await User.register(demoUser, "password123");
  }

  const sampleData = initData.data.map((obj) => ({
    ...obj,
    owner: defaultUser._id,
  }));

  await Listing.insertMany(sampleData);
};

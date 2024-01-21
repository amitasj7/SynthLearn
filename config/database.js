const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database connect successfully"))
    .catch((error) => {
      console.log("Database Connection Failed");
      console.error("your error is : ", error);
      process.exit(1);
    });
};

const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const userScheme = new Schema(
  {
    phoneNumber: { type: String, require: true },
    password: { type: String, require: true },
    cookies: [{}],
    localStorage: {},
  },
  { versionKey: false }
);

const UserModel = mongoose.model("User", userScheme);

module.exports = UserModel;

const mongoose = require("mongoose");

let userInfoSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
    },
    Email: {
      type: String,
    },
    Contact: {
      type: String,
    },
    Password: {
      type: String,
    },
    Otp: {
      type: Number,
      default: 0,
    },
    OtpVerify: {
      type: String,
    },
  },
  { timestamps: true }
);

const UserInfo = mongoose.model("Signup", userInfoSchema);
UserInfo.getUserByEmail = (Email, callback) => {
  UserInfo.findOne({ Email }, callback);
};

UserInfo.updateOTP = (Email, Otp, callback) => {
  UserInfo.findOneAndUpdate(
    { Email },
    { $set: { Otp } },
    { new: true },
    callback
  );
};

module.exports = UserInfo;

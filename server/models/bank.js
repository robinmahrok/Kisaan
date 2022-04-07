const mongoose = require("mongoose");

let bankInfoSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
    },
    UserId: {
      type: String,
    },
    Email: {
      type: String,
    },
    Bank: {
      type: String,
    },
    AccountType: {
      type: String,
    },
    AccountNumber: {
      type: Number,
    },
    Amount: {
      type: Number,
      default: 0,
    },
    Status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const BankInfo = mongoose.model("banks", bankInfoSchema);

BankInfo.getUserByEmail = (Email, callback) => {
  BankInfo.findOne({ Email }, callback);
};

BankInfo.updateOTP = (Email, Otp, callback) => {
  BankInfo.findOneAndUpdate(
    { Email },
    { $set: { Otp } },
    { new: true },
    callback
  );
};

module.exports = BankInfo;

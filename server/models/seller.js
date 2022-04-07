const mongoose = require("mongoose");

let sellerInfoSchema = new mongoose.Schema(
  {
    SellerId:{
        type:String
    },
    Name: {
        type: String,
      },
      Email: {
        type: String,
      },
      Contact: {
        type: String,
      },
      Product: {
        type: String,
      },
      Variety: {
        type: String,
      },
      Address: {
        type: String,
      },
      Quantity: {
        type: String,
      },
      Price: {
        type: String,
      },
      State:{
        type: String,
      },
      City:{
        type: String,
      },
      Pin:{
        type: String,
      }
  },
  { timestamps: true }
);

const SellerInfo = mongoose.model("sellerInfo", sellerInfoSchema);


module.exports = SellerInfo;

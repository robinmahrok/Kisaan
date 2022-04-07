const mongoose = require("mongoose");

let requestInfoSchema = new mongoose.Schema(
  {
    SellerId: {
        type: String,
      },
      BuyerId: {
        type: String,
      },
      SellerName: {
        type: String,
      }, 
      BuyerName: {
        type: String,
      },
      Status:{
          type:Number,
          default:0
      }
  },
  { timestamps: true }
);

const RequestInfo = mongoose.model("requestInfo", requestInfoSchema);


module.exports = RequestInfo;

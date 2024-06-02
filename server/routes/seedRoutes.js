// let express = require("express");
const BankInfo = require("../models/bank");
const SeedInfo = require("../models/seed");
const userInfo = require("../models/userInfo");
const SellerInfo = require("../models/seller");
var utils = require("../controllers/utils");
const { models } = require("mongoose");
const express = require("express");
const { RequestInfo } = require("../models");

module.exports = function (router) {
  router.post("/createAccount", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var Email = auth.email.split(",")[1],
        UserId = req.body.userData.id,
        Name = auth.email.split(",")[0],
        Bank = req.body.bankDetails.bankName,
        AccountType = req.body.bankDetails.accountType;
      var AccountNumber = 0;
      BankInfo.countDocuments(
        { UserId: UserId, Bank: Bank, AccountType: AccountType },
        function (err, c) {
          if (c > 0)
            res
              .status(200)
              .send({ status: false, message: "Account Already Created." });
          else {
            BankInfo.countDocuments({}, function (err, c) {
              AccountNumber = c + 1;
              BankInfo.create(
                {
                  Name: Name,
                  UserId: UserId,
                  Email: Email,
                  Bank: Bank,
                  AccountType: AccountType,
                  AccountNumber: AccountNumber,
                },
                function (err, data) {
                  if (!err) {
                    res
                      .status(200)
                      .send({ status: true, message: data.AccountNumber });
                  } else
                    res.status(200).send({
                      status: false,
                      message: "Can not Create Account",
                    });
                }
              );
            });
          }
        }
      );
    } else {
      res.status(200).send({ status: false, message: "Invalid Token" });
    }
  });

  router.post("/products", (req, res) => {
    var token = req.body.token;

    var auth = utils.authenticateToken(token);
    if (auth != false) {
      // SeedInfo.create({
      //   Products:{
      //       "Potato":[{
      //        0:"Pukhraj",
      //        1:"Chipsona",
      //        2:"Chandramukhi"
      //        }],
      //       "Paddy":[{
      //        0:"Pusa-834",
      //        1:"Ratnagiri-3"
      //       }],
      //       "Wheat":[{
      //        0:"VL-832",
      //        1:"PBW-343",
      //        3:"VL-804",
      //        4:"HS-365",
      //        5:"HS-240"
      //       }]
      //   }
      //  });
      SeedInfo.find({}, function (err, data) {
        if (err) throw err;

        if (err || data == null)
          res
            .status(200)
            .send({ status: false, message: "Something went wrong" });
        else {
          res.status(200).send({ status: true, message: data[0].Products });
        }
      });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/uploadFile", (req, res) => {
    let imageFile = req.files.file;
    imageFile.mv(
      `./public/images/` + req.body.fileName + `.jpg`,
      function (err) {
        if (err) {
          return res.status(500).send(err);
        } else res.status(200).send({ status: true, message: "working" });
      }
    );
  });

  router.post("/addSellerData", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];
      var name = req.body.Name,
        contact = req.body.Contact,
        product = req.body.Product,
        variety = req.body.Variety,
        quantity = req.body.Quantity,
        address = req.body.Address,
        price = req.body.Price,
        state = req.body.State,
        city = req.body.City,
        zip = req.body.Pin,
        sellerId = req.body.SellerId;

      SellerInfo.create(
        {
          SellerId: sellerId,
          Email: email,
          Name: name,
          Contact: contact,
          Product: product,
          Variety: variety,
          Address: address,
          Quantity: quantity,
          Price: price,
          State: state,
          City: city,
          Pin: zip,
        },
        function (err, value) {
          if (err)
            res
              .status(200)
              .send({ status: false, message: "Can not insert value" });
          else {
            SellerInfo.find({})
              .sort({ _id: -1 })
              .limit(10)
              .exec(function (err, docs) {
                if (!err) {
                  res.status(200).send({ status: true, message: docs[0]._id });
                } else res.status(200).send({ status: false, message: err });
              });
          }
        }
      );
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/getItemsList", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];
      SellerInfo.find({})
        .sort({ _id: -1 })
        .exec(function (err, docs) {
          if (!err) {
            let items = []
            for(let i=0;i<docs.length;i++){
              if(docs[i].Email != email){
                items.push(docs[i]);
              }
            }
            res.status(200).send({ status: true, message: items });
          } else res.status(200).send({ status: false, message: err });
        });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/allItems", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];
      SellerInfo.find({ Email: email }, { Name: 0, Email: 0 })
        .sort({ _id: -1 })
        .exec(function (err, data) {
          if (!err) {
            res.status(200).send({ status: true, message: data });
          } else res.status(200).send({ status: false, message: "No Items found" });
        });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/editItems", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];
      var id = req.body.id,
        price = req.body.price,
        quantity = req.body.quantity,
        contact = req.body.contact,
        address = req.body.address;

      SellerInfo.findOneAndUpdate(
        { Email: email, _id: id },
        {
          Price: price,
          Quantity: quantity,
          Contact: contact,
          Address: address,
        },
        function (err, data) {
          if (err)
            res.status(200).send({ status: false, message: "No data found" });
          else {
            res.status(200).send({ status: true, message: "data is updated" });
          }
        }
      );
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/deleteItems", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];
      var id = req.body.id;
      SellerInfo.deleteOne({ Email: email, _id: id }, function (err, data) {
        if (err)
          res.status(200).send({ status: false, message: "No Accounts found" });
        else {
          res
            .status(200)
            .send({ status: true, message: "Data Deleted Successfully" });
        }
      });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/addRequest", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var sellerId = req.body.sellerId;
      var buyerId = req.body.buyerId;
      var sellerName = req.body.sellerName;
      var buyerName = req.body.buyerName;

      RequestInfo.create(
        {
          SellerId: sellerId,
          BuyerId: buyerId,
          SellerName: sellerName,
          BuyerName: buyerName,
        },
        function (err, value) {
          if (err) {
            res
              .status(200)
              .send({ status: false, message: "Can not send Request" });
          } else {
            res.status(200).send({ status: true, message: "Request Sent" });
          }
        }
      );
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/getRequestData", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var sellerId = req.body.sellerId;
      var buyerId = req.body.buyerId;
      RequestInfo.find({ SellerId: sellerId, BuyerId: buyerId }).exec(function (
        err,
        docs
      ) {
        if (err || docs == "") {
          res.status(200).send({ status: false, message: "No Data" });
        } else {
          res.status(200).send({ status: true, message: docs[0].Status });
        }
      });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/allRequests", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var id = auth.email.split(",")[3];
      RequestInfo.find({ SellerId: id })
        .sort({ _id: -1 })
        .exec(function (err, data) {
          if (!err) {
            res.status(200).send({ status: true, message: data });
          } else res.status(200).send({ status: false, message: "No Requests found" });
        });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/ApproveOrDeny", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];
      var id = req.body.id,
        status = req.body.decision;
      var value;


      if (status == "Approve") value = 1;
      else if (status == "Deny") value = -1;
      else value = 0;
      RequestInfo.findOneAndUpdate(
        { _id: id },
        { Status: value },
        function (err, data) {
          if (err)
            res.status(200).send({ status: false, message: "No data found" });
          else {
            res.status(200).send({ status: true, message: "data is updated" });
          }
        }
      );
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });
};

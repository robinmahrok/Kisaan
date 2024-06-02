// let express = require("express");
const userInfo = require("../models/userInfo");
var { mailer } = require("../controllers/mailer");
var utils = require("../controllers/utils");
const { models } = require("mongoose");
// router = express.Router();
var globalEmail = "";

module.exports = function (router) {
  var error = "";
  router.get("/", (req, res) => {
    res.status(200).send({ message: "Working" })
  });

  //signup api
  router.post("/signup", (req, res) => {
    req.session.email1 = req.body.email;
    var name = req.body.name,
      email = req.body.email,
      contact = req.body.contact,
      password = req.body.password;
    if (
      req.body.name == null ||
      typeof req.body.name == undefined ||
      req.body.name == ""
    ) {
      res.status(200).send({ status: false, message: "name not found" });
    } else if (
      req.body.email == null ||
      typeof req.body.email == undefined ||
      req.body.email.length == 0 ||
      req.body.password == null ||
      typeof req.body.password == undefined ||
      req.body.password.length == 0
    ) {
      res
        .status(200)
        .send({ status: false, message: "email/password not found" });
    } else if (req.body.contact == null ||
      typeof req.body.contact == undefined ||
      req.body.contact.length == 0) {
      res.status(200).send({ status: false, message: "undefined User Details" });
    }

    globalEmail = req.session.email1;

    //password check with Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character
    function passwordCheck(password1) {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/.test(
        password1
      );
    }

    function emailCheck(password1) {
      return /^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        password1
      );
    }
    var hashedpass = "";

    userInfo.getUserByEmail(email, (err, user) => {
      if (err || !user) {
        // checking email and password criteria
        if (!!emailCheck(email)) {
          if (!!passwordCheck(password)) {
            utils.generateHash(password, function (err, hash) {
              if (!err && hash) {
                hashedpass = hash;

                userInfo.create({
                  Name: name,
                  Email: email,
                  Contact: contact,
                  Password: hashedpass,
                  OtpVerify: "Pending",
                  Otp: 0,
                });
                if (userInfo.create())
                  res
                    .status(200)
                    .send({ status: true, message: "User Created" });
              } else {
                res
                  .status(200)
                  .send({ status: false, message: "Hash not created" });
              }
            });
          } else {
            res.status(200).send({
              status: false,
              message:
                "Password should contains atleast 6 characters consists of uppercase,lowercase,number and character",
            });
            //res.render('register-err-success',{success:0,message:"Password should contains atleast 6 characters consists of uppercase,lowercase,number and character"});
          }
        } else {
          res
            .status(200)
            .send({ status: false, message: "Email does not met criteria" });
          //res.render('register-err-success',{success:0,message:"You have entered an invalid email address! Only college mail Id is allowed"});
        }
      } else {
        res.status(200).send({ status: false, message: "User Already Exist" });
      }
    });
  });
  //signup api end

  const sendOTP = (recipient, otpVal, callback) => {
    mailer(
      {
        email: recipient,
        otpVal,
      },
      (result) => {
        if (result && result.status == 1000) {
          console.log("Otp Sent!");
        } else {
          callback("Unable to send OTP through email", null);
        }
      }
    );
  };

  //send and update otp in database api
  router.post("/sendOtp", (req, res) => {
    var email = req.body.email;

    if (
      req.body.email == null ||
      typeof req.body.email == undefined ||
      req.body.email.length == 0
    ) {
      res
        .status(200)
        .send({ status: false, message: "Email is missing, Please enter." });
    } else {
      userInfo.getUserByEmail(email, (err, user) => {
        if (err || !user) {
          res.status(200).send({ status: false, message: "User not found!" });
        } else {
          function genOTP(min, max) {
            return Math.floor(min + Math.random() * max);
          }

          var otpVal = genOTP(100000, 900000);
          sendOTP(email, otpVal, (err) => {
            if (err) {
              res.status(400).send({
                status: false,
                message: err,
              });
            }
          });
          userInfo.updateOTP(email, otpVal, (err, updatedUser) => {
            if (err) {
              res.status(400).send({
                status: false,
                message: err,
              });
            } else {
              res.status(200).send({
                status: true,
              });
            }
          });
        }
      });
    }
  });

  router.post("/verifyOtp", (req, res) => {
    var email = req.body.email;

    userInfo.find({ Email: email, Otp: req.body.otp }).then((data) => {
      if (data.length == 0) {
        res.status(200).send({ status: false, message: "Invalid Email" });
        // res.redirect('/otphtml');
      } else {
        res.status(200).send({ status: true, message: "OTP Verified" });
      }
    });
  });

  //verify OTP api
  router.post("/otpVerify", (req, res) => {
    var email = req.body.email;

    userInfo.find({ Email: email }).then((data) => {
      if (data.length == 0) {
        res.status(200).send({ status: false, message: "Invalid Email" });
        // res.redirect('/otphtml');
      } else {
        //update verified in otpVerify
        userInfo.updateOne(
          { Email: globalEmail },
          { OtpVerify: "Verified" },
          function (err, otpVerified) {
            if (err)
              res
                .status(200)
                .send({ status: false, message: "Unable to update User data" });
            //res.redirect('/');
            else
              res
                .status(200)
                .send({ status: true, message: "OTP Verified Successfully!!" });
          }
        );
      }
    });
  });

  // change password api
  router.post("/changePassword", (req, res) => {
    var userpass = req.body.password;
    var email = req.body.email;

    // checking password criteria
    if (!!utils.passwordCheck(userpass)) {
      utils.generateHash(userpass, function (err, hash) {
        if (!err && hash) {
          hashedpass = hash;

          // Update password with hash value
          userInfo.updateOne(
            { Email: email },
            { Password: hashedpass },
            function (err, passwordUpdate) {
              if (err)
                res.status(200).send({
                  status: false,
                  message: "Unable to update User data",
                });
              else if (passwordUpdate.length != 0) {
                res.status(200).send({
                  status: true,
                  message: "Password Updated Successfully",
                });
              }
            }
          );
        } else res.status(200).send({ status: false, message: "Password doesn't met requirement" });
      });
    }
  });

  // login api starts
  router.post("/login", (req, res) => {
    var email = req.body.email,
      password = req.body.password;

    if (
      req.body.email == null ||
      typeof req.body.email == undefined ||
      req.body.email.length == 0 ||
      req.body.password == null ||
      typeof req.body.password == undefined ||
      req.body.password.length == 0
    ) {
      res.status(200).send({ status: false, message: "Enter email/password" });
    }

    globalEmail = email;
    var hashedpass = "";

    userInfo.find({ Email: email }).then((data) => {
      if (data.length == 0) {
        res.status(200).send({ status: false, message: "User Not Found" });
      } else {
        var dbpass = data[0].Password;
        var otpver = data[0].OtpVerify;
        var name = data[0].Name;
        var contact = data[0].Contact;
        var id = data[0]._id;

        utils.validatePassword(password, dbpass, function (err, data) {
          if (!err && data) {
            if (otpver == "Verified") {
              var nameEmail = name + "," + email + "," + contact + "," + id;
              const token = utils.generateAccessToken(nameEmail);
              res.status(200).send({ status: true, message: token });
            } else {
              res
                .status(200)
                .send({ status: false, message: "Otp not verified." });
              // res.redirect('/otprevalid');
            }
          } else {
            res.status(200).send({ status: false, message: "Wrong Creds!" });
          }
        });
      }
    });
  });
  //login api ends

  // getDetails api starts
  router.post("/getDetails", (req, res) => {
    var token = req.body.token;
    var auth = utils.authenticateToken(token);
    if (auth != false) {
      var email = auth.email.split(",")[1];

      userInfo.find({ Email: email }).then((data) => {
        if (data.length == 0) {
          res.status(200).send({ status: false, message: "User Not Found" });
        } else {
          var result = {
            id: data[0]._id,
            name: data[0].Name,
            email: data[0].Email,
            FatherName: data[0].FatherName,
            Contact: data[0].Contact,
            Country: data[0].Country,
            State: data[0].State,
            City: data[0].City,
            Address: data[0].Address,
            ZipCode: data[0].ZipCode,
          };
          res.status(200).send({ status: true, message: result });
        }
      });
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });
  //getDetails api ends

  router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return console.log(err);
      }
      res.redirect("/");
    });
  });
};

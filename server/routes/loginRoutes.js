import { userInfo } from "../repositories/index.js";
import { mailer } from "../controllers/mailer.js";
import utils from "../controllers/utils.js";

const ping = (req, res) => {
  res.status(200).send({ message: "Working" });
};

const signup = async (req, res) => {
  req.session.email1 = req.body.email;
  let name = req.body.name,
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
  } else if (
    req.body.contact == null ||
    typeof req.body.contact == undefined ||
    req.body.contact.length == 0
  ) {
    res.status(200).send({ status: false, message: "undefined User Details" });
  }

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
  let hashedpass = "";

  try {
    const user = await userInfo.getUserByEmail(email);
    if (!user) {
      // checking email and password criteria
      if (!!emailCheck(email)) {
        if (!!passwordCheck(password)) {
          utils.generateHash(password, async function (err, hash) {
            if (!err && hash) {
              hashedpass = hash;

              await userInfo.create({
                name: name,
                email: email,
                contact: contact,
                password: hashedpass,
                otpVerify: "Pending",
                otp: 0,
              });
              res.status(200).send({ status: true, message: "User Created" });
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
        }
      } else {
        res
          .status(200)
          .send({ status: false, message: "Email does not met criteria" });
      }
    } else {
      res.status(200).send({ status: false, message: "User Already Exist" });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: "Database error" });
  }
};

const emailOTP = async (recipient, otpVal, callback) => {
  try {
    const mailOptions = {
      to: recipient,
      subject: "OTP verification",
      html: "<h1>Hello</h1><p>Your OTP is : </p><b>" + otpVal + "</b>",
    };

    await mailer(mailOptions);
    callback(null, { status: 1000 });
  } catch (error) {
    callback("Unable to send OTP through email", null);
  }
};

const sendOtp = async (req, res) => {
  let email = req.body.email;

  if (
    req.body.email == null ||
    typeof req.body.email == undefined ||
    req.body.email.length == 0
  ) {
    res
      .status(200)
      .send({ status: false, message: "Email is missing, Please enter." });
  } else {
    try {
      const user = await userInfo.getUserByEmail(email);
      if (!user) {
        res.status(200).send({ status: false, message: "User not found!" });
      } else {
        function genOTP(min, max) {
          return Math.floor(min + Math.random() * max);
        }

        let otpVal = genOTP(100000, 900000);
        emailOTP(email, otpVal, (err) => {
          if (err) {
            res.status(400).send({
              status: false,
              message: err,
            });
          }
        });

        try {
          await userInfo.updateOTP(email, otpVal);
          res.status(200).send({
            status: true,
          });
        } catch (error) {
          res.status(400).send({
            status: false,
            message: error.message,
          });
        }
      }
    } catch (error) {
      res.status(500).send({ status: false, message: "Database error" });
    }
  }
};

const verifyOtp = async (req, res) => {
  let email = req.body.email;

  try {
    const data = await userInfo.find({ email: email, otp: req.body.otp });
    if (data.length == 0) {
      res.status(200).send({ status: false, message: "Invalid OTP or Email" });
    } else {
      try {
        await userInfo.updateOne(
          { email: email },
          { otpVerify: "verified", isActive: true }
        );
        res
          .status(200)
          .send({ status: true, message: "OTP Verified Successfully!!" });
      } catch (error) {
        res
          .status(200)
          .send({ status: false, message: "Unable to update User data" });
      }
    }
  } catch (error) {
    res.status(500).send({ status: false, message: "Database error" });
  }
};

const changePassword = async (req, res) => {
  let userpass = req.body.password;
  let email = req.body.email;

  // checking password criteria
  if (!!utils.passwordCheck(userpass)) {
    utils.generateHash(userpass, async function (err, hash) {
      if (!err && hash) {
        hashedpass = hash;

        // Update password with hash value
        try {
          const passwordUpdate = await userInfo.updateOne(
            { email: email },
            { password: hashedpass }
          );
          if (passwordUpdate) {
            res.status(200).send({
              status: true,
              message: "Password Updated Successfully",
            });
          }
        } catch (error) {
          res.status(200).send({
            status: false,
            message: "Unable to update User data",
          });
        }
      } else {
        res.status(200).send({
          status: false,
          message: "Password doesn't met requirement",
        });
      }
    });
  }
};

const login = async (req, res) => {
  let email = req.body.email,
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

  try {
    // Use the static method for better performance and consistency
    const data = await userInfo.getUserByEmail(email);
    if (!data) {
      res.status(200).send({ status: false, message: "User Not Found" });
    } else {
      let dbpass = data.password;
      let otpver = data.otpVerify;
      let name = data.name;
      let contact = data.contact;
      let id = data._id;
      utils.validatePassword(password, dbpass, function (err, data) {
        if (!err && data) {
          if (otpver == "verified") {
            let nameEmail = name + "," + email + "," + contact + "," + id;
            const token = utils.generateAccessToken(nameEmail);
            res.status(200).send({ status: true, message: token });
          } else {
            res
              .status(200)
              .send({ status: false, message: "Otp not verified." });
          }
        } else {
          res.status(200).send({ status: false, message: "Wrong Creds!" });
        }
      });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: "Database error" });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
};

export default {
  ping,
  signup,
  sendOtp,
  verifyOtp,
  changePassword,
  login,
  logout,
};

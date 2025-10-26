import { userInfo } from "../repositories/index.js";
import { mailer } from "../controllers/mailer.js";
import utils from "../controllers/utils.js";
import axios from "axios";

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
                otpVerify: "Verified",
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

const emailOTP = async (recipient, otpVal) => {
  try {
    const mailOptions = {
      to: recipient,
      subject: "OTP verification",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">Khetihat</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for registering with Khetihat! Please use the following OTP to verify your email:</p>
        
        <div style="background: #f0f0f0; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
          <h1 style="margin: 10px 0; color: #667eea; font-size: 36px; letter-spacing: 5px; font-weight: bold;">${otpVal}</h1>
          <p style="margin: 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">If you didn't request this verification, please ignore this email.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            This is an automated email, please do not reply.
          </p>
        </div>
      </div>
    </div>`,
    };
    // let result = await mailer(mailOptions);
    let result = await axios.post("https://vqiiflny4m.execute-api.us-east-1.amazonaws.com/default/email-sender", mailOptions);
    return { status: true, message: result.data };
  } catch (error) {
    return { status: false, message: "Unable to send OTP through email" };
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
        let result = await emailOTP(email, otpVal);
        if (result.status) {
          console.log("result", result);
          try {
            await userInfo.updateOTP(email, otpVal);
            res
              .status(200)
              .send({ status: true, message: "OTP sent successfully!!" });
          } catch (error) {
            res
              .status(200)
              .send({ status: false, message: "Unable to update User data" });
          }
        } else {
          res.status(400).send({ status: false, message: result.message });
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

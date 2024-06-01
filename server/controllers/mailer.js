const nodemailer = require("nodemailer");
const EMAIL_USERNAME = "";
const COMMON_NAME = "Robin Singh";
const { credentials, token } = require("../config/config");
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const mailSettings = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",
  from: `"${COMMON_NAME}"`,
  auth: {
    user: process.env?.EMAIL_USERNAME,
    pass: process.env?.EMAIL_PASSWORD  
  }  
};
let transporter = nodemailer.createTransport(mailSettings);

const mailer = (data, cb) => {
  let mailOptions = {
    from: '"Kisaan" <' + mailSettings.auth.user + ">",
    to: data.email,
    subject: "OTP verification",
    html: "<h1>Hello</h1><p>Your OTP is : </p><b>" + data.otpVal + "</b>", // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      cb({ status: 1001 });
    } else {
      cb({ status: 1000 });
    }
  });
};

module.exports = { mailer };
//module.exports=mailer2;

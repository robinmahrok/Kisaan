import nodemailer from "nodemailer";
import config from "../config/config.js";
import path from "path";
import dotenv from "dotenv";

const EMAIL_USERNAME = "";
const COMMON_NAME = "Robin Singh";
const { credentials, token } = config;

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const mailSettings = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  service: "Gmail",
  from: `"${COMMON_NAME}"`,
  auth: {
    user: process.env?.EMAIL_USERNAME,
    pass: process.env?.EMAIL_PASSWORD,
  },
};

let transporter = nodemailer.createTransport(mailSettings);

const mailer = async (mailOptions) => {
  try {
    // Use provided mailOptions or create default OTP email
    const finalMailOptions = {
      from: `"Khetihat" <${mailSettings.auth.user}>`,
      ...mailOptions,
    };

    const info = await transporter.sendMail(finalMailOptions);
    return { status: "success", messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Legacy function for backward compatibility
const legacyMailer = (data, cb) => {
  let mailOptions = {
    from: `"Kisaan" <${mailSettings.auth.user}>`,
    to: data.email,
    subject: "OTP verification",
    html: `<h1>Hello</h1><p>Your OTP is : </p><b>${data.otpVal}</b>`,
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

export { mailer, legacyMailer };

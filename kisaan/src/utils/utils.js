import { decodeToken } from "react-jwt";

const Token = (token) => {
  try {
    const tokenValue = decodeToken(token);
    return tokenValue.email;
  } catch (e) {
    return "error " + e;
  }
};

const mobileValidator = (value) => {
  const regMobile = /^[0][1-9]\d{9}$|^[1-9]\d{9}$/;
  if (value.length === 10 && regMobile.test(value)) {
    return true;
  }
  return false;
};

// utils.js
const emailValidator = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export { Token, mobileValidator, emailValidator };

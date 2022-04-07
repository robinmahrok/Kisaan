const bcrypt = require("bcrypt");
const saltRounds = 10;
var config = require("../config/config");
var jwt = require("jsonwebtoken");

const convertObjectToString = (id) => {
  if (typeof id === "object") {
    return id.toString();
  }
  return id;
};

module.exports = {
  getFileExtension: (filename) => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename)[0] : undefined;
  },

  generateAccessToken(email) {
    return jwt.sign({ email: email }, config.TOKEN_SECRET, {
      expiresIn: "1d",
    });
  },

  destroyAccessToken(token) {
    return jwt.destroy(token);
  },

  authenticateToken(auth) {
    //auth=req.headers['authorization']
    const authHeader = auth;

    const user = jwt.verify(authHeader, config.TOKEN_SECRET);
    return user;
  },

  genOTP: (min, max) => {
    return Math.floor(min + Math.random() * max);
  },
  // To convert ObjectId to String
  convertObjectToString: convertObjectToString,

  compareIds: (id1, id2) => {
    return convertObjectToString(id1) === convertObjectToString(id2);
  },

  checkIfIdExistsInArray: (id, array) => {
    convertObjectToString(id).includes(array);
  },

  // To validate Email address is correct format or not using Regex Expression
  validateEmail: (email) => {
    let regexExp =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexExp.test(String(email).toLowerCase());
  },

  // To convert into lower case
  convertToLowerCase: (strValue) => {
    return String(strValue).toLowerCase();
  },

  // To use 'lodash' NPM package for capital logic
  convertToCapitalCase: (str) => {
    str = str.toLowerCase();
    return _.startCase(str);
  },

  //password check with Minimum six characters, at least one uppercase letter, one lowercase letter, one number and one special character
  passwordCheck: (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/.test(
      password
    );
  },

  // generating a hash
  generateHash: (password, callback) => {
    bcrypt.hash(password, saltRounds, function (err, result) {
      return callback(err, result);
    });
  },

  //compare password
  validatePassword: (password, hashpwd, callback) => {
    return bcrypt.compare(password, hashpwd, function (err, result) {
      return callback(err, result);
    });
  },

  // covert date dd-mm-yyyy to date
  getDateFormat: (dateString) => {
    // const dateParts = dateString.split("-");
    // return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

    return moment(dateString, "DD/MM/YYYY").toDate(); // 1st argument - string, 2nd argument - format
  },

  // covert date dd-mm-yyyy to date
  getDateFormatWithHyphen: (dateString) => {
    // const dateParts = dateString.split("-");
    // return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

    return moment(dateString, "DD-MM-YYYY").toDate(); // 1st argument - string, 2nd argument - format
  },
};

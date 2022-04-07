"use strict";
const login_routes = require("./loginRoutes");
const seed_routes = require("./seedRoutes");

const routes = (app) => {
  login_routes(app);
  seed_routes(app);
};
module.exports = routes;

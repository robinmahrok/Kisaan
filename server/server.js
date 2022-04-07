const express = require("express");
const Mongoose = require("mongoose");
const { dbURL } = require(`./config/config`);
const routes = require("./routes/index.js");
var bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

const session = require("express-session");
var cors = require("cors");
const app = express();
Mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false 

});


app.use(fileUpload());
app.use(cors());
app.use(express.static("./public"))
app.use('/static', express.static('./public'))
app.use(
  session({
    secret: "ssshhhhh",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
Mongoose.connection;
routes(app);

app.listen(process.env.PORT || 3005, ()=>{
  console.log("server running...")
});

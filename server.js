const express = require("express");
const authController = require("./controller/authController");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const { chatDocument, User } = require("./model/model");

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

const server = app.listen(port, () => {
  console.log(`Server running at port `, port);
});

//----------------------------- routes------------------------------//
app.get("/", (req, res) => {
  res.send("Hello World");
});
// auths
app.post("/signup", authController.signup_post);
app.get("/verifyAuth", authController.verifyAuth_get);
app.get("/me", authController.Me);
app.post("/login", authController.login_post);
app.get("/logout", authController.logout_get);

// mongoose
const dbURI =
  "mongodb+srv://docs:EzBsS4rtkZ6lPUHy@cluster0.ei5qidr.mongodb.net/Network";

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then((result) => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

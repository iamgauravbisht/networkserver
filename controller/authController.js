const { User } = require("../model/networkSchemas");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, "gb secret", {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

const handleErrors = (err) => {
  console.log("error handler ", err);
  // console.log(err.message, "this is error code", err.code);
  let errors = { username: "", email: "", password: "" };

  // Check if err object and errors property exist
  if (err && err.errors) {
    //incorrect email
    if (err.errors.email) {
      errors.email = err.errors.email.message;
    }

    //incorrect password
    if (err.errors.password) {
      errors.password = err.errors.password.message;
    }

    //validation errors
    if (err.message.includes("User validation failed")) {
      errors.username = err.errors.username.message;
    }
  }

  //login errors
  if (err.message == "Incorrect password") {
    errors.password = err.message;
  }
  if (err.message == "Incorrect email") {
    errors.email = err.message;
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.email = "that email is already registered";
  }
  return errors;
};

module.exports.signup_post = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({ username, email, password });
    const token = createToken(user._id);

    res.status(201).json({ user: user._id, cookie: token });
  } catch (err) {
    // Pass the error to the next middleware or error handler
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.verifyAuth_get = async (req, res, next) => {
  const token = req.query.jwt;
  console.log("token", token);
  if (token) {
    jwt.verify(token, "gb secret", async (err, decodedToken) => {
      if (err) {
        console.log("error verifying token");
        console.log(err.message);
        res.json({ errors: "error verifying token" });
      } else {
        console.log("decodedToken", decodedToken);
        let user = await User.findById(decodedToken.id);
        res.json({ user });
      }
    });
  } else {
    console.log("no token");
    res.json({ errors: "no token" });
  }
};

module.exports.login_post = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);

    const token = createToken(user._id);

    res.status(201).json({ user: user._id, cookie: token });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.updateBio_post = async (req, res, next) => {
  const { bio, userId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        bio: bio,
      },
      { new: true }
    );

    res.status(200).json({ bio: user.bio, message: "bio updated" });
  } catch (err) {}
};

module.exports.Me = async (req, res, next) => {
  const { userId } = req.body;
  const main = await User.findById(userId);
  const user = {
    email: main.email,
    username: main.username,
    date: main.date,
    id: main._id,
    bio: main.bio,
  };
  res.json({ user });
};

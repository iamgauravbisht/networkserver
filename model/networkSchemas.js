const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    lowercase: true,
    minlength: [3, "Minimum username length is 3 characters"],
    maxlength: [16, "Maximum username length is 16 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validation: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Minimum password length is 6 characters"],
    maxlength: [16, "Maximum password length is 16 characters"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
  },
  drafts: [
    {
      post: String,
    },
  ],
  //stores recent chats
  recentChats: {
    type: Array,
  },
  //stores all chats
  allChats: {
    type: Array,
  },
  //stores friends Userids
  friends: [],
  friendsStatus: [
    {
      userIdOfSender: String,
      statusOfRequest: String,
    },
  ],
  //stores blocked users
  blockedUsers: [
    {
      type: String,
    },
  ],
});

// Define Document schema
const chatSchema = new mongoose.Schema({
  _id: String,
  chatPeopleName: [
    {
      user1Name: String,
      user2Name: String,
    },
  ],
  chatPeopleId: [
    {
      user1Id: String,
      user2Id: String,
    },
  ],
  messages: [
    {
      senderId: String,
      message: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  delta: {
    type: mongoose.Schema.Types.Mixed,
    default: "",
  },
});

const postSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  username: String,
  venue: String,
  post: String,
  date: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
  },
  noOfLikes: Number,
  comments: [
    {
      userId: String,
      username: String,
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  // console.log("user about to be created", this);
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect email");
};

// Create User model from User schema
const User = mongoose.model("User", userSchema);

// Create Document model from chatSchema
const chatDocument = mongoose.model("chatDocument", chatSchema);

// Create Document model from postSchema
const postDocument = mongoose.model("postDocument", postSchema);

module.exports = {
  User,
  chatDocument,
  postDocument,
};

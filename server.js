const express = require("express");
const authController = require("./controller/authController");
const chatController = require("./controller/chatController");
const postController = require("./controller/postController");
const userController = require("./controller/userController");
const news = require("./controller/news");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "https://iamgauravbisht.github.io",
  "https://iamgauravbisht.github.io/Network/",
  "https://tangerine-malabi-6f2a2a.netlify.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
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
app.post("/me", authController.Me);
app.post("/login", authController.login_post);
app.post("/updateBio", authController.updateBio_post);
app.post("/bio", authController.bio);

// users
app.post("/search", userController.search);
app.post("/sendFriendRequest", userController.sendFreindRequest);
app.post("/sentFriendRequests", userController.sentFriendRequests);
app.post("/friends", userController.allFriends);
app.post("/recievedFriendRequests", userController.recievedFriendRequestst);
app.post("/acceptFriendRequest", userController.acceptFriendRequest);
app.post("/rejectFriendRequest", userController.rejectFriendRequest);

app.post("/draft", userController.draft);
app.post("/getDraft", userController.getDraft);
app.post("/deleteDraft", userController.deleteDraft);
app.post("/createPost", postController.createPost);
app.post("/getPosts", postController.getPosts);
app.post("/likepost", postController.likePost);
app.post("/unlikepost", postController.unlikePost);
app.post("/postcomment", postController.postComment);
app.post("/getComment", postController.getComments);

// news
app.get("/getHeadlines", news.getHeadlines);

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

// socket
const io = socket(server, {
  cors: {
    origin: [
      "https://iamgauravbisht.github.io",
      "https://tangerine-malabi-6f2a2a.netlify.app",
    ],
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  socket.on("getChat", async (chatDocument) => {
    const chat = await chatController.getChat(chatDocument);
    socket.join(chat._id.toString());
    socket.emit("loadChat", chat.arrayOfChat);

    socket.on("sendMessage", async (messageObject) => {
      // save message to db
      const chat = await chatController.saveChat({
        user1: chatDocument.user1,
        user2: chatDocument.user2,
        message: messageObject,
      });
      if (chat) {
        socket.broadcast
          .to(chat._id.toString())
          .emit("receiveMessage", messageObject);
      }
    });
  });
});

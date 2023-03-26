const express = require("express");
const cors = require("cors");
// const session = require('express-session');
const cookieParser = require('cookie-parser')
// const MongoDBStore = require('connect-mongodb-session')(session);
const connect = require('./db/dbConnection');
const userHelper = require("./helpers/UserHelper");
const friendsHelper = require("./helpers/FriendsHelper");
const chatHelper = require("./helpers/ChatHelper");
const { decrypt } = require("./Encryption/encrypt");

// IMPORT AUTH RELATED FUNCTIONS
const verifyToken = require("./auth/verifyToken");
const createTokens = require("./auth/createTokens");
const getUser = require("./auth/getUserDetails");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: ['http://localhost:3000', 'https://mern-mmessenger.onrender.com'],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Connect to mongodb database
connect()

app.get('/validate-user', verifyToken, (req, res, next) => { })

app.get("/signout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({data: 'Signed out successfully', error: false});
});

app.get('/get-friends',getUser, (req, res, next) => {

  const user = req.user; // Adding user details from getUser middleware

  friendsHelper.getFriendsList(user._id).then((friendsList) => {
    friendsList = friendsList.map(({ password, email, ...rest }) => rest)
    res.status(200).json({ friendsList });
  })
})

app.get('/get-friends-requests', getUser, async (req, res, next) => {
  const user = req.user; // Adding user details from getUser middleware
  friendsHelper.getFriendsRequests(user._id).then((frndReqs) => {
    frndReqs = frndReqs
      .map(({ password, email, ...rest }) => rest)
    res.status(200).json({ frndReqs });
  });
})

app.get('/get-chat-list', getUser, async (req, res, next) => {
  const user = req.user; // Adding user details from getUser middleware
  chatHelper.getChatList(user._id).then((chatList) => {
    chatList = chatList
      .map((chat) => {
        const { password, email, ...rest } = chat.receiver_details;
        return { chats: chat.chats.reverse(), receiver_details: rest };
      })
    // Loop through the chats array
    for (let i = 0; i < chatList.length; i++) {
      // Get the messages array for the current chat
      const chats = chatList[i].chats;

      // Loop through the messages array and update the message value
      for (let j = 0; j < chats.length; j++) {
        chats[j].message = decrypt(chats[j].message);
      }
    }
    res.status(200).json(chatList);
  })
})

app.post("/find-friends", getUser, async (req, res, next) => {
  const user = req.user; // Adding user details from getUser middleware
  let query = req.body.query.trim();
  let searchResults = await friendsHelper.findFriends(query);
  searchResults = searchResults
    .map(({ password, email, ...rest }) => rest)
    .filter((data) => data._id.toString() !== user._id.toString() && data)
  searchResults = await friendsHelper.addFriendsStatus(user._id, searchResults)
  res.send({ searchResults });
})

app.post("/signin", async (req, res) => { createTokens(req, res); });

app.post('/signup', async (req, res) => {
  userHelper.signUp(req.body).then(() => {
    res.json({ success: true })
  }).catch((message) => {
    res.json({ success: false, error: message })
  })
})

const server = app.listen(5000, () => console.log(`Server running on port 5000`));

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://mern-mmessenger.onrender.com'],
    credentials: true
  }
})
require('./socket')(io);
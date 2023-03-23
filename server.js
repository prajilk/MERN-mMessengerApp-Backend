const express = require("express");
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser')
const MongoDBStore = require('connect-mongodb-session')(session);
const connect = require('./db/dbConnection');
const userHelper = require("./helpers/UserHelper");
const friendsHelper = require("./helpers/FriendsHelper");
const chatHelper = require("./helpers/ChatHelper");
const { decrypt } = require("./Encryption/encrypt");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'https://mern-mmessenger.onrender.com','http://192.168.18.25:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors({
  origin: 'https://mern-mmessenger.onrender.com',
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));

// MongoDB session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
});

// Express Session
app.use(session({
  secret: "myKeyFormMessenger",
  saveUninitialized: false,
  resave: false,
  store: store,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
}))

// Connect to mongodb database
connect()

app.get('/session', async (req, res) => {
  if (req.session.user) {
    const user = Object.assign({}, req.session.user);
    delete user.password;
    res.json({ user: user })
  } else {
    res.json({})
  }
})

app.get("/signout", (req, res) => {
  req.session.destroy();
  res.json({});
});

app.get('/get-friends', (req, res) => {
  friendsHelper.getFriendsList(req.session.user._id).then((friendsList) => {
    friendsList = friendsList.map(({ password, email, ...rest }) => rest)
    // socket.to(roomId).emit('get-friends', friendsList);
    res.status(200).json({ friendsList });
  })
})

app.get('/get-friends-requests', async (req, res) => {
  friendsHelper.getFriendsRequests(req.session.user._id).then((frndReqs) => {
    frndReqs = frndReqs
      .map(({ password, email, ...rest }) => rest)
    res.status(200).json({ frndReqs });
  });
})

app.get('/get-chat-list', async (req, res) => {
  chatHelper.getChatList(req.session.user._id).then((chatList) => {
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

app.post("/find-friends", async (req, res) => {
  let query = req.body.query.trim();
  let searchResults = await friendsHelper.findFriends(query);
  searchResults = searchResults
    .map(({ password, email, ...rest }) => rest)
    .filter((data) => data._id.toString() !== req.session.user._id.toString() && data)
  searchResults = await friendsHelper.addFriendsStatus(req.session.user._id, searchResults)
  res.send({ searchResults });
})

app.post("/signin", async (req, res) => {
  userHelper.signIn(req.body).then((user) => {
    req.session.user = user;
    res.json({ error: false })
  }).catch(() => {
    res.json({ error: true })
  })
});

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
    origin: ['http://localhost:3000', 'https://mern-mmessenger.onrender.com','http://192.168.18.25:3000'],
    credentials: true
  }
})
require('./socket')(io);
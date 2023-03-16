const express = require("express");
const cors = require("cors");
const session = require('express-session')
const cookieParser = require('cookie-parser')
const MongoDBStore = require('connect-mongodb-session')(session);
const connect = require('./db/dbConnection');
const userHelper = require("./helpers/UserHelper");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.urlencoded({ extended: false }));

// MongoDB session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  autoRemove: 'interval',
  autoRemoveInterval: 5, // remove expired sessions every 5 minutes
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

app.get("/signout", async (req, res) => {
  req.session.destroy();
  res.json({});
});

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

app.listen(5000, () => console.log(`Server running on port 5000`));
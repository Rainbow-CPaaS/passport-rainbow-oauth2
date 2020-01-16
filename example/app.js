var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , passport = require('passport')
  , util = require('util')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , MemoryStore = require('session-memory-store')(session)
  , RainbowStrategy = require('../').Strategy;

// API Access link for creating client ID and secret:
// https://hub.openrainbow.com/#/dashboard/applications
var RAINBOW_APP_ID      = "--insert-rainbow-application-id-here--"
  , RAINBOW_APP_SECRET  = "--insert-rainbow-application-secret-here--";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Rainbow profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});


// Use the RainbowStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Rainbow
//   profile), and invoke a callback with a user object.
passport.use(new RainbowStrategy({
  clientID: RAINBOW_APP_ID,
  clientSecret: RAINBOW_APP_SECRET,
  callbackURL: "http://127.0.0.1:3000/auth/rainbow/callback",
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Rainbow profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Rainbow account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'cookie_secret',
  name: 'kaas',
  store: new MemoryStore({}),
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

// GET /auth/rainbow
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Rainbow authentication will involve
//   redirecting the user to openrainbow.com.  After authorization, Rainbow
//   will redirect the user back to this application at /auth/rainbow/callback
app.get('/auth/rainbow', passport.authenticate('rainbow', {
  scope: ['all']
}));

// GET /auth/rainbow/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/rainbow/callback',
  passport.authenticate('rainbow', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

server.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

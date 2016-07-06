var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var ejs = require('ejs');
var util = require('util');
var passport = require('passport');
var lyftStrategy = require('passport-lyft').Strategy;
//var ecc = require('eccjs');

var storage = require('node-persist');
storage.initSync();

var app = express();

// configure Express
app.set('views', __dirname + '/../views');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use(express.static(__dirname + '/../public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
  // Reading or generating a publicKey for the user

  //var cachedUser = storage.getItem('user_' + user.id);

  // if (cachedUser) {
  //   console.log('==== serializeUser done');
  //   done(null, user.id);

  // } else { // set in the local storage for the first time
  //   console.log('==== new user');
  //   storage.setItem('user_' + user.id, user);
  // }

  storage.setItem('user_' + user.id, user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, storage.getItem('user_' + id));
});

passport.use(new lyftStrategy({
    clientID: config.auth.lyft.client_id,
    clientSecret: config.auth.lyft.client_secret,
    //callbackURL: 'https://pubnub-auth-chat.herokuapp.com/callback'
    callbackURL: 'http://localhost:3000/callback',
    profileFields: ['id'],
    state: true // without it, auth url fails and you don't get the auth page
  },

  function(accessToken, refreshToken, profile, done) {
    var user = profile;
    user.accessToken = accessToken;
    return done(null, user); 
  }
));



//Routes 

app.get('/', function (req, res) {
  res.render('index', { user: req.user });
});

app.get('/user/:id', function (req, res) {
  if(req.user) {
    try {
      var id = req.params.id;
      var cachedUser = storage.getItem('user_' + id);

      res.send({
        'id':  cachedUser.id
      });

    } catch (e) {
      res.send({'status': 404});
    }
  } else {
    res.send({'status': 403});
  }
  
});

app.get('/login', 
  passport.authenticate('lyft', { scope: ['public', 'profile']})
  /*
  https://www.lyft.com/oauth/authorize?client_id=<client_id>&response_type=code&state=<state>&scope=public&redirect_uri=https:%2F%2Flocalhost%2Foauth2%2Fcallback
  */
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/callback', passport.authenticate('lyft', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

var server = app.listen(process.env.PORT || 3000, function(){
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
});

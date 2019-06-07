# Passport strategy for Rainbow OAuth 2.0

[Passport](http://passportjs.org/) strategies for authenticating with [Rainbow](http://www.openrainbow.com/)
using ONLY OAuth 2.0.

This module lets you authenticate using Rainbow in your Node.js applications.
By plugging into Passport, Rainbow authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-rainbow-oauth2

## Usage of OAuth 2.0

#### Configure Strategy

The Rainbow OAuth 2.0 authentication strategy authenticates users using a Rainbow
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```Javascript
var RainbowStrategy = require( 'passport-rainbow-oauth2' ).Strategy;

passport.use(new RainbowStrategy({
    clientID:     RAINBOW_APP_ID,
    clientSecret: RAINBOW_APP_SECRET,
    callbackURL: "http://yourdomain:3000/auth/rainbow/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ rainbowId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'rainbow'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```Javascript
app.get('/auth/rainbow',
  passport.authenticate('rainbow', { scope:
  	[ 'email', 'profile' ] }
));

app.get( '/auth/rainbow/callback',
	passport.authenticate( 'rainbow', {
		successRedirect: '/auth/rainbow/success',
		failureRedirect: '/auth/rainbow/failure'
}));
```

#### What you will get in profile response ?

```
   provider         always set to `rainbow`
   id
   name             {givenName, familyName, middleName}
   family_name
   given_name
   displayName
   language
   email
   emails
   phone_number
   phone_numbers
   photos
   picture
   update_at
   zoneinfo
```

## Examples

For a complete, working example, refer to the [OAuth 2.0 example](example).

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2012-2019 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>

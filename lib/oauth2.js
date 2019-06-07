/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Rainbow authentication strategy authenticates requests by delegating to
 * Rainbow using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Rainbow application's client id
 *   - `clientSecret`  your Rainbow application's client secret
 *   - `callbackURL`   URL to which Rainbow will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new RainbowStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/rainbow/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://openrainbow.com/api/rainbow/authentication/v1.0/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://openrainbow.com/api/rainbow/authentication/v1.0/oauth/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'rainbow';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.authenticate = function (req, options) {
  options || (options = {})

  OAuth2Strategy.prototype.authenticate.call(this, req, options);
}


/**
 * Retrieve user profile from Rainbow.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `rainbow`
 *   - `id`
 *   - `name`             {givenName, familyName, middleName}
 *   - `family_name`
 *   - `given_name`
 *   - `displayName`
 *   - `language`
 *   - `email`            default
 *   - `[emails]`         { email, type }
 *   - `phone_number`     default
 *   - `[phone_numbers]`
 *   - `[photos]`
 *   - `picture`
 *   - `update_at`
 *   - `zoneinfo`
 *  
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.get('https://openrainbow.com/api/rainbow/enduser/v1.0/users/me', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'rainbow' };
      profile.sub = json.data.id;
      profile.id = json.data.id || json.sub;
      profile.displayName = json.data.displayName;
      profile.name = {
        givenName: json.data.firstName,
        familyName: json.data.lastName,
        middleName: ""
      };
      profile.given_name = json.data.firstName;
      profile.family_name = json.data.lastName;
      profile.middleName = "";

      profile.nickname = json.data.nickName

      if (json.data.language) profile.language = json.data.language;
      if (json.data.emails) {
        profile.emails = json.data.emails.map( item => {return {'value': item.email, 'type': item.type }});
        console.log(JSON.stringify(profile))
        profile.emails.some(function (item) {
          if (item.type === 'work') {
            profile.email = item.value;
            return true
          }
        })
      }

      if (json.data.phoneNumbers) {
        profile.phone_numbers = json.data.phoneNumbers;

        profile.phone_numbers.some(function (phoneNumber) {
          if (phoneNumber.type === 'work') {
            profile.phone_number = phoneNumber
            return true
          }
        })
      }

      if (json.data.lastAvatarUpdateDate) {
        var pictureUrl = 'https://openrainbow.com/api/avatar/' + profile.id;
        var photo = {
          value: pictureUrl
        };
        photo.type = 'default';
        profile.photos = [photo];
        profile.picture = pictureUrl;
      }

      profile.zoneinfo = json.data.timezone;

      profile.update_at = json.data.lastUpdateDate;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

/**
 * Return extra Rainbow-specific parameters to be included in the authorization
 * request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};

  return params;
};


/**
 * Expose `Strategy` directly from package.
 */
exports = module.exports = Strategy;

/**
 * Export constructors.
 */
exports.Strategy = Strategy;

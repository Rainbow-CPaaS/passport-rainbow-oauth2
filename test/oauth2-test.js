var vows = require('vows');
var assert = require('assert');
var util = require('util');
var RainbowStrategy = require('../');


vows.describe('RainbowStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new RainbowStrategy({
        clientID: '8e8c70a0892311e98acf0df48ee7e8eb',
        clientSecret: 'EoPzDp7YX6Z9URRsCHEOKmt4EQxBqYaXRPRtmxPhAyHSakpE6DKKg3Zv5iVbJ5a1'
      },
      function() {});
    },
    
    'should be named rainbow': function (strategy) {
      assert.equal(strategy.name, 'rainbow');
    },
  },
  
  'strategy authorization params': {
    topic: function() {
      return new RainbowStrategy({
        clientID: '8e8c70a0892311e98acf0df48ee7e8eb',
        clientSecret: 'EoPzDp7YX6Z9URRsCHEOKmt4EQxBqYaXRPRtmxPhAyHSakpE6DKKg3Zv5iVbJ5a1'
      },
      function() {});
    },
    
    'should return empty object when parsing invalid options': function (strategy) {
      var params = strategy.authorizationParams({ foo: 'bar' });
      assert.lengthOf(Object.keys(params), 0);
    }
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new RainbowStrategy({
        clientID: '8e8c70a0892311e98acf0df48ee7e8eb',
        clientSecret: 'EoPzDp7YX6Z9URRsCHEOKmt4EQxBqYaXRPRtmxPhAyHSakpE6DKKg3Zv5iVbJ5a1'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = JSON.stringify(require('./profile.json'))
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        
        console.log(JSON.stringify(profile.emails[0]))
        assert.equal(profile.provider, 'rainbow');
        assert.equal(profile.id, '5800c6437e98fd95ea914728');
        assert.equal(profile.displayName, 'Fred Example');
        assert.equal(profile.name.familyName, 'Example');
        assert.equal(profile.name.givenName, 'Fred');
        assert.equal(profile.email, 'fred.example@gmail.com');
        assert.equal(profile.emails[0].type, 'work');
        assert.equal(profile.emails[0].value, 'fred.example@gmail.com');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new RainbowStrategy({
        clientID: '8e8c70a0892311e98acf0df48ee7e8eb',
        clientSecret: 'EoPzDp7YX6Z9URRsCHEOKmt4EQxBqYaXRPRtmxPhAyHSakpE6DKKg3Zv5iVbJ5a1'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);

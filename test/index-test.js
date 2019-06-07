var vows = require('vows');
var assert = require('assert');
var util = require('util');
var rainbow = require('../');


vows.describe('passport-rainbow-oauth2').addBatch({
  
  'module': {
    'should export OAuth 2.0 strategy': function (x) {
      assert.isFunction(rainbow);
    },
    'should make OAuth 2.0 strategy available at .Strategy': function (x) {
      assert.isFunction(rainbow.Strategy);
    }
  },
  
}).export(module);

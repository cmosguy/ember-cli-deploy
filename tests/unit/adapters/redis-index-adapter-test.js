'use strict';

var assert  = require('../../helpers/assert');
var Promise = require('ember-cli/lib/ext/promise');
var Adapter = require('../../../lib/adapters/redis-index-adapter');

describe('redis-index-adpater', function(){
  describe('initialization', function() {
    it('throws error if initiated without config', function() {
      try {
        new Adapter();
      } catch(e) {
        assert.equal(e.message, 'Adapter must define a `connection` property');

        return;
      }

      assert.ok(false, 'Should have thrown an exception');
    });

    it('sets the appId if supplied', function() {
      var subject = new Adapter({
        connection: {},
        appId: 'my-app'
      });

      assert.equal(subject.appId, 'my-app');
    });

    it('uses sets the default appId if one is not supplied', function() {
      var subject = new Adapter({
        connection: {}
      });

      assert.equal(subject.appId, 'default');
    });

    it('sets the redis client if supplied', function() {
      var client = {};
      var subject = new Adapter({
        connection: {},
        client: client
      });

      assert.equal(subject.client, client);
    });

    it('sets the maximum version count', function() {
      var subject = new Adapter({
        connection: {}
      });

      assert.equal(subject.versionCount, 15);
    });
  });

  describe('#_upload', function() {
    it('resolves on a successful upload', function() {
      var client = {
        set: function(key, value) {
          this.key = key;
          this.value = value;
          return Promise.resolve();
        }
      };
      var subject = new Adapter({
        connection: {},
        client: client
      });

      return subject._upload('key', 'value')
        .then(function() {
          assert.equal(client.key, 'key');
          assert.equal(client.value, 'value');
        }, function() {
          assert.ok(false, 'Should have uploaded successfully');
        });
    });
  });

  describe('#_updateVersionList', function() {
    it('resolves on a successful update', function() {
      var client = {
        lpush: function(appId, key) {
          this.appId = appId;
          this.key = key;
          return Promise.resolve();
        }
      };
      var subject = new Adapter({
        connection: {},
        client: client
      });

      return subject._updateVersionList('appId', 'key')
        .then(function() {
          assert.equal(client.appId, 'appId');
          assert.equal(client.key, 'key');
        }, function() {
          assert.ok(false, 'Should have updatedVersions successfully');
        });
    });
  });

  describe('#_trimVersions', function() {
    it('resolves on a successful call', function() {
      var client = {
        ltrim: function(appId, versionCount) {
          this.appId = appId;
          this.versionCount = versionCount;
          return Promise.resolve();
        }
      };
      var subject = new Adapter({
        connection: {},
        client: client
      });

      return subject._trimVersionList('appId', 5)
        .then(function() {
          assert.equal(client.appId, 'appId');
          assert.equal(client.versionCount, 5);
        }, function() {
          assert.ok(false, 'Should have trimmed the version list successfully');
        });
    });
  });
});

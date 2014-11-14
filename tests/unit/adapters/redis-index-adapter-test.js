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
        assert.equal(e.message, 'Adapter must define a `connection` property\n');

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

    it('sets the maximum version count if supplied', function() {
      var subject = new Adapter({
        connection: {},
        versionCount: 4
      });

      assert.equal(subject.versionCount, 4);
    });

    it('sets the default maximum version count if not supplied', function() {
      var subject = new Adapter({
        connection: {}
      });

      assert.equal(subject.versionCount, 15);
    });
  });

  describe('#_key', function() {
    it('returns the current git hash', function() {
      var subject = new Adapter({
        connection: {}
      });

      var sha = subject._key();

      assert.ok(/[0-9a-f]{10}/.test(sha), 'Should return hash');
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

      return subject._upload('appId', 'key', 'value')
        .then(function() {
          assert.equal(client.key, 'appId:key');
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
        ltrim: function(appId, min, max) {
          this.appId = appId;
          this.min = min;
          this.max = max;
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
          assert.equal(client.min, 0);
          assert.equal(client.max, 4);
        }, function() {
          assert.ok(false, 'Should have trimmed the version list successfully');
        });
    });
  });

  describe('#_listVersions', function() {
    it('returns the number of versions specified', function() {
      var client = {
        lrange: function(appId, start, end) {
          this.appId = appId;
          this.start = start;
          this.end = end;

          var result = [1, 2, 3, 4, 5].slice(start, end + 1);

          return Promise.resolve(result);
        }
      };
      var subject = new Adapter({
        connection: {},
        client: client
      });

      return subject._listVersions('appId', 3)
        .then(function(result) {
          assert.equal(result.length, 3);
        }, function() {
          assert.ok(false, 'Should have returned specified number of versions');
        });
    });

    it('returns the default number of versions when count not specified', function() {
      var client = {
        lrange: function(appId, start, end) {
          this.appId = appId;
          this.start = start;
          this.end = end;

          var result = [1, 2, 3, 4, 5].slice(start, end + 1);

          return Promise.resolve(result);
        }
      };
      var subject = new Adapter({
        connection: {},
        client: client,
        versionCount: 4
      });

      return subject._listVersions('appId')
        .then(function(result) {
          assert.equal(result.length, 4);
        }, function() {
          assert.ok(false, 'Should have returned specified number of versions');
        });
    });
  });
});

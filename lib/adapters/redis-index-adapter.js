'use strict';

var GitCommand  = require('gitty/lib/command');
var CoreObject  = require('core-object');
var SilentError = require('ember-cli/lib/errors/silent');
var Promise     = require('ember-cli/lib/ext/promise');

module.exports = CoreObject.extend({
  init: function() {
    if (!this.connection) {
      throw new SilentError('Adapter must define a `connection` property\n');
    }

    this.appId        = this.appId || 'default';
    this.client       = this.client|| require('then-redis').createClient(this.config);
    this.versionCount = this.versionCount || 15;
  },

  upload: function(data) {
    var self         = this;
    var key          = this._key();
    var promises     = {
      index: this._uploadIfNotInVersionList(key, data),
      versions: this._updateVersionList(key)
    };

    return Promise.hash(promises)
      .then(self._trimVersionList.bind(self));
  },

  _key: function() {
    var cmd = new GitCommand('./', 'rev-parse', ['--short=10'], 'HEAD');
    return cmd.execSync().trim();
  },

  _uploadIfNotInVersionList: function(key, value) {
    var self     = this;
    var redisKey = this.appId + ':' + key;

    return this._listVersions()
      .then(function(keys) {
        if (keys.indexOf(key) === -1) {
          return self.client.set(redisKey, value);
        } else {
          var message = 'Version for key [' + key + ']' + ' has already been uploaded\n';
          return Promise.reject(new SilentError(message));
        }
      })
  },

  _updateVersionList: function(key) {
    return this.client.lpush(this.appId, key);
  },

  _trimVersionList: function() {
    return this.client.ltrim(this.appId, 0, this.versionCount - 1);
  },

  _listVersions: function(count) {
    count = count || this.versionCount;
    return this.client.lrange(this.appId, 0, count - 1);
  }
});

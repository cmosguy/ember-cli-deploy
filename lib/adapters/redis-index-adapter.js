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
    this.versionCount = 15;
  },

  upload: function(data) {
    var self         = this;
    var versionCount = this.versionCount;
    var appId        = this.appId;
    var key          = this._key();
    var promises     = {
      index: self._upload(key, data),
      versions: self._updateVersionList(appId, key)
    };

    return Promise.hash(promises)
      .then(self._trimVersionList.bind(self, appId, versionCount));
  },

  _key: function() {
    var cmd = new GitCommand('./', 'rev-parse', ['--short=10'], 'HEAD');
    return cmd.execSync().trim();
  },

  _upload: function(appId, key, value) {
    var redisKey = appId + ':' + key;
    return this.client.set(redisKey, value);
  },

  _updateVersionList: function(appId, key) {
    return this.client.lpush(appId, key);
  },

  _trimVersionList: function(appId, versionCount) {
    return this.client.ltrim(appId, 0, versionCount - 1);
  }
});

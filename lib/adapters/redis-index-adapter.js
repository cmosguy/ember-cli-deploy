'use strict';

var CoreObject  = require('core-object');
var SilentError = require('ember-cli/lib/errors/silent');
var Promise     = require('ember-cli/lib/ext/promise');

module.exports = CoreObject.extend({
  init: function() {
    if (!this.connection) {
      throw new SilentError('Adapter must define a `connection` property');
    }

    this.appId        = this.appId || 'default';
    this.client       = this.client|| require('then-redis').createClient(this.config);
    this.versionCount = 15;
  },

  upload: function(data) {
    var self         = this;
    var versionCount = this.versionCount;
    var appId        = this.appId;
    var key          = id + ':' + this._key();

    return Promise.hash({
      index: self._upload(key, data),
      versions: self._updateVersionList(appId, key)
    })
    .then(self._trimVersionList.bind(self, appId, versionCount));
  },

  _upload: function(key, value) {
    return this.client.set(key, value);
  },

  _updateVersionList: function(appId, key) {
    return this.client.lpush(appId, key);
  },

  _trimVersionList: function(appId, versionCount) {
    return this.client.ltrim(appId, versionCount);
  }
});

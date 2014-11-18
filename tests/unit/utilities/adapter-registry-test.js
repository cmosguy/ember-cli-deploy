'use strict';

var assert          = require('ember-cli/tests/helpers/assert');
var AdapterRegistry = require('../../../lib/utilities/adapter-registry');

describe('utilities/adapter-registry', function() {
  it('returns the first index adapter if there is one or more registered', function() {
    var project = {
      addons: [
        {adapter: {type: 'index-adapter', name: 'a'} },
        {adapter: {type: 'index-adapter', name: 'b'} }
      ]
    };

    var subject = new AdapterRegistry({
      project: project
    });

    var adapter = subject.indexAdapter();

    assert.equal(adapter.name, 'a');
  });

  it('throws an error if no index adapters are registered', function() {
    var project = {
      addons: []
    };

    var subject = new AdapterRegistry({
      project: project
    });

    try {
      subject.indexAdapter();
    } catch(e) {
      assert.equal(e.message, 'No index adapters registered\n');
      return;
    }

    assert.ok(false);
  });
});

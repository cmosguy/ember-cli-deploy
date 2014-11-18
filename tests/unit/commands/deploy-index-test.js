'use strict';

var assert       = require('ember-cli/tests/helpers/assert');
var Task         = require('ember-cli/lib/models/task');
var Promise      = require('ember-cli/lib/ext/promise');
var MockRegistry = require('../../helpers/mock-registry');

describe('deploy:index command', function() {
  var subject
  var tasks;

  beforeEach(function() {
    tasks = {
      DeployIndex: Task.extend({
        run: function(options) {
          return Promise.resolve(options);
        }
      })
    };

    subject = require('../../../lib/commands/deploy-index');

    subject._tasks = tasks;
    subject._registry = MockRegistry;
  });

  it('runs the build task', function() {
    return subject.run(['a'])
      .then(function(options) {
        assert.equal(options[0], 'a');
      }, function() {
        assert.ok(false, 'Should have resolved');
      });
  });
});

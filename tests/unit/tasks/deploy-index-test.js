'use strict';

var assert      = require('ember-cli/tests/helpers/assert');
var Promise     = require('ember-cli/lib/ext/promise');
var MockProject = require('ember-cli/tests/helpers/mock-project');
var MockUI      = require('ember-cli/tests/helpers/mock-ui');

describe('tasks/deploy-index', function() {
  var DeployIndexTask;
  var subject;
  var options;
  var rejected, resolved, failedUpload, succeededUpload;
  var mockUI;

  before(function() {
    DeployIndexTask = require('../../../lib/tasks/deploy-index');

    rejected = function() {
      return Promise.reject();
    };
    resolved = function(value) {
      if (value) {
        return Promise.resolve(value);
      }

      return Promise.resolve();
    };

    failedUpload = {upload: rejected};
    succeededUpload = {upload: resolved.bind(this, 'aaa')};
  });

  beforeEach(function() {
    var mockProject = new MockProject();
    mockProject.root = process.cwd() + '/tests/fixtures';

    mockUI = new MockUI();

    options = {
      project: mockProject,
      ui: mockUI,
      _indexFile: resolved,
      adapters: {
        Redis: function() { return succeededUpload }
      }
    };
  });

  after(function() {
    DeployIndexTask = null;
  });

  it('rejects if index.html cannot be found', function() {
    options._indexFile = rejected;

    subject = new DeployIndexTask(options);

    return subject.run({environment: 'development'})
      .then(function() {
        assert.ok(false);
      }, function(error) {
        assert.equal(error.message, 'index.html could not be found.\n');
      });
  });

  it('rejects if upload fails', function() {
    options.adapters.Redis = function() { return failedUpload };

    subject = new DeployIndexTask(options);

    return subject.run({environment: 'development'})
      .then(function() {
        assert.ok(false, 'Should have rejected');
      }, function() {
        assert.ok(true);
      });
  });

  it('resolves if uploaded succeeds', function() {
    subject = new DeployIndexTask(options);

    return subject.run({environment: 'development'})
      .then(function() {
        assert.equal(mockUI.output, 'ember activate aaa\n');
      }, function() {
        assert.ok(false, 'Should have resolved');
      });
  });
});

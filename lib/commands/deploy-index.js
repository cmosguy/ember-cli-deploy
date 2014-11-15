'use strict';

module.exports = {
  name: 'deploy:index',
  description: 'Deploys index.html to Redis',
  works: 'insideProject',

  _tasks: {
    DeployIndex: require('../tasks/deploy-index')
  },

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'dist-dir', type: String, default: 'dist/' }
  ],

  run: function(commandOptions, rawArgs) {
    var DeployIndexTask = this._tasks.DeployIndex;
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      project: this.project
    });

    return deployIndexTask.run(commandOptions);
  }
};

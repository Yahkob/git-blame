const Blamer = require('./util/blamer');
const BlameListView = require('./views/blame-list-view');

// reference to the Blamer instance created in initializeContext if this
// project is backed by a git repository.
var projectBlamer = null;

function activate() {
  initializeContext();

  // git-blame:blame
  atom.workspaceView.command('git-blame:blame', function() {
    return blame();
  });

  return;
}

function initializeContext() {
  var editor = atom.workspace.activePaneItem;
  var projectRepo = atom.project.getRepo();

  // Ensure this project is backed by a git repository
  if (!projectRepo) {
    // TODO visually alert user
    return console.error('Cant initialize blame! there is no git repo for this project');
  }

  projectBlamer = new Blamer(projectRepo);
}

function blame() {
  var editor = atom.workspace.activePaneItem;
  var filePath = editor.getPath();

  // Nothing to do if projectBlamer isnt defined. Means this project is not
  // backed by git.
  if (!projectBlamer) {
    return;
  }

  projectBlamer.blame(filePath, function(err, blame) {
    if (err) {
      console.error('[ERROR]' + err);
    } else {
      // console.log('BLAME', blame);
      var view = new BlameListView({annotations: blame});
      var activePane = atom.workspaceView.getActivePaneView();
      activePane.find('.editor.is-focused').prepend(view);
    }
  });
}

module.exports = {
  blame: blame,
  activate: activate
};
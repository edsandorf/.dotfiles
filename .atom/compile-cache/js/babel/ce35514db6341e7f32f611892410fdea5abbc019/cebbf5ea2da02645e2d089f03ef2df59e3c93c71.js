Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _termLauncher = require('term-launcher');

var _termLauncher2 = _interopRequireDefault(_termLauncher);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

'use babel';

var HydrogenLauncher = {
  config: {
    app: {
      title: 'Terminal application',
      description: 'This will depend on your operation system.',
      type: 'string',
      'default': _termLauncher2['default'].getDefaultTerminal()
    },
    console: {
      title: 'Jupyter console',
      description: 'Change this if you want to start a `qtconsole` or any other jupyter interface that can be started with `jupyter <your-console> --existing <connection-file>`.',
      type: 'string',
      'default': 'console'
    },
    command: {
      title: 'Custom command',
      description: 'This command will be excuted in the launched terminal. You can access the connection file from Hydrogen by using `{connection-file}` within your command',
      type: 'string',
      'default': ''
    }
  },

  subscriptions: null,
  hydrogen: null,
  platformIoTerminal: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'hydrogen-launcher:launch-terminal': function hydrogenLauncherLaunchTerminal() {
        return _this.launchTerminal();
      },
      'hydrogen-launcher:launch-jupyter-console': function hydrogenLauncherLaunchJupyterConsole() {
        return _this.launchJupyter();
      },
      'hydrogen-launcher:launch-jupyter-console-in-platformio-terminal': function hydrogenLauncherLaunchJupyterConsoleInPlatformioTerminal() {
        return _this.launchJupyterInPlatformIoTerminal();
      },
      'hydrogen-launcher:launch-terminal-command': function hydrogenLauncherLaunchTerminalCommand() {
        return _this.launchTerminal(true);
      },
      'hydrogen-launcher:copy-path-to-connection-file': function hydrogenLauncherCopyPathToConnectionFile() {
        return _this.copyPathToConnectionFile();
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  consumeHydrogen: function consumeHydrogen(hydrogen) {
    var _this2 = this;

    this.hydrogen = hydrogen;
    return new _atom.Disposable(function () {
      _this2.hydrogen = null;
    });
  },

  consumePlatformIoTerminal: function consumePlatformIoTerminal(provider) {
    var _this3 = this;

    this.platformIoTerminal = provider;
    return new _atom.Disposable(function () {
      _this3.platformIoTerminal = null;
    });
  },

  launchTerminal: function launchTerminal() {
    var command = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var cmd = undefined;
    if (command) {
      cmd = this.getCommand();
      if (!cmd) return;
    }
    _termLauncher2['default'].launchTerminal(cmd, this.getCWD(), this.getTerminal(), function (err) {
      if (err) {
        atom.notifications.addError(err.message);
      }
    });
  },

  launchJupyter: function launchJupyter() {
    var connectionFile = this.getConnectionFile();
    if (!connectionFile) return;

    var jpConsole = atom.config.get('hydrogen-launcher.console');
    _termLauncher2['default'].launchJupyter(connectionFile, this.getCWD(), jpConsole, this.getTerminal(), function (err) {
      if (err) atom.notifications.addError(err.message);
    });
  },

  launchJupyterInPlatformIoTerminal: function launchJupyterInPlatformIoTerminal() {
    var _this4 = this;

    var connectionFile = this.getConnectionFile();
    if (!connectionFile) return;

    var jpConsole = atom.config.get('hydrogen-launcher.console');
    _termLauncher2['default'].getConnectionCommand(connectionFile, jpConsole, function (err, command) {
      if (!_this4.platformIoTerminal) {
        atom.notifications.addError('PlatformIO IDE Terminal has to be installed.');
      } else if (err) {
        atom.notifications.addError(err.message);
      } else {
        _this4.platformIoTerminal.run([command]);
      }
    });
  },

  copyPathToConnectionFile: function copyPathToConnectionFile() {
    var connectionFile = this.getConnectionFile();
    if (!connectionFile) return;

    atom.clipboard.write(connectionFile);
    var message = 'Path to connection file copied to clipboard.';
    var description = 'Use `jupyter console --existing ' + connectionFile + '` to\n            connect to the running kernel.';
    atom.notifications.addSuccess(message, { description: description });
  },

  getConnectionFile: function getConnectionFile() {
    if (!this.hydrogen) {
      atom.notifications.addError('Hydrogen `v1.0.0+` has to be running.');
      return null;
    }
    try {
      return this.hydrogen.getActiveKernel() ? this.hydrogen.getActiveKernel().getConnectionFile() : null;
    } catch (error) {
      atom.notifications.addError(error.message);
    }
    return null;
  },

  getCommand: function getCommand() {
    var cmd = atom.config.get('hydrogen-launcher.command');
    if (cmd === '') {
      atom.notifications.addError('No custom command set.');
      return null;
    }
    if (cmd.indexOf('{connection-file}') > -1) {
      var connectionFile = this.getConnectionFile();
      if (!connectionFile) {
        return null;
      }
      cmd = cmd.replace('{connection-file}', connectionFile);
    }
    return cmd;
  },

  getTerminal: function getTerminal() {
    return atom.config.get('hydrogen-launcher.app');
  },

  getCWD: function getCWD() {
    return atom.project.rootDirectories[0] ? atom.project.rootDirectories[0].path : _path2['default'].dirname(atom.workspace.getActiveTextEditor().getPath());
  }
};

exports['default'] = HydrogenLauncher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi1sYXVuY2hlci9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NEJBRWlCLGVBQWU7Ozs7b0JBQ2YsTUFBTTs7OztvQkFDeUIsTUFBTTs7QUFKdEQsV0FBVyxDQUFDOztBQU9aLElBQU0sZ0JBQWdCLEdBQUc7QUFDdkIsUUFBTSxFQUFFO0FBQ04sT0FBRyxFQUFFO0FBQ0gsV0FBSyxFQUFFLHNCQUFzQjtBQUM3QixpQkFBVyxFQUFFLDRDQUE0QztBQUN6RCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLDBCQUFLLGtCQUFrQixFQUFFO0tBQ25DO0FBQ0QsV0FBTyxFQUFFO0FBQ1AsV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLCtKQUErSjtBQUM1SyxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLFNBQVM7S0FDbkI7QUFDRCxXQUFPLEVBQUU7QUFDUCxXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFXLEVBQUUsMEpBQTBKO0FBQ3ZLLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsRUFBRTtLQUNaO0dBQ0Y7O0FBRUQsZUFBYSxFQUFFLElBQUk7QUFDbkIsVUFBUSxFQUFFLElBQUk7QUFDZCxvQkFBa0IsRUFBRSxJQUFJOztBQUV4QixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFO0FBQzNELHlDQUFtQyxFQUFFO2VBQU0sTUFBSyxjQUFjLEVBQUU7T0FBQTtBQUNoRSxnREFBMEMsRUFBRTtlQUFNLE1BQUssYUFBYSxFQUFFO09BQUE7QUFDdEUsdUVBQWlFLEVBQUU7ZUFDakUsTUFBSyxpQ0FBaUMsRUFBRTtPQUFBO0FBQzFDLGlEQUEyQyxFQUFFO2VB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QUFDLGlCQUFpQixFQUFFLENBQUM7QUFDaEQsVUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsU0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDeEQ7QUFDRCxXQUFPLEdBQUcsQ0FBQztHQUNaOztBQUVELGFBQVcsRUFBQSx1QkFBRztBQUNaLFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztHQUNqRDs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7QUFDUCxXQUFPLEFBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEdBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FDcEMsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0dBQ2hFO0NBQ0YsQ0FBQzs7cUJBRWEsZ0JBQWdCIiwiZmlsZSI6Ii9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9oeWRyb2dlbi1sYXVuY2hlci9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgdGVybSBmcm9tICd0ZXJtLWxhdW5jaGVyJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5cbmNvbnN0IEh5ZHJvZ2VuTGF1bmNoZXIgPSB7XG4gIGNvbmZpZzoge1xuICAgIGFwcDoge1xuICAgICAgdGl0bGU6ICdUZXJtaW5hbCBhcHBsaWNhdGlvbicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgd2lsbCBkZXBlbmQgb24geW91ciBvcGVyYXRpb24gc3lzdGVtLicsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6IHRlcm0uZ2V0RGVmYXVsdFRlcm1pbmFsKCksXG4gICAgfSxcbiAgICBjb25zb2xlOiB7XG4gICAgICB0aXRsZTogJ0p1cHl0ZXIgY29uc29sZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NoYW5nZSB0aGlzIGlmIHlvdSB3YW50IHRvIHN0YXJ0IGEgYHF0Y29uc29sZWAgb3IgYW55IG90aGVyIGp1cHl0ZXIgaW50ZXJmYWNlIHRoYXQgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBganVweXRlciA8eW91ci1jb25zb2xlPiAtLWV4aXN0aW5nIDxjb25uZWN0aW9uLWZpbGU+YC4nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnY29uc29sZScsXG4gICAgfSxcbiAgICBjb21tYW5kOiB7XG4gICAgICB0aXRsZTogJ0N1c3RvbSBjb21tYW5kJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhpcyBjb21tYW5kIHdpbGwgYmUgZXhjdXRlZCBpbiB0aGUgbGF1bmNoZWQgdGVybWluYWwuIFlvdSBjYW4gYWNjZXNzIHRoZSBjb25uZWN0aW9uIGZpbGUgZnJvbSBIeWRyb2dlbiBieSB1c2luZyBge2Nvbm5lY3Rpb24tZmlsZX1gIHdpdGhpbiB5b3VyIGNvbW1hbmQnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICB9LFxuICB9LFxuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG4gIGh5ZHJvZ2VuOiBudWxsLFxuICBwbGF0Zm9ybUlvVGVybWluYWw6IG51bGwsXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCB7XG4gICAgICAnaHlkcm9nZW4tbGF1bmNoZXI6bGF1bmNoLXRlcm1pbmFsJzogKCkgPT4gdGhpcy5sYXVuY2hUZXJtaW5hbCgpLFxuICAgICAgJ2h5ZHJvZ2VuLWxhdW5jaGVyOmxhdW5jaC1qdXB5dGVyLWNvbnNvbGUnOiAoKSA9PiB0aGlzLmxhdW5jaEp1cHl0ZXIoKSxcbiAgICAgICdoeWRyb2dlbi1sYXVuY2hlcjpsYXVuY2gtanVweXRlci1jb25zb2xlLWluLXBsYXRmb3JtaW8tdGVybWluYWwnOiAoKSA9PlxuICAgICAgICB0aGlzLmxhdW5jaEp1cHl0ZXJJblBsYXRmb3JtSW9UZXJtaW5hbCgpLFxuICAgICAgJ2h5ZHJvZ2VuLWxhdW5jaGVyOmxhdW5jaC10ZXJtaW5hbC1jb21tYW5kJzogKCkgPT5cbiAgICAgICAgdGhpcy5sYXVuY2hUZXJtaW5hbCh0cnVlKSxcbiAgICAgICdoeWRyb2dlbi1sYXVuY2hlcjpjb3B5LXBhdGgtdG8tY29ubmVjdGlvbi1maWxlJzogKCkgPT5cbiAgICAgICAgdGhpcy5jb3B5UGF0aFRvQ29ubmVjdGlvbkZpbGUoKSxcbiAgICB9KSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIGNvbnN1bWVIeWRyb2dlbihoeWRyb2dlbikge1xuICAgIHRoaXMuaHlkcm9nZW4gPSBoeWRyb2dlbjtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5oeWRyb2dlbiA9IG51bGw7XG4gICAgfSk7XG4gIH0sXG5cbiAgY29uc3VtZVBsYXRmb3JtSW9UZXJtaW5hbChwcm92aWRlcikge1xuICAgIHRoaXMucGxhdGZvcm1Jb1Rlcm1pbmFsID0gcHJvdmlkZXI7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMucGxhdGZvcm1Jb1Rlcm1pbmFsID0gbnVsbDtcbiAgICB9KTtcbiAgfSxcblxuICBsYXVuY2hUZXJtaW5hbChjb21tYW5kID0gZmFsc2UpIHtcbiAgICBsZXQgY21kO1xuICAgIGlmIChjb21tYW5kKSB7XG4gICAgICBjbWQgPSB0aGlzLmdldENvbW1hbmQoKTtcbiAgICAgIGlmICghY21kKSByZXR1cm47XG4gICAgfVxuICAgIHRlcm0ubGF1bmNoVGVybWluYWwoY21kLCB0aGlzLmdldENXRCgpLCB0aGlzLmdldFRlcm1pbmFsKCksIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBsYXVuY2hKdXB5dGVyKCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25GaWxlID0gdGhpcy5nZXRDb25uZWN0aW9uRmlsZSgpO1xuICAgIGlmICghY29ubmVjdGlvbkZpbGUpIHJldHVybjtcblxuICAgIGNvbnN0IGpwQ29uc29sZSA9IGF0b20uY29uZmlnLmdldCgnaHlkcm9nZW4tbGF1bmNoZXIuY29uc29sZScpO1xuICAgIHRlcm0ubGF1bmNoSnVweXRlcihjb25uZWN0aW9uRmlsZSwgdGhpcy5nZXRDV0QoKSwganBDb25zb2xlLCB0aGlzLmdldFRlcm1pbmFsKCksIChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIpIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgbGF1bmNoSnVweXRlckluUGxhdGZvcm1Jb1Rlcm1pbmFsKCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25GaWxlID0gdGhpcy5nZXRDb25uZWN0aW9uRmlsZSgpO1xuICAgIGlmICghY29ubmVjdGlvbkZpbGUpIHJldHVybjtcblxuICAgIGNvbnN0IGpwQ29uc29sZSA9IGF0b20uY29uZmlnLmdldCgnaHlkcm9nZW4tbGF1bmNoZXIuY29uc29sZScpO1xuICAgIHRlcm0uZ2V0Q29ubmVjdGlvbkNvbW1hbmQoY29ubmVjdGlvbkZpbGUsIGpwQ29uc29sZSwgKGVyciwgY29tbWFuZCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnBsYXRmb3JtSW9UZXJtaW5hbCkge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1BsYXRmb3JtSU8gSURFIFRlcm1pbmFsIGhhcyB0byBiZSBpbnN0YWxsZWQuJyk7XG4gICAgICB9IGVsc2UgaWYgKGVycikge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wbGF0Zm9ybUlvVGVybWluYWwucnVuKFtjb21tYW5kXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgY29weVBhdGhUb0Nvbm5lY3Rpb25GaWxlKCkge1xuICAgIGNvbnN0IGNvbm5lY3Rpb25GaWxlID0gdGhpcy5nZXRDb25uZWN0aW9uRmlsZSgpO1xuICAgIGlmICghY29ubmVjdGlvbkZpbGUpIHJldHVybjtcblxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGNvbm5lY3Rpb25GaWxlKTtcbiAgICBjb25zdCBtZXNzYWdlID0gJ1BhdGggdG8gY29ubmVjdGlvbiBmaWxlIGNvcGllZCB0byBjbGlwYm9hcmQuJztcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGBVc2UgXFxganVweXRlciBjb25zb2xlIC0tZXhpc3RpbmcgJHtjb25uZWN0aW9uRmlsZX1cXGAgdG9cbiAgICAgICAgICAgIGNvbm5lY3QgdG8gdGhlIHJ1bm5pbmcga2VybmVsLmA7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MobWVzc2FnZSwgeyBkZXNjcmlwdGlvbiB9KTtcbiAgfSxcblxuICBnZXRDb25uZWN0aW9uRmlsZSgpIHtcbiAgICBpZiAoIXRoaXMuaHlkcm9nZW4pIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignSHlkcm9nZW4gYHYxLjAuMCtgIGhhcyB0byBiZSBydW5uaW5nLicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5oeWRyb2dlbi5nZXRBY3RpdmVLZXJuZWwoKSA/XG4gICAgICAgIHRoaXMuaHlkcm9nZW4uZ2V0QWN0aXZlS2VybmVsKCkuZ2V0Q29ubmVjdGlvbkZpbGUoKSA6IG51bGw7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgZ2V0Q29tbWFuZCgpIHtcbiAgICBsZXQgY21kID0gYXRvbS5jb25maWcuZ2V0KCdoeWRyb2dlbi1sYXVuY2hlci5jb21tYW5kJyk7XG4gICAgaWYgKGNtZCA9PT0gJycpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm8gY3VzdG9tIGNvbW1hbmQgc2V0LicpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChjbWQuaW5kZXhPZigne2Nvbm5lY3Rpb24tZmlsZX0nKSA+IC0xKSB7XG4gICAgICBjb25zdCBjb25uZWN0aW9uRmlsZSA9IHRoaXMuZ2V0Q29ubmVjdGlvbkZpbGUoKTtcbiAgICAgIGlmICghY29ubmVjdGlvbkZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBjbWQgPSBjbWQucmVwbGFjZSgne2Nvbm5lY3Rpb24tZmlsZX0nLCBjb25uZWN0aW9uRmlsZSk7XG4gICAgfVxuICAgIHJldHVybiBjbWQ7XG4gIH0sXG5cbiAgZ2V0VGVybWluYWwoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnaHlkcm9nZW4tbGF1bmNoZXIuYXBwJyk7XG4gIH0sXG5cbiAgZ2V0Q1dEKCkge1xuICAgIHJldHVybiAoYXRvbS5wcm9qZWN0LnJvb3REaXJlY3Rvcmllc1swXSkgP1xuICAgICAgYXRvbS5wcm9qZWN0LnJvb3REaXJlY3Rvcmllc1swXS5wYXRoIDpcbiAgICAgIHBhdGguZGlybmFtZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0UGF0aCgpKTtcbiAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEh5ZHJvZ2VuTGF1bmNoZXI7XG4iXX0=
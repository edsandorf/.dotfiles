(function() {
  var _, child, filteredEnvironment, fs, path, pty, systemLanguage;

  pty = require('node-pty-prebuilt-multiarch');

  path = require('path');

  fs = require('fs');

  _ = require('underscore');

  child = require('child_process');

  systemLanguage = (function() {
    var command, language;
    language = "en_US.UTF-8";
    if (process.platform === 'darwin') {
      try {
        command = 'plutil -convert json -o - ~/Library/Preferences/.GlobalPreferences.plist';
        language = (JSON.parse(child.execSync(command).toString()).AppleLocale) + ".UTF-8";
      } catch (error) {}
    }
    return language;
  })();

  filteredEnvironment = (function() {
    var env;
    env = _.omit(process.env, 'ATOM_HOME', 'ELECTRON_RUN_AS_NODE', 'GOOGLE_API_KEY', 'NODE_ENV', 'NODE_PATH', 'userAgent', 'taskPath');
    if (env.LANG == null) {
      env.LANG = systemLanguage;
    }
    env.TERM_PROGRAM = 'platformio-ide-terminal';
    return env;
  })();

  module.exports = function(pwd, shell, args, env, options) {
    var callback, emitTitle, ptyProcess, title;
    if (options == null) {
      options = {};
    }
    callback = this.async();
    if (shell) {
      ptyProcess = pty.fork(shell, args, {
        cwd: pwd,
        env: _.extend(filteredEnvironment, env),
        name: 'xterm-256color'
      });
      title = shell = path.basename(shell);
    } else {
      ptyProcess = pty.open();
    }
    emitTitle = _.throttle(function() {
      return emit('platformio-ide-terminal:title', ptyProcess.process);
    }, 500, true);
    ptyProcess.on('data', function(data) {
      emit('platformio-ide-terminal:data', data);
      return emitTitle();
    });
    ptyProcess.on('exit', function() {
      emit('platformio-ide-terminal:exit');
      return callback();
    });
    return process.on('message', function(arg) {
      var cols, event, ref, rows, text;
      ref = arg != null ? arg : {}, event = ref.event, cols = ref.cols, rows = ref.rows, text = ref.text;
      switch (event) {
        case 'resize':
          return ptyProcess.resize(cols, rows);
        case 'input':
          return ptyProcess.write(text);
        case 'pty':
          return emit('platformio-ide-terminal:pty', ptyProcess.pty);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wcm9jZXNzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSw2QkFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUjs7RUFDSixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVI7O0VBRVIsY0FBQSxHQUFvQixDQUFBLFNBQUE7QUFDbEIsUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsUUFBdkI7QUFDRTtRQUNFLE9BQUEsR0FBVTtRQUNWLFFBQUEsR0FBYSxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLFFBQU4sQ0FBZSxPQUFmLENBQXVCLENBQUMsUUFBeEIsQ0FBQSxDQUFYLENBQThDLENBQUMsV0FBaEQsQ0FBQSxHQUE0RCxTQUYzRTtPQUFBLGlCQURGOztBQUlBLFdBQU87RUFOVyxDQUFBLENBQUgsQ0FBQTs7RUFRakIsbUJBQUEsR0FBeUIsQ0FBQSxTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFPLENBQUMsR0FBZixFQUFvQixXQUFwQixFQUFpQyxzQkFBakMsRUFBeUQsZ0JBQXpELEVBQTJFLFVBQTNFLEVBQXVGLFdBQXZGLEVBQW9HLFdBQXBHLEVBQWlILFVBQWpIOztNQUNOLEdBQUcsQ0FBQyxPQUFROztJQUNaLEdBQUcsQ0FBQyxZQUFKLEdBQW1CO0FBQ25CLFdBQU87RUFKZ0IsQ0FBQSxDQUFILENBQUE7O0VBTXRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxJQUFiLEVBQW1CLEdBQW5CLEVBQXdCLE9BQXhCO0FBQ2YsUUFBQTs7TUFEdUMsVUFBUTs7SUFDL0MsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFELENBQUE7SUFFWCxJQUFHLEtBQUg7TUFDRSxVQUFBLEdBQWEsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFULEVBQWdCLElBQWhCLEVBQ1g7UUFBQSxHQUFBLEVBQUssR0FBTDtRQUNBLEdBQUEsRUFBSyxDQUFDLENBQUMsTUFBRixDQUFTLG1CQUFULEVBQThCLEdBQTlCLENBREw7UUFFQSxJQUFBLEVBQU0sZ0JBRk47T0FEVztNQUtiLEtBQUEsR0FBUSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFkLEVBTmxCO0tBQUEsTUFBQTtNQVFFLFVBQUEsR0FBYSxHQUFHLENBQUMsSUFBSixDQUFBLEVBUmY7O0lBVUEsU0FBQSxHQUFZLENBQUMsQ0FBQyxRQUFGLENBQVcsU0FBQTthQUNyQixJQUFBLENBQUssK0JBQUwsRUFBc0MsVUFBVSxDQUFDLE9BQWpEO0lBRHFCLENBQVgsRUFFVixHQUZVLEVBRUwsSUFGSztJQUlaLFVBQVUsQ0FBQyxFQUFYLENBQWMsTUFBZCxFQUFzQixTQUFDLElBQUQ7TUFDcEIsSUFBQSxDQUFLLDhCQUFMLEVBQXFDLElBQXJDO2FBQ0EsU0FBQSxDQUFBO0lBRm9CLENBQXRCO0lBSUEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLFNBQUE7TUFDcEIsSUFBQSxDQUFLLDhCQUFMO2FBQ0EsUUFBQSxDQUFBO0lBRm9CLENBQXRCO1dBSUEsT0FBTyxDQUFDLEVBQVIsQ0FBVyxTQUFYLEVBQXNCLFNBQUMsR0FBRDtBQUNwQixVQUFBOzBCQURxQixNQUEwQixJQUF6QixtQkFBTyxpQkFBTSxpQkFBTTtBQUN6QyxjQUFPLEtBQVA7QUFBQSxhQUNPLFFBRFA7aUJBQ3FCLFVBQVUsQ0FBQyxNQUFYLENBQWtCLElBQWxCLEVBQXdCLElBQXhCO0FBRHJCLGFBRU8sT0FGUDtpQkFFb0IsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsSUFBakI7QUFGcEIsYUFHTyxLQUhQO2lCQUdrQixJQUFBLENBQUssNkJBQUwsRUFBb0MsVUFBVSxDQUFDLEdBQS9DO0FBSGxCO0lBRG9CLENBQXRCO0VBekJlO0FBcEJqQiIsInNvdXJjZXNDb250ZW50IjpbInB0eSA9IHJlcXVpcmUgJ25vZGUtcHR5LXByZWJ1aWx0LW11bHRpYXJjaCdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlJ1xuY2hpbGQgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5zeXN0ZW1MYW5ndWFnZSA9IGRvIC0+XG4gIGxhbmd1YWdlID0gXCJlbl9VUy5VVEYtOFwiXG4gIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ2RhcndpbidcbiAgICB0cnlcbiAgICAgIGNvbW1hbmQgPSAncGx1dGlsIC1jb252ZXJ0IGpzb24gLW8gLSB+L0xpYnJhcnkvUHJlZmVyZW5jZXMvLkdsb2JhbFByZWZlcmVuY2VzLnBsaXN0J1xuICAgICAgbGFuZ3VhZ2UgPSBcIiN7SlNPTi5wYXJzZShjaGlsZC5leGVjU3luYyhjb21tYW5kKS50b1N0cmluZygpKS5BcHBsZUxvY2FsZX0uVVRGLThcIlxuICByZXR1cm4gbGFuZ3VhZ2VcblxuZmlsdGVyZWRFbnZpcm9ubWVudCA9IGRvIC0+XG4gIGVudiA9IF8ub21pdCBwcm9jZXNzLmVudiwgJ0FUT01fSE9NRScsICdFTEVDVFJPTl9SVU5fQVNfTk9ERScsICdHT09HTEVfQVBJX0tFWScsICdOT0RFX0VOVicsICdOT0RFX1BBVEgnLCAndXNlckFnZW50JywgJ3Rhc2tQYXRoJ1xuICBlbnYuTEFORyA/PSBzeXN0ZW1MYW5ndWFnZVxuICBlbnYuVEVSTV9QUk9HUkFNID0gJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJ1xuICByZXR1cm4gZW52XG5cbm1vZHVsZS5leHBvcnRzID0gKHB3ZCwgc2hlbGwsIGFyZ3MsIGVudiwgb3B0aW9ucz17fSkgLT5cbiAgY2FsbGJhY2sgPSBAYXN5bmMoKVxuXG4gIGlmIHNoZWxsXG4gICAgcHR5UHJvY2VzcyA9IHB0eS5mb3JrIHNoZWxsLCBhcmdzLFxuICAgICAgY3dkOiBwd2QsXG4gICAgICBlbnY6IF8uZXh0ZW5kKGZpbHRlcmVkRW52aXJvbm1lbnQsIGVudiksXG4gICAgICBuYW1lOiAneHRlcm0tMjU2Y29sb3InXG5cbiAgICB0aXRsZSA9IHNoZWxsID0gcGF0aC5iYXNlbmFtZSBzaGVsbFxuICBlbHNlXG4gICAgcHR5UHJvY2VzcyA9IHB0eS5vcGVuKClcblxuICBlbWl0VGl0bGUgPSBfLnRocm90dGxlIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGl0bGUnLCBwdHlQcm9jZXNzLnByb2Nlc3MpXG4gICwgNTAwLCB0cnVlXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZGF0YScsIChkYXRhKSAtPlxuICAgIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmRhdGEnLCBkYXRhKVxuICAgIGVtaXRUaXRsZSgpXG5cbiAgcHR5UHJvY2Vzcy5vbiAnZXhpdCcsIC0+XG4gICAgZW1pdCgncGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZXhpdCcpXG4gICAgY2FsbGJhY2soKVxuXG4gIHByb2Nlc3Mub24gJ21lc3NhZ2UnLCAoe2V2ZW50LCBjb2xzLCByb3dzLCB0ZXh0fT17fSkgLT5cbiAgICBzd2l0Y2ggZXZlbnRcbiAgICAgIHdoZW4gJ3Jlc2l6ZScgdGhlbiBwdHlQcm9jZXNzLnJlc2l6ZShjb2xzLCByb3dzKVxuICAgICAgd2hlbiAnaW5wdXQnIHRoZW4gcHR5UHJvY2Vzcy53cml0ZSh0ZXh0KVxuICAgICAgd2hlbiAncHR5JyB0aGVuIGVtaXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnB0eScsIHB0eVByb2Nlc3MucHR5KVxuIl19

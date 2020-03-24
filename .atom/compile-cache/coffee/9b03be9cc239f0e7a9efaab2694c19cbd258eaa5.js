(function() {
  module.exports = {
    statusBar: null,
    activate: function() {},
    deactivate: function() {
      var ref;
      if ((ref = this.statusBarTile) != null) {
        ref.destroy();
      }
      return this.statusBarTile = null;
    },
    providePlatformIOIDETerminal: function() {
      return {
        updateProcessEnv: function(variables) {
          var name, results, value;
          results = [];
          for (name in variables) {
            value = variables[name];
            results.push(process.env[name] = value);
          }
          return results;
        },
        run: (function(_this) {
          return function(commands) {
            return _this.statusBarTile.runCommandInNewTerminal(commands);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this),
        open: (function(_this) {
          return function() {
            return _this.statusBarTile.runNewTerminal();
          };
        })(this)
      };
    },
    provideRunInTerminal: function() {
      return {
        run: (function(_this) {
          return function(commands) {
            return _this.statusBarTile.runCommandInNewTerminal(commands);
          };
        })(this),
        getTerminalViews: (function(_this) {
          return function() {
            return _this.statusBarTile.terminalViews;
          };
        })(this)
      };
    },
    consumeStatusBar: function(statusBarProvider) {
      return this.statusBarTile = new (require('./status-bar'))(statusBarProvider);
    },
    config: {
      toggles: {
        type: 'object',
        order: 1,
        properties: {
          autoClose: {
            title: 'Close Terminal on Exit',
            description: 'Should the terminal close if the shell exits?',
            type: 'boolean',
            "default": false
          },
          cursorBlink: {
            title: 'Cursor Blink',
            description: 'Should the cursor blink when the terminal is active?',
            type: 'boolean',
            "default": true
          },
          runInsertedText: {
            title: 'Run Inserted Text',
            description: 'Run text inserted via `platformio-ide-terminal:insert-text` as a command? **This will append an end-of-line character to input.**',
            type: 'boolean',
            "default": true
          },
          selectToCopy: {
            title: 'Select To Copy',
            description: 'Copies text to clipboard when selection happens.',
            type: 'boolean',
            "default": true
          },
          loginShell: {
            title: 'Login Shell',
            description: 'Use --login on zsh and bash.',
            type: 'boolean',
            "default": true
          },
          showToolbar: {
            title: 'Show Toolbar',
            description: 'Show toolbar above terminal window.',
            type: 'boolean',
            "default": true
          }
        }
      },
      core: {
        type: 'object',
        order: 2,
        properties: {
          autoRunCommand: {
            title: 'Auto Run Command',
            description: 'Command to run on terminal initialization.',
            type: 'string',
            "default": ''
          },
          mapTerminalsTo: {
            title: 'Map Terminals To',
            description: 'Map terminals to each file or folder. Default is no action or mapping at all. **Restart required.**',
            type: 'string',
            "default": 'None',
            "enum": ['None', 'File', 'Folder']
          },
          mapTerminalsToAutoOpen: {
            title: 'Auto Open a New Terminal (For Terminal Mapping)',
            description: 'Should a new terminal be opened for new items? **Note:** This works in conjunction with `Map Terminals To` above.',
            type: 'boolean',
            "default": false
          },
          scrollback: {
            title: 'Scroll Back',
            description: 'How many lines of history should be kept?',
            type: 'integer',
            "default": 1000
          },
          shell: {
            title: 'Shell Override',
            description: 'Override the default shell instance to launch.',
            type: 'string',
            "default": (function() {
              var path;
              if (process.platform === 'win32') {
                path = require('path');
                return path.resolve(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
              } else {
                return process.env.SHELL || '/bin/bash';
              }
            })()
          },
          shellArguments: {
            title: 'Shell Arguments',
            description: 'Specify some arguments to use when launching the shell.',
            type: 'string',
            "default": ''
          },
          shellEnv: {
            title: 'Shell Environment Variables',
            description: 'Specify some additional environment variables, space separated with the form `VAR=VALUE`',
            type: 'string',
            "default": ''
          },
          workingDirectory: {
            title: 'Working Directory',
            description: 'Which directory should be the present working directory when a new terminal is made?',
            type: 'string',
            "default": 'Project',
            "enum": ['Home', 'Project', 'Active File']
          }
        }
      },
      style: {
        type: 'object',
        order: 3,
        properties: {
          animationSpeed: {
            title: 'Animation Speed',
            description: 'How fast should the window animate?',
            type: 'number',
            "default": '1',
            minimum: '0',
            maximum: '100'
          },
          fontFamily: {
            title: 'Font Family',
            description: 'Override the terminal\'s default font family. **You must use a [monospaced font](https://en.wikipedia.org/wiki/List_of_typefaces#Monospace)!**',
            type: 'string',
            "default": ''
          },
          fontSize: {
            title: 'Font Size',
            description: 'Override the terminal\'s default font size.',
            type: 'string',
            "default": ''
          },
          defaultPanelHeight: {
            title: 'Default Panel Height',
            description: 'Default height of a terminal panel. **You may enter a value in px, em, or %.**',
            type: 'string',
            "default": '300px'
          },
          theme: {
            title: 'Theme',
            description: 'Select a theme for the terminal.',
            type: 'string',
            "default": 'standard',
            "enum": ['standard', 'inverse', 'linux', 'grass', 'homebrew', 'man-page', 'novel', 'ocean', 'pro', 'red', 'red-sands', 'silver-aerogel', 'solarized-dark', 'solid-colors', 'dracula', 'one-dark', 'christmas', 'predawn', 'city-lights', 'solarized-light']
          }
        }
      },
      ansiColors: {
        type: 'object',
        order: 4,
        properties: {
          normal: {
            type: 'object',
            order: 1,
            properties: {
              black: {
                title: 'Black',
                description: 'Black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#000000'
              },
              red: {
                title: 'Red',
                description: 'Red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD0000'
              },
              green: {
                title: 'Green',
                description: 'Green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CD00'
              },
              yellow: {
                title: 'Yellow',
                description: 'Yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CDCD00'
              },
              blue: {
                title: 'Blue',
                description: 'Blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000CD'
              },
              magenta: {
                title: 'Magenta',
                description: 'Magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#CD00CD'
              },
              cyan: {
                title: 'Cyan',
                description: 'Cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00CDCD'
              },
              white: {
                title: 'White',
                description: 'White color used for terminal ANSI color set.',
                type: 'color',
                "default": '#E5E5E5'
              }
            }
          },
          zBright: {
            type: 'object',
            order: 2,
            properties: {
              brightBlack: {
                title: 'Bright Black',
                description: 'Bright black color used for terminal ANSI color set.',
                type: 'color',
                "default": '#7F7F7F'
              },
              brightRed: {
                title: 'Bright Red',
                description: 'Bright red color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF0000'
              },
              brightGreen: {
                title: 'Bright Green',
                description: 'Bright green color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FF00'
              },
              brightYellow: {
                title: 'Bright Yellow',
                description: 'Bright yellow color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFF00'
              },
              brightBlue: {
                title: 'Bright Blue',
                description: 'Bright blue color used for terminal ANSI color set.',
                type: 'color',
                "default": '#0000FF'
              },
              brightMagenta: {
                title: 'Bright Magenta',
                description: 'Bright magenta color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FF00FF'
              },
              brightCyan: {
                title: 'Bright Cyan',
                description: 'Bright cyan color used for terminal ANSI color set.',
                type: 'color',
                "default": '#00FFFF'
              },
              brightWhite: {
                title: 'Bright White',
                description: 'Bright white color used for terminal ANSI color set.',
                type: 'color',
                "default": '#FFFFFF'
              }
            }
          }
        }
      },
      iconColors: {
        type: 'object',
        order: 5,
        properties: {
          red: {
            title: 'Status Icon Red',
            description: 'Red color used for status icon.',
            type: 'color',
            "default": 'red'
          },
          orange: {
            title: 'Status Icon Orange',
            description: 'Orange color used for status icon.',
            type: 'color',
            "default": 'orange'
          },
          yellow: {
            title: 'Status Icon Yellow',
            description: 'Yellow color used for status icon.',
            type: 'color',
            "default": 'yellow'
          },
          green: {
            title: 'Status Icon Green',
            description: 'Green color used for status icon.',
            type: 'color',
            "default": 'green'
          },
          blue: {
            title: 'Status Icon Blue',
            description: 'Blue color used for status icon.',
            type: 'color',
            "default": 'blue'
          },
          purple: {
            title: 'Status Icon Purple',
            description: 'Purple color used for status icon.',
            type: 'color',
            "default": 'purple'
          },
          pink: {
            title: 'Status Icon Pink',
            description: 'Pink color used for status icon.',
            type: 'color',
            "default": 'hotpink'
          },
          cyan: {
            title: 'Status Icon Cyan',
            description: 'Cyan color used for status icon.',
            type: 'color',
            "default": 'cyan'
          },
          magenta: {
            title: 'Status Icon Magenta',
            description: 'Magenta color used for status icon.',
            type: 'color',
            "default": 'magenta'
          }
        }
      },
      customTexts: {
        type: 'object',
        order: 6,
        properties: {
          customText1: {
            title: 'Custom text 1',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-1, $S is replaced by selection, $F is replaced by file name, $D is replaced by file directory, $L is replaced by line number of cursor, $$ is replaced by $',
            type: 'string',
            "default": ''
          },
          customText2: {
            title: 'Custom text 2',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-2',
            type: 'string',
            "default": ''
          },
          customText3: {
            title: 'Custom text 3',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-3',
            type: 'string',
            "default": ''
          },
          customText4: {
            title: 'Custom text 4',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-4',
            type: 'string',
            "default": ''
          },
          customText5: {
            title: 'Custom text 5',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-5',
            type: 'string',
            "default": ''
          },
          customText6: {
            title: 'Custom text 6',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-6',
            type: 'string',
            "default": ''
          },
          customText7: {
            title: 'Custom text 7',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-7',
            type: 'string',
            "default": ''
          },
          customText8: {
            title: 'Custom text 8',
            description: 'Text to paste when calling platformio-ide-terminal:insert-custom-text-8',
            type: 'string',
            "default": ''
          }
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUFXLElBQVg7SUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBLENBRlY7SUFJQSxVQUFBLEVBQVksU0FBQTtBQUNWLFVBQUE7O1dBQWMsQ0FBRSxPQUFoQixDQUFBOzthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRlAsQ0FKWjtJQVFBLDRCQUFBLEVBQThCLFNBQUE7YUFDNUI7UUFBQSxnQkFBQSxFQUFrQixTQUFDLFNBQUQ7QUFDaEIsY0FBQTtBQUFBO2VBQUEsaUJBQUE7O3lCQUNFLE9BQU8sQ0FBQyxHQUFJLENBQUEsSUFBQSxDQUFaLEdBQW9CO0FBRHRCOztRQURnQixDQUFsQjtRQUdBLEdBQUEsRUFBSyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFFBQUQ7bUJBQ0gsS0FBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUF1QyxRQUF2QztVQURHO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhMO1FBS0EsZ0JBQUEsRUFBa0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDaEIsS0FBQyxDQUFBLGFBQWEsQ0FBQztVQURDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxsQjtRQU9BLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZixDQUFBO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUE47O0lBRDRCLENBUjlCO0lBbUJBLG9CQUFBLEVBQXNCLFNBQUE7YUFDcEI7UUFBQSxHQUFBLEVBQUssQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxRQUFEO21CQUNILEtBQUMsQ0FBQSxhQUFhLENBQUMsdUJBQWYsQ0FBdUMsUUFBdkM7VUFERztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTDtRQUVBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ2hCLEtBQUMsQ0FBQSxhQUFhLENBQUM7VUFEQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGbEI7O0lBRG9CLENBbkJ0QjtJQXlCQSxnQkFBQSxFQUFrQixTQUFDLGlCQUFEO2FBQ2hCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUksQ0FBQyxPQUFBLENBQVEsY0FBUixDQUFELENBQUosQ0FBNkIsaUJBQTdCO0lBREQsQ0F6QmxCO0lBNEJBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsS0FBQSxFQUFPLENBRFA7UUFFQSxVQUFBLEVBQ0U7VUFBQSxTQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sd0JBQVA7WUFDQSxXQUFBLEVBQWEsK0NBRGI7WUFFQSxJQUFBLEVBQU0sU0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtXQURGO1VBS0EsV0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGNBQVA7WUFDQSxXQUFBLEVBQWEsc0RBRGI7WUFFQSxJQUFBLEVBQU0sU0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtXQU5GO1VBVUEsZUFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLG1CQUFQO1lBQ0EsV0FBQSxFQUFhLG1JQURiO1lBRUEsSUFBQSxFQUFNLFNBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7V0FYRjtVQWVBLFlBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxnQkFBUDtZQUNBLFdBQUEsRUFBYSxrREFEYjtZQUVBLElBQUEsRUFBTSxTQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1dBaEJGO1VBb0JBLFVBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxhQUFQO1lBQ0EsV0FBQSxFQUFhLDhCQURiO1lBRUEsSUFBQSxFQUFNLFNBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7V0FyQkY7VUF5QkEsV0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGNBQVA7WUFDQSxXQUFBLEVBQWEscUNBRGI7WUFFQSxJQUFBLEVBQU0sU0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtXQTFCRjtTQUhGO09BREY7TUFrQ0EsSUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLGNBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSw0Q0FEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBREY7VUFLQSxjQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sa0JBQVA7WUFDQSxXQUFBLEVBQWEscUdBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFIVDtZQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixRQUFqQixDQUpOO1dBTkY7VUFXQSxzQkFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGlEQUFQO1lBQ0EsV0FBQSxFQUFhLG1IQURiO1lBRUEsSUFBQSxFQUFNLFNBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7V0FaRjtVQWdCQSxVQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sYUFBUDtZQUNBLFdBQUEsRUFBYSwyQ0FEYjtZQUVBLElBQUEsRUFBTSxTQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1dBakJGO1VBcUJBLEtBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxnQkFBUDtZQUNBLFdBQUEsRUFBYSxnREFEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBWSxDQUFBLFNBQUE7QUFDVixrQkFBQTtjQUFBLElBQUcsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBdkI7Z0JBQ0UsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSO3VCQUNQLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUF6QixFQUFxQyxVQUFyQyxFQUFpRCxtQkFBakQsRUFBc0UsTUFBdEUsRUFBOEUsZ0JBQTlFLEVBRkY7ZUFBQSxNQUFBO3VCQUlFLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixJQUFxQixZQUp2Qjs7WUFEVSxDQUFBLENBQUgsQ0FBQSxDQUhUO1dBdEJGO1VBK0JBLGNBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxpQkFBUDtZQUNBLFdBQUEsRUFBYSx5REFEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBaENGO1VBb0NBLFFBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyw2QkFBUDtZQUNBLFdBQUEsRUFBYSwwRkFEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBckNGO1VBeUNBLGdCQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sbUJBQVA7WUFDQSxXQUFBLEVBQWEsc0ZBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtZQUlBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixhQUFwQixDQUpOO1dBMUNGO1NBSEY7T0FuQ0Y7TUFxRkEsS0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLGNBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxpQkFBUDtZQUNBLFdBQUEsRUFBYSxxQ0FEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQUhUO1lBSUEsT0FBQSxFQUFTLEdBSlQ7WUFLQSxPQUFBLEVBQVMsS0FMVDtXQURGO1VBT0EsVUFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGFBQVA7WUFDQSxXQUFBLEVBQWEsZ0pBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQVJGO1VBWUEsUUFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLFdBQVA7WUFDQSxXQUFBLEVBQWEsNkNBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQWJGO1VBaUJBLGtCQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sc0JBQVA7WUFDQSxXQUFBLEVBQWEsZ0ZBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtXQWxCRjtVQXNCQSxLQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sT0FBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxVQUhUO1lBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUNKLFVBREksRUFFSixTQUZJLEVBR0osT0FISSxFQUlKLE9BSkksRUFLSixVQUxJLEVBTUosVUFOSSxFQU9KLE9BUEksRUFRSixPQVJJLEVBU0osS0FUSSxFQVVKLEtBVkksRUFXSixXQVhJLEVBWUosZ0JBWkksRUFhSixnQkFiSSxFQWNKLGNBZEksRUFlSixTQWZJLEVBZ0JKLFVBaEJJLEVBaUJKLFdBakJJLEVBa0JKLFNBbEJJLEVBbUJKLGFBbkJJLEVBb0JKLGlCQXBCSSxDQUpOO1dBdkJGO1NBSEY7T0F0RkY7TUEwSUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLE1BQUEsRUFDRTtZQUFBLElBQUEsRUFBTSxRQUFOO1lBQ0EsS0FBQSxFQUFPLENBRFA7WUFFQSxVQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE9BQVA7Z0JBQ0EsV0FBQSxFQUFhLCtDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQURGO2NBS0EsR0FBQSxFQUNFO2dCQUFBLEtBQUEsRUFBTyxLQUFQO2dCQUNBLFdBQUEsRUFBYSw2Q0FEYjtnQkFFQSxJQUFBLEVBQU0sT0FGTjtnQkFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7ZUFORjtjQVVBLEtBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sT0FBUDtnQkFDQSxXQUFBLEVBQWEsK0NBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBWEY7Y0FlQSxNQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLFFBQVA7Z0JBQ0EsV0FBQSxFQUFhLGdEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQWhCRjtjQW9CQSxJQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE1BQVA7Z0JBQ0EsV0FBQSxFQUFhLDhDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQXJCRjtjQXlCQSxPQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLFNBQVA7Z0JBQ0EsV0FBQSxFQUFhLGlEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQTFCRjtjQThCQSxJQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE1BQVA7Z0JBQ0EsV0FBQSxFQUFhLDhDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQS9CRjtjQW1DQSxLQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLE9BQVA7Z0JBQ0EsV0FBQSxFQUFhLCtDQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQXBDRjthQUhGO1dBREY7VUE0Q0EsT0FBQSxFQUNFO1lBQUEsSUFBQSxFQUFNLFFBQU47WUFDQSxLQUFBLEVBQU8sQ0FEUDtZQUVBLFVBQUEsRUFDRTtjQUFBLFdBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sY0FBUDtnQkFDQSxXQUFBLEVBQWEsc0RBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBREY7Y0FLQSxTQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLFlBQVA7Z0JBQ0EsV0FBQSxFQUFhLG9EQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQU5GO2NBVUEsV0FBQSxFQUNFO2dCQUFBLEtBQUEsRUFBTyxjQUFQO2dCQUNBLFdBQUEsRUFBYSxzREFEYjtnQkFFQSxJQUFBLEVBQU0sT0FGTjtnQkFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFNBSFQ7ZUFYRjtjQWVBLFlBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sZUFBUDtnQkFDQSxXQUFBLEVBQWEsdURBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBaEJGO2NBb0JBLFVBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sYUFBUDtnQkFDQSxXQUFBLEVBQWEscURBRGI7Z0JBRUEsSUFBQSxFQUFNLE9BRk47Z0JBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO2VBckJGO2NBeUJBLGFBQUEsRUFDRTtnQkFBQSxLQUFBLEVBQU8sZ0JBQVA7Z0JBQ0EsV0FBQSxFQUFhLHdEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQTFCRjtjQThCQSxVQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLGFBQVA7Z0JBQ0EsV0FBQSxFQUFhLHFEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQS9CRjtjQW1DQSxXQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLGNBQVA7Z0JBQ0EsV0FBQSxFQUFhLHNEQURiO2dCQUVBLElBQUEsRUFBTSxPQUZOO2dCQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FIVDtlQXBDRjthQUhGO1dBN0NGO1NBSEY7T0EzSUY7TUFzT0EsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLEdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxpQkFBUDtZQUNBLFdBQUEsRUFBYSxpQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1dBREY7VUFLQSxNQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sb0JBQVA7WUFDQSxXQUFBLEVBQWEsb0NBRGI7WUFFQSxJQUFBLEVBQU0sT0FGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsUUFIVDtXQU5GO1VBVUEsTUFBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLG9CQUFQO1lBQ0EsV0FBQSxFQUFhLG9DQURiO1lBRUEsSUFBQSxFQUFNLE9BRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLFFBSFQ7V0FYRjtVQWVBLEtBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxtQkFBUDtZQUNBLFdBQUEsRUFBYSxtQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO1dBaEJGO1VBb0JBLElBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUhUO1dBckJGO1VBeUJBLE1BQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxvQkFBUDtZQUNBLFdBQUEsRUFBYSxvQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxRQUhUO1dBMUJGO1VBOEJBLElBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO1dBL0JGO1VBbUNBLElBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxrQkFBUDtZQUNBLFdBQUEsRUFBYSxrQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQUhUO1dBcENGO1VBd0NBLE9BQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxxQkFBUDtZQUNBLFdBQUEsRUFBYSxxQ0FEYjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxTQUhUO1dBekNGO1NBSEY7T0F2T0Y7TUF1UkEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxLQUFBLEVBQU8sQ0FEUDtRQUVBLFVBQUEsRUFDRTtVQUFBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLG1PQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FERjtVQUtBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLHlFQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FORjtVQVVBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLHlFQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FYRjtVQWVBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLHlFQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0FoQkY7VUFvQkEsV0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGVBQVA7WUFDQSxXQUFBLEVBQWEseUVBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQXJCRjtVQXlCQSxXQUFBLEVBQ0U7WUFBQSxLQUFBLEVBQU8sZUFBUDtZQUNBLFdBQUEsRUFBYSx5RUFEYjtZQUVBLElBQUEsRUFBTSxRQUZOO1lBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUhUO1dBMUJGO1VBOEJBLFdBQUEsRUFDRTtZQUFBLEtBQUEsRUFBTyxlQUFQO1lBQ0EsV0FBQSxFQUFhLHlFQURiO1lBRUEsSUFBQSxFQUFNLFFBRk47WUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBSFQ7V0EvQkY7VUFtQ0EsV0FBQSxFQUNFO1lBQUEsS0FBQSxFQUFPLGVBQVA7WUFDQSxXQUFBLEVBQWEseUVBRGI7WUFFQSxJQUFBLEVBQU0sUUFGTjtZQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtXQXBDRjtTQUhGO09BeFJGO0tBN0JGOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBzdGF0dXNCYXI6IG51bGxcblxuICBhY3RpdmF0ZTogLT5cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IG51bGxcblxuICBwcm92aWRlUGxhdGZvcm1JT0lERVRlcm1pbmFsOiAtPlxuICAgIHVwZGF0ZVByb2Nlc3NFbnY6ICh2YXJpYWJsZXMpIC0+XG4gICAgICBmb3IgbmFtZSwgdmFsdWUgb2YgdmFyaWFibGVzXG4gICAgICAgIHByb2Nlc3MuZW52W25hbWVdID0gdmFsdWVcbiAgICBydW46IChjb21tYW5kcykgPT5cbiAgICAgIEBzdGF0dXNCYXJUaWxlLnJ1bkNvbW1hbmRJbk5ld1Rlcm1pbmFsIGNvbW1hbmRzXG4gICAgZ2V0VGVybWluYWxWaWV3czogKCkgPT5cbiAgICAgIEBzdGF0dXNCYXJUaWxlLnRlcm1pbmFsVmlld3NcbiAgICBvcGVuOiAoKSA9PlxuICAgICAgQHN0YXR1c0JhclRpbGUucnVuTmV3VGVybWluYWwoKVxuXG4gIHByb3ZpZGVSdW5JblRlcm1pbmFsOiAtPlxuICAgIHJ1bjogKGNvbW1hbmRzKSA9PlxuICAgICAgQHN0YXR1c0JhclRpbGUucnVuQ29tbWFuZEluTmV3VGVybWluYWwgY29tbWFuZHNcbiAgICBnZXRUZXJtaW5hbFZpZXdzOiAoKSA9PlxuICAgICAgQHN0YXR1c0JhclRpbGUudGVybWluYWxWaWV3c1xuXG4gIGNvbnN1bWVTdGF0dXNCYXI6IChzdGF0dXNCYXJQcm92aWRlcikgLT5cbiAgICBAc3RhdHVzQmFyVGlsZSA9IG5ldyAocmVxdWlyZSAnLi9zdGF0dXMtYmFyJykoc3RhdHVzQmFyUHJvdmlkZXIpXG5cbiAgY29uZmlnOlxuICAgIHRvZ2dsZXM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDFcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGF1dG9DbG9zZTpcbiAgICAgICAgICB0aXRsZTogJ0Nsb3NlIFRlcm1pbmFsIG9uIEV4aXQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgdGhlIHRlcm1pbmFsIGNsb3NlIGlmIHRoZSBzaGVsbCBleGl0cz8nXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgY3Vyc29yQmxpbms6XG4gICAgICAgICAgdGl0bGU6ICdDdXJzb3IgQmxpbmsnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgdGhlIGN1cnNvciBibGluayB3aGVuIHRoZSB0ZXJtaW5hbCBpcyBhY3RpdmU/J1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgcnVuSW5zZXJ0ZWRUZXh0OlxuICAgICAgICAgIHRpdGxlOiAnUnVuIEluc2VydGVkIFRleHQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGV4dCBpbnNlcnRlZCB2aWEgYHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC10ZXh0YCBhcyBhIGNvbW1hbmQ/ICoqVGhpcyB3aWxsIGFwcGVuZCBhbiBlbmQtb2YtbGluZSBjaGFyYWN0ZXIgdG8gaW5wdXQuKionXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBzZWxlY3RUb0NvcHk6XG4gICAgICAgICAgdGl0bGU6ICdTZWxlY3QgVG8gQ29weSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NvcGllcyB0ZXh0IHRvIGNsaXBib2FyZCB3aGVuIHNlbGVjdGlvbiBoYXBwZW5zLidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGxvZ2luU2hlbGw6XG4gICAgICAgICAgdGl0bGU6ICdMb2dpbiBTaGVsbCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1VzZSAtLWxvZ2luIG9uIHpzaCBhbmQgYmFzaC4nXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBzaG93VG9vbGJhcjpcbiAgICAgICAgICB0aXRsZTogJ1Nob3cgVG9vbGJhcidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgdG9vbGJhciBhYm92ZSB0ZXJtaW5hbCB3aW5kb3cuJ1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBjb3JlOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhdXRvUnVuQ29tbWFuZDpcbiAgICAgICAgICB0aXRsZTogJ0F1dG8gUnVuIENvbW1hbmQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHRvIHJ1biBvbiB0ZXJtaW5hbCBpbml0aWFsaXphdGlvbi4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBtYXBUZXJtaW5hbHNUbzpcbiAgICAgICAgICB0aXRsZTogJ01hcCBUZXJtaW5hbHMgVG8nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdNYXAgdGVybWluYWxzIHRvIGVhY2ggZmlsZSBvciBmb2xkZXIuIERlZmF1bHQgaXMgbm8gYWN0aW9uIG9yIG1hcHBpbmcgYXQgYWxsLiAqKlJlc3RhcnQgcmVxdWlyZWQuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnTm9uZSdcbiAgICAgICAgICBlbnVtOiBbJ05vbmUnLCAnRmlsZScsICdGb2xkZXInXVxuICAgICAgICBtYXBUZXJtaW5hbHNUb0F1dG9PcGVuOlxuICAgICAgICAgIHRpdGxlOiAnQXV0byBPcGVuIGEgTmV3IFRlcm1pbmFsIChGb3IgVGVybWluYWwgTWFwcGluZyknXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTaG91bGQgYSBuZXcgdGVybWluYWwgYmUgb3BlbmVkIGZvciBuZXcgaXRlbXM/ICoqTm90ZToqKiBUaGlzIHdvcmtzIGluIGNvbmp1bmN0aW9uIHdpdGggYE1hcCBUZXJtaW5hbHMgVG9gIGFib3ZlLidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBzY3JvbGxiYWNrOlxuICAgICAgICAgIHRpdGxlOiAnU2Nyb2xsIEJhY2snXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdIb3cgbWFueSBsaW5lcyBvZiBoaXN0b3J5IHNob3VsZCBiZSBrZXB0PydcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgICAgICBkZWZhdWx0OiAxMDAwXG4gICAgICAgIHNoZWxsOlxuICAgICAgICAgIHRpdGxlOiAnU2hlbGwgT3ZlcnJpZGUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdPdmVycmlkZSB0aGUgZGVmYXVsdCBzaGVsbCBpbnN0YW5jZSB0byBsYXVuY2guJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogZG8gLT5cbiAgICAgICAgICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gaXMgJ3dpbjMyJ1xuICAgICAgICAgICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuZW52LlN5c3RlbVJvb3QsICdTeXN0ZW0zMicsICdXaW5kb3dzUG93ZXJTaGVsbCcsICd2MS4wJywgJ3Bvd2Vyc2hlbGwuZXhlJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcHJvY2Vzcy5lbnYuU0hFTEwgfHwgJy9iaW4vYmFzaCdcbiAgICAgICAgc2hlbGxBcmd1bWVudHM6XG4gICAgICAgICAgdGl0bGU6ICdTaGVsbCBBcmd1bWVudHMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHNvbWUgYXJndW1lbnRzIHRvIHVzZSB3aGVuIGxhdW5jaGluZyB0aGUgc2hlbGwuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgc2hlbGxFbnY6XG4gICAgICAgICAgdGl0bGU6ICdTaGVsbCBFbnZpcm9ubWVudCBWYXJpYWJsZXMnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHNvbWUgYWRkaXRpb25hbCBlbnZpcm9ubWVudCB2YXJpYWJsZXMsIHNwYWNlIHNlcGFyYXRlZCB3aXRoIHRoZSBmb3JtIGBWQVI9VkFMVUVgJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgd29ya2luZ0RpcmVjdG9yeTpcbiAgICAgICAgICB0aXRsZTogJ1dvcmtpbmcgRGlyZWN0b3J5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hpY2ggZGlyZWN0b3J5IHNob3VsZCBiZSB0aGUgcHJlc2VudCB3b3JraW5nIGRpcmVjdG9yeSB3aGVuIGEgbmV3IHRlcm1pbmFsIGlzIG1hZGU/J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ1Byb2plY3QnXG4gICAgICAgICAgZW51bTogWydIb21lJywgJ1Byb2plY3QnLCAnQWN0aXZlIEZpbGUnXVxuICAgIHN0eWxlOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiAzXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBhbmltYXRpb25TcGVlZDpcbiAgICAgICAgICB0aXRsZTogJ0FuaW1hdGlvbiBTcGVlZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hvdyBmYXN0IHNob3VsZCB0aGUgd2luZG93IGFuaW1hdGU/J1xuICAgICAgICAgIHR5cGU6ICdudW1iZXInXG4gICAgICAgICAgZGVmYXVsdDogJzEnXG4gICAgICAgICAgbWluaW11bTogJzAnXG4gICAgICAgICAgbWF4aW11bTogJzEwMCdcbiAgICAgICAgZm9udEZhbWlseTpcbiAgICAgICAgICB0aXRsZTogJ0ZvbnQgRmFtaWx5J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlIHRlcm1pbmFsXFwncyBkZWZhdWx0IGZvbnQgZmFtaWx5LiAqKllvdSBtdXN0IHVzZSBhIFttb25vc3BhY2VkIGZvbnRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfdHlwZWZhY2VzI01vbm9zcGFjZSkhKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBmb250U2l6ZTpcbiAgICAgICAgICB0aXRsZTogJ0ZvbnQgU2l6ZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ092ZXJyaWRlIHRoZSB0ZXJtaW5hbFxcJ3MgZGVmYXVsdCBmb250IHNpemUuJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgZGVmYXVsdFBhbmVsSGVpZ2h0OlxuICAgICAgICAgIHRpdGxlOiAnRGVmYXVsdCBQYW5lbCBIZWlnaHQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdEZWZhdWx0IGhlaWdodCBvZiBhIHRlcm1pbmFsIHBhbmVsLiAqKllvdSBtYXkgZW50ZXIgYSB2YWx1ZSBpbiBweCwgZW0sIG9yICUuKionXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnMzAwcHgnXG4gICAgICAgIHRoZW1lOlxuICAgICAgICAgIHRpdGxlOiAnVGhlbWUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdTZWxlY3QgYSB0aGVtZSBmb3IgdGhlIHRlcm1pbmFsLidcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdzdGFuZGFyZCdcbiAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAnc3RhbmRhcmQnLFxuICAgICAgICAgICAgJ2ludmVyc2UnLFxuICAgICAgICAgICAgJ2xpbnV4JyxcbiAgICAgICAgICAgICdncmFzcycsXG4gICAgICAgICAgICAnaG9tZWJyZXcnLFxuICAgICAgICAgICAgJ21hbi1wYWdlJyxcbiAgICAgICAgICAgICdub3ZlbCcsXG4gICAgICAgICAgICAnb2NlYW4nLFxuICAgICAgICAgICAgJ3BybycsXG4gICAgICAgICAgICAncmVkJyxcbiAgICAgICAgICAgICdyZWQtc2FuZHMnLFxuICAgICAgICAgICAgJ3NpbHZlci1hZXJvZ2VsJyxcbiAgICAgICAgICAgICdzb2xhcml6ZWQtZGFyaycsXG4gICAgICAgICAgICAnc29saWQtY29sb3JzJyxcbiAgICAgICAgICAgICdkcmFjdWxhJyxcbiAgICAgICAgICAgICdvbmUtZGFyaycsXG4gICAgICAgICAgICAnY2hyaXN0bWFzJyxcbiAgICAgICAgICAgICdwcmVkYXduJyxcbiAgICAgICAgICAgICdjaXR5LWxpZ2h0cycsXG4gICAgICAgICAgICAnc29sYXJpemVkLWxpZ2h0J1xuICAgICAgICAgIF1cbiAgICBhbnNpQ29sb3JzOlxuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgIG9yZGVyOiA0XG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBub3JtYWw6XG4gICAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgICBvcmRlcjogMVxuICAgICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgICBibGFjazpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCbGFjaydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCbGFjayBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwMDAnXG4gICAgICAgICAgICByZWQ6XG4gICAgICAgICAgICAgIHRpdGxlOiAnUmVkJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwMDAnXG4gICAgICAgICAgICBncmVlbjpcbiAgICAgICAgICAgICAgdGl0bGU6ICdHcmVlbidcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMENEMDAnXG4gICAgICAgICAgICB5ZWxsb3c6XG4gICAgICAgICAgICAgIHRpdGxlOiAnWWVsbG93J1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1llbGxvdyBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRENEMDAnXG4gICAgICAgICAgICBibHVlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JsdWUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQmx1ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMDAwQ0QnXG4gICAgICAgICAgICBtYWdlbnRhOlxuICAgICAgICAgICAgICB0aXRsZTogJ01hZ2VudGEnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNDRDAwQ0QnXG4gICAgICAgICAgICBjeWFuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0N5YW4nXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3lhbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMENEQ0QnXG4gICAgICAgICAgICB3aGl0ZTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdXaGl0ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaGl0ZSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNFNUU1RTUnXG4gICAgICAgIHpCcmlnaHQ6XG4gICAgICAgICAgdHlwZTogJ29iamVjdCdcbiAgICAgICAgICBvcmRlcjogMlxuICAgICAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgICAgICBicmlnaHRCbGFjazpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgQmxhY2snXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsYWNrIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzdGN0Y3RidcbiAgICAgICAgICAgIGJyaWdodFJlZDpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgUmVkJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCByZWQgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgYnJpZ2h0R3JlZW46XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEdyZWVuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBncmVlbiBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyMwMEZGMDAnXG4gICAgICAgICAgICBicmlnaHRZZWxsb3c6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IFllbGxvdydcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgeWVsbG93IGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnI0ZGRkYwMCdcbiAgICAgICAgICAgIGJyaWdodEJsdWU6XG4gICAgICAgICAgICAgIHRpdGxlOiAnQnJpZ2h0IEJsdWUnXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJpZ2h0IGJsdWUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjMDAwMEZGJ1xuICAgICAgICAgICAgYnJpZ2h0TWFnZW50YTpcbiAgICAgICAgICAgICAgdGl0bGU6ICdCcmlnaHQgTWFnZW50YSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgbWFnZW50YSBjb2xvciB1c2VkIGZvciB0ZXJtaW5hbCBBTlNJIGNvbG9yIHNldC4nXG4gICAgICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICAgICAgZGVmYXVsdDogJyNGRjAwRkYnXG4gICAgICAgICAgICBicmlnaHRDeWFuOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBDeWFuJ1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0JyaWdodCBjeWFuIGNvbG9yIHVzZWQgZm9yIHRlcm1pbmFsIEFOU0kgY29sb3Igc2V0LidcbiAgICAgICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgICAgICBkZWZhdWx0OiAnIzAwRkZGRidcbiAgICAgICAgICAgIGJyaWdodFdoaXRlOlxuICAgICAgICAgICAgICB0aXRsZTogJ0JyaWdodCBXaGl0ZSdcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcmlnaHQgd2hpdGUgY29sb3IgdXNlZCBmb3IgdGVybWluYWwgQU5TSSBjb2xvciBzZXQuJ1xuICAgICAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICcjRkZGRkZGJ1xuICAgIGljb25Db2xvcnM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDVcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIHJlZDpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFJlZCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlZCBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdyZWQnXG4gICAgICAgIG9yYW5nZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE9yYW5nZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ09yYW5nZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdvcmFuZ2UnXG4gICAgICAgIHllbGxvdzpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFllbGxvdydcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1llbGxvdyBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICd5ZWxsb3cnXG4gICAgICAgIGdyZWVuOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gR3JlZW4nXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdHcmVlbiBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdncmVlbidcbiAgICAgICAgYmx1ZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIEJsdWUnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdCbHVlIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ2JsdWUnXG4gICAgICAgIHB1cnBsZTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIFB1cnBsZSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1B1cnBsZSBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdwdXJwbGUnXG4gICAgICAgIHBpbms6XG4gICAgICAgICAgdGl0bGU6ICdTdGF0dXMgSWNvbiBQaW5rJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGluayBjb2xvciB1c2VkIGZvciBzdGF0dXMgaWNvbi4nXG4gICAgICAgICAgdHlwZTogJ2NvbG9yJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdob3RwaW5rJ1xuICAgICAgICBjeWFuOlxuICAgICAgICAgIHRpdGxlOiAnU3RhdHVzIEljb24gQ3lhbidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N5YW4gY29sb3IgdXNlZCBmb3Igc3RhdHVzIGljb24uJ1xuICAgICAgICAgIHR5cGU6ICdjb2xvcidcbiAgICAgICAgICBkZWZhdWx0OiAnY3lhbidcbiAgICAgICAgbWFnZW50YTpcbiAgICAgICAgICB0aXRsZTogJ1N0YXR1cyBJY29uIE1hZ2VudGEnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdNYWdlbnRhIGNvbG9yIHVzZWQgZm9yIHN0YXR1cyBpY29uLidcbiAgICAgICAgICB0eXBlOiAnY29sb3InXG4gICAgICAgICAgZGVmYXVsdDogJ21hZ2VudGEnXG4gICAgY3VzdG9tVGV4dHM6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgb3JkZXI6IDZcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIGN1c3RvbVRleHQxOlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC0xLCAkUyBpcyByZXBsYWNlZCBieSBzZWxlY3Rpb24sICRGIGlzIHJlcGxhY2VkIGJ5IGZpbGUgbmFtZSwgJEQgaXMgcmVwbGFjZWQgYnkgZmlsZSBkaXJlY3RvcnksICRMIGlzIHJlcGxhY2VkIGJ5IGxpbmUgbnVtYmVyIG9mIGN1cnNvciwgJCQgaXMgcmVwbGFjZWQgYnkgJCdcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQyOlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgMidcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC0yJ1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDM6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCAzJ1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTMnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0NDpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDQnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNCdcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ1OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgNSdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC01J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgY3VzdG9tVGV4dDY6XG4gICAgICAgICAgdGl0bGU6ICdDdXN0b20gdGV4dCA2J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGV4dCB0byBwYXN0ZSB3aGVuIGNhbGxpbmcgcGxhdGZvcm1pby1pZGUtdGVybWluYWw6aW5zZXJ0LWN1c3RvbS10ZXh0LTYnXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICBjdXN0b21UZXh0NzpcbiAgICAgICAgICB0aXRsZTogJ0N1c3RvbSB0ZXh0IDcnXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUZXh0IHRvIHBhc3RlIHdoZW4gY2FsbGluZyBwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDppbnNlcnQtY3VzdG9tLXRleHQtNydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICAgIGN1c3RvbVRleHQ4OlxuICAgICAgICAgIHRpdGxlOiAnQ3VzdG9tIHRleHQgOCdcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RleHQgdG8gcGFzdGUgd2hlbiBjYWxsaW5nIHBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmluc2VydC1jdXN0b20tdGV4dC04J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJydcbiJdfQ==

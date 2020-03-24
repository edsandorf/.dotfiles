(function() {
  var Color, ColorBuffer, ColorMarker, CompositeDisposable, Emitter, Range, Task, VariablesCollection, fs, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], Color = ref[0], ColorMarker = ref[1], VariablesCollection = ref[2], Emitter = ref[3], CompositeDisposable = ref[4], Task = ref[5], Range = ref[6], fs = ref[7];

  module.exports = ColorBuffer = (function() {
    function ColorBuffer(params) {
      var colorMarkers, ref1, saveSubscription, tokenized;
      if (params == null) {
        params = {};
      }
      if (Emitter == null) {
        ref1 = require('atom'), Emitter = ref1.Emitter, CompositeDisposable = ref1.CompositeDisposable, Task = ref1.Task, Range = ref1.Range;
      }
      this.editor = params.editor, this.project = params.project, colorMarkers = params.colorMarkers;
      this.id = this.editor.id;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.ignoredScopes = [];
      this.colorMarkersByMarkerId = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      tokenized = (function(_this) {
        return function() {
          var ref2;
          return (ref2 = _this.getColorMarkers()) != null ? ref2.forEach(function(marker) {
            return marker.checkMarkerScope(true);
          }) : void 0;
        };
      })(this);
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize(tokenized));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize(tokenized));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.initialized && _this.variableInitialized) {
            _this.terminateRunningTask();
          }
          if (_this.timeout != null) {
            return clearTimeout(_this.timeout);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          if (_this.delayBeforeScan === 0) {
            return _this.update();
          } else {
            if (_this.timeout != null) {
              clearTimeout(_this.timeout);
            }
            return _this.timeout = setTimeout(function() {
              _this.update();
              return _this.timeout = null;
            }, _this.delayBeforeScan);
          }
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangePath((function(_this) {
        return function(path) {
          if (_this.isVariablesSource()) {
            _this.project.appendPath(path);
          }
          return _this.update();
        };
      })(this)));
      if ((this.project.getPaths() != null) && this.isVariablesSource() && !this.project.hasPath(this.editor.getPath())) {
        if (fs == null) {
          fs = require('fs');
        }
        if (fs.existsSync(this.editor.getPath())) {
          this.project.appendPath(this.editor.getPath());
        } else {
          saveSubscription = this.editor.onDidSave((function(_this) {
            return function(arg) {
              var path;
              path = arg.path;
              _this.project.appendPath(path);
              _this.update();
              saveSubscription.dispose();
              return _this.subscriptions.remove(saveSubscription);
            };
          })(this));
          this.subscriptions.add(saveSubscription);
        }
      }
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (!_this.variableInitialized) {
            return;
          }
          return _this.scanBufferForColors().then(function(results) {
            return _this.updateColorMarkers(results);
          });
        };
      })(this)));
      this.subscriptions.add(this.project.onDidChangeIgnoredScopes((function(_this) {
        return function() {
          return _this.updateIgnoredScopes();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.delayBeforeScan', (function(_this) {
        return function(delayBeforeScan) {
          _this.delayBeforeScan = delayBeforeScan != null ? delayBeforeScan : 0;
        };
      })(this)));
      if (this.editor.addMarkerLayer != null) {
        this.markerLayer = this.editor.addMarkerLayer();
      } else {
        this.markerLayer = this.editor;
      }
      if (colorMarkers != null) {
        this.restoreMarkersState(colorMarkers);
        this.cleanUnusedTextEditorMarkers();
      }
      this.updateIgnoredScopes();
      this.initialize();
    }

    ColorBuffer.prototype.onDidUpdateColorMarkers = function(callback) {
      return this.emitter.on('did-update-color-markers', callback);
    };

    ColorBuffer.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ColorBuffer.prototype.initialize = function() {
      if (this.colorMarkers != null) {
        return Promise.resolve();
      }
      if (this.initializePromise != null) {
        return this.initializePromise;
      }
      this.updateVariableRanges();
      this.initializePromise = this.scanBufferForColors().then((function(_this) {
        return function(results) {
          return _this.createColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function(results) {
          _this.colorMarkers = results;
          return _this.initialized = true;
        };
      })(this));
      this.initializePromise.then((function(_this) {
        return function() {
          return _this.variablesAvailable();
        };
      })(this));
      return this.initializePromise;
    };

    ColorBuffer.prototype.restoreMarkersState = function(colorMarkers) {
      if (Color == null) {
        Color = require('./color');
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      this.updateVariableRanges();
      return this.colorMarkers = colorMarkers.filter(function(state) {
        return state != null;
      }).map((function(_this) {
        return function(state) {
          var color, marker, ref1;
          marker = (ref1 = _this.editor.getMarker(state.markerId)) != null ? ref1 : _this.markerLayer.markBufferRange(state.bufferRange, {
            invalidate: 'touch'
          });
          color = new Color(state.color);
          color.variables = state.variables;
          color.invalid = state.invalid;
          return _this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
            marker: marker,
            color: color,
            text: state.text,
            colorBuffer: _this
          });
        };
      })(this));
    };

    ColorBuffer.prototype.cleanUnusedTextEditorMarkers = function() {
      return this.markerLayer.findMarkers().forEach((function(_this) {
        return function(m) {
          if (_this.colorMarkersByMarkerId[m.id] == null) {
            return m.destroy();
          }
        };
      })(this));
    };

    ColorBuffer.prototype.variablesAvailable = function() {
      if (this.variablesPromise != null) {
        return this.variablesPromise;
      }
      return this.variablesPromise = this.project.initialize().then((function(_this) {
        return function(results) {
          if (_this.destroyed) {
            return;
          }
          if (results == null) {
            return;
          }
          if (_this.isIgnored() && _this.isVariablesSource()) {
            return _this.scanBufferForVariables();
          }
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.variableInitialized = true;
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.update = function() {
      var promise;
      this.terminateRunningTask();
      promise = this.isIgnored() ? this.scanBufferForVariables() : !this.isVariablesSource() ? Promise.resolve([]) : this.project.reloadVariablesForPath(this.editor.getPath());
      return promise.then((function(_this) {
        return function(results) {
          return _this.scanBufferForColors({
            variables: results
          });
        };
      })(this)).then((function(_this) {
        return function(results) {
          return _this.updateColorMarkers(results);
        };
      })(this))["catch"](function(reason) {
        return console.log(reason);
      });
    };

    ColorBuffer.prototype.terminateRunningTask = function() {
      var ref1;
      return (ref1 = this.task) != null ? ref1.terminate() : void 0;
    };

    ColorBuffer.prototype.destroy = function() {
      var ref1;
      if (this.destroyed) {
        return;
      }
      this.terminateRunningTask();
      this.subscriptions.dispose();
      if ((ref1 = this.colorMarkers) != null) {
        ref1.forEach(function(marker) {
          return marker.destroy();
        });
      }
      this.destroyed = true;
      this.emitter.emit('did-destroy');
      return this.emitter.dispose();
    };

    ColorBuffer.prototype.isVariablesSource = function() {
      return this.project.isVariablesSourcePath(this.editor.getPath());
    };

    ColorBuffer.prototype.isIgnored = function() {
      var p;
      p = this.editor.getPath();
      return this.project.isIgnoredPath(p) || !atom.project.contains(p);
    };

    ColorBuffer.prototype.isDestroyed = function() {
      return this.destroyed;
    };

    ColorBuffer.prototype.getPath = function() {
      return this.editor.getPath();
    };

    ColorBuffer.prototype.getScope = function() {
      return this.project.scopeFromFileName(this.getPath());
    };

    ColorBuffer.prototype.updateIgnoredScopes = function() {
      var ref1;
      this.ignoredScopes = this.project.getIgnoredScopes().map(function(scope) {
        try {
          return new RegExp(scope);
        } catch (error) {}
      }).filter(function(re) {
        return re != null;
      });
      if ((ref1 = this.getColorMarkers()) != null) {
        ref1.forEach(function(marker) {
          return marker.checkMarkerScope(true);
        });
      }
      return this.emitter.emit('did-update-color-markers', {
        created: [],
        destroyed: []
      });
    };

    ColorBuffer.prototype.updateVariableRanges = function() {
      var variablesForBuffer;
      variablesForBuffer = this.project.getVariablesForPath(this.editor.getPath());
      return variablesForBuffer.forEach((function(_this) {
        return function(variable) {
          return variable.bufferRange != null ? variable.bufferRange : variable.bufferRange = Range.fromObject([_this.editor.getBuffer().positionForCharacterIndex(variable.range[0]), _this.editor.getBuffer().positionForCharacterIndex(variable.range[1])]);
        };
      })(this));
    };

    ColorBuffer.prototype.scanBufferForVariables = function() {
      var buffer, config, editor, results, taskPath;
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (!this.editor.getPath()) {
        return Promise.resolve([]);
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-variables-handler');
      editor = this.editor;
      buffer = this.editor.getBuffer();
      config = {
        buffer: this.editor.getText(),
        registry: this.project.getVariableExpressionsRegistry().serialize(),
        scope: this.getScope()
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:variables-found', function(variables) {
            return results = results.concat(variables.map(function(variable) {
              variable.path = editor.getPath();
              variable.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(variable.range[0]), buffer.positionForCharacterIndex(variable.range[1])]);
              return variable;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.getMarkerLayer = function() {
      return this.markerLayer;
    };

    ColorBuffer.prototype.getColorMarkers = function() {
      return this.colorMarkers;
    };

    ColorBuffer.prototype.getValidColorMarkers = function() {
      var ref1, ref2;
      return (ref1 = (ref2 = this.getColorMarkers()) != null ? ref2.filter(function(m) {
        var ref3;
        return ((ref3 = m.color) != null ? ref3.isValid() : void 0) && !m.isIgnored();
      }) : void 0) != null ? ref1 : [];
    };

    ColorBuffer.prototype.getColorMarkerAtBufferPosition = function(bufferPosition) {
      var i, len, marker, markers;
      markers = this.markerLayer.findMarkers({
        containsBufferPosition: bufferPosition
      });
      for (i = 0, len = markers.length; i < len; i++) {
        marker = markers[i];
        if (this.colorMarkersByMarkerId[marker.id] != null) {
          return this.colorMarkersByMarkerId[marker.id];
        }
      }
    };

    ColorBuffer.prototype.createColorMarkers = function(results) {
      if (this.destroyed) {
        return Promise.resolve([]);
      }
      if (ColorMarker == null) {
        ColorMarker = require('./color-marker');
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var newResults, processResults;
          newResults = [];
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            if (_this.editor.isDestroyed()) {
              return resolve([]);
            }
            while (results.length) {
              result = results.shift();
              marker = _this.markerLayer.markBufferRange(result.bufferRange, {
                invalidate: 'touch'
              });
              newResults.push(_this.colorMarkersByMarkerId[marker.id] = new ColorMarker({
                marker: marker,
                color: result.color,
                text: result.match,
                colorBuffer: _this
              }));
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve(newResults);
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.findExistingMarkers = function(results) {
      var newMarkers, toCreate;
      newMarkers = [];
      toCreate = [];
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var processResults;
          processResults = function() {
            var marker, result, startDate;
            startDate = new Date;
            while (results.length) {
              result = results.shift();
              if (marker = _this.findColorMarker(result)) {
                newMarkers.push(marker);
              } else {
                toCreate.push(result);
              }
              if (new Date() - startDate > 10) {
                requestAnimationFrame(processResults);
                return;
              }
            }
            return resolve({
              newMarkers: newMarkers,
              toCreate: toCreate
            });
          };
          return processResults();
        };
      })(this));
    };

    ColorBuffer.prototype.updateColorMarkers = function(results) {
      var createdMarkers, newMarkers;
      newMarkers = null;
      createdMarkers = null;
      return this.findExistingMarkers(results).then((function(_this) {
        return function(arg) {
          var markers, toCreate;
          markers = arg.newMarkers, toCreate = arg.toCreate;
          newMarkers = markers;
          return _this.createColorMarkers(toCreate);
        };
      })(this)).then((function(_this) {
        return function(results) {
          var toDestroy;
          createdMarkers = results;
          newMarkers = newMarkers.concat(results);
          if (_this.colorMarkers != null) {
            toDestroy = _this.colorMarkers.filter(function(marker) {
              return indexOf.call(newMarkers, marker) < 0;
            });
            toDestroy.forEach(function(marker) {
              delete _this.colorMarkersByMarkerId[marker.id];
              return marker.destroy();
            });
          } else {
            toDestroy = [];
          }
          _this.colorMarkers = newMarkers;
          return _this.emitter.emit('did-update-color-markers', {
            created: createdMarkers,
            destroyed: toDestroy
          });
        };
      })(this));
    };

    ColorBuffer.prototype.findColorMarker = function(properties) {
      var i, len, marker, ref1;
      if (properties == null) {
        properties = {};
      }
      if (this.colorMarkers == null) {
        return;
      }
      ref1 = this.colorMarkers;
      for (i = 0, len = ref1.length; i < len; i++) {
        marker = ref1[i];
        if (marker != null ? marker.match(properties) : void 0) {
          return marker;
        }
      }
    };

    ColorBuffer.prototype.findColorMarkers = function(properties) {
      var markers;
      if (properties == null) {
        properties = {};
      }
      markers = this.markerLayer.findMarkers(properties);
      return markers.map((function(_this) {
        return function(marker) {
          return _this.colorMarkersByMarkerId[marker.id];
        };
      })(this)).filter(function(marker) {
        return marker != null;
      });
    };

    ColorBuffer.prototype.findValidColorMarkers = function(properties) {
      return this.findColorMarkers(properties).filter((function(_this) {
        return function(marker) {
          var ref1;
          return (marker != null) && ((ref1 = marker.color) != null ? ref1.isValid() : void 0) && !(marker != null ? marker.isIgnored() : void 0);
        };
      })(this));
    };

    ColorBuffer.prototype.selectColorMarkerAndOpenPicker = function(colorMarker) {
      var ref1;
      if (this.destroyed) {
        return;
      }
      this.editor.setSelectedBufferRange(colorMarker.marker.getBufferRange());
      if (!((ref1 = this.editor.getSelectedText()) != null ? ref1.match(/^#[0-9a-fA-F]{3,8}$/) : void 0)) {
        return;
      }
      if (this.project.colorPickerAPI != null) {
        return this.project.colorPickerAPI.open(this.editor, this.editor.getLastCursor());
      }
    };

    ColorBuffer.prototype.scanBufferForColors = function(options) {
      var buffer, collection, config, ref1, ref2, ref3, ref4, ref5, registry, results, taskPath, variables;
      if (options == null) {
        options = {};
      }
      if (this.destroyed) {
        return Promise.reject("This ColorBuffer is already destroyed");
      }
      if (Color == null) {
        Color = require('./color');
      }
      results = [];
      taskPath = require.resolve('./tasks/scan-buffer-colors-handler');
      buffer = this.editor.getBuffer();
      registry = this.project.getColorExpressionsRegistry().serialize();
      if (options.variables != null) {
        if (VariablesCollection == null) {
          VariablesCollection = require('./variables-collection');
        }
        collection = new VariablesCollection();
        collection.addMany(options.variables);
        options.variables = collection;
      }
      variables = this.isVariablesSource() ? ((ref2 = (ref3 = options.variables) != null ? ref3.getVariables() : void 0) != null ? ref2 : []).concat((ref1 = this.project.getVariables()) != null ? ref1 : []) : (ref4 = (ref5 = options.variables) != null ? ref5.getVariables() : void 0) != null ? ref4 : [];
      delete registry.expressions['pigments:variables'];
      delete registry.regexpString;
      config = {
        buffer: this.editor.getText(),
        bufferPath: this.getPath(),
        scope: this.getScope(),
        variables: variables,
        colorVariables: variables.filter(function(v) {
          return v.isColor;
        }),
        registry: registry
      };
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.task = Task.once(taskPath, config, function() {
            _this.task = null;
            return resolve(results);
          });
          return _this.task.on('scan-buffer:colors-found', function(colors) {
            return results = results.concat(colors.map(function(res) {
              res.color = new Color(res.color);
              res.bufferRange = Range.fromObject([buffer.positionForCharacterIndex(res.range[0]), buffer.positionForCharacterIndex(res.range[1])]);
              return res;
            }));
          });
        };
      })(this));
    };

    ColorBuffer.prototype.serialize = function() {
      var ref1;
      return {
        id: this.id,
        path: this.editor.getPath(),
        colorMarkers: (ref1 = this.colorMarkers) != null ? ref1.map(function(marker) {
          return marker.serialize();
        }) : void 0
      };
    };

    return ColorBuffer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1idWZmZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3R0FBQTtJQUFBOztFQUFBLE1BSUksRUFKSixFQUNFLGNBREYsRUFDUyxvQkFEVCxFQUNzQiw0QkFEdEIsRUFFRSxnQkFGRixFQUVXLDRCQUZYLEVBRWdDLGFBRmhDLEVBRXNDLGNBRnRDLEVBR0U7O0VBR0YsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHFCQUFDLE1BQUQ7QUFDWCxVQUFBOztRQURZLFNBQU87O01BQ25CLElBQU8sZUFBUDtRQUNFLE9BQThDLE9BQUEsQ0FBUSxNQUFSLENBQTlDLEVBQUMsc0JBQUQsRUFBVSw4Q0FBVixFQUErQixnQkFBL0IsRUFBcUMsbUJBRHZDOztNQUdDLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGlCQUFBLE9BQVgsRUFBb0I7TUFDbkIsSUFBQyxDQUFBLEtBQU0sSUFBQyxDQUFBLE9BQVA7TUFDRixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxhQUFELEdBQWU7TUFFZixJQUFDLENBQUEsc0JBQUQsR0FBMEI7TUFFMUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixDQUFuQjtNQUVBLFNBQUEsR0FBWSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDVixjQUFBO2dFQUFrQixDQUFFLE9BQXBCLENBQTRCLFNBQUMsTUFBRDttQkFDMUIsTUFBTSxDQUFDLGdC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T0FBUjtVQUZGLENBSE07aUJBUVIsS0FBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsMEJBQVQsRUFBcUMsU0FBQyxNQUFEO21CQUNuQyxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQUMsR0FBRDtjQUNsQyxHQUFHLENBQUMsS0FBSixHQUFZLElBQUksS0FBSixDQUFVLEdBQUcsQ0FBQyxLQUFkO2NBQ1osR0FBRyxDQUFDLFdBQUosR0FBa0IsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsQ0FDakMsTUFBTSxDQUFDLHlCQUFQLENBQWlDLEdBQUcsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUEzQyxDQURpQyxFQUVqQyxNQUFNLENBQUMseUJBQVAsQ0FBaUMsR0FBRyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQTNDLENBRmlDLENBQWpCO3FCQUlsQjtZQU5rQyxDQUFYLENBQWY7VUFEeUIsQ0FBckM7UUFUVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtJQXRDbUI7OzBCQXdEckIsU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO2FBQUE7UUFDRyxJQUFELElBQUMsQ0FBQSxFQURIO1FBRUUsSUFBQSxFQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBRlI7UUFHRSxZQUFBLDJDQUEyQixDQUFFLEdBQWYsQ0FBbUIsU0FBQyxNQUFEO2lCQUMvQixNQUFNLENBQUMsU0FBUCxDQUFBO1FBRCtCLENBQW5CLFVBSGhCOztJQURTOzs7OztBQXpiYiIsInNvdXJjZXNDb250ZW50IjpbIltcbiAgQ29sb3IsIENvbG9yTWFya2VyLCBWYXJpYWJsZXNDb2xsZWN0aW9uLFxuICBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBUYXNrLCBSYW5nZSxcbiAgZnNcbl0gPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDb2xvckJ1ZmZlclxuICBjb25zdHJ1Y3RvcjogKHBhcmFtcz17fSkgLT5cbiAgICB1bmxlc3MgRW1pdHRlcj9cbiAgICAgIHtFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBUYXNrLCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG4gICAge0BlZGl0b3IsIEBwcm9qZWN0LCBjb2xvck1hcmtlcnN9ID0gcGFyYW1zXG4gICAge0BpZH0gPSBAZWRpdG9yXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAaWdub3JlZFNjb3Blcz1bXVxuXG4gICAgQGNvbG9yTWFya2Vyc0J5TWFya2VySWQgPSB7fVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ID0+IEBkZXN0cm95KClcblxuICAgIHRva2VuaXplZCA9ID0+XG4gICAgICBAZ2V0Q29sb3JNYXJrZXJzKCk/LmZvckVhY2ggKG1hcmtlcikgLT5cbiAgICAgICAgbWFya2VyLmNoZWNrTWFya2VyU2NvcGUodHJ1ZSlcblxuICAgIGlmIEBlZGl0b3Iub25EaWRUb2tlbml6ZT9cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkVG9rZW5pemUodG9rZW5pemVkKVxuICAgIGVsc2VcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLmRpc3BsYXlCdWZmZXIub25EaWRUb2tlbml6ZSh0b2tlbml6ZWQpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZSA9PlxuICAgICAgQHRlcm1pbmF0ZVJ1bm5pbmdUYXNrKCkgaWYgQGluaXRpYWxpemVkIGFuZCBAdmFyaWFibGVJbml0aWFsaXplZFxuICAgICAgY2xlYXJUaW1lb3V0KEB0aW1lb3V0KSBpZiBAdGltZW91dD9cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBpZiBAZGVsYXlCZWZvcmVTY2FuIGlzIDBcbiAgICAgICAgQHVwZGF0ZSgpXG4gICAgICBlbHNlXG4gICAgICAgIGNsZWFyVGltZW91dChAdGltZW91dCkgaWYgQHRpbWVvdXQ/XG4gICAgICAgIEB0aW1lb3V0ID0gc2V0VGltZW91dCA9PlxuICAgICAgICAgIEB1cGRhdGUoKVxuICAgICAgICAgIEB0aW1lb3V0ID0gbnVsbFxuICAgICAgICAsIEBkZWxheUJlZm9yZVNjYW5cblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCAocGF0aCkgPT5cbiAgICAgIEBwcm9qZWN0LmFwcGVuZFBhdGgocGF0aCkgaWYgQGlzVmFyaWFibGVzU291cmNlKClcbiAgICAgIEB1cGRhdGUoKVxuXG4gICAgaWYgQHByb2plY3QuZ2V0UGF0aHMoKT8gYW5kIEBpc1ZhcmlhYmxlc1NvdXJjZSgpIGFuZCAhQHByb2plY3QuaGFzUGF0aChAZWRpdG9yLmdldFBhdGgoKSlcbiAgICAgIGZzID89IHJlcXVpcmUgJ2ZzJ1xuXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKEBlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgICBAcHJvamVjdC5hcHBlbmRQYXRoKEBlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgZWxzZVxuICAgICAgICBzYXZlU3Vic2NyaXB0aW9uID0gQGVkaXRvci5vbkRpZFNhdmUgKHtwYXRofSkgPT5cbiAgICAgICAgICBAcHJvamVjdC5hcHBlbmRQYXRoKHBhdGgpXG4gICAgICAgICAgQHVwZGF0ZSgpXG4gICAgICAgICAgc2F2ZVN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUoc2F2ZVN1YnNjcmlwdGlvbilcblxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQoc2F2ZVN1YnNjcmlwdGlvbilcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyA9PlxuICAgICAgcmV0dXJuIHVubGVzcyBAdmFyaWFibGVJbml0aWFsaXplZFxuICAgICAgQHNjYW5CdWZmZXJGb3JDb2xvcnMoKS50aGVuIChyZXN1bHRzKSA9PiBAdXBkYXRlQ29sb3JNYXJrZXJzKHJlc3VsdHMpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHByb2plY3Qub25EaWRDaGFuZ2VJZ25vcmVkU2NvcGVzID0+XG4gICAgICBAdXBkYXRlSWdub3JlZFNjb3BlcygpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuZGVsYXlCZWZvcmVTY2FuJywgKEBkZWxheUJlZm9yZVNjYW49MCkgPT5cblxuICAgIGlmIEBlZGl0b3IuYWRkTWFya2VyTGF5ZXI/XG4gICAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBlbHNlXG4gICAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yXG5cbiAgICBpZiBjb2xvck1hcmtlcnM/XG4gICAgICBAcmVzdG9yZU1hcmtlcnNTdGF0ZShjb2xvck1hcmtlcnMpXG4gICAgICBAY2xlYW5VbnVzZWRUZXh0RWRpdG9yTWFya2VycygpXG5cbiAgICBAdXBkYXRlSWdub3JlZFNjb3BlcygpXG4gICAgQGluaXRpYWxpemUoKVxuXG4gIG9uRGlkVXBkYXRlQ29sb3JNYXJrZXJzOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycsIGNhbGxiYWNrXG5cbiAgb25EaWREZXN0cm95OiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1kZXN0cm95JywgY2FsbGJhY2tcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKSBpZiBAY29sb3JNYXJrZXJzP1xuICAgIHJldHVybiBAaW5pdGlhbGl6ZVByb21pc2UgaWYgQGluaXRpYWxpemVQcm9taXNlP1xuXG4gICAgQHVwZGF0ZVZhcmlhYmxlUmFuZ2VzKClcblxuICAgIEBpbml0aWFsaXplUHJvbWlzZSA9IEBzY2FuQnVmZmVyRm9yQ29sb3JzKCkudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIEBjcmVhdGVDb2xvck1hcmtlcnMocmVzdWx0cylcbiAgICAudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIEBjb2xvck1hcmtlcnMgPSByZXN1bHRzXG4gICAgICBAaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBAaW5pdGlhbGl6ZVByb21pc2UudGhlbiA9PiBAdmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgIEBpbml0aWFsaXplUHJvbWlzZVxuXG4gIHJlc3RvcmVNYXJrZXJzU3RhdGU6IChjb2xvck1hcmtlcnMpIC0+XG4gICAgQ29sb3IgPz0gcmVxdWlyZSAnLi9jb2xvcidcbiAgICBDb2xvck1hcmtlciA/PSByZXF1aXJlICcuL2NvbG9yLW1hcmtlcidcblxuICAgIEB1cGRhdGVWYXJpYWJsZVJhbmdlcygpXG5cbiAgICBAY29sb3JNYXJrZXJzID0gY29sb3JNYXJrZXJzXG4gICAgLmZpbHRlciAoc3RhdGUpIC0+IHN0YXRlP1xuICAgIC5tYXAgKHN0YXRlKSA9PlxuICAgICAgbWFya2VyID0gQGVkaXRvci5nZXRNYXJrZXIoc3RhdGUubWFya2VySWQpID8gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShzdGF0ZS5idWZmZXJSYW5nZSwgeyBpbnZhbGlkYXRlOiAndG91Y2gnIH0pXG4gICAgICBjb2xvciA9IG5ldyBDb2xvcihzdGF0ZS5jb2xvcilcbiAgICAgIGNvbG9yLnZhcmlhYmxlcyA9IHN0YXRlLnZhcmlhYmxlc1xuICAgICAgY29sb3IuaW52YWxpZCA9IHN0YXRlLmludmFsaWRcbiAgICAgIEBjb2xvck1hcmtlcnNCeU1hcmtlcklkW21hcmtlci5pZF0gPSBuZXcgQ29sb3JNYXJrZXIge1xuICAgICAgICBtYXJrZXJcbiAgICAgICAgY29sb3JcbiAgICAgICAgdGV4dDogc3RhdGUudGV4dFxuICAgICAgICBjb2xvckJ1ZmZlcjogdGhpc1xuICAgICAgfVxuXG4gIGNsZWFuVW51c2VkVGV4dEVkaXRvck1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKCkuZm9yRWFjaCAobSkgPT5cbiAgICAgIG0uZGVzdHJveSgpIHVubGVzcyBAY29sb3JNYXJrZXJzQnlNYXJrZXJJZFttLmlkXT9cblxuICB2YXJpYWJsZXNBdmFpbGFibGU6IC0+XG4gICAgcmV0dXJuIEB2YXJpYWJsZXNQcm9taXNlIGlmIEB2YXJpYWJsZXNQcm9taXNlP1xuXG4gICAgQHZhcmlhYmxlc1Byb21pc2UgPSBAcHJvamVjdC5pbml0aWFsaXplKClcbiAgICAudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIHJldHVybiBpZiBAZGVzdHJveWVkXG4gICAgICByZXR1cm4gdW5sZXNzIHJlc3VsdHM/XG5cbiAgICAgIEBzY2FuQnVmZmVyRm9yVmFyaWFibGVzKCkgaWYgQGlzSWdub3JlZCgpIGFuZCBAaXNWYXJpYWJsZXNTb3VyY2UoKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQHNjYW5CdWZmZXJGb3JDb2xvcnMgdmFyaWFibGVzOiByZXN1bHRzXG4gICAgLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBAdXBkYXRlQ29sb3JNYXJrZXJzKHJlc3VsdHMpXG4gICAgLnRoZW4gPT5cbiAgICAgIEB2YXJpYWJsZUluaXRpYWxpemVkID0gdHJ1ZVxuICAgIC5jYXRjaCAocmVhc29uKSAtPlxuICAgICAgY29uc29sZS5sb2cgcmVhc29uXG5cbiAgdXBkYXRlOiAtPlxuICAgIEB0ZXJtaW5hdGVSdW5uaW5nVGFzaygpXG5cbiAgICBwcm9taXNlID0gaWYgQGlzSWdub3JlZCgpXG4gICAgICBAc2NhbkJ1ZmZlckZvclZhcmlhYmxlcygpXG4gICAgZWxzZSB1bmxlc3MgQGlzVmFyaWFibGVzU291cmNlKClcbiAgICAgIFByb21pc2UucmVzb2x2ZShbXSlcbiAgICBlbHNlXG4gICAgICBAcHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRoKEBlZGl0b3IuZ2V0UGF0aCgpKVxuXG4gICAgcHJvbWlzZS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQHNjYW5CdWZmZXJGb3JDb2xvcnMgdmFyaWFibGVzOiByZXN1bHRzXG4gICAgLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBAdXBkYXRlQ29sb3JNYXJrZXJzKHJlc3VsdHMpXG4gICAgLmNhdGNoIChyZWFzb24pIC0+XG4gICAgICBjb25zb2xlLmxvZyByZWFzb25cblxuICB0ZXJtaW5hdGVSdW5uaW5nVGFzazogLT4gQHRhc2s/LnRlcm1pbmF0ZSgpXG5cbiAgZGVzdHJveTogLT5cbiAgICByZXR1cm4gaWYgQGRlc3Ryb3llZFxuXG4gICAgQHRlcm1pbmF0ZVJ1bm5pbmdUYXNrKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAY29sb3JNYXJrZXJzPy5mb3JFYWNoIChtYXJrZXIpIC0+IG1hcmtlci5kZXN0cm95KClcbiAgICBAZGVzdHJveWVkID0gdHJ1ZVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuICAgIEBlbWl0dGVyLmRpc3Bvc2UoKVxuXG4gIGlzVmFyaWFibGVzU291cmNlOiAtPiBAcHJvamVjdC5pc1ZhcmlhYmxlc1NvdXJjZVBhdGgoQGVkaXRvci5nZXRQYXRoKCkpXG5cbiAgaXNJZ25vcmVkOiAtPlxuICAgIHAgPSBAZWRpdG9yLmdldFBhdGgoKVxuICAgIEBwcm9qZWN0LmlzSWdub3JlZFBhdGgocCkgb3Igbm90IGF0b20ucHJvamVjdC5jb250YWlucyhwKVxuXG4gIGlzRGVzdHJveWVkOiAtPiBAZGVzdHJveWVkXG5cbiAgZ2V0UGF0aDogLT4gQGVkaXRvci5nZXRQYXRoKClcblxuICBnZXRTY29wZTogLT4gQHByb2plY3Quc2NvcGVGcm9tRmlsZU5hbWUoQGdldFBhdGgoKSlcblxuICB1cGRhdGVJZ25vcmVkU2NvcGVzOiAtPlxuICAgIEBpZ25vcmVkU2NvcGVzID0gQHByb2plY3QuZ2V0SWdub3JlZFNjb3BlcygpLm1hcCAoc2NvcGUpIC0+XG4gICAgICB0cnkgbmV3IFJlZ0V4cChzY29wZSlcbiAgICAuZmlsdGVyIChyZSkgLT4gcmU/XG5cbiAgICBAZ2V0Q29sb3JNYXJrZXJzKCk/LmZvckVhY2ggKG1hcmtlcikgLT4gbWFya2VyLmNoZWNrTWFya2VyU2NvcGUodHJ1ZSlcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnLCB7Y3JlYXRlZDogW10sIGRlc3Ryb3llZDogW119XG5cblxuICAjIyAgICAjIyAgICAgIyMgICAgIyMjICAgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICAgIyMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIHVwZGF0ZVZhcmlhYmxlUmFuZ2VzOiAtPlxuICAgIHZhcmlhYmxlc0ZvckJ1ZmZlciA9IEBwcm9qZWN0LmdldFZhcmlhYmxlc0ZvclBhdGgoQGVkaXRvci5nZXRQYXRoKCkpXG4gICAgdmFyaWFibGVzRm9yQnVmZmVyLmZvckVhY2ggKHZhcmlhYmxlKSA9PlxuICAgICAgdmFyaWFibGUuYnVmZmVyUmFuZ2UgPz0gUmFuZ2UuZnJvbU9iamVjdCBbXG4gICAgICAgIEBlZGl0b3IuZ2V0QnVmZmVyKCkucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleCh2YXJpYWJsZS5yYW5nZVswXSlcbiAgICAgICAgQGVkaXRvci5nZXRCdWZmZXIoKS5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KHZhcmlhYmxlLnJhbmdlWzFdKVxuICAgICAgXVxuXG4gIHNjYW5CdWZmZXJGb3JWYXJpYWJsZXM6IC0+XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFwiVGhpcyBDb2xvckJ1ZmZlciBpcyBhbHJlYWR5IGRlc3Ryb3llZFwiKSBpZiBAZGVzdHJveWVkXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSkgdW5sZXNzIEBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICByZXN1bHRzID0gW11cbiAgICB0YXNrUGF0aCA9IHJlcXVpcmUucmVzb2x2ZSgnLi90YXNrcy9zY2FuLWJ1ZmZlci12YXJpYWJsZXMtaGFuZGxlcicpXG4gICAgZWRpdG9yID0gQGVkaXRvclxuICAgIGJ1ZmZlciA9IEBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBjb25maWcgPVxuICAgICAgYnVmZmVyOiBAZWRpdG9yLmdldFRleHQoKVxuICAgICAgcmVnaXN0cnk6IEBwcm9qZWN0LmdldFZhcmlhYmxlRXhwcmVzc2lvbnNSZWdpc3RyeSgpLnNlcmlhbGl6ZSgpXG4gICAgICBzY29wZTogQGdldFNjb3BlKClcblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAdGFzayA9IFRhc2sub25jZShcbiAgICAgICAgdGFza1BhdGgsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgPT5cbiAgICAgICAgICBAdGFzayA9IG51bGxcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpXG4gICAgICApXG5cbiAgICAgIEB0YXNrLm9uICdzY2FuLWJ1ZmZlcjp2YXJpYWJsZXMtZm91bmQnLCAodmFyaWFibGVzKSAtPlxuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQgdmFyaWFibGVzLm1hcCAodmFyaWFibGUpIC0+XG4gICAgICAgICAgdmFyaWFibGUucGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgICB2YXJpYWJsZS5idWZmZXJSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QgW1xuICAgICAgICAgICAgYnVmZmVyLnBvc2l0aW9uRm9yQ2hhcmFjdGVySW5kZXgodmFyaWFibGUucmFuZ2VbMF0pXG4gICAgICAgICAgICBidWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleCh2YXJpYWJsZS5yYW5nZVsxXSlcbiAgICAgICAgICBdXG4gICAgICAgICAgdmFyaWFibGVcblxuICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMgICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjXG4gICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAgIyNcbiAgIyNcbiAgIyMgICAgIyMgICAgICMjICAgICMjIyAgICAjIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMjICAgIyMjICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjIyMgIyMjIyAgIyMgICAjIyAgIyMgICAgICMjICMjICAjIyAgICMjICAgICAgICMjICAgICAjIyAjI1xuICAjIyAgICAjIyAjIyMgIyMgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyAgICAjIyMjIyMgICAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMjICMjICAgIyMgICAjIyAgIyMgICAjIyAgICAgICAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjICMjIyMjIyMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgZ2V0TWFya2VyTGF5ZXI6IC0+IEBtYXJrZXJMYXllclxuXG4gIGdldENvbG9yTWFya2VyczogLT4gQGNvbG9yTWFya2Vyc1xuXG4gIGdldFZhbGlkQ29sb3JNYXJrZXJzOiAtPlxuICAgIEBnZXRDb2xvck1hcmtlcnMoKT8uZmlsdGVyKChtKSAtPiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG5vdCBtLmlzSWdub3JlZCgpKSA/IFtdXG5cbiAgZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uOiAoYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgbWFya2VycyA9IEBtYXJrZXJMYXllci5maW5kTWFya2Vycyh7XG4gICAgICBjb250YWluc0J1ZmZlclBvc2l0aW9uOiBidWZmZXJQb3NpdGlvblxuICAgIH0pXG5cbiAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiAgICAgIGlmIEBjb2xvck1hcmtlcnNCeU1hcmtlcklkW21hcmtlci5pZF0/XG4gICAgICAgIHJldHVybiBAY29sb3JNYXJrZXJzQnlNYXJrZXJJZFttYXJrZXIuaWRdXG5cbiAgY3JlYXRlQ29sb3JNYXJrZXJzOiAocmVzdWx0cykgLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKSBpZiBAZGVzdHJveWVkXG5cbiAgICBDb2xvck1hcmtlciA/PSByZXF1aXJlICcuL2NvbG9yLW1hcmtlcidcblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBuZXdSZXN1bHRzID0gW11cblxuICAgICAgcHJvY2Vzc1Jlc3VsdHMgPSA9PlxuICAgICAgICBzdGFydERhdGUgPSBuZXcgRGF0ZVxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKFtdKSBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgICAgICB3aGlsZSByZXN1bHRzLmxlbmd0aFxuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdHMuc2hpZnQoKVxuXG4gICAgICAgICAgbWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyZXN1bHQuYnVmZmVyUmFuZ2UsIHtpbnZhbGlkYXRlOiAndG91Y2gnfSlcbiAgICAgICAgICBuZXdSZXN1bHRzLnB1c2ggQGNvbG9yTWFya2Vyc0J5TWFya2VySWRbbWFya2VyLmlkXSA9IG5ldyBDb2xvck1hcmtlciB7XG4gICAgICAgICAgICBtYXJrZXJcbiAgICAgICAgICAgIGNvbG9yOiByZXN1bHQuY29sb3JcbiAgICAgICAgICAgIHRleHQ6IHJlc3VsdC5tYXRjaFxuICAgICAgICAgICAgY29sb3JCdWZmZXI6IHRoaXNcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiBuZXcgRGF0ZSgpIC0gc3RhcnREYXRlID4gMTBcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShwcm9jZXNzUmVzdWx0cylcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHJlc29sdmUobmV3UmVzdWx0cylcblxuICAgICAgcHJvY2Vzc1Jlc3VsdHMoKVxuXG4gIGZpbmRFeGlzdGluZ01hcmtlcnM6IChyZXN1bHRzKSAtPlxuICAgIG5ld01hcmtlcnMgPSBbXVxuICAgIHRvQ3JlYXRlID0gW11cblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBwcm9jZXNzUmVzdWx0cyA9ID0+XG4gICAgICAgIHN0YXJ0RGF0ZSA9IG5ldyBEYXRlXG5cbiAgICAgICAgd2hpbGUgcmVzdWx0cy5sZW5ndGhcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHRzLnNoaWZ0KClcblxuICAgICAgICAgIGlmIG1hcmtlciA9IEBmaW5kQ29sb3JNYXJrZXIocmVzdWx0KVxuICAgICAgICAgICAgbmV3TWFya2Vycy5wdXNoKG1hcmtlcilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0b0NyZWF0ZS5wdXNoKHJlc3VsdClcblxuICAgICAgICAgIGlmIG5ldyBEYXRlKCkgLSBzdGFydERhdGUgPiAxMFxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHByb2Nlc3NSZXN1bHRzKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgcmVzb2x2ZSh7bmV3TWFya2VycywgdG9DcmVhdGV9KVxuXG4gICAgICBwcm9jZXNzUmVzdWx0cygpXG5cbiAgdXBkYXRlQ29sb3JNYXJrZXJzOiAocmVzdWx0cykgLT5cbiAgICBuZXdNYXJrZXJzID0gbnVsbFxuICAgIGNyZWF0ZWRNYXJrZXJzID0gbnVsbFxuXG4gICAgQGZpbmRFeGlzdGluZ01hcmtlcnMocmVzdWx0cykudGhlbiAoe25ld01hcmtlcnM6IG1hcmtlcnMsIHRvQ3JlYXRlfSkgPT5cbiAgICAgIG5ld01hcmtlcnMgPSBtYXJrZXJzXG4gICAgICBAY3JlYXRlQ29sb3JNYXJrZXJzKHRvQ3JlYXRlKVxuICAgIC50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgY3JlYXRlZE1hcmtlcnMgPSByZXN1bHRzXG4gICAgICBuZXdNYXJrZXJzID0gbmV3TWFya2Vycy5jb25jYXQocmVzdWx0cylcblxuICAgICAgaWYgQGNvbG9yTWFya2Vycz9cbiAgICAgICAgdG9EZXN0cm95ID0gQGNvbG9yTWFya2Vycy5maWx0ZXIgKG1hcmtlcikgLT4gbWFya2VyIG5vdCBpbiBuZXdNYXJrZXJzXG4gICAgICAgIHRvRGVzdHJveS5mb3JFYWNoIChtYXJrZXIpID0+XG4gICAgICAgICAgZGVsZXRlIEBjb2xvck1hcmtlcnNCeU1hcmtlcklkW21hcmtlci5pZF1cbiAgICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgICBlbHNlXG4gICAgICAgIHRvRGVzdHJveSA9IFtdXG5cbiAgICAgIEBjb2xvck1hcmtlcnMgPSBuZXdNYXJrZXJzXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnLCB7XG4gICAgICAgIGNyZWF0ZWQ6IGNyZWF0ZWRNYXJrZXJzXG4gICAgICAgIGRlc3Ryb3llZDogdG9EZXN0cm95XG4gICAgICB9XG5cbiAgZmluZENvbG9yTWFya2VyOiAocHJvcGVydGllcz17fSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBjb2xvck1hcmtlcnM/XG4gICAgZm9yIG1hcmtlciBpbiBAY29sb3JNYXJrZXJzXG4gICAgICByZXR1cm4gbWFya2VyIGlmIG1hcmtlcj8ubWF0Y2gocHJvcGVydGllcylcblxuICBmaW5kQ29sb3JNYXJrZXJzOiAocHJvcGVydGllcz17fSkgLT5cbiAgICBtYXJrZXJzID0gQG1hcmtlckxheWVyLmZpbmRNYXJrZXJzKHByb3BlcnRpZXMpXG4gICAgbWFya2Vycy5tYXAgKG1hcmtlcikgPT5cbiAgICAgIEBjb2xvck1hcmtlcnNCeU1hcmtlcklkW21hcmtlci5pZF1cbiAgICAuZmlsdGVyIChtYXJrZXIpIC0+IG1hcmtlcj9cblxuICBmaW5kVmFsaWRDb2xvck1hcmtlcnM6IChwcm9wZXJ0aWVzKSAtPlxuICAgIEBmaW5kQ29sb3JNYXJrZXJzKHByb3BlcnRpZXMpLmZpbHRlciAobWFya2VyKSA9PlxuICAgICAgbWFya2VyPyBhbmQgbWFya2VyLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG5vdCBtYXJrZXI/LmlzSWdub3JlZCgpXG5cbiAgc2VsZWN0Q29sb3JNYXJrZXJBbmRPcGVuUGlja2VyOiAoY29sb3JNYXJrZXIpIC0+XG4gICAgcmV0dXJuIGlmIEBkZXN0cm95ZWRcblxuICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShjb2xvck1hcmtlci5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcblxuICAgICMgRm9yIHRoZSBtb21lbnQgaXQgc2VlbXMgb25seSBjb2xvcnMgaW4gI1JSR0dCQiBmb3JtYXQgYXJlIGRldGVjdGVkXG4gICAgIyBieSB0aGUgY29sb3IgcGlja2VyLCBzbyB3ZSdsbCBleGNsdWRlIGFueXRoaW5nIGVsc2VcbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCk/Lm1hdGNoKC9eI1swLTlhLWZBLUZdezMsOH0kLylcblxuICAgIGlmIEBwcm9qZWN0LmNvbG9yUGlja2VyQVBJP1xuICAgICAgQHByb2plY3QuY29sb3JQaWNrZXJBUEkub3BlbihAZWRpdG9yLCBAZWRpdG9yLmdldExhc3RDdXJzb3IoKSlcblxuICBzY2FuQnVmZmVyRm9yQ29sb3JzOiAob3B0aW9ucz17fSkgLT5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJUaGlzIENvbG9yQnVmZmVyIGlzIGFscmVhZHkgZGVzdHJveWVkXCIpIGlmIEBkZXN0cm95ZWRcblxuICAgIENvbG9yID89IHJlcXVpcmUgJy4vY29sb3InXG5cbiAgICByZXN1bHRzID0gW11cbiAgICB0YXNrUGF0aCA9IHJlcXVpcmUucmVzb2x2ZSgnLi90YXNrcy9zY2FuLWJ1ZmZlci1jb2xvcnMtaGFuZGxlcicpXG4gICAgYnVmZmVyID0gQGVkaXRvci5nZXRCdWZmZXIoKVxuICAgIHJlZ2lzdHJ5ID0gQHByb2plY3QuZ2V0Q29sb3JFeHByZXNzaW9uc1JlZ2lzdHJ5KCkuc2VyaWFsaXplKClcblxuICAgIGlmIG9wdGlvbnMudmFyaWFibGVzP1xuICAgICAgVmFyaWFibGVzQ29sbGVjdGlvbiA/PSByZXF1aXJlICcuL3ZhcmlhYmxlcy1jb2xsZWN0aW9uJ1xuXG4gICAgICBjb2xsZWN0aW9uID0gbmV3IFZhcmlhYmxlc0NvbGxlY3Rpb24oKVxuICAgICAgY29sbGVjdGlvbi5hZGRNYW55KG9wdGlvbnMudmFyaWFibGVzKVxuICAgICAgb3B0aW9ucy52YXJpYWJsZXMgPSBjb2xsZWN0aW9uXG5cbiAgICB2YXJpYWJsZXMgPSBpZiBAaXNWYXJpYWJsZXNTb3VyY2UoKVxuICAgICAgIyBJbiB0aGUgY2FzZSBvZiBmaWxlcyBjb25zaWRlcmVkIGFzIHNvdXJjZSwgdGhlIHZhcmlhYmxlcyBpbiB0aGUgcHJvamVjdFxuICAgICAgIyBhcmUgbmVlZGVkIHdoZW4gcGFyc2luZyB0aGUgZmlsZXMuXG4gICAgICAob3B0aW9ucy52YXJpYWJsZXM/LmdldFZhcmlhYmxlcygpID8gW10pLmNvbmNhdChAcHJvamVjdC5nZXRWYXJpYWJsZXMoKSA/IFtdKVxuICAgIGVsc2VcbiAgICAgICMgRmlsZXMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIHNvdXJjZXMgd2lsbCBvbmx5IHVzZSB0aGUgdmFyaWFibGVzXG4gICAgICAjIGRlZmluZWQgaW4gdGhlbSBhbmQgc28gdGhlIGdsb2JhbCB2YXJpYWJsZXMgZXhwcmVzc2lvbiBtdXN0IGJlXG4gICAgICAjIGRpc2NhcmRlZCBiZWZvcmUgc2VuZGluZyB0aGUgcmVnaXN0cnkgdG8gdGhlIGNoaWxkIHByb2Nlc3MuXG4gICAgICBvcHRpb25zLnZhcmlhYmxlcz8uZ2V0VmFyaWFibGVzKCkgPyBbXVxuXG4gICAgZGVsZXRlIHJlZ2lzdHJ5LmV4cHJlc3Npb25zWydwaWdtZW50czp2YXJpYWJsZXMnXVxuICAgIGRlbGV0ZSByZWdpc3RyeS5yZWdleHBTdHJpbmdcblxuICAgIGNvbmZpZyA9XG4gICAgICBidWZmZXI6IEBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBidWZmZXJQYXRoOiBAZ2V0UGF0aCgpXG4gICAgICBzY29wZTogQGdldFNjb3BlKClcbiAgICAgIHZhcmlhYmxlczogdmFyaWFibGVzXG4gICAgICBjb2xvclZhcmlhYmxlczogdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG4gICAgICByZWdpc3RyeTogcmVnaXN0cnlcblxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBAdGFzayA9IFRhc2sub25jZShcbiAgICAgICAgdGFza1BhdGgsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgPT5cbiAgICAgICAgICBAdGFzayA9IG51bGxcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpXG4gICAgICApXG5cbiAgICAgIEB0YXNrLm9uICdzY2FuLWJ1ZmZlcjpjb2xvcnMtZm91bmQnLCAoY29sb3JzKSAtPlxuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQgY29sb3JzLm1hcCAocmVzKSAtPlxuICAgICAgICAgIHJlcy5jb2xvciA9IG5ldyBDb2xvcihyZXMuY29sb3IpXG4gICAgICAgICAgcmVzLmJ1ZmZlclJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdCBbXG4gICAgICAgICAgICBidWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChyZXMucmFuZ2VbMF0pXG4gICAgICAgICAgICBidWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChyZXMucmFuZ2VbMV0pXG4gICAgICAgICAgXVxuICAgICAgICAgIHJlc1xuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICB7XG4gICAgICBAaWRcbiAgICAgIHBhdGg6IEBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBjb2xvck1hcmtlcnM6IEBjb2xvck1hcmtlcnM/Lm1hcCAobWFya2VyKSAtPlxuICAgICAgICBtYXJrZXIuc2VyaWFsaXplKClcbiAgICB9XG4iXX0=

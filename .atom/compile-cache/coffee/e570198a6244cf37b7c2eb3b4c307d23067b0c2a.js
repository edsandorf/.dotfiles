(function() {
  var ColorBuffer, jsonFixture, path, registry,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  path = require('path');

  ColorBuffer = require('../lib/color-buffer');

  registry = require('../lib/color-expressions');

  jsonFixture = require('./helpers/fixtures').jsonFixture(__dirname, 'fixtures');

  describe('ColorBuffer', function() {
    var colorBuffer, editBuffer, editor, pigments, project, ref, sleep;
    ref = [], editor = ref[0], colorBuffer = ref[1], pigments = ref[2], project = ref[3];
    sleep = function(ms) {
      var start;
      start = new Date;
      return function() {
        return new Date - start >= ms;
      };
    };
    editBuffer = function(text, options) {
      var range;
      if (options == null) {
        options = {};
      }
      if (options.start != null) {
        if (options.end != null) {
          range = [options.start, options.end];
        } else {
          range = [options.start, options.start];
        }
        editor.setSelectedBufferRange(range);
      }
      editor.insertText(text);
      if (!options.noEvent) {
        return advanceClock(500);
      }
    };
    beforeEach(function() {
      atom.config.set('pigments.delayBeforeScan', 0);
      atom.config.set('pigments.ignoredBufferNames', []);
      atom.config.set('pigments.filetypesForColorWords', ['*']);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      atom.config.set('pigments.ignoredNames', ['project/vendor/**']);
      waitsForPromise(function() {
        return atom.workspace.open('four-variables.styl').then(function(o) {
          return editor = o;
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        })["catch"](function(err) {
          return console.error(err);
        });
      });
    });
    afterEach(function() {
      return colorBuffer != null ? colorBuffer.destroy() : void 0;
    });
    it('creates a color buffer for each editor in the workspace', function() {
      return expect(project.colorBuffersByEditorId[editor.id]).toBeDefined();
    });
    describe('when the file path matches an entry in ignoredBufferNames', function() {
      beforeEach(function() {
        expect(project.hasColorBufferForEditor(editor)).toBeTruthy();
        return atom.config.set('pigments.ignoredBufferNames', ['**/*.styl']);
      });
      it('destroys the color buffer for this file', function() {
        return expect(project.hasColorBufferForEditor(editor)).toBeFalsy();
      });
      it('recreates the color buffer when the settings no longer ignore the file', function() {
        expect(project.hasColorBufferForEditor(editor)).toBeFalsy();
        atom.config.set('pigments.ignoredBufferNames', []);
        return expect(project.hasColorBufferForEditor(editor)).toBeTruthy();
      });
      return it('prevents the creation of a new color buffer', function() {
        waitsForPromise(function() {
          return atom.workspace.open('variables.styl').then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          return expect(project.hasColorBufferForEditor(editor)).toBeFalsy();
        });
      });
    });
    describe('when an editor with a path is not in the project paths is opened', function() {
      beforeEach(function() {
        return waitsFor(function() {
          return project.getPaths() != null;
        });
      });
      describe('when the file is already saved on disk', function() {
        var pathToOpen;
        pathToOpen = null;
        beforeEach(function() {
          return pathToOpen = project.paths.shift();
        });
        return it('adds the path to the project immediately', function() {
          spyOn(project, 'appendPath');
          waitsForPromise(function() {
            return atom.workspace.open(pathToOpen).then(function(o) {
              editor = o;
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          return runs(function() {
            return expect(project.appendPath).toHaveBeenCalledWith(pathToOpen);
          });
        });
      });
      return describe('when the file is not yet saved on disk', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('foo-de-fafa.styl').then(function(o) {
              editor = o;
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('does not fails when updating the colorBuffer', function() {
          return expect(function() {
            return colorBuffer.update();
          }).not.toThrow();
        });
        return it('adds the path to the project paths on save', function() {
          spyOn(colorBuffer, 'update').andCallThrough();
          spyOn(project, 'appendPath');
          editor.getBuffer().emitter.emit('did-save', {
            path: editor.getPath()
          });
          waitsFor(function() {
            return colorBuffer.update.callCount > 0;
          });
          return runs(function() {
            return expect(project.appendPath).toHaveBeenCalledWith(editor.getPath());
          });
        });
      });
    });
    describe('when an editor without path is opened', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open().then(function(o) {
            editor = o;
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('does not fails when updating the colorBuffer', function() {
        return expect(function() {
          return colorBuffer.update();
        }).not.toThrow();
      });
      return describe('when the file is saved and aquires a path', function() {
        describe('that is legible', function() {
          beforeEach(function() {
            spyOn(colorBuffer, 'update').andCallThrough();
            spyOn(editor, 'getPath').andReturn('new-path.styl');
            editor.emitter.emit('did-change-path', editor.getPath());
            return waitsFor(function() {
              return colorBuffer.update.callCount > 0;
            });
          });
          return it('adds the path to the project paths', function() {
            return expect(indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeTruthy();
          });
        });
        describe('that is not legible', function() {
          beforeEach(function() {
            spyOn(colorBuffer, 'update').andCallThrough();
            spyOn(editor, 'getPath').andReturn('new-path.sass');
            editor.emitter.emit('did-change-path', editor.getPath());
            return waitsFor(function() {
              return colorBuffer.update.callCount > 0;
            });
          });
          return it('does not add the path to the project paths', function() {
            return expect(indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeFalsy();
          });
        });
        return describe('that is ignored', function() {
          beforeEach(function() {
            spyOn(colorBuffer, 'update').andCallThrough();
            spyOn(editor, 'getPath').andReturn('project/vendor/new-path.styl');
            editor.emitter.emit('did-change-path', editor.getPath());
            return waitsFor(function() {
              return colorBuffer.update.callCount > 0;
            });
          });
          return it('does not add the path to the project paths', function() {
            return expect(indexOf.call(project.getPaths(), 'new-path.styl') >= 0).toBeFalsy();
          });
        });
      });
    });
    describe('with rapid changes that triggers a rescan', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        waitsFor(function() {
          return colorBuffer.initialized && colorBuffer.variableInitialized;
        });
        runs(function() {
          spyOn(colorBuffer, 'terminateRunningTask').andCallThrough();
          spyOn(colorBuffer, 'updateColorMarkers').andCallThrough();
          spyOn(colorBuffer, 'scanBufferForVariables').andCallThrough();
          editor.moveToBottom();
          editor.insertText('#fff\n');
          return editor.getBuffer().emitter.emit('did-stop-changing');
        });
        waitsFor(function() {
          return colorBuffer.scanBufferForVariables.callCount > 0;
        });
        return runs(function() {
          return editor.insertText(' ');
        });
      });
      return it('terminates the currently running task', function() {
        return expect(colorBuffer.terminateRunningTask).toHaveBeenCalled();
      });
    });
    describe('when created without a previous state', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        return waitsForPromise(function() {
          return colorBuffer.initialize();
        });
      });
      it('scans the buffer for colors without waiting for the project variables', function() {
        expect(colorBuffer.getColorMarkers().length).toEqual(4);
        return expect(colorBuffer.getValidColorMarkers().length).toEqual(3);
      });
      it('creates the corresponding markers in the text editor', function() {
        return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(4);
      });
      it('knows that it is legible as a variables source file', function() {
        return expect(colorBuffer.isVariablesSource()).toBeTruthy();
      });
      describe('when the editor is destroyed', function() {
        return it('destroys the color buffer at the same time', function() {
          editor.destroy();
          return expect(project.colorBuffersByEditorId[editor.id]).toBeUndefined();
        });
      });
      describe('::getColorMarkerAtBufferPosition', function() {
        describe('when the buffer position is contained in a marker range', function() {
          return it('returns the corresponding color marker', function() {
            var colorMarker;
            colorMarker = colorBuffer.getColorMarkerAtBufferPosition([2, 15]);
            return expect(colorMarker).toEqual(colorBuffer.colorMarkers[1]);
          });
        });
        return describe('when the buffer position is not contained in a marker range', function() {
          return it('returns undefined', function() {
            return expect(colorBuffer.getColorMarkerAtBufferPosition([1, 15])).toBeUndefined();
          });
        });
      });
      describe('when the project variables becomes available', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          updateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(updateSpy);
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('replaces the invalid markers that are now valid', function() {
          expect(colorBuffer.getValidColorMarkers().length).toEqual(4);
          expect(updateSpy.argsForCall[0][0].created.length).toEqual(1);
          return expect(updateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
        });
        describe('when a variable is edited', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
            return editBuffer('#336699', {
              start: [0, 13],
              end: [0, 17]
            });
          });
          return it('updates the modified colors', function() {
            waitsFor(function() {
              return colorsUpdateSpy.callCount > 0;
            });
            return runs(function() {
              expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(2);
              return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(2);
            });
          });
        });
        describe('when a new variable is added', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              updateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(updateSpy);
              editor.moveToBottom();
              editBuffer('\nfoo = base-color');
              return waitsFor(function() {
                return updateSpy.callCount > 0;
              });
            });
          });
          return it('dispatches the new marker in a did-update-color-markers event', function() {
            expect(updateSpy.argsForCall[0][0].destroyed.length).toEqual(0);
            return expect(updateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        describe('when a variable is removed', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
            editBuffer('', {
              start: [0, 0],
              end: [0, 17]
            });
            return waitsFor(function() {
              return colorsUpdateSpy.callCount > 0;
            });
          });
          return it('invalidates colors that were relying on the deleted variables', function() {
            expect(colorBuffer.getColorMarkers().length).toEqual(3);
            return expect(colorBuffer.getValidColorMarkers().length).toEqual(2);
          });
        });
        return describe('::serialize', function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
          });
          return it('returns the whole buffer data', function() {
            var expected;
            expected = jsonFixture("four-variables-buffer.json", {
              id: editor.id,
              root: atom.project.getPaths()[0],
              colorMarkers: colorBuffer.getColorMarkers().map(function(m) {
                return m.marker.id;
              })
            });
            return expect(colorBuffer.serialize()).toEqual(expected);
          });
        });
      });
      describe('with a buffer with only colors', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('buttons.styl').then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        it('creates the color markers for the variables used in the buffer', function() {
          waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
          return runs(function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(3);
          });
        });
        describe('when a color marker is edited', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editBuffer('#336699', {
                start: [1, 13],
                end: [1, 23]
              });
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          it('updates the modified color marker', function() {
            var marker, markers;
            markers = colorBuffer.getColorMarkers();
            marker = markers[markers.length - 1];
            return expect(marker.color).toBeColor('#336699');
          });
          return it('updates only the affected marker', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        describe('when new lines changes the markers range', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editBuffer('#fff\n\n', {
                start: [0, 0],
                end: [0, 0]
              });
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          return it('does not destroys the previous markers', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(0);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        describe('when a new color is added', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editor.moveToBottom();
              editBuffer('\n#336699');
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          it('adds a marker for the new color', function() {
            var marker, markers;
            markers = colorBuffer.getColorMarkers();
            marker = markers[markers.length - 1];
            expect(markers.length).toEqual(4);
            expect(marker.color).toBeColor('#336699');
            return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(4);
          });
          return it('dispatches the new marker in a did-update-color-markers event', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(0);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(1);
          });
        });
        return describe('when a color marker is edited', function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
              colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
              editBuffer('', {
                start: [1, 2],
                end: [1, 23]
              });
              return waitsFor(function() {
                return colorsUpdateSpy.callCount > 0;
              });
            });
          });
          it('updates the modified color marker', function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(2);
          });
          it('updates only the affected marker', function() {
            expect(colorsUpdateSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            return expect(colorsUpdateSpy.argsForCall[0][0].created.length).toEqual(0);
          });
          return it('removes the previous editor markers', function() {
            return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(2);
          });
        });
      });
      describe('with a buffer whose scope is not one of source files', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('project/lib/main.coffee').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            return colorBuffer = project.colorBufferForEditor(editor);
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        return it('does not renders colors from variables', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(4);
        });
      });
      return describe('with a buffer in crlf mode', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('crlf.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            return colorBuffer = project.colorBufferForEditor(editor);
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        return it('creates a marker for each colors', function() {
          return expect(colorBuffer.getValidColorMarkers().length).toEqual(2);
        });
      });
    });
    describe('with a buffer part of the global ignored files', function() {
      beforeEach(function() {
        project.setIgnoredNames([]);
        atom.config.set('pigments.ignoredNames', ['project/vendor/*']);
        waitsForPromise(function() {
          return atom.workspace.open('project/vendor/css/variables.less').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          return colorBuffer = project.colorBufferForEditor(editor);
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('knows that it is part of the ignored files', function() {
        return expect(colorBuffer.isIgnored()).toBeTruthy();
      });
      it('knows that it is a variables source file', function() {
        return expect(colorBuffer.isVariablesSource()).toBeTruthy();
      });
      return it('scans the buffer for variables for in-buffer use only', function() {
        var validMarkers;
        expect(colorBuffer.getColorMarkers().length).toEqual(20);
        validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
          return m.color.isValid();
        });
        return expect(validMarkers.length).toEqual(20);
      });
    });
    describe('with a buffer part of the project ignored files', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('project/vendor/css/variables.less').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          return colorBuffer = project.colorBufferForEditor(editor);
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('knows that it is part of the ignored files', function() {
        return expect(colorBuffer.isIgnored()).toBeTruthy();
      });
      it('knows that it is a variables source file', function() {
        return expect(colorBuffer.isVariablesSource()).toBeTruthy();
      });
      it('scans the buffer for variables for in-buffer use only', function() {
        var validMarkers;
        expect(colorBuffer.getColorMarkers().length).toEqual(20);
        validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
          return m.color.isValid();
        });
        return expect(validMarkers.length).toEqual(20);
      });
      return describe('when the buffer is edited', function() {
        beforeEach(function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
          editor.moveToBottom();
          editBuffer('\n\n@new-color: @base0;\n');
          return waitsFor(function() {
            return colorsUpdateSpy.callCount > 0;
          });
        });
        return it('finds the newly added color', function() {
          var validMarkers;
          expect(colorBuffer.getColorMarkers().length).toEqual(21);
          validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
            return m.color.isValid();
          });
          return expect(validMarkers.length).toEqual(21);
        });
      });
    });
    describe('with a buffer not being a variable source', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('project/lib/main.coffee').then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          return colorBuffer = project.colorBufferForEditor(editor);
        });
        return waitsForPromise(function() {
          return colorBuffer.variablesAvailable();
        });
      });
      it('knows that it is not part of the source files', function() {
        return expect(colorBuffer.isVariablesSource()).toBeFalsy();
      });
      it('knows that it is not part of the ignored files', function() {
        return expect(colorBuffer.isIgnored()).toBeFalsy();
      });
      it('scans the buffer for variables for in-buffer use only', function() {
        var validMarkers;
        expect(colorBuffer.getColorMarkers().length).toEqual(4);
        validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
          return m.color.isValid();
        });
        return expect(validMarkers.length).toEqual(4);
      });
      return describe('when the buffer is edited', function() {
        beforeEach(function() {
          var colorsUpdateSpy;
          colorsUpdateSpy = jasmine.createSpy('did-update-color-markers');
          spyOn(project, 'reloadVariablesForPath').andCallThrough();
          colorBuffer.onDidUpdateColorMarkers(colorsUpdateSpy);
          editor.moveToBottom();
          editBuffer('\n\n@new-color = red;\n');
          return waitsFor(function() {
            return colorsUpdateSpy.callCount > 0;
          });
        });
        it('finds the newly added color', function() {
          var validMarkers;
          expect(colorBuffer.getColorMarkers().length).toEqual(5);
          validMarkers = colorBuffer.getColorMarkers().filter(function(m) {
            return m.color.isValid();
          });
          return expect(validMarkers.length).toEqual(5);
        });
        return it('does not ask the project to reload the variables', function() {
          if (parseFloat(atom.getVersion()) >= 1.19) {
            return expect(project.reloadVariablesForPath).not.toHaveBeenCalled();
          } else {
            return expect(project.reloadVariablesForPath.mostRecentCall.args[0]).not.toEqual(colorBuffer.editor.getPath());
          }
        });
      });
    });
    return describe('when created with a previous state', function() {
      describe('with variables and colors', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return project.initialize();
          });
          return runs(function() {
            var state;
            project.colorBufferForEditor(editor).destroy();
            state = jsonFixture('four-variables-buffer.json', {
              id: editor.id,
              root: atom.project.getPaths()[0],
              colorMarkers: [-1, -2, -3, -4]
            });
            state.editor = editor;
            state.project = project;
            return colorBuffer = new ColorBuffer(state);
          });
        });
        it('creates markers from the state object', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(4);
        });
        it('restores the markers properties', function() {
          var colorMarker;
          colorMarker = colorBuffer.getColorMarkers()[3];
          expect(colorMarker.color).toBeColor(255, 255, 255, 0.5);
          return expect(colorMarker.color.variables).toEqual(['base-color']);
        });
        it('restores the editor markers', function() {
          return expect(colorBuffer.getMarkerLayer().findMarkers().length).toEqual(4);
        });
        return it('restores the ability to fetch markers', function() {
          var i, len, marker, ref1, results;
          expect(colorBuffer.findColorMarkers().length).toEqual(4);
          ref1 = colorBuffer.findColorMarkers();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            marker = ref1[i];
            results.push(expect(marker).toBeDefined());
          }
          return results;
        });
      });
      return describe('with an invalid color', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('invalid-color.styl').then(function(o) {
              return editor = o;
            });
          });
          waitsForPromise(function() {
            return project.initialize();
          });
          return runs(function() {
            var state;
            state = jsonFixture('invalid-color-buffer.json', {
              id: editor.id,
              root: atom.project.getPaths()[0],
              colorMarkers: [-1]
            });
            state.editor = editor;
            state.project = project;
            return colorBuffer = new ColorBuffer(state);
          });
        });
        return it('creates markers from the state object', function() {
          expect(colorBuffer.getColorMarkers().length).toEqual(1);
          return expect(colorBuffer.getValidColorMarkers().length).toEqual(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3ItYnVmZmVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsMEJBQVI7O0VBQ1gsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUixDQUE2QixDQUFDLFdBQTlCLENBQTBDLFNBQTFDLEVBQXFELFVBQXJEOztFQUdkLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7QUFDdEIsUUFBQTtJQUFBLE1BQTJDLEVBQTNDLEVBQUMsZUFBRCxFQUFTLG9CQUFULEVBQXNCLGlCQUF0QixFQUFnQztJQUVoQyxLQUFBLEdBQVEsU0FBQyxFQUFEO0FBQ04sVUFBQTtNQUFBLEtBQUEsR0FBUSxJQUFJO2FBQ1osU0FBQTtlQUFHLElBQUksSUFBSixHQUFXLEtBQVgsSUFBb0I7TUFBdkI7SUFGTTtJQUlSLFVBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ1gsVUFBQTs7UUFEa0IsVUFBUTs7TUFDMUIsSUFBRyxxQkFBSDtRQUNFLElBQUcsbUJBQUg7VUFDRSxLQUFBLEdBQVEsQ0FBQyxPQUFPLENBQUMsS0FBVCxFQUFnQixPQUFPLENBQUMsR0FBeEIsRUFEVjtTQUFBLE1BQUE7VUFHRSxLQUFBLEdBQVEsQ0FBQyxPQUFPLENBQUMsS0FBVCxFQUFnQixPQUFPLENBQUMsS0FBeEIsRUFIVjs7UUFLQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsS0FBOUIsRUFORjs7TUFRQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQjtNQUNBLElBQUEsQ0FBeUIsT0FBTyxDQUFDLE9BQWpDO2VBQUEsWUFBQSxDQUFhLEdBQWIsRUFB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InBhdGggPSByZXF1aXJlICdwYXRoJ1xuQ29sb3JCdWZmZXIgPSByZXF1aXJlICcuLi9saWIvY29sb3ItYnVmZmVyJ1xucmVnaXN0cnkgPSByZXF1aXJlICcuLi9saWIvY29sb3ItZXhwcmVzc2lvbnMnXG5qc29uRml4dHVyZSA9IHJlcXVpcmUoJy4vaGVscGVycy9maXh0dXJlcycpLmpzb25GaXh0dXJlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJylcblxuXG5kZXNjcmliZSAnQ29sb3JCdWZmZXInLCAtPlxuICBbZWRpdG9yLCBjb2xvckJ1ZmZlciwgcGlnbWVudHMsIHByb2plY3RdID0gW11cblxuICBzbGVlcCA9IChtcykgLT5cbiAgICBzdGFydCA9IG5ldyBEYXRlXG4gICAgLT4gbmV3IERhdGUgLSBzdGFydCA+PSBtc1xuXG4gIGVkaXRCdWZmZXIgPSAodGV4dCwgb3B0aW9ucz17fSkgLT5cbiAgICBpZiBvcHRpb25zLnN0YXJ0P1xuICAgICAgaWYgb3B0aW9ucy5lbmQ/XG4gICAgICAgIHJhbmdlID0gW29wdGlvbnMuc3RhcnQsIG9wdGlvbnMuZW5kXVxuICAgICAgZWxzZVxuICAgICAgICByYW5nZSA9IFtvcHRpb25zLnN0YXJ0LCBvcHRpb25zLnN0YXJ0XVxuXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcblxuICAgIGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gICAgYWR2YW5jZUNsb2NrKDUwMCkgdW5sZXNzIG9wdGlvbnMubm9FdmVudFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmRlbGF5QmVmb3JlU2NhbicsIDBcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmlnbm9yZWRCdWZmZXJOYW1lcycsIFtdXG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5maWxldHlwZXNGb3JDb2xvcldvcmRzJywgWycqJ11cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgW1xuICAgICAgJyouc3R5bCdcbiAgICAgICcqLmxlc3MnXG4gICAgXVxuXG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5pZ25vcmVkTmFtZXMnLCBbJ3Byb2plY3QvdmVuZG9yLyoqJ11cblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignZm91ci12YXJpYWJsZXMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3BpZ21lbnRzJykudGhlbiAocGtnKSAtPlxuICAgICAgICBwaWdtZW50cyA9IHBrZy5tYWluTW9kdWxlXG4gICAgICAgIHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcbiAgICAgIC5jYXRjaCAoZXJyKSAtPiBjb25zb2xlLmVycm9yIGVyclxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIGNvbG9yQnVmZmVyPy5kZXN0cm95KClcblxuICBpdCAnY3JlYXRlcyBhIGNvbG9yIGJ1ZmZlciBmb3IgZWFjaCBlZGl0b3IgaW4gdGhlIHdvcmtzcGFjZScsIC0+XG4gICAgZXhwZWN0KHByb2plY3QuY29sb3JCdWZmZXJzQnlFZGl0b3JJZFtlZGl0b3IuaWRdKS50b0JlRGVmaW5lZCgpXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIGZpbGUgcGF0aCBtYXRjaGVzIGFuIGVudHJ5IGluIGlnbm9yZWRCdWZmZXJOYW1lcycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuaGFzQ29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKSkudG9CZVRydXRoeSgpXG5cbiAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlZEJ1ZmZlck5hbWVzJywgWycqKi8qLnN0eWwnXVxuXG4gICAgaXQgJ2Rlc3Ryb3lzIHRoZSBjb2xvciBidWZmZXIgZm9yIHRoaXMgZmlsZScsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5oYXNDb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlRmFsc3koKVxuXG4gICAgaXQgJ3JlY3JlYXRlcyB0aGUgY29sb3IgYnVmZmVyIHdoZW4gdGhlIHNldHRpbmdzIG5vIGxvbmdlciBpZ25vcmUgdGhlIGZpbGUnLCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuaGFzQ29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKSkudG9CZUZhbHN5KClcblxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5pZ25vcmVkQnVmZmVyTmFtZXMnLCBbXVxuXG4gICAgICBleHBlY3QocHJvamVjdC5oYXNDb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlVHJ1dGh5KClcblxuICAgIGl0ICdwcmV2ZW50cyB0aGUgY3JlYXRpb24gb2YgYSBuZXcgY29sb3IgYnVmZmVyJywgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCd2YXJpYWJsZXMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5oYXNDb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlRmFsc3koKVxuXG4gIGRlc2NyaWJlICd3aGVuIGFuIGVkaXRvciB3aXRoIGEgcGF0aCBpcyBub3QgaW4gdGhlIHByb2plY3QgcGF0aHMgaXMgb3BlbmVkJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LmdldFBhdGhzKCk/XG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZmlsZSBpcyBhbHJlYWR5IHNhdmVkIG9uIGRpc2snLCAtPlxuICAgICAgcGF0aFRvT3BlbiA9IG51bGxcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwYXRoVG9PcGVuID0gcHJvamVjdC5wYXRocy5zaGlmdCgpXG5cbiAgICAgIGl0ICdhZGRzIHRoZSBwYXRoIHRvIHRoZSBwcm9qZWN0IGltbWVkaWF0ZWx5JywgLT5cbiAgICAgICAgc3B5T24ocHJvamVjdCwgJ2FwcGVuZFBhdGgnKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aFRvT3BlbikudGhlbiAobykgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IG9cbiAgICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmFwcGVuZFBhdGgpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHBhdGhUb09wZW4pXG5cblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBmaWxlIGlzIG5vdCB5ZXQgc2F2ZWQgb24gZGlzaycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2Zvby1kZS1mYWZhLnN0eWwnKS50aGVuIChvKSAtPlxuICAgICAgICAgICAgZWRpdG9yID0gb1xuICAgICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ2RvZXMgbm90IGZhaWxzIHdoZW4gdXBkYXRpbmcgdGhlIGNvbG9yQnVmZmVyJywgLT5cbiAgICAgICAgZXhwZWN0KC0+IGNvbG9yQnVmZmVyLnVwZGF0ZSgpKS5ub3QudG9UaHJvdygpXG5cbiAgICAgIGl0ICdhZGRzIHRoZSBwYXRoIHRvIHRoZSBwcm9qZWN0IHBhdGhzIG9uIHNhdmUnLCAtPlxuICAgICAgICBzcHlPbihjb2xvckJ1ZmZlciwgJ3VwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocHJvamVjdCwgJ2FwcGVuZFBhdGgnKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuZW1pdHRlci5lbWl0ICdkaWQtc2F2ZScsIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgICB3YWl0c0ZvciAtPiBjb2xvckJ1ZmZlci51cGRhdGUuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5hcHBlbmRQYXRoKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChlZGl0b3IuZ2V0UGF0aCgpKVxuXG4gIGRlc2NyaWJlICd3aGVuIGFuIGVkaXRvciB3aXRob3V0IHBhdGggaXMgb3BlbmVkJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKG8pIC0+XG4gICAgICAgICAgZWRpdG9yID0gb1xuICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgaXQgJ2RvZXMgbm90IGZhaWxzIHdoZW4gdXBkYXRpbmcgdGhlIGNvbG9yQnVmZmVyJywgLT5cbiAgICAgIGV4cGVjdCgtPiBjb2xvckJ1ZmZlci51cGRhdGUoKSkubm90LnRvVGhyb3coKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIGZpbGUgaXMgc2F2ZWQgYW5kIGFxdWlyZXMgYSBwYXRoJywgLT5cbiAgICAgIGRlc2NyaWJlICd0aGF0IGlzIGxlZ2libGUnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICd1cGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0UGF0aCcpLmFuZFJldHVybignbmV3LXBhdGguc3R5bCcpXG4gICAgICAgICAgZWRpdG9yLmVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS1wYXRoJywgZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JCdWZmZXIudXBkYXRlLmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnYWRkcyB0aGUgcGF0aCB0byB0aGUgcHJvamVjdCBwYXRocycsIC0+XG4gICAgICAgICAgZXhwZWN0KCduZXctcGF0aC5zdHlsJyBpbiBwcm9qZWN0LmdldFBhdGhzKCkpLnRvQmVUcnV0aHkoKVxuXG4gICAgICBkZXNjcmliZSAndGhhdCBpcyBub3QgbGVnaWJsZScsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzcHlPbihjb2xvckJ1ZmZlciwgJ3VwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRQYXRoJykuYW5kUmV0dXJuKCduZXctcGF0aC5zYXNzJylcbiAgICAgICAgICBlZGl0b3IuZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXBhdGgnLCBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBjb2xvckJ1ZmZlci51cGRhdGUuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdkb2VzIG5vdCBhZGQgdGhlIHBhdGggdG8gdGhlIHByb2plY3QgcGF0aHMnLCAtPlxuICAgICAgICAgIGV4cGVjdCgnbmV3LXBhdGguc3R5bCcgaW4gcHJvamVjdC5nZXRQYXRocygpKS50b0JlRmFsc3koKVxuXG4gICAgICBkZXNjcmliZSAndGhhdCBpcyBpZ25vcmVkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNweU9uKGNvbG9yQnVmZmVyLCAndXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgIHNweU9uKGVkaXRvciwgJ2dldFBhdGgnKS5hbmRSZXR1cm4oJ3Byb2plY3QvdmVuZG9yL25ldy1wYXRoLnN0eWwnKVxuICAgICAgICAgIGVkaXRvci5lbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtcGF0aCcsIGVkaXRvci5nZXRQYXRoKClcblxuICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yQnVmZmVyLnVwZGF0ZS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ2RvZXMgbm90IGFkZCB0aGUgcGF0aCB0byB0aGUgcHJvamVjdCBwYXRocycsIC0+XG4gICAgICAgICAgZXhwZWN0KCduZXctcGF0aC5zdHlsJyBpbiBwcm9qZWN0LmdldFBhdGhzKCkpLnRvQmVGYWxzeSgpXG5cbiAgIyBGSVhNRSBVc2luZyBhIDFzIHNsZWVwIHNlZW1zIHRvIGRvIG5vdGhpbmcgb24gVHJhdmlzLCBpdCdsbCBuZWVkXG4gICMgYSBiZXR0ZXIgc29sdXRpb24uXG4gIGRlc2NyaWJlICd3aXRoIHJhcGlkIGNoYW5nZXMgdGhhdCB0cmlnZ2VycyBhIHJlc2NhbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGNvbG9yQnVmZmVyLmluaXRpYWxpemVkIGFuZCBjb2xvckJ1ZmZlci52YXJpYWJsZUluaXRpYWxpemVkXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICd0ZXJtaW5hdGVSdW5uaW5nVGFzaycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICd1cGRhdGVDb2xvck1hcmtlcnMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIHNweU9uKGNvbG9yQnVmZmVyLCAnc2NhbkJ1ZmZlckZvclZhcmlhYmxlcycpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnI2ZmZlxcbicpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5lbWl0dGVyLmVtaXQoJ2RpZC1zdG9wLWNoYW5naW5nJylcblxuICAgICAgd2FpdHNGb3IgLT4gY29sb3JCdWZmZXIuc2NhbkJ1ZmZlckZvclZhcmlhYmxlcy5jYWxsQ291bnQgPiAwXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuXG4gICAgaXQgJ3Rlcm1pbmF0ZXMgdGhlIGN1cnJlbnRseSBydW5uaW5nIHRhc2snLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLnRlcm1pbmF0ZVJ1bm5pbmdUYXNrKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSAnd2hlbiBjcmVhdGVkIHdpdGhvdXQgYSBwcmV2aW91cyBzdGF0ZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcblxuICAgIGl0ICdzY2FucyB0aGUgYnVmZmVyIGZvciBjb2xvcnMgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgcHJvamVjdCB2YXJpYWJsZXMnLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDMpXG5cbiAgICBpdCAnY3JlYXRlcyB0aGUgY29ycmVzcG9uZGluZyBtYXJrZXJzIGluIHRoZSB0ZXh0IGVkaXRvcicsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0TWFya2VyTGF5ZXIoKS5maW5kTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgaXQgJ2tub3dzIHRoYXQgaXQgaXMgbGVnaWJsZSBhcyBhIHZhcmlhYmxlcyBzb3VyY2UgZmlsZScsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuaXNWYXJpYWJsZXNTb3VyY2UoKSkudG9CZVRydXRoeSgpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZWRpdG9yIGlzIGRlc3Ryb3llZCcsIC0+XG4gICAgICBpdCAnZGVzdHJveXMgdGhlIGNvbG9yIGJ1ZmZlciBhdCB0aGUgc2FtZSB0aW1lJywgLT5cbiAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmNvbG9yQnVmZmVyc0J5RWRpdG9ySWRbZWRpdG9yLmlkXSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBkZXNjcmliZSAnOjpnZXRDb2xvck1hcmtlckF0QnVmZmVyUG9zaXRpb24nLCAtPlxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGJ1ZmZlciBwb3NpdGlvbiBpcyBjb250YWluZWQgaW4gYSBtYXJrZXIgcmFuZ2UnLCAtPlxuICAgICAgICBpdCAncmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBjb2xvciBtYXJrZXInLCAtPlxuICAgICAgICAgIGNvbG9yTWFya2VyID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uKFsyLCAxNV0pXG4gICAgICAgICAgZXhwZWN0KGNvbG9yTWFya2VyKS50b0VxdWFsKGNvbG9yQnVmZmVyLmNvbG9yTWFya2Vyc1sxXSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGJ1ZmZlciBwb3NpdGlvbiBpcyBub3QgY29udGFpbmVkIGluIGEgbWFya2VyIHJhbmdlJywgLT5cbiAgICAgICAgaXQgJ3JldHVybnMgdW5kZWZpbmVkJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJBdEJ1ZmZlclBvc2l0aW9uKFsxLCAxNV0pKS50b0JlVW5kZWZpbmVkKClcblxuICAgICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgICAjIyAgICAjIyAgICAgIyMgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjI1xuICAgICMjICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMgICAgICMjICMjXG4gICAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAgICMjICAgICAjIyAgICMjICAjIyMjIyMjIyMgIyMgICAjIyAgICAgICAgICMjXG4gICAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgICAjIyAgICAgICAjIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgcHJvamVjdCB2YXJpYWJsZXMgYmVjb21lcyBhdmFpbGFibGUnLCAtPlxuICAgICAgW3VwZGF0ZVNweV0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB1cGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcbiAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ3JlcGxhY2VzIHRoZSBpbnZhbGlkIG1hcmtlcnMgdGhhdCBhcmUgbm93IHZhbGlkJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIGV4cGVjdCh1cGRhdGVTcHkuYXJnc0ZvckNhbGxbMF1bMF0uY3JlYXRlZC5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgICAgZXhwZWN0KHVwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgdmFyaWFibGUgaXMgZWRpdGVkJywgLT5cbiAgICAgICAgW2NvbG9yc1VwZGF0ZVNweV0gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMoY29sb3JzVXBkYXRlU3B5KVxuICAgICAgICAgIGVkaXRCdWZmZXIgJyMzMzY2OTknLCBzdGFydDogWzAsMTNdLCBlbmQ6IFswLDE3XVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIHRoZSBtb2RpZmllZCBjb2xvcnMnLCAtPlxuICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbG9yc1VwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgbmV3IHZhcmlhYmxlIGlzIGFkZGVkJywgLT5cbiAgICAgICAgW2NvbG9yc1VwZGF0ZVNweV0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHVwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0QnVmZmVyICdcXG5mb28gPSBiYXNlLWNvbG9yJ1xuICAgICAgICAgICAgd2FpdHNGb3IgLT4gdXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnZGlzcGF0Y2hlcyB0aGUgbmV3IG1hcmtlciBpbiBhIGRpZC11cGRhdGUtY29sb3ItbWFya2VycyBldmVudCcsIC0+XG4gICAgICAgICAgZXhwZWN0KHVwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDApXG4gICAgICAgICAgZXhwZWN0KHVwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5jcmVhdGVkLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIHZhcmlhYmxlIGlzIHJlbW92ZWQnLCAtPlxuICAgICAgICBbY29sb3JzVXBkYXRlU3B5XSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBjb2xvcnNVcGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcbiAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgICAgZWRpdEJ1ZmZlciAnJywgc3RhcnQ6IFswLDBdLCBlbmQ6IFswLDE3XVxuICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ2ludmFsaWRhdGVzIGNvbG9ycyB0aGF0IHdlcmUgcmVseWluZyBvbiB0aGUgZGVsZXRlZCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMylcbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0VmFsaWRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgZGVzY3JpYmUgJzo6c2VyaWFsaXplJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgIGl0ICdyZXR1cm5zIHRoZSB3aG9sZSBidWZmZXIgZGF0YScsIC0+XG4gICAgICAgICAgZXhwZWN0ZWQgPSBqc29uRml4dHVyZSBcImZvdXItdmFyaWFibGVzLWJ1ZmZlci5qc29uXCIsIHtcbiAgICAgICAgICAgIGlkOiBlZGl0b3IuaWRcbiAgICAgICAgICAgIHJvb3Q6IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgICAgICBjb2xvck1hcmtlcnM6IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLm1hcCAobSkgLT4gbS5tYXJrZXIuaWRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuc2VyaWFsaXplKCkpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMgICMjIyMjIyMjICAgIyMjIyMjXG4gICAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyNcbiAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjI1xuICAgICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMgICAgICAgICAjI1xuICAgICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAgIyMgICMjIyMjI1xuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgd2l0aCBvbmx5IGNvbG9ycycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2J1dHRvbnMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgaXQgJ2NyZWF0ZXMgdGhlIGNvbG9yIG1hcmtlcnMgZm9yIHRoZSB2YXJpYWJsZXMgdXNlZCBpbiB0aGUgYnVmZmVyJywgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG4gICAgICAgIHJ1bnMgLT4gZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIGNvbG9yIG1hcmtlciBpcyBlZGl0ZWQnLCAtPlxuICAgICAgICBbY29sb3JzVXBkYXRlU3B5XSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgICAgICBlZGl0QnVmZmVyICcjMzM2Njk5Jywgc3RhcnQ6IFsxLDEzXSwgZW5kOiBbMSwyM11cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIG1vZGlmaWVkIGNvbG9yIG1hcmtlcicsIC0+XG4gICAgICAgICAgbWFya2VycyA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpXG4gICAgICAgICAgbWFya2VyID0gbWFya2Vyc1ttYXJrZXJzLmxlbmd0aC0xXVxuICAgICAgICAgIGV4cGVjdChtYXJrZXIuY29sb3IpLnRvQmVDb2xvcignIzMzNjY5OScpXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgb25seSB0aGUgYWZmZWN0ZWQgbWFya2VyJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmRlc3Ryb3llZC5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIG5ldyBsaW5lcyBjaGFuZ2VzIHRoZSBtYXJrZXJzIHJhbmdlJywgLT5cbiAgICAgICAgW2NvbG9yc1VwZGF0ZVNweV0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGNvbG9yc1VwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMoY29sb3JzVXBkYXRlU3B5KVxuICAgICAgICAgICAgZWRpdEJ1ZmZlciAnI2ZmZlxcblxcbicsIHN0YXJ0OiBbMCwwXSwgZW5kOiBbMCwwXVxuICAgICAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JzVXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnZG9lcyBub3QgZGVzdHJveXMgdGhlIHByZXZpb3VzIG1hcmtlcnMnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xvcnNVcGRhdGVTcHkuYXJnc0ZvckNhbGxbMF1bMF0uZGVzdHJveWVkLmxlbmd0aCkudG9FcXVhbCgwKVxuICAgICAgICAgIGV4cGVjdChjb2xvcnNVcGRhdGVTcHkuYXJnc0ZvckNhbGxbMF1bMF0uY3JlYXRlZC5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gYSBuZXcgY29sb3IgaXMgYWRkZWQnLCAtPlxuICAgICAgICBbY29sb3JzVXBkYXRlU3B5XSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRCdWZmZXIgJ1xcbiMzMzY2OTknXG4gICAgICAgICAgICB3YWl0c0ZvciAtPiBjb2xvcnNVcGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdhZGRzIGEgbWFya2VyIGZvciB0aGUgbmV3IGNvbG9yJywgLT5cbiAgICAgICAgICBtYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKClcbiAgICAgICAgICBtYXJrZXIgPSBtYXJrZXJzW21hcmtlcnMubGVuZ3RoLTFdXG4gICAgICAgICAgZXhwZWN0KG1hcmtlcnMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgICAgZXhwZWN0KG1hcmtlci5jb2xvcikudG9CZUNvbG9yKCcjMzM2Njk5JylcbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0TWFya2VyTGF5ZXIoKS5maW5kTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgIGl0ICdkaXNwYXRjaGVzIHRoZSBuZXcgbWFya2VyIGluIGEgZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzIGV2ZW50JywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmRlc3Ryb3llZC5sZW5ndGgpLnRvRXF1YWwoMClcbiAgICAgICAgICBleHBlY3QoY29sb3JzVXBkYXRlU3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgY29sb3IgbWFya2VyIGlzIGVkaXRlZCcsIC0+XG4gICAgICAgIFtjb2xvcnNVcGRhdGVTcHldID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBjb2xvcnNVcGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyLm9uRGlkVXBkYXRlQ29sb3JNYXJrZXJzKGNvbG9yc1VwZGF0ZVNweSlcbiAgICAgICAgICAgIGVkaXRCdWZmZXIgJycsIHN0YXJ0OiBbMSwyXSwgZW5kOiBbMSwyM11cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yc1VwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIG1vZGlmaWVkIGNvbG9yIG1hcmtlcicsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIG9ubHkgdGhlIGFmZmVjdGVkIG1hcmtlcicsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yc1VwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KGNvbG9yc1VwZGF0ZVNweS5hcmdzRm9yQ2FsbFswXVswXS5jcmVhdGVkLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICAgIGl0ICdyZW1vdmVzIHRoZSBwcmV2aW91cyBlZGl0b3IgbWFya2VycycsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldE1hcmtlckxheWVyKCkuZmluZE1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgIGRlc2NyaWJlICd3aXRoIGEgYnVmZmVyIHdob3NlIHNjb3BlIGlzIG5vdCBvbmUgb2Ygc291cmNlIGZpbGVzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigncHJvamVjdC9saWIvbWFpbi5jb2ZmZWUnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgIGl0ICdkb2VzIG5vdCByZW5kZXJzIGNvbG9ycyBmcm9tIHZhcmlhYmxlcycsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgaW4gY3JsZiBtb2RlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignY3JsZi5zdHlsJykudGhlbiAobykgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IG9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgICAgaXQgJ2NyZWF0ZXMgYSBtYXJrZXIgZm9yIGVhY2ggY29sb3JzJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgIyMgICAgIyMjIyAgIyMjIyMjICAgIyMgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuICAjIyAgICAgIyMgICMjICAgICMjICAjIyMgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgICAgICAjIyMjICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgIyMjIyAjIyAjIyAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgICMjICAjIyAgIyMjIyAjIyAgICAgIyMgIyMgICAjIyAgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAgIyMgICMjICAgICMjICAjIyAgICMjIyAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyMjICAjIyMjIyMgICAjIyAgICAjIyAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgcGFydCBvZiB0aGUgZ2xvYmFsIGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHByb2plY3Quc2V0SWdub3JlZE5hbWVzKFtdKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkTmFtZXMnLCBbJ3Byb2plY3QvdmVuZG9yLyonXSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3Byb2plY3QvdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzcycpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBjb2xvckJ1ZmZlciA9IHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcblxuICAgIGl0ICdrbm93cyB0aGF0IGl0IGlzIHBhcnQgb2YgdGhlIGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmlzSWdub3JlZCgpKS50b0JlVHJ1dGh5KClcblxuICAgIGl0ICdrbm93cyB0aGF0IGl0IGlzIGEgdmFyaWFibGVzIHNvdXJjZSBmaWxlJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5pc1ZhcmlhYmxlc1NvdXJjZSgpKS50b0JlVHJ1dGh5KClcblxuICAgIGl0ICdzY2FucyB0aGUgYnVmZmVyIGZvciB2YXJpYWJsZXMgZm9yIGluLWJ1ZmZlciB1c2Ugb25seScsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDIwKVxuICAgICAgdmFsaWRNYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkuZmlsdGVyIChtKSAtPlxuICAgICAgICBtLmNvbG9yLmlzVmFsaWQoKVxuXG4gICAgICBleHBlY3QodmFsaWRNYXJrZXJzLmxlbmd0aCkudG9FcXVhbCgyMClcblxuICBkZXNjcmliZSAnd2l0aCBhIGJ1ZmZlciBwYXJ0IG9mIHRoZSBwcm9qZWN0IGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdwcm9qZWN0L3ZlbmRvci9jc3MvdmFyaWFibGVzLmxlc3MnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICBpdCAna25vd3MgdGhhdCBpdCBpcyBwYXJ0IG9mIHRoZSBpZ25vcmVkIGZpbGVzJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5pc0lnbm9yZWQoKSkudG9CZVRydXRoeSgpXG5cbiAgICBpdCAna25vd3MgdGhhdCBpdCBpcyBhIHZhcmlhYmxlcyBzb3VyY2UgZmlsZScsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXIuaXNWYXJpYWJsZXNTb3VyY2UoKSkudG9CZVRydXRoeSgpXG5cbiAgICBpdCAnc2NhbnMgdGhlIGJ1ZmZlciBmb3IgdmFyaWFibGVzIGZvciBpbi1idWZmZXIgdXNlIG9ubHknLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgyMClcbiAgICAgIHZhbGlkTWFya2VycyA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmZpbHRlciAobSkgLT5cbiAgICAgICAgbS5jb2xvci5pc1ZhbGlkKClcblxuICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoMjApXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgYnVmZmVyIGlzIGVkaXRlZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbG9yc1VwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0QnVmZmVyICdcXG5cXG5AbmV3LWNvbG9yOiBAYmFzZTA7XFxuJ1xuICAgICAgICB3YWl0c0ZvciAtPiBjb2xvcnNVcGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICBpdCAnZmluZHMgdGhlIG5ld2x5IGFkZGVkIGNvbG9yJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgyMSlcbiAgICAgICAgdmFsaWRNYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkuZmlsdGVyIChtKSAtPlxuICAgICAgICAgIG0uY29sb3IuaXNWYWxpZCgpXG5cbiAgICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoMjEpXG5cbiAgIyMgICAgIyMgICAgIyMgICMjIyMjIyMgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMjICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjIyMgICMjICMjICAgICAjIyAjIyAgICAgIyMgICMjICAgIyMgICMjICAgICAjIyAjI1xuICAjIyAgICAjIyAjIyAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyAgIyMjIyAjIyAgICAgIyMgICMjICAgIyMgICMjIyMjIyMjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAjIyMgIyMgICAgICMjICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICMjICAgICMjICAjIyMjIyMjICAgICAjIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3dpdGggYSBidWZmZXIgbm90IGJlaW5nIGEgdmFyaWFibGUgc291cmNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigncHJvamVjdC9saWIvbWFpbi5jb2ZmZWUnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgIHJ1bnMgLT4gY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICBpdCAna25vd3MgdGhhdCBpdCBpcyBub3QgcGFydCBvZiB0aGUgc291cmNlIGZpbGVzJywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5pc1ZhcmlhYmxlc1NvdXJjZSgpKS50b0JlRmFsc3koKVxuXG4gICAgaXQgJ2tub3dzIHRoYXQgaXQgaXMgbm90IHBhcnQgb2YgdGhlIGlnbm9yZWQgZmlsZXMnLCAtPlxuICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmlzSWdub3JlZCgpKS50b0JlRmFsc3koKVxuXG4gICAgaXQgJ3NjYW5zIHRoZSBidWZmZXIgZm9yIHZhcmlhYmxlcyBmb3IgaW4tYnVmZmVyIHVzZSBvbmx5JywgLT5cbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgIHZhbGlkTWFya2VycyA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmZpbHRlciAobSkgLT5cbiAgICAgICAgbS5jb2xvci5pc1ZhbGlkKClcblxuICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBidWZmZXIgaXMgZWRpdGVkJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgY29sb3JzVXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG4gICAgICAgIHNweU9uKHByb2plY3QsICdyZWxvYWRWYXJpYWJsZXNGb3JQYXRoJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2Vycyhjb2xvcnNVcGRhdGVTcHkpXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0QnVmZmVyICdcXG5cXG5AbmV3LWNvbG9yID0gcmVkO1xcbidcbiAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JzVXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgaXQgJ2ZpbmRzIHRoZSBuZXdseSBhZGRlZCBjb2xvcicsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNSlcbiAgICAgICAgdmFsaWRNYXJrZXJzID0gY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkuZmlsdGVyIChtKSAtPlxuICAgICAgICAgIG0uY29sb3IuaXNWYWxpZCgpXG5cbiAgICAgICAgZXhwZWN0KHZhbGlkTWFya2Vycy5sZW5ndGgpLnRvRXF1YWwoNSlcblxuICAgICAgaXQgJ2RvZXMgbm90IGFzayB0aGUgcHJvamVjdCB0byByZWxvYWQgdGhlIHZhcmlhYmxlcycsIC0+XG4gICAgICAgIGlmIHBhcnNlRmxvYXQoYXRvbS5nZXRWZXJzaW9uKCkpID49IDEuMTlcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRoKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRoLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF0pLm5vdC50b0VxdWFsKGNvbG9yQnVmZmVyLmVkaXRvci5nZXRQYXRoKCkpXG5cbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjXG4gICMjICAgICMjICAgIyMgICAjIyAgICAgICAgICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjICAgICAjIyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3doZW4gY3JlYXRlZCB3aXRoIGEgcHJldmlvdXMgc3RhdGUnLCAtPlxuICAgIGRlc2NyaWJlICd3aXRoIHZhcmlhYmxlcyBhbmQgY29sb3JzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcikuZGVzdHJveSgpXG5cbiAgICAgICAgICBzdGF0ZSA9IGpzb25GaXh0dXJlKCdmb3VyLXZhcmlhYmxlcy1idWZmZXIuanNvbicsIHtcbiAgICAgICAgICAgIGlkOiBlZGl0b3IuaWRcbiAgICAgICAgICAgIHJvb3Q6IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgICAgICBjb2xvck1hcmtlcnM6IFstMS4uLTRdXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzdGF0ZS5lZGl0b3IgPSBlZGl0b3JcbiAgICAgICAgICBzdGF0ZS5wcm9qZWN0ID0gcHJvamVjdFxuICAgICAgICAgIGNvbG9yQnVmZmVyID0gbmV3IENvbG9yQnVmZmVyKHN0YXRlKVxuXG4gICAgICBpdCAnY3JlYXRlcyBtYXJrZXJzIGZyb20gdGhlIHN0YXRlIG9iamVjdCcsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgaXQgJ3Jlc3RvcmVzIHRoZSBtYXJrZXJzIHByb3BlcnRpZXMnLCAtPlxuICAgICAgICBjb2xvck1hcmtlciA9IGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpWzNdXG4gICAgICAgIGV4cGVjdChjb2xvck1hcmtlci5jb2xvcikudG9CZUNvbG9yKDI1NSwyNTUsMjU1LDAuNSlcbiAgICAgICAgZXhwZWN0KGNvbG9yTWFya2VyLmNvbG9yLnZhcmlhYmxlcykudG9FcXVhbChbJ2Jhc2UtY29sb3InXSlcblxuICAgICAgaXQgJ3Jlc3RvcmVzIHRoZSBlZGl0b3IgbWFya2VycycsIC0+XG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRNYXJrZXJMYXllcigpLmZpbmRNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgIGl0ICdyZXN0b3JlcyB0aGUgYWJpbGl0eSB0byBmZXRjaCBtYXJrZXJzJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmZpbmRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICBmb3IgbWFya2VyIGluIGNvbG9yQnVmZmVyLmZpbmRDb2xvck1hcmtlcnMoKVxuICAgICAgICAgIGV4cGVjdChtYXJrZXIpLnRvQmVEZWZpbmVkKClcblxuICAgIGRlc2NyaWJlICd3aXRoIGFuIGludmFsaWQgY29sb3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdpbnZhbGlkLWNvbG9yLnN0eWwnKS50aGVuIChvKSAtPlxuICAgICAgICAgICAgZWRpdG9yID0gb1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBzdGF0ZSA9IGpzb25GaXh0dXJlKCdpbnZhbGlkLWNvbG9yLWJ1ZmZlci5qc29uJywge1xuICAgICAgICAgICAgaWQ6IGVkaXRvci5pZFxuICAgICAgICAgICAgcm9vdDogYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgICAgIGNvbG9yTWFya2VyczogWy0xXVxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3RhdGUuZWRpdG9yID0gZWRpdG9yXG4gICAgICAgICAgc3RhdGUucHJvamVjdCA9IHByb2plY3RcbiAgICAgICAgICBjb2xvckJ1ZmZlciA9IG5ldyBDb2xvckJ1ZmZlcihzdGF0ZSlcblxuICAgICAgaXQgJ2NyZWF0ZXMgbWFya2VycyBmcm9tIHRoZSBzdGF0ZSBvYmplY3QnLCAtPlxuICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5nZXRWYWxpZENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgwKVxuIl19

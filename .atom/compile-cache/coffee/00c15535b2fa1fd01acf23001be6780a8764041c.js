(function() {
  var ColorBuffer, ColorProject, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, TOTAL_COLORS_VARIABLES_IN_PROJECT, TOTAL_VARIABLES_IN_PROJECT, click, fs, jsonFixture, os, path, ref, temp;

  os = require('os');

  fs = require('fs-plus');

  path = require('path');

  temp = require('temp');

  ref = require('../lib/versions'), SERIALIZE_VERSION = ref.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref.SERIALIZE_MARKERS_VERSION;

  ColorProject = require('../lib/color-project');

  ColorBuffer = require('../lib/color-buffer');

  jsonFixture = require('./helpers/fixtures').jsonFixture(__dirname, 'fixtures');

  click = require('./helpers/events').click;

  TOTAL_VARIABLES_IN_PROJECT = 12;

  TOTAL_COLORS_VARIABLES_IN_PROJECT = 10;

  describe('ColorProject', function() {
    var eventSpy, paths, project, promise, ref1, rootPath;
    ref1 = [], project = ref1[0], promise = ref1[1], rootPath = ref1[2], paths = ref1[3], eventSpy = ref1[4];
    beforeEach(function() {
      var fixturesPath;
      atom.config.set('pigments.sourceNames', ['*.styl']);
      atom.config.set('pigments.ignoredNames', []);
      atom.config.set('pigments.filetypesForColorWords', ['*']);
      fixturesPath = atom.project.getPaths()[0];
      rootPath = fixturesPath + "/project";
      atom.project.setPaths([rootPath]);
      return project = new ColorProject({
        ignoredNames: ['vendor/*'],
        sourceNames: ['*.less'],
        ignoredScopes: ['\\.comment']
      });
    });
    afterEach(function() {
      return project.destroy();
    });
    describe('.deserialize', function() {
      return it('restores the project in its previous state', function() {
        var data, json;
        data = {
          root: rootPath,
          timestamp: new Date().toJSON(),
          version: SERIALIZE_VERSION,
          markersVersion: SERIALIZE_MARKERS_VERSION
        };
        json = jsonFixture('base-project.json', data);
        project = ColorProject.deserialize(json);
        expect(project).toBeDefined();
        expect(project.getPaths()).toEqual([rootPath + "/styles/buttons.styl", rootPath + "/styles/variables.styl"]);
        expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        return expect(project.getColorVariables().length).toEqual(TOTAL_COLORS_VARIABLES_IN_PROJECT);
      });
    });
    describe('::initialize', function() {
      beforeEach(function() {
        eventSpy = jasmine.createSpy('did-initialize');
        project.onDidInitialize(eventSpy);
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('loads the paths to scan in the project', function() {
        return expect(project.getPaths()).toEqual([rootPath + "/styles/buttons.styl", rootPath + "/styles/variables.styl"]);
      });
      it('scans the loaded paths to retrieve the variables', function() {
        expect(project.getVariables()).toBeDefined();
        return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
      });
      return it('dispatches a did-initialize event', function() {
        return expect(eventSpy).toHaveBeenCalled();
      });
    });
    describe('::findAllColors', function() {
      return it('returns all the colors in the legibles files of the project', function() {
        var search;
        search = project.findAllColors();
        return expect(search).toBeDefined();
      });
    });
    describe('when the variables have not been loaded yet', function() {
      describe('::serialize', function() {
        return it('returns an object without paths nor variables', function() {
          var date, expected;
          date = new Date;
          spyOn(project, 'getTimestamp').andCallFake(function() {
            return date;
          });
          expected = {
            deserializer: 'ColorProject',
            timestamp: date,
            version: SERIALIZE_VERSION,
            markersVersion: SERIALIZE_MARKERS_VERSION,
            globalSourceNames: ['*.styl'],
            globalIgnoredNames: [],
            ignoredNames: ['vendor/*'],
            sourceNames: ['*.less'],
            ignoredScopes: ['\\.comment'],
            buffers: {}
          };
          return expect(project.serialize()).toEqual(expected);
        });
      });
      describe('::getVariablesForPath', function() {
        return it('returns undefined', function() {
          return expect(project.getVariablesForPath(rootPath + "/styles/variables.styl")).toEqual([]);
        });
      });
      describe('::getVariableByName', function() {
        return it('returns undefined', function() {
          return expect(project.getVariableByName("foo")).toBeUndefined();
        });
      });
      describe('::getVariableById', function() {
        return it('returns undefined', function() {
          return expect(project.getVariableById(0)).toBeUndefined();
        });
      });
      describe('::getContext', function() {
        return it('returns an empty context', function() {
          expect(project.getContext()).toBeDefined();
          return expect(project.getContext().getVariablesCount()).toEqual(0);
        });
      });
      describe('::getPalette', function() {
        return it('returns an empty palette', function() {
          expect(project.getPalette()).toBeDefined();
          return expect(project.getPalette().getColorsCount()).toEqual(0);
        });
      });
      describe('::reloadVariablesForPath', function() {
        beforeEach(function() {
          spyOn(project, 'initialize').andCallThrough();
          return waitsForPromise(function() {
            return project.reloadVariablesForPath(rootPath + "/styles/variables.styl");
          });
        });
        return it('returns a promise hooked on the initialize promise', function() {
          return expect(project.initialize).toHaveBeenCalled();
        });
      });
      describe('::setIgnoredNames', function() {
        beforeEach(function() {
          project.setIgnoredNames([]);
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('initializes the project with the new paths', function() {
          return expect(project.getVariables().length).toEqual(32);
        });
      });
      return describe('::setSourceNames', function() {
        beforeEach(function() {
          project.setSourceNames([]);
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('initializes the project with the new paths', function() {
          return expect(project.getVariables().length).toEqual(12);
        });
      });
    });
    describe('when the project has no variables source files', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        rootPath = fixturesPath + "-no-sources";
        atom.project.setPaths([rootPath]);
        project = new ColorProject({});
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('initializes the paths with an empty array', function() {
        return expect(project.getPaths()).toEqual([]);
      });
      return it('initializes the variables with an empty array', function() {
        return expect(project.getVariables()).toEqual([]);
      });
    });
    describe('when the project has custom source names defined', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        project = new ColorProject({
          sourceNames: ['*.styl']
        });
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      it('initializes the paths with an empty array', function() {
        return expect(project.getPaths().length).toEqual(2);
      });
      return it('initializes the variables with an empty array', function() {
        expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        return expect(project.getColorVariables().length).toEqual(TOTAL_COLORS_VARIABLES_IN_PROJECT);
      });
    });
    describe('when the project has looping variable definition', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        rootPath = fixturesPath + "-with-recursion";
        atom.project.setPaths([rootPath]);
        project = new ColorProject({});
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      return it('ignores the looping definition', function() {
        expect(project.getVariables().length).toEqual(5);
        return expect(project.getColorVariables().length).toEqual(5);
      });
    });
    describe('when the variables have been loaded', function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      describe('::serialize', function() {
        return it('returns an object with project properties', function() {
          var date;
          date = new Date;
          spyOn(project, 'getTimestamp').andCallFake(function() {
            return date;
          });
          return expect(project.serialize()).toEqual({
            deserializer: 'ColorProject',
            ignoredNames: ['vendor/*'],
            sourceNames: ['*.less'],
            ignoredScopes: ['\\.comment'],
            timestamp: date,
            version: SERIALIZE_VERSION,
            markersVersion: SERIALIZE_MARKERS_VERSION,
            paths: [rootPath + "/styles/buttons.styl", rootPath + "/styles/variables.styl"],
            globalSourceNames: ['*.styl'],
            globalIgnoredNames: [],
            buffers: {},
            variables: project.variables.serialize()
          });
        });
      });
      describe('::getVariablesForPath', function() {
        it('returns the variables defined in the file', function() {
          return expect(project.getVariablesForPath(rootPath + "/styles/variables.styl").length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
        return describe('for a file that was ignored in the scanning process', function() {
          return it('returns undefined', function() {
            return expect(project.getVariablesForPath(rootPath + "/vendor/css/variables.less")).toEqual([]);
          });
        });
      });
      describe('::deleteVariablesForPath', function() {
        return it('removes all the variables coming from the specified file', function() {
          project.deleteVariablesForPath(rootPath + "/styles/variables.styl");
          return expect(project.getVariablesForPath(rootPath + "/styles/variables.styl")).toEqual([]);
        });
      });
      describe('::getContext', function() {
        return it('returns a context with the project variables', function() {
          expect(project.getContext()).toBeDefined();
          return expect(project.getContext().getVariablesCount()).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
      });
      describe('::getPalette', function() {
        return it('returns a palette with the colors from the project', function() {
          expect(project.getPalette()).toBeDefined();
          return expect(project.getPalette().getColorsCount()).toEqual(10);
        });
      });
      describe('::showVariableInFile', function() {
        return it('opens the file where is located the variable', function() {
          var spy;
          spy = jasmine.createSpy('did-add-text-editor');
          atom.workspace.onDidAddTextEditor(spy);
          project.showVariableInFile(project.getVariables()[0]);
          waitsFor(function() {
            return spy.callCount > 0;
          });
          return runs(function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return expect(editor.getSelectedBufferRange()).toEqual([[1, 2], [1, 14]]);
          });
        });
      });
      describe('::reloadVariablesForPath', function() {
        return describe('for a file that is part of the loaded paths', function() {
          describe('where the reload finds new variables', function() {
            beforeEach(function() {
              project.deleteVariablesForPath(rootPath + "/styles/variables.styl");
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPath(rootPath + "/styles/variables.styl");
              });
            });
            it('scans again the file to find variables', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('dispatches a did-update-variables event', function() {
              return expect(eventSpy).toHaveBeenCalled();
            });
          });
          return describe('where the reload finds nothing new', function() {
            beforeEach(function() {
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPath(rootPath + "/styles/variables.styl");
              });
            });
            it('leaves the file variables intact', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('does not dispatch a did-update-variables event', function() {
              return expect(eventSpy).not.toHaveBeenCalled();
            });
          });
        });
      });
      describe('::reloadVariablesForPaths', function() {
        describe('for a file that is part of the loaded paths', function() {
          describe('where the reload finds new variables', function() {
            beforeEach(function() {
              project.deleteVariablesForPaths([rootPath + "/styles/variables.styl", rootPath + "/styles/buttons.styl"]);
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPaths([rootPath + "/styles/variables.styl", rootPath + "/styles/buttons.styl"]);
              });
            });
            it('scans again the file to find variables', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('dispatches a did-update-variables event', function() {
              return expect(eventSpy).toHaveBeenCalled();
            });
          });
          return describe('where the reload finds nothing new', function() {
            beforeEach(function() {
              eventSpy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(eventSpy);
              return waitsForPromise(function() {
                return project.reloadVariablesForPaths([rootPath + "/styles/variables.styl", rootPath + "/styles/buttons.styl"]);
              });
            });
            it('leaves the file variables intact', function() {
              return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            });
            return it('does not dispatch a did-update-variables event', function() {
              return expect(eventSpy).not.toHaveBeenCalled();
            });
          });
        });
        return describe('for a file that is not part of the loaded paths', function() {
          beforeEach(function() {
            spyOn(project, 'loadVariablesForPath').andCallThrough();
            return waitsForPromise(function() {
              return project.reloadVariablesForPath(rootPath + "/vendor/css/variables.less");
            });
          });
          return it('does nothing', function() {
            return expect(project.loadVariablesForPath).not.toHaveBeenCalled();
          });
        });
      });
      describe('when a buffer with variables is open', function() {
        var colorBuffer, editor, ref2;
        ref2 = [], editor = ref2[0], colorBuffer = ref2[1];
        beforeEach(function() {
          eventSpy = jasmine.createSpy('did-update-variables');
          project.onDidUpdateVariables(eventSpy);
          waitsForPromise(function() {
            return atom.workspace.open('styles/variables.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            colorBuffer = project.colorBufferForEditor(editor);
            return spyOn(colorBuffer, 'scanBufferForVariables').andCallThrough();
          });
          waitsForPromise(function() {
            return project.initialize();
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('updates the project variable with the buffer ranges', function() {
          var i, len, ref3, results, variable;
          ref3 = project.getVariables();
          results = [];
          for (i = 0, len = ref3.length; i < len; i++) {
            variable = ref3[i];
            results.push(expect(variable.bufferRange).toBeDefined());
          }
          return results;
        });
        describe('when a color is modified that does not affect other variables ranges', function() {
          var variablesTextRanges;
          variablesTextRanges = [][0];
          beforeEach(function() {
            variablesTextRanges = {};
            project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
              return variablesTextRanges[variable.name] = variable.range;
            });
            editor.setSelectedBufferRange([[1, 7], [1, 14]]);
            editor.insertText('#336');
            editor.getBuffer().emitter.emit('did-stop-changing');
            return waitsFor(function() {
              return eventSpy.callCount > 0;
            });
          });
          it('reloads the variables with the buffer instead of the file', function() {
            expect(colorBuffer.scanBufferForVariables).toHaveBeenCalled();
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
          });
          it('uses the buffer ranges to detect which variables were really changed', function() {
            expect(eventSpy.argsForCall[0][0].destroyed).toBeUndefined();
            expect(eventSpy.argsForCall[0][0].created).toBeUndefined();
            return expect(eventSpy.argsForCall[0][0].updated.length).toEqual(1);
          });
          it('updates the text range of the other variables', function() {
            return project.getVariablesForPath(rootPath + "/styles/variables.styl").forEach(function(variable) {
              if (variable.name !== 'colors.red') {
                expect(variable.range[0]).toEqual(variablesTextRanges[variable.name][0] - 3);
                return expect(variable.range[1]).toEqual(variablesTextRanges[variable.name][1] - 3);
              }
            });
          });
          return it('dispatches a did-update-variables event', function() {
            return expect(eventSpy).toHaveBeenCalled();
          });
        });
        describe('when a text is inserted that affects other variables ranges', function() {
          var ref3, variablesBufferRanges, variablesTextRanges;
          ref3 = [], variablesTextRanges = ref3[0], variablesBufferRanges = ref3[1];
          beforeEach(function() {
            runs(function() {
              variablesTextRanges = {};
              variablesBufferRanges = {};
              project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
                variablesTextRanges[variable.name] = variable.range;
                return variablesBufferRanges[variable.name] = variable.bufferRange;
              });
              spyOn(project.variables, 'addMany').andCallThrough();
              editor.setSelectedBufferRange([[0, 0], [0, 0]]);
              editor.insertText('\n\n');
              return editor.getBuffer().emitter.emit('did-stop-changing');
            });
            return waitsFor(function() {
              return project.variables.addMany.callCount > 0;
            });
          });
          it('does not trigger a change event', function() {
            return expect(eventSpy.callCount).toEqual(0);
          });
          return it('updates the range of the updated variables', function() {
            return project.getVariablesForPath(rootPath + "/styles/variables.styl").forEach(function(variable) {
              if (variable.name !== 'colors.red') {
                expect(variable.range[0]).toEqual(variablesTextRanges[variable.name][0] + 2);
                expect(variable.range[1]).toEqual(variablesTextRanges[variable.name][1] + 2);
                return expect(variable.bufferRange.isEqual(variablesBufferRanges[variable.name])).toBeFalsy();
              }
            });
          });
        });
        describe('when a color is removed', function() {
          var variablesTextRanges;
          variablesTextRanges = [][0];
          beforeEach(function() {
            runs(function() {
              variablesTextRanges = {};
              project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
                return variablesTextRanges[variable.name] = variable.range;
              });
              editor.setSelectedBufferRange([[1, 0], [2, 0]]);
              editor.insertText('');
              return editor.getBuffer().emitter.emit('did-stop-changing');
            });
            return waitsFor(function() {
              return eventSpy.callCount > 0;
            });
          });
          it('reloads the variables with the buffer instead of the file', function() {
            expect(colorBuffer.scanBufferForVariables).toHaveBeenCalled();
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT - 1);
          });
          it('uses the buffer ranges to detect which variables were really changed', function() {
            expect(eventSpy.argsForCall[0][0].destroyed.length).toEqual(1);
            expect(eventSpy.argsForCall[0][0].created).toBeUndefined();
            return expect(eventSpy.argsForCall[0][0].updated).toBeUndefined();
          });
          it('can no longer be found in the project variables', function() {
            expect(project.getVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
            return expect(project.getColorVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
          });
          return it('dispatches a did-update-variables event', function() {
            return expect(eventSpy).toHaveBeenCalled();
          });
        });
        return describe('when all the colors are removed', function() {
          var variablesTextRanges;
          variablesTextRanges = [][0];
          beforeEach(function() {
            runs(function() {
              variablesTextRanges = {};
              project.getVariablesForPath(editor.getPath()).forEach(function(variable) {
                return variablesTextRanges[variable.name] = variable.range;
              });
              editor.setSelectedBufferRange([[0, 0], [2e308, 2e308]]);
              editor.insertText('');
              return editor.getBuffer().emitter.emit('did-stop-changing');
            });
            return waitsFor(function() {
              return eventSpy.callCount > 0;
            });
          });
          it('removes every variable from the file', function() {
            expect(colorBuffer.scanBufferForVariables).toHaveBeenCalled();
            expect(project.getVariables().length).toEqual(0);
            expect(eventSpy.argsForCall[0][0].destroyed.length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
            expect(eventSpy.argsForCall[0][0].created).toBeUndefined();
            return expect(eventSpy.argsForCall[0][0].updated).toBeUndefined();
          });
          it('can no longer be found in the project variables', function() {
            expect(project.getVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
            return expect(project.getColorVariables().some(function(v) {
              return v.name === 'colors.red';
            })).toBeFalsy();
          });
          return it('dispatches a did-update-variables event', function() {
            return expect(eventSpy).toHaveBeenCalled();
          });
        });
      });
      describe('::setIgnoredNames', function() {
        describe('with an empty array', function() {
          beforeEach(function() {
            var spy;
            expect(project.getVariables().length).toEqual(12);
            spy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(spy);
            project.setIgnoredNames([]);
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          return it('reloads the variables from the new paths', function() {
            return expect(project.getVariables().length).toEqual(32);
          });
        });
        return describe('with a more restrictive array', function() {
          beforeEach(function() {
            var spy;
            expect(project.getVariables().length).toEqual(12);
            spy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(spy);
            return waitsForPromise(function() {
              return project.setIgnoredNames(['vendor/*', '**/*.styl']);
            });
          });
          return it('clears all the paths as there is no legible paths', function() {
            return expect(project.getPaths().length).toEqual(0);
          });
        });
      });
      describe('when the project has multiple root directory', function() {
        beforeEach(function() {
          var fixturesPath;
          atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.styl']);
          fixturesPath = atom.project.getPaths()[0];
          atom.project.setPaths(["" + fixturesPath, fixturesPath + "-with-recursion"]);
          project = new ColorProject({});
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('finds the variables from the two directories', function() {
          return expect(project.getVariables().length).toEqual(17);
        });
      });
      describe('when the project has VCS ignored files', function() {
        var projectPath;
        projectPath = [][0];
        beforeEach(function() {
          var dotGit, dotGitFixture, fixture;
          atom.config.set('pigments.sourceNames', ['*.sass']);
          fixture = path.join(__dirname, 'fixtures', 'project-with-gitignore');
          projectPath = temp.mkdirSync('pigments-project');
          dotGitFixture = path.join(fixture, 'git.git');
          dotGit = path.join(projectPath, '.git');
          fs.copySync(dotGitFixture, dotGit);
          fs.writeFileSync(path.join(projectPath, '.gitignore'), fs.readFileSync(path.join(fixture, 'git.gitignore')));
          fs.writeFileSync(path.join(projectPath, 'base.sass'), fs.readFileSync(path.join(fixture, 'base.sass')));
          fs.writeFileSync(path.join(projectPath, 'ignored.sass'), fs.readFileSync(path.join(fixture, 'ignored.sass')));
          fs.mkdirSync(path.join(projectPath, 'bower_components'));
          fs.writeFileSync(path.join(projectPath, 'bower_components', 'some-ignored-file.sass'), fs.readFileSync(path.join(fixture, 'bower_components', 'some-ignored-file.sass')));
          return atom.project.setPaths([projectPath]);
        });
        describe('when the ignoreVcsIgnoredPaths setting is enabled', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoreVcsIgnoredPaths', true);
            project = new ColorProject({});
            return waitsForPromise(function() {
              return project.initialize();
            });
          });
          it('finds the variables from the three files', function() {
            expect(project.getVariables().length).toEqual(3);
            return expect(project.getPaths().length).toEqual(1);
          });
          return describe('and then disabled', function() {
            beforeEach(function() {
              var spy;
              spy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(spy);
              atom.config.set('pigments.ignoreVcsIgnoredPaths', false);
              return waitsFor(function() {
                return spy.callCount > 0;
              });
            });
            it('reloads the paths', function() {
              return expect(project.getPaths().length).toEqual(3);
            });
            return it('reloads the variables', function() {
              return expect(project.getVariables().length).toEqual(10);
            });
          });
        });
        return describe('when the ignoreVcsIgnoredPaths setting is disabled', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoreVcsIgnoredPaths', false);
            project = new ColorProject({});
            return waitsForPromise(function() {
              return project.initialize();
            });
          });
          it('finds the variables from the three files', function() {
            expect(project.getVariables().length).toEqual(10);
            return expect(project.getPaths().length).toEqual(3);
          });
          return describe('and then enabled', function() {
            beforeEach(function() {
              var spy;
              spy = jasmine.createSpy('did-update-variables');
              project.onDidUpdateVariables(spy);
              atom.config.set('pigments.ignoreVcsIgnoredPaths', true);
              return waitsFor(function() {
                return spy.callCount > 0;
              });
            });
            it('reloads the paths', function() {
              return expect(project.getPaths().length).toEqual(1);
            });
            return it('reloads the variables', function() {
              return expect(project.getVariables().length).toEqual(3);
            });
          });
        });
      });
      describe('when the sourceNames setting is changed', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          var originalPaths;
          originalPaths = project.getPaths();
          atom.config.set('pigments.sourceNames', []);
          return waitsFor(function() {
            return project.getPaths().join(',') !== originalPaths.join(',');
          });
        });
        it('updates the variables using the new pattern', function() {
          return expect(project.getVariables().length).toEqual(0);
        });
        return describe('so that new paths are found', function() {
          beforeEach(function() {
            var originalPaths;
            updateSpy = jasmine.createSpy('did-update-variables');
            originalPaths = project.getPaths();
            project.onDidUpdateVariables(updateSpy);
            atom.config.set('pigments.sourceNames', ['**/*.styl']);
            waitsFor(function() {
              return project.getPaths().join(',') !== originalPaths.join(',');
            });
            return waitsFor(function() {
              return updateSpy.callCount > 0;
            });
          });
          return it('loads the variables from these new paths', function() {
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
          });
        });
      });
      describe('when the ignoredNames setting is changed', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          var originalPaths;
          originalPaths = project.getPaths();
          atom.config.set('pigments.ignoredNames', ['**/*.styl']);
          return waitsFor(function() {
            return project.getPaths().join(',') !== originalPaths.join(',');
          });
        });
        it('updates the found using the new pattern', function() {
          return expect(project.getVariables().length).toEqual(0);
        });
        return describe('so that new paths are found', function() {
          beforeEach(function() {
            var originalPaths;
            updateSpy = jasmine.createSpy('did-update-variables');
            originalPaths = project.getPaths();
            project.onDidUpdateVariables(updateSpy);
            atom.config.set('pigments.ignoredNames', []);
            waitsFor(function() {
              return project.getPaths().join(',') !== originalPaths.join(',');
            });
            return waitsFor(function() {
              return updateSpy.callCount > 0;
            });
          });
          return it('loads the variables from these new paths', function() {
            return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
          });
        });
      });
      describe('when the extendedSearchNames setting is changed', function() {
        var updateSpy;
        updateSpy = [][0];
        beforeEach(function() {
          return project.setSearchNames(['*.foo']);
        });
        it('updates the search names', function() {
          return expect(project.getSearchNames().length).toEqual(3);
        });
        return it('serializes the setting', function() {
          return expect(project.serialize().searchNames).toEqual(['*.foo']);
        });
      });
      describe('when the ignore global config settings are enabled', function() {
        describe('for the sourceNames field', function() {
          beforeEach(function() {
            project.sourceNames = ['*.foo'];
            return waitsForPromise(function() {
              return project.setIgnoreGlobalSourceNames(true);
            });
          });
          it('ignores the content of the global config', function() {
            return expect(project.getSourceNames()).toEqual(['.pigments', '*.foo']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalSourceNames).toBeTruthy();
          });
        });
        describe('for the ignoredNames field', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredNames', ['*.foo']);
            project.ignoredNames = ['*.bar'];
            return project.setIgnoreGlobalIgnoredNames(true);
          });
          it('ignores the content of the global config', function() {
            return expect(project.getIgnoredNames()).toEqual(['*.bar']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalIgnoredNames).toBeTruthy();
          });
        });
        describe('for the ignoredScopes field', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredScopes', ['\\.comment']);
            project.ignoredScopes = ['\\.source'];
            return project.setIgnoreGlobalIgnoredScopes(true);
          });
          it('ignores the content of the global config', function() {
            return expect(project.getIgnoredScopes()).toEqual(['\\.source']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalIgnoredScopes).toBeTruthy();
          });
        });
        return describe('for the searchNames field', function() {
          beforeEach(function() {
            atom.config.set('pigments.extendedSearchNames', ['*.css']);
            project.searchNames = ['*.foo'];
            return project.setIgnoreGlobalSearchNames(true);
          });
          it('ignores the content of the global config', function() {
            return expect(project.getSearchNames()).toEqual(['*.less', '*.foo']);
          });
          return it('serializes the project setting', function() {
            return expect(project.serialize().ignoreGlobalSearchNames).toBeTruthy();
          });
        });
      });
      describe('::loadThemesVariables', function() {
        beforeEach(function() {
          atom.packages.activatePackage('atom-light-ui');
          atom.packages.activatePackage('atom-light-syntax');
          atom.config.set('core.themes', ['atom-light-ui', 'atom-light-syntax']);
          waitsForPromise(function() {
            return atom.themes.activateThemes();
          });
          return waitsForPromise(function() {
            return atom.packages.activatePackage('pigments');
          });
        });
        afterEach(function() {
          atom.themes.deactivateThemes();
          return atom.themes.unwatchUserStylesheet();
        });
        return it('returns an array of 62 variables', function() {
          var themeVariables;
          themeVariables = project.loadThemesVariables();
          return expect(themeVariables.length).toEqual(62);
        });
      });
      return describe('when the includeThemes setting is enabled', function() {
        var ref2, spy;
        ref2 = [], paths = ref2[0], spy = ref2[1];
        beforeEach(function() {
          paths = project.getPaths();
          expect(project.getColorVariables().length).toEqual(10);
          atom.packages.activatePackage('atom-light-ui');
          atom.packages.activatePackage('atom-light-syntax');
          atom.packages.activatePackage('atom-dark-ui');
          atom.packages.activatePackage('atom-dark-syntax');
          atom.config.set('core.themes', ['atom-light-ui', 'atom-light-syntax']);
          waitsForPromise(function() {
            return atom.themes.activateThemes();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('pigments');
          });
          waitsForPromise(function() {
            return project.initialize();
          });
          return runs(function() {
            spy = jasmine.createSpy('did-change-active-themes');
            atom.themes.onDidChangeActiveThemes(spy);
            return project.setIncludeThemes(true);
          });
        });
        afterEach(function() {
          atom.themes.deactivateThemes();
          return atom.themes.unwatchUserStylesheet();
        });
        it('includes the variables set for ui and syntax themes in the palette', function() {
          return expect(project.getColorVariables().length).toEqual(72);
        });
        it('still includes the paths from the project', function() {
          var i, len, p, results;
          results = [];
          for (i = 0, len = paths.length; i < len; i++) {
            p = paths[i];
            results.push(expect(project.getPaths().indexOf(p)).not.toEqual(-1));
          }
          return results;
        });
        it('serializes the setting with the project', function() {
          var serialized;
          serialized = project.serialize();
          return expect(serialized.includeThemes).toEqual(true);
        });
        describe('and then disabled', function() {
          beforeEach(function() {
            return project.setIncludeThemes(false);
          });
          it('removes all the paths to the themes stylesheets', function() {
            return expect(project.getColorVariables().length).toEqual(10);
          });
          return describe('when the core.themes setting is modified', function() {
            beforeEach(function() {
              spyOn(project, 'loadThemesVariables').andCallThrough();
              atom.config.set('core.themes', ['atom-dark-ui', 'atom-dark-syntax']);
              return waitsFor(function() {
                return spy.callCount > 0;
              });
            });
            return it('does not trigger a paths update', function() {
              return expect(project.loadThemesVariables).not.toHaveBeenCalled();
            });
          });
        });
        return describe('when the core.themes setting is modified', function() {
          beforeEach(function() {
            spyOn(project, 'loadThemesVariables').andCallThrough();
            atom.config.set('core.themes', ['atom-dark-ui', 'atom-dark-syntax']);
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          return it('triggers a paths update', function() {
            return expect(project.loadThemesVariables).toHaveBeenCalled();
          });
        });
      });
    });
    return describe('when restored', function() {
      var createProject;
      createProject = function(params) {
        var stateFixture;
        if (params == null) {
          params = {};
        }
        stateFixture = params.stateFixture;
        delete params.stateFixture;
        if (params.root == null) {
          params.root = rootPath;
        }
        if (params.timestamp == null) {
          params.timestamp = new Date().toJSON();
        }
        if (params.variableMarkers == null) {
          params.variableMarkers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
        if (params.colorMarkers == null) {
          params.colorMarkers = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        }
        if (params.version == null) {
          params.version = SERIALIZE_VERSION;
        }
        if (params.markersVersion == null) {
          params.markersVersion = SERIALIZE_MARKERS_VERSION;
        }
        return ColorProject.deserialize(jsonFixture(stateFixture, params));
      };
      describe('with a timestamp more recent than the files last modification date', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "empty-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('does not rescans the files', function() {
          return expect(project.getVariables().length).toEqual(1);
        });
      });
      describe('with a version different that the current one', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "empty-project.json",
            version: "0.0.0"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('drops the whole serialized state and rescans all the project', function() {
          return expect(project.getVariables().length).toEqual(12);
        });
      });
      describe('with a serialized path that no longer exist', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "rename-file-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        it('drops drops the non-existing and reload the paths', function() {
          return expect(project.getPaths()).toEqual([rootPath + "/styles/buttons.styl", rootPath + "/styles/variables.styl"]);
        });
        it('drops the variables from the removed paths', function() {
          return expect(project.getVariablesForPath(rootPath + "/styles/foo.styl").length).toEqual(0);
        });
        return it('loads the variables from the new file', function() {
          return expect(project.getVariablesForPath(rootPath + "/styles/variables.styl").length).toEqual(12);
        });
      });
      describe('with a sourceNames setting value different than when serialized', function() {
        beforeEach(function() {
          atom.config.set('pigments.sourceNames', []);
          project = createProject({
            stateFixture: "empty-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('drops the whole serialized state and rescans all the project', function() {
          return expect(project.getVariables().length).toEqual(0);
        });
      });
      describe('with a markers version different that the current one', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "empty-project.json",
            markersVersion: "0.0.0"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        it('keeps the project related data', function() {
          expect(project.ignoredNames).toEqual(['vendor/*']);
          return expect(project.getPaths()).toEqual([rootPath + "/styles/buttons.styl", rootPath + "/styles/variables.styl"]);
        });
        return it('drops the variables and buffers data', function() {
          return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
      });
      describe('with a timestamp older than the files last modification date', function() {
        beforeEach(function() {
          project = createProject({
            timestamp: new Date(0).toJSON(),
            stateFixture: "empty-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('scans again all the files that have a more recent modification date', function() {
          return expect(project.getVariables().length).toEqual(TOTAL_VARIABLES_IN_PROJECT);
        });
      });
      describe('with some files not saved in the project state', function() {
        beforeEach(function() {
          project = createProject({
            stateFixture: "partial-project.json"
          });
          return waitsForPromise(function() {
            return project.initialize();
          });
        });
        return it('detects the new files and scans them', function() {
          return expect(project.getVariables().length).toEqual(12);
        });
      });
      describe('with an open editor and the corresponding buffer state', function() {
        var colorBuffer, editor, ref2;
        ref2 = [], editor = ref2[0], colorBuffer = ref2[1];
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('variables.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            project = createProject({
              stateFixture: "open-buffer-project.json",
              id: editor.id
            });
            return spyOn(ColorBuffer.prototype, 'variablesAvailable').andCallThrough();
          });
          return runs(function() {
            return colorBuffer = project.colorBuffersByEditorId[editor.id];
          });
        });
        it('restores the color buffer in its previous state', function() {
          expect(colorBuffer).toBeDefined();
          return expect(colorBuffer.getColorMarkers().length).toEqual(TOTAL_COLORS_VARIABLES_IN_PROJECT);
        });
        return it('does not wait for the project variables', function() {
          return expect(colorBuffer.variablesAvailable).not.toHaveBeenCalled();
        });
      });
      return describe('with an open editor, the corresponding buffer state and a old timestamp', function() {
        var colorBuffer, editor, ref2;
        ref2 = [], editor = ref2[0], colorBuffer = ref2[1];
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.workspace.open('variables.styl').then(function(o) {
              return editor = o;
            });
          });
          runs(function() {
            spyOn(ColorBuffer.prototype, 'updateVariableRanges').andCallThrough();
            return project = createProject({
              timestamp: new Date(0).toJSON(),
              stateFixture: "open-buffer-project.json",
              id: editor.id
            });
          });
          runs(function() {
            return colorBuffer = project.colorBuffersByEditorId[editor.id];
          });
          return waitsFor(function() {
            return colorBuffer.updateVariableRanges.callCount > 0;
          });
        });
        return it('invalidates the color buffer markers as soon as the dirty paths have been determined', function() {
          return expect(colorBuffer.updateVariableRanges).toHaveBeenCalled();
        });
      });
    });
  });

  describe('ColorProject', function() {
    var project, ref1, rootPath;
    ref1 = [], project = ref1[0], rootPath = ref1[1];
    return describe('when the project has a pigments defaults file', function() {
      beforeEach(function() {
        var fixturesPath;
        atom.config.set('pigments.sourceNames', ['*.sass']);
        fixturesPath = atom.project.getPaths()[0];
        rootPath = fixturesPath + "/project-with-defaults";
        atom.project.setPaths([rootPath]);
        project = new ColorProject({});
        return waitsForPromise(function() {
          return project.initialize();
        });
      });
      return it('loads the defaults file content', function() {
        return expect(project.getColorVariables().length).toEqual(12);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3ItcHJvamVjdC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQWlELE9BQUEsQ0FBUSxpQkFBUixDQUFqRCxFQUFDLHlDQUFELEVBQW9COztFQUNwQixZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSOztFQUNmLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBQ2QsV0FBQSxHQUFjLE9BQUEsQ0FBUSxvQkFBUixDQUE2QixDQUFDLFdBQTlCLENBQTBDLFNBQTFDLEVBQXFELFVBQXJEOztFQUNiLFFBQVMsT0FBQSxDQUFRLGtCQUFSOztFQUVWLDBCQUFBLEdBQTZCOztFQUM3QixpQ0FBQSxHQUFvQzs7RUFFcEMsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtBQUN2QixRQUFBO0lBQUEsT0FBZ0QsRUFBaEQsRUFBQyxpQkFBRCxFQUFVLGlCQUFWLEVBQW1CLGtCQUFuQixFQUE2QixlQUE3QixFQUFvQztJQUVwQyxVQUFBLENBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLENBQ3RDLFFBRHNDLENBQXhDO01BR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxFQUF6QztNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsRUFBbUQsQ0FBQyxHQUFELENBQW5EO01BRUMsZUFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FB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QUFXLENBQUMsb0JBQW5CLENBQXdDLENBQUMsZ0JBQXpDLENBQUE7UUFEeUYsQ0FBM0Y7TUFqQmtGLENBQXBGO0lBaEl3QixDQUExQjtFQS96QnVCLENBQXpCOztFQTI5QkEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtBQUN2QixRQUFBO0lBQUEsT0FBc0IsRUFBdEIsRUFBQyxpQkFBRCxFQUFVO1dBQ1YsUUFBQSxDQUFTLCtDQUFULEVBQTBELFNBQUE7TUFDeEQsVUFBQSxDQUFXLFNBQUE7QUFDVCxZQUFBO1FBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUFDLFFBQUQsQ0FBeEM7UUFFQyxlQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQTtRQUNqQixRQUFBLEdBQWMsWUFBRCxHQUFjO1FBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLFFBQUQsQ0FBdEI7UUFFQSxPQUFBLEdBQVUsSUFBSSxZQUFKLENBQWlCLEVBQWpCO2VBRVYsZUFBQSxDQUFnQixTQUFBO2lCQUFHLE9BQU8sQ0FBQyxVQUFSLENBQUE7UUFBSCxDQUFoQjtNQVRTLENBQVg7YUFXQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQTtlQUNwQyxNQUFBLENBQU8sT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FBMkIsQ0FBQyxNQUFuQyxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELEVBQW5EO01BRG9DLENBQXRDO0lBWndELENBQTFEO0VBRnVCLENBQXpCO0FBeitCQSIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnRlbXAgPSByZXF1aXJlICd0ZW1wJ1xuXG57U0VSSUFMSVpFX1ZFUlNJT04sIFNFUklBTElaRV9NQVJLRVJTX1ZFUlNJT059ID0gcmVxdWlyZSAnLi4vbGliL3ZlcnNpb25zJ1xuQ29sb3JQcm9qZWN0ID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLXByb2plY3QnXG5Db2xvckJ1ZmZlciA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvci1idWZmZXInXG5qc29uRml4dHVyZSA9IHJlcXVpcmUoJy4vaGVscGVycy9maXh0dXJlcycpLmpzb25GaXh0dXJlKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJylcbntjbGlja30gPSByZXF1aXJlICcuL2hlbHBlcnMvZXZlbnRzJ1xuXG5UT1RBTF9WQVJJQUJMRVNfSU5fUFJPSkVDVCA9IDEyXG5UT1RBTF9DT0xPUlNfVkFSSUFCTEVTX0lOX1BST0pFQ1QgPSAxMFxuXG5kZXNjcmliZSAnQ29sb3JQcm9qZWN0JywgLT5cbiAgW3Byb2plY3QsIHByb21pc2UsIHJvb3RQYXRoLCBwYXRocywgZXZlbnRTcHldID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFtcbiAgICAgICcqLnN0eWwnXG4gICAgXVxuICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlZE5hbWVzJywgW11cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmZpbGV0eXBlc0ZvckNvbG9yV29yZHMnLCBbJyonXVxuXG4gICAgW2ZpeHR1cmVzUGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIHJvb3RQYXRoID0gXCIje2ZpeHR1cmVzUGF0aH0vcHJvamVjdFwiXG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFtyb290UGF0aF0pXG5cbiAgICBwcm9qZWN0ID0gbmV3IENvbG9yUHJvamVjdCh7XG4gICAgICBpZ25vcmVkTmFtZXM6IFsndmVuZG9yLyonXVxuICAgICAgc291cmNlTmFtZXM6IFsnKi5sZXNzJ11cbiAgICAgIGlnbm9yZWRTY29wZXM6IFsnXFxcXC5jb21tZW50J11cbiAgICB9KVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHByb2plY3QuZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgJy5kZXNlcmlhbGl6ZScsIC0+XG4gICAgaXQgJ3Jlc3RvcmVzIHRoZSBwcm9qZWN0IGluIGl0cyBwcmV2aW91cyBzdGF0ZScsIC0+XG4gICAgICBkYXRhID1cbiAgICAgICAgcm9vdDogcm9vdFBhdGhcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSlNPTigpXG4gICAgICAgIHZlcnNpb246IFNFUklBTElaRV9WRVJTSU9OXG4gICAgICAgIG1hcmtlcnNWZXJzaW9uOiBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OXG5cbiAgICAgIGpzb24gPSBqc29uRml4dHVyZSAnYmFzZS1wcm9qZWN0Lmpzb24nLCBkYXRhXG4gICAgICBwcm9qZWN0ID0gQ29sb3JQcm9qZWN0LmRlc2VyaWFsaXplKGpzb24pXG5cbiAgICAgIGV4cGVjdChwcm9qZWN0KS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QocHJvamVjdC5nZXRQYXRocygpKS50b0VxdWFsKFtcbiAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvYnV0dG9ucy5zdHlsXCJcbiAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvdmFyaWFibGVzLnN0eWxcIlxuICAgICAgXSlcbiAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbChUT1RBTF9WQVJJQUJMRVNfSU5fUFJPSkVDVClcbiAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX0NPTE9SU19WQVJJQUJMRVNfSU5fUFJPSkVDVClcblxuICBkZXNjcmliZSAnOjppbml0aWFsaXplJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBldmVudFNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtaW5pdGlhbGl6ZScpXG4gICAgICBwcm9qZWN0Lm9uRGlkSW5pdGlhbGl6ZShldmVudFNweSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgaXQgJ2xvYWRzIHRoZSBwYXRocyB0byBzY2FuIGluIHRoZSBwcm9qZWN0JywgLT5cbiAgICAgIGV4cGVjdChwcm9qZWN0LmdldFBhdGhzKCkpLnRvRXF1YWwoW1xuICAgICAgICBcIiN7cm9vdFBhdGh9L3N0eWxlcy9idXR0b25zLnN0eWxcIlxuICAgICAgICBcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiXG4gICAgICBdKVxuXG4gICAgaXQgJ3NjYW5zIHRoZSBsb2FkZWQgcGF0aHMgdG8gcmV0cmlldmUgdGhlIHZhcmlhYmxlcycsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKSkudG9CZURlZmluZWQoKVxuICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgaXQgJ2Rpc3BhdGNoZXMgYSBkaWQtaW5pdGlhbGl6ZSBldmVudCcsIC0+XG4gICAgICBleHBlY3QoZXZlbnRTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlICc6OmZpbmRBbGxDb2xvcnMnLCAtPlxuICAgIGl0ICdyZXR1cm5zIGFsbCB0aGUgY29sb3JzIGluIHRoZSBsZWdpYmxlcyBmaWxlcyBvZiB0aGUgcHJvamVjdCcsIC0+XG4gICAgICBzZWFyY2ggPSBwcm9qZWN0LmZpbmRBbGxDb2xvcnMoKVxuICAgICAgZXhwZWN0KHNlYXJjaCkudG9CZURlZmluZWQoKVxuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyMgICAgICMjICAgICMjICAjIyMjIyMjICAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAgIyMgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgICAjIyMgICAjIyAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICAjIyAgICMjICAjIyAgICAgIyMgIyMgICAgICAgICAgIyMjIyAgIyMgIyMgICAgICMjICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyMgICAgICMjICMjICMjICMjICAgICAjIyAgICAjI1xuICAjIyAgICAgIyMgICAjIyAgIyMjIyMjIyMjICMjICAgIyMgICAgICAgICAjIyAgICAjIyAgIyMjIyAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyMgICAgIyMgICAjIyMgIyMgICAgICMjICAgICMjXG4gICMjICAgICAgICMjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyMjIyMgICAgICMjICAgICMjICAjIyMjIyMjICAgICAjI1xuICAjI1xuICAjIyAgICAjIyAgICAgICAgIyMjIyMjIyAgICAgIyMjICAgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjXG4gICMjICAgICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIHZhcmlhYmxlcyBoYXZlIG5vdCBiZWVuIGxvYWRlZCB5ZXQnLCAtPlxuICAgIGRlc2NyaWJlICc6OnNlcmlhbGl6ZScsIC0+XG4gICAgICBpdCAncmV0dXJucyBhbiBvYmplY3Qgd2l0aG91dCBwYXRocyBub3IgdmFyaWFibGVzJywgLT5cbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlXG4gICAgICAgIHNweU9uKHByb2plY3QsICdnZXRUaW1lc3RhbXAnKS5hbmRDYWxsRmFrZSAtPiBkYXRlXG4gICAgICAgIGV4cGVjdGVkID0ge1xuICAgICAgICAgIGRlc2VyaWFsaXplcjogJ0NvbG9yUHJvamVjdCdcbiAgICAgICAgICB0aW1lc3RhbXA6IGRhdGVcbiAgICAgICAgICB2ZXJzaW9uOiBTRVJJQUxJWkVfVkVSU0lPTlxuICAgICAgICAgIG1hcmtlcnNWZXJzaW9uOiBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OXG4gICAgICAgICAgZ2xvYmFsU291cmNlTmFtZXM6IFsnKi5zdHlsJ11cbiAgICAgICAgICBnbG9iYWxJZ25vcmVkTmFtZXM6IFtdXG4gICAgICAgICAgaWdub3JlZE5hbWVzOiBbJ3ZlbmRvci8qJ11cbiAgICAgICAgICBzb3VyY2VOYW1lczogWycqLmxlc3MnXVxuICAgICAgICAgIGlnbm9yZWRTY29wZXM6IFsnXFxcXC5jb21tZW50J11cbiAgICAgICAgICBidWZmZXJzOiB7fVxuICAgICAgICB9XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LnNlcmlhbGl6ZSgpKS50b0VxdWFsKGV4cGVjdGVkKVxuXG4gICAgZGVzY3JpYmUgJzo6Z2V0VmFyaWFibGVzRm9yUGF0aCcsIC0+XG4gICAgICBpdCAncmV0dXJucyB1bmRlZmluZWQnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXNGb3JQYXRoKFwiI3tyb290UGF0aH0vc3R5bGVzL3ZhcmlhYmxlcy5zdHlsXCIpKS50b0VxdWFsKFtdKVxuXG4gICAgZGVzY3JpYmUgJzo6Z2V0VmFyaWFibGVCeU5hbWUnLCAtPlxuICAgICAgaXQgJ3JldHVybnMgdW5kZWZpbmVkJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVCeU5hbWUoXCJmb29cIikpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgZGVzY3JpYmUgJzo6Z2V0VmFyaWFibGVCeUlkJywgLT5cbiAgICAgIGl0ICdyZXR1cm5zIHVuZGVmaW5lZCcsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlQnlJZCgwKSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBkZXNjcmliZSAnOjpnZXRDb250ZXh0JywgLT5cbiAgICAgIGl0ICdyZXR1cm5zIGFuIGVtcHR5IGNvbnRleHQnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb250ZXh0KCkpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29udGV4dCgpLmdldFZhcmlhYmxlc0NvdW50KCkpLnRvRXF1YWwoMClcblxuICAgIGRlc2NyaWJlICc6OmdldFBhbGV0dGUnLCAtPlxuICAgICAgaXQgJ3JldHVybnMgYW4gZW1wdHkgcGFsZXR0ZScsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFBhbGV0dGUoKSkudG9CZURlZmluZWQoKVxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRQYWxldHRlKCkuZ2V0Q29sb3JzQ291bnQoKSkudG9FcXVhbCgwKVxuXG4gICAgZGVzY3JpYmUgJzo6cmVsb2FkVmFyaWFibGVzRm9yUGF0aCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKHByb2plY3QsICdpbml0aWFsaXplJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIHByb2plY3QucmVsb2FkVmFyaWFibGVzRm9yUGF0aChcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiKVxuXG4gICAgICBpdCAncmV0dXJucyBhIHByb21pc2UgaG9va2VkIG9uIHRoZSBpbml0aWFsaXplIHByb21pc2UnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5pbml0aWFsaXplKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlICc6OnNldElnbm9yZWROYW1lcycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3Quc2V0SWdub3JlZE5hbWVzKFtdKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAnaW5pdGlhbGl6ZXMgdGhlIHByb2plY3Qgd2l0aCB0aGUgbmV3IHBhdGhzJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDMyKVxuXG4gICAgZGVzY3JpYmUgJzo6c2V0U291cmNlTmFtZXMnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0LnNldFNvdXJjZU5hbWVzKFtdKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAnaW5pdGlhbGl6ZXMgdGhlIHByb2plY3Qgd2l0aCB0aGUgbmV3IHBhdGhzJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEyKVxuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICAjIyAgICMjICAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAgIyMgICAjIyAgIyMjIyMjIyMjICMjICAgIyMgICAgICAgICAjI1xuICAjIyAgICAgICMjICMjICAgIyMgICAgICMjICMjICAgICMjICAjIyAgICAjI1xuICAjIyAgICAgICAjIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMjIyMjXG4gICMjXG4gICMjICAgICMjICAgICAgICAjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICAgIyMgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMjIyMjICAgIyMgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyMjIyMjIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyMgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyNcblxuICBkZXNjcmliZSAnd2hlbiB0aGUgcHJvamVjdCBoYXMgbm8gdmFyaWFibGVzIHNvdXJjZSBmaWxlcycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFsnKi5zYXNzJ11cblxuICAgICAgW2ZpeHR1cmVzUGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgcm9vdFBhdGggPSBcIiN7Zml4dHVyZXNQYXRofS1uby1zb3VyY2VzXCJcbiAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbcm9vdFBhdGhdKVxuXG4gICAgICBwcm9qZWN0ID0gbmV3IENvbG9yUHJvamVjdCh7fSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICBpdCAnaW5pdGlhbGl6ZXMgdGhlIHBhdGhzIHdpdGggYW4gZW1wdHkgYXJyYXknLCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbXSlcblxuICAgIGl0ICdpbml0aWFsaXplcyB0aGUgdmFyaWFibGVzIHdpdGggYW4gZW1wdHkgYXJyYXknLCAtPlxuICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkpLnRvRXF1YWwoW10pXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIHByb2plY3QgaGFzIGN1c3RvbSBzb3VyY2UgbmFtZXMgZGVmaW5lZCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFsnKi5zYXNzJ11cblxuICAgICAgW2ZpeHR1cmVzUGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuXG4gICAgICBwcm9qZWN0ID0gbmV3IENvbG9yUHJvamVjdCh7c291cmNlTmFtZXM6IFsnKi5zdHlsJ119KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgIGl0ICdpbml0aWFsaXplcyB0aGUgcGF0aHMgd2l0aCBhbiBlbXB0eSBhcnJheScsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgaXQgJ2luaXRpYWxpemVzIHRoZSB2YXJpYWJsZXMgd2l0aCBhbiBlbXB0eSBhcnJheScsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoVE9UQUxfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG4gICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbChUT1RBTF9DT0xPUlNfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIHByb2plY3QgaGFzIGxvb3BpbmcgdmFyaWFibGUgZGVmaW5pdGlvbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFsnKi5zYXNzJ11cblxuICAgICAgW2ZpeHR1cmVzUGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgcm9vdFBhdGggPSBcIiN7Zml4dHVyZXNQYXRofS13aXRoLXJlY3Vyc2lvblwiXG4gICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW3Jvb3RQYXRoXSlcblxuICAgICAgcHJvamVjdCA9IG5ldyBDb2xvclByb2plY3Qoe30pXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgaXQgJ2lnbm9yZXMgdGhlIGxvb3BpbmcgZGVmaW5pdGlvbicsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNSlcbiAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDUpXG5cbiAgZGVzY3JpYmUgJ3doZW4gdGhlIHZhcmlhYmxlcyBoYXZlIGJlZW4gbG9hZGVkJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgIGRlc2NyaWJlICc6OnNlcmlhbGl6ZScsIC0+XG4gICAgICBpdCAncmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9qZWN0IHByb3BlcnRpZXMnLCAtPlxuICAgICAgICBkYXRlID0gbmV3IERhdGVcbiAgICAgICAgc3B5T24ocHJvamVjdCwgJ2dldFRpbWVzdGFtcCcpLmFuZENhbGxGYWtlIC0+IGRhdGVcbiAgICAgICAgZXhwZWN0KHByb2plY3Quc2VyaWFsaXplKCkpLnRvRXF1YWwoe1xuICAgICAgICAgIGRlc2VyaWFsaXplcjogJ0NvbG9yUHJvamVjdCdcbiAgICAgICAgICBpZ25vcmVkTmFtZXM6IFsndmVuZG9yLyonXVxuICAgICAgICAgIHNvdXJjZU5hbWVzOiBbJyoubGVzcyddXG4gICAgICAgICAgaWdub3JlZFNjb3BlczogWydcXFxcLmNvbW1lbnQnXVxuICAgICAgICAgIHRpbWVzdGFtcDogZGF0ZVxuICAgICAgICAgIHZlcnNpb246IFNFUklBTElaRV9WRVJTSU9OXG4gICAgICAgICAgbWFya2Vyc1ZlcnNpb246IFNFUklBTElaRV9NQVJLRVJTX1ZFUlNJT05cbiAgICAgICAgICBwYXRoczogW1xuICAgICAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvYnV0dG9ucy5zdHlsXCJcbiAgICAgICAgICAgIFwiI3tyb290UGF0aH0vc3R5bGVzL3ZhcmlhYmxlcy5zdHlsXCJcbiAgICAgICAgICBdXG4gICAgICAgICAgZ2xvYmFsU291cmNlTmFtZXM6IFsnKi5zdHlsJ11cbiAgICAgICAgICBnbG9iYWxJZ25vcmVkTmFtZXM6IFtdXG4gICAgICAgICAgYnVmZmVyczoge31cbiAgICAgICAgICB2YXJpYWJsZXM6IHByb2plY3QudmFyaWFibGVzLnNlcmlhbGl6ZSgpXG4gICAgICAgIH0pXG5cbiAgICBkZXNjcmliZSAnOjpnZXRWYXJpYWJsZXNGb3JQYXRoJywgLT5cbiAgICAgIGl0ICdyZXR1cm5zIHRoZSB2YXJpYWJsZXMgZGVmaW5lZCBpbiB0aGUgZmlsZScsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlc0ZvclBhdGgoXCIje3Jvb3RQYXRofS9zdHlsZXMvdmFyaWFibGVzLnN0eWxcIikubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgICBkZXNjcmliZSAnZm9yIGEgZmlsZSB0aGF0IHdhcyBpZ25vcmVkIGluIHRoZSBzY2FubmluZyBwcm9jZXNzJywgLT5cbiAgICAgICAgaXQgJ3JldHVybnMgdW5kZWZpbmVkJywgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXNGb3JQYXRoKFwiI3tyb290UGF0aH0vdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzc1wiKSkudG9FcXVhbChbXSlcblxuICAgIGRlc2NyaWJlICc6OmRlbGV0ZVZhcmlhYmxlc0ZvclBhdGgnLCAtPlxuICAgICAgaXQgJ3JlbW92ZXMgYWxsIHRoZSB2YXJpYWJsZXMgY29taW5nIGZyb20gdGhlIHNwZWNpZmllZCBmaWxlJywgLT5cbiAgICAgICAgcHJvamVjdC5kZWxldGVWYXJpYWJsZXNGb3JQYXRoKFwiI3tyb290UGF0aH0vc3R5bGVzL3ZhcmlhYmxlcy5zdHlsXCIpXG5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzRm9yUGF0aChcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiKSkudG9FcXVhbChbXSlcblxuICAgIGRlc2NyaWJlICc6OmdldENvbnRleHQnLCAtPlxuICAgICAgaXQgJ3JldHVybnMgYSBjb250ZXh0IHdpdGggdGhlIHByb2plY3QgdmFyaWFibGVzJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29udGV4dCgpKS50b0JlRGVmaW5lZCgpXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbnRleHQoKS5nZXRWYXJpYWJsZXNDb3VudCgpKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgZGVzY3JpYmUgJzo6Z2V0UGFsZXR0ZScsIC0+XG4gICAgICBpdCAncmV0dXJucyBhIHBhbGV0dGUgd2l0aCB0aGUgY29sb3JzIGZyb20gdGhlIHByb2plY3QnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRQYWxldHRlKCkpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0UGFsZXR0ZSgpLmdldENvbG9yc0NvdW50KCkpLnRvRXF1YWwoMTApXG5cbiAgICBkZXNjcmliZSAnOjpzaG93VmFyaWFibGVJbkZpbGUnLCAtPlxuICAgICAgaXQgJ29wZW5zIHRoZSBmaWxlIHdoZXJlIGlzIGxvY2F0ZWQgdGhlIHZhcmlhYmxlJywgLT5cbiAgICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC1hZGQtdGV4dC1lZGl0b3InKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZEFkZFRleHRFZGl0b3Ioc3B5KVxuXG4gICAgICAgIHByb2plY3Quc2hvd1ZhcmlhYmxlSW5GaWxlKHByb2plY3QuZ2V0VmFyaWFibGVzKClbMF0pXG5cbiAgICAgICAgd2FpdHNGb3IgLT4gc3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSkudG9FcXVhbChbWzEsMl0sWzEsMTRdXSlcblxuICAgIGRlc2NyaWJlICc6OnJlbG9hZFZhcmlhYmxlc0ZvclBhdGgnLCAtPlxuICAgICAgZGVzY3JpYmUgJ2ZvciBhIGZpbGUgdGhhdCBpcyBwYXJ0IG9mIHRoZSBsb2FkZWQgcGF0aHMnLCAtPlxuICAgICAgICBkZXNjcmliZSAnd2hlcmUgdGhlIHJlbG9hZCBmaW5kcyBuZXcgdmFyaWFibGVzJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBwcm9qZWN0LmRlbGV0ZVZhcmlhYmxlc0ZvclBhdGgoXCIje3Jvb3RQYXRofS9zdHlsZXMvdmFyaWFibGVzLnN0eWxcIilcblxuICAgICAgICAgICAgZXZlbnRTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS12YXJpYWJsZXMnKVxuICAgICAgICAgICAgcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyhldmVudFNweSlcbiAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LnJlbG9hZFZhcmlhYmxlc0ZvclBhdGgoXCIje3Jvb3RQYXRofS9zdHlsZXMvdmFyaWFibGVzLnN0eWxcIilcblxuICAgICAgICAgIGl0ICdzY2FucyBhZ2FpbiB0aGUgZmlsZSB0byBmaW5kIHZhcmlhYmxlcycsIC0+XG4gICAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoVE9UQUxfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG5cbiAgICAgICAgICBpdCAnZGlzcGF0Y2hlcyBhIGRpZC11cGRhdGUtdmFyaWFibGVzIGV2ZW50JywgLT5cbiAgICAgICAgICAgIGV4cGVjdChldmVudFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgICAgZGVzY3JpYmUgJ3doZXJlIHRoZSByZWxvYWQgZmluZHMgbm90aGluZyBuZXcnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGV2ZW50U3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtdmFyaWFibGVzJylcbiAgICAgICAgICAgIHByb2plY3Qub25EaWRVcGRhdGVWYXJpYWJsZXMoZXZlbnRTcHkpXG4gICAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRoKFwiI3tyb290UGF0aH0vc3R5bGVzL3ZhcmlhYmxlcy5zdHlsXCIpXG5cbiAgICAgICAgICBpdCAnbGVhdmVzIHRoZSBmaWxlIHZhcmlhYmxlcyBpbnRhY3QnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgICAgICAgaXQgJ2RvZXMgbm90IGRpc3BhdGNoIGEgZGlkLXVwZGF0ZS12YXJpYWJsZXMgZXZlbnQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGV2ZW50U3B5KS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSAnOjpyZWxvYWRWYXJpYWJsZXNGb3JQYXRocycsIC0+XG4gICAgICBkZXNjcmliZSAnZm9yIGEgZmlsZSB0aGF0IGlzIHBhcnQgb2YgdGhlIGxvYWRlZCBwYXRocycsIC0+XG4gICAgICAgIGRlc2NyaWJlICd3aGVyZSB0aGUgcmVsb2FkIGZpbmRzIG5ldyB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHByb2plY3QuZGVsZXRlVmFyaWFibGVzRm9yUGF0aHMoW1xuICAgICAgICAgICAgICBcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiLCBcIiN7cm9vdFBhdGh9L3N0eWxlcy9idXR0b25zLnN0eWxcIlxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIGV2ZW50U3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtdmFyaWFibGVzJylcbiAgICAgICAgICAgIHByb2plY3Qub25EaWRVcGRhdGVWYXJpYWJsZXMoZXZlbnRTcHkpXG4gICAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5yZWxvYWRWYXJpYWJsZXNGb3JQYXRocyhbXG4gICAgICAgICAgICAgIFwiI3tyb290UGF0aH0vc3R5bGVzL3ZhcmlhYmxlcy5zdHlsXCJcbiAgICAgICAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvYnV0dG9ucy5zdHlsXCJcbiAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICBpdCAnc2NhbnMgYWdhaW4gdGhlIGZpbGUgdG8gZmluZCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgICAgICAgaXQgJ2Rpc3BhdGNoZXMgYSBkaWQtdXBkYXRlLXZhcmlhYmxlcyBldmVudCcsIC0+XG4gICAgICAgICAgICBleHBlY3QoZXZlbnRTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVyZSB0aGUgcmVsb2FkIGZpbmRzIG5vdGhpbmcgbmV3JywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBldmVudFNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLXZhcmlhYmxlcycpXG4gICAgICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKGV2ZW50U3B5KVxuICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QucmVsb2FkVmFyaWFibGVzRm9yUGF0aHMoW1xuICAgICAgICAgICAgICBcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiXG4gICAgICAgICAgICAgIFwiI3tyb290UGF0aH0vc3R5bGVzL2J1dHRvbnMuc3R5bFwiXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgaXQgJ2xlYXZlcyB0aGUgZmlsZSB2YXJpYWJsZXMgaW50YWN0JywgLT5cbiAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbChUT1RBTF9WQVJJQUJMRVNfSU5fUFJPSkVDVClcblxuICAgICAgICAgIGl0ICdkb2VzIG5vdCBkaXNwYXRjaCBhIGRpZC11cGRhdGUtdmFyaWFibGVzIGV2ZW50JywgLT5cbiAgICAgICAgICAgIGV4cGVjdChldmVudFNweSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBkZXNjcmliZSAnZm9yIGEgZmlsZSB0aGF0IGlzIG5vdCBwYXJ0IG9mIHRoZSBsb2FkZWQgcGF0aHMnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc3B5T24ocHJvamVjdCwgJ2xvYWRWYXJpYWJsZXNGb3JQYXRoJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBwcm9qZWN0LnJlbG9hZFZhcmlhYmxlc0ZvclBhdGgoXCIje3Jvb3RQYXRofS92ZW5kb3IvY3NzL3ZhcmlhYmxlcy5sZXNzXCIpXG5cbiAgICAgICAgaXQgJ2RvZXMgbm90aGluZycsIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QubG9hZFZhcmlhYmxlc0ZvclBhdGgpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlICd3aGVuIGEgYnVmZmVyIHdpdGggdmFyaWFibGVzIGlzIG9wZW4nLCAtPlxuICAgICAgW2VkaXRvciwgY29sb3JCdWZmZXJdID0gW11cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZXZlbnRTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS12YXJpYWJsZXMnKVxuICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKGV2ZW50U3B5KVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3N0eWxlcy92YXJpYWJsZXMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgICBzcHlPbihjb2xvckJ1ZmZlciwgJ3NjYW5CdWZmZXJGb3JWYXJpYWJsZXMnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICBpdCAndXBkYXRlcyB0aGUgcHJvamVjdCB2YXJpYWJsZSB3aXRoIHRoZSBidWZmZXIgcmFuZ2VzJywgLT5cbiAgICAgICAgZm9yIHZhcmlhYmxlIGluIHByb2plY3QuZ2V0VmFyaWFibGVzKClcbiAgICAgICAgICBleHBlY3QodmFyaWFibGUuYnVmZmVyUmFuZ2UpLnRvQmVEZWZpbmVkKClcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gYSBjb2xvciBpcyBtb2RpZmllZCB0aGF0IGRvZXMgbm90IGFmZmVjdCBvdGhlciB2YXJpYWJsZXMgcmFuZ2VzJywgLT5cbiAgICAgICAgW3ZhcmlhYmxlc1RleHRSYW5nZXNdID0gW11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHZhcmlhYmxlc1RleHRSYW5nZXMgPSB7fVxuICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzRm9yUGF0aChlZGl0b3IuZ2V0UGF0aCgpKS5mb3JFYWNoICh2YXJpYWJsZSkgLT5cbiAgICAgICAgICAgIHZhcmlhYmxlc1RleHRSYW5nZXNbdmFyaWFibGUubmFtZV0gPSB2YXJpYWJsZS5yYW5nZVxuXG4gICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1sxLDddLFsxLDE0XV0pXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyMzMzYnKVxuICAgICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5lbWl0dGVyLmVtaXQoJ2RpZC1zdG9wLWNoYW5naW5nJylcblxuICAgICAgICAgIHdhaXRzRm9yIC0+IGV2ZW50U3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAncmVsb2FkcyB0aGUgdmFyaWFibGVzIHdpdGggdGhlIGJ1ZmZlciBpbnN0ZWFkIG9mIHRoZSBmaWxlJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuc2NhbkJ1ZmZlckZvclZhcmlhYmxlcykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgICAgIGl0ICd1c2VzIHRoZSBidWZmZXIgcmFuZ2VzIHRvIGRldGVjdCB3aGljaCB2YXJpYWJsZXMgd2VyZSByZWFsbHkgY2hhbmdlZCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmRlc3Ryb3llZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChldmVudFNweS5hcmdzRm9yQ2FsbFswXVswXS51cGRhdGVkLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIHRoZSB0ZXh0IHJhbmdlIG9mIHRoZSBvdGhlciB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzRm9yUGF0aChcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiKS5mb3JFYWNoICh2YXJpYWJsZSkgLT5cbiAgICAgICAgICAgIGlmIHZhcmlhYmxlLm5hbWUgaXNudCAnY29sb3JzLnJlZCdcbiAgICAgICAgICAgICAgZXhwZWN0KHZhcmlhYmxlLnJhbmdlWzBdKS50b0VxdWFsKHZhcmlhYmxlc1RleHRSYW5nZXNbdmFyaWFibGUubmFtZV1bMF0gLSAzKVxuICAgICAgICAgICAgICBleHBlY3QodmFyaWFibGUucmFuZ2VbMV0pLnRvRXF1YWwodmFyaWFibGVzVGV4dFJhbmdlc1t2YXJpYWJsZS5uYW1lXVsxXSAtIDMpXG5cbiAgICAgICAgaXQgJ2Rpc3BhdGNoZXMgYSBkaWQtdXBkYXRlLXZhcmlhYmxlcyBldmVudCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gYSB0ZXh0IGlzIGluc2VydGVkIHRoYXQgYWZmZWN0cyBvdGhlciB2YXJpYWJsZXMgcmFuZ2VzJywgLT5cbiAgICAgICAgW3ZhcmlhYmxlc1RleHRSYW5nZXMsIHZhcmlhYmxlc0J1ZmZlclJhbmdlc10gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgdmFyaWFibGVzVGV4dFJhbmdlcyA9IHt9XG4gICAgICAgICAgICB2YXJpYWJsZXNCdWZmZXJSYW5nZXMgPSB7fVxuICAgICAgICAgICAgcHJvamVjdC5nZXRWYXJpYWJsZXNGb3JQYXRoKGVkaXRvci5nZXRQYXRoKCkpLmZvckVhY2ggKHZhcmlhYmxlKSAtPlxuICAgICAgICAgICAgICB2YXJpYWJsZXNUZXh0UmFuZ2VzW3ZhcmlhYmxlLm5hbWVdID0gdmFyaWFibGUucmFuZ2VcbiAgICAgICAgICAgICAgdmFyaWFibGVzQnVmZmVyUmFuZ2VzW3ZhcmlhYmxlLm5hbWVdID0gdmFyaWFibGUuYnVmZmVyUmFuZ2VcblxuICAgICAgICAgICAgc3B5T24ocHJvamVjdC52YXJpYWJsZXMsICdhZGRNYW55JykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzAsMF0sWzAsMF1dKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ1xcblxcbicpXG4gICAgICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuZW1pdHRlci5lbWl0KCdkaWQtc3RvcC1jaGFuZ2luZycpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LnZhcmlhYmxlcy5hZGRNYW55LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAnZG9lcyBub3QgdHJpZ2dlciBhIGNoYW5nZSBldmVudCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5LmNhbGxDb3VudCkudG9FcXVhbCgwKVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIHRoZSByYW5nZSBvZiB0aGUgdXBkYXRlZCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzRm9yUGF0aChcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiKS5mb3JFYWNoICh2YXJpYWJsZSkgLT5cbiAgICAgICAgICAgIGlmIHZhcmlhYmxlLm5hbWUgaXNudCAnY29sb3JzLnJlZCdcbiAgICAgICAgICAgICAgZXhwZWN0KHZhcmlhYmxlLnJhbmdlWzBdKS50b0VxdWFsKHZhcmlhYmxlc1RleHRSYW5nZXNbdmFyaWFibGUubmFtZV1bMF0gKyAyKVxuICAgICAgICAgICAgICBleHBlY3QodmFyaWFibGUucmFuZ2VbMV0pLnRvRXF1YWwodmFyaWFibGVzVGV4dFJhbmdlc1t2YXJpYWJsZS5uYW1lXVsxXSArIDIpXG4gICAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZS5idWZmZXJSYW5nZS5pc0VxdWFsKHZhcmlhYmxlc0J1ZmZlclJhbmdlc1t2YXJpYWJsZS5uYW1lXSkpLnRvQmVGYWxzeSgpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGEgY29sb3IgaXMgcmVtb3ZlZCcsIC0+XG4gICAgICAgIFt2YXJpYWJsZXNUZXh0UmFuZ2VzXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICB2YXJpYWJsZXNUZXh0UmFuZ2VzID0ge31cbiAgICAgICAgICAgIHByb2plY3QuZ2V0VmFyaWFibGVzRm9yUGF0aChlZGl0b3IuZ2V0UGF0aCgpKS5mb3JFYWNoICh2YXJpYWJsZSkgLT5cbiAgICAgICAgICAgICAgdmFyaWFibGVzVGV4dFJhbmdlc1t2YXJpYWJsZS5uYW1lXSA9IHZhcmlhYmxlLnJhbmdlXG5cbiAgICAgICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKFtbMSwwXSxbMiwwXV0pXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnJylcbiAgICAgICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5lbWl0dGVyLmVtaXQoJ2RpZC1zdG9wLWNoYW5naW5nJylcblxuICAgICAgICAgIHdhaXRzRm9yIC0+IGV2ZW50U3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAncmVsb2FkcyB0aGUgdmFyaWFibGVzIHdpdGggdGhlIGJ1ZmZlciBpbnN0ZWFkIG9mIHRoZSBmaWxlJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuc2NhbkJ1ZmZlckZvclZhcmlhYmxlcykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUIC0gMSlcblxuICAgICAgICBpdCAndXNlcyB0aGUgYnVmZmVyIHJhbmdlcyB0byBkZXRlY3Qgd2hpY2ggdmFyaWFibGVzIHdlcmUgcmVhbGx5IGNoYW5nZWQnLCAtPlxuICAgICAgICAgIGV4cGVjdChldmVudFNweS5hcmdzRm9yQ2FsbFswXVswXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChldmVudFNweS5hcmdzRm9yQ2FsbFswXVswXS51cGRhdGVkKS50b0JlVW5kZWZpbmVkKClcblxuICAgICAgICBpdCAnY2FuIG5vIGxvbmdlciBiZSBmb3VuZCBpbiB0aGUgcHJvamVjdCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLnNvbWUgKHYpIC0+IHYubmFtZSBpcyAnY29sb3JzLnJlZCcpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5zb21lICh2KSAtPiB2Lm5hbWUgaXMgJ2NvbG9ycy5yZWQnKS50b0JlRmFsc3koKVxuXG4gICAgICAgIGl0ICdkaXNwYXRjaGVzIGEgZGlkLXVwZGF0ZS12YXJpYWJsZXMgZXZlbnQnLCAtPlxuICAgICAgICAgIGV4cGVjdChldmVudFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGFsbCB0aGUgY29sb3JzIGFyZSByZW1vdmVkJywgLT5cbiAgICAgICAgW3ZhcmlhYmxlc1RleHRSYW5nZXNdID0gW11cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHZhcmlhYmxlc1RleHRSYW5nZXMgPSB7fVxuICAgICAgICAgICAgcHJvamVjdC5nZXRWYXJpYWJsZXNGb3JQYXRoKGVkaXRvci5nZXRQYXRoKCkpLmZvckVhY2ggKHZhcmlhYmxlKSAtPlxuICAgICAgICAgICAgICB2YXJpYWJsZXNUZXh0UmFuZ2VzW3ZhcmlhYmxlLm5hbWVdID0gdmFyaWFibGUucmFuZ2VcblxuICAgICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1swLDBdLFtJbmZpbml0eSxJbmZpbml0eV1dKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJycpXG4gICAgICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuZW1pdHRlci5lbWl0KCdkaWQtc3RvcC1jaGFuZ2luZycpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBldmVudFNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgaXQgJ3JlbW92ZXMgZXZlcnkgdmFyaWFibGUgZnJvbSB0aGUgZmlsZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLnNjYW5CdWZmZXJGb3JWYXJpYWJsZXMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmRlc3Ryb3llZC5sZW5ndGgpLnRvRXF1YWwoVE9UQUxfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG4gICAgICAgICAgZXhwZWN0KGV2ZW50U3B5LmFyZ3NGb3JDYWxsWzBdWzBdLmNyZWF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChldmVudFNweS5hcmdzRm9yQ2FsbFswXVswXS51cGRhdGVkKS50b0JlVW5kZWZpbmVkKClcblxuICAgICAgICBpdCAnY2FuIG5vIGxvbmdlciBiZSBmb3VuZCBpbiB0aGUgcHJvamVjdCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLnNvbWUgKHYpIC0+IHYubmFtZSBpcyAnY29sb3JzLnJlZCcpLnRvQmVGYWxzeSgpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5zb21lICh2KSAtPiB2Lm5hbWUgaXMgJ2NvbG9ycy5yZWQnKS50b0JlRmFsc3koKVxuXG4gICAgICAgIGl0ICdkaXNwYXRjaGVzIGEgZGlkLXVwZGF0ZS12YXJpYWJsZXMgZXZlbnQnLCAtPlxuICAgICAgICAgIGV4cGVjdChldmVudFNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSAnOjpzZXRJZ25vcmVkTmFtZXMnLCAtPlxuICAgICAgZGVzY3JpYmUgJ3dpdGggYW4gZW1wdHkgYXJyYXknLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEyKVxuXG4gICAgICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkgJ2RpZC11cGRhdGUtdmFyaWFibGVzJ1xuICAgICAgICAgIHByb2plY3Qub25EaWRVcGRhdGVWYXJpYWJsZXMoc3B5KVxuICAgICAgICAgIHByb2plY3Quc2V0SWdub3JlZE5hbWVzKFtdKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT4gc3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBpdCAncmVsb2FkcyB0aGUgdmFyaWFibGVzIGZyb20gdGhlIG5ldyBwYXRocycsIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDMyKVxuXG4gICAgICBkZXNjcmliZSAnd2l0aCBhIG1vcmUgcmVzdHJpY3RpdmUgYXJyYXknLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEyKVxuXG4gICAgICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkgJ2RpZC11cGRhdGUtdmFyaWFibGVzJ1xuICAgICAgICAgIHByb2plY3Qub25EaWRVcGRhdGVWYXJpYWJsZXMoc3B5KVxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LnNldElnbm9yZWROYW1lcyhbJ3ZlbmRvci8qJywgJyoqLyouc3R5bCddKVxuXG4gICAgICAgIGl0ICdjbGVhcnMgYWxsIHRoZSBwYXRocyBhcyB0aGVyZSBpcyBubyBsZWdpYmxlIHBhdGhzJywgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIHByb2plY3QgaGFzIG11bHRpcGxlIHJvb3QgZGlyZWN0b3J5JywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFsnKiovKi5zYXNzJywgJyoqLyouc3R5bCddXG5cbiAgICAgICAgW2ZpeHR1cmVzUGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW1xuICAgICAgICAgIFwiI3tmaXh0dXJlc1BhdGh9XCJcbiAgICAgICAgICBcIiN7Zml4dHVyZXNQYXRofS13aXRoLXJlY3Vyc2lvblwiXG4gICAgICAgIF0pXG5cbiAgICAgICAgcHJvamVjdCA9IG5ldyBDb2xvclByb2plY3Qoe30pXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdmaW5kcyB0aGUgdmFyaWFibGVzIGZyb20gdGhlIHR3byBkaXJlY3RvcmllcycsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgxNylcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBwcm9qZWN0IGhhcyBWQ1MgaWdub3JlZCBmaWxlcycsIC0+XG4gICAgICBbcHJvamVjdFBhdGhdID0gW11cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFsnKi5zYXNzJ11cblxuICAgICAgICBmaXh0dXJlID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJywgJ3Byb2plY3Qtd2l0aC1naXRpZ25vcmUnKVxuXG4gICAgICAgIHByb2plY3RQYXRoID0gdGVtcC5ta2RpclN5bmMoJ3BpZ21lbnRzLXByb2plY3QnKVxuICAgICAgICBkb3RHaXRGaXh0dXJlID0gcGF0aC5qb2luKGZpeHR1cmUsICdnaXQuZ2l0JylcbiAgICAgICAgZG90R2l0ID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCAnLmdpdCcpXG4gICAgICAgIGZzLmNvcHlTeW5jKGRvdEdpdEZpeHR1cmUsIGRvdEdpdClcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ocHJvamVjdFBhdGgsICcuZ2l0aWdub3JlJyksIGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oZml4dHVyZSwgJ2dpdC5naXRpZ25vcmUnKSkpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKHByb2plY3RQYXRoLCAnYmFzZS5zYXNzJyksIGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oZml4dHVyZSwgJ2Jhc2Uuc2FzcycpKSlcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ocHJvamVjdFBhdGgsICdpZ25vcmVkLnNhc3MnKSwgZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbihmaXh0dXJlLCAnaWdub3JlZC5zYXNzJykpKVxuICAgICAgICBmcy5ta2RpclN5bmMocGF0aC5qb2luKHByb2plY3RQYXRoLCAnYm93ZXJfY29tcG9uZW50cycpKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihwcm9qZWN0UGF0aCwgJ2Jvd2VyX2NvbXBvbmVudHMnLCAnc29tZS1pZ25vcmVkLWZpbGUuc2FzcycpLCBmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKGZpeHR1cmUsICdib3dlcl9jb21wb25lbnRzJywgJ3NvbWUtaWdub3JlZC1maWxlLnNhc3MnKSkpXG5cbiAgICAgICAgIyBGSVhNRSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkgcmV0dXJucyB0aGUgcHJvamVjdCBwYXRoIHByZWZpeGVkIHdpdGhcbiAgICAgICAgIyAvcHJpdmF0ZVxuICAgICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW3Byb2plY3RQYXRoXSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGlnbm9yZVZjc0lnbm9yZWRQYXRocyBzZXR0aW5nIGlzIGVuYWJsZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5pZ25vcmVWY3NJZ25vcmVkUGF0aHMnLCB0cnVlXG4gICAgICAgICAgcHJvamVjdCA9IG5ldyBDb2xvclByb2plY3Qoe30pXG5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgICAgICBpdCAnZmluZHMgdGhlIHZhcmlhYmxlcyBmcm9tIHRoZSB0aHJlZSBmaWxlcycsIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDMpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgICBkZXNjcmliZSAnYW5kIHRoZW4gZGlzYWJsZWQnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLXZhcmlhYmxlcycpXG4gICAgICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKHNweSlcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlVmNzSWdub3JlZFBhdGhzJywgZmFsc2VcblxuICAgICAgICAgICAgd2FpdHNGb3IgLT4gc3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICAgIGl0ICdyZWxvYWRzIHRoZSBwYXRocycsIC0+XG4gICAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgICAgICAgaXQgJ3JlbG9hZHMgdGhlIHZhcmlhYmxlcycsIC0+XG4gICAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMTApXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBpZ25vcmVWY3NJZ25vcmVkUGF0aHMgc2V0dGluZyBpcyBkaXNhYmxlZCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmlnbm9yZVZjc0lnbm9yZWRQYXRocycsIGZhbHNlXG4gICAgICAgICAgcHJvamVjdCA9IG5ldyBDb2xvclByb2plY3Qoe30pXG5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgICAgICBpdCAnZmluZHMgdGhlIHZhcmlhYmxlcyBmcm9tIHRoZSB0aHJlZSBmaWxlcycsIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEwKVxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoKS50b0VxdWFsKDMpXG5cbiAgICAgICAgZGVzY3JpYmUgJ2FuZCB0aGVuIGVuYWJsZWQnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLXZhcmlhYmxlcycpXG4gICAgICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKHNweSlcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlVmNzSWdub3JlZFBhdGhzJywgdHJ1ZVxuXG4gICAgICAgICAgICB3YWl0c0ZvciAtPiBzcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgICAgaXQgJ3JlbG9hZHMgdGhlIHBhdGhzJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgICAgICBpdCAncmVsb2FkcyB0aGUgdmFyaWFibGVzJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyAjIyAgICAjIyAgIyMjIyMjICAgICMjIyMjI1xuICAgICMjICAgICMjICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICAgIyMgICAgIyMgICAgICAgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyMjICAjIyAjIyAgICAgICAgIyNcbiAgICAjIyAgICAgIyMjIyMjICAjIyMjIyMgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICMjICMjICMjICAgIyMjIyAgIyMjIyMjXG4gICAgIyMgICAgICAgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgIyMjIyAjIyAgICAjIyAgICAgICAgIyNcbiAgICAjIyAgICAjIyAgICAjIyAjIyAgICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICAgIyMjICMjICAgICMjICAjIyAgICAjI1xuICAgICMjICAgICAjIyMjIyMgICMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMgIyMgICAgIyMgICMjIyMjIyAgICAjIyMjIyNcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBzb3VyY2VOYW1lcyBzZXR0aW5nIGlzIGNoYW5nZWQnLCAtPlxuICAgICAgW3VwZGF0ZVNweV0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsUGF0aHMgPSBwcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFtdXG5cbiAgICAgICAgd2FpdHNGb3IgLT4gcHJvamVjdC5nZXRQYXRocygpLmpvaW4oJywnKSBpc250IG9yaWdpbmFsUGF0aHMuam9pbignLCcpXG5cbiAgICAgIGl0ICd1cGRhdGVzIHRoZSB2YXJpYWJsZXMgdXNpbmcgdGhlIG5ldyBwYXR0ZXJuJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICAgIGRlc2NyaWJlICdzbyB0aGF0IG5ldyBwYXRocyBhcmUgZm91bmQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgdXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtdmFyaWFibGVzJylcblxuICAgICAgICAgIG9yaWdpbmFsUGF0aHMgPSBwcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgICBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzKHVwZGF0ZVNweSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyoqLyouc3R5bCddXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LmdldFBhdGhzKCkuam9pbignLCcpIGlzbnQgb3JpZ2luYWxQYXRocy5qb2luKCcsJylcbiAgICAgICAgICB3YWl0c0ZvciAtPiB1cGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdsb2FkcyB0aGUgdmFyaWFibGVzIGZyb20gdGhlc2UgbmV3IHBhdGhzJywgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoVE9UQUxfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgaWdub3JlZE5hbWVzIHNldHRpbmcgaXMgY2hhbmdlZCcsIC0+XG4gICAgICBbdXBkYXRlU3B5XSA9IFtdXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxQYXRocyA9IHByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmlnbm9yZWROYW1lcycsIFsnKiovKi5zdHlsJ11cblxuICAgICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LmdldFBhdGhzKCkuam9pbignLCcpIGlzbnQgb3JpZ2luYWxQYXRocy5qb2luKCcsJylcblxuICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGZvdW5kIHVzaW5nIHRoZSBuZXcgcGF0dGVybicsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICBkZXNjcmliZSAnc28gdGhhdCBuZXcgcGF0aHMgYXJlIGZvdW5kJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHVwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLXZhcmlhYmxlcycpXG5cbiAgICAgICAgICBvcmlnaW5hbFBhdGhzID0gcHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgICAgcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyh1cGRhdGVTcHkpXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmlnbm9yZWROYW1lcycsIFtdXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LmdldFBhdGhzKCkuam9pbignLCcpIGlzbnQgb3JpZ2luYWxQYXRocy5qb2luKCcsJylcbiAgICAgICAgICB3YWl0c0ZvciAtPiB1cGRhdGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdsb2FkcyB0aGUgdmFyaWFibGVzIGZyb20gdGhlc2UgbmV3IHBhdGhzJywgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoVE9UQUxfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZXh0ZW5kZWRTZWFyY2hOYW1lcyBzZXR0aW5nIGlzIGNoYW5nZWQnLCAtPlxuICAgICAgW3VwZGF0ZVNweV0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3Quc2V0U2VhcmNoTmFtZXMoWycqLmZvbyddKVxuXG4gICAgICBpdCAndXBkYXRlcyB0aGUgc2VhcmNoIG5hbWVzJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0U2VhcmNoTmFtZXMoKS5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgICAgaXQgJ3NlcmlhbGl6ZXMgdGhlIHNldHRpbmcnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5zZXJpYWxpemUoKS5zZWFyY2hOYW1lcykudG9FcXVhbChbJyouZm9vJ10pXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgaWdub3JlIGdsb2JhbCBjb25maWcgc2V0dGluZ3MgYXJlIGVuYWJsZWQnLCAtPlxuICAgICAgZGVzY3JpYmUgJ2ZvciB0aGUgc291cmNlTmFtZXMgZmllbGQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgcHJvamVjdC5zb3VyY2VOYW1lcyA9IFsnKi5mb28nXVxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LnNldElnbm9yZUdsb2JhbFNvdXJjZU5hbWVzKHRydWUpXG5cbiAgICAgICAgaXQgJ2lnbm9yZXMgdGhlIGNvbnRlbnQgb2YgdGhlIGdsb2JhbCBjb25maWcnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFNvdXJjZU5hbWVzKCkpLnRvRXF1YWwoWycucGlnbWVudHMnLCcqLmZvbyddKVxuXG4gICAgICAgIGl0ICdzZXJpYWxpemVzIHRoZSBwcm9qZWN0IHNldHRpbmcnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LnNlcmlhbGl6ZSgpLmlnbm9yZUdsb2JhbFNvdXJjZU5hbWVzKS50b0JlVHJ1dGh5KClcblxuICAgICAgZGVzY3JpYmUgJ2ZvciB0aGUgaWdub3JlZE5hbWVzIGZpZWxkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlZE5hbWVzJywgWycqLmZvbyddXG4gICAgICAgICAgcHJvamVjdC5pZ25vcmVkTmFtZXMgPSBbJyouYmFyJ11cblxuICAgICAgICAgIHByb2plY3Quc2V0SWdub3JlR2xvYmFsSWdub3JlZE5hbWVzKHRydWUpXG5cbiAgICAgICAgaXQgJ2lnbm9yZXMgdGhlIGNvbnRlbnQgb2YgdGhlIGdsb2JhbCBjb25maWcnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldElnbm9yZWROYW1lcygpKS50b0VxdWFsKFsnKi5iYXInXSlcblxuICAgICAgICBpdCAnc2VyaWFsaXplcyB0aGUgcHJvamVjdCBzZXR0aW5nJywgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5zZXJpYWxpemUoKS5pZ25vcmVHbG9iYWxJZ25vcmVkTmFtZXMpLnRvQmVUcnV0aHkoKVxuXG4gICAgICBkZXNjcmliZSAnZm9yIHRoZSBpZ25vcmVkU2NvcGVzIGZpZWxkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuaWdub3JlZFNjb3BlcycsIFsnXFxcXC5jb21tZW50J11cbiAgICAgICAgICBwcm9qZWN0Lmlnbm9yZWRTY29wZXMgPSBbJ1xcXFwuc291cmNlJ11cblxuICAgICAgICAgIHByb2plY3Quc2V0SWdub3JlR2xvYmFsSWdub3JlZFNjb3Blcyh0cnVlKVxuXG4gICAgICAgIGl0ICdpZ25vcmVzIHRoZSBjb250ZW50IG9mIHRoZSBnbG9iYWwgY29uZmlnJywgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRJZ25vcmVkU2NvcGVzKCkpLnRvRXF1YWwoWydcXFxcLnNvdXJjZSddKVxuXG4gICAgICAgIGl0ICdzZXJpYWxpemVzIHRoZSBwcm9qZWN0IHNldHRpbmcnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LnNlcmlhbGl6ZSgpLmlnbm9yZUdsb2JhbElnbm9yZWRTY29wZXMpLnRvQmVUcnV0aHkoKVxuXG4gICAgICBkZXNjcmliZSAnZm9yIHRoZSBzZWFyY2hOYW1lcyBmaWVsZCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmV4dGVuZGVkU2VhcmNoTmFtZXMnLCBbJyouY3NzJ11cbiAgICAgICAgICBwcm9qZWN0LnNlYXJjaE5hbWVzID0gWycqLmZvbyddXG5cbiAgICAgICAgICBwcm9qZWN0LnNldElnbm9yZUdsb2JhbFNlYXJjaE5hbWVzKHRydWUpXG5cbiAgICAgICAgaXQgJ2lnbm9yZXMgdGhlIGNvbnRlbnQgb2YgdGhlIGdsb2JhbCBjb25maWcnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFNlYXJjaE5hbWVzKCkpLnRvRXF1YWwoWycqLmxlc3MnLCcqLmZvbyddKVxuXG4gICAgICAgIGl0ICdzZXJpYWxpemVzIHRoZSBwcm9qZWN0IHNldHRpbmcnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LnNlcmlhbGl6ZSgpLmlnbm9yZUdsb2JhbFNlYXJjaE5hbWVzKS50b0JlVHJ1dGh5KClcblxuXG4gICAgZGVzY3JpYmUgJzo6bG9hZFRoZW1lc1ZhcmlhYmxlcycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWxpZ2h0LXVpJylcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tbGlnaHQtc3ludGF4JylcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2NvcmUudGhlbWVzJywgWydhdG9tLWxpZ2h0LXVpJywgJ2F0b20tbGlnaHQtc3ludGF4J10pXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS50aGVtZXMuYWN0aXZhdGVUaGVtZXMoKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpXG5cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnRoZW1lcy5kZWFjdGl2YXRlVGhlbWVzKClcbiAgICAgICAgYXRvbS50aGVtZXMudW53YXRjaFVzZXJTdHlsZXNoZWV0KClcblxuICAgICAgaXQgJ3JldHVybnMgYW4gYXJyYXkgb2YgNjIgdmFyaWFibGVzJywgLT5cbiAgICAgICAgdGhlbWVWYXJpYWJsZXMgPSBwcm9qZWN0LmxvYWRUaGVtZXNWYXJpYWJsZXMoKVxuICAgICAgICBleHBlY3QodGhlbWVWYXJpYWJsZXMubGVuZ3RoKS50b0VxdWFsKDYyKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIGluY2x1ZGVUaGVtZXMgc2V0dGluZyBpcyBlbmFibGVkJywgLT5cbiAgICAgIFtwYXRocywgc3B5XSA9IFtdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHBhdGhzID0gcHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEwKVxuXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWxpZ2h0LXVpJylcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tbGlnaHQtc3ludGF4JylcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tZGFyay11aScpXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdG9tLWRhcmstc3ludGF4JylcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2NvcmUudGhlbWVzJywgWydhdG9tLWxpZ2h0LXVpJywgJ2F0b20tbGlnaHQtc3ludGF4J10pXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS50aGVtZXMuYWN0aXZhdGVUaGVtZXMoKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgc3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC1jaGFuZ2UtYWN0aXZlLXRoZW1lcycpXG4gICAgICAgICAgYXRvbS50aGVtZXMub25EaWRDaGFuZ2VBY3RpdmVUaGVtZXMoc3B5KVxuICAgICAgICAgIHByb2plY3Quc2V0SW5jbHVkZVRoZW1lcyh0cnVlKVxuXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS50aGVtZXMuZGVhY3RpdmF0ZVRoZW1lcygpXG4gICAgICAgIGF0b20udGhlbWVzLnVud2F0Y2hVc2VyU3R5bGVzaGVldCgpXG5cbiAgICAgIGl0ICdpbmNsdWRlcyB0aGUgdmFyaWFibGVzIHNldCBmb3IgdWkgYW5kIHN5bnRheCB0aGVtZXMgaW4gdGhlIHBhbGV0dGUnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg3MilcblxuICAgICAgaXQgJ3N0aWxsIGluY2x1ZGVzIHRoZSBwYXRocyBmcm9tIHRoZSBwcm9qZWN0JywgLT5cbiAgICAgICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRQYXRocygpLmluZGV4T2YgcCkubm90LnRvRXF1YWwoLTEpXG5cbiAgICAgIGl0ICdzZXJpYWxpemVzIHRoZSBzZXR0aW5nIHdpdGggdGhlIHByb2plY3QnLCAtPlxuICAgICAgICBzZXJpYWxpemVkID0gcHJvamVjdC5zZXJpYWxpemUoKVxuXG4gICAgICAgIGV4cGVjdChzZXJpYWxpemVkLmluY2x1ZGVUaGVtZXMpLnRvRXF1YWwodHJ1ZSlcblxuICAgICAgZGVzY3JpYmUgJ2FuZCB0aGVuIGRpc2FibGVkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHByb2plY3Quc2V0SW5jbHVkZVRoZW1lcyhmYWxzZSlcblxuICAgICAgICBpdCAncmVtb3ZlcyBhbGwgdGhlIHBhdGhzIHRvIHRoZSB0aGVtZXMgc3R5bGVzaGVldHMnLCAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEwKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBjb3JlLnRoZW1lcyBzZXR0aW5nIGlzIG1vZGlmaWVkJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzcHlPbihwcm9qZWN0LCAnbG9hZFRoZW1lc1ZhcmlhYmxlcycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnY29yZS50aGVtZXMnLCBbJ2F0b20tZGFyay11aScsICdhdG9tLWRhcmstc3ludGF4J10pXG5cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IHNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgICBpdCAnZG9lcyBub3QgdHJpZ2dlciBhIHBhdGhzIHVwZGF0ZScsIC0+XG4gICAgICAgICAgICBleHBlY3QocHJvamVjdC5sb2FkVGhlbWVzVmFyaWFibGVzKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBjb3JlLnRoZW1lcyBzZXR0aW5nIGlzIG1vZGlmaWVkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNweU9uKHByb2plY3QsICdsb2FkVGhlbWVzVmFyaWFibGVzJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnY29yZS50aGVtZXMnLCBbJ2F0b20tZGFyay11aScsICdhdG9tLWRhcmstc3ludGF4J10pXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPiBzcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICd0cmlnZ2VycyBhIHBhdGhzIHVwZGF0ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QubG9hZFRoZW1lc1ZhcmlhYmxlcykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjXG4gICMjICAgICMjICAgIyMgICAjIyAgICAgICAgICAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjICAgICAjIyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjXG5cbiAgZGVzY3JpYmUgJ3doZW4gcmVzdG9yZWQnLCAtPlxuICAgIGNyZWF0ZVByb2plY3QgPSAocGFyYW1zPXt9KSAtPlxuICAgICAge3N0YXRlRml4dHVyZX0gPSBwYXJhbXNcbiAgICAgIGRlbGV0ZSBwYXJhbXMuc3RhdGVGaXh0dXJlXG5cbiAgICAgIHBhcmFtcy5yb290ID89IHJvb3RQYXRoXG4gICAgICBwYXJhbXMudGltZXN0YW1wID89ICBuZXcgRGF0ZSgpLnRvSlNPTigpXG4gICAgICBwYXJhbXMudmFyaWFibGVNYXJrZXJzID89IFsxLi4xMl1cbiAgICAgIHBhcmFtcy5jb2xvck1hcmtlcnMgPz0gWzEzLi4yNF1cbiAgICAgIHBhcmFtcy52ZXJzaW9uID89IFNFUklBTElaRV9WRVJTSU9OXG4gICAgICBwYXJhbXMubWFya2Vyc1ZlcnNpb24gPz0gU0VSSUFMSVpFX01BUktFUlNfVkVSU0lPTlxuXG4gICAgICBDb2xvclByb2plY3QuZGVzZXJpYWxpemUoanNvbkZpeHR1cmUoc3RhdGVGaXh0dXJlLCBwYXJhbXMpKVxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSB0aW1lc3RhbXAgbW9yZSByZWNlbnQgdGhhbiB0aGUgZmlsZXMgbGFzdCBtb2RpZmljYXRpb24gZGF0ZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgc3RhdGVGaXh0dXJlOiBcImVtcHR5LXByb2plY3QuanNvblwiXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdkb2VzIG5vdCByZXNjYW5zIHRoZSBmaWxlcycsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSB2ZXJzaW9uIGRpZmZlcmVudCB0aGF0IHRoZSBjdXJyZW50IG9uZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgc3RhdGVGaXh0dXJlOiBcImVtcHR5LXByb2plY3QuanNvblwiXG4gICAgICAgICAgdmVyc2lvbjogXCIwLjAuMFwiXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdkcm9wcyB0aGUgd2hvbGUgc2VyaWFsaXplZCBzdGF0ZSBhbmQgcmVzY2FucyBhbGwgdGhlIHByb2plY3QnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMTIpXG5cbiAgICBkZXNjcmliZSAnd2l0aCBhIHNlcmlhbGl6ZWQgcGF0aCB0aGF0IG5vIGxvbmdlciBleGlzdCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgc3RhdGVGaXh0dXJlOiBcInJlbmFtZS1maWxlLXByb2plY3QuanNvblwiXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdkcm9wcyBkcm9wcyB0aGUgbm9uLWV4aXN0aW5nIGFuZCByZWxvYWQgdGhlIHBhdGhzJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbXG4gICAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvYnV0dG9ucy5zdHlsXCJcbiAgICAgICAgICBcIiN7cm9vdFBhdGh9L3N0eWxlcy92YXJpYWJsZXMuc3R5bFwiXG4gICAgICAgIF0pXG5cbiAgICAgIGl0ICdkcm9wcyB0aGUgdmFyaWFibGVzIGZyb20gdGhlIHJlbW92ZWQgcGF0aHMnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXNGb3JQYXRoKFwiI3tyb290UGF0aH0vc3R5bGVzL2Zvby5zdHlsXCIpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICBpdCAnbG9hZHMgdGhlIHZhcmlhYmxlcyBmcm9tIHRoZSBuZXcgZmlsZScsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlc0ZvclBhdGgoXCIje3Jvb3RQYXRofS9zdHlsZXMvdmFyaWFibGVzLnN0eWxcIikubGVuZ3RoKS50b0VxdWFsKDEyKVxuXG5cbiAgICBkZXNjcmliZSAnd2l0aCBhIHNvdXJjZU5hbWVzIHNldHRpbmcgdmFsdWUgZGlmZmVyZW50IHRoYW4gd2hlbiBzZXJpYWxpemVkJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFtdKVxuXG4gICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgc3RhdGVGaXh0dXJlOiBcImVtcHR5LXByb2plY3QuanNvblwiXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGl0ICdkcm9wcyB0aGUgd2hvbGUgc2VyaWFsaXplZCBzdGF0ZSBhbmQgcmVzY2FucyBhbGwgdGhlIHByb2plY3QnLCAtPlxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgIGRlc2NyaWJlICd3aXRoIGEgbWFya2VycyB2ZXJzaW9uIGRpZmZlcmVudCB0aGF0IHRoZSBjdXJyZW50IG9uZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgc3RhdGVGaXh0dXJlOiBcImVtcHR5LXByb2plY3QuanNvblwiXG4gICAgICAgICAgbWFya2Vyc1ZlcnNpb246IFwiMC4wLjBcIlxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAna2VlcHMgdGhlIHByb2plY3QgcmVsYXRlZCBkYXRhJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuaWdub3JlZE5hbWVzKS50b0VxdWFsKFsndmVuZG9yLyonXSlcbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0UGF0aHMoKSkudG9FcXVhbChbXG4gICAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvYnV0dG9ucy5zdHlsXCIsXG4gICAgICAgICAgXCIje3Jvb3RQYXRofS9zdHlsZXMvdmFyaWFibGVzLnN0eWxcIlxuICAgICAgICBdKVxuXG4gICAgICBpdCAnZHJvcHMgdGhlIHZhcmlhYmxlcyBhbmQgYnVmZmVycyBkYXRhJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKFRPVEFMX1ZBUklBQkxFU19JTl9QUk9KRUNUKVxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYSB0aW1lc3RhbXAgb2xkZXIgdGhhbiB0aGUgZmlsZXMgbGFzdCBtb2RpZmljYXRpb24gZGF0ZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgwKS50b0pTT04oKVxuICAgICAgICAgIHN0YXRlRml4dHVyZTogXCJlbXB0eS1wcm9qZWN0Lmpzb25cIlxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAnc2NhbnMgYWdhaW4gYWxsIHRoZSBmaWxlcyB0aGF0IGhhdmUgYSBtb3JlIHJlY2VudCBtb2RpZmljYXRpb24gZGF0ZScsIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbChUT1RBTF9WQVJJQUJMRVNfSU5fUFJPSkVDVClcblxuICAgIGRlc2NyaWJlICd3aXRoIHNvbWUgZmlsZXMgbm90IHNhdmVkIGluIHRoZSBwcm9qZWN0IHN0YXRlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgcHJvamVjdCA9IGNyZWF0ZVByb2plY3RcbiAgICAgICAgICBzdGF0ZUZpeHR1cmU6IFwicGFydGlhbC1wcm9qZWN0Lmpzb25cIlxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAnZGV0ZWN0cyB0aGUgbmV3IGZpbGVzIGFuZCBzY2FucyB0aGVtJywgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDEyKVxuXG4gICAgZGVzY3JpYmUgJ3dpdGggYW4gb3BlbiBlZGl0b3IgYW5kIHRoZSBjb3JyZXNwb25kaW5nIGJ1ZmZlciBzdGF0ZScsIC0+XG4gICAgICBbZWRpdG9yLCBjb2xvckJ1ZmZlcl0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCd2YXJpYWJsZXMuc3R5bCcpLnRoZW4gKG8pIC0+IGVkaXRvciA9IG9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcHJvamVjdCA9IGNyZWF0ZVByb2plY3RcbiAgICAgICAgICAgIHN0YXRlRml4dHVyZTogXCJvcGVuLWJ1ZmZlci1wcm9qZWN0Lmpzb25cIlxuICAgICAgICAgICAgaWQ6IGVkaXRvci5pZFxuXG4gICAgICAgICAgc3B5T24oQ29sb3JCdWZmZXIucHJvdG90eXBlLCAndmFyaWFibGVzQXZhaWxhYmxlJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIHJ1bnMgLT4gY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyc0J5RWRpdG9ySWRbZWRpdG9yLmlkXVxuXG4gICAgICBpdCAncmVzdG9yZXMgdGhlIGNvbG9yIGJ1ZmZlciBpbiBpdHMgcHJldmlvdXMgc3RhdGUnLCAtPlxuICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbChUT1RBTF9DT0xPUlNfVkFSSUFCTEVTX0lOX1BST0pFQ1QpXG5cbiAgICAgIGl0ICdkb2VzIG5vdCB3YWl0IGZvciB0aGUgcHJvamVjdCB2YXJpYWJsZXMnLCAtPlxuICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSAnd2l0aCBhbiBvcGVuIGVkaXRvciwgdGhlIGNvcnJlc3BvbmRpbmcgYnVmZmVyIHN0YXRlIGFuZCBhIG9sZCB0aW1lc3RhbXAnLCAtPlxuICAgICAgW2VkaXRvciwgY29sb3JCdWZmZXJdID0gW11cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigndmFyaWFibGVzLnN0eWwnKS50aGVuIChvKSAtPiBlZGl0b3IgPSBvXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHNweU9uKENvbG9yQnVmZmVyLnByb3RvdHlwZSwgJ3VwZGF0ZVZhcmlhYmxlUmFuZ2VzJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgIHByb2plY3QgPSBjcmVhdGVQcm9qZWN0XG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKDApLnRvSlNPTigpXG4gICAgICAgICAgICBzdGF0ZUZpeHR1cmU6IFwib3Blbi1idWZmZXItcHJvamVjdC5qc29uXCJcbiAgICAgICAgICAgIGlkOiBlZGl0b3IuaWRcblxuICAgICAgICBydW5zIC0+IGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlcnNCeUVkaXRvcklkW2VkaXRvci5pZF1cblxuICAgICAgICB3YWl0c0ZvciAtPiBjb2xvckJ1ZmZlci51cGRhdGVWYXJpYWJsZVJhbmdlcy5jYWxsQ291bnQgPiAwXG5cbiAgICAgIGl0ICdpbnZhbGlkYXRlcyB0aGUgY29sb3IgYnVmZmVyIG1hcmtlcnMgYXMgc29vbiBhcyB0aGUgZGlydHkgcGF0aHMgaGF2ZSBiZWVuIGRldGVybWluZWQnLCAtPlxuICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIudXBkYXRlVmFyaWFibGVSYW5nZXMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4jIyAgICAjIyMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjIyMjI1xuIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAgICAgICAgIyNcbiMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAgIyMgICAjIyAgIyMgICAgICMjICMjICAgICAgICAgICMjXG4jIyAgICAjIyAgICAgIyMgIyMjIyMjICAgIyMjIyMjICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAgICAjI1xuIyMgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICMjIyMjIyMjIyAjIyAgICAgIyMgIyMgICAgICAgICAgIyNcbiMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICAgICMjXG4jIyAgICAjIyMjIyMjIyAgIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjICAjIyMjIyMjICAjIyMjIyMjIyAgICAjI1xuXG5kZXNjcmliZSAnQ29sb3JQcm9qZWN0JywgLT5cbiAgW3Byb2plY3QsIHJvb3RQYXRoXSA9IFtdXG4gIGRlc2NyaWJlICd3aGVuIHRoZSBwcm9qZWN0IGhhcyBhIHBpZ21lbnRzIGRlZmF1bHRzIGZpbGUnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyouc2FzcyddXG5cbiAgICAgIFtmaXh0dXJlc1BhdGhdID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIHJvb3RQYXRoID0gXCIje2ZpeHR1cmVzUGF0aH0vcHJvamVjdC13aXRoLWRlZmF1bHRzXCJcbiAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbcm9vdFBhdGhdKVxuXG4gICAgICBwcm9qZWN0ID0gbmV3IENvbG9yUHJvamVjdCh7fSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICBpdCAnbG9hZHMgdGhlIGRlZmF1bHRzIGZpbGUgY29udGVudCcsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgxMilcbiJdfQ==

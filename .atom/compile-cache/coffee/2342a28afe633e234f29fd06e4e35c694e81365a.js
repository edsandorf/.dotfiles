(function() {
  var Disposable, Pigments, PigmentsAPI, SERIALIZE_MARKERS_VERSION, SERIALIZE_VERSION, ref, registry;

  Disposable = require('atom').Disposable;

  Pigments = require('../lib/pigments');

  PigmentsAPI = require('../lib/pigments-api');

  registry = require('../lib/variable-expressions');

  ref = require('../lib/versions'), SERIALIZE_VERSION = ref.SERIALIZE_VERSION, SERIALIZE_MARKERS_VERSION = ref.SERIALIZE_MARKERS_VERSION;

  describe("Pigments", function() {
    var pigments, project, ref1, workspaceElement;
    ref1 = [], workspaceElement = ref1[0], pigments = ref1[1], project = ref1[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.styl']);
      atom.config.set('pigments.ignoredNames', []);
      atom.config.set('pigments.ignoredScopes', []);
      atom.config.set('pigments.autocompleteScopes', []);
      registry.createExpression('pigments:txt_vars', '^[ \\t]*([a-zA-Z_$][a-zA-Z0-9\\-_]*)\\s*=(?!=)\\s*([^\\n\\r;]*);?$', ['txt']);
      return waitsForPromise({
        label: 'pigments activation'
      }, function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    afterEach(function() {
      registry.removeExpression('pigments:txt_vars');
      return project != null ? project.destroy() : void 0;
    });
    it('instanciates a ColorProject instance', function() {
      return expect(pigments.getProject()).toBeDefined();
    });
    it('serializes the project', function() {
      var date;
      date = new Date;
      spyOn(pigments.getProject(), 'getTimestamp').andCallFake(function() {
        return date;
      });
      return expect(pigments.serialize()).toEqual({
        project: {
          deserializer: 'ColorProject',
          timestamp: date,
          version: SERIALIZE_VERSION,
          markersVersion: SERIALIZE_MARKERS_VERSION,
          globalSourceNames: ['**/*.sass', '**/*.styl'],
          globalIgnoredNames: [],
          buffers: {}
        }
      });
    });
    describe('when deactivated', function() {
      var colorBuffer, editor, editorElement, ref2;
      ref2 = [], editor = ref2[0], editorElement = ref2[1], colorBuffer = ref2[2];
      beforeEach(function() {
        waitsForPromise({
          label: 'text-editor opened'
        }, function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return colorBuffer = project.colorBufferForEditor(editor);
          });
        });
        waitsFor('pigments markers appended to the DOM', function() {
          return editorElement.querySelector('pigments-markers');
        });
        return runs(function() {
          spyOn(project, 'destroy').andCallThrough();
          spyOn(colorBuffer, 'destroy').andCallThrough();
          return pigments.deactivate();
        });
      });
      it('destroys the pigments project', function() {
        return expect(project.destroy).toHaveBeenCalled();
      });
      it('destroys all the color buffers that were created', function() {
        expect(project.colorBufferForEditor(editor)).toBeUndefined();
        expect(project.colorBuffersByEditorId).toBeNull();
        return expect(colorBuffer.destroy).toHaveBeenCalled();
      });
      return it('destroys the color buffer element that were added to the DOM', function() {
        return expect(editorElement.querySelector('pigments-markers')).not.toExist();
      });
    });
    describe('pigments:project-settings', function() {
      var item;
      item = null;
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:project-settings');
        return waitsFor('active pane item', function() {
          item = atom.workspace.getActivePaneItem();
          return item != null;
        });
      });
      return it('opens a settings view in the active pane', function() {
        return item.matches('pigments-color-project');
      });
    });
    describe('API provider', function() {
      var buffer, editor, editorElement, ref2, service;
      ref2 = [], service = ref2[0], editor = ref2[1], editorElement = ref2[2], buffer = ref2[3];
      beforeEach(function() {
        waitsForPromise({
          label: 'text-editor opened'
        }, function() {
          return atom.workspace.open('four-variables.styl').then(function(e) {
            editor = e;
            editorElement = atom.views.getView(e);
            return buffer = project.colorBufferForEditor(editor);
          });
        });
        runs(function() {
          return service = pigments.provideAPI();
        });
        return waitsForPromise({
          label: 'project initialized'
        }, function() {
          return project.initialize();
        });
      });
      it('returns an object conforming to the API', function() {
        expect(service instanceof PigmentsAPI).toBeTruthy();
        expect(service.getProject()).toBe(project);
        expect(service.getPalette()).toEqual(project.getPalette());
        expect(service.getPalette()).not.toBe(project.getPalette());
        expect(service.getVariables()).toEqual(project.getVariables());
        return expect(service.getColorVariables()).toEqual(project.getColorVariables());
      });
      return describe('::observeColorBuffers', function() {
        var spy;
        spy = [][0];
        beforeEach(function() {
          spy = jasmine.createSpy('did-create-color-buffer');
          return service.observeColorBuffers(spy);
        });
        it('calls the callback for every existing color buffer', function() {
          expect(spy).toHaveBeenCalled();
          return expect(spy.calls.length).toEqual(1);
        });
        return it('calls the callback on every new buffer creation', function() {
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('buttons.styl');
          });
          return runs(function() {
            return expect(spy.calls.length).toEqual(2);
          });
        });
      });
    });
    describe('color expression consumer', function() {
      var colorBuffer, colorBufferElement, colorProvider, consumerDisposable, editor, editorElement, otherConsumerDisposable, ref2;
      ref2 = [], colorProvider = ref2[0], consumerDisposable = ref2[1], editor = ref2[2], editorElement = ref2[3], colorBuffer = ref2[4], colorBufferElement = ref2[5], otherConsumerDisposable = ref2[6];
      beforeEach(function() {
        return colorProvider = {
          name: 'todo',
          regexpString: 'TODO',
          scopes: ['*'],
          priority: 0,
          handle: function(match, expression, context) {
            return this.red = 255;
          }
        };
      });
      afterEach(function() {
        if (consumerDisposable != null) {
          consumerDisposable.dispose();
        }
        return otherConsumerDisposable != null ? otherConsumerDisposable.dispose() : void 0;
      });
      describe('when consumed before opening a text editor', function() {
        beforeEach(function() {
          consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('color-consumer-sample.txt').then(function(e) {
              editor = e;
              editorElement = atom.views.getView(e);
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          waitsForPromise({
            label: 'color buffer initialized'
          }, function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise({
            label: 'color buffer variables available'
          }, function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('parses the new expression and renders a color', function() {
          return expect(colorBuffer.getColorMarkers().length).toEqual(1);
        });
        it('returns a Disposable instance', function() {
          return expect(consumerDisposable instanceof Disposable).toBeTruthy();
        });
        return describe('the returned disposable', function() {
          it('removes the provided expression from the registry', function() {
            consumerDisposable.dispose();
            return expect(project.getColorExpressionsRegistry().getExpression('todo')).toBeUndefined();
          });
          return it('triggers an update in the opened editors', function() {
            var updateSpy;
            updateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(updateSpy);
            consumerDisposable.dispose();
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 0;
            });
            return runs(function() {
              return expect(colorBuffer.getColorMarkers().length).toEqual(0);
            });
          });
        });
      });
      describe('when consumed after opening a text editor', function() {
        beforeEach(function() {
          waitsForPromise({
            label: 'text-editor opened'
          }, function() {
            return atom.workspace.open('color-consumer-sample.txt').then(function(e) {
              editor = e;
              editorElement = atom.views.getView(e);
              return colorBuffer = project.colorBufferForEditor(editor);
            });
          });
          waitsForPromise({
            label: 'color buffer initialized'
          }, function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise({
            label: 'color buffer variables available'
          }, function() {
            return colorBuffer.variablesAvailable();
          });
        });
        it('triggers an update in the opened editors', function() {
          var updateSpy;
          updateSpy = jasmine.createSpy('did-update-color-markers');
          colorBuffer.onDidUpdateColorMarkers(updateSpy);
          consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          waitsFor('did-update-color-markers event dispatched', function() {
            return updateSpy.callCount > 0;
          });
          runs(function() {
            expect(colorBuffer.getColorMarkers().length).toEqual(1);
            return consumerDisposable.dispose();
          });
          waitsFor('did-update-color-markers event dispatched', function() {
            return updateSpy.callCount > 1;
          });
          return runs(function() {
            return expect(colorBuffer.getColorMarkers().length).toEqual(0);
          });
        });
        return describe('when an array of expressions is passed', function() {
          return it('triggers an update in the opened editors', function() {
            var updateSpy;
            updateSpy = jasmine.createSpy('did-update-color-markers');
            colorBuffer.onDidUpdateColorMarkers(updateSpy);
            consumerDisposable = pigments.consumeColorExpressions({
              expressions: [colorProvider]
            });
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 0;
            });
            runs(function() {
              expect(colorBuffer.getColorMarkers().length).toEqual(1);
              return consumerDisposable.dispose();
            });
            waitsFor('did-update-color-markers event dispatched', function() {
              return updateSpy.callCount > 1;
            });
            return runs(function() {
              return expect(colorBuffer.getColorMarkers().length).toEqual(0);
            });
          });
        });
      });
      return describe('when the expression matches a variable value', function() {
        beforeEach(function() {
          return waitsForPromise({
            label: 'project initialized'
          }, function() {
            return project.initialize();
          });
        });
        it('detects the new variable as a color variable', function() {
          var variableSpy;
          variableSpy = jasmine.createSpy('did-update-variables');
          project.onDidUpdateVariables(variableSpy);
          atom.config.set('pigments.sourceNames', ['**/*.txt']);
          waitsFor('variables updated', function() {
            return variableSpy.callCount > 1;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(6);
            expect(project.getColorVariables().length).toEqual(4);
            return consumerDisposable = pigments.consumeColorExpressions(colorProvider);
          });
          waitsFor('variables updated', function() {
            return variableSpy.callCount > 2;
          });
          return runs(function() {
            expect(project.getVariables().length).toEqual(6);
            return expect(project.getColorVariables().length).toEqual(5);
          });
        });
        return describe('and there was an expression that could not be resolved before', function() {
          return it('updates the invalid color as a now valid color', function() {
            var variableSpy;
            variableSpy = jasmine.createSpy('did-update-variables');
            project.onDidUpdateVariables(variableSpy);
            atom.config.set('pigments.sourceNames', ['**/*.txt']);
            waitsFor('variables updated', function() {
              return variableSpy.callCount > 1;
            });
            return runs(function() {
              otherConsumerDisposable = pigments.consumeColorExpressions({
                name: 'bar',
                regexpString: 'baz\\s+(\\w+)',
                handle: function(match, expression, context) {
                  var _, color, expr;
                  _ = match[0], expr = match[1];
                  color = context.readColor(expr);
                  if (context.isInvalid(color)) {
                    return this.invalid = true;
                  }
                  return this.rgba = color.rgba;
                }
              });
              consumerDisposable = pigments.consumeColorExpressions(colorProvider);
              waitsFor('variables updated', function() {
                return variableSpy.callCount > 2;
              });
              runs(function() {
                expect(project.getVariables().length).toEqual(6);
                expect(project.getColorVariables().length).toEqual(6);
                expect(project.getVariableByName('bar').color.invalid).toBeFalsy();
                return consumerDisposable.dispose();
              });
              waitsFor('variables updated', function() {
                return variableSpy.callCount > 3;
              });
              return runs(function() {
                expect(project.getVariables().length).toEqual(6);
                expect(project.getColorVariables().length).toEqual(5);
                return expect(project.getVariableByName('bar').color.invalid).toBeTruthy();
              });
            });
          });
        });
      });
    });
    return describe('variable expression consumer', function() {
      var colorBuffer, colorBufferElement, consumerDisposable, editor, editorElement, ref2, variableProvider;
      ref2 = [], variableProvider = ref2[0], consumerDisposable = ref2[1], editor = ref2[2], editorElement = ref2[3], colorBuffer = ref2[4], colorBufferElement = ref2[5];
      beforeEach(function() {
        variableProvider = {
          name: 'todo',
          regexpString: '(TODO):\\s*([^;\\n]+)'
        };
        return waitsForPromise({
          label: 'project initialized'
        }, function() {
          return project.initialize();
        });
      });
      afterEach(function() {
        return consumerDisposable != null ? consumerDisposable.dispose() : void 0;
      });
      it('updates the project variables when consumed', function() {
        var variableSpy;
        variableSpy = jasmine.createSpy('did-update-variables');
        project.onDidUpdateVariables(variableSpy);
        atom.config.set('pigments.sourceNames', ['**/*.txt']);
        waitsFor('variables updated', function() {
          return variableSpy.callCount > 1;
        });
        runs(function() {
          expect(project.getVariables().length).toEqual(6);
          expect(project.getColorVariables().length).toEqual(4);
          return consumerDisposable = pigments.consumeVariableExpressions(variableProvider);
        });
        waitsFor('variables updated after service consumed', function() {
          return variableSpy.callCount > 2;
        });
        runs(function() {
          expect(project.getVariables().length).toEqual(7);
          expect(project.getColorVariables().length).toEqual(4);
          return consumerDisposable.dispose();
        });
        waitsFor('variables updated after service disposed', function() {
          return variableSpy.callCount > 3;
        });
        return runs(function() {
          expect(project.getVariables().length).toEqual(6);
          return expect(project.getColorVariables().length).toEqual(4);
        });
      });
      return describe('when an array of expressions is passed', function() {
        return it('updates the project variables when consumed', function() {
          var previousVariablesCount;
          previousVariablesCount = null;
          atom.config.set('pigments.sourceNames', ['**/*.txt']);
          waitsFor('variables initialized', function() {
            return project.getVariables().length === 45;
          });
          runs(function() {
            return previousVariablesCount = project.getVariables().length;
          });
          waitsFor('variables updated', function() {
            return project.getVariables().length === 6;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(6);
            expect(project.getColorVariables().length).toEqual(4);
            previousVariablesCount = project.getVariables().length;
            return consumerDisposable = pigments.consumeVariableExpressions({
              expressions: [variableProvider]
            });
          });
          waitsFor('variables updated after service consumed', function() {
            return project.getVariables().length !== previousVariablesCount;
          });
          runs(function() {
            expect(project.getVariables().length).toEqual(7);
            expect(project.getColorVariables().length).toEqual(4);
            previousVariablesCount = project.getVariables().length;
            return consumerDisposable.dispose();
          });
          waitsFor('variables updated after service disposed', function() {
            return project.getVariables().length !== previousVariablesCount;
          });
          return runs(function() {
            expect(project.getVariables().length).toEqual(6);
            return expect(project.getColorVariables().length).toEqual(4);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvYWN0aXZhdGlvbi1hbmQtYXBpLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUNmLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBQ1gsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLDZCQUFSOztFQUVYLE1BQWlELE9BQUEsQ0FBUSxpQkFBUixDQUFqRCxFQUFDLHlDQUFELEVBQW9COztFQUVwQixRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0FBQ25CLFFBQUE7SUFBQSxPQUF3QyxFQUF4QyxFQUFDLDBCQUFELEVBQW1CLGtCQUFuQixFQUE2QjtJQUU3QixVQUFBLENBQVcsU0FBQTtNQUNULGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEI7TUFDbkIsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCO01BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUFDLFdBQUQsRUFBYyxXQUFkLENBQXhDO01BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxFQUF6QztNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsRUFBMUM7TUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkJBQWhCLEVBQStDLEVBQS9DO01BRUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLG1CQUExQixFQUErQyxvRUFBL0MsRUFBcUgsQ0FBQyxLQUFELENBQXJIO2FBRUEsZUFBQSxDQUFnQjtRQUFBLEtBQUEsRUFBTyxxQkFBUDtPQUFo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QUEsQ0FBSyxTQUFBO1lBQ0gsTUFBQSxDQUFPLE9BQU8sQ0FBQyxZQUFSLENBQUEsQ0FBc0IsQ0FBQyxNQUE5QixDQUFxQyxDQUFDLE9BQXRDLENBQThDLENBQTlDO21CQUNBLE1BQUEsQ0FBTyxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQUEyQixDQUFDLE1BQW5DLENBQTBDLENBQUMsT0FBM0MsQ0FBbUQsQ0FBbkQ7VUFGRyxDQUFMO1FBckNnRCxDQUFsRDtNQURpRCxDQUFuRDtJQTVDdUMsQ0FBekM7RUFqVW1CLENBQXJCO0FBUEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7RGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuUGlnbWVudHMgPSByZXF1aXJlICcuLi9saWIvcGlnbWVudHMnXG5QaWdtZW50c0FQSSA9IHJlcXVpcmUgJy4uL2xpYi9waWdtZW50cy1hcGknXG5yZWdpc3RyeSA9IHJlcXVpcmUgJy4uL2xpYi92YXJpYWJsZS1leHByZXNzaW9ucydcblxue1NFUklBTElaRV9WRVJTSU9OLCBTRVJJQUxJWkVfTUFSS0VSU19WRVJTSU9OfSA9IHJlcXVpcmUgJy4uL2xpYi92ZXJzaW9ucydcblxuZGVzY3JpYmUgXCJQaWdtZW50c1wiLCAtPlxuICBbd29ya3NwYWNlRWxlbWVudCwgcGlnbWVudHMsIHByb2plY3RdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgWycqKi8qLnNhc3MnLCAnKiovKi5zdHlsJ10pXG4gICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkTmFtZXMnLCBbXSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmlnbm9yZWRTY29wZXMnLCBbXSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmF1dG9jb21wbGV0ZVNjb3BlcycsIFtdKVxuXG4gICAgcmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6dHh0X3ZhcnMnLCAnXlsgXFxcXHRdKihbYS16QS1aXyRdW2EtekEtWjAtOVxcXFwtX10qKVxcXFxzKj0oPyE9KVxcXFxzKihbXlxcXFxuXFxcXHI7XSopOz8kJywgWyd0eHQnXVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAncGlnbWVudHMgYWN0aXZhdGlvbicsIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgncGlnbWVudHMnKS50aGVuIChwa2cpIC0+XG4gICAgICAgIHBpZ21lbnRzID0gcGtnLm1haW5Nb2R1bGVcbiAgICAgICAgcHJvamVjdCA9IHBpZ21lbnRzLmdldFByb2plY3QoKVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHJlZ2lzdHJ5LnJlbW92ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnR4dF92YXJzJ1xuICAgIHByb2plY3Q/LmRlc3Ryb3koKVxuXG4gIGl0ICdpbnN0YW5jaWF0ZXMgYSBDb2xvclByb2plY3QgaW5zdGFuY2UnLCAtPlxuICAgIGV4cGVjdChwaWdtZW50cy5nZXRQcm9qZWN0KCkpLnRvQmVEZWZpbmVkKClcblxuICBpdCAnc2VyaWFsaXplcyB0aGUgcHJvamVjdCcsIC0+XG4gICAgZGF0ZSA9IG5ldyBEYXRlXG4gICAgc3B5T24ocGlnbWVudHMuZ2V0UHJvamVjdCgpLCAnZ2V0VGltZXN0YW1wJykuYW5kQ2FsbEZha2UgLT4gZGF0ZVxuICAgIGV4cGVjdChwaWdtZW50cy5zZXJpYWxpemUoKSkudG9FcXVhbCh7XG4gICAgICBwcm9qZWN0OlxuICAgICAgICBkZXNlcmlhbGl6ZXI6ICdDb2xvclByb2plY3QnXG4gICAgICAgIHRpbWVzdGFtcDogZGF0ZVxuICAgICAgICB2ZXJzaW9uOiBTRVJJQUxJWkVfVkVSU0lPTlxuICAgICAgICBtYXJrZXJzVmVyc2lvbjogU0VSSUFMSVpFX01BUktFUlNfVkVSU0lPTlxuICAgICAgICBnbG9iYWxTb3VyY2VOYW1lczogWycqKi8qLnNhc3MnLCAnKiovKi5zdHlsJ11cbiAgICAgICAgZ2xvYmFsSWdub3JlZE5hbWVzOiBbXVxuICAgICAgICBidWZmZXJzOiB7fVxuICAgIH0pXG5cbiAgZGVzY3JpYmUgJ3doZW4gZGVhY3RpdmF0ZWQnLCAtPlxuICAgIFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIGNvbG9yQnVmZmVyXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAndGV4dC1lZGl0b3Igb3BlbmVkJywgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignZm91ci12YXJpYWJsZXMuc3R5bCcpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZSlcbiAgICAgICAgICBjb2xvckJ1ZmZlciA9IHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuXG4gICAgICB3YWl0c0ZvciAncGlnbWVudHMgbWFya2VycyBhcHBlbmRlZCB0byB0aGUgRE9NJywgLT5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdwaWdtZW50cy1tYXJrZXJzJylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBzcHlPbihwcm9qZWN0LCAnZGVzdHJveScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24oY29sb3JCdWZmZXIsICdkZXN0cm95JykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIHBpZ21lbnRzLmRlYWN0aXZhdGUoKVxuXG4gICAgaXQgJ2Rlc3Ryb3lzIHRoZSBwaWdtZW50cyBwcm9qZWN0JywgLT5cbiAgICAgIGV4cGVjdChwcm9qZWN0LmRlc3Ryb3kpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgJ2Rlc3Ryb3lzIGFsbCB0aGUgY29sb3IgYnVmZmVycyB0aGF0IHdlcmUgY3JlYXRlZCcsIC0+XG4gICAgICBleHBlY3QocHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIGV4cGVjdChwcm9qZWN0LmNvbG9yQnVmZmVyc0J5RWRpdG9ySWQpLnRvQmVOdWxsKClcbiAgICAgIGV4cGVjdChjb2xvckJ1ZmZlci5kZXN0cm95KS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGl0ICdkZXN0cm95cyB0aGUgY29sb3IgYnVmZmVyIGVsZW1lbnQgdGhhdCB3ZXJlIGFkZGVkIHRvIHRoZSBET00nLCAtPlxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvcigncGlnbWVudHMtbWFya2VycycpKS5ub3QudG9FeGlzdCgpXG5cbiAgZGVzY3JpYmUgJ3BpZ21lbnRzOnByb2plY3Qtc2V0dGluZ3MnLCAtPlxuICAgIGl0ZW0gPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAncGlnbWVudHM6cHJvamVjdC1zZXR0aW5ncycpXG5cbiAgICAgIHdhaXRzRm9yICdhY3RpdmUgcGFuZSBpdGVtJywgLT5cbiAgICAgICAgaXRlbSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICAgICAgaXRlbT9cblxuICAgIGl0ICdvcGVucyBhIHNldHRpbmdzIHZpZXcgaW4gdGhlIGFjdGl2ZSBwYW5lJywgLT5cbiAgICAgIGl0ZW0ubWF0Y2hlcygncGlnbWVudHMtY29sb3ItcHJvamVjdCcpXG5cbiAgIyMgICAgICAgIyMjICAgICMjIyMjIyMjICAjIyMjXG4gICMjICAgICAgIyMgIyMgICAjIyAgICAgIyMgICMjXG4gICMjICAgICAjIyAgICMjICAjIyAgICAgIyMgICMjXG4gICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgICMjXG4gICMjICAgICMjIyMjIyMjIyAjIyAgICAgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAgIyMjI1xuXG4gIGRlc2NyaWJlICdBUEkgcHJvdmlkZXInLCAtPlxuICAgIFtzZXJ2aWNlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIGJ1ZmZlcl0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ3RleHQtZWRpdG9yIG9wZW5lZCcsIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ2ZvdXItdmFyaWFibGVzLnN0eWwnKS50aGVuIChlKSAtPlxuICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGUpXG4gICAgICAgICAgYnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgIHJ1bnMgLT4gc2VydmljZSA9IHBpZ21lbnRzLnByb3ZpZGVBUEkoKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICdwcm9qZWN0IGluaXRpYWxpemVkJywgLT4gcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgIGl0ICdyZXR1cm5zIGFuIG9iamVjdCBjb25mb3JtaW5nIHRvIHRoZSBBUEknLCAtPlxuICAgICAgZXhwZWN0KHNlcnZpY2UgaW5zdGFuY2VvZiBQaWdtZW50c0FQSSkudG9CZVRydXRoeSgpXG5cbiAgICAgIGV4cGVjdChzZXJ2aWNlLmdldFByb2plY3QoKSkudG9CZShwcm9qZWN0KVxuXG4gICAgICBleHBlY3Qoc2VydmljZS5nZXRQYWxldHRlKCkpLnRvRXF1YWwocHJvamVjdC5nZXRQYWxldHRlKCkpXG4gICAgICBleHBlY3Qoc2VydmljZS5nZXRQYWxldHRlKCkpLm5vdC50b0JlKHByb2plY3QuZ2V0UGFsZXR0ZSgpKVxuXG4gICAgICBleHBlY3Qoc2VydmljZS5nZXRWYXJpYWJsZXMoKSkudG9FcXVhbChwcm9qZWN0LmdldFZhcmlhYmxlcygpKVxuICAgICAgZXhwZWN0KHNlcnZpY2UuZ2V0Q29sb3JWYXJpYWJsZXMoKSkudG9FcXVhbChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkpXG5cbiAgICBkZXNjcmliZSAnOjpvYnNlcnZlQ29sb3JCdWZmZXJzJywgLT5cbiAgICAgIFtzcHldID0gW11cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLWNyZWF0ZS1jb2xvci1idWZmZXInKVxuICAgICAgICBzZXJ2aWNlLm9ic2VydmVDb2xvckJ1ZmZlcnMoc3B5KVxuXG4gICAgICBpdCAnY2FsbHMgdGhlIGNhbGxiYWNrIGZvciBldmVyeSBleGlzdGluZyBjb2xvciBidWZmZXInLCAtPlxuICAgICAgICBleHBlY3Qoc3B5KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KHNweS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgaXQgJ2NhbGxzIHRoZSBjYWxsYmFjayBvbiBldmVyeSBuZXcgYnVmZmVyIGNyZWF0aW9uJywgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlICBsYWJlbDogJ3RleHQtZWRpdG9yIG9wZW5lZCcsIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignYnV0dG9ucy5zdHlsJylcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KHNweS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAjIyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgICAgICMjIyMjIyMgICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICMjICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgICMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAgIyMgICMjIyMjI1xuXG4gIGRlc2NyaWJlICdjb2xvciBleHByZXNzaW9uIGNvbnN1bWVyJywgLT5cbiAgICBbY29sb3JQcm92aWRlciwgY29uc3VtZXJEaXNwb3NhYmxlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIGNvbG9yQnVmZmVyLCBjb2xvckJ1ZmZlckVsZW1lbnQsIG90aGVyQ29uc3VtZXJEaXNwb3NhYmxlXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JQcm92aWRlciA9XG4gICAgICAgIG5hbWU6ICd0b2RvJ1xuICAgICAgICByZWdleHBTdHJpbmc6ICdUT0RPJ1xuICAgICAgICBzY29wZXM6IFsnKiddXG4gICAgICAgIHByaW9yaXR5OiAwXG4gICAgICAgIGhhbmRsZTogKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICAgICAgICAgIEByZWQgPSAyNTVcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgY29uc3VtZXJEaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgIG90aGVyQ29uc3VtZXJEaXNwb3NhYmxlPy5kaXNwb3NlKClcblxuICAgIGRlc2NyaWJlICd3aGVuIGNvbnN1bWVkIGJlZm9yZSBvcGVuaW5nIGEgdGV4dCBlZGl0b3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUgPSBwaWdtZW50cy5jb25zdW1lQ29sb3JFeHByZXNzaW9ucyhjb2xvclByb3ZpZGVyKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ3RleHQtZWRpdG9yIG9wZW5lZCcsIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignY29sb3ItY29uc3VtZXItc2FtcGxlLnR4dCcpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgICBlZGl0b3IgPSBlXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGUpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlciA9IHByb2plY3QuY29sb3JCdWZmZXJGb3JFZGl0b3IoZWRpdG9yKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ2NvbG9yIGJ1ZmZlciBpbml0aWFsaXplZCcsIC0+XG4gICAgICAgICAgY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ2NvbG9yIGJ1ZmZlciB2YXJpYWJsZXMgYXZhaWxhYmxlJywgLT5cbiAgICAgICAgICBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICBpdCAncGFyc2VzIHRoZSBuZXcgZXhwcmVzc2lvbiBhbmQgcmVuZGVycyBhIGNvbG9yJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICBpdCAncmV0dXJucyBhIERpc3Bvc2FibGUgaW5zdGFuY2UnLCAtPlxuICAgICAgICBleHBlY3QoY29uc3VtZXJEaXNwb3NhYmxlIGluc3RhbmNlb2YgRGlzcG9zYWJsZSkudG9CZVRydXRoeSgpXG5cbiAgICAgIGRlc2NyaWJlICd0aGUgcmV0dXJuZWQgZGlzcG9zYWJsZScsIC0+XG4gICAgICAgIGl0ICdyZW1vdmVzIHRoZSBwcm92aWRlZCBleHByZXNzaW9uIGZyb20gdGhlIHJlZ2lzdHJ5JywgLT5cbiAgICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvckV4cHJlc3Npb25zUmVnaXN0cnkoKS5nZXRFeHByZXNzaW9uKCd0b2RvJykpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgICAgIGl0ICd0cmlnZ2VycyBhbiB1cGRhdGUgaW4gdGhlIG9wZW5lZCBlZGl0b3JzJywgLT5cbiAgICAgICAgICB1cGRhdGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzJylcblxuICAgICAgICAgIGNvbG9yQnVmZmVyLm9uRGlkVXBkYXRlQ29sb3JNYXJrZXJzKHVwZGF0ZVNweSlcbiAgICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgICAgICAgICB3YWl0c0ZvciAnZGlkLXVwZGF0ZS1jb2xvci1tYXJrZXJzIGV2ZW50IGRpc3BhdGNoZWQnLCAtPlxuICAgICAgICAgICAgdXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICAgIHJ1bnMgLT4gZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gY29uc3VtZWQgYWZ0ZXIgb3BlbmluZyBhIHRleHQgZWRpdG9yJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAndGV4dC1lZGl0b3Igb3BlbmVkJywgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdjb2xvci1jb25zdW1lci1zYW1wbGUudHh0JykudGhlbiAoZSkgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZSlcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAnY29sb3IgYnVmZmVyIGluaXRpYWxpemVkJywgLT5cbiAgICAgICAgICBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIGxhYmVsOiAnY29sb3IgYnVmZmVyIHZhcmlhYmxlcyBhdmFpbGFibGUnLCAtPlxuICAgICAgICAgIGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgIGl0ICd0cmlnZ2VycyBhbiB1cGRhdGUgaW4gdGhlIG9wZW5lZCBlZGl0b3JzJywgLT5cbiAgICAgICAgdXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycycpXG5cbiAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUgPSBwaWdtZW50cy5jb25zdW1lQ29sb3JFeHByZXNzaW9ucyhjb2xvclByb3ZpZGVyKVxuXG4gICAgICAgIHdhaXRzRm9yICdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMgZXZlbnQgZGlzcGF0Y2hlZCcsIC0+XG4gICAgICAgICAgdXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VycygpLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICAgIHdhaXRzRm9yICdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMgZXZlbnQgZGlzcGF0Y2hlZCcsIC0+XG4gICAgICAgICAgdXBkYXRlU3B5LmNhbGxDb3VudCA+IDFcblxuICAgICAgICBydW5zIC0+IGV4cGVjdChjb2xvckJ1ZmZlci5nZXRDb2xvck1hcmtlcnMoKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gYW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgaXMgcGFzc2VkJywgLT5cbiAgICAgICAgaXQgJ3RyaWdnZXJzIGFuIHVwZGF0ZSBpbiB0aGUgb3BlbmVkIGVkaXRvcnMnLCAtPlxuICAgICAgICAgIHVwZGF0ZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMnKVxuXG4gICAgICAgICAgY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnModXBkYXRlU3B5KVxuICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVDb2xvckV4cHJlc3Npb25zKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb25zOiBbY29sb3JQcm92aWRlcl1cbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgd2FpdHNGb3IgJ2RpZC11cGRhdGUtY29sb3ItbWFya2VycyBldmVudCBkaXNwYXRjaGVkJywgLT5cbiAgICAgICAgICAgIHVwZGF0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDEpXG5cbiAgICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgICAgIHdhaXRzRm9yICdkaWQtdXBkYXRlLWNvbG9yLW1hcmtlcnMgZXZlbnQgZGlzcGF0Y2hlZCcsIC0+XG4gICAgICAgICAgICB1cGRhdGVTcHkuY2FsbENvdW50ID4gMVxuXG4gICAgICAgICAgcnVucyAtPiBleHBlY3QoY29sb3JCdWZmZXIuZ2V0Q29sb3JNYXJrZXJzKCkubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZXhwcmVzc2lvbiBtYXRjaGVzIGEgdmFyaWFibGUgdmFsdWUnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgbGFiZWw6ICdwcm9qZWN0IGluaXRpYWxpemVkJywgLT5cbiAgICAgICAgICBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAnZGV0ZWN0cyB0aGUgbmV3IHZhcmlhYmxlIGFzIGEgY29sb3IgdmFyaWFibGUnLCAtPlxuICAgICAgICB2YXJpYWJsZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLXZhcmlhYmxlcycpXG5cbiAgICAgICAgcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyh2YXJpYWJsZVNweSlcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgWycqKi8qLnR4dCddXG5cbiAgICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkJywgLT4gdmFyaWFibGVTcHkuY2FsbENvdW50ID4gMVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlID0gcGlnbWVudHMuY29uc3VtZUNvbG9yRXhwcmVzc2lvbnMoY29sb3JQcm92aWRlcilcblxuICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPiB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDUpXG5cbiAgICAgIGRlc2NyaWJlICdhbmQgdGhlcmUgd2FzIGFuIGV4cHJlc3Npb24gdGhhdCBjb3VsZCBub3QgYmUgcmVzb2x2ZWQgYmVmb3JlJywgLT5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGludmFsaWQgY29sb3IgYXMgYSBub3cgdmFsaWQgY29sb3InLCAtPlxuICAgICAgICAgIHZhcmlhYmxlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUtdmFyaWFibGVzJylcblxuICAgICAgICAgIHByb2plY3Qub25EaWRVcGRhdGVWYXJpYWJsZXModmFyaWFibGVTcHkpXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgWycqKi8qLnR4dCddXG5cbiAgICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPiB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAxXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBvdGhlckNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVDb2xvckV4cHJlc3Npb25zXG4gICAgICAgICAgICAgIG5hbWU6ICdiYXInXG4gICAgICAgICAgICAgIHJlZ2V4cFN0cmluZzogJ2JhelxcXFxzKyhcXFxcdyspJ1xuICAgICAgICAgICAgICBoYW5kbGU6IChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgICAgICAgICAgICAgICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gICAgICAgICAgICAgICAgY29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihleHByKVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChjb2xvcilcblxuICAgICAgICAgICAgICAgIEByZ2JhID0gY29sb3IucmdiYVxuXG4gICAgICAgICAgICBjb25zdW1lckRpc3Bvc2FibGUgPSBwaWdtZW50cy5jb25zdW1lQ29sb3JFeHByZXNzaW9ucyhjb2xvclByb3ZpZGVyKVxuXG4gICAgICAgICAgICB3YWl0c0ZvciAndmFyaWFibGVzIHVwZGF0ZWQnLCAtPiB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAyXG5cbiAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlQnlOYW1lKCdiYXInKS5jb2xvci5pbnZhbGlkKS50b0JlRmFsc3koKVxuXG4gICAgICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkJywgLT4gdmFyaWFibGVTcHkuY2FsbENvdW50ID4gM1xuXG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg1KVxuICAgICAgICAgICAgICBleHBlY3QocHJvamVjdC5nZXRWYXJpYWJsZUJ5TmFtZSgnYmFyJykuY29sb3IuaW52YWxpZCkudG9CZVRydXRoeSgpXG5cbiAgIyMgICAgIyMgICAgICMjICAgICMjIyAgICAjIyMjIyMjIyAgICMjIyMjI1xuICAjIyAgICAjIyAgICAgIyMgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgICMjICAgIyMgICMjICAgICAjIyAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICAjIyAgICMjICAjIyMjIyMjIyMgIyMgICAjIyAgICAgICAgICMjXG4gICMjICAgICAgIyMgIyMgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICMjICAgICAgICMjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyMjIyNcblxuICBkZXNjcmliZSAndmFyaWFibGUgZXhwcmVzc2lvbiBjb25zdW1lcicsIC0+XG4gICAgW3ZhcmlhYmxlUHJvdmlkZXIsIGNvbnN1bWVyRGlzcG9zYWJsZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCBjb2xvckJ1ZmZlciwgY29sb3JCdWZmZXJFbGVtZW50XSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB2YXJpYWJsZVByb3ZpZGVyID1cbiAgICAgICAgbmFtZTogJ3RvZG8nXG4gICAgICAgIHJlZ2V4cFN0cmluZzogJyhUT0RPKTpcXFxccyooW147XFxcXG5dKyknXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSBsYWJlbDogJ3Byb2plY3QgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgICBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgYWZ0ZXJFYWNoIC0+IGNvbnN1bWVyRGlzcG9zYWJsZT8uZGlzcG9zZSgpXG5cbiAgICBpdCAndXBkYXRlcyB0aGUgcHJvamVjdCB2YXJpYWJsZXMgd2hlbiBjb25zdW1lZCcsIC0+XG4gICAgICB2YXJpYWJsZVNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtdXBkYXRlLXZhcmlhYmxlcycpXG5cbiAgICAgIHByb2plY3Qub25EaWRVcGRhdGVWYXJpYWJsZXModmFyaWFibGVTcHkpXG5cbiAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbJyoqLyoudHh0J11cblxuICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkJywgLT4gdmFyaWFibGVTcHkuY2FsbENvdW50ID4gMVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVWYXJpYWJsZUV4cHJlc3Npb25zKHZhcmlhYmxlUHJvdmlkZXIpXG5cbiAgICAgIHdhaXRzRm9yICd2YXJpYWJsZXMgdXBkYXRlZCBhZnRlciBzZXJ2aWNlIGNvbnN1bWVkJywgLT5cbiAgICAgICAgdmFyaWFibGVTcHkuY2FsbENvdW50ID4gMlxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg3KVxuICAgICAgICBleHBlY3QocHJvamVjdC5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkIGFmdGVyIHNlcnZpY2UgZGlzcG9zZWQnLCAtPlxuICAgICAgICB2YXJpYWJsZVNweS5jYWxsQ291bnQgPiAzXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICBkZXNjcmliZSAnd2hlbiBhbiBhcnJheSBvZiBleHByZXNzaW9ucyBpcyBwYXNzZWQnLCAtPlxuICAgICAgaXQgJ3VwZGF0ZXMgdGhlIHByb2plY3QgdmFyaWFibGVzIHdoZW4gY29uc3VtZWQnLCAtPlxuICAgICAgICBwcmV2aW91c1ZhcmlhYmxlc0NvdW50ID0gbnVsbFxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgWycqKi8qLnR4dCddXG5cbiAgICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyBpbml0aWFsaXplZCcsIC0+XG4gICAgICAgICAgcHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGggaXMgNDVcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcHJldmlvdXNWYXJpYWJsZXNDb3VudCA9IHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoXG5cbiAgICAgICAgd2FpdHNGb3IgJ3ZhcmlhYmxlcyB1cGRhdGVkJywgLT5cbiAgICAgICAgICBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCBpcyA2XG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgICBwcmV2aW91c1ZhcmlhYmxlc0NvdW50ID0gcHJvamVjdC5nZXRWYXJpYWJsZXMoKS5sZW5ndGhcblxuICAgICAgICAgIGNvbnN1bWVyRGlzcG9zYWJsZSA9IHBpZ21lbnRzLmNvbnN1bWVWYXJpYWJsZUV4cHJlc3Npb25zKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb25zOiBbdmFyaWFibGVQcm92aWRlcl1cbiAgICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yICd2YXJpYWJsZXMgdXBkYXRlZCBhZnRlciBzZXJ2aWNlIGNvbnN1bWVkJywgLT5cbiAgICAgICAgICBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCBpc250IHByZXZpb3VzVmFyaWFibGVzQ291bnRcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDcpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIHByZXZpb3VzVmFyaWFibGVzQ291bnQgPSBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aFxuXG4gICAgICAgICAgY29uc3VtZXJEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gICAgICAgIHdhaXRzRm9yICd2YXJpYWJsZXMgdXBkYXRlZCBhZnRlciBzZXJ2aWNlIGRpc3Bvc2VkJywgLT5cbiAgICAgICAgICBwcm9qZWN0LmdldFZhcmlhYmxlcygpLmxlbmd0aCBpc250IHByZXZpb3VzVmFyaWFibGVzQ291bnRcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0VmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDYpXG4gICAgICAgICAgZXhwZWN0KHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoNClcbiJdfQ==

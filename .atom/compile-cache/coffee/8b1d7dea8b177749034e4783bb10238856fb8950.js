(function() {
  var ColorBufferElement, mousedown, path, sleep;

  path = require('path');

  require('./helpers/spec-helper');

  mousedown = require('./helpers/events').mousedown;

  ColorBufferElement = require('../lib/color-buffer-element');

  sleep = function(duration) {
    var t;
    t = new Date();
    return waitsFor(function() {
      return new Date() - t > duration;
    });
  };

  describe('ColorBufferElement', function() {
    var colorBuffer, colorBufferElement, editBuffer, editor, editorElement, getEditorDecorations, isVisible, jasmineContent, jsonFixture, pigments, project, ref;
    ref = [], editor = ref[0], editorElement = ref[1], colorBuffer = ref[2], pigments = ref[3], project = ref[4], colorBufferElement = ref[5], jasmineContent = ref[6];
    isVisible = function(decoration) {
      return !/-in-selection/.test(decoration.properties["class"]);
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
    jsonFixture = function(fixture, data) {
      var json, jsonPath;
      jsonPath = path.resolve(__dirname, 'fixtures', fixture);
      json = fs.readFileSync(jsonPath).toString();
      json = json.replace(/#\{(\w+)\}/g, function(m, w) {
        return data[w];
      });
      return JSON.parse(json);
    };
    getEditorDecorations = function(type) {
      return editor.getDecorations().filter(function(d) {
        return d.properties["class"].startsWith('pigments-native-background');
      });
    };
    beforeEach(function() {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      jasmineContent = document.body.querySelector('#jasmine-content');
      jasmineContent.appendChild(workspaceElement);
      atom.config.set('editor.softWrap', true);
      atom.config.set('editor.softWrapAtPreferredLineLength', true);
      atom.config.set('editor.preferredLineLength', 40);
      atom.config.set('pigments.delayBeforeScan', 0);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      waitsForPromise(function() {
        return atom.workspace.open('four-variables.styl').then(function(o) {
          editor = o;
          return editorElement = atom.views.getView(editor);
        });
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
    });
    afterEach(function() {
      return colorBuffer != null ? colorBuffer.destroy() : void 0;
    });
    return describe('when an editor is opened', function() {
      beforeEach(function() {
        colorBuffer = project.colorBufferForEditor(editor);
        colorBufferElement = atom.views.getView(colorBuffer);
        return colorBufferElement.attach();
      });
      it('is associated to the ColorBuffer model', function() {
        expect(colorBufferElement).toBeDefined();
        return expect(colorBufferElement.getModel()).toBe(colorBuffer);
      });
      it('attaches itself in the target text editor element', function() {
        expect(colorBufferElement.parentNode).toExist();
        return expect(editorElement.querySelector('.lines pigments-markers')).toExist();
      });
      describe('when the color buffer is initialized', function() {
        beforeEach(function() {
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        it('creates markers views for every visible buffer marker', function() {
          return expect(getEditorDecorations('native-background').length).toEqual(3);
        });
        describe('when the project variables are initialized', function() {
          return it('creates markers for the new valid colors', function() {
            waitsForPromise(function() {
              return colorBuffer.variablesAvailable();
            });
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(4);
            });
          });
        });
        describe('when a selection intersects a marker range', function() {
          beforeEach(function() {
            return spyOn(colorBufferElement, 'updateSelections').andCallThrough();
          });
          describe('after the markers views was created', function() {
            beforeEach(function() {
              waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
              runs(function() {
                return editor.setSelectedBufferRange([[2, 12], [2, 14]]);
              });
              return waitsFor(function() {
                return colorBufferElement.updateSelections.callCount > 0;
              });
            });
            return it('hides the intersected marker', function() {
              var decorations;
              decorations = getEditorDecorations('native-background');
              expect(isVisible(decorations[0])).toBeTruthy();
              expect(isVisible(decorations[1])).toBeTruthy();
              expect(isVisible(decorations[2])).toBeTruthy();
              return expect(isVisible(decorations[3])).toBeFalsy();
            });
          });
          return describe('before all the markers views was created', function() {
            beforeEach(function() {
              runs(function() {
                return editor.setSelectedBufferRange([[0, 0], [2, 14]]);
              });
              return waitsFor(function() {
                return colorBufferElement.updateSelections.callCount > 0;
              });
            });
            it('hides the existing markers', function() {
              var decorations;
              decorations = getEditorDecorations('native-background');
              expect(isVisible(decorations[0])).toBeFalsy();
              expect(isVisible(decorations[1])).toBeTruthy();
              return expect(isVisible(decorations[2])).toBeTruthy();
            });
            return describe('and the markers are updated', function() {
              beforeEach(function() {
                waitsForPromise('colors available', function() {
                  return colorBuffer.variablesAvailable();
                });
                return waitsFor('last marker visible', function() {
                  var decorations;
                  decorations = getEditorDecorations('native-background');
                  return isVisible(decorations[3]);
                });
              });
              return it('hides the created markers', function() {
                var decorations;
                decorations = getEditorDecorations('native-background');
                expect(isVisible(decorations[0])).toBeFalsy();
                expect(isVisible(decorations[1])).toBeTruthy();
                expect(isVisible(decorations[2])).toBeTruthy();
                return expect(isVisible(decorations[3])).toBeTruthy();
              });
            });
          });
        });
        describe('when some markers are destroyed', function() {
          var spy;
          spy = [][0];
          beforeEach(function() {
            var el, i, len, ref1;
            ref1 = colorBufferElement.usedMarkers;
            for (i = 0, len = ref1.length; i < len; i++) {
              el = ref1[i];
              spyOn(el, 'release').andCallThrough();
            }
            spy = jasmine.createSpy('did-update');
            colorBufferElement.onDidUpdate(spy);
            editBuffer('', {
              start: [4, 0],
              end: [8, 0]
            });
            return waitsFor(function() {
              return spy.callCount > 0;
            });
          });
          return it('releases the unused markers', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(2);
          });
        });
        describe('when the current pane is splitted to the right', function() {
          beforeEach(function() {
            var version;
            version = parseFloat(atom.getVersion().split('.').slice(1, 2).join('.'));
            if (version > 5) {
              atom.commands.dispatch(editorElement, 'pane:split-right-and-copy-active-item');
            } else {
              atom.commands.dispatch(editorElement, 'pane:split-right');
            }
            waitsFor('text editor', function() {
              return editor = atom.workspace.getTextEditors()[1];
            });
            waitsFor('color buffer element', function() {
              return colorBufferElement = atom.views.getView(project.colorBufferForEditor(editor));
            });
            return waitsFor('color buffer element markers', function() {
              return getEditorDecorations('native-background').length;
            });
          });
          return it('should keep all the buffer elements attached', function() {
            var editors;
            editors = atom.workspace.getTextEditors();
            return editors.forEach(function(editor) {
              editorElement = atom.views.getView(editor);
              colorBufferElement = editorElement.querySelector('pigments-markers');
              expect(colorBufferElement).toExist();
              return expect(getEditorDecorations('native-background').length).toEqual(4);
            });
          });
        });
        return describe('when the marker type is set to gutter', function() {
          var gutter;
          gutter = [][0];
          beforeEach(function() {
            waitsForPromise(function() {
              return colorBuffer.initialize();
            });
            return runs(function() {
              atom.config.set('pigments.markerType', 'gutter');
              return gutter = editorElement.querySelector('[gutter-name="pigments-gutter"]');
            });
          });
          it('removes the markers', function() {
            return expect(colorBufferElement.querySelectorAll('pigments-color-marker').length).toEqual(0);
          });
          it('adds a custom gutter to the text editor', function() {
            return expect(gutter).toExist();
          });
          it('sets the size of the gutter based on the number of markers in the same row', function() {
            return expect(gutter.style.minWidth).toEqual('14px');
          });
          it('adds a gutter decoration for each color marker', function() {
            var decorations;
            decorations = editor.getDecorations().filter(function(d) {
              return d.properties.type === 'gutter';
            });
            return expect(decorations.length).toEqual(3);
          });
          describe('when the variables become available', function() {
            beforeEach(function() {
              return waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
            });
            it('creates decorations for the new valid colors', function() {
              var decorations;
              decorations = editor.getDecorations().filter(function(d) {
                return d.properties.type === 'gutter';
              });
              return expect(decorations.length).toEqual(4);
            });
            return describe('when many markers are added on the same line', function() {
              beforeEach(function() {
                var updateSpy;
                updateSpy = jasmine.createSpy('did-update');
                colorBufferElement.onDidUpdate(updateSpy);
                editor.moveToBottom();
                editBuffer('\nlist = #123456, #987654, #abcdef\n');
                return waitsFor(function() {
                  return updateSpy.callCount > 0;
                });
              });
              it('adds the new decorations to the gutter', function() {
                var decorations;
                decorations = editor.getDecorations().filter(function(d) {
                  return d.properties.type === 'gutter';
                });
                return expect(decorations.length).toEqual(7);
              });
              it('sets the size of the gutter based on the number of markers in the same row', function() {
                return expect(gutter.style.minWidth).toEqual('42px');
              });
              return describe('clicking on a gutter decoration', function() {
                beforeEach(function() {
                  var decoration;
                  project.colorPickerAPI = {
                    open: jasmine.createSpy('color-picker.open')
                  };
                  decoration = editorElement.querySelector('.pigments-gutter-marker span');
                  return mousedown(decoration);
                });
                it('selects the text in the editor', function() {
                  return expect(editor.getSelectedScreenRange()).toEqual([[0, 13], [0, 17]]);
                });
                return it('opens the color picker', function() {
                  return expect(project.colorPickerAPI.open).toHaveBeenCalled();
                });
              });
            });
          });
          describe('when the marker is changed again', function() {
            beforeEach(function() {
              return atom.config.set('pigments.markerType', 'native-background');
            });
            it('removes the gutter', function() {
              return expect(editorElement.querySelector('[gutter-name="pigments-gutter"]')).not.toExist();
            });
            return it('recreates the markers', function() {
              return expect(getEditorDecorations('native-background').length).toEqual(3);
            });
          });
          return describe('when a new buffer is opened', function() {
            beforeEach(function() {
              waitsForPromise(function() {
                return atom.workspace.open('project/styles/variables.styl').then(function(e) {
                  editor = e;
                  editorElement = atom.views.getView(editor);
                  colorBuffer = project.colorBufferForEditor(editor);
                  return colorBufferElement = atom.views.getView(colorBuffer);
                });
              });
              waitsForPromise(function() {
                return colorBuffer.initialize();
              });
              waitsForPromise(function() {
                return colorBuffer.variablesAvailable();
              });
              return runs(function() {
                return gutter = editorElement.querySelector('[gutter-name="pigments-gutter"]');
              });
            });
            return it('creates the decorations in the new buffer gutter', function() {
              var decorations;
              decorations = editor.getDecorations().filter(function(d) {
                return d.properties.type === 'gutter';
              });
              return expect(decorations.length).toEqual(10);
            });
          });
        });
      });
      describe('when the editor is moved to another pane', function() {
        var newPane, pane, ref1;
        ref1 = [], pane = ref1[0], newPane = ref1[1];
        beforeEach(function() {
          pane = atom.workspace.getActivePane();
          newPane = pane.splitDown({
            copyActiveItem: false
          });
          colorBuffer = project.colorBufferForEditor(editor);
          colorBufferElement = atom.views.getView(colorBuffer);
          pane.moveItemToPane(editor, newPane, 0);
          return waitsFor(function() {
            return getEditorDecorations('native-background').length;
          });
        });
        return it('moves the editor with the buffer to the new pane', function() {
          return expect(getEditorDecorations('native-background').length).toEqual(3);
        });
      });
      describe('when pigments.supportedFiletypes settings is defined', function() {
        var loadBuffer;
        loadBuffer = function(filePath) {
          waitsForPromise(function() {
            return atom.workspace.open(filePath).then(function(o) {
              editor = o;
              editorElement = atom.views.getView(editor);
              colorBuffer = project.colorBufferForEditor(editor);
              colorBufferElement = atom.views.getView(colorBuffer);
              return colorBufferElement.attach();
            });
          });
          waitsForPromise(function() {
            return colorBuffer.initialize();
          });
          return waitsForPromise(function() {
            return colorBuffer.variablesAvailable();
          });
        };
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          return waitsForPromise(function() {
            return atom.packages.activatePackage('language-less');
          });
        });
        describe('with the default wildcard', function() {
          beforeEach(function() {
            return atom.config.set('pigments.supportedFiletypes', ['*']);
          });
          return it('supports every filetype', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(20);
            });
          });
        });
        describe('with a filetype', function() {
          beforeEach(function() {
            return atom.config.set('pigments.supportedFiletypes', ['coffee']);
          });
          return it('supports the specified file type', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(0);
            });
          });
        });
        return describe('with many filetypes', function() {
          beforeEach(function() {
            atom.config.set('pigments.supportedFiletypes', ['coffee']);
            return project.setSupportedFiletypes(['less']);
          });
          it('supports the specified file types', function() {
            loadBuffer('scope-filter.coffee');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(2);
            });
            loadBuffer('project/vendor/css/variables.less');
            runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(20);
            });
            loadBuffer('four-variables.styl');
            return runs(function() {
              return expect(getEditorDecorations('native-background').length).toEqual(0);
            });
          });
          return describe('with global file types ignored', function() {
            beforeEach(function() {
              atom.config.set('pigments.supportedFiletypes', ['coffee']);
              project.setIgnoreGlobalSupportedFiletypes(true);
              return project.setSupportedFiletypes(['less']);
            });
            return it('supports the specified file types', function() {
              loadBuffer('scope-filter.coffee');
              runs(function() {
                return expect(getEditorDecorations('native-background').length).toEqual(0);
              });
              loadBuffer('project/vendor/css/variables.less');
              runs(function() {
                return expect(getEditorDecorations('native-background').length).toEqual(20);
              });
              loadBuffer('four-variables.styl');
              return runs(function() {
                return expect(getEditorDecorations('native-background').length).toEqual(0);
              });
            });
          });
        });
      });
      return describe('when pigments.ignoredScopes settings is defined', function() {
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          waitsForPromise(function() {
            return atom.workspace.open('scope-filter.coffee').then(function(o) {
              editor = o;
              editorElement = atom.views.getView(editor);
              colorBuffer = project.colorBufferForEditor(editor);
              colorBufferElement = atom.views.getView(colorBuffer);
              return colorBufferElement.attach();
            });
          });
          return waitsForPromise(function() {
            return colorBuffer.initialize();
          });
        });
        describe('with one filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(1);
          });
        });
        describe('with two filters', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\.string', '\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(0);
          });
        });
        describe('with an invalid filter', function() {
          beforeEach(function() {
            return atom.config.set('pigments.ignoredScopes', ['\\']);
          });
          return it('ignores the filter', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(2);
          });
        });
        return describe('when the project ignoredScopes is defined', function() {
          beforeEach(function() {
            atom.config.set('pigments.ignoredScopes', ['\\.string']);
            return project.setIgnoredScopes(['\\.comment']);
          });
          return it('ignores the colors that matches the defined scopes', function() {
            return expect(getEditorDecorations('native-background').length).toEqual(0);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3ItYnVmZmVyLWVsZW1lbnQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxPQUFBLENBQVEsdUJBQVI7O0VBQ0MsWUFBYSxPQUFBLENBQVEsa0JBQVI7O0VBRWQsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLDZCQUFSOztFQUVyQixLQUFBLEdBQVEsU0FBQyxRQUFEO0FBQ04sUUFBQTtJQUFBLENBQUEsR0FBSSxJQUFJLElBQUosQ0FBQTtXQUNKLFFBQUEsQ0FBUyxTQUFBO2FBQUcsSUFBSSxJQUFKLENBQUEsQ0FBQSxHQUFhLENBQWIsR0FBaUI7SUFBcEIsQ0FBVDtFQUZNOztFQUlSLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO0FBQzdCLFFBQUE7SUFBQSxNQUE4RixFQUE5RixFQUFDLGVBQUQsRUFBUyxzQkFBVCxFQUF3QixvQkFBeEIsRUFBcUMsaUJBQXJDLEVBQStDLGdCQUEvQyxFQUF3RCwyQkFBeEQsRUFBNEU7SUFFNUUsU0FBQSxHQUFZLFNBQUMsVUFBRDthQUNWLENBQUksZUFBZSxDQUFDLElBQWhCLENBQXFCLFVBQVUsQ0FBQyxVQUFVLEVBQUMsS0FBRCxFQUExQztJQURNO0lBR1osVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDWCxVQUFBOztRQURrQixVQUFROztNQUMxQixJQUFHLHFCQUFIO1FBQ0UsSUFBRyxtQkFBSDtVQUNFLEtBQUEsR0FBUSxDQUFDLE9BQU8sQ0FBQyxLQUFULEVBQWdCLE9BQU8sQ0FBQyxHQUF4QixFQURWO1NBQUEsTUFBQTtVQUdFLEtBQUEsR0FBUSxDQUFDLE9BQU8sQ0FBQyxLQUFULEVBQWdCLE9BQU8sQ0FBQyxLQUF4QixFQUhWOztRQUtBLE1BQU0sQ0FB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LHdCQUFULEVBQW1DLFNBQUE7VUFDakMsVUFBQSxDQUFXLFNBQUE7bUJBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxDQUFDLElBQUQsQ0FBMUM7VUFEUyxDQUFYO2lCQUdBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO21CQUN2QixNQUFBLENBQU8sb0JBQUEsQ0FBcUIsbUJBQXJCLENBQXlDLENBQUMsTUFBakQsQ0FBd0QsQ0FBQyxPQUF6RCxDQUFpRSxDQUFqRTtVQUR1QixDQUF6QjtRQUppQyxDQUFuQztlQU9BLFFBQUEsQ0FBUywyQ0FBVCxFQUFzRCxTQUFBO1VBQ3BELFVBQUEsQ0FBVyxTQUFBO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxDQUFDLFdBQUQsQ0FBMUM7bUJBQ0EsT0FBTyxDQUFDLGdCQUFSLENBQXlCLENBQUMsWUFBRCxDQUF6QjtVQUZTLENBQVg7aUJBSUEsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUE7bUJBQ3ZELE1BQUEsQ0FBTyxvQkFBQSxDQUFxQixtQkFBckIsQ0FBeUMsQ0FBQyxNQUFqRCxDQUF3RCxDQUFDLE9BQXpELENBQWlFLENBQWpFO1VBRHVELENBQXpEO1FBTG9ELENBQXREO01BcEMwRCxDQUE1RDtJQWpUbUMsQ0FBckM7RUF6RDZCLENBQS9CO0FBVkEiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbnJlcXVpcmUgJy4vaGVscGVycy9zcGVjLWhlbHBlcidcbnttb3VzZWRvd259ID0gcmVxdWlyZSAnLi9oZWxwZXJzL2V2ZW50cydcblxuQ29sb3JCdWZmZXJFbGVtZW50ID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLWJ1ZmZlci1lbGVtZW50J1xuXG5zbGVlcCA9IChkdXJhdGlvbikgLT5cbiAgdCA9IG5ldyBEYXRlKClcbiAgd2FpdHNGb3IgLT4gbmV3IERhdGUoKSAtIHQgPiBkdXJhdGlvblxuXG5kZXNjcmliZSAnQ29sb3JCdWZmZXJFbGVtZW50JywgLT5cbiAgW2VkaXRvciwgZWRpdG9yRWxlbWVudCwgY29sb3JCdWZmZXIsIHBpZ21lbnRzLCBwcm9qZWN0LCBjb2xvckJ1ZmZlckVsZW1lbnQsIGphc21pbmVDb250ZW50XSA9IFtdXG5cbiAgaXNWaXNpYmxlID0gKGRlY29yYXRpb24pIC0+XG4gICAgbm90IC8taW4tc2VsZWN0aW9uLy50ZXN0IGRlY29yYXRpb24ucHJvcGVydGllcy5jbGFzc1xuXG4gIGVkaXRCdWZmZXIgPSAodGV4dCwgb3B0aW9ucz17fSkgLT5cbiAgICBpZiBvcHRpb25zLnN0YXJ0P1xuICAgICAgaWYgb3B0aW9ucy5lbmQ/XG4gICAgICAgIHJhbmdlID0gW29wdGlvbnMuc3RhcnQsIG9wdGlvbnMuZW5kXVxuICAgICAgZWxzZVxuICAgICAgICByYW5nZSA9IFtvcHRpb25zLnN0YXJ0LCBvcHRpb25zLnN0YXJ0XVxuXG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcblxuICAgIGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gICAgYWR2YW5jZUNsb2NrKDUwMCkgdW5sZXNzIG9wdGlvbnMubm9FdmVudFxuXG4gIGpzb25GaXh0dXJlID0gKGZpeHR1cmUsIGRhdGEpIC0+XG4gICAganNvblBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnZml4dHVyZXMnLCBmaXh0dXJlKVxuICAgIGpzb24gPSBmcy5yZWFkRmlsZVN5bmMoanNvblBhdGgpLnRvU3RyaW5nKClcbiAgICBqc29uID0ganNvbi5yZXBsYWNlIC8jXFx7KFxcdyspXFx9L2csIChtLHcpIC0+IGRhdGFbd11cblxuICAgIEpTT04ucGFyc2UoanNvbilcblxuICBnZXRFZGl0b3JEZWNvcmF0aW9ucyA9ICh0eXBlKSAtPlxuICAgIGVkaXRvci5nZXREZWNvcmF0aW9ucygpXG4gICAgLmZpbHRlcigoZCkgLT4gZC5wcm9wZXJ0aWVzLmNsYXNzLnN0YXJ0c1dpdGggJ3BpZ21lbnRzLW5hdGl2ZS1iYWNrZ3JvdW5kJylcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBqYXNtaW5lQ29udGVudCA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignI2phc21pbmUtY29udGVudCcpXG5cbiAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgYXRvbS5jb25maWcuc2V0ICdlZGl0b3Iuc29mdFdyYXAnLCB0cnVlXG4gICAgYXRvbS5jb25maWcuc2V0ICdlZGl0b3Iuc29mdFdyYXBBdFByZWZlcnJlZExpbmVMZW5ndGgnLCB0cnVlXG4gICAgYXRvbS5jb25maWcuc2V0ICdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDQwXG5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLmRlbGF5QmVmb3JlU2NhbicsIDBcbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgW1xuICAgICAgJyouc3R5bCdcbiAgICAgICcqLmxlc3MnXG4gICAgXVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdmb3VyLXZhcmlhYmxlcy5zdHlsJykudGhlbiAobykgLT5cbiAgICAgICAgZWRpdG9yID0gb1xuICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgncGlnbWVudHMnKS50aGVuIChwa2cpIC0+XG4gICAgICBwaWdtZW50cyA9IHBrZy5tYWluTW9kdWxlXG4gICAgICBwcm9qZWN0ID0gcGlnbWVudHMuZ2V0UHJvamVjdCgpXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgY29sb3JCdWZmZXI/LmRlc3Ryb3koKVxuXG4gIGRlc2NyaWJlICd3aGVuIGFuIGVkaXRvciBpcyBvcGVuZWQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG4gICAgICBjb2xvckJ1ZmZlckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoY29sb3JCdWZmZXIpXG4gICAgICBjb2xvckJ1ZmZlckVsZW1lbnQuYXR0YWNoKClcblxuICAgIGl0ICdpcyBhc3NvY2lhdGVkIHRvIHRoZSBDb2xvckJ1ZmZlciBtb2RlbCcsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXJFbGVtZW50KS50b0JlRGVmaW5lZCgpXG4gICAgICBleHBlY3QoY29sb3JCdWZmZXJFbGVtZW50LmdldE1vZGVsKCkpLnRvQmUoY29sb3JCdWZmZXIpXG5cbiAgICBpdCAnYXR0YWNoZXMgaXRzZWxmIGluIHRoZSB0YXJnZXQgdGV4dCBlZGl0b3IgZWxlbWVudCcsIC0+XG4gICAgICBleHBlY3QoY29sb3JCdWZmZXJFbGVtZW50LnBhcmVudE5vZGUpLnRvRXhpc3QoKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpbmVzIHBpZ21lbnRzLW1hcmtlcnMnKSkudG9FeGlzdCgpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgY29sb3IgYnVmZmVyIGlzIGluaXRpYWxpemVkJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKVxuXG4gICAgICBpdCAnY3JlYXRlcyBtYXJrZXJzIHZpZXdzIGZvciBldmVyeSB2aXNpYmxlIGJ1ZmZlciBtYXJrZXInLCAtPlxuICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDMpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBwcm9qZWN0IHZhcmlhYmxlcyBhcmUgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgICBpdCAnY3JlYXRlcyBtYXJrZXJzIGZvciB0aGUgbmV3IHZhbGlkIGNvbG9ycycsIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIHNlbGVjdGlvbiBpbnRlcnNlY3RzIGEgbWFya2VyIHJhbmdlJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNweU9uKGNvbG9yQnVmZmVyRWxlbWVudCwgJ3VwZGF0ZVNlbGVjdGlvbnMnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgZGVzY3JpYmUgJ2FmdGVyIHRoZSBtYXJrZXJzIHZpZXdzIHdhcyBjcmVhdGVkJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcbiAgICAgICAgICAgIHJ1bnMgLT4gZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UgW1syLDEyXSxbMiwgMTRdXVxuICAgICAgICAgICAgd2FpdHNGb3IgLT4gY29sb3JCdWZmZXJFbGVtZW50LnVwZGF0ZVNlbGVjdGlvbnMuY2FsbENvdW50ID4gMFxuXG4gICAgICAgICAgaXQgJ2hpZGVzIHRoZSBpbnRlcnNlY3RlZCBtYXJrZXInLCAtPlxuICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKVxuXG4gICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzBdKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzFdKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzJdKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzNdKSkudG9CZUZhbHN5KClcblxuICAgICAgICBkZXNjcmliZSAnYmVmb3JlIGFsbCB0aGUgbWFya2VycyB2aWV3cyB3YXMgY3JlYXRlZCcsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgcnVucyAtPiBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSBbWzAsMF0sWzIsIDE0XV1cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IGNvbG9yQnVmZmVyRWxlbWVudC51cGRhdGVTZWxlY3Rpb25zLmNhbGxDb3VudCA+IDBcblxuICAgICAgICAgIGl0ICdoaWRlcyB0aGUgZXhpc3RpbmcgbWFya2VycycsIC0+XG4gICAgICAgICAgICBkZWNvcmF0aW9ucyA9IGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpXG5cbiAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbMF0pKS50b0JlRmFsc3koKVxuICAgICAgICAgICAgZXhwZWN0KGlzVmlzaWJsZShkZWNvcmF0aW9uc1sxXSkpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgZXhwZWN0KGlzVmlzaWJsZShkZWNvcmF0aW9uc1syXSkpLnRvQmVUcnV0aHkoKVxuXG4gICAgICAgICAgZGVzY3JpYmUgJ2FuZCB0aGUgbWFya2VycyBhcmUgdXBkYXRlZCcsIC0+XG4gICAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAnY29sb3JzIGF2YWlsYWJsZScsIC0+XG4gICAgICAgICAgICAgICAgY29sb3JCdWZmZXIudmFyaWFibGVzQXZhaWxhYmxlKClcbiAgICAgICAgICAgICAgd2FpdHNGb3IgJ2xhc3QgbWFya2VyIHZpc2libGUnLCAtPlxuICAgICAgICAgICAgICAgIGRlY29yYXRpb25zID0gZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJylcbiAgICAgICAgICAgICAgICBpc1Zpc2libGUoZGVjb3JhdGlvbnNbM10pXG5cbiAgICAgICAgICAgIGl0ICdoaWRlcyB0aGUgY3JlYXRlZCBtYXJrZXJzJywgLT5cbiAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKVxuICAgICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzBdKSkudG9CZUZhbHN5KClcbiAgICAgICAgICAgICAgZXhwZWN0KGlzVmlzaWJsZShkZWNvcmF0aW9uc1sxXSkpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgICBleHBlY3QoaXNWaXNpYmxlKGRlY29yYXRpb25zWzJdKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgICAgIGV4cGVjdChpc1Zpc2libGUoZGVjb3JhdGlvbnNbM10pKS50b0JlVHJ1dGh5KClcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gc29tZSBtYXJrZXJzIGFyZSBkZXN0cm95ZWQnLCAtPlxuICAgICAgICBbc3B5XSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBmb3IgZWwgaW4gY29sb3JCdWZmZXJFbGVtZW50LnVzZWRNYXJrZXJzXG4gICAgICAgICAgICBzcHlPbihlbCwgJ3JlbGVhc2UnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgICBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLXVwZGF0ZScpXG4gICAgICAgICAgY29sb3JCdWZmZXJFbGVtZW50Lm9uRGlkVXBkYXRlKHNweSlcbiAgICAgICAgICBlZGl0QnVmZmVyICcnLCBzdGFydDogWzQsMF0sIGVuZDogWzgsMF1cbiAgICAgICAgICB3YWl0c0ZvciAtPiBzcHkuY2FsbENvdW50ID4gMFxuXG4gICAgICAgIGl0ICdyZWxlYXNlcyB0aGUgdW51c2VkIG1hcmtlcnMnLCAtPlxuICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGN1cnJlbnQgcGFuZSBpcyBzcGxpdHRlZCB0byB0aGUgcmlnaHQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgdmVyc2lvbiA9IHBhcnNlRmxvYXQoYXRvbS5nZXRWZXJzaW9uKCkuc3BsaXQoJy4nKS5zbGljZSgxLDIpLmpvaW4oJy4nKSlcbiAgICAgICAgICBpZiB2ZXJzaW9uID4gNVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAncGFuZTpzcGxpdC1yaWdodC1hbmQtY29weS1hY3RpdmUtaXRlbScpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAncGFuZTpzcGxpdC1yaWdodCcpXG5cbiAgICAgICAgICB3YWl0c0ZvciAndGV4dCBlZGl0b3InLCAtPlxuICAgICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVsxXVxuXG4gICAgICAgICAgd2FpdHNGb3IgJ2NvbG9yIGJ1ZmZlciBlbGVtZW50JywgLT5cbiAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcikpXG4gICAgICAgICAgd2FpdHNGb3IgJ2NvbG9yIGJ1ZmZlciBlbGVtZW50IG1hcmtlcnMnLCAtPlxuICAgICAgICAgICAgZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoXG5cbiAgICAgICAgaXQgJ3Nob3VsZCBrZWVwIGFsbCB0aGUgYnVmZmVyIGVsZW1lbnRzIGF0dGFjaGVkJywgLT5cbiAgICAgICAgICBlZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuXG4gICAgICAgICAgZWRpdG9ycy5mb3JFYWNoIChlZGl0b3IpIC0+XG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvcigncGlnbWVudHMtbWFya2VycycpXG4gICAgICAgICAgICBleHBlY3QoY29sb3JCdWZmZXJFbGVtZW50KS50b0V4aXN0KClcblxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiB0aGUgbWFya2VyIHR5cGUgaXMgc2V0IHRvIGd1dHRlcicsIC0+XG4gICAgICAgIFtndXR0ZXJdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMubWFya2VyVHlwZScsICdndXR0ZXInXG4gICAgICAgICAgICBndXR0ZXIgPSBlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tndXR0ZXItbmFtZT1cInBpZ21lbnRzLWd1dHRlclwiXScpXG5cbiAgICAgICAgaXQgJ3JlbW92ZXMgdGhlIG1hcmtlcnMnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xvckJ1ZmZlckVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgncGlnbWVudHMtY29sb3ItbWFya2VyJykubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICAgICAgaXQgJ2FkZHMgYSBjdXN0b20gZ3V0dGVyIHRvIHRoZSB0ZXh0IGVkaXRvcicsIC0+XG4gICAgICAgICAgZXhwZWN0KGd1dHRlcikudG9FeGlzdCgpXG5cbiAgICAgICAgaXQgJ3NldHMgdGhlIHNpemUgb2YgdGhlIGd1dHRlciBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIG1hcmtlcnMgaW4gdGhlIHNhbWUgcm93JywgLT5cbiAgICAgICAgICBleHBlY3QoZ3V0dGVyLnN0eWxlLm1pbldpZHRoKS50b0VxdWFsKCcxNHB4JylcblxuICAgICAgICBpdCAnYWRkcyBhIGd1dHRlciBkZWNvcmF0aW9uIGZvciBlYWNoIGNvbG9yIG1hcmtlcicsIC0+XG4gICAgICAgICAgZGVjb3JhdGlvbnMgPSBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoKS5maWx0ZXIgKGQpIC0+XG4gICAgICAgICAgICBkLnByb3BlcnRpZXMudHlwZSBpcyAnZ3V0dGVyJ1xuICAgICAgICAgIGV4cGVjdChkZWNvcmF0aW9ucy5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgICAgICBkZXNjcmliZSAnd2hlbiB0aGUgdmFyaWFibGVzIGJlY29tZSBhdmFpbGFibGUnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgICAgaXQgJ2NyZWF0ZXMgZGVjb3JhdGlvbnMgZm9yIHRoZSBuZXcgdmFsaWQgY29sb3JzJywgLT5cbiAgICAgICAgICAgIGRlY29yYXRpb25zID0gZWRpdG9yLmdldERlY29yYXRpb25zKCkuZmlsdGVyIChkKSAtPlxuICAgICAgICAgICAgICBkLnByb3BlcnRpZXMudHlwZSBpcyAnZ3V0dGVyJ1xuICAgICAgICAgICAgZXhwZWN0KGRlY29yYXRpb25zLmxlbmd0aCkudG9FcXVhbCg0KVxuXG4gICAgICAgICAgZGVzY3JpYmUgJ3doZW4gbWFueSBtYXJrZXJzIGFyZSBhZGRlZCBvbiB0aGUgc2FtZSBsaW5lJywgLT5cbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgdXBkYXRlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC11cGRhdGUnKVxuICAgICAgICAgICAgICBjb2xvckJ1ZmZlckVsZW1lbnQub25EaWRVcGRhdGUodXBkYXRlU3B5KVxuXG4gICAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgICBlZGl0QnVmZmVyICdcXG5saXN0ID0gIzEyMzQ1NiwgIzk4NzY1NCwgI2FiY2RlZlxcbidcbiAgICAgICAgICAgICAgd2FpdHNGb3IgLT4gdXBkYXRlU3B5LmNhbGxDb3VudCA+IDBcblxuICAgICAgICAgICAgaXQgJ2FkZHMgdGhlIG5ldyBkZWNvcmF0aW9ucyB0byB0aGUgZ3V0dGVyJywgLT5cbiAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoKS5maWx0ZXIgKGQpIC0+XG4gICAgICAgICAgICAgICAgZC5wcm9wZXJ0aWVzLnR5cGUgaXMgJ2d1dHRlcidcblxuICAgICAgICAgICAgICBleHBlY3QoZGVjb3JhdGlvbnMubGVuZ3RoKS50b0VxdWFsKDcpXG5cbiAgICAgICAgICAgIGl0ICdzZXRzIHRoZSBzaXplIG9mIHRoZSBndXR0ZXIgYmFzZWQgb24gdGhlIG51bWJlciBvZiBtYXJrZXJzIGluIHRoZSBzYW1lIHJvdycsIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChndXR0ZXIuc3R5bGUubWluV2lkdGgpLnRvRXF1YWwoJzQycHgnKVxuXG4gICAgICAgICAgICBkZXNjcmliZSAnY2xpY2tpbmcgb24gYSBndXR0ZXIgZGVjb3JhdGlvbicsIC0+XG4gICAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgICBwcm9qZWN0LmNvbG9yUGlja2VyQVBJID1cbiAgICAgICAgICAgICAgICAgIG9wZW46IGphc21pbmUuY3JlYXRlU3B5KCdjb2xvci1waWNrZXIub3BlbicpXG5cbiAgICAgICAgICAgICAgICBkZWNvcmF0aW9uID0gZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucGlnbWVudHMtZ3V0dGVyLW1hcmtlciBzcGFuJylcbiAgICAgICAgICAgICAgICBtb3VzZWRvd24oZGVjb3JhdGlvbilcblxuICAgICAgICAgICAgICBpdCAnc2VsZWN0cyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yJywgLT5cbiAgICAgICAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkU2NyZWVuUmFuZ2UoKSkudG9FcXVhbChbWzAsMTNdLFswLDE3XV0pXG5cbiAgICAgICAgICAgICAgaXQgJ29wZW5zIHRoZSBjb2xvciBwaWNrZXInLCAtPlxuICAgICAgICAgICAgICAgIGV4cGVjdChwcm9qZWN0LmNvbG9yUGlja2VyQVBJLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBtYXJrZXIgaXMgY2hhbmdlZCBhZ2FpbicsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5tYXJrZXJUeXBlJywgJ25hdGl2ZS1iYWNrZ3JvdW5kJ1xuXG4gICAgICAgICAgaXQgJ3JlbW92ZXMgdGhlIGd1dHRlcicsIC0+XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZ3V0dGVyLW5hbWU9XCJwaWdtZW50cy1ndXR0ZXJcIl0nKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgaXQgJ3JlY3JlYXRlcyB0aGUgbWFya2VycycsIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDMpXG5cbiAgICAgICAgZGVzY3JpYmUgJ3doZW4gYSBuZXcgYnVmZmVyIGlzIG9wZW5lZCcsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3Byb2plY3Qvc3R5bGVzL3ZhcmlhYmxlcy5zdHlsJykudGhlbiAoZSkgLT5cbiAgICAgICAgICAgICAgICBlZGl0b3IgPSBlXG4gICAgICAgICAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgICAgICAgICBjb2xvckJ1ZmZlckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoY29sb3JCdWZmZXIpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcbiAgICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci52YXJpYWJsZXNBdmFpbGFibGUoKVxuXG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIGd1dHRlciA9IGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvcignW2d1dHRlci1uYW1lPVwicGlnbWVudHMtZ3V0dGVyXCJdJylcblxuICAgICAgICAgIGl0ICdjcmVhdGVzIHRoZSBkZWNvcmF0aW9ucyBpbiB0aGUgbmV3IGJ1ZmZlciBndXR0ZXInLCAtPlxuICAgICAgICAgICAgZGVjb3JhdGlvbnMgPSBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoKS5maWx0ZXIgKGQpIC0+XG4gICAgICAgICAgICAgIGQucHJvcGVydGllcy50eXBlIGlzICdndXR0ZXInXG5cbiAgICAgICAgICAgIGV4cGVjdChkZWNvcmF0aW9ucy5sZW5ndGgpLnRvRXF1YWwoMTApXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZWRpdG9yIGlzIG1vdmVkIHRvIGFub3RoZXIgcGFuZScsIC0+XG4gICAgICBbcGFuZSwgbmV3UGFuZV0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIG5ld1BhbmUgPSBwYW5lLnNwbGl0RG93bihjb3B5QWN0aXZlSXRlbTogZmFsc2UpXG4gICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG4gICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhjb2xvckJ1ZmZlcilcblxuICAgICAgICBwYW5lLm1vdmVJdGVtVG9QYW5lKGVkaXRvciwgbmV3UGFuZSwgMClcblxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aFxuXG4gICAgICBpdCAnbW92ZXMgdGhlIGVkaXRvciB3aXRoIHRoZSBidWZmZXIgdG8gdGhlIG5ldyBwYW5lJywgLT5cbiAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gcGlnbWVudHMuc3VwcG9ydGVkRmlsZXR5cGVzIHNldHRpbmdzIGlzIGRlZmluZWQnLCAtPlxuICAgICAgbG9hZEJ1ZmZlciA9IChmaWxlUGF0aCkgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCkudGhlbiAobykgLT5cbiAgICAgICAgICAgIGVkaXRvciA9IG9cbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgICAgY29sb3JCdWZmZXIgPSBwcm9qZWN0LmNvbG9yQnVmZmVyRm9yRWRpdG9yKGVkaXRvcilcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyhjb2xvckJ1ZmZlcilcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyRWxlbWVudC5hdHRhY2goKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBjb2xvckJ1ZmZlci5pbml0aWFsaXplKClcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGNvbG9yQnVmZmVyLnZhcmlhYmxlc0F2YWlsYWJsZSgpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtbGVzcycpXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIHRoZSBkZWZhdWx0IHdpbGRjYXJkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc3VwcG9ydGVkRmlsZXR5cGVzJywgWycqJ11cblxuICAgICAgICBpdCAnc3VwcG9ydHMgZXZlcnkgZmlsZXR5cGUnLCAtPlxuICAgICAgICAgIGxvYWRCdWZmZXIoJ3Njb3BlLWZpbHRlci5jb2ZmZWUnKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgICAgIGxvYWRCdWZmZXIoJ3Byb2plY3QvdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzcycpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyMClcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggYSBmaWxldHlwZScsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnN1cHBvcnRlZEZpbGV0eXBlcycsIFsnY29mZmVlJ11cblxuICAgICAgICBpdCAnc3VwcG9ydHMgdGhlIHNwZWNpZmllZCBmaWxlIHR5cGUnLCAtPlxuICAgICAgICAgIGxvYWRCdWZmZXIoJ3Njb3BlLWZpbHRlci5jb2ZmZWUnKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgICAgIGxvYWRCdWZmZXIoJ3Byb2plY3QvdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzcycpXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgwKVxuXG4gICAgICBkZXNjcmliZSAnd2l0aCBtYW55IGZpbGV0eXBlcycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnN1cHBvcnRlZEZpbGV0eXBlcycsIFsnY29mZmVlJ11cbiAgICAgICAgICBwcm9qZWN0LnNldFN1cHBvcnRlZEZpbGV0eXBlcyhbJ2xlc3MnXSlcblxuICAgICAgICBpdCAnc3VwcG9ydHMgdGhlIHNwZWNpZmllZCBmaWxlIHR5cGVzJywgLT5cbiAgICAgICAgICBsb2FkQnVmZmVyKCdzY29wZS1maWx0ZXIuY29mZmVlJylcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgICAgICBsb2FkQnVmZmVyKCdwcm9qZWN0L3ZlbmRvci9jc3MvdmFyaWFibGVzLmxlc3MnKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMjApXG5cbiAgICAgICAgICBsb2FkQnVmZmVyKCdmb3VyLXZhcmlhYmxlcy5zdHlsJylcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICAgICAgZGVzY3JpYmUgJ3dpdGggZ2xvYmFsIGZpbGUgdHlwZXMgaWdub3JlZCcsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zdXBwb3J0ZWRGaWxldHlwZXMnLCBbJ2NvZmZlZSddXG4gICAgICAgICAgICBwcm9qZWN0LnNldElnbm9yZUdsb2JhbFN1cHBvcnRlZEZpbGV0eXBlcyh0cnVlKVxuICAgICAgICAgICAgcHJvamVjdC5zZXRTdXBwb3J0ZWRGaWxldHlwZXMoWydsZXNzJ10pXG5cbiAgICAgICAgICBpdCAnc3VwcG9ydHMgdGhlIHNwZWNpZmllZCBmaWxlIHR5cGVzJywgLT5cbiAgICAgICAgICAgIGxvYWRCdWZmZXIoJ3Njb3BlLWZpbHRlci5jb2ZmZWUnKVxuICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICAgICAgICAgIGxvYWRCdWZmZXIoJ3Byb2plY3QvdmVuZG9yL2Nzcy92YXJpYWJsZXMubGVzcycpXG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMjApXG5cbiAgICAgICAgICAgIGxvYWRCdWZmZXIoJ2ZvdXItdmFyaWFibGVzLnN0eWwnKVxuICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICBleHBlY3QoZ2V0RWRpdG9yRGVjb3JhdGlvbnMoJ25hdGl2ZS1iYWNrZ3JvdW5kJykubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICBkZXNjcmliZSAnd2hlbiBwaWdtZW50cy5pZ25vcmVkU2NvcGVzIHNldHRpbmdzIGlzIGRlZmluZWQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignc2NvcGUtZmlsdGVyLmNvZmZlZScpLnRoZW4gKG8pIC0+XG4gICAgICAgICAgICBlZGl0b3IgPSBvXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICAgICAgICAgIGNvbG9yQnVmZmVyID0gcHJvamVjdC5jb2xvckJ1ZmZlckZvckVkaXRvcihlZGl0b3IpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoY29sb3JCdWZmZXIpXG4gICAgICAgICAgICBjb2xvckJ1ZmZlckVsZW1lbnQuYXR0YWNoKClcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIG9uZSBmaWx0ZXInLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkU2NvcGVzJywgWydcXFxcLmNvbW1lbnQnXSlcblxuICAgICAgICBpdCAnaWdub3JlcyB0aGUgY29sb3JzIHRoYXQgbWF0Y2hlcyB0aGUgZGVmaW5lZCBzY29wZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggdHdvIGZpbHRlcnMnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkU2NvcGVzJywgWydcXFxcLnN0cmluZycsICdcXFxcLmNvbW1lbnQnXSlcblxuICAgICAgICBpdCAnaWdub3JlcyB0aGUgY29sb3JzIHRoYXQgbWF0Y2hlcyB0aGUgZGVmaW5lZCBzY29wZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChnZXRFZGl0b3JEZWNvcmF0aW9ucygnbmF0aXZlLWJhY2tncm91bmQnKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggYW4gaW52YWxpZCBmaWx0ZXInLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkU2NvcGVzJywgWydcXFxcJ10pXG5cbiAgICAgICAgaXQgJ2lnbm9yZXMgdGhlIGZpbHRlcicsIC0+XG4gICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiB0aGUgcHJvamVjdCBpZ25vcmVkU2NvcGVzIGlzIGRlZmluZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5pZ25vcmVkU2NvcGVzJywgWydcXFxcLnN0cmluZyddKVxuICAgICAgICAgIHByb2plY3Quc2V0SWdub3JlZFNjb3BlcyhbJ1xcXFwuY29tbWVudCddKVxuXG4gICAgICAgIGl0ICdpZ25vcmVzIHRoZSBjb2xvcnMgdGhhdCBtYXRjaGVzIHRoZSBkZWZpbmVkIHNjb3BlcycsIC0+XG4gICAgICAgICAgZXhwZWN0KGdldEVkaXRvckRlY29yYXRpb25zKCduYXRpdmUtYmFja2dyb3VuZCcpLmxlbmd0aCkudG9FcXVhbCgwKVxuIl19

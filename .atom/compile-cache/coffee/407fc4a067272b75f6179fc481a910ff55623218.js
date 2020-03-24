(function() {
  var Color, Palette, THEME_VARIABLES, change, click, ref;

  Color = require('../lib/color');

  Palette = require('../lib/palette');

  THEME_VARIABLES = require('../lib/uris').THEME_VARIABLES;

  ref = require('./helpers/events'), change = ref.change, click = ref.click;

  describe('PaletteElement', function() {
    var createVar, nextID, palette, paletteElement, pigments, project, ref1, workspaceElement;
    ref1 = [0], nextID = ref1[0], palette = ref1[1], paletteElement = ref1[2], workspaceElement = ref1[3], pigments = ref1[4], project = ref1[5];
    createVar = function(name, color, path, line, isAlternate) {
      if (isAlternate == null) {
        isAlternate = false;
      }
      return {
        name: name,
        color: color,
        path: path,
        line: line,
        id: nextID++,
        isAlternate: isAlternate
      };
    };
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
      return waitsForPromise(function() {
        return project.initialize();
      });
    });
    afterEach(function() {
      return project.destroy();
    });
    describe('as a view provider', function() {
      beforeEach(function() {
        palette = new Palette([createVar('red', new Color('#ff0000'), 'file.styl', 0), createVar('green', new Color('#00ff00'), 'file.styl', 1), createVar('blue', new Color('#0000ff'), 'file.styl', 2), createVar('redCopy', new Color('#ff0000'), 'file.styl', 3), createVar('red_copy', new Color('#ff0000'), 'file.styl', 3, true), createVar('red', new Color('#ff0000'), THEME_VARIABLES, 0)]);
        paletteElement = atom.views.getView(palette);
        return jasmine.attachToDOM(paletteElement);
      });
      it('is associated with the Palette model', function() {
        return expect(paletteElement).toBeDefined();
      });
      it('does not render alernate form of a variable', function() {
        return expect(paletteElement.querySelectorAll('li').length).toEqual(5);
      });
      return it('does not render the file link when the variable comes from a theme', function() {
        return expect(paletteElement.querySelectorAll('li')[4].querySelector(' [data-variable-id]')).not.toExist();
      });
    });
    describe('when pigments:show-palette commands is triggered', function() {
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
        waitsFor(function() {
          return paletteElement = workspaceElement.querySelector('pigments-palette');
        });
        return runs(function() {
          palette = paletteElement.getModel();
          return jasmine.attachToDOM(paletteElement);
        });
      });
      it('opens a palette element', function() {
        return expect(paletteElement).toBeDefined();
      });
      it('creates as many list item as there is colors in the project', function() {
        expect(paletteElement.querySelectorAll('li').length).not.toEqual(0);
        return expect(paletteElement.querySelectorAll('li').length).toEqual(palette.variables.filter(function(v) {
          return !v.isAlternate;
        }).length);
      });
      it('binds colors with project variables', function() {
        var li, projectVariables;
        projectVariables = project.getColorVariables();
        li = paletteElement.querySelector('li');
        return expect(li.querySelector('.path').textContent).toEqual(atom.project.relativize(projectVariables[0].path));
      });
      describe('clicking on a result path', function() {
        return it('shows the variable in its file', function() {
          var pathElement;
          spyOn(project, 'showVariableInFile');
          pathElement = paletteElement.querySelector('[data-variable-id]');
          click(pathElement);
          return waitsFor(function() {
            return project.showVariableInFile.callCount > 0;
          });
        });
      });
      describe('when the sortPaletteColors settings is set to color', function() {
        beforeEach(function() {
          return atom.config.set('pigments.sortPaletteColors', 'by color');
        });
        return it('reorders the colors', function() {
          var i, j, len, lis, name, results, sortedColors;
          sortedColors = project.getPalette().sortedByColor().filter(function(v) {
            return !v.isAlternate;
          });
          lis = paletteElement.querySelectorAll('li');
          results = [];
          for (i = j = 0, len = sortedColors.length; j < len; i = ++j) {
            name = sortedColors[i].name;
            results.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
          }
          return results;
        });
      });
      describe('when the sortPaletteColors settings is set to name', function() {
        beforeEach(function() {
          return atom.config.set('pigments.sortPaletteColors', 'by name');
        });
        return it('reorders the colors', function() {
          var i, j, len, lis, name, results, sortedColors;
          sortedColors = project.getPalette().sortedByName().filter(function(v) {
            return !v.isAlternate;
          });
          lis = paletteElement.querySelectorAll('li');
          results = [];
          for (i = j = 0, len = sortedColors.length; j < len; i = ++j) {
            name = sortedColors[i].name;
            results.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
          }
          return results;
        });
      });
      describe('when the groupPaletteColors setting is set to file', function() {
        beforeEach(function() {
          return atom.config.set('pigments.groupPaletteColors', 'by file');
        });
        it('renders the list with sublists for each files', function() {
          var ols;
          ols = paletteElement.querySelectorAll('ol ol');
          return expect(ols.length).toEqual(5);
        });
        it('adds a header with the file path for each sublist', function() {
          var ols;
          ols = paletteElement.querySelectorAll('.pigments-color-group-header');
          return expect(ols.length).toEqual(5);
        });
        describe('and the sortPaletteColors is set to name', function() {
          beforeEach(function() {
            return atom.config.set('pigments.sortPaletteColors', 'by name');
          });
          return it('sorts the nested list items', function() {
            var file, i, lis, n, name, ol, ols, palettes, results, sortedColors;
            palettes = paletteElement.getFilesPalettes();
            ols = paletteElement.querySelectorAll('.pigments-color-group');
            n = 0;
            results = [];
            for (file in palettes) {
              palette = palettes[file];
              ol = ols[n++];
              lis = ol.querySelectorAll('li');
              sortedColors = palette.sortedByName().filter(function(v) {
                return !v.isAlternate;
              });
              results.push((function() {
                var j, len, results1;
                results1 = [];
                for (i = j = 0, len = sortedColors.length; j < len; i = ++j) {
                  name = sortedColors[i].name;
                  results1.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
                }
                return results1;
              })());
            }
            return results;
          });
        });
        return describe('when the mergeColorDuplicates', function() {
          beforeEach(function() {
            return atom.config.set('pigments.mergeColorDuplicates', true);
          });
          return it('groups identical colors together', function() {
            var lis;
            lis = paletteElement.querySelectorAll('li');
            return expect(lis.length).toEqual(40);
          });
        });
      });
      describe('sorting selector', function() {
        var sortSelect;
        sortSelect = [][0];
        return describe('when changed', function() {
          beforeEach(function() {
            sortSelect = paletteElement.querySelector('#sort-palette-colors');
            sortSelect.querySelector('option[value="by name"]').setAttribute('selected', 'selected');
            return change(sortSelect);
          });
          return it('changes the settings value', function() {
            return expect(atom.config.get('pigments.sortPaletteColors')).toEqual('by name');
          });
        });
      });
      return describe('grouping selector', function() {
        var groupSelect;
        groupSelect = [][0];
        return describe('when changed', function() {
          beforeEach(function() {
            groupSelect = paletteElement.querySelector('#group-palette-colors');
            groupSelect.querySelector('option[value="by file"]').setAttribute('selected', 'selected');
            return change(groupSelect);
          });
          return it('changes the settings value', function() {
            return expect(atom.config.get('pigments.groupPaletteColors')).toEqual('by file');
          });
        });
      });
    });
    describe('when the palette settings differs from defaults', function() {
      beforeEach(function() {
        atom.config.set('pigments.sortPaletteColors', 'by name');
        atom.config.set('pigments.groupPaletteColors', 'by file');
        return atom.config.set('pigments.mergeColorDuplicates', true);
      });
      return describe('when pigments:show-palette commands is triggered', function() {
        beforeEach(function() {
          atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
          waitsFor(function() {
            return paletteElement = workspaceElement.querySelector('pigments-palette');
          });
          return runs(function() {
            return palette = paletteElement.getModel();
          });
        });
        describe('the sorting selector', function() {
          return it('selects the current value', function() {
            var sortSelect;
            sortSelect = paletteElement.querySelector('#sort-palette-colors');
            return expect(sortSelect.querySelector('option[selected]').value).toEqual('by name');
          });
        });
        describe('the grouping selector', function() {
          return it('selects the current value', function() {
            var groupSelect;
            groupSelect = paletteElement.querySelector('#group-palette-colors');
            return expect(groupSelect.querySelector('option[selected]').value).toEqual('by file');
          });
        });
        return it('checks the merge checkbox', function() {
          var mergeCheckBox;
          mergeCheckBox = paletteElement.querySelector('#merge-duplicates');
          return expect(mergeCheckBox.checked).toBeTruthy();
        });
      });
    });
    return describe('when the project variables are modified', function() {
      var initialColorCount, ref2, spy;
      ref2 = [], spy = ref2[0], initialColorCount = ref2[1];
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
        waitsFor(function() {
          return paletteElement = workspaceElement.querySelector('pigments-palette');
        });
        runs(function() {
          palette = paletteElement.getModel();
          initialColorCount = palette.getColorsCount();
          spy = jasmine.createSpy('onDidUpdateVariables');
          project.onDidUpdateVariables(spy);
          return atom.config.set('pigments.sourceNames', ['*.styl', '*.less', '*.sass']);
        });
        return waitsFor(function() {
          return spy.callCount > 0;
        });
      });
      return it('updates the palette', function() {
        var lis;
        expect(palette.getColorsCount()).not.toEqual(initialColorCount);
        lis = paletteElement.querySelectorAll('li');
        return expect(lis.length).not.toEqual(initialColorCount);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvcGFsZXR0ZS1lbGVtZW50LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGNBQVI7O0VBQ1IsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUjs7RUFDVCxrQkFBbUIsT0FBQSxDQUFRLGFBQVI7O0VBQ3BCLE1BQWtCLE9BQUEsQ0FBUSxrQkFBUixDQUFsQixFQUFDLG1CQUFELEVBQVM7O0VBRVQsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7QUFDekIsUUFBQTtJQUFBLE9BQXlFLENBQUMsQ0FBRCxDQUF6RSxFQUFDLGdCQUFELEVBQVMsaUJBQVQsRUFBa0Isd0JBQWxCLEVBQWtDLDBCQUFsQyxFQUFvRCxrQkFBcEQsRUFBOEQ7SUFFOUQsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLFdBQTFCOztRQUEwQixjQUFZOzthQUNoRDtRQUFDLE1BQUEsSUFBRDtRQUFPLE9BQUEsS0FBUDtRQUFjLE1BQUEsSUFBZDtRQUFvQixNQUFBLElBQXBCO1FBQTBCLEVBQUEsRUFBSSxNQUFBLEVBQTlCO1FBQXdDLGFBQUEsV0FBeEM7O0lBRFU7SUFHWixVQUFBLENBQVcsU0FBQTtNQUNULGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEI7TUFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUN0QyxRQURzQyxFQUV0QyxRQUZzQyxDQUF4QztNQUtBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixVQUE5QixDQUF5QyxDQUFDLElBQTFDLENBQStDLFNBQUMs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QUEsR0FBTSxPQUFPLENBQUMsU0FBUixDQUFrQixzQkFBbEI7VUFFTixPQUFPLENBQUMsb0JBQVIsQ0FBNkIsR0FBN0I7aUJBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUN0QyxRQURzQyxFQUV0QyxRQUZzQyxFQUd0QyxRQUhzQyxDQUF4QztRQVBHLENBQUw7ZUFhQSxRQUFBLENBQVMsU0FBQTtpQkFBRyxHQUFHLENBQUMsU0FBSixHQUFnQjtRQUFuQixDQUFUO01BbkJTLENBQVg7YUFxQkEsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUE7QUFDeEIsWUFBQTtRQUFBLE1BQUEsQ0FBTyxPQUFPLENBQUMsY0FBUixDQUFBLENBQVAsQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsT0FBckMsQ0FBNkMsaUJBQTdDO1FBRUEsR0FBQSxHQUFNLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQztlQUVOLE1BQUEsQ0FBTyxHQUFHLENBQUMsTUFBWCxDQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUF2QixDQUErQixpQkFBL0I7TUFMd0IsQ0FBMUI7SUF2QmtELENBQXBEO0VBbk15QixDQUEzQjtBQUxBIiwic291cmNlc0NvbnRlbnQiOlsiQ29sb3IgPSByZXF1aXJlICcuLi9saWIvY29sb3InXG5QYWxldHRlID0gcmVxdWlyZSAnLi4vbGliL3BhbGV0dGUnXG57VEhFTUVfVkFSSUFCTEVTfSA9IHJlcXVpcmUgJy4uL2xpYi91cmlzJ1xue2NoYW5nZSwgY2xpY2t9ID0gcmVxdWlyZSAnLi9oZWxwZXJzL2V2ZW50cydcblxuZGVzY3JpYmUgJ1BhbGV0dGVFbGVtZW50JywgLT5cbiAgW25leHRJRCwgcGFsZXR0ZSwgcGFsZXR0ZUVsZW1lbnQsIHdvcmtzcGFjZUVsZW1lbnQsIHBpZ21lbnRzLCBwcm9qZWN0XSA9IFswXVxuXG4gIGNyZWF0ZVZhciA9IChuYW1lLCBjb2xvciwgcGF0aCwgbGluZSwgaXNBbHRlcm5hdGU9ZmFsc2UpIC0+XG4gICAge25hbWUsIGNvbG9yLCBwYXRoLCBsaW5lLCBpZDogbmV4dElEKyssIGlzQWx0ZXJuYXRlfVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbXG4gICAgICAnKi5zdHlsJ1xuICAgICAgJyoubGVzcydcbiAgICBdXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3BpZ21lbnRzJykudGhlbiAocGtnKSAtPlxuICAgICAgcGlnbWVudHMgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgcHJvamVjdCA9IHBpZ21lbnRzLmdldFByb2plY3QoKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgcHJvamVjdC5kZXN0cm95KClcblxuICBkZXNjcmliZSAnYXMgYSB2aWV3IHByb3ZpZGVyJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBwYWxldHRlID0gbmV3IFBhbGV0dGUoW1xuICAgICAgICBjcmVhdGVWYXIgJ3JlZCcsIG5ldyBDb2xvcignI2ZmMDAwMCcpLCAnZmlsZS5zdHlsJywgMFxuICAgICAgICBjcmVhdGVWYXIgJ2dyZWVuJywgbmV3IENvbG9yKCcjMDBmZjAwJyksICdmaWxlLnN0eWwnLCAxXG4gICAgICAgIGNyZWF0ZVZhciAnYmx1ZScsIG5ldyBDb2xvcignIzAwMDBmZicpLCAnZmlsZS5zdHlsJywgMlxuICAgICAgICBjcmVhdGVWYXIgJ3JlZENvcHknLCBuZXcgQ29sb3IoJyNmZjAwMDAnKSwgJ2ZpbGUuc3R5bCcsIDNcbiAgICAgICAgY3JlYXRlVmFyICdyZWRfY29weScsIG5ldyBDb2xvcignI2ZmMDAwMCcpLCAnZmlsZS5zdHlsJywgMywgdHJ1ZVxuICAgICAgICBjcmVhdGVWYXIgJ3JlZCcsIG5ldyBDb2xvcignI2ZmMDAwMCcpLCBUSEVNRV9WQVJJQUJMRVMsIDBcbiAgICAgIF0pXG5cbiAgICAgIHBhbGV0dGVFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHBhbGV0dGUpXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHBhbGV0dGVFbGVtZW50KVxuXG4gICAgaXQgJ2lzIGFzc29jaWF0ZWQgd2l0aCB0aGUgUGFsZXR0ZSBtb2RlbCcsIC0+XG4gICAgICBleHBlY3QocGFsZXR0ZUVsZW1lbnQpLnRvQmVEZWZpbmVkKClcblxuICAgIGl0ICdkb2VzIG5vdCByZW5kZXIgYWxlcm5hdGUgZm9ybSBvZiBhIHZhcmlhYmxlJywgLT5cbiAgICAgIGV4cGVjdChwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpLmxlbmd0aCkudG9FcXVhbCg1KVxuXG4gICAgaXQgJ2RvZXMgbm90IHJlbmRlciB0aGUgZmlsZSBsaW5rIHdoZW4gdGhlIHZhcmlhYmxlIGNvbWVzIGZyb20gYSB0aGVtZScsIC0+XG4gICAgICBleHBlY3QocGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKVs0XS5xdWVyeVNlbGVjdG9yKCcgW2RhdGEtdmFyaWFibGUtaWRdJykpLm5vdC50b0V4aXN0KClcblxuICBkZXNjcmliZSAnd2hlbiBwaWdtZW50czpzaG93LXBhbGV0dGUgY29tbWFuZHMgaXMgdHJpZ2dlcmVkJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdwaWdtZW50czpzaG93LXBhbGV0dGUnKVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBwYWxldHRlRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcigncGlnbWVudHMtcGFsZXR0ZScpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgcGFsZXR0ZSA9IHBhbGV0dGVFbGVtZW50LmdldE1vZGVsKClcbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShwYWxldHRlRWxlbWVudClcblxuICAgIGl0ICdvcGVucyBhIHBhbGV0dGUgZWxlbWVudCcsIC0+XG4gICAgICBleHBlY3QocGFsZXR0ZUVsZW1lbnQpLnRvQmVEZWZpbmVkKClcblxuICAgIGl0ICdjcmVhdGVzIGFzIG1hbnkgbGlzdCBpdGVtIGFzIHRoZXJlIGlzIGNvbG9ycyBpbiB0aGUgcHJvamVjdCcsIC0+XG4gICAgICBleHBlY3QocGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKS5sZW5ndGgpLm5vdC50b0VxdWFsKDApXG4gICAgICBleHBlY3QocGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKS5sZW5ndGgpLnRvRXF1YWwocGFsZXR0ZS52YXJpYWJsZXMuZmlsdGVyKCh2KSAtPiBub3Qgdi5pc0FsdGVybmF0ZSkubGVuZ3RoKVxuXG4gICAgaXQgJ2JpbmRzIGNvbG9ycyB3aXRoIHByb2plY3QgdmFyaWFibGVzJywgLT5cbiAgICAgIHByb2plY3RWYXJpYWJsZXMgPSBwcm9qZWN0LmdldENvbG9yVmFyaWFibGVzKClcblxuICAgICAgbGkgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaScpXG4gICAgICBleHBlY3QobGkucXVlcnlTZWxlY3RvcignLnBhdGgnKS50ZXh0Q29udGVudCkudG9FcXVhbChhdG9tLnByb2plY3QucmVsYXRpdml6ZShwcm9qZWN0VmFyaWFibGVzWzBdLnBhdGgpKVxuXG4gICAgZGVzY3JpYmUgJ2NsaWNraW5nIG9uIGEgcmVzdWx0IHBhdGgnLCAtPlxuICAgICAgaXQgJ3Nob3dzIHRoZSB2YXJpYWJsZSBpbiBpdHMgZmlsZScsIC0+XG4gICAgICAgIHNweU9uKHByb2plY3QsICdzaG93VmFyaWFibGVJbkZpbGUnKVxuXG4gICAgICAgIHBhdGhFbGVtZW50ID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtdmFyaWFibGUtaWRdJylcblxuICAgICAgICBjbGljayhwYXRoRWxlbWVudClcblxuICAgICAgICB3YWl0c0ZvciAtPiBwcm9qZWN0LnNob3dWYXJpYWJsZUluRmlsZS5jYWxsQ291bnQgPiAwXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgc29ydFBhbGV0dGVDb2xvcnMgc2V0dGluZ3MgaXMgc2V0IHRvIGNvbG9yJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3J0UGFsZXR0ZUNvbG9ycycsICdieSBjb2xvcidcblxuICAgICAgaXQgJ3Jlb3JkZXJzIHRoZSBjb2xvcnMnLCAtPlxuICAgICAgICBzb3J0ZWRDb2xvcnMgPSBwcm9qZWN0LmdldFBhbGV0dGUoKS5zb3J0ZWRCeUNvbG9yKCkuZmlsdGVyKCh2KSAtPiBub3Qgdi5pc0FsdGVybmF0ZSlcbiAgICAgICAgbGlzID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKVxuXG4gICAgICAgIGZvciB7bmFtZX0saSBpbiBzb3J0ZWRDb2xvcnNcbiAgICAgICAgICBleHBlY3QobGlzW2ldLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykudGV4dENvbnRlbnQpLnRvRXF1YWwobmFtZSlcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBzb3J0UGFsZXR0ZUNvbG9ycyBzZXR0aW5ncyBpcyBzZXQgdG8gbmFtZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc29ydFBhbGV0dGVDb2xvcnMnLCAnYnkgbmFtZSdcblxuICAgICAgaXQgJ3Jlb3JkZXJzIHRoZSBjb2xvcnMnLCAtPlxuICAgICAgICBzb3J0ZWRDb2xvcnMgPSBwcm9qZWN0LmdldFBhbGV0dGUoKS5zb3J0ZWRCeU5hbWUoKS5maWx0ZXIoKHYpIC0+IG5vdCB2LmlzQWx0ZXJuYXRlKVxuICAgICAgICBsaXMgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpXG5cbiAgICAgICAgZm9yIHtuYW1lfSxpIGluIHNvcnRlZENvbG9yc1xuICAgICAgICAgIGV4cGVjdChsaXNbaV0ucXVlcnlTZWxlY3RvcignLm5hbWUnKS50ZXh0Q29udGVudCkudG9FcXVhbChuYW1lKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIGdyb3VwUGFsZXR0ZUNvbG9ycyBzZXR0aW5nIGlzIHNldCB0byBmaWxlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5ncm91cFBhbGV0dGVDb2xvcnMnLCAnYnkgZmlsZSdcblxuICAgICAgaXQgJ3JlbmRlcnMgdGhlIGxpc3Qgd2l0aCBzdWJsaXN0cyBmb3IgZWFjaCBmaWxlcycsIC0+XG4gICAgICAgIG9scyA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29sIG9sJylcbiAgICAgICAgZXhwZWN0KG9scy5sZW5ndGgpLnRvRXF1YWwoNSlcblxuICAgICAgaXQgJ2FkZHMgYSBoZWFkZXIgd2l0aCB0aGUgZmlsZSBwYXRoIGZvciBlYWNoIHN1Ymxpc3QnLCAtPlxuICAgICAgICBvbHMgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucGlnbWVudHMtY29sb3ItZ3JvdXAtaGVhZGVyJylcbiAgICAgICAgZXhwZWN0KG9scy5sZW5ndGgpLnRvRXF1YWwoNSlcblxuICAgICAgZGVzY3JpYmUgJ2FuZCB0aGUgc29ydFBhbGV0dGVDb2xvcnMgaXMgc2V0IHRvIG5hbWUnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3J0UGFsZXR0ZUNvbG9ycycsICdieSBuYW1lJ1xuXG4gICAgICAgIGl0ICdzb3J0cyB0aGUgbmVzdGVkIGxpc3QgaXRlbXMnLCAtPlxuICAgICAgICAgIHBhbGV0dGVzID0gcGFsZXR0ZUVsZW1lbnQuZ2V0RmlsZXNQYWxldHRlcygpXG4gICAgICAgICAgb2xzID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBpZ21lbnRzLWNvbG9yLWdyb3VwJylcbiAgICAgICAgICBuID0gMFxuXG4gICAgICAgICAgZm9yIGZpbGUsIHBhbGV0dGUgb2YgcGFsZXR0ZXNcbiAgICAgICAgICAgIG9sID0gb2xzW24rK11cbiAgICAgICAgICAgIGxpcyA9IG9sLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJylcbiAgICAgICAgICAgIHNvcnRlZENvbG9ycyA9IHBhbGV0dGUuc29ydGVkQnlOYW1lKCkuZmlsdGVyKCh2KSAtPiBub3Qgdi5pc0FsdGVybmF0ZSlcblxuICAgICAgICAgICAgZm9yIHtuYW1lfSxpIGluIHNvcnRlZENvbG9yc1xuICAgICAgICAgICAgICBleHBlY3QobGlzW2ldLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJykudGV4dENvbnRlbnQpLnRvRXF1YWwobmFtZSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIG1lcmdlQ29sb3JEdXBsaWNhdGVzJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMubWVyZ2VDb2xvckR1cGxpY2F0ZXMnLCB0cnVlXG5cbiAgICAgICAgaXQgJ2dyb3VwcyBpZGVudGljYWwgY29sb3JzIHRvZ2V0aGVyJywgLT5cbiAgICAgICAgICBsaXMgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaScpXG5cbiAgICAgICAgICBleHBlY3QobGlzLmxlbmd0aCkudG9FcXVhbCg0MClcblxuICAgIGRlc2NyaWJlICdzb3J0aW5nIHNlbGVjdG9yJywgLT5cbiAgICAgIFtzb3J0U2VsZWN0XSA9IFtdXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGNoYW5nZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc29ydFNlbGVjdCA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb3J0LXBhbGV0dGUtY29sb3JzJylcbiAgICAgICAgICBzb3J0U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJ29wdGlvblt2YWx1ZT1cImJ5IG5hbWVcIl0nKS5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGNoYW5nZShzb3J0U2VsZWN0KVxuXG4gICAgICAgIGl0ICdjaGFuZ2VzIHRoZSBzZXR0aW5ncyB2YWx1ZScsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc29ydFBhbGV0dGVDb2xvcnMnKSkudG9FcXVhbCgnYnkgbmFtZScpXG5cbiAgICBkZXNjcmliZSAnZ3JvdXBpbmcgc2VsZWN0b3InLCAtPlxuICAgICAgW2dyb3VwU2VsZWN0XSA9IFtdXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIGNoYW5nZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZ3JvdXBTZWxlY3QgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjZ3JvdXAtcGFsZXR0ZS1jb2xvcnMnKVxuICAgICAgICAgIGdyb3VwU2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJ29wdGlvblt2YWx1ZT1cImJ5IGZpbGVcIl0nKS5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJylcblxuICAgICAgICAgIGNoYW5nZShncm91cFNlbGVjdClcblxuICAgICAgICBpdCAnY2hhbmdlcyB0aGUgc2V0dGluZ3MgdmFsdWUnLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3BpZ21lbnRzLmdyb3VwUGFsZXR0ZUNvbG9ycycpKS50b0VxdWFsKCdieSBmaWxlJylcblxuICBkZXNjcmliZSAnd2hlbiB0aGUgcGFsZXR0ZSBzZXR0aW5ncyBkaWZmZXJzIGZyb20gZGVmYXVsdHMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuc29ydFBhbGV0dGVDb2xvcnMnLCAnYnkgbmFtZScpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmdyb3VwUGFsZXR0ZUNvbG9ycycsICdieSBmaWxlJylcbiAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMubWVyZ2VDb2xvckR1cGxpY2F0ZXMnLCB0cnVlKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gcGlnbWVudHM6c2hvdy1wYWxldHRlIGNvbW1hbmRzIGlzIHRyaWdnZXJlZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ3BpZ21lbnRzOnNob3ctcGFsZXR0ZScpXG5cbiAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICBwYWxldHRlRWxlbWVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcigncGlnbWVudHMtcGFsZXR0ZScpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHBhbGV0dGUgPSBwYWxldHRlRWxlbWVudC5nZXRNb2RlbCgpXG5cbiAgICAgIGRlc2NyaWJlICd0aGUgc29ydGluZyBzZWxlY3RvcicsIC0+XG4gICAgICAgIGl0ICdzZWxlY3RzIHRoZSBjdXJyZW50IHZhbHVlJywgLT5cbiAgICAgICAgICBzb3J0U2VsZWN0ID0gcGFsZXR0ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignI3NvcnQtcGFsZXR0ZS1jb2xvcnMnKVxuICAgICAgICAgIGV4cGVjdChzb3J0U2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJ29wdGlvbltzZWxlY3RlZF0nKS52YWx1ZSkudG9FcXVhbCgnYnkgbmFtZScpXG5cbiAgICAgIGRlc2NyaWJlICd0aGUgZ3JvdXBpbmcgc2VsZWN0b3InLCAtPlxuICAgICAgICBpdCAnc2VsZWN0cyB0aGUgY3VycmVudCB2YWx1ZScsIC0+XG4gICAgICAgICAgZ3JvdXBTZWxlY3QgPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjZ3JvdXAtcGFsZXR0ZS1jb2xvcnMnKVxuICAgICAgICAgIGV4cGVjdChncm91cFNlbGVjdC5xdWVyeVNlbGVjdG9yKCdvcHRpb25bc2VsZWN0ZWRdJykudmFsdWUpLnRvRXF1YWwoJ2J5IGZpbGUnKVxuXG4gICAgICBpdCAnY2hlY2tzIHRoZSBtZXJnZSBjaGVja2JveCcsIC0+XG4gICAgICAgIG1lcmdlQ2hlY2tCb3ggPSBwYWxldHRlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcjbWVyZ2UtZHVwbGljYXRlcycpXG4gICAgICAgIGV4cGVjdChtZXJnZUNoZWNrQm94LmNoZWNrZWQpLnRvQmVUcnV0aHkoKVxuXG4gIGRlc2NyaWJlICd3aGVuIHRoZSBwcm9qZWN0IHZhcmlhYmxlcyBhcmUgbW9kaWZpZWQnLCAtPlxuICAgIFtzcHksIGluaXRpYWxDb2xvckNvdW50XSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAncGlnbWVudHM6c2hvdy1wYWxldHRlJylcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgcGFsZXR0ZUVsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3BpZ21lbnRzLXBhbGV0dGUnKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHBhbGV0dGUgPSBwYWxldHRlRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgICAgIGluaXRpYWxDb2xvckNvdW50ID0gcGFsZXR0ZS5nZXRDb2xvcnNDb3VudCgpXG4gICAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdvbkRpZFVwZGF0ZVZhcmlhYmxlcycpXG5cbiAgICAgICAgcHJvamVjdC5vbkRpZFVwZGF0ZVZhcmlhYmxlcyhzcHkpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFtcbiAgICAgICAgICAnKi5zdHlsJ1xuICAgICAgICAgICcqLmxlc3MnXG4gICAgICAgICAgJyouc2FzcydcbiAgICAgICAgXVxuXG4gICAgICB3YWl0c0ZvciAtPiBzcHkuY2FsbENvdW50ID4gMFxuXG4gICAgaXQgJ3VwZGF0ZXMgdGhlIHBhbGV0dGUnLCAtPlxuICAgICAgZXhwZWN0KHBhbGV0dGUuZ2V0Q29sb3JzQ291bnQoKSkubm90LnRvRXF1YWwoaW5pdGlhbENvbG9yQ291bnQpXG5cbiAgICAgIGxpcyA9IHBhbGV0dGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpJylcblxuICAgICAgZXhwZWN0KGxpcy5sZW5ndGgpLm5vdC50b0VxdWFsKGluaXRpYWxDb2xvckNvdW50KVxuIl19

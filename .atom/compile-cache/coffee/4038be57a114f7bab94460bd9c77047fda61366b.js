(function() {
  var CompositeDisposable, EventsDelegation, Palette, PaletteElement, SpacePenDSL, StickyTitle, THEME_VARIABLES, pigments, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-utils'), SpacePenDSL = ref.SpacePenDSL, EventsDelegation = ref.EventsDelegation, registerOrUpdateElement = ref.registerOrUpdateElement;

  ref1 = [], CompositeDisposable = ref1[0], THEME_VARIABLES = ref1[1], pigments = ref1[2], Palette = ref1[3], StickyTitle = ref1[4];

  PaletteElement = (function(superClass) {
    extend(PaletteElement, superClass);

    function PaletteElement() {
      return PaletteElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(PaletteElement);

    EventsDelegation.includeInto(PaletteElement);

    PaletteElement.content = function() {
      var group, merge, optAttrs, sort;
      sort = atom.config.get('pigments.sortPaletteColors');
      group = atom.config.get('pigments.groupPaletteColors');
      merge = atom.config.get('pigments.mergeColorDuplicates');
      optAttrs = function(bool, name, attrs) {
        if (bool) {
          attrs[name] = name;
        }
        return attrs;
      };
      return this.div({
        "class": 'pigments-palette-panel'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'pigments-palette-controls settings-view pane-item'
          }, function() {
            return _this.div({
              "class": 'pigments-palette-controls-wrapper'
            }, function() {
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Sort Colors');
                return _this.select({
                  outlet: 'sort',
                  id: 'sort-palette-colors'
                }, function() {
                  _this.option(optAttrs(sort === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  _this.option(optAttrs(sort === 'by name', 'selected', {
                    value: 'by name'
                  }), 'By Name');
                  return _this.option(optAttrs(sort === 'by file', 'selected', {
                    value: 'by color'
                  }), 'By Color');
                });
              });
              _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.label({
                  "for": 'sort-palette-colors'
                }, 'Group Colors');
                return _this.select({
                  outlet: 'group',
                  id: 'group-palette-colors'
                }, function() {
                  _this.option(optAttrs(group === 'none', 'selected', {
                    value: 'none'
                  }), 'None');
                  return _this.option(optAttrs(group === 'by file', 'selected', {
                    value: 'by file'
                  }), 'By File');
                });
              });
              return _this.span({
                "class": 'input-group-inline'
              }, function() {
                _this.input(optAttrs(merge, 'checked', {
                  type: 'checkbox',
                  id: 'merge-duplicates',
                  outlet: 'merge'
                }));
                return _this.label({
                  "for": 'merge-duplicates'
                }, 'Merge Duplicates');
              });
            });
          });
          return _this.div({
            "class": 'pigments-palette-list native-key-bindings',
            tabindex: -1
          }, function() {
            return _this.ol({
              outlet: 'list'
            });
          });
        };
      })(this));
    };

    PaletteElement.prototype.createdCallback = function() {
      var subscription;
      if (pigments == null) {
        pigments = require('./pigments');
      }
      this.project = pigments.getProject();
      if (this.project != null) {
        return this.init();
      } else {
        return subscription = atom.packages.onDidActivatePackage((function(_this) {
          return function(pkg) {
            if (pkg.name === 'pigments') {
              subscription.dispose();
              _this.project = pigments.getProject();
              return _this.init();
            }
          };
        })(this));
      }
    };

    PaletteElement.prototype.init = function() {
      if (this.project.isDestroyed()) {
        return;
      }
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.project.onDidUpdateVariables((function(_this) {
        return function() {
          if (_this.palette != null) {
            _this.palette.variables = _this.project.getColorVariables();
            if (_this.attached) {
              return _this.renderList();
            }
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.sortPaletteColors', (function(_this) {
        return function(sortPaletteColors) {
          _this.sortPaletteColors = sortPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.groupPaletteColors', (function(_this) {
        return function(groupPaletteColors) {
          _this.groupPaletteColors = groupPaletteColors;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.mergeColorDuplicates', (function(_this) {
        return function(mergeColorDuplicates) {
          _this.mergeColorDuplicates = mergeColorDuplicates;
          if ((_this.palette != null) && _this.attached) {
            return _this.renderList();
          }
        };
      })(this)));
      this.subscriptions.add(this.subscribeTo(this.sort, {
        'change': function(e) {
          return atom.config.set('pigments.sortPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.group, {
        'change': function(e) {
          return atom.config.set('pigments.groupPaletteColors', e.target.value);
        }
      }));
      this.subscriptions.add(this.subscribeTo(this.merge, {
        'change': function(e) {
          return atom.config.set('pigments.mergeColorDuplicates', e.target.checked);
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this.list, '[data-variable-id]', {
        'click': (function(_this) {
          return function(e) {
            var variable, variableId;
            variableId = Number(e.target.dataset.variableId);
            variable = _this.project.getVariableById(variableId);
            return _this.project.showVariableInFile(variable);
          };
        })(this)
      }));
    };

    PaletteElement.prototype.attachedCallback = function() {
      if (this.palette != null) {
        this.renderList();
      }
      return this.attached = true;
    };

    PaletteElement.prototype.detachedCallback = function() {
      this.subscriptions.dispose();
      return this.attached = false;
    };

    PaletteElement.prototype.getModel = function() {
      return this.palette;
    };

    PaletteElement.prototype.setModel = function(palette1) {
      this.palette = palette1;
      if (this.attached) {
        return this.renderList();
      }
    };

    PaletteElement.prototype.getColorsList = function(palette) {
      switch (this.sortPaletteColors) {
        case 'by color':
          return palette.sortedByColor();
        case 'by name':
          return palette.sortedByName();
        default:
          return palette.variables.slice();
      }
    };

    PaletteElement.prototype.renderList = function() {
      var file, li, ol, palette, palettes, ref2;
      if ((ref2 = this.stickyTitle) != null) {
        ref2.dispose();
      }
      this.list.innerHTML = '';
      if (this.groupPaletteColors === 'by file') {
        if (StickyTitle == null) {
          StickyTitle = require('./sticky-title');
        }
        palettes = this.getFilesPalettes();
        for (file in palettes) {
          palette = palettes[file];
          li = document.createElement('li');
          li.className = 'pigments-color-group';
          ol = document.createElement('ol');
          li.appendChild(this.getGroupHeader(atom.project.relativize(file)));
          li.appendChild(ol);
          this.buildList(ol, this.getColorsList(palette));
          this.list.appendChild(li);
        }
        return this.stickyTitle = new StickyTitle(this.list.querySelectorAll('.pigments-color-group-header-content'), this.querySelector('.pigments-palette-list'));
      } else {
        return this.buildList(this.list, this.getColorsList(this.palette));
      }
    };

    PaletteElement.prototype.getGroupHeader = function(label) {
      var content, header;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      header = document.createElement('div');
      header.className = 'pigments-color-group-header';
      content = document.createElement('div');
      content.className = 'pigments-color-group-header-content';
      if (label === THEME_VARIABLES) {
        content.textContent = 'Atom Themes';
      } else {
        content.textContent = label;
      }
      header.appendChild(content);
      return header;
    };

    PaletteElement.prototype.getFilesPalettes = function() {
      var palettes;
      if (Palette == null) {
        Palette = require('./palette');
      }
      palettes = {};
      this.palette.eachColor((function(_this) {
        return function(variable) {
          var path;
          path = variable.path;
          if (palettes[path] == null) {
            palettes[path] = new Palette([]);
          }
          return palettes[path].variables.push(variable);
        };
      })(this));
      return palettes;
    };

    PaletteElement.prototype.buildList = function(container, paletteColors) {
      var color, html, i, id, isAlternate, j, len, len1, li, line, name, path, ref2, ref3, results1, variables;
      if (THEME_VARIABLES == null) {
        THEME_VARIABLES = require('./uris').THEME_VARIABLES;
      }
      paletteColors = this.checkForDuplicates(paletteColors);
      results1 = [];
      for (i = 0, len = paletteColors.length; i < len; i++) {
        variables = paletteColors[i];
        li = document.createElement('li');
        li.className = 'pigments-color-item';
        ref2 = variables[0], color = ref2.color, isAlternate = ref2.isAlternate;
        if (isAlternate) {
          continue;
        }
        if (color.toCSS == null) {
          continue;
        }
        html = "<div class=\"pigments-color\">\n  <span class=\"pigments-color-preview\"\n        style=\"background-color: " + (color.toCSS()) + "\">\n  </span>\n  <span class=\"pigments-color-properties\">\n    <span class=\"pigments-color-component\"><strong>R:</strong> " + (Math.round(color.red)) + "</span>\n    <span class=\"pigments-color-component\"><strong>G:</strong> " + (Math.round(color.green)) + "</span>\n    <span class=\"pigments-color-component\"><strong>B:</strong> " + (Math.round(color.blue)) + "</span>\n    <span class=\"pigments-color-component\"><strong>A:</strong> " + (Math.round(color.alpha * 1000) / 1000) + "</span>\n  </span>\n</div>\n<div class=\"pigments-color-details\">";
        for (j = 0, len1 = variables.length; j < len1; j++) {
          ref3 = variables[j], name = ref3.name, path = ref3.path, line = ref3.line, id = ref3.id;
          html += "<span class=\"pigments-color-occurence\">\n    <span class=\"name\">" + name + "</span>";
          if (path !== THEME_VARIABLES) {
            html += "<span data-variable-id=\"" + id + "\">\n  <span class=\"path\">" + (atom.project.relativize(path)) + "</span>\n  <span class=\"line\">at line " + (line + 1) + "</span>\n</span>";
          }
          html += '</span>';
        }
        html += '</div>';
        li.innerHTML = html;
        results1.push(container.appendChild(li));
      }
      return results1;
    };

    PaletteElement.prototype.checkForDuplicates = function(paletteColors) {
      var colors, findColor, i, key, len, map, results, v;
      results = [];
      if (this.mergeColorDuplicates) {
        map = new Map();
        colors = [];
        findColor = function(color) {
          var col, i, len;
          for (i = 0, len = colors.length; i < len; i++) {
            col = colors[i];
            if (typeof col.isEqual === "function" ? col.isEqual(color) : void 0) {
              return col;
            }
          }
        };
        for (i = 0, len = paletteColors.length; i < len; i++) {
          v = paletteColors[i];
          if (key = findColor(v.color)) {
            map.get(key).push(v);
          } else {
            map.set(v.color, [v]);
            colors.push(v.color);
          }
        }
        map.forEach(function(vars, color) {
          return results.push(vars);
        });
        return results;
      } else {
        return (function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = paletteColors.length; j < len1; j++) {
            v = paletteColors[j];
            results1.push([v]);
          }
          return results1;
        })();
      }
    };

    return PaletteElement;

  })(HTMLElement);

  module.exports = PaletteElement = registerOrUpdateElement('pigments-palette', PaletteElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9wYWxldHRlLWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1SkFBQTtJQUFBOzs7RUFBQSxNQUEyRCxPQUFBLENBQVEsWUFBUixDQUEzRCxFQUFDLDZCQUFELEVBQWMsdUNBQWQsRUFBZ0M7O0VBRWhDLE9BQXlFLEVBQXpFLEVBQUMsNkJBQUQsRUFBc0IseUJBQXRCLEVBQXVDLGtCQUF2QyxFQUFpRCxpQkFBakQsRUFBMEQ7O0VBRXBEOzs7Ozs7O0lBQ0osV0FBVyxDQUFDLFdBQVosQ0FBd0IsY0FBeEI7O0lBQ0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsY0FBN0I7O0lBRUEsY0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCO01BQ1AsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEI7TUFDUixLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQjtNQUNSLFFBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsS0FBYjtRQUNULElBQXNCLElBQXRCO1VBQUEsS0FBTSxDQUFBLElBQUEsQ0FBTixHQUFjLEtBQWQ7O2VBQ0E7TUFGUzthQUlYLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO09BQUwsRUFBc0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BDLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1EQUFQO1dBQUwsRUFBaUUsU0FBQTttQkFDL0QsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FB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LCBFdmVudHNEZWxlZ2F0aW9uLCByZWdpc3Rlck9yVXBkYXRlRWxlbWVudH0gPSByZXF1aXJlICdhdG9tLXV0aWxzJ1xuXG5bQ29tcG9zaXRlRGlzcG9zYWJsZSwgVEhFTUVfVkFSSUFCTEVTLCBwaWdtZW50cywgUGFsZXR0ZSwgU3RpY2t5VGl0bGVdID0gW11cblxuY2xhc3MgUGFsZXR0ZUVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudFxuICBTcGFjZVBlbkRTTC5pbmNsdWRlSW50byh0aGlzKVxuICBFdmVudHNEZWxlZ2F0aW9uLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgc29ydCA9IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMuc29ydFBhbGV0dGVDb2xvcnMnKVxuICAgIGdyb3VwID0gYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5ncm91cFBhbGV0dGVDb2xvcnMnKVxuICAgIG1lcmdlID0gYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5tZXJnZUNvbG9yRHVwbGljYXRlcycpXG4gICAgb3B0QXR0cnMgPSAoYm9vbCwgbmFtZSwgYXR0cnMpIC0+XG4gICAgICBhdHRyc1tuYW1lXSA9IG5hbWUgaWYgYm9vbFxuICAgICAgYXR0cnNcblxuICAgIEBkaXYgY2xhc3M6ICdwaWdtZW50cy1wYWxldHRlLXBhbmVsJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwaWdtZW50cy1wYWxldHRlLWNvbnRyb2xzIHNldHRpbmdzLXZpZXcgcGFuZS1pdGVtJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ3BpZ21lbnRzLXBhbGV0dGUtY29udHJvbHMtd3JhcHBlcicsID0+XG4gICAgICAgICAgQHNwYW4gY2xhc3M6ICdpbnB1dC1ncm91cC1pbmxpbmUnLCA9PlxuICAgICAgICAgICAgQGxhYmVsIGZvcjogJ3NvcnQtcGFsZXR0ZS1jb2xvcnMnLCAnU29ydCBDb2xvcnMnXG4gICAgICAgICAgICBAc2VsZWN0IG91dGxldDogJ3NvcnQnLCBpZDogJ3NvcnQtcGFsZXR0ZS1jb2xvcnMnLCA9PlxuICAgICAgICAgICAgICBAb3B0aW9uIG9wdEF0dHJzKHNvcnQgaXMgJ25vbmUnLCAnc2VsZWN0ZWQnLCB2YWx1ZTogJ25vbmUnKSwgJ05vbmUnXG4gICAgICAgICAgICAgIEBvcHRpb24gb3B0QXR0cnMoc29ydCBpcyAnYnkgbmFtZScsICdzZWxlY3RlZCcsIHZhbHVlOiAnYnkgbmFtZScpLCAnQnkgTmFtZSdcbiAgICAgICAgICAgICAgQG9wdGlvbiBvcHRBdHRycyhzb3J0IGlzICdieSBmaWxlJywgJ3NlbGVjdGVkJywgdmFsdWU6ICdieSBjb2xvcicpLCAnQnkgQ29sb3InXG5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2lucHV0LWdyb3VwLWlubGluZScsID0+XG4gICAgICAgICAgICBAbGFiZWwgZm9yOiAnc29ydC1wYWxldHRlLWNvbG9ycycsICdHcm91cCBDb2xvcnMnXG4gICAgICAgICAgICBAc2VsZWN0IG91dGxldDogJ2dyb3VwJywgaWQ6ICdncm91cC1wYWxldHRlLWNvbG9ycycsID0+XG4gICAgICAgICAgICAgIEBvcHRpb24gb3B0QXR0cnMoZ3JvdXAgaXMgJ25vbmUnLCAnc2VsZWN0ZWQnLCB2YWx1ZTogJ25vbmUnKSwgJ05vbmUnXG4gICAgICAgICAgICAgIEBvcHRpb24gb3B0QXR0cnMoZ3JvdXAgaXMgJ2J5IGZpbGUnLCAnc2VsZWN0ZWQnLCB2YWx1ZTogJ2J5IGZpbGUnKSwgJ0J5IEZpbGUnXG5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2lucHV0LWdyb3VwLWlubGluZScsID0+XG4gICAgICAgICAgICBAaW5wdXQgb3B0QXR0cnMgbWVyZ2UsICdjaGVja2VkJywgdHlwZTogJ2NoZWNrYm94JywgaWQ6ICdtZXJnZS1kdXBsaWNhdGVzJywgb3V0bGV0OiAnbWVyZ2UnXG4gICAgICAgICAgICBAbGFiZWwgZm9yOiAnbWVyZ2UtZHVwbGljYXRlcycsICdNZXJnZSBEdXBsaWNhdGVzJ1xuXG4gICAgICBAZGl2IGNsYXNzOiAncGlnbWVudHMtcGFsZXR0ZS1saXN0IG5hdGl2ZS1rZXktYmluZGluZ3MnLCB0YWJpbmRleDogLTEsID0+XG4gICAgICAgIEBvbCBvdXRsZXQ6ICdsaXN0J1xuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICBwaWdtZW50cyA/PSByZXF1aXJlICcuL3BpZ21lbnRzJ1xuXG4gICAgQHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcblxuICAgIGlmIEBwcm9qZWN0P1xuICAgICAgQGluaXQoKVxuICAgIGVsc2VcbiAgICAgIHN1YnNjcmlwdGlvbiA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBrZykgPT5cbiAgICAgICAgaWYgcGtnLm5hbWUgaXMgJ3BpZ21lbnRzJ1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICAgICAgICBAcHJvamVjdCA9IHBpZ21lbnRzLmdldFByb2plY3QoKVxuICAgICAgICAgIEBpbml0KClcblxuICBpbml0OiAtPlxuICAgIHJldHVybiBpZiBAcHJvamVjdC5pc0Rlc3Ryb3llZCgpXG5cbiAgICBDb21wb3NpdGVEaXNwb3NhYmxlID89IHJlcXVpcmUoJ2F0b20nKS5Db21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwcm9qZWN0Lm9uRGlkVXBkYXRlVmFyaWFibGVzID0+XG4gICAgICBpZiBAcGFsZXR0ZT9cbiAgICAgICAgQHBhbGV0dGUudmFyaWFibGVzID0gQHByb2plY3QuZ2V0Q29sb3JWYXJpYWJsZXMoKVxuICAgICAgICBAcmVuZGVyTGlzdCgpIGlmIEBhdHRhY2hlZFxuXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMuc29ydFBhbGV0dGVDb2xvcnMnLCAoQHNvcnRQYWxldHRlQ29sb3JzKSA9PlxuICAgICAgQHJlbmRlckxpc3QoKSBpZiBAcGFsZXR0ZT8gYW5kIEBhdHRhY2hlZFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLmdyb3VwUGFsZXR0ZUNvbG9ycycsIChAZ3JvdXBQYWxldHRlQ29sb3JzKSA9PlxuICAgICAgQHJlbmRlckxpc3QoKSBpZiBAcGFsZXR0ZT8gYW5kIEBhdHRhY2hlZFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLm1lcmdlQ29sb3JEdXBsaWNhdGVzJywgKEBtZXJnZUNvbG9yRHVwbGljYXRlcykgPT5cbiAgICAgIEByZW5kZXJMaXN0KCkgaWYgQHBhbGV0dGU/IGFuZCBAYXR0YWNoZWRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gQHNvcnQsICdjaGFuZ2UnOiAoZSkgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc29ydFBhbGV0dGVDb2xvcnMnLCBlLnRhcmdldC52YWx1ZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBzdWJzY3JpYmVUbyBAZ3JvdXAsICdjaGFuZ2UnOiAoZSkgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuZ3JvdXBQYWxldHRlQ29sb3JzJywgZS50YXJnZXQudmFsdWVcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gQG1lcmdlLCAnY2hhbmdlJzogKGUpIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLm1lcmdlQ29sb3JEdXBsaWNhdGVzJywgZS50YXJnZXQuY2hlY2tlZFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBzdWJzY3JpYmVUbyBAbGlzdCwgJ1tkYXRhLXZhcmlhYmxlLWlkXScsICdjbGljayc6IChlKSA9PlxuICAgICAgdmFyaWFibGVJZCA9IE51bWJlcihlLnRhcmdldC5kYXRhc2V0LnZhcmlhYmxlSWQpXG4gICAgICB2YXJpYWJsZSA9IEBwcm9qZWN0LmdldFZhcmlhYmxlQnlJZCh2YXJpYWJsZUlkKVxuXG4gICAgICBAcHJvamVjdC5zaG93VmFyaWFibGVJbkZpbGUodmFyaWFibGUpXG5cbiAgYXR0YWNoZWRDYWxsYmFjazogLT5cbiAgICBAcmVuZGVyTGlzdCgpIGlmIEBwYWxldHRlP1xuICAgIEBhdHRhY2hlZCA9IHRydWVcblxuICBkZXRhY2hlZENhbGxiYWNrOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBhdHRhY2hlZCA9IGZhbHNlXG5cbiAgZ2V0TW9kZWw6IC0+IEBwYWxldHRlXG5cbiAgc2V0TW9kZWw6IChAcGFsZXR0ZSkgLT4gQHJlbmRlckxpc3QoKSBpZiBAYXR0YWNoZWRcblxuICBnZXRDb2xvcnNMaXN0OiAocGFsZXR0ZSkgLT5cbiAgICBzd2l0Y2ggQHNvcnRQYWxldHRlQ29sb3JzXG4gICAgICB3aGVuICdieSBjb2xvcicgdGhlbiBwYWxldHRlLnNvcnRlZEJ5Q29sb3IoKVxuICAgICAgd2hlbiAnYnkgbmFtZScgdGhlbiBwYWxldHRlLnNvcnRlZEJ5TmFtZSgpXG4gICAgICBlbHNlIHBhbGV0dGUudmFyaWFibGVzLnNsaWNlKClcblxuICByZW5kZXJMaXN0OiAtPlxuICAgIEBzdGlja3lUaXRsZT8uZGlzcG9zZSgpXG4gICAgQGxpc3QuaW5uZXJIVE1MID0gJydcblxuICAgIGlmIEBncm91cFBhbGV0dGVDb2xvcnMgaXMgJ2J5IGZpbGUnXG4gICAgICBTdGlja3lUaXRsZSA/PSByZXF1aXJlICcuL3N0aWNreS10aXRsZSdcblxuICAgICAgcGFsZXR0ZXMgPSBAZ2V0RmlsZXNQYWxldHRlcygpXG4gICAgICBmb3IgZmlsZSwgcGFsZXR0ZSBvZiBwYWxldHRlc1xuICAgICAgICBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgbGkuY2xhc3NOYW1lID0gJ3BpZ21lbnRzLWNvbG9yLWdyb3VwJ1xuICAgICAgICBvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29sJylcblxuICAgICAgICBsaS5hcHBlbmRDaGlsZCBAZ2V0R3JvdXBIZWFkZXIoYXRvbS5wcm9qZWN0LnJlbGF0aXZpemUoZmlsZSkpXG4gICAgICAgIGxpLmFwcGVuZENoaWxkIG9sXG4gICAgICAgIEBidWlsZExpc3Qob2wsIEBnZXRDb2xvcnNMaXN0KHBhbGV0dGUpKVxuICAgICAgICBAbGlzdC5hcHBlbmRDaGlsZChsaSlcblxuICAgICAgQHN0aWNreVRpdGxlID0gbmV3IFN0aWNreVRpdGxlKFxuICAgICAgICBAbGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcucGlnbWVudHMtY29sb3ItZ3JvdXAtaGVhZGVyLWNvbnRlbnQnKSxcbiAgICAgICAgQHF1ZXJ5U2VsZWN0b3IoJy5waWdtZW50cy1wYWxldHRlLWxpc3QnKVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBidWlsZExpc3QoQGxpc3QsIEBnZXRDb2xvcnNMaXN0KEBwYWxldHRlKSlcblxuICBnZXRHcm91cEhlYWRlcjogKGxhYmVsKSAtPlxuICAgIFRIRU1FX1ZBUklBQkxFUyA/PSByZXF1aXJlKCcuL3VyaXMnKS5USEVNRV9WQVJJQUJMRVNcblxuICAgIGhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgaGVhZGVyLmNsYXNzTmFtZSA9ICdwaWdtZW50cy1jb2xvci1ncm91cC1oZWFkZXInXG5cbiAgICBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBjb250ZW50LmNsYXNzTmFtZSA9ICdwaWdtZW50cy1jb2xvci1ncm91cC1oZWFkZXItY29udGVudCdcbiAgICBpZiBsYWJlbCBpcyBUSEVNRV9WQVJJQUJMRVNcbiAgICAgIGNvbnRlbnQudGV4dENvbnRlbnQgPSAnQXRvbSBUaGVtZXMnXG4gICAgZWxzZVxuICAgICAgY29udGVudC50ZXh0Q29udGVudCA9IGxhYmVsXG5cbiAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoY29udGVudClcbiAgICBoZWFkZXJcblxuICBnZXRGaWxlc1BhbGV0dGVzOiAtPlxuICAgIFBhbGV0dGUgPz0gcmVxdWlyZSAnLi9wYWxldHRlJ1xuXG4gICAgcGFsZXR0ZXMgPSB7fVxuXG4gICAgQHBhbGV0dGUuZWFjaENvbG9yICh2YXJpYWJsZSkgPT5cbiAgICAgIHtwYXRofSA9IHZhcmlhYmxlXG5cbiAgICAgIHBhbGV0dGVzW3BhdGhdID89IG5ldyBQYWxldHRlIFtdXG4gICAgICBwYWxldHRlc1twYXRoXS52YXJpYWJsZXMucHVzaCh2YXJpYWJsZSlcblxuICAgIHBhbGV0dGVzXG5cbiAgYnVpbGRMaXN0OiAoY29udGFpbmVyLCBwYWxldHRlQ29sb3JzKSAtPlxuICAgIFRIRU1FX1ZBUklBQkxFUyA/PSByZXF1aXJlKCcuL3VyaXMnKS5USEVNRV9WQVJJQUJMRVNcblxuICAgIHBhbGV0dGVDb2xvcnMgPSBAY2hlY2tGb3JEdXBsaWNhdGVzKHBhbGV0dGVDb2xvcnMpXG4gICAgZm9yIHZhcmlhYmxlcyBpbiBwYWxldHRlQ29sb3JzXG4gICAgICBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgIGxpLmNsYXNzTmFtZSA9ICdwaWdtZW50cy1jb2xvci1pdGVtJ1xuICAgICAge2NvbG9yLCBpc0FsdGVybmF0ZX0gPSB2YXJpYWJsZXNbMF1cblxuICAgICAgY29udGludWUgaWYgaXNBbHRlcm5hdGVcbiAgICAgIGNvbnRpbnVlIHVubGVzcyBjb2xvci50b0NTUz9cblxuICAgICAgaHRtbCA9IFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicGlnbWVudHMtY29sb3ItcHJldmlld1wiXG4gICAgICAgICAgICAgIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogI3tjb2xvci50b0NTUygpfVwiPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicGlnbWVudHMtY29sb3ItcHJvcGVydGllc1wiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGlnbWVudHMtY29sb3ItY29tcG9uZW50XCI+PHN0cm9uZz5SOjwvc3Ryb25nPiAje01hdGgucm91bmQgY29sb3IucmVkfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLWNvbXBvbmVudFwiPjxzdHJvbmc+Rzo8L3N0cm9uZz4gI3tNYXRoLnJvdW5kIGNvbG9yLmdyZWVufTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpZ21lbnRzLWNvbG9yLWNvbXBvbmVudFwiPjxzdHJvbmc+Qjo8L3N0cm9uZz4gI3tNYXRoLnJvdW5kIGNvbG9yLmJsdWV9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGlnbWVudHMtY29sb3ItY29tcG9uZW50XCI+PHN0cm9uZz5BOjwvc3Ryb25nPiAje01hdGgucm91bmQoY29sb3IuYWxwaGEgKiAxMDAwKSAvIDEwMDB9PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwaWdtZW50cy1jb2xvci1kZXRhaWxzXCI+XG4gICAgICBcIlwiXCJcblxuICAgICAgZm9yIHtuYW1lLCBwYXRoLCBsaW5lLCBpZH0gaW4gdmFyaWFibGVzXG4gICAgICAgIGh0bWwgKz0gXCJcIlwiXG4gICAgICAgIDxzcGFuIGNsYXNzPVwicGlnbWVudHMtY29sb3Itb2NjdXJlbmNlXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm5hbWVcIj4je25hbWV9PC9zcGFuPlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBpZiBwYXRoIGlzbnQgVEhFTUVfVkFSSUFCTEVTXG4gICAgICAgICAgaHRtbCArPSBcIlwiXCJcbiAgICAgICAgICA8c3BhbiBkYXRhLXZhcmlhYmxlLWlkPVwiI3tpZH1cIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGF0aFwiPiN7YXRvbS5wcm9qZWN0LnJlbGF0aXZpemUocGF0aCl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaW5lXCI+YXQgbGluZSAje2xpbmUgKyAxfTwvc3Bhbj5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaHRtbCArPSAnPC9zcGFuPidcblxuICAgICAgaHRtbCArPSAnPC9kaXY+J1xuXG4gICAgICBsaS5pbm5lckhUTUwgPSBodG1sXG5cbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChsaSlcblxuICBjaGVja0ZvckR1cGxpY2F0ZXM6IChwYWxldHRlQ29sb3JzKSAtPlxuICAgIHJlc3VsdHMgPSBbXVxuICAgIGlmIEBtZXJnZUNvbG9yRHVwbGljYXRlc1xuICAgICAgbWFwID0gbmV3IE1hcCgpXG5cbiAgICAgIGNvbG9ycyA9IFtdXG5cbiAgICAgIGZpbmRDb2xvciA9IChjb2xvcikgLT5cbiAgICAgICAgcmV0dXJuIGNvbCBmb3IgY29sIGluIGNvbG9ycyB3aGVuIGNvbC5pc0VxdWFsPyhjb2xvcilcblxuICAgICAgZm9yIHYgaW4gcGFsZXR0ZUNvbG9yc1xuICAgICAgICBpZiBrZXkgPSBmaW5kQ29sb3Iodi5jb2xvcilcbiAgICAgICAgICBtYXAuZ2V0KGtleSkucHVzaCh2KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWFwLnNldCh2LmNvbG9yLCBbdl0pXG4gICAgICAgICAgY29sb3JzLnB1c2godi5jb2xvcilcblxuICAgICAgbWFwLmZvckVhY2ggKHZhcnMsIGNvbG9yKSAtPiByZXN1bHRzLnB1c2ggdmFyc1xuXG4gICAgICByZXR1cm4gcmVzdWx0c1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAoW3ZdIGZvciB2IGluIHBhbGV0dGVDb2xvcnMpXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuUGFsZXR0ZUVsZW1lbnQgPVxucmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnQgJ3BpZ21lbnRzLXBhbGV0dGUnLCBQYWxldHRlRWxlbWVudC5wcm90b3R5cGVcbiJdfQ==

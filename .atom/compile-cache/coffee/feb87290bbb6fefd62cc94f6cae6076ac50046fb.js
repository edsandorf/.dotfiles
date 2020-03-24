(function() {
  var ColorProjectElement, CompositeDisposable, EventsDelegation, SpacePenDSL, capitalize, ref, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-utils'), SpacePenDSL = ref.SpacePenDSL, EventsDelegation = ref.EventsDelegation, registerOrUpdateElement = ref.registerOrUpdateElement;

  CompositeDisposable = null;

  capitalize = function(s) {
    return s.replace(/^./, function(m) {
      return m.toUpperCase();
    });
  };

  ColorProjectElement = (function(superClass) {
    extend(ColorProjectElement, superClass);

    function ColorProjectElement() {
      return ColorProjectElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorProjectElement);

    EventsDelegation.includeInto(ColorProjectElement);

    ColorProjectElement.content = function() {
      var arrayField, booleanField, selectField;
      arrayField = (function(_this) {
        return function(name, label, setting, description) {
          var settingName;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.tag('atom-text-editor', {
                  mini: true,
                  outlet: name,
                  type: 'array',
                  property: name
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName).join(', ')) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                });
              });
            });
          });
        };
      })(this);
      selectField = (function(_this) {
        return function(name, label, arg) {
          var description, options, ref1, setting, settingName, useBoolean;
          ref1 = arg != null ? arg : {}, options = ref1.options, setting = ref1.setting, description = ref1.description, useBoolean = ref1.useBoolean;
          settingName = "pigments." + name;
          return _this.div({
            "class": 'control-group array'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.label({
                "class": 'control-label'
              }, function() {
                return _this.span({
                  "class": 'setting-title'
                }, label);
              });
              return _this.div({
                "class": 'control-wrapper'
              }, function() {
                _this.select({
                  outlet: name,
                  "class": 'form-control',
                  required: true
                }, function() {
                  return options.forEach(function(option) {
                    if (option === '') {
                      return _this.option({
                        value: option
                      }, 'Use global config');
                    } else {
                      return _this.option({
                        value: option
                      }, capitalize(option));
                    }
                  });
                });
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  _this.div(function() {
                    _this.raw("Global config: <code>" + (atom.config.get(setting != null ? setting : settingName)) + "</code>");
                    if (description != null) {
                      return _this.p(function() {
                        return _this.raw(description);
                      });
                    }
                  });
                  if (useBoolean) {
                    return booleanField("ignoreGlobal" + (capitalize(name)), 'Ignore Global', null, true);
                  }
                });
              });
            });
          });
        };
      })(this);
      booleanField = (function(_this) {
        return function(name, label, description, nested) {
          return _this.div({
            "class": 'control-group boolean'
          }, function() {
            return _this.div({
              "class": 'controls'
            }, function() {
              _this.input({
                type: 'checkbox',
                id: "pigments-" + name,
                outlet: name
              });
              _this.label({
                "class": 'control-label',
                "for": "pigments-" + name
              }, function() {
                return _this.span({
                  "class": (nested ? 'setting-description' : 'setting-title')
                }, label);
              });
              if (description != null) {
                return _this.div({
                  "class": 'setting-description'
                }, function() {
                  return _this.raw(description);
                });
              }
            });
          });
        };
      })(this);
      return this.section({
        "class": 'settings-view pane-item'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'settings-wrapper'
          }, function() {
            _this.div({
              "class": 'header'
            }, function() {
              _this.div({
                "class": 'logo'
              }, function() {
                return _this.img({
                  src: 'atom://pigments/resources/logo.svg',
                  width: 140,
                  height: 35
                });
              });
              return _this.p({
                "class": 'setting-description'
              }, "These settings apply on the current project only and are complementary\nto the package settings.");
            });
            return _this.div({
              "class": 'fields'
            }, function() {
              var themes;
              themes = atom.themes.getActiveThemeNames();
              arrayField('sourceNames', 'Source Names');
              arrayField('ignoredNames', 'Ignored Names');
              arrayField('supportedFiletypes', 'Supported Filetypes');
              arrayField('ignoredScopes', 'Ignored Scopes');
              arrayField('searchNames', 'Extended Search Names', 'pigments.extendedSearchNames');
              selectField('sassShadeAndTintImplementation', 'Sass Shade And Tint Implementation', {
                options: ['', 'compass', 'bourbon'],
                setting: 'pigments.sassShadeAndTintImplementation',
                description: "Sass doesn't provide any implementation for shade and tint function, and Compass and Bourbon have different implementation for these two methods. This setting allow you to chose which implementation use."
              });
              return booleanField('includeThemes', 'Include Atom Themes Stylesheets', "The variables from <code>" + themes[0] + "</code> and\n<code>" + themes[1] + "</code> themes will be automatically added to the\nproject palette.");
            });
          });
        };
      })(this));
    };

    ColorProjectElement.prototype.createdCallback = function() {
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      return this.subscriptions = new CompositeDisposable;
    };

    ColorProjectElement.prototype.setModel = function(project) {
      this.project = project;
      return this.initializeBindings();
    };

    ColorProjectElement.prototype.initializeBindings = function() {
      var grammar;
      grammar = atom.grammars.grammarForScopeName('source.js.regexp');
      this.ignoredScopes.getModel().setGrammar(grammar);
      this.initializeTextEditor('sourceNames');
      this.initializeTextEditor('searchNames');
      this.initializeTextEditor('ignoredNames');
      this.initializeTextEditor('ignoredScopes');
      this.initializeTextEditor('supportedFiletypes');
      this.initializeCheckbox('includeThemes');
      this.initializeCheckbox('ignoreGlobalSourceNames');
      this.initializeCheckbox('ignoreGlobalIgnoredNames');
      this.initializeCheckbox('ignoreGlobalIgnoredScopes');
      this.initializeCheckbox('ignoreGlobalSearchNames');
      this.initializeCheckbox('ignoreGlobalSupportedFiletypes');
      return this.initializeSelect('sassShadeAndTintImplementation');
    };

    ColorProjectElement.prototype.initializeTextEditor = function(name) {
      var capitalizedName, editor, ref1;
      capitalizedName = capitalize(name);
      editor = this[name].getModel();
      editor.setText(((ref1 = this.project[name]) != null ? ref1 : []).join(', '));
      return this.subscriptions.add(editor.onDidStopChanging((function(_this) {
        return function() {
          var array;
          array = editor.getText().split(/\s*,\s*/g).filter(function(s) {
            return s.length > 0;
          });
          return _this.project["set" + capitalizedName](array);
        };
      })(this)));
    };

    ColorProjectElement.prototype.initializeSelect = function(name) {
      var capitalizedName, optionValues, select;
      capitalizedName = capitalize(name);
      select = this[name];
      optionValues = [].slice.call(select.querySelectorAll('option')).map(function(o) {
        return o.value;
      });
      if (this.project[name]) {
        select.selectedIndex = optionValues.indexOf(this.project[name]);
      }
      return this.subscriptions.add(this.subscribeTo(select, {
        change: (function(_this) {
          return function() {
            var ref1, value;
            value = (ref1 = select.selectedOptions[0]) != null ? ref1.value : void 0;
            return _this.project["set" + capitalizedName](value === '' ? null : value);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.initializeCheckbox = function(name) {
      var capitalizedName, checkbox;
      capitalizedName = capitalize(name);
      checkbox = this[name];
      checkbox.checked = this.project[name];
      return this.subscriptions.add(this.subscribeTo(checkbox, {
        change: (function(_this) {
          return function() {
            return _this.project["set" + capitalizedName](checkbox.checked);
          };
        })(this)
      }));
    };

    ColorProjectElement.prototype.getTitle = function() {
      return 'Project Settings';
    };

    ColorProjectElement.prototype.getURI = function() {
      return 'pigments://settings';
    };

    ColorProjectElement.prototype.getIconName = function() {
      return "pigments";
    };

    ColorProjectElement.prototype.serialize = function() {
      return {
        deserializer: 'ColorProjectElement'
      };
    };

    return ColorProjectElement;

  })(HTMLElement);

  module.exports = ColorProjectElement = registerOrUpdateElement('pigments-color-project', ColorProjectElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1wcm9qZWN0LWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpSEFBQTtJQUFBOzs7RUFBQSxNQUEyRCxPQUFBLENBQVEsWUFBUixDQUEzRCxFQUFDLDZCQUFELEVBQWMsdUNBQWQsRUFBZ0M7O0VBQ2hDLG1CQUFBLEdBQXNCOztFQUV0QixVQUFBLEdBQWEsU0FBQyxDQUFEO1dBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxJQUFWLEVBQWdCLFNBQUMsQ0FBRDthQUFPLENBQUMsQ0FBQyxXQUFGLENBQUE7SUFBUCxDQUFoQjtFQUFQOztFQUVQOzs7Ozs7O0lBQ0osV0FBVyxDQUFDLFdBQVosQ0FBd0IsbUJBQXhCOztJQUNBLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLG1CQUE3Qjs7SUFFQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLFVBQUEsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxPQUFkLEVBQXVCLFdBQXZCO0FBQ1gsY0FBQTtVQUFBLFdBQUEsR0FBYyxXQUFBLEdBQVk7aUJBRTFCLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO1dBQUwsRUFBbUMsU0FBQTttQkFDakMsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBUDthQUFMLEVBQXdCLFNBQUE7Y0FDdEIsS0FBQyxDQUFBLEtBQUQsQ0FBTztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7ZUFBUCxFQUErQixTQUFBO3VCQUM3QixLQUFDLENBQUEsSUFBRCxDQUFNO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDtpQkFBTixFQUE4QixLQUE5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S0FBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLEdBQU0sZUFBTixDQUFULENBQWtDLFFBQVEsQ0FBQyxPQUEzQztVQURnRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtPQUF2QixDQUFuQjtJQUxrQjs7a0NBUXBCLFFBQUEsR0FBVSxTQUFBO2FBQUc7SUFBSDs7a0NBRVYsTUFBQSxHQUFRLFNBQUE7YUFBRztJQUFIOztrQ0FFUixXQUFBLEdBQWEsU0FBQTthQUFHO0lBQUg7O2tDQUViLFNBQUEsR0FBVyxTQUFBO2FBQUc7UUFBQyxZQUFBLEVBQWMscUJBQWY7O0lBQUg7Ozs7S0F0SnFCOztFQXdKbEMsTUFBTSxDQUFDLE9BQVAsR0FDQSxtQkFBQSxHQUNBLHVCQUFBLENBQXdCLHdCQUF4QixFQUFrRCxtQkFBbUIsQ0FBQyxTQUF0RTtBQS9KQSIsInNvdXJjZXNDb250ZW50IjpbIntTcGFjZVBlbkRTTCwgRXZlbnRzRGVsZWdhdGlvbiwgcmVnaXN0ZXJPclVwZGF0ZUVsZW1lbnR9ID0gcmVxdWlyZSAnYXRvbS11dGlscydcbkNvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsXG5cbmNhcGl0YWxpemUgPSAocykgLT4gcy5yZXBsYWNlIC9eLi8sIChtKSAtPiBtLnRvVXBwZXJDYXNlKClcblxuY2xhc3MgQ29sb3JQcm9qZWN0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50XG4gIFNwYWNlUGVuRFNMLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEV2ZW50c0RlbGVnYXRpb24uaW5jbHVkZUludG8odGhpcylcblxuICBAY29udGVudDogLT5cbiAgICBhcnJheUZpZWxkID0gKG5hbWUsIGxhYmVsLCBzZXR0aW5nLCBkZXNjcmlwdGlvbikgPT5cbiAgICAgIHNldHRpbmdOYW1lID0gXCJwaWdtZW50cy4je25hbWV9XCJcblxuICAgICAgQGRpdiBjbGFzczogJ2NvbnRyb2wtZ3JvdXAgYXJyYXknLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnY29udHJvbHMnLCA9PlxuICAgICAgICAgIEBsYWJlbCBjbGFzczogJ2NvbnRyb2wtbGFiZWwnLCA9PlxuICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdzZXR0aW5nLXRpdGxlJywgbGFiZWxcblxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdjb250cm9sLXdyYXBwZXInLCA9PlxuICAgICAgICAgICAgQHRhZyAnYXRvbS10ZXh0LWVkaXRvcicsIG1pbmk6IHRydWUsIG91dGxldDogbmFtZSwgdHlwZTogJ2FycmF5JywgcHJvcGVydHk6IG5hbWVcbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdzZXR0aW5nLWRlc2NyaXB0aW9uJywgPT5cbiAgICAgICAgICAgICAgQGRpdiA9PlxuICAgICAgICAgICAgICAgIEByYXcgXCJHbG9iYWwgY29uZmlnOiA8Y29kZT4je2F0b20uY29uZmlnLmdldChzZXR0aW5nID8gc2V0dGluZ05hbWUpLmpvaW4oJywgJyl9PC9jb2RlPlwiXG5cbiAgICAgICAgICAgICAgICBAcCg9PiBAcmF3IGRlc2NyaXB0aW9uKSBpZiBkZXNjcmlwdGlvbj9cblxuICAgICAgICAgICAgICBib29sZWFuRmllbGQoXCJpZ25vcmVHbG9iYWwje2NhcGl0YWxpemUgbmFtZX1cIiwgJ0lnbm9yZSBHbG9iYWwnLCBudWxsLCB0cnVlKVxuXG4gICAgc2VsZWN0RmllbGQgPSAobmFtZSwgbGFiZWwsIHtvcHRpb25zLCBzZXR0aW5nLCBkZXNjcmlwdGlvbiwgdXNlQm9vbGVhbn09e30pID0+XG4gICAgICBzZXR0aW5nTmFtZSA9IFwicGlnbWVudHMuI3tuYW1lfVwiXG5cbiAgICAgIEBkaXYgY2xhc3M6ICdjb250cm9sLWdyb3VwIGFycmF5JywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2NvbnRyb2xzJywgPT5cbiAgICAgICAgICBAbGFiZWwgY2xhc3M6ICdjb250cm9sLWxhYmVsJywgPT5cbiAgICAgICAgICAgIEBzcGFuIGNsYXNzOiAnc2V0dGluZy10aXRsZScsIGxhYmVsXG5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAnY29udHJvbC13cmFwcGVyJywgPT5cbiAgICAgICAgICAgIEBzZWxlY3Qgb3V0bGV0OiBuYW1lLCBjbGFzczogJ2Zvcm0tY29udHJvbCcsIHJlcXVpcmVkOiB0cnVlLCA9PlxuICAgICAgICAgICAgICBvcHRpb25zLmZvckVhY2ggKG9wdGlvbikgPT5cbiAgICAgICAgICAgICAgICBpZiBvcHRpb24gaXMgJydcbiAgICAgICAgICAgICAgICAgIEBvcHRpb24gdmFsdWU6IG9wdGlvbiwgJ1VzZSBnbG9iYWwgY29uZmlnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIEBvcHRpb24gdmFsdWU6IG9wdGlvbiwgY2FwaXRhbGl6ZSBvcHRpb25cblxuICAgICAgICAgICAgQGRpdiBjbGFzczogJ3NldHRpbmctZGVzY3JpcHRpb24nLCA9PlxuICAgICAgICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgICAgICAgQHJhdyBcIkdsb2JhbCBjb25maWc6IDxjb2RlPiN7YXRvbS5jb25maWcuZ2V0KHNldHRpbmcgPyBzZXR0aW5nTmFtZSl9PC9jb2RlPlwiXG5cbiAgICAgICAgICAgICAgICBAcCg9PiBAcmF3IGRlc2NyaXB0aW9uKSBpZiBkZXNjcmlwdGlvbj9cblxuICAgICAgICAgICAgICBpZiB1c2VCb29sZWFuXG4gICAgICAgICAgICAgICAgYm9vbGVhbkZpZWxkKFwiaWdub3JlR2xvYmFsI3tjYXBpdGFsaXplIG5hbWV9XCIsICdJZ25vcmUgR2xvYmFsJywgbnVsbCwgdHJ1ZSlcblxuICAgIGJvb2xlYW5GaWVsZCA9IChuYW1lLCBsYWJlbCwgZGVzY3JpcHRpb24sIG5lc3RlZCkgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdjb250cm9sLWdyb3VwIGJvb2xlYW4nLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnY29udHJvbHMnLCA9PlxuICAgICAgICAgIEBpbnB1dCB0eXBlOiAnY2hlY2tib3gnLCBpZDogXCJwaWdtZW50cy0je25hbWV9XCIsIG91dGxldDogbmFtZVxuICAgICAgICAgIEBsYWJlbCBjbGFzczogJ2NvbnRyb2wtbGFiZWwnLCBmb3I6IFwicGlnbWVudHMtI3tuYW1lfVwiLCA9PlxuICAgICAgICAgICAgQHNwYW4gY2xhc3M6IChpZiBuZXN0ZWQgdGhlbiAnc2V0dGluZy1kZXNjcmlwdGlvbicgZWxzZSAnc2V0dGluZy10aXRsZScpLCBsYWJlbFxuXG4gICAgICAgICAgaWYgZGVzY3JpcHRpb24/XG4gICAgICAgICAgICBAZGl2IGNsYXNzOiAnc2V0dGluZy1kZXNjcmlwdGlvbicsID0+XG4gICAgICAgICAgICAgIEByYXcgZGVzY3JpcHRpb25cblxuICAgIEBzZWN0aW9uIGNsYXNzOiAnc2V0dGluZ3MtdmlldyBwYW5lLWl0ZW0nLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3NldHRpbmdzLXdyYXBwZXInLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnaGVhZGVyJywgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAnbG9nbycsID0+XG4gICAgICAgICAgICBAaW1nIHNyYzogJ2F0b206Ly9waWdtZW50cy9yZXNvdXJjZXMvbG9nby5zdmcnLCB3aWR0aDogMTQwLCBoZWlnaHQ6IDM1XG5cbiAgICAgICAgICBAcCBjbGFzczogJ3NldHRpbmctZGVzY3JpcHRpb24nLCBcIlwiXCJcbiAgICAgICAgICBUaGVzZSBzZXR0aW5ncyBhcHBseSBvbiB0aGUgY3VycmVudCBwcm9qZWN0IG9ubHkgYW5kIGFyZSBjb21wbGVtZW50YXJ5XG4gICAgICAgICAgdG8gdGhlIHBhY2thZ2Ugc2V0dGluZ3MuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgQGRpdiBjbGFzczogJ2ZpZWxkcycsID0+XG4gICAgICAgICAgdGhlbWVzID0gYXRvbS50aGVtZXMuZ2V0QWN0aXZlVGhlbWVOYW1lcygpXG4gICAgICAgICAgYXJyYXlGaWVsZCgnc291cmNlTmFtZXMnLCAnU291cmNlIE5hbWVzJylcbiAgICAgICAgICBhcnJheUZpZWxkKCdpZ25vcmVkTmFtZXMnLCAnSWdub3JlZCBOYW1lcycpXG4gICAgICAgICAgYXJyYXlGaWVsZCgnc3VwcG9ydGVkRmlsZXR5cGVzJywgJ1N1cHBvcnRlZCBGaWxldHlwZXMnKVxuICAgICAgICAgIGFycmF5RmllbGQoJ2lnbm9yZWRTY29wZXMnLCAnSWdub3JlZCBTY29wZXMnKVxuICAgICAgICAgIGFycmF5RmllbGQoJ3NlYXJjaE5hbWVzJywgJ0V4dGVuZGVkIFNlYXJjaCBOYW1lcycsICdwaWdtZW50cy5leHRlbmRlZFNlYXJjaE5hbWVzJylcbiAgICAgICAgICBzZWxlY3RGaWVsZCgnc2Fzc1NoYWRlQW5kVGludEltcGxlbWVudGF0aW9uJywgJ1Nhc3MgU2hhZGUgQW5kIFRpbnQgSW1wbGVtZW50YXRpb24nLCB7XG4gICAgICAgICAgICBvcHRpb25zOiBbJycsICdjb21wYXNzJywgJ2JvdXJib24nXVxuICAgICAgICAgICAgc2V0dGluZzogJ3BpZ21lbnRzLnNhc3NTaGFkZUFuZFRpbnRJbXBsZW1lbnRhdGlvbidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlNhc3MgZG9lc24ndCBwcm92aWRlIGFueSBpbXBsZW1lbnRhdGlvbiBmb3Igc2hhZGUgYW5kIHRpbnQgZnVuY3Rpb24sIGFuZCBDb21wYXNzIGFuZCBCb3VyYm9uIGhhdmUgZGlmZmVyZW50IGltcGxlbWVudGF0aW9uIGZvciB0aGVzZSB0d28gbWV0aG9kcy4gVGhpcyBzZXR0aW5nIGFsbG93IHlvdSB0byBjaG9zZSB3aGljaCBpbXBsZW1lbnRhdGlvbiB1c2UuXCJcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYm9vbGVhbkZpZWxkKCdpbmNsdWRlVGhlbWVzJywgJ0luY2x1ZGUgQXRvbSBUaGVtZXMgU3R5bGVzaGVldHMnLCBcIlwiXCJcbiAgICAgICAgICBUaGUgdmFyaWFibGVzIGZyb20gPGNvZGU+I3t0aGVtZXNbMF19PC9jb2RlPiBhbmRcbiAgICAgICAgICA8Y29kZT4je3RoZW1lc1sxXX08L2NvZGU+IHRoZW1lcyB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgdG8gdGhlXG4gICAgICAgICAgcHJvamVjdCBwYWxldHRlLlxuICAgICAgICAgIFwiXCJcIilcblxuICBjcmVhdGVkQ2FsbGJhY2s6IC0+XG4gICAge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbScgdW5sZXNzIENvbXBvc2l0ZURpc3Bvc2FibGU/XG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgc2V0TW9kZWw6IChAcHJvamVjdCkgLT5cbiAgICBAaW5pdGlhbGl6ZUJpbmRpbmdzKClcblxuICBpbml0aWFsaXplQmluZGluZ3M6IC0+XG4gICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmpzLnJlZ2V4cCcpXG4gICAgQGlnbm9yZWRTY29wZXMuZ2V0TW9kZWwoKS5zZXRHcmFtbWFyKGdyYW1tYXIpXG5cbiAgICBAaW5pdGlhbGl6ZVRleHRFZGl0b3IoJ3NvdXJjZU5hbWVzJylcbiAgICBAaW5pdGlhbGl6ZVRleHRFZGl0b3IoJ3NlYXJjaE5hbWVzJylcbiAgICBAaW5pdGlhbGl6ZVRleHRFZGl0b3IoJ2lnbm9yZWROYW1lcycpXG4gICAgQGluaXRpYWxpemVUZXh0RWRpdG9yKCdpZ25vcmVkU2NvcGVzJylcbiAgICBAaW5pdGlhbGl6ZVRleHRFZGl0b3IoJ3N1cHBvcnRlZEZpbGV0eXBlcycpXG4gICAgQGluaXRpYWxpemVDaGVja2JveCgnaW5jbHVkZVRoZW1lcycpXG4gICAgQGluaXRpYWxpemVDaGVja2JveCgnaWdub3JlR2xvYmFsU291cmNlTmFtZXMnKVxuICAgIEBpbml0aWFsaXplQ2hlY2tib3goJ2lnbm9yZUdsb2JhbElnbm9yZWROYW1lcycpXG4gICAgQGluaXRpYWxpemVDaGVja2JveCgnaWdub3JlR2xvYmFsSWdub3JlZFNjb3BlcycpXG4gICAgQGluaXRpYWxpemVDaGVja2JveCgnaWdub3JlR2xvYmFsU2VhcmNoTmFtZXMnKVxuICAgIEBpbml0aWFsaXplQ2hlY2tib3goJ2lnbm9yZUdsb2JhbFN1cHBvcnRlZEZpbGV0eXBlcycpXG4gICAgQGluaXRpYWxpemVTZWxlY3QoJ3Nhc3NTaGFkZUFuZFRpbnRJbXBsZW1lbnRhdGlvbicpXG5cbiAgaW5pdGlhbGl6ZVRleHRFZGl0b3I6IChuYW1lKSAtPlxuICAgIGNhcGl0YWxpemVkTmFtZSA9IGNhcGl0YWxpemUgbmFtZVxuICAgIGVkaXRvciA9IEBbbmFtZV0uZ2V0TW9kZWwoKVxuXG4gICAgZWRpdG9yLnNldFRleHQoKEBwcm9qZWN0W25hbWVdID8gW10pLmpvaW4oJywgJykpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBhcnJheSA9IGVkaXRvci5nZXRUZXh0KCkuc3BsaXQoL1xccyosXFxzKi9nKS5maWx0ZXIgKHMpIC0+IHMubGVuZ3RoID4gMFxuICAgICAgQHByb2plY3RbXCJzZXQje2NhcGl0YWxpemVkTmFtZX1cIl0oYXJyYXkpXG5cbiAgaW5pdGlhbGl6ZVNlbGVjdDogKG5hbWUpIC0+XG4gICAgY2FwaXRhbGl6ZWROYW1lID0gY2FwaXRhbGl6ZSBuYW1lXG4gICAgc2VsZWN0ID0gQFtuYW1lXVxuICAgIG9wdGlvblZhbHVlcyA9IFtdLnNsaWNlLmNhbGwoc2VsZWN0LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbicpKS5tYXAgKG8pIC0+IG8udmFsdWVcblxuICAgIGlmIEBwcm9qZWN0W25hbWVdXG4gICAgICBzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IG9wdGlvblZhbHVlcy5pbmRleE9mKEBwcm9qZWN0W25hbWVdKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBzdWJzY3JpYmVUbyBzZWxlY3QsIGNoYW5nZTogPT5cbiAgICAgIHZhbHVlID0gc2VsZWN0LnNlbGVjdGVkT3B0aW9uc1swXT8udmFsdWVcbiAgICAgIEBwcm9qZWN0W1wic2V0I3tjYXBpdGFsaXplZE5hbWV9XCJdKGlmIHZhbHVlIGlzICcnIHRoZW4gbnVsbCBlbHNlIHZhbHVlKVxuXG4gIGluaXRpYWxpemVDaGVja2JveDogKG5hbWUpIC0+XG4gICAgY2FwaXRhbGl6ZWROYW1lID0gY2FwaXRhbGl6ZSBuYW1lXG4gICAgY2hlY2tib3ggPSBAW25hbWVdXG4gICAgY2hlY2tib3guY2hlY2tlZCA9IEBwcm9qZWN0W25hbWVdXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHN1YnNjcmliZVRvIGNoZWNrYm94LCBjaGFuZ2U6ID0+XG4gICAgICBAcHJvamVjdFtcInNldCN7Y2FwaXRhbGl6ZWROYW1lfVwiXShjaGVja2JveC5jaGVja2VkKVxuXG4gIGdldFRpdGxlOiAtPiAnUHJvamVjdCBTZXR0aW5ncydcblxuICBnZXRVUkk6IC0+ICdwaWdtZW50czovL3NldHRpbmdzJ1xuXG4gIGdldEljb25OYW1lOiAtPiBcInBpZ21lbnRzXCJcblxuICBzZXJpYWxpemU6IC0+IHtkZXNlcmlhbGl6ZXI6ICdDb2xvclByb2plY3RFbGVtZW50J31cblxubW9kdWxlLmV4cG9ydHMgPVxuQ29sb3JQcm9qZWN0RWxlbWVudCA9XG5yZWdpc3Rlck9yVXBkYXRlRWxlbWVudCAncGlnbWVudHMtY29sb3ItcHJvamVjdCcsIENvbG9yUHJvamVjdEVsZW1lbnQucHJvdG90eXBlXG4iXX0=

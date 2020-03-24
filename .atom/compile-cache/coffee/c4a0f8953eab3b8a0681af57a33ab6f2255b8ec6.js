(function() {
  var AncestorsMethods, ColorResultsElement, CompositeDisposable, EventsDelegation, Range, SpacePenDSL, _, path, ref, ref1, removeLeadingWhitespace,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = [], Range = ref[0], CompositeDisposable = ref[1], _ = ref[2], path = ref[3];

  ref1 = require('atom-utils'), SpacePenDSL = ref1.SpacePenDSL, EventsDelegation = ref1.EventsDelegation, AncestorsMethods = ref1.AncestorsMethods;

  removeLeadingWhitespace = function(string) {
    return string.replace(/^\s+/, '');
  };

  ColorResultsElement = (function(superClass) {
    extend(ColorResultsElement, superClass);

    function ColorResultsElement() {
      return ColorResultsElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorResultsElement);

    EventsDelegation.includeInto(ColorResultsElement);

    ColorResultsElement.content = function() {
      return this.tag('atom-panel', {
        outlet: 'pane',
        "class": 'preview-pane pane-item'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.span({
              outlet: 'previewCount',
              "class": 'preview-count inline-block'
            });
            return _this.div({
              outlet: 'loadingMessage',
              "class": 'inline-block'
            }, function() {
              _this.div({
                "class": 'loading loading-spinner-tiny inline-block'
              });
              return _this.div({
                outlet: 'searchedCountBlock',
                "class": 'inline-block'
              }, function() {
                _this.span({
                  outlet: 'searchedCount',
                  "class": 'searched-count'
                });
                return _this.span(' paths searched');
              });
            });
          });
          return _this.ol({
            outlet: 'resultsList',
            "class": 'search-colors-results results-view list-tree focusable-panel has-collapsable-children native-key-bindings',
            tabindex: -1
          });
        };
      })(this));
    };

    ColorResultsElement.prototype.createdCallback = function() {
      var ref2;
      if (CompositeDisposable == null) {
        ref2 = require('atom'), Range = ref2.Range, CompositeDisposable = ref2.CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.pathMapping = {};
      this.files = 0;
      this.colors = 0;
      this.loadingMessage.style.display = 'none';
      this.subscriptions.add(this.subscribeTo(this, '.list-nested-item > .list-item', {
        click: function(e) {
          var fileItem;
          e.stopPropagation();
          fileItem = AncestorsMethods.parents(e.target, '.list-nested-item')[0];
          return fileItem.classList.toggle('collapsed');
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this, '.search-result', {
        click: (function(_this) {
          return function(e) {
            var fileItem, matchItem, pathAttribute, range;
            e.stopPropagation();
            matchItem = e.target.matches('.search-result') ? e.target : AncestorsMethods.parents(e.target, '.search-result')[0];
            fileItem = AncestorsMethods.parents(matchItem, '.list-nested-item')[0];
            range = Range.fromObject([matchItem.dataset.start.split(',').map(Number), matchItem.dataset.end.split(',').map(Number)]);
            pathAttribute = fileItem.dataset.path;
            return atom.workspace.open(_this.pathMapping[pathAttribute]).then(function(editor) {
              return editor.setSelectedBufferRange(range, {
                autoscroll: true
              });
            });
          };
        })(this)
      }));
    };

    ColorResultsElement.prototype.setModel = function(colorSearch) {
      this.colorSearch = colorSearch;
      this.subscriptions.add(this.colorSearch.onDidFindMatches((function(_this) {
        return function(result) {
          return _this.addFileResult(result);
        };
      })(this)));
      this.subscriptions.add(this.colorSearch.onDidCompleteSearch((function(_this) {
        return function() {
          return _this.searchComplete();
        };
      })(this)));
      return this.colorSearch.search();
    };

    ColorResultsElement.prototype.addFileResult = function(result) {
      this.files += 1;
      this.colors += result.matches.length;
      this.resultsList.innerHTML += this.createFileResult(result);
      return this.updateMessage();
    };

    ColorResultsElement.prototype.searchComplete = function() {
      this.updateMessage();
      if (this.colors === 0) {
        this.pane.classList.add('no-results');
        return this.pane.appendChild("<ul class='centered background-message no-results-overlay'>\n  <li>No Results</li>\n</ul>");
      }
    };

    ColorResultsElement.prototype.updateMessage = function() {
      var filesString;
      filesString = this.files === 1 ? 'file' : 'files';
      return this.previewCount.innerHTML = this.colors > 0 ? "<span class='text-info'>\n  " + this.colors + " colors\n</span>\nfound in\n<span class='text-info'>\n  " + this.files + " " + filesString + "\n</span>" : "No colors found in " + this.files + " " + filesString;
    };

    ColorResultsElement.prototype.createFileResult = function(fileResult) {
      var fileBasename, filePath, matches, pathAttribute, pathName;
      if (_ == null) {
        _ = require('underscore-plus');
      }
      if (path == null) {
        path = require('path');
      }
      filePath = fileResult.filePath, matches = fileResult.matches;
      fileBasename = path.basename(filePath);
      pathAttribute = _.escapeAttribute(filePath);
      this.pathMapping[pathAttribute] = filePath;
      pathName = atom.project.relativize(filePath);
      return "<li class=\"path list-nested-item\" data-path=\"" + pathAttribute + "\">\n  <div class=\"path-details list-item\">\n    <span class=\"disclosure-arrow\"></span>\n    <span class=\"icon icon-file-text\" data-name=\"" + fileBasename + "\"></span>\n    <span class=\"path-name bright\">" + pathName + "</span>\n    <span class=\"path-match-number\">(" + matches.length + ")</span></div>\n  </div>\n  <ul class=\"matches list-tree\">\n    " + (matches.map((function(_this) {
        return function(match) {
          return _this.createMatchResult(match);
        };
      })(this)).join('')) + "\n  </ul>\n</li>";
    };

    ColorResultsElement.prototype.createMatchResult = function(match) {
      var filePath, lineNumber, matchEnd, matchStart, prefix, range, ref2, style, suffix, textColor;
      if (CompositeDisposable == null) {
        ref2 = require('atom'), Range = ref2.Range, CompositeDisposable = ref2.CompositeDisposable;
      }
      textColor = match.color.luma > 0.43 ? 'black' : 'white';
      filePath = match.filePath, range = match.range;
      range = Range.fromObject(range);
      matchStart = range.start.column - match.lineTextOffset;
      matchEnd = range.end.column - match.lineTextOffset;
      prefix = removeLeadingWhitespace(match.lineText.slice(0, matchStart));
      suffix = match.lineText.slice(matchEnd);
      lineNumber = range.start.row + 1;
      style = '';
      style += "background: " + (match.color.toCSS()) + ";";
      style += "color: " + textColor + ";";
      return "<li class=\"search-result list-item\" data-start=\"" + range.start.row + "," + range.start.column + "\" data-end=\"" + range.end.row + "," + range.end.column + "\">\n  <span class=\"line-number text-subtle\">" + lineNumber + "</span>\n  <span class=\"preview\">\n    " + prefix + "\n    <span class='match color-match' style='" + style + "'>" + match.matchText + "</span>\n    " + suffix + "\n  </span>\n</li>";
    };

    return ColorResultsElement;

  })(HTMLElement);

  module.exports = ColorResultsElement = document.registerElement('pigments-color-results', {
    prototype: ColorResultsElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1yZXN1bHRzLWVsZW1lbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2SUFBQTtJQUFBOzs7RUFBQSxNQUdJLEVBSEosRUFDRSxjQURGLEVBQ1MsNEJBRFQsRUFFRSxVQUZGLEVBRUs7O0VBR0wsT0FBb0QsT0FBQSxDQUFRLFlBQVIsQ0FBcEQsRUFBQyw4QkFBRCxFQUFjLHdDQUFkLEVBQWdDOztFQUVoQyx1QkFBQSxHQUEwQixTQUFDLE1BQUQ7V0FBWSxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWYsRUFBdUIsRUFBdkI7RUFBWjs7RUFFcEI7Ozs7Ozs7SUFDSixXQUFXLENBQUMsV0FBWixDQUF3QixtQkFBeEI7O0lBQ0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsbUJBQTdCOztJQUVBLG1CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLFlBQUwsRUFBbUI7UUFBQSxNQUFBLEVBQVEsTUFBUjtRQUFnQixDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUF2QjtPQUFuQixFQUFvRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDbEUsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDtXQUFMLEVBQTZCLFNBQUE7WUFDM0IsS0FBQyxDQUFBLElBQUQsQ0FBTTtjQUFBLE1BQUEsRUFBUSxjQUFSO2NBQXdCLENBQUEsS0FBQSxDQUFBLEVBQU8sNEJBQS9CO2FBQU47bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLE1BQUEsRUFBUSxnQkFBUjtjQUEwQixDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQWpDO2FBQUwsRUFBc0QsU0FBQTtjQUNwRCxLQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLENBQUEsS0FBQSxD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QXFKbEMsTUFBTSxDQUFDLE9BQVAsR0FBaUIsbUJBQUEsR0FDakIsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsd0JBQXpCLEVBQW1EO0lBQ2pELFNBQUEsRUFBVyxtQkFBbUIsQ0FBQyxTQURrQjtHQUFuRDtBQS9KQSIsInNvdXJjZXNDb250ZW50IjpbIltcbiAgUmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIF8sIHBhdGhcbl0gPSBbXVxuXG57U3BhY2VQZW5EU0wsIEV2ZW50c0RlbGVnYXRpb24sIEFuY2VzdG9yc01ldGhvZHN9ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxucmVtb3ZlTGVhZGluZ1doaXRlc3BhY2UgPSAoc3RyaW5nKSAtPiBzdHJpbmcucmVwbGFjZSgvXlxccysvLCAnJylcblxuY2xhc3MgQ29sb3JSZXN1bHRzRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50XG4gIFNwYWNlUGVuRFNMLmluY2x1ZGVJbnRvKHRoaXMpXG4gIEV2ZW50c0RlbGVnYXRpb24uaW5jbHVkZUludG8odGhpcylcblxuICBAY29udGVudDogLT5cbiAgICBAdGFnICdhdG9tLXBhbmVsJywgb3V0bGV0OiAncGFuZScsIGNsYXNzOiAncHJldmlldy1wYW5lIHBhbmUtaXRlbScsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncGFuZWwtaGVhZGluZycsID0+XG4gICAgICAgIEBzcGFuIG91dGxldDogJ3ByZXZpZXdDb3VudCcsIGNsYXNzOiAncHJldmlldy1jb3VudCBpbmxpbmUtYmxvY2snXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnbG9hZGluZ01lc3NhZ2UnLCBjbGFzczogJ2lubGluZS1ibG9jaycsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ2xvYWRpbmcgbG9hZGluZy1zcGlubmVyLXRpbnkgaW5saW5lLWJsb2NrJ1xuICAgICAgICAgIEBkaXYgb3V0bGV0OiAnc2VhcmNoZWRDb3VudEJsb2NrJywgY2xhc3M6ICdpbmxpbmUtYmxvY2snLCA9PlxuICAgICAgICAgICAgQHNwYW4gb3V0bGV0OiAnc2VhcmNoZWRDb3VudCcsIGNsYXNzOiAnc2VhcmNoZWQtY291bnQnXG4gICAgICAgICAgICBAc3BhbiAnIHBhdGhzIHNlYXJjaGVkJ1xuXG4gICAgICBAb2wgb3V0bGV0OiAncmVzdWx0c0xpc3QnLCBjbGFzczogJ3NlYXJjaC1jb2xvcnMtcmVzdWx0cyByZXN1bHRzLXZpZXcgbGlzdC10cmVlIGZvY3VzYWJsZS1wYW5lbCBoYXMtY29sbGFwc2FibGUtY2hpbGRyZW4gbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMVxuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICB7UmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbScgdW5sZXNzIENvbXBvc2l0ZURpc3Bvc2FibGU/XG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHBhdGhNYXBwaW5nID0ge31cblxuICAgIEBmaWxlcyA9IDBcbiAgICBAY29sb3JzID0gMFxuXG4gICAgQGxvYWRpbmdNZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gdGhpcywgJy5saXN0LW5lc3RlZC1pdGVtID4gLmxpc3QtaXRlbScsXG4gICAgICBjbGljazogKGUpIC0+XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZmlsZUl0ZW0gPSBBbmNlc3RvcnNNZXRob2RzLnBhcmVudHMoZS50YXJnZXQsJy5saXN0LW5lc3RlZC1pdGVtJylbMF1cbiAgICAgICAgZmlsZUl0ZW0uY2xhc3NMaXN0LnRvZ2dsZSgnY29sbGFwc2VkJylcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAc3Vic2NyaWJlVG8gdGhpcywgJy5zZWFyY2gtcmVzdWx0JyxcbiAgICAgIGNsaWNrOiAoZSkgPT5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBtYXRjaEl0ZW0gPSBpZiBlLnRhcmdldC5tYXRjaGVzKCcuc2VhcmNoLXJlc3VsdCcpXG4gICAgICAgICAgZS50YXJnZXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEFuY2VzdG9yc01ldGhvZHMucGFyZW50cyhlLnRhcmdldCwnLnNlYXJjaC1yZXN1bHQnKVswXVxuXG4gICAgICAgIGZpbGVJdGVtID0gQW5jZXN0b3JzTWV0aG9kcy5wYXJlbnRzKG1hdGNoSXRlbSwnLmxpc3QtbmVzdGVkLWl0ZW0nKVswXVxuICAgICAgICByYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoW1xuICAgICAgICAgIG1hdGNoSXRlbS5kYXRhc2V0LnN0YXJ0LnNwbGl0KCcsJykubWFwKE51bWJlcilcbiAgICAgICAgICBtYXRjaEl0ZW0uZGF0YXNldC5lbmQuc3BsaXQoJywnKS5tYXAoTnVtYmVyKVxuICAgICAgICBdKVxuICAgICAgICBwYXRoQXR0cmlidXRlID0gZmlsZUl0ZW0uZGF0YXNldC5wYXRoXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oQHBhdGhNYXBwaW5nW3BhdGhBdHRyaWJ1dGVdKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UsIGF1dG9zY3JvbGw6IHRydWUpXG5cbiAgc2V0TW9kZWw6IChAY29sb3JTZWFyY2gpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvclNlYXJjaC5vbkRpZEZpbmRNYXRjaGVzIChyZXN1bHQpID0+XG4gICAgICBAYWRkRmlsZVJlc3VsdChyZXN1bHQpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yU2VhcmNoLm9uRGlkQ29tcGxldGVTZWFyY2ggPT5cbiAgICAgIEBzZWFyY2hDb21wbGV0ZSgpXG5cbiAgICBAY29sb3JTZWFyY2guc2VhcmNoKClcblxuICBhZGRGaWxlUmVzdWx0OiAocmVzdWx0KSAtPlxuICAgIEBmaWxlcyArPSAxXG4gICAgQGNvbG9ycyArPSByZXN1bHQubWF0Y2hlcy5sZW5ndGhcblxuICAgIEByZXN1bHRzTGlzdC5pbm5lckhUTUwgKz0gQGNyZWF0ZUZpbGVSZXN1bHQocmVzdWx0KVxuICAgIEB1cGRhdGVNZXNzYWdlKClcblxuICBzZWFyY2hDb21wbGV0ZTogLT5cbiAgICBAdXBkYXRlTWVzc2FnZSgpXG5cbiAgICBpZiBAY29sb3JzIGlzIDBcbiAgICAgIEBwYW5lLmNsYXNzTGlzdC5hZGQgJ25vLXJlc3VsdHMnXG4gICAgICBAcGFuZS5hcHBlbmRDaGlsZCBcIlwiXCJcbiAgICAgIDx1bCBjbGFzcz0nY2VudGVyZWQgYmFja2dyb3VuZC1tZXNzYWdlIG5vLXJlc3VsdHMtb3ZlcmxheSc+XG4gICAgICAgIDxsaT5ObyBSZXN1bHRzPC9saT5cbiAgICAgIDwvdWw+XG4gICAgICBcIlwiXCJcblxuICB1cGRhdGVNZXNzYWdlOiAtPlxuICAgIGZpbGVzU3RyaW5nID0gaWYgQGZpbGVzIGlzIDEgdGhlbiAnZmlsZScgZWxzZSAnZmlsZXMnXG5cbiAgICBAcHJldmlld0NvdW50LmlubmVySFRNTCA9IGlmIEBjb2xvcnMgPiAwXG4gICAgICBcIlwiXCJcbiAgICAgIDxzcGFuIGNsYXNzPSd0ZXh0LWluZm8nPlxuICAgICAgICAje0Bjb2xvcnN9IGNvbG9yc1xuICAgICAgPC9zcGFuPlxuICAgICAgZm91bmQgaW5cbiAgICAgIDxzcGFuIGNsYXNzPSd0ZXh0LWluZm8nPlxuICAgICAgICAje0BmaWxlc30gI3tmaWxlc1N0cmluZ31cbiAgICAgIDwvc3Bhbj5cbiAgICAgIFwiXCJcIlxuICAgIGVsc2VcbiAgICAgIFwiTm8gY29sb3JzIGZvdW5kIGluICN7QGZpbGVzfSAje2ZpbGVzU3RyaW5nfVwiXG5cbiAgY3JlYXRlRmlsZVJlc3VsdDogKGZpbGVSZXN1bHQpIC0+XG4gICAgXyA/PSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG4gICAgcGF0aCA/PSByZXF1aXJlICdwYXRoJ1xuXG4gICAge2ZpbGVQYXRoLG1hdGNoZXN9ID0gZmlsZVJlc3VsdFxuICAgIGZpbGVCYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG5cbiAgICBwYXRoQXR0cmlidXRlID0gXy5lc2NhcGVBdHRyaWJ1dGUoZmlsZVBhdGgpXG4gICAgQHBhdGhNYXBwaW5nW3BhdGhBdHRyaWJ1dGVdID0gZmlsZVBhdGhcbiAgICBwYXRoTmFtZSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplKGZpbGVQYXRoKVxuXG4gICAgXCJcIlwiXG4gICAgPGxpIGNsYXNzPVwicGF0aCBsaXN0LW5lc3RlZC1pdGVtXCIgZGF0YS1wYXRoPVwiI3twYXRoQXR0cmlidXRlfVwiPlxuICAgICAgPGRpdiBjbGFzcz1cInBhdGgtZGV0YWlscyBsaXN0LWl0ZW1cIj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJkaXNjbG9zdXJlLWFycm93XCI+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImljb24gaWNvbi1maWxlLXRleHRcIiBkYXRhLW5hbWU9XCIje2ZpbGVCYXNlbmFtZX1cIj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwicGF0aC1uYW1lIGJyaWdodFwiPiN7cGF0aE5hbWV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInBhdGgtbWF0Y2gtbnVtYmVyXCI+KCN7bWF0Y2hlcy5sZW5ndGh9KTwvc3Bhbj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHVsIGNsYXNzPVwibWF0Y2hlcyBsaXN0LXRyZWVcIj5cbiAgICAgICAgI3ttYXRjaGVzLm1hcCgobWF0Y2gpID0+IEBjcmVhdGVNYXRjaFJlc3VsdCBtYXRjaCkuam9pbignJyl9XG4gICAgICA8L3VsPlxuICAgIDwvbGk+XCJcIlwiXG5cbiAgY3JlYXRlTWF0Y2hSZXN1bHQ6IChtYXRjaCkgLT5cbiAgICB7UmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbScgdW5sZXNzIENvbXBvc2l0ZURpc3Bvc2FibGU/XG5cbiAgICB0ZXh0Q29sb3IgPSBpZiBtYXRjaC5jb2xvci5sdW1hID4gMC40M1xuICAgICAgJ2JsYWNrJ1xuICAgIGVsc2VcbiAgICAgICd3aGl0ZSdcblxuICAgIHtmaWxlUGF0aCwgcmFuZ2V9ID0gbWF0Y2hcblxuICAgIHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZSlcbiAgICBtYXRjaFN0YXJ0ID0gcmFuZ2Uuc3RhcnQuY29sdW1uIC0gbWF0Y2gubGluZVRleHRPZmZzZXRcbiAgICBtYXRjaEVuZCA9IHJhbmdlLmVuZC5jb2x1bW4gLSBtYXRjaC5saW5lVGV4dE9mZnNldFxuICAgIHByZWZpeCA9IHJlbW92ZUxlYWRpbmdXaGl0ZXNwYWNlKG1hdGNoLmxpbmVUZXh0WzAuLi5tYXRjaFN0YXJ0XSlcbiAgICBzdWZmaXggPSBtYXRjaC5saW5lVGV4dFttYXRjaEVuZC4uXVxuICAgIGxpbmVOdW1iZXIgPSByYW5nZS5zdGFydC5yb3cgKyAxXG4gICAgc3R5bGUgPSAnJ1xuICAgIHN0eWxlICs9IFwiYmFja2dyb3VuZDogI3ttYXRjaC5jb2xvci50b0NTUygpfTtcIlxuICAgIHN0eWxlICs9IFwiY29sb3I6ICN7dGV4dENvbG9yfTtcIlxuXG4gICAgXCJcIlwiXG4gICAgPGxpIGNsYXNzPVwic2VhcmNoLXJlc3VsdCBsaXN0LWl0ZW1cIiBkYXRhLXN0YXJ0PVwiI3tyYW5nZS5zdGFydC5yb3d9LCN7cmFuZ2Uuc3RhcnQuY29sdW1ufVwiIGRhdGEtZW5kPVwiI3tyYW5nZS5lbmQucm93fSwje3JhbmdlLmVuZC5jb2x1bW59XCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImxpbmUtbnVtYmVyIHRleHQtc3VidGxlXCI+I3tsaW5lTnVtYmVyfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPVwicHJldmlld1wiPlxuICAgICAgICAje3ByZWZpeH1cbiAgICAgICAgPHNwYW4gY2xhc3M9J21hdGNoIGNvbG9yLW1hdGNoJyBzdHlsZT0nI3tzdHlsZX0nPiN7bWF0Y2gubWF0Y2hUZXh0fTwvc3Bhbj5cbiAgICAgICAgI3tzdWZmaXh9XG4gICAgICA8L3NwYW4+XG4gICAgPC9saT5cbiAgICBcIlwiXCJcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbG9yUmVzdWx0c0VsZW1lbnQgPVxuZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50ICdwaWdtZW50cy1jb2xvci1yZXN1bHRzJywge1xuICBwcm90b3R5cGU6IENvbG9yUmVzdWx0c0VsZW1lbnQucHJvdG90eXBlXG59XG4iXX0=

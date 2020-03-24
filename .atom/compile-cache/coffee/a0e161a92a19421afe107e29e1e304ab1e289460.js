(function() {
  var ColorBufferElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-utils'), registerOrUpdateElement = ref.registerOrUpdateElement, EventsDelegation = ref.EventsDelegation;

  ref1 = [], Emitter = ref1[0], CompositeDisposable = ref1[1];

  nextHighlightId = 0;

  ColorBufferElement = (function(superClass) {
    extend(ColorBufferElement, superClass);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var ref2, ref3;
      if (Emitter == null) {
        ref2 = require('atom'), Emitter = ref2.Emitter, CompositeDisposable = ref2.CompositeDisposable;
      }
      ref3 = [0, 0], this.editorScrollLeft = ref3[0], this.editorScrollTop = ref3[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.displayedMarkers = [];
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return this.viewsByMarkers = new WeakMap;
    };

    ColorBufferElement.prototype.attachedCallback = function() {
      this.attached = true;
      return this.update();
    };

    ColorBufferElement.prototype.detachedCallback = function() {
      return this.attached = false;
    };

    ColorBufferElement.prototype.onDidUpdate = function(callback) {
      return this.emitter.on('did-update', callback);
    };

    ColorBufferElement.prototype.getModel = function() {
      return this.colorBuffer;
    };

    ColorBufferElement.prototype.setModel = function(colorBuffer) {
      this.colorBuffer = colorBuffer;
      this.editor = this.colorBuffer.editor;
      if (this.editor.isDestroyed()) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.colorBuffer.initialize().then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      this.subscriptions.add(this.colorBuffer.onDidUpdateColorMarkers((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(this.colorBuffer.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          return _this.usedMarkers.forEach(function(marker) {
            var ref2;
            if ((ref2 = marker.colorMarker) != null) {
              ref2.invalidateScreenRangeCache();
            }
            return marker.checkScreenRange();
          });
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.maxDecorationsInGutter', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          _this.initializeNativeDecorations(type);
          return _this.previousType = type;
        };
      })(this)));
      this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          return _this.attach();
        };
      })(this)));
      return this.subscriptions.add(this.editorElement.onDidDetach((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)));
    };

    ColorBufferElement.prototype.attach = function() {
      var ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (ref2 = this.getEditorRoot().querySelector('.lines')) != null ? ref2.appendChild(this) : void 0;
    };

    ColorBufferElement.prototype.detach = function() {
      if (this.parentNode == null) {
        return;
      }
      return this.parentNode.removeChild(this);
    };

    ColorBufferElement.prototype.destroy = function() {
      this.detach();
      this.subscriptions.dispose();
      this.destroyNativeDecorations();
      return this.colorBuffer = null;
    };

    ColorBufferElement.prototype.update = function() {
      if (this.isGutterType()) {
        return this.updateGutterDecorations();
      } else {
        return this.updateHighlightDecorations(this.previousType);
      }
    };

    ColorBufferElement.prototype.getEditorRoot = function() {
      return this.editorElement;
    };

    ColorBufferElement.prototype.isGutterType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'gutter' || type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.isDotType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.initializeNativeDecorations = function(type) {
      this.destroyNativeDecorations();
      if (this.isGutterType(type)) {
        return this.initializeGutter(type);
      } else {
        return this.updateHighlightDecorations(type);
      }
    };

    ColorBufferElement.prototype.destroyNativeDecorations = function() {
      if (this.isGutterType()) {
        return this.destroyGutter();
      } else {
        return this.destroyHighlightDecorations();
      }
    };

    ColorBufferElement.prototype.updateHighlightDecorations = function(type) {
      var className, i, j, len, len1, m, markers, markersByRows, maxRowLength, ref2, ref3, ref4, ref5, style;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.styleByMarkerId == null) {
        this.styleByMarkerId = {};
      }
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          ref5 = this.getHighlighDecorationCSS(m, type), className = ref5.className, style = ref5.style;
          this.appendChild(style);
          this.styleByMarkerId[m.id] = style;
          if (type === 'native-background') {
            this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
              type: 'text',
              "class": "pigments-" + type + " " + className
            });
          } else {
            this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
              type: 'highlight',
              "class": "pigments-" + type + " " + className
            });
          }
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.destroyHighlightDecorations = function() {
      var deco, id, ref2;
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        deco = ref2[id];
        if (this.styleByMarkerId[id] != null) {
          this.removeChild(this.styleByMarkerId[id]);
        }
        deco.destroy();
      }
      delete this.decorationByMarkerId;
      delete this.styleByMarkerId;
      return this.displayedMarkers = [];
    };

    ColorBufferElement.prototype.getHighlighDecorationCSS = function(marker, type) {
      var className, l, style;
      className = "pigments-highlight-" + (nextHighlightId++);
      style = document.createElement('style');
      l = marker.color.luma;
      if (type === 'native-background') {
        style.innerHTML = "." + className + " {\n  background-color: " + (marker.color.toCSS()) + ";\n  background-image:\n    linear-gradient(to bottom, " + (marker.color.toCSS()) + " 0%, " + (marker.color.toCSS()) + " 100%),\n    url(atom://pigments/resources/transparent-background.png);\n  color: " + (l > 0.43 ? 'black' : 'white') + ";\n}";
      } else if (type === 'native-underline') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n  background-image:\n    linear-gradient(to bottom, " + (marker.color.toCSS()) + " 0%, " + (marker.color.toCSS()) + " 100%),\n    url(atom://pigments/resources/transparent-background.png);\n}";
      } else if (type === 'native-outline') {
        style.innerHTML = "." + className + " .region {\n  border-color: " + (marker.color.toCSS()) + ";\n}";
      }
      return {
        className: className,
        style: style
      };
    };

    ColorBufferElement.prototype.initializeGutter = function(type) {
      var gutterContainer, options;
      options = {
        name: "pigments-" + type
      };
      if (type !== 'gutter') {
        options.priority = 1000;
      }
      this.gutter = this.editor.addGutter(options);
      this.displayedMarkers = [];
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      gutterContainer = this.getEditorRoot().querySelector('.gutter-container');
      this.gutterSubscription = new CompositeDisposable;
      this.gutterSubscription.add(this.subscribeTo(gutterContainer, {
        mousedown: (function(_this) {
          return function(e) {
            var colorMarker, markerId, targetDecoration;
            targetDecoration = e.path[0];
            if (!targetDecoration.matches('span')) {
              targetDecoration = targetDecoration.querySelector('span');
            }
            if (targetDecoration == null) {
              return;
            }
            markerId = targetDecoration.dataset.markerId;
            colorMarker = _this.displayedMarkers.filter(function(m) {
              return m.id === Number(markerId);
            })[0];
            if (!((colorMarker != null) && (_this.colorBuffer != null))) {
              return;
            }
            return _this.colorBuffer.selectColorMarkerAndOpenPicker(colorMarker);
          };
        })(this)
      }));
      if (this.isDotType(type)) {
        this.gutterSubscription.add(this.editorElement.onDidChangeScrollLeft((function(_this) {
          return function() {
            return requestAnimationFrame(function() {
              return _this.updateDotDecorationsOffsets(_this.editorElement.getFirstVisibleScreenRow(), _this.editorElement.getLastVisibleScreenRow());
            });
          };
        })(this)));
        this.gutterSubscription.add(this.editorElement.onDidChangeScrollTop((function(_this) {
          return function() {
            return requestAnimationFrame(function() {
              return _this.updateDotDecorationsOffsets(_this.editorElement.getFirstVisibleScreenRow(), _this.editorElement.getLastVisibleScreenRow());
            });
          };
        })(this)));
        this.gutterSubscription.add(this.editor.onDidChange((function(_this) {
          return function(changes) {
            if (Array.isArray(changes)) {
              return changes != null ? changes.forEach(function(change) {
                return _this.updateDotDecorationsOffsets(change.start.row, change.newExtent.row);
              }) : void 0;
            } else if ((changes.start != null) && (changes.newExtent != null)) {
              return _this.updateDotDecorationsOffsets(changes.start.row, changes.newExtent.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, ref2;
      try {
        this.gutter.destroy();
      } catch (error) {}
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        decoration = ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, i, j, len, len1, m, markers, markersByRows, maxDecorationsInGutter, maxRowLength, ref2, ref3, ref4, row, rowLength, scrollLeft;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      scrollLeft = this.editorElement.getScrollLeft();
      maxDecorationsInGutter = atom.config.get('pigments.maxDecorationsInGutter');
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          this.decorationByMarkerId[m.id] = this.gutter.decorateMarker(m.marker, {
            type: 'gutter',
            "class": 'pigments-gutter-marker',
            item: this.getGutterDecorationItem(m)
          });
        }
        deco = this.decorationByMarkerId[m.id];
        row = m.marker.getStartScreenPosition().row;
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        if (markersByRows[row] >= maxDecorationsInGutter) {
          continue;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          try {
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
          } catch (error) {}
        }
        decoWidth = 14;
        deco.properties.item.style.left = ((rowLength + markersByRows[row] * decoWidth) - scrollLeft) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(rowStart, rowEnd) {
      var deco, decoWidth, i, m, markerRow, markersByRows, ref2, ref3, results, row, rowLength, scrollLeft;
      markersByRows = {};
      scrollLeft = this.editorElement.getScrollLeft();
      results = [];
      for (row = i = ref2 = rowStart, ref3 = rowEnd; ref2 <= ref3 ? i <= ref3 : i >= ref3; row = ref2 <= ref3 ? ++i : --i) {
        results.push((function() {
          var j, len, ref4, results1;
          ref4 = this.displayedMarkers;
          results1 = [];
          for (j = 0, len = ref4.length; j < len; j++) {
            m = ref4[j];
            deco = this.decorationByMarkerId[m.id];
            if (m.marker == null) {
              continue;
            }
            markerRow = m.marker.getStartScreenPosition().row;
            if (row !== markerRow) {
              continue;
            }
            if (markersByRows[row] == null) {
              markersByRows[row] = 0;
            }
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
            decoWidth = 14;
            deco.properties.item.style.left = ((rowLength + markersByRows[row] * decoWidth) - scrollLeft) + "px";
            results1.push(markersByRows[row]++);
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    ColorBufferElement.prototype.getGutterDecorationItem = function(marker) {
      var div;
      div = document.createElement('div');
      div.innerHTML = "<span style='background-image: linear-gradient(to bottom, " + (marker.color.toCSS()) + " 0%, " + (marker.color.toCSS()) + " 100%), url(atom://pigments/resources/transparent-background.png);' data-marker-id='" + marker.id + "'></span>";
      return div;
    };

    ColorBufferElement.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    ColorBufferElement.prototype.updateSelections = function() {
      var decoration, i, len, marker, ref2, results;
      if (this.editor.isDestroyed()) {
        return;
      }
      ref2 = this.displayedMarkers;
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        marker = ref2[i];
        decoration = this.decorationByMarkerId[marker.id];
        if (decoration != null) {
          results.push(this.hideDecorationIfInSelection(marker, decoration));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, i, len, markerRange, props, range, selection, selections;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          if (classes[0].match(/-in-selection$/) == null) {
            classes[0] += '-in-selection';
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.map(function(cls) {
        return cls.replace('-in-selection', '');
      });
      props["class"] = classes.join(' ');
      return decoration.setProperties(props);
    };

    ColorBufferElement.prototype.hideMarkerIfInSelectionOrFold = function(marker, view) {
      var i, len, markerRange, range, results, selection, selections;
      selections = this.editor.getSelections();
      results = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          results.push(view.classList.add('in-fold'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      if (position == null) {
        return;
      }
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (pixelPosition == null) {
        return;
      }
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, ref2, rootElement, scrollTarget, top;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      if (rootElement.querySelector('.lines') == null) {
        return;
      }
      ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = ref2.top, left = ref2.left;
      top = clientY - top + scrollTarget.getScrollTop();
      left = clientX - left + scrollTarget.getScrollLeft();
      return {
        top: top,
        left: left
      };
    };

    return ColorBufferElement;

  })(HTMLElement);

  module.exports = ColorBufferElement = registerOrUpdateElement('pigments-markers', ColorBufferElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1idWZmZXItZWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHVIQUFBO0lBQUE7Ozs7RUFBQSxNQUE4QyxPQUFBLENBQVEsWUFBUixDQUE5QyxFQUFDLHFEQUFELEVBQTBCOztFQUUxQixPQUFpQyxFQUFqQyxFQUFDLGlCQUFELEVBQVU7O0VBRVYsZUFBQSxHQUFrQjs7RUFFWjs7Ozs7OztJQUNKLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLGtCQUE3Qjs7aUNBRUEsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLElBQU8sZUFBUDtRQUNFLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsc0JBQUQsRUFBVSwrQ0FEWjs7TUFHQSxPQUF3QyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhDLEVBQUMsSUFBQyxDQUFBLDBCQUFGLEVBQW9CLElBQUMsQ0FBQTtNQUNyQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtNQUNwQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUI7YUFDakIsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSTtJQVZQOztpQ0FZakIsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZnQjs7aUNBSWxCLGdCQUFBLEdBQWtCLFNBQUE7YUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQURJOztpQ0FHbEIsV0FBQSxHQUFhLFNBQUMsUUFBRDthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVosRUFBMEIsUUFBMUI7SUFEVzs7aUNBR2IsUUFBQSxHQUFVLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSjs7aUNBRVYsUUFBQSxHQUFVLFNBQUMsV0FBRDtNQUFDLElBQUMsQ0FBQSxjQUFEO01BQ1IsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFlBQVg7TUFDRixJQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQVY7QUFBQSxlQUFBOztNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsTUFBcEI7TUFFakIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUFiLENBQUEsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLHVCQUFiLENBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLENBQW5CO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNyQyxLQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsU0FBQyxNQUFEO0FBQ25CLGdCQUFBOztrQkFBa0IsQ0FBRSwwQkFBcEIsQ0FBQTs7bUJBQ0EsTUFBTSxDQUFDLGdCQUFQLENBQUE7VUFGbUIsQ0FBckI7UUFEcUM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQW5CO01BS0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3hDLEtBQUMsQ0FBQSxzQkFBRCxDQUFBO1FBRHdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDM0MsS0FBQyxDQUFBLHNCQUFELENBQUE7UUFEMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNuRCxLQUFDLENBQUEsc0JBQUQsQ0FBQTtRQURtRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzNDLEtBQUMsQ0FBQSxzQkFBRCxDQUFBO1FBRDJDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDOUMsS0FBQyxDQUFBLHNCQUFELENBQUE7UUFEOEM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQW5CO01BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNuRCxLQUFDLENBQUEsc0JBQUQsQ0FBQTtRQURtRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBbkI7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGlDQUFwQixFQUF1RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3hFLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFEd0U7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZELENBQW5CO01BR0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQixxQkFBcEIsRUFBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDNUQsS0FBQyxDQUFBLDJCQUFELENBQTZCLElBQTdCO2lCQUNBLEtBQUMsQ0FBQSxZQUFELEdBQWdCO1FBRjRDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQUFuQjtNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsYUFBYSxDQUFDLFdBQWYsQ0FBMkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0IsQ0FBbkI7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQTJCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCLENBQW5CO0lBcENROztpQ0FzQ1YsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsSUFBVSx1QkFBVjtBQUFBLGVBQUE7O01BQ0EsSUFBYywwQkFBZDtBQUFBLGVBQUE7O2lGQUN3QyxDQUFFLFdBQTFDLENBQXNELElBQXREO0lBSE07O2lDQUtSLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBYyx1QkFBZDtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFaLENBQXdCLElBQXhCO0lBSE07O2lDQUtSLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7YUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBTFI7O2lDQU9ULE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBRyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixJQUFDLENBQUEsWUFBN0IsRUFIRjs7SUFETTs7aUNBTVIsYUFBQSxHQUFlLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSjs7aUNBRWYsWUFBQSxHQUFjLFNBQUMsSUFBRDs7UUFBQyxPQUFLLElBQUMsQ0FBQTs7YUFDbkIsSUFBQSxLQUFTLFFBQVQsSUFBQSxJQUFBLEtBQW1CLFlBQW5CLElBQUEsSUFBQSxLQUFpQztJQURyQjs7aUNBR2QsU0FBQSxHQUFZLFNBQUMsSUFBRDs7UUFBQyxPQUFLLElBQUMsQ0FBQTs7YUFDakIsSUFBQSxLQUFTLFlBQVQsSUFBQSxJQUFBLEtBQXVCO0lBRGI7O2lDQUdaLDJCQUFBLEdBQTZCLFNBQUMsSUFBRDtNQUMzQixJQUFDLENBQUEsd0JBQUQsQ0FBQTtNQUVBLElBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFkLENBQUg7ZUFDRSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBbEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsSUFBNUIsRUFIRjs7SUFIMkI7O2lDQVE3Qix3QkFBQSxHQUEwQixTQUFBO01BQ3hCLElBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSwyQkFBRCxDQUFBLEVBSEY7O0lBRHdCOztpQ0FjMUIsMEJBQUEsR0FBNEIsU0FBQyxJQUFEO0FBQzFCLFVBQUE7TUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQVY7QUFBQSxlQUFBOzs7UUFFQSxJQUFDLENBQUEsa0JBQW1COzs7UUFDcEIsSUFBQyxDQUFBLHVCQUF3Qjs7TUFFekIsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsb0JBQWIsQ0FBQTtBQUVWO0FBQUEsV0FBQSxzQ0FBQTs7Y0FBZ0MsYUFBUyxPQUFULEVBQUEsQ0FBQTs7OztjQUNILENBQUUsT0FBN0IsQ0FBQTs7UUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxlQUFnQixDQUFBLENBQUMsQ0FBQyxFQUFGLENBQTlCO1FBQ0EsT0FBTyxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFDLENBQUMsRUFBRjtRQUN4QixPQUFPLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxDQUFDLENBQUMsRUFBRjtBQUovQjtNQU1BLGFBQUEsR0FBZ0I7TUFDaEIsWUFBQSxHQUFlO0FBRWYsV0FBQSwyQ0FBQTs7UUFDRSxvQ0FBVSxDQUFFLE9BQVQsQ0FBQSxXQUFBLElBQXVCLGFBQVMsSUFBQyxDQUFBLGdCQUFWLEVBQUEsQ0FBQSxLQUExQjtVQUNFLE9BQXFCLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixDQUExQixFQUE2QixJQUE3QixDQUFyQixFQUFDLDBCQUFELEVBQVk7VUFDWixJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWI7VUFDQSxJQUFDLENBQUEsZUFBZ0IsQ0FBQSxDQUFDLENBQUMsRUFBRixDQUFqQixHQUF5QjtVQUN6QixJQUFHLElBQUEsS0FBUSxtQkFBWDtZQUNFLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxDQUFDLENBQUMsRUFBRixDQUF0QixHQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsQ0FBQyxDQUFDLE1BQXpCLEVBQWlDO2NBQzdELElBQUEsRUFBTSxNQUR1RDtjQUU3RCxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQUEsR0FBWSxJQUFaLEdBQWlCLEdBQWpCLEdBQW9CLFNBRmtDO2FBQWpDLEVBRGhDO1dBQUEsTUFBQTtZQU1FLElBQUMsQ0FBQSxvQkFBcUIsQ0FBQSxDQUFDLENBQUMsRUFBRixDQUF0QixHQUE4QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsQ0FBQyxDQUFDLE1BQXpCLEVBQWlDO2NBQzdELElBQUEsRUFBTSxXQUR1RDtjQUU3RCxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQUEsR0FBWSxJQUFaLEdBQWlCLEdBQWpCLEdBQW9CLFNBRmtDO2FBQWpDLEVBTmhDO1dBSkY7O0FBREY7TUFnQkEsSUFBQyxDQUFBLGdCQUFELEdBQW9CO2FBQ3BCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQ7SUFsQzBCOztpQ0FvQzVCLDJCQUFBLEdBQTZCLFNBQUE7QUFDM0IsVUFBQTtBQUFBO0FBQUEsV0FBQSxVQUFBOztRQUNFLElBQXNDLGdDQUF0QztVQUFBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLGVBQWdCLENBQUEsRUFBQSxDQUE5QixFQUFBOztRQUNBLElBQUksQ0FBQyxPQUFMLENBQUE7QUFGRjtNQUlBLE9BQU8sSUFBQyxDQUFBO01BQ1IsT0FBTyxJQUFDLENBQUE7YUFDUixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFQTzs7aUNBUzdCLHdCQUFBLEdBQTBCLFNBQUMsTUFBRCxFQUFTLElBQVQ7QUFDeEIsVUFBQTtNQUFBLFNBQUEsR0FBWSxxQkFBQSxHQUFxQixDQUFDLGVBQUEsRUFBRDtNQUNqQyxLQUFBLEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsT0FBdkI7TUFDUixDQUFBLEdBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztNQUVqQixJQUFHLElBQUEsS0FBUSxtQkFBWDtRQUNFLEtBQUssQ0FBQyxTQUFOLEdBQWtCLEdBQUEsR0FDZixTQURlLEdBQ0wsMEJBREssR0FFRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FGSCxHQUV5Qix5REFGekIsR0FJYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FKZCxHQUlvQyxPQUpwQyxHQUkwQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FKMUMsR0FJZ0Usb0ZBSmhFLEdBTVIsQ0FBSSxDQUFBLEdBQUksSUFBUCxHQUFpQixPQUFqQixHQUE4QixPQUEvQixDQU5RLEdBTStCLE9BUG5EO09BQUEsTUFVSyxJQUFHLElBQUEsS0FBUSxrQkFBWDtRQUNILEtBQUssQ0FBQyxTQUFOLEdBQWtCLEdBQUEsR0FDZixTQURlLEdBQ0wsa0NBREssR0FFRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FGSCxHQUV5Qix5REFGekIsR0FJYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FKZCxHQUlvQyxPQUpwQyxHQUkwQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FKMUMsR0FJZ0UsNkVBTC9FO09BQUEsTUFTQSxJQUFHLElBQUEsS0FBUSxnQkFBWDtRQUNILEtBQUssQ0FBQyxTQUFOLEdBQWtCLEdBQUEsR0FDZixTQURlLEdBQ0wsOEJBREssR0FFRCxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixDQUFBLENBQUQsQ0FGQyxHQUVxQixPQUhwQzs7YUFPTDtRQUFDLFdBQUEsU0FBRDtRQUFZLE9BQUEsS0FBWjs7SUEvQndCOztpQ0F5QzFCLGdCQUFBLEdBQWtCLFNBQUMsSUFBRDtBQUNoQixVQUFBO01BQUEsT0FBQSxHQUFVO1FBQUEsSUFBQSxFQUFNLFdBQUEsR0FBWSxJQUFsQjs7TUFDVixJQUEyQixJQUFBLEtBQVUsUUFBckM7UUFBQSxPQUFPLENBQUMsUUFBUixHQUFtQixLQUFuQjs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFrQixPQUFsQjtNQUNWLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjs7UUFDcEIsSUFBQyxDQUFBLHVCQUF3Qjs7TUFDekIsZUFBQSxHQUFrQixJQUFDLENBQUEsYUFBRCxDQUFBLENBQWdCLENBQUMsYUFBakIsQ0FBK0IsbUJBQS9CO01BQ2xCLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJO01BRTFCLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxHQUFwQixDQUF3QixJQUFDLENBQUEsV0FBRCxDQUFhLGVBQWIsRUFDdEI7UUFBQSxTQUFBLEVBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEO0FBQ1QsZ0JBQUE7WUFBQSxnQkFBQSxHQUFtQixDQUFDLENBQUMsSUFBSyxDQUFBLENBQUE7WUFFMUIsSUFBQSxDQUFPLGdCQUFnQixDQUFDLE9BQWpCLENBQXlCLE1BQXpCLENBQVA7Y0FDRSxnQkFBQSxHQUFtQixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixNQUEvQixFQURyQjs7WUFHQSxJQUFjLHdCQUFkO0FBQUEscUJBQUE7O1lBRUEsUUFBQSxHQUFXLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztZQUNwQyxXQUFBLEdBQWMsS0FBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQXlCLFNBQUMsQ0FBRDtxQkFBTyxDQUFDLENBQUMsRUFBRixLQUFRLE1BQUEsQ0FBTyxRQUFQO1lBQWYsQ0FBekIsQ0FBMEQsQ0FBQSxDQUFBO1lBRXhFLElBQUEsQ0FBQSxDQUFjLHFCQUFBLElBQWlCLDJCQUEvQixDQUFBO0FBQUEscUJBQUE7O21CQUVBLEtBQUMsQ0FBQSxXQUFXLENBQUMsOEJBQWIsQ0FBNEMsV0FBNUM7VUFiUztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtPQURzQixDQUF4QjtNQWdCQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxDQUFIO1FBQ0UsSUFBQyxDQUFBLGtCQUFrQixDQUFDLEdBQXBCLENBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMscUJBQWYsQ0FBcUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDM0QscUJBQUEsQ0FBc0IsU0FBQTtxQkFDcEIsS0FBQyxDQUFBLDJCQUFELENBQTZCLEtBQUMsQ0FBQSxhQUFhLENBQUMsd0JBQWYsQ0FBQSxDQUE3QixFQUF3RSxLQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQUEsQ0FBeEU7WUFEb0IsQ0FBdEI7VUFEMkQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLENBQXhCO1FBSUEsSUFBQyxDQUFBLGtCQUFrQixDQUFDLEdBQXBCLENBQXdCLElBQUMsQ0FBQSxhQUFhLENBQUMsb0JBQWYsQ0FBb0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDMUQscUJBQUEsQ0FBc0IsU0FBQTtxQkFDcEIsS0FBQyxDQUFBLDJCQUFELENBQTZCLEtBQUMsQ0FBQSxhQUFhLENBQUMsd0JBQWYsQ0FBQSxDQUE3QixFQUF3RSxLQUFDLENBQUEsYUFBYSxDQUFDLHVCQUFmLENBQUEsQ0FBeEU7WUFEb0IsQ0FBdEI7VUFEMEQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDLENBQXhCO1FBSUEsSUFBQyxDQUFBLGtCQUFrQixDQUFDLEdBQXBCLENBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE9BQUQ7WUFDMUMsSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLE9BQWQsQ0FBSDt1Q0FDRSxPQUFPLENBQUUsT0FBVCxDQUFpQixTQUFDLE1BQUQ7dUJBQ2YsS0FBQyxDQUFBLDJCQUFELENBQTZCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBMUMsRUFBK0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFoRTtjQURlLENBQWpCLFdBREY7YUFBQSxNQUlLLElBQUcsdUJBQUEsSUFBbUIsMkJBQXRCO3FCQUNILEtBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQTNDLEVBQWdELE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBbEUsRUFERzs7VUFMcUM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCLENBQXhCLEVBVEY7O2FBaUJBLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixJQUF6QjtJQTNDZ0I7O2lDQTZDbEIsYUFBQSxHQUFlLFNBQUE7QUFDYixVQUFBO0FBQUE7UUFBSSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQSxFQUFKO09BQUE7TUFDQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsT0FBcEIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtBQUNwQjtBQUFBLFdBQUEsVUFBQTs7UUFBQSxVQUFVLENBQUMsT0FBWCxDQUFBO0FBQUE7TUFDQSxPQUFPLElBQUMsQ0FBQTthQUNSLE9BQU8sSUFBQyxDQUFBO0lBTks7O2lDQVFmLHVCQUFBLEdBQXlCLFNBQUMsSUFBRDtBQUN2QixVQUFBOztRQUR3QixPQUFLLElBQUMsQ0FBQTs7TUFDOUIsSUFBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBQSxDQUFWO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxvQkFBYixDQUFBO0FBRVY7QUFBQSxXQUFBLHNDQUFBOztjQUFnQyxhQUFTLE9BQVQsRUFBQSxDQUFBOzs7O2NBQ0gsQ0FBRSxPQUE3QixDQUFBOztRQUNBLE9BQU8sSUFBQyxDQUFBLG9CQUFxQixDQUFBLENBQUMsQ0FBQyxFQUFGO0FBRi9CO01BSUEsYUFBQSxHQUFnQjtNQUNoQixZQUFBLEdBQWU7TUFDZixVQUFBLEdBQWEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxhQUFmLENBQUE7TUFDYixzQkFBQSxHQUF5QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO0FBRXpCLFdBQUEsMkNBQUE7O1FBQ0Usb0NBQVUsQ0FBRSxPQUFULENBQUEsV0FBQSxJQUF1QixhQUFTLElBQUMsQ0FBQSxnQkFBVixFQUFBLENBQUEsS0FBMUI7VUFDRSxJQUFDLENBQUEsb0JBQXFCLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBdEIsR0FBOEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLENBQUMsQ0FBQyxNQUF6QixFQUFpQztZQUM3RCxJQUFBLEVBQU0sUUFEdUQ7WUFFN0QsQ0FBQSxLQUFBLENBQUEsRUFBTyx3QkFGc0Q7WUFHN0QsSUFBQSxFQUFNLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixDQUF6QixDQUh1RDtXQUFqQyxFQURoQzs7UUFPQSxJQUFBLEdBQU8sSUFBQyxDQUFBLG9CQUFxQixDQUFBLENBQUMsQ0FBQyxFQUFGO1FBQzdCLEdBQUEsR0FBTSxDQUFDLENBQUMsTUFBTSxDQUFDLHNCQUFULENBQUEsQ0FBaUMsQ0FBQzs7VUFDeEMsYUFBYyxDQUFBLEdBQUEsSUFBUTs7UUFFdEIsSUFBWSxhQUFjLENBQUEsR0FBQSxDQUFkLElBQXNCLHNCQUFsQztBQUFBLG1CQUFBOztRQUVBLFNBQUEsR0FBWTtRQUVaLElBQUcsSUFBQSxLQUFVLFFBQWI7QUFDRTtZQUNFLFNBQUEsR0FBWSxJQUFDLENBQUEsYUFBYSxDQUFDLDhCQUFmLENBQThDLENBQUMsR0FBRCxFQUFNLEtBQU4sQ0FBOUMsQ0FBOEQsQ0FBQyxLQUQ3RTtXQUFBLGlCQURGOztRQUlBLFNBQUEsR0FBWTtRQUVaLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUEzQixHQUFvQyxDQUFDLENBQUMsU0FBQSxHQUFZLGFBQWMsQ0FBQSxHQUFBLENBQWQsR0FBcUIsU0FBbEMsQ0FBQSxHQUErQyxVQUFoRCxDQUFBLEdBQTJEO1FBRS9GLGFBQWMsQ0FBQSxHQUFBLENBQWQ7UUFDQSxZQUFBLEdBQWUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxZQUFULEVBQXVCLGFBQWMsQ0FBQSxHQUFBLENBQXJDO0FBekJqQjtNQTJCQSxJQUFHLElBQUEsS0FBUSxRQUFYO1FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFwQixDQUEyQixDQUFDLEtBQUssQ0FBQyxRQUFsQyxHQUErQyxDQUFDLFlBQUEsR0FBZSxTQUFoQixDQUFBLEdBQTBCLEtBRDNFO09BQUEsTUFBQTtRQUdFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsTUFBcEIsQ0FBMkIsQ0FBQyxLQUFLLENBQUMsS0FBbEMsR0FBMEMsTUFINUM7O01BS0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CO2FBQ3BCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQ7SUEvQ3VCOztpQ0FpRHpCLDJCQUFBLEdBQTZCLFNBQUMsUUFBRCxFQUFXLE1BQVg7QUFDM0IsVUFBQTtNQUFBLGFBQUEsR0FBZ0I7TUFDaEIsVUFBQSxHQUFhLElBQUMsQ0FBQSxhQUFhLENBQUMsYUFBZixDQUFBO0FBRWI7V0FBVyw4R0FBWDs7O0FBQ0U7QUFBQTtlQUFBLHNDQUFBOztZQUNFLElBQUEsR0FBTyxJQUFDLENBQUEsb0JBQXFCLENBQUEsQ0FBQyxDQUFDLEVBQUY7WUFDN0IsSUFBZ0IsZ0JBQWhCO0FBQUEsdUJBQUE7O1lBQ0EsU0FBQSxHQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsc0JBQVQsQ0FBQSxDQUFpQyxDQUFDO1lBQzlDLElBQWdCLEdBQUEsS0FBTyxTQUF2QjtBQUFBLHVCQUFBOzs7Y0FFQSxhQUFjLENBQUEsR0FBQSxJQUFROztZQUV0QixTQUFBLEdBQVksSUFBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxDQUFDLEdBQUQsRUFBTSxLQUFOLENBQTlDLENBQThELENBQUM7WUFFM0UsU0FBQSxHQUFZO1lBRVosSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQTNCLEdBQW9DLENBQUMsQ0FBQyxTQUFBLEdBQVksYUFBYyxDQUFBLEdBQUEsQ0FBZCxHQUFxQixTQUFsQyxDQUFBLEdBQStDLFVBQWhELENBQUEsR0FBMkQ7MEJBQy9GLGFBQWMsQ0FBQSxHQUFBLENBQWQ7QUFiRjs7O0FBREY7O0lBSjJCOztpQ0FvQjdCLHVCQUFBLEdBQXlCLFNBQUMsTUFBRDtBQUN2QixVQUFBO01BQUEsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ04sR0FBRyxDQUFDLFNBQUosR0FBZ0IsNERBQUEsR0FDMkMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWIsQ0FBQSxDQUFELENBRDNDLEdBQ2lFLE9BRGpFLEdBQ3VFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLENBQUEsQ0FBRCxDQUR2RSxHQUM2RixzRkFEN0YsR0FDbUwsTUFBTSxDQUFDLEVBRDFMLEdBQzZMO2FBRTdNO0lBTHVCOztpQ0FlekIsc0JBQUEsR0FBd0IsU0FBQTtNQUN0QixJQUFVLElBQUMsQ0FBQSxlQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsZUFBRCxHQUFtQjthQUNuQixxQkFBQSxDQUFzQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEIsS0FBQyxDQUFBLGVBQUQsR0FBbUI7VUFDbkIsSUFBVSxLQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLFdBQXBCLENBQUEsQ0FBVjtBQUFBLG1CQUFBOztpQkFDQSxLQUFDLENBQUEsZ0JBQUQsQ0FBQTtRQUhvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7SUFKc0I7O2lDQVN4QixnQkFBQSxHQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBLENBQVY7QUFBQSxlQUFBOztBQUNBO0FBQUE7V0FBQSxzQ0FBQTs7UUFDRSxVQUFBLEdBQWEsSUFBQyxDQUFBLG9CQUFxQixDQUFBLE1BQU0sQ0FBQyxFQUFQO1FBRW5DLElBQW9ELGtCQUFwRDt1QkFBQSxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsTUFBN0IsRUFBcUMsVUFBckMsR0FBQTtTQUFBLE1BQUE7K0JBQUE7O0FBSEY7O0lBRmdCOztpQ0FPbEIsMkJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsVUFBVDtBQUMzQixVQUFBO01BQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBO01BRWIsS0FBQSxHQUFRLFVBQVUsQ0FBQyxhQUFYLENBQUE7TUFDUixPQUFBLEdBQVUsS0FBSyxFQUFDLEtBQUQsRUFBTSxDQUFDLEtBQVosQ0FBa0IsTUFBbEI7QUFFVixXQUFBLDRDQUFBOztRQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsY0FBVixDQUFBO1FBQ1IsV0FBQSxHQUFjLE1BQU0sQ0FBQyxjQUFQLENBQUE7UUFFZCxJQUFBLENBQUEsQ0FBZ0IscUJBQUEsSUFBaUIsZUFBakMsQ0FBQTtBQUFBLG1CQUFBOztRQUNBLElBQUcsV0FBVyxDQUFDLGNBQVosQ0FBMkIsS0FBM0IsQ0FBSDtVQUNFLElBQXFDLDBDQUFyQztZQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVIsSUFBYyxnQkFBZDs7VUFDQSxLQUFLLEVBQUMsS0FBRCxFQUFMLEdBQWMsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO1VBQ2QsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsS0FBekI7QUFDQSxpQkFKRjs7QUFMRjtNQVdBLE9BQUEsR0FBVSxPQUFPLENBQUMsR0FBUixDQUFZLFNBQUMsR0FBRDtlQUFTLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWixFQUE2QixFQUE3QjtNQUFULENBQVo7TUFDVixLQUFLLEVBQUMsS0FBRCxFQUFMLEdBQWMsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO2FBQ2QsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsS0FBekI7SUFuQjJCOztpQ0FxQjdCLDZCQUFBLEdBQStCLFNBQUMsTUFBRCxFQUFTLElBQVQ7QUFDN0IsVUFBQTtNQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQTtBQUViO1dBQUEsNENBQUE7O1FBQ0UsS0FBQSxHQUFRLFNBQVMsQ0FBQyxjQUFWLENBQUE7UUFDUixXQUFBLEdBQWMsTUFBTSxDQUFDLGNBQVAsQ0FBQTtRQUVkLElBQUEsQ0FBQSxDQUFnQixxQkFBQSxJQUFpQixlQUFqQyxDQUFBO0FBQUEsbUJBQUE7O1FBRUEsSUFBZ0MsV0FBVyxDQUFDLGNBQVosQ0FBMkIsS0FBM0IsQ0FBaEM7VUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWYsQ0FBbUIsUUFBbkIsRUFBQTs7UUFDQSxJQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBdUIsQ0FBQyxLQUFLLENBQUMsR0FBMUQsQ0FBbEM7dUJBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFmLENBQW1CLFNBQW5CLEdBQUE7U0FBQSxNQUFBOytCQUFBOztBQVBGOztJQUg2Qjs7aUNBNEIvQix3QkFBQSxHQUEwQixTQUFDLEtBQUQ7QUFDeEIsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsS0FBN0I7TUFFWCxJQUFjLGdCQUFkO0FBQUEsZUFBQTs7TUFFQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBTSxDQUFDLCtCQUFwQixDQUFvRCxRQUFwRDthQUVqQixJQUFDLENBQUEsV0FBVyxDQUFDLDhCQUFiLENBQTRDLGNBQTVDO0lBUHdCOztpQ0FTMUIsMkJBQUEsR0FBNkIsU0FBQyxLQUFEO0FBQzNCLFVBQUE7TUFBQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSwwQkFBRCxDQUE0QixLQUE1QjtNQUVoQixJQUFjLHFCQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFHLHlEQUFIO2VBQ0UsSUFBQyxDQUFBLGFBQWEsQ0FBQyw4QkFBZixDQUE4QyxhQUE5QyxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxNQUFNLENBQUMsOEJBQVIsQ0FBdUMsYUFBdkMsRUFIRjs7SUFMMkI7O2lDQVU3QiwwQkFBQSxHQUE0QixTQUFDLEtBQUQ7QUFDMUIsVUFBQTtNQUFDLHVCQUFELEVBQVU7TUFFVixZQUFBLEdBQWtCLHVDQUFILEdBQ2IsSUFBQyxDQUFBLGFBRFksR0FHYixJQUFDLENBQUE7TUFFSCxXQUFBLEdBQWMsSUFBQyxDQUFBLGFBQUQsQ0FBQTtNQUVkLElBQWMsMkNBQWQ7QUFBQSxlQUFBOztNQUVBLE9BQWMsV0FBVyxDQUFDLGFBQVosQ0FBMEIsUUFBMUIsQ0FBbUMsQ0FBQyxxQkFBcEMsQ0FBQSxDQUFkLEVBQUMsY0FBRCxFQUFNO01BQ04sR0FBQSxHQUFNLE9BQUEsR0FBVSxHQUFWLEdBQWdCLFlBQVksQ0FBQyxZQUFiLENBQUE7TUFDdEIsSUFBQSxHQUFPLE9BQUEsR0FBVSxJQUFWLEdBQWlCLFlBQVksQ0FBQyxhQUFiLENBQUE7YUFDeEI7UUFBQyxLQUFBLEdBQUQ7UUFBTSxNQUFBLElBQU47O0lBZjBCOzs7O0tBemFHOztFQTBiakMsTUFBTSxDQUFDLE9BQVAsR0FDQSxrQkFBQSxHQUNBLHVCQUFBLENBQXdCLGtCQUF4QixFQUE0QyxrQkFBa0IsQ0FBQyxTQUEvRDtBQWxjQSIsInNvdXJjZXNDb250ZW50IjpbIlxue3JlZ2lzdGVyT3JVcGRhdGVFbGVtZW50LCBFdmVudHNEZWxlZ2F0aW9ufSA9IHJlcXVpcmUgJ2F0b20tdXRpbHMnXG5cbltFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlXSA9IFtdXG5cbm5leHRIaWdobGlnaHRJZCA9IDBcblxuY2xhc3MgQ29sb3JCdWZmZXJFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnRcbiAgRXZlbnRzRGVsZWdhdGlvbi5pbmNsdWRlSW50byh0aGlzKVxuXG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICB1bmxlc3MgRW1pdHRlcj9cbiAgICAgIHtFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbiAgICBbQGVkaXRvclNjcm9sbExlZnQsIEBlZGl0b3JTY3JvbGxUb3BdID0gWzAsIDBdXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG4gICAgQHVzZWRNYXJrZXJzID0gW11cbiAgICBAdW51c2VkTWFya2VycyA9IFtdXG4gICAgQHZpZXdzQnlNYXJrZXJzID0gbmV3IFdlYWtNYXBcblxuICBhdHRhY2hlZENhbGxiYWNrOiAtPlxuICAgIEBhdHRhY2hlZCA9IHRydWVcbiAgICBAdXBkYXRlKClcblxuICBkZXRhY2hlZENhbGxiYWNrOiAtPlxuICAgIEBhdHRhY2hlZCA9IGZhbHNlXG5cbiAgb25EaWRVcGRhdGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXVwZGF0ZScsIGNhbGxiYWNrXG5cbiAgZ2V0TW9kZWw6IC0+IEBjb2xvckJ1ZmZlclxuXG4gIHNldE1vZGVsOiAoQGNvbG9yQnVmZmVyKSAtPlxuICAgIHtAZWRpdG9yfSA9IEBjb2xvckJ1ZmZlclxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcbiAgICBAZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKVxuXG4gICAgQGNvbG9yQnVmZmVyLmluaXRpYWxpemUoKS50aGVuID0+IEB1cGRhdGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvckJ1ZmZlci5vbkRpZFVwZGF0ZUNvbG9yTWFya2VycyA9PiBAdXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yQnVmZmVyLm9uRGlkRGVzdHJveSA9PiBAZGVzdHJveSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZSA9PlxuICAgICAgQHVzZWRNYXJrZXJzLmZvckVhY2ggKG1hcmtlcikgLT5cbiAgICAgICAgbWFya2VyLmNvbG9yTWFya2VyPy5pbnZhbGlkYXRlU2NyZWVuUmFuZ2VDYWNoZSgpXG4gICAgICAgIG1hcmtlci5jaGVja1NjcmVlblJhbmdlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQWRkQ3Vyc29yID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRSZW1vdmVDdXJzb3IgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRBZGRTZWxlY3Rpb24gPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFJlbW92ZVNlbGVjdGlvbiA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlU2VsZWN0aW9uUmFuZ2UgPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdwaWdtZW50cy5tYXhEZWNvcmF0aW9uc0luR3V0dGVyJywgPT5cbiAgICAgIEB1cGRhdGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLm1hcmtlclR5cGUnLCAodHlwZSkgPT5cbiAgICAgIEBpbml0aWFsaXplTmF0aXZlRGVjb3JhdGlvbnModHlwZSlcbiAgICAgIEBwcmV2aW91c1R5cGUgPSB0eXBlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWRBdHRhY2ggPT4gQGF0dGFjaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3JFbGVtZW50Lm9uRGlkRGV0YWNoID0+IEBkZXRhY2goKVxuXG4gIGF0dGFjaDogLT5cbiAgICByZXR1cm4gaWYgQHBhcmVudE5vZGU/XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yRWxlbWVudD9cbiAgICBAZ2V0RWRpdG9yUm9vdCgpLnF1ZXJ5U2VsZWN0b3IoJy5saW5lcycpPy5hcHBlbmRDaGlsZCh0aGlzKVxuXG4gIGRldGFjaDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYXJlbnROb2RlP1xuXG4gICAgQHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcylcblxuICBkZXN0cm95OiAtPlxuICAgIEBkZXRhY2goKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnMoKVxuXG4gICAgQGNvbG9yQnVmZmVyID0gbnVsbFxuXG4gIHVwZGF0ZTogLT5cbiAgICBpZiBAaXNHdXR0ZXJUeXBlKClcbiAgICAgIEB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9ucygpXG4gICAgZWxzZVxuICAgICAgQHVwZGF0ZUhpZ2hsaWdodERlY29yYXRpb25zKEBwcmV2aW91c1R5cGUpXG5cbiAgZ2V0RWRpdG9yUm9vdDogLT4gQGVkaXRvckVsZW1lbnRcblxuICBpc0d1dHRlclR5cGU6ICh0eXBlPUBwcmV2aW91c1R5cGUpIC0+XG4gICAgdHlwZSBpbiBbJ2d1dHRlcicsICduYXRpdmUtZG90JywgJ25hdGl2ZS1zcXVhcmUtZG90J11cblxuICBpc0RvdFR5cGU6ICAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHR5cGUgaW4gWyduYXRpdmUtZG90JywgJ25hdGl2ZS1zcXVhcmUtZG90J11cblxuICBpbml0aWFsaXplTmF0aXZlRGVjb3JhdGlvbnM6ICh0eXBlKSAtPlxuICAgIEBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnMoKVxuXG4gICAgaWYgQGlzR3V0dGVyVHlwZSh0eXBlKVxuICAgICAgQGluaXRpYWxpemVHdXR0ZXIodHlwZSlcbiAgICBlbHNlXG4gICAgICBAdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnModHlwZSlcblxuICBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnM6IC0+XG4gICAgaWYgQGlzR3V0dGVyVHlwZSgpXG4gICAgICBAZGVzdHJveUd1dHRlcigpXG4gICAgZWxzZVxuICAgICAgQGRlc3Ryb3lIaWdobGlnaHREZWNvcmF0aW9ucygpXG5cbiAgIyMgICAjIyAgICAgIyMgIyMgICMjIyMjIyAgICMjICAgICAjIyAjIyAgICAgICAjIyAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyMjIyMjIyMgIyMgIyMgICAjIyMjICMjIyMjIyMjIyAjIyAgICAgICAjIyAjIyAgICMjIyMgIyMjIyMjIyMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMjIyAjIyAgIyMjIyMjICAgIyMgICAgICMjICAgICMjXG5cbiAgdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnM6ICh0eXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIEBzdHlsZUJ5TWFya2VySWQgPz0ge31cbiAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWQgPz0ge31cblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZ2V0VmFsaWRDb2xvck1hcmtlcnMoKVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0/LmRlc3Ryb3koKVxuICAgICAgQHJlbW92ZUNoaWxkKEBzdHlsZUJ5TWFya2VySWRbbS5pZF0pXG4gICAgICBkZWxldGUgQHN0eWxlQnlNYXJrZXJJZFttLmlkXVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuXG4gICAgbWFya2Vyc0J5Um93cyA9IHt9XG4gICAgbWF4Um93TGVuZ3RoID0gMFxuXG4gICAgZm9yIG0gaW4gbWFya2Vyc1xuICAgICAgaWYgbS5jb2xvcj8uaXNWYWxpZCgpIGFuZCBtIG5vdCBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgICB7Y2xhc3NOYW1lLCBzdHlsZX0gPSBAZ2V0SGlnaGxpZ2hEZWNvcmF0aW9uQ1NTKG0sIHR5cGUpXG4gICAgICAgIEBhcHBlbmRDaGlsZChzdHlsZSlcbiAgICAgICAgQHN0eWxlQnlNYXJrZXJJZFttLmlkXSA9IHN0eWxlXG4gICAgICAgIGlmIHR5cGUgaXMgJ25hdGl2ZS1iYWNrZ3JvdW5kJ1xuICAgICAgICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXSA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobS5tYXJrZXIsIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0J1xuICAgICAgICAgICAgY2xhc3M6IFwicGlnbWVudHMtI3t0eXBlfSAje2NsYXNzTmFtZX1cIlxuICAgICAgICAgIH0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0gPSBAZWRpdG9yLmRlY29yYXRlTWFya2VyKG0ubWFya2VyLCB7XG4gICAgICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgICAgICAgY2xhc3M6IFwicGlnbWVudHMtI3t0eXBlfSAje2NsYXNzTmFtZX1cIlxuICAgICAgICAgIH0pXG5cbiAgICBAZGlzcGxheWVkTWFya2VycyA9IG1hcmtlcnNcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlJ1xuXG4gIGRlc3Ryb3lIaWdobGlnaHREZWNvcmF0aW9uczogLT5cbiAgICBmb3IgaWQsIGRlY28gb2YgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgICBAcmVtb3ZlQ2hpbGQoQHN0eWxlQnlNYXJrZXJJZFtpZF0pIGlmIEBzdHlsZUJ5TWFya2VySWRbaWRdP1xuICAgICAgZGVjby5kZXN0cm95KClcblxuICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQHN0eWxlQnlNYXJrZXJJZFxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gW11cblxuICBnZXRIaWdobGlnaERlY29yYXRpb25DU1M6IChtYXJrZXIsIHR5cGUpIC0+XG4gICAgY2xhc3NOYW1lID0gXCJwaWdtZW50cy1oaWdobGlnaHQtI3tuZXh0SGlnaGxpZ2h0SWQrK31cIlxuICAgIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIGwgPSBtYXJrZXIuY29sb3IubHVtYVxuXG4gICAgaWYgdHlwZSBpcyAnbmF0aXZlLWJhY2tncm91bmQnXG4gICAgICBzdHlsZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIC4je2NsYXNzTmFtZX0ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgICAgYmFja2dyb3VuZC1pbWFnZTpcbiAgICAgICAgICBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAje21hcmtlci5jb2xvci50b0NTUygpfSAwJSwgI3ttYXJrZXIuY29sb3IudG9DU1MoKX0gMTAwJSksXG4gICAgICAgICAgdXJsKGF0b206Ly9waWdtZW50cy9yZXNvdXJjZXMvdHJhbnNwYXJlbnQtYmFja2dyb3VuZC5wbmcpO1xuICAgICAgICBjb2xvcjogI3tpZiBsID4gMC40MyB0aGVuICdibGFjaycgZWxzZSAnd2hpdGUnfTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuICAgIGVsc2UgaWYgdHlwZSBpcyAnbmF0aXZlLXVuZGVybGluZSdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSAucmVnaW9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICAgIGJhY2tncm91bmQtaW1hZ2U6XG4gICAgICAgICAgbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgI3ttYXJrZXIuY29sb3IudG9DU1MoKX0gMCUsICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9IDEwMCUpLFxuICAgICAgICAgIHVybChhdG9tOi8vcGlnbWVudHMvcmVzb3VyY2VzL3RyYW5zcGFyZW50LWJhY2tncm91bmQucG5nKTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuICAgIGVsc2UgaWYgdHlwZSBpcyAnbmF0aXZlLW91dGxpbmUnXG4gICAgICBzdHlsZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIC4je2NsYXNzTmFtZX0gLnJlZ2lvbiB7XG4gICAgICAgIGJvcmRlci1jb2xvcjogI3ttYXJrZXIuY29sb3IudG9DU1MoKX07XG4gICAgICB9XG4gICAgICBcIlwiXCJcblxuICAgIHtjbGFzc05hbWUsIHN0eWxlfVxuXG4gICMjICAgICAjIyMjIyMgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAjIyMjICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyMjIyMgICAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgIyNcbiAgIyMgICAgIyMgICAgIyMgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjI1xuICAjIyAgICAgIyMjIyMjICAgICMjIyMjIyMgICAgICMjICAgICAgICMjICAgICMjIyMjIyMjICMjICAgICAjI1xuXG4gIGluaXRpYWxpemVHdXR0ZXI6ICh0eXBlKSAtPlxuICAgIG9wdGlvbnMgPSBuYW1lOiBcInBpZ21lbnRzLSN7dHlwZX1cIlxuICAgIG9wdGlvbnMucHJpb3JpdHkgPSAxMDAwIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuXG4gICAgQGd1dHRlciA9IEBlZGl0b3IuYWRkR3V0dGVyKG9wdGlvbnMpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZCA/PSB7fVxuICAgIGd1dHRlckNvbnRhaW5lciA9IEBnZXRFZGl0b3JSb290KCkucXVlcnlTZWxlY3RvcignLmd1dHRlci1jb250YWluZXInKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbi5hZGQgQHN1YnNjcmliZVRvIGd1dHRlckNvbnRhaW5lcixcbiAgICAgIG1vdXNlZG93bjogKGUpID0+XG4gICAgICAgIHRhcmdldERlY29yYXRpb24gPSBlLnBhdGhbMF1cblxuICAgICAgICB1bmxlc3MgdGFyZ2V0RGVjb3JhdGlvbi5tYXRjaGVzKCdzcGFuJylcbiAgICAgICAgICB0YXJnZXREZWNvcmF0aW9uID0gdGFyZ2V0RGVjb3JhdGlvbi5xdWVyeVNlbGVjdG9yKCdzcGFuJylcblxuICAgICAgICByZXR1cm4gdW5sZXNzIHRhcmdldERlY29yYXRpb24/XG5cbiAgICAgICAgbWFya2VySWQgPSB0YXJnZXREZWNvcmF0aW9uLmRhdGFzZXQubWFya2VySWRcbiAgICAgICAgY29sb3JNYXJrZXIgPSBAZGlzcGxheWVkTWFya2Vycy5maWx0ZXIoKG0pIC0+IG0uaWQgaXMgTnVtYmVyKG1hcmtlcklkKSlbMF1cblxuICAgICAgICByZXR1cm4gdW5sZXNzIGNvbG9yTWFya2VyPyBhbmQgQGNvbG9yQnVmZmVyP1xuXG4gICAgICAgIEBjb2xvckJ1ZmZlci5zZWxlY3RDb2xvck1hcmtlckFuZE9wZW5QaWNrZXIoY29sb3JNYXJrZXIpXG5cbiAgICBpZiBAaXNEb3RUeXBlKHR5cGUpXG4gICAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQgPT5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhAZWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSwgQGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSlcblxuICAgICAgQGd1dHRlclN1YnNjcmlwdGlvbi5hZGQgQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AgPT5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhAZWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSwgQGVkaXRvckVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSlcblxuICAgICAgQGd1dHRlclN1YnNjcmlwdGlvbi5hZGQgQGVkaXRvci5vbkRpZENoYW5nZSAoY2hhbmdlcykgPT5cbiAgICAgICAgaWYgQXJyYXkuaXNBcnJheSBjaGFuZ2VzXG4gICAgICAgICAgY2hhbmdlcz8uZm9yRWFjaCAoY2hhbmdlKSA9PlxuICAgICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhjaGFuZ2Uuc3RhcnQucm93LCBjaGFuZ2UubmV3RXh0ZW50LnJvdylcblxuICAgICAgICBlbHNlIGlmIGNoYW5nZXMuc3RhcnQ/IGFuZCBjaGFuZ2VzLm5ld0V4dGVudD9cbiAgICAgICAgICBAdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzKGNoYW5nZXMuc3RhcnQucm93LCBjaGFuZ2VzLm5ld0V4dGVudC5yb3cpXG5cbiAgICBAdXBkYXRlR3V0dGVyRGVjb3JhdGlvbnModHlwZSlcblxuICBkZXN0cm95R3V0dGVyOiAtPlxuICAgIHRyeSBAZ3V0dGVyLmRlc3Ryb3koKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIGRlY29yYXRpb24uZGVzdHJveSgpIGZvciBpZCwgZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgZGVsZXRlIEBndXR0ZXJTdWJzY3JpcHRpb25cblxuICB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9uczogKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKClcblxuICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzIHdoZW4gbSBub3QgaW4gbWFya2Vyc1xuICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdPy5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cblxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIG1heFJvd0xlbmd0aCA9IDBcbiAgICBzY3JvbGxMZWZ0ID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgbWF4RGVjb3JhdGlvbnNJbkd1dHRlciA9IGF0b20uY29uZmlnLmdldCgncGlnbWVudHMubWF4RGVjb3JhdGlvbnNJbkd1dHRlcicpXG5cbiAgICBmb3IgbSBpbiBtYXJrZXJzXG4gICAgICBpZiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG0gbm90IGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXSA9IEBndXR0ZXIuZGVjb3JhdGVNYXJrZXIobS5tYXJrZXIsIHtcbiAgICAgICAgICB0eXBlOiAnZ3V0dGVyJ1xuICAgICAgICAgIGNsYXNzOiAncGlnbWVudHMtZ3V0dGVyLW1hcmtlcidcbiAgICAgICAgICBpdGVtOiBAZ2V0R3V0dGVyRGVjb3JhdGlvbkl0ZW0obSlcbiAgICAgICAgfSlcblxuICAgICAgZGVjbyA9IEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuICAgICAgcm93ID0gbS5tYXJrZXIuZ2V0U3RhcnRTY3JlZW5Qb3NpdGlvbigpLnJvd1xuICAgICAgbWFya2Vyc0J5Um93c1tyb3ddID89IDBcblxuICAgICAgY29udGludWUgaWYgbWFya2Vyc0J5Um93c1tyb3ddID49IG1heERlY29yYXRpb25zSW5HdXR0ZXJcblxuICAgICAgcm93TGVuZ3RoID0gMFxuXG4gICAgICBpZiB0eXBlIGlzbnQgJ2d1dHRlcidcbiAgICAgICAgdHJ5XG4gICAgICAgICAgcm93TGVuZ3RoID0gQGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKFtyb3csIEluZmluaXR5XSkubGVmdFxuXG4gICAgICBkZWNvV2lkdGggPSAxNFxuXG4gICAgICBkZWNvLnByb3BlcnRpZXMuaXRlbS5zdHlsZS5sZWZ0ID0gXCIjeyhyb3dMZW5ndGggKyBtYXJrZXJzQnlSb3dzW3Jvd10gKiBkZWNvV2lkdGgpIC0gc2Nyb2xsTGVmdH1weFwiXG5cbiAgICAgIG1hcmtlcnNCeVJvd3Nbcm93XSsrXG4gICAgICBtYXhSb3dMZW5ndGggPSBNYXRoLm1heChtYXhSb3dMZW5ndGgsIG1hcmtlcnNCeVJvd3Nbcm93XSlcblxuICAgIGlmIHR5cGUgaXMgJ2d1dHRlcidcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhAZ3V0dGVyKS5zdHlsZS5taW5XaWR0aCA9IFwiI3ttYXhSb3dMZW5ndGggKiBkZWNvV2lkdGh9cHhcIlxuICAgIGVsc2VcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhAZ3V0dGVyKS5zdHlsZS53aWR0aCA9IFwiMHB4XCJcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC11cGRhdGUnXG5cbiAgdXBkYXRlRG90RGVjb3JhdGlvbnNPZmZzZXRzOiAocm93U3RhcnQsIHJvd0VuZCkgLT5cbiAgICBtYXJrZXJzQnlSb3dzID0ge31cbiAgICBzY3JvbGxMZWZ0ID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICBmb3Igcm93IGluIFtyb3dTdGFydC4ucm93RW5kXVxuICAgICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgZGVjbyA9IEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuICAgICAgICBjb250aW51ZSB1bmxlc3MgbS5tYXJrZXI/XG4gICAgICAgIG1hcmtlclJvdyA9IG0ubWFya2VyLmdldFN0YXJ0U2NyZWVuUG9zaXRpb24oKS5yb3dcbiAgICAgICAgY29udGludWUgdW5sZXNzIHJvdyBpcyBtYXJrZXJSb3dcblxuICAgICAgICBtYXJrZXJzQnlSb3dzW3Jvd10gPz0gMFxuXG4gICAgICAgIHJvd0xlbmd0aCA9IEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbcm93LCBJbmZpbml0eV0pLmxlZnRcblxuICAgICAgICBkZWNvV2lkdGggPSAxNFxuXG4gICAgICAgIGRlY28ucHJvcGVydGllcy5pdGVtLnN0eWxlLmxlZnQgPSBcIiN7KHJvd0xlbmd0aCArIG1hcmtlcnNCeVJvd3Nbcm93XSAqIGRlY29XaWR0aCkgLSBzY3JvbGxMZWZ0fXB4XCJcbiAgICAgICAgbWFya2Vyc0J5Um93c1tyb3ddKytcblxuICBnZXRHdXR0ZXJEZWNvcmF0aW9uSXRlbTogKG1hcmtlcikgLT5cbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICA8c3BhbiBzdHlsZT0nYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgI3ttYXJrZXIuY29sb3IudG9DU1MoKX0gMCUsICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9IDEwMCUpLCB1cmwoYXRvbTovL3BpZ21lbnRzL3Jlc291cmNlcy90cmFuc3BhcmVudC1iYWNrZ3JvdW5kLnBuZyk7JyBkYXRhLW1hcmtlci1pZD0nI3ttYXJrZXIuaWR9Jz48L3NwYW4+XG4gICAgXCJcIlwiXG4gICAgZGl2XG5cbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgIyMgICAgICAgIyMjIyMjIyMgICMjIyMjIyAgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgIyMgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjICAgIyMgICAgICAgIyMjIyMjICAgIyMgICAgICAgICAgIyNcbiAgIyMgICAgICAgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgICAgIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICAgIyMgICAgICAgIyMgICAgICAgIyMgICAgIyMgICAgIyNcbiAgIyMgICAgICMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgICMjIyMjIyAgICAgIyNcblxuICByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlOiAtPlxuICAgIHJldHVybiBpZiBAdXBkYXRlUmVxdWVzdGVkXG5cbiAgICBAdXBkYXRlUmVxdWVzdGVkID0gdHJ1ZVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuICAgICAgQHVwZGF0ZVJlcXVlc3RlZCA9IGZhbHNlXG4gICAgICByZXR1cm4gaWYgQGVkaXRvci5nZXRCdWZmZXIoKS5pc0Rlc3Ryb3llZCgpXG4gICAgICBAdXBkYXRlU2VsZWN0aW9ucygpXG5cbiAgdXBkYXRlU2VsZWN0aW9uczogLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG4gICAgZm9yIG1hcmtlciBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgZGVjb3JhdGlvbiA9IEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttYXJrZXIuaWRdXG5cbiAgICAgIEBoaWRlRGVjb3JhdGlvbklmSW5TZWxlY3Rpb24obWFya2VyLCBkZWNvcmF0aW9uKSBpZiBkZWNvcmF0aW9uP1xuXG4gIGhpZGVEZWNvcmF0aW9uSWZJblNlbGVjdGlvbjogKG1hcmtlciwgZGVjb3JhdGlvbikgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIHByb3BzID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICBjbGFzc2VzID0gcHJvcHMuY2xhc3Muc3BsaXQoL1xccysvZylcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbWFya2VyUmFuZ2UgPSBtYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgICBjb250aW51ZSB1bmxlc3MgbWFya2VyUmFuZ2U/IGFuZCByYW5nZT9cbiAgICAgIGlmIG1hcmtlclJhbmdlLmludGVyc2VjdHNXaXRoKHJhbmdlKVxuICAgICAgICBjbGFzc2VzWzBdICs9ICctaW4tc2VsZWN0aW9uJyB1bmxlc3MgY2xhc3Nlc1swXS5tYXRjaCgvLWluLXNlbGVjdGlvbiQvKT9cbiAgICAgICAgcHJvcHMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKVxuICAgICAgICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMocHJvcHMpXG4gICAgICAgIHJldHVyblxuXG4gICAgY2xhc3NlcyA9IGNsYXNzZXMubWFwIChjbHMpIC0+IGNscy5yZXBsYWNlKCctaW4tc2VsZWN0aW9uJywgJycpXG4gICAgcHJvcHMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKVxuICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhwcm9wcylcblxuICBoaWRlTWFya2VySWZJblNlbGVjdGlvbk9yRm9sZDogKG1hcmtlciwgdmlldykgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbWFya2VyUmFuZ2UgPSBtYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgICBjb250aW51ZSB1bmxlc3MgbWFya2VyUmFuZ2U/IGFuZCByYW5nZT9cblxuICAgICAgdmlldy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSBpZiBtYXJrZXJSYW5nZS5pbnRlcnNlY3RzV2l0aChyYW5nZSlcbiAgICAgIHZpZXcuY2xhc3NMaXN0LmFkZCgnaW4tZm9sZCcpIGlmICBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93KVxuXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAgIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICAgICMjICAgICMjICAgICAgICAjIyAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgICAgIyMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAgICAjIyAgICAjIyMjIyMgICAgICAjIyMgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICAgICMjICAgICMjICAgICAgICAgIyMgIyMgICAgICAjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgICAgIyMgICAgIyMgICAgICAgICMjICAgIyMgICAgICMjXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAgIyMgICAgIyNcbiAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICMjICAgICAjI1xuICAjIyAgICAjIyMgICAjIyMgIyMgICAgICAgIyMjICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjIyMgIyMjIyAjIyAgICAgICAjIyMjICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgIyMjICMjICMjIyMjIyAgICMjICMjICMjICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICMjIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICMjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICAjIyMjIyMjXG5cbiAgY29sb3JNYXJrZXJGb3JNb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgcG9zaXRpb24gPSBAc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgcmV0dXJuIHVubGVzcyBwb3NpdGlvbj9cblxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGNvbG9yQnVmZmVyLmVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHBvc2l0aW9uKVxuXG4gICAgQGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VyQXRCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICBwaXhlbFBvc2l0aW9uID0gQHBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgcmV0dXJuIHVubGVzcyBwaXhlbFBvc2l0aW9uP1xuXG4gICAgaWYgQGVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uP1xuICAgICAgQGVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKHBpeGVsUG9zaXRpb24pXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24ocGl4ZWxQb3NpdGlvbilcblxuICBwaXhlbFBvc2l0aW9uRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIHtjbGllbnRYLCBjbGllbnRZfSA9IGV2ZW50XG5cbiAgICBzY3JvbGxUYXJnZXQgPSBpZiBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3A/XG4gICAgICBAZWRpdG9yRWxlbWVudFxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3JcblxuICAgIHJvb3RFbGVtZW50ID0gQGdldEVkaXRvclJvb3QoKVxuXG4gICAgcmV0dXJuIHVubGVzcyByb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGluZXMnKT9cblxuICAgIHt0b3AsIGxlZnR9ID0gcm9vdEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpbmVzJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICB0b3AgPSBjbGllbnRZIC0gdG9wICsgc2Nyb2xsVGFyZ2V0LmdldFNjcm9sbFRvcCgpXG4gICAgbGVmdCA9IGNsaWVudFggLSBsZWZ0ICsgc2Nyb2xsVGFyZ2V0LmdldFNjcm9sbExlZnQoKVxuICAgIHt0b3AsIGxlZnR9XG5cbm1vZHVsZS5leHBvcnRzID1cbkNvbG9yQnVmZmVyRWxlbWVudCA9XG5yZWdpc3Rlck9yVXBkYXRlRWxlbWVudCAncGlnbWVudHMtbWFya2VycycsIENvbG9yQnVmZmVyRWxlbWVudC5wcm90b3R5cGVcbiJdfQ==

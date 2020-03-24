Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */
/** @jsx etch.dom */

var _atom = require('atom');

var _etch = require('etch');

var _etch2 = _interopRequireDefault(_etch);

var _changeCase = require('change-case');

var _changeCase2 = _interopRequireDefault(_changeCase);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _viewUri = require('./view-uri');

var _Manager = require('../Manager');

var _Manager2 = _interopRequireDefault(_Manager);

var _modelsProject = require('../models/Project');

var _modelsProject2 = _interopRequireDefault(_modelsProject);

var disposables = new _atom.CompositeDisposable();

_etch2['default'].setScheduler(atom.views);

var EditView = (function () {
  function EditView(props, children) {
    var _this = this;

    _classCallCheck(this, EditView);

    this.props = props;
    this.children = children;
    _etch2['default'].initialize(this);

    this.storeFocusedElement();

    this.element.addEventListener('click', function (event) {
      if (event.target === _this.refs.save) {
        _this.saveProject();
      }
    });

    disposables.add(atom.commands.add(this.element, {
      'core:save': function coreSave() {
        return _this.saveProject();
      },
      'core:confirm': function coreConfirm() {
        return _this.saveProject();
      }
    }));

    disposables.add(atom.commands.add('atom-workspace', {
      'core:cancel': function coreCancel() {
        return _this.close();
      }
    }));
  }

  _createClass(EditView, [{
    key: 'storeFocusedElement',
    value: function storeFocusedElement() {
      this.previouslyFocusedElement = document.activeElement;
    }
  }, {
    key: 'restoreFocus',
    value: function restoreFocus() {
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      this.destroy();
    }
  }, {
    key: 'destroy',
    value: _asyncToGenerator(function* () {
      var pane = atom.workspace.paneForURI(_viewUri.EDIT_URI);
      if (pane) {
        var item = pane.itemForURI(_viewUri.EDIT_URI);
        pane.destroyItem(item);
      }

      disposables.dispose();
      yield _etch2['default'].destroy(this);
    })
  }, {
    key: 'saveProject',
    value: function saveProject() {
      var projectProps = {
        title: this.refs.title.value,
        paths: atom.project.getPaths(),
        group: this.refs.group.value,
        icon: this.refs.icon.value,
        color: this.refs.color.value,
        devMode: this.refs.devMode.checked
      };
      var message = projectProps.title + ' has been saved.';

      if (this.props.project) {
        // Paths should already be up-to-date, so use
        // the current paths as to not break possible relative paths.
        projectProps.paths = this.props.project.getProps().paths;
      }

      // many stuff will break if there is no root path,
      // so we don't continue without a root path
      if (!projectProps.paths.length) {
        atom.notifications.addError('You must have at least one folder in your project before you can save !');
      } else {
        _Manager2['default'].saveProject(projectProps);

        if (this.props.project) {
          message = this.props.project.title + ' has been updated.';
        }
        atom.notifications.addSuccess(message);

        this.close();
      }
    }
  }, {
    key: 'update',
    value: function update(props, children) {
      this.props = props;
      this.children = children;
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      if (this.props.project) {
        return 'Edit ' + this.props.project.title;
      }

      return 'Save Project';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      // eslint-disable-line class-methods-use-this
      return 'gear';
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      // eslint-disable-line class-methods-use-this
      return _viewUri.EDIT_URI;
    }
  }, {
    key: 'render',
    value: function render() {
      var defaultProps = _modelsProject2['default'].defaultProps;
      var rootPath = atom.project.getPaths()[0];
      var props = _extends({}, defaultProps, { title: _path2['default'].basename(rootPath) });

      if (atom.config.get('project-manager.prettifyTitle')) {
        props.title = _changeCase2['default'].titleCase(_path2['default'].basename(rootPath));
      }

      if (this.props.project && this.props.project.source === 'file') {
        var projectProps = this.props.project.getProps();
        props = Object.assign({}, props, projectProps);
      }

      var wrapperStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };

      var style = {
        width: '500px'
      };

      var colorDisplay = {
        color: props.color
      };

      return _etch2['default'].dom(
        'div',
        { style: wrapperStyle, className: 'project-manager-edit padded native-key-bindings' },
        _etch2['default'].dom(
          'div',
          { style: style },
          _etch2['default'].dom(
            'h1',
            { className: 'block section-heading' },
            this.getTitle()
          ),
          _etch2['default'].dom(
            'div',
            { className: 'block' },
            _etch2['default'].dom(
              'label',
              { className: 'input-label' },
              'Title'
            ),
            _etch2['default'].dom('input', { autofocus: 'true', ref: 'title', type: 'text', className: 'input-text', value: props.title, tabIndex: '0' })
          ),
          _etch2['default'].dom(
            'div',
            { className: 'block' },
            _etch2['default'].dom(
              'label',
              { className: 'input-label' },
              'Group'
            ),
            _etch2['default'].dom('input', { ref: 'group', type: 'text', className: 'input-text', value: props.group, tabIndex: '1' })
          ),
          _etch2['default'].dom(
            'div',
            { className: 'block' },
            _etch2['default'].dom(
              'label',
              { className: 'input-label' },
              'Icon'
            ),
            _etch2['default'].dom('input', { ref: 'icon', type: 'text', className: 'input-text', value: props.icon, tabIndex: '2' })
          ),
          _etch2['default'].dom(
            'div',
            { className: 'block' },
            _etch2['default'].dom(
              'label',
              { className: 'input-label' },
              'Color'
            ),
            _etch2['default'].dom('input', { ref: 'color', type: 'text', className: 'input-text', value: props.color, tabIndex: '3', style: colorDisplay })
          ),
          _etch2['default'].dom(
            'div',
            { className: 'block' },
            _etch2['default'].dom(
              'label',
              { className: 'input-label', 'for': 'devMode' },
              'Development mode'
            ),
            _etch2['default'].dom('input', {
              ref: 'devMode',
              id: 'devMode',
              name: 'devMode',
              type: 'checkbox',
              className: 'input-toggle',
              checked: props.devMode,
              tabIndex: '4'
            })
          ),
          _etch2['default'].dom(
            'div',
            { className: 'block', style: { textAlign: 'right' } },
            _etch2['default'].dom(
              'button',
              { ref: 'save', className: 'btn btn-primary', tabIndex: '5' },
              'Save'
            )
          )
        )
      );
    }
  }]);

  return EditView;
})();

exports['default'] = EditView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3ZpZXdzL0VkaXRWaWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQUdvQyxNQUFNOztvQkFDekIsTUFBTTs7OzswQkFDQSxhQUFhOzs7O29CQUNuQixNQUFNOzs7O3VCQUNFLFlBQVk7O3VCQUNqQixZQUFZOzs7OzZCQUNaLG1CQUFtQjs7OztBQUV2QyxJQUFNLFdBQVcsR0FBRywrQkFBeUIsQ0FBQzs7QUFFOUMsa0JBQUssWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFFVCxRQUFRO0FBQ2hCLFdBRFEsUUFBUSxDQUNmLEtBQUssRUFBRSxRQUFRLEVBQUU7OzswQkFEVixRQUFROztBQUV6QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUN6QixzQkFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOztBQUUzQixRQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQUssRUFBSztBQUNoRCxVQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBSyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ25DLGNBQUssV0FBVyxFQUFFLENBQUM7T0FDcEI7S0FDRixDQUFDLENBQUM7O0FBRUgsZUFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQzlDLGlCQUFXLEVBQUU7ZUFBTSxNQUFLLFdBQVcsRUFBRTtPQUFBO0FBQ3JDLG9CQUFjLEVBQUU7ZUFBTSxNQUFLLFdBQVcsRUFBRTtPQUFBO0tBQ3pDLENBQUMsQ0FBQyxDQUFDOztBQUVKLGVBQVcsQ0FBQyxHQUFHLENBQUMs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QUFhLEVBQUMsT0FBSSxTQUFTOzthQUF5QjtZQUNuRTtBQUNFLGlCQUFHLEVBQUMsU0FBUztBQUNiLGdCQUFFLEVBQUMsU0FBUztBQUNaLGtCQUFJLEVBQUMsU0FBUztBQUNkLGtCQUFJLEVBQUMsVUFBVTtBQUNmLHVCQUFTLEVBQUMsY0FBYztBQUN4QixxQkFBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEFBQUM7QUFDdkIsc0JBQVEsRUFBQyxHQUFHO2NBQ1o7V0FDQTtVQUVOOztjQUFLLFNBQVMsRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxBQUFDO1lBQ25EOztnQkFBUSxHQUFHLEVBQUMsTUFBTSxFQUFDLFNBQVMsRUFBQyxpQkFBaUIsRUFBQyxRQUFRLEVBQUMsR0FBRzs7YUFBYztXQUNyRTtTQUNGO09BQ0YsQ0FDTjtLQUNIOzs7U0EvS2tCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9wcm9qZWN0LW1hbmFnZXIvbGliL3ZpZXdzL0VkaXRWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGV0Y2ggZnJvbSAnZXRjaCc7XG5pbXBvcnQgY2hhbmdlQ2FzZSBmcm9tICdjaGFuZ2UtY2FzZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEVESVRfVVJJIH0gZnJvbSAnLi92aWV3LXVyaSc7XG5pbXBvcnQgbWFuYWdlciBmcm9tICcuLi9NYW5hZ2VyJztcbmltcG9ydCBQcm9qZWN0IGZyb20gJy4uL21vZGVscy9Qcm9qZWN0JztcblxuY29uc3QgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG5ldGNoLnNldFNjaGVkdWxlcihhdG9tLnZpZXdzKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdFZpZXcge1xuICBjb25zdHJ1Y3Rvcihwcm9wcywgY2hpbGRyZW4pIHtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIGV0Y2guaW5pdGlhbGl6ZSh0aGlzKTtcblxuICAgIHRoaXMuc3RvcmVGb2N1c2VkRWxlbWVudCgpO1xuXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzLnJlZnMuc2F2ZSkge1xuICAgICAgICB0aGlzLnNhdmVQcm9qZWN0KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAnY29yZTpzYXZlJzogKCkgPT4gdGhpcy5zYXZlUHJvamVjdCgpLFxuICAgICAgJ2NvcmU6Y29uZmlybSc6ICgpID0+IHRoaXMuc2F2ZVByb2plY3QoKSxcbiAgICB9KSk7XG5cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gdGhpcy5jbG9zZSgpLFxuICAgIH0pKTtcbiAgfVxuXG4gIHN0b3JlRm9jdXNlZEVsZW1lbnQoKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICB9XG5cbiAgcmVzdG9yZUZvY3VzKCkge1xuICAgIGlmICh0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkge1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfVxuXG4gIGFzeW5jIGRlc3Ryb3koKSB7XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoRURJVF9VUkkpO1xuICAgIGlmIChwYW5lKSB7XG4gICAgICBjb25zdCBpdGVtID0gcGFuZS5pdGVtRm9yVVJJKEVESVRfVVJJKTtcbiAgICAgIHBhbmUuZGVzdHJveUl0ZW0oaXRlbSk7XG4gICAgfVxuXG4gICAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgIGF3YWl0IGV0Y2guZGVzdHJveSh0aGlzKTtcbiAgfVxuXG4gIHNhdmVQcm9qZWN0KCkge1xuICAgIGNvbnN0IHByb2plY3RQcm9wcyA9IHtcbiAgICAgIHRpdGxlOiB0aGlzLnJlZnMudGl0bGUudmFsdWUsXG4gICAgICBwYXRoczogYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksXG4gICAgICBncm91cDogdGhpcy5yZWZzLmdyb3VwLnZhbHVlLFxuICAgICAgaWNvbjogdGhpcy5yZWZzLmljb24udmFsdWUsXG4gICAgICBjb2xvcjogdGhpcy5yZWZzLmNvbG9yLnZhbHVlLFxuICAgICAgZGV2TW9kZTogdGhpcy5yZWZzLmRldk1vZGUuY2hlY2tlZCxcbiAgICB9O1xuICAgIGxldCBtZXNzYWdlID0gYCR7cHJvamVjdFByb3BzLnRpdGxlfSBoYXMgYmVlbiBzYXZlZC5gO1xuXG4gICAgaWYgKHRoaXMucHJvcHMucHJvamVjdCkge1xuICAgICAgLy8gUGF0aHMgc2hvdWxkIGFscmVhZHkgYmUgdXAtdG8tZGF0ZSwgc28gdXNlXG4gICAgICAvLyB0aGUgY3VycmVudCBwYXRocyBhcyB0byBub3QgYnJlYWsgcG9zc2libGUgcmVsYXRpdmUgcGF0aHMuXG4gICAgICBwcm9qZWN0UHJvcHMucGF0aHMgPSB0aGlzLnByb3BzLnByb2plY3QuZ2V0UHJvcHMoKS5wYXRocztcbiAgICB9XG5cbiAgICAvLyBtYW55IHN0dWZmIHdpbGwgYnJlYWsgaWYgdGhlcmUgaXMgbm8gcm9vdCBwYXRoLFxuICAgIC8vIHNvIHdlIGRvbid0IGNvbnRpbnVlIHdpdGhvdXQgYSByb290IHBhdGhcbiAgICBpZiAoIXByb2plY3RQcm9wcy5wYXRocy5sZW5ndGgpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignWW91IG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgZm9sZGVyIGluIHlvdXIgcHJvamVjdCBiZWZvcmUgeW91IGNhbiBzYXZlICEnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFuYWdlci5zYXZlUHJvamVjdChwcm9qZWN0UHJvcHMpO1xuXG4gICAgICBpZiAodGhpcy5wcm9wcy5wcm9qZWN0KSB7XG4gICAgICAgIG1lc3NhZ2UgPSBgJHt0aGlzLnByb3BzLnByb2plY3QudGl0bGV9IGhhcyBiZWVuIHVwZGF0ZWQuYDtcbiAgICAgIH1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKG1lc3NhZ2UpO1xuXG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHByb3BzLCBjaGlsZHJlbikge1xuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5wcm9qZWN0KSB7XG4gICAgICByZXR1cm4gYEVkaXQgJHt0aGlzLnByb3BzLnByb2plY3QudGl0bGV9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gJ1NhdmUgUHJvamVjdCc7XG4gIH1cblxuICBnZXRJY29uTmFtZSgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXG4gICAgcmV0dXJuICdnZWFyJztcbiAgfVxuXG4gIGdldFVSSSgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXG4gICAgcmV0dXJuIEVESVRfVVJJO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGRlZmF1bHRQcm9wcyA9IFByb2plY3QuZGVmYXVsdFByb3BzO1xuICAgIGNvbnN0IHJvb3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgbGV0IHByb3BzID0geyAuLi5kZWZhdWx0UHJvcHMsIHRpdGxlOiBwYXRoLmJhc2VuYW1lKHJvb3RQYXRoKSB9O1xuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgncHJvamVjdC1tYW5hZ2VyLnByZXR0aWZ5VGl0bGUnKSkge1xuICAgICAgcHJvcHMudGl0bGUgPSBjaGFuZ2VDYXNlLnRpdGxlQ2FzZShwYXRoLmJhc2VuYW1lKHJvb3RQYXRoKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMucHJvamVjdCAmJiB0aGlzLnByb3BzLnByb2plY3Quc291cmNlID09PSAnZmlsZScpIHtcbiAgICAgIGNvbnN0IHByb2plY3RQcm9wcyA9IHRoaXMucHJvcHMucHJvamVjdC5nZXRQcm9wcygpO1xuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wcywgcHJvamVjdFByb3BzKTtcbiAgICB9XG5cbiAgICBjb25zdCB3cmFwcGVyU3R5bGUgPSB7XG4gICAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICB9O1xuXG4gICAgY29uc3Qgc3R5bGUgPSB7XG4gICAgICB3aWR0aDogJzUwMHB4JyxcbiAgICB9O1xuXG4gICAgY29uc3QgY29sb3JEaXNwbGF5ID0ge1xuICAgICAgY29sb3I6IHByb3BzLmNvbG9yLFxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBzdHlsZT17d3JhcHBlclN0eWxlfSBjbGFzc05hbWU9XCJwcm9qZWN0LW1hbmFnZXItZWRpdCBwYWRkZWQgbmF0aXZlLWtleS1iaW5kaW5nc1wiPlxuICAgICAgICA8ZGl2IHN0eWxlPXtzdHlsZX0+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImJsb2NrIHNlY3Rpb24taGVhZGluZ1wiPnt0aGlzLmdldFRpdGxlKCl9PC9oMT5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJpbnB1dC1sYWJlbFwiPlRpdGxlPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBhdXRvZm9jdXM9XCJ0cnVlXCIgcmVmPVwidGl0bGVcIiB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImlucHV0LXRleHRcIiB2YWx1ZT17cHJvcHMudGl0bGV9IHRhYkluZGV4PVwiMFwiIC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5wdXQtbGFiZWxcIj5Hcm91cDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgcmVmPVwiZ3JvdXBcIiB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImlucHV0LXRleHRcIiB2YWx1ZT17cHJvcHMuZ3JvdXB9IHRhYkluZGV4PVwiMVwiIC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5wdXQtbGFiZWxcIj5JY29uPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCByZWY9XCJpY29uXCIgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJpbnB1dC10ZXh0XCIgdmFsdWU9e3Byb3BzLmljb259IHRhYkluZGV4PVwiMlwiIC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5wdXQtbGFiZWxcIj5Db2xvcjwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgcmVmPVwiY29sb3JcIiB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImlucHV0LXRleHRcIiB2YWx1ZT17cHJvcHMuY29sb3J9IHRhYkluZGV4PVwiM1wiIHN0eWxlPXtjb2xvckRpc3BsYXl9IC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiaW5wdXQtbGFiZWxcIiBmb3I9XCJkZXZNb2RlXCI+RGV2ZWxvcG1lbnQgbW9kZTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHJlZj1cImRldk1vZGVcIlxuICAgICAgICAgICAgICAgIGlkPVwiZGV2TW9kZVwiXG4gICAgICAgICAgICAgICAgbmFtZT1cImRldk1vZGVcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5wdXQtdG9nZ2xlXCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtwcm9wcy5kZXZNb2RlfVxuICAgICAgICAgICAgICAgIHRhYkluZGV4PVwiNFwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCIgc3R5bGU9e3sgdGV4dEFsaWduOiAncmlnaHQnIH19PlxuICAgICAgICAgICAgPGJ1dHRvbiByZWY9XCJzYXZlXCIgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCIgdGFiSW5kZXg9XCI1XCI+U2F2ZTwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==
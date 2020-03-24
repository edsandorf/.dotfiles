Object.defineProperty(exports, "__esModule", {
    value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

// eslint-disable-line import/no-unresolved

var _rIndent = require("./r-indent");

var _rIndent2 = _interopRequireDefault(_rIndent);

"use babel";

exports["default"] = {
    config: {
        hangingIndentTabs: {
            type: "number",
            "default": 1,
            description: "Number of tabs used for _hanging_ indents",
            "enum": [1, 2]
        }
    },
    activate: function activate() {
        _this.rIndent = new _rIndent2["default"]();
        _this.subscriptions = new _atom.CompositeDisposable();
        _this.subscriptions.add(atom.commands.add("atom-text-editor:not(.mini)", { "editor:newline": function editorNewline() {
                return _this.rIndent.properlyIndent();
            } }));
    }
};
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9hdG9tLWxhbmd1YWdlLXIvaW5zdC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOzs7O3VCQUN0QixZQUFZOzs7O0FBSGhDLFdBQVcsQ0FBQzs7cUJBS0c7QUFDWCxVQUFNLEVBQUU7QUFDSix5QkFBaUIsRUFBRTtBQUNmLGdCQUFJLEVBQUUsUUFBUTtBQUNkLHVCQUFTLENBQUM7QUFDVix1QkFBVyxFQUFFLDJDQUEyQztBQUN4RCxvQkFBTSxDQUNGLENBQUMsRUFDRCxDQUFDLENBQ0o7U0FDSjtLQUNKO0FBQ0QsWUFBUSxFQUFFLG9CQUFNO0FBQ1osY0FBSyxPQUFPLEdBQUcsMEJBQWEsQ0FBQztBQUM3QixjQUFLLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxjQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQ2xFLEVBQUUsZ0JBQWdCLEVBQUU7dUJBQU0sTUFBSyxPQUFPLENBQUMsY0FBYyxFQUFFO2FBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNuRTtDQUNKIiwiZmlsZSI6Ii9ob21lL2Vkc2FuZG9yZi8uYXRvbS9wYWNrYWdlcy9hdG9tLWxhbmd1YWdlLXIvaW5zdC9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLXVucmVzb2x2ZWRcbmltcG9ydCBSSW5kZW50IGZyb20gXCIuL3ItaW5kZW50XCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjb25maWc6IHtcbiAgICAgICAgaGFuZ2luZ0luZGVudFRhYnM6IHtcbiAgICAgICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgICAgICBkZWZhdWx0OiAxLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiTnVtYmVyIG9mIHRhYnMgdXNlZCBmb3IgX2hhbmdpbmdfIGluZGVudHNcIixcbiAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgYWN0aXZhdGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5ySW5kZW50ID0gbmV3IFJJbmRlbnQoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcImF0b20tdGV4dC1lZGl0b3I6bm90KC5taW5pKVwiLFxuICAgICAgICAgICAgeyBcImVkaXRvcjpuZXdsaW5lXCI6ICgpID0+IHRoaXMuckluZGVudC5wcm9wZXJseUluZGVudCgpIH0pKTtcbiAgICB9LFxufTtcbiJdfQ==
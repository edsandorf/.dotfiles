(function() {
  var fs, path,
    slice = [].slice;

  fs = require('fs');

  path = require('path');

  module.exports = {
    jsonFixture: function() {
      var paths;
      paths = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return function(fixture, data) {
        var json, jsonPath;
        jsonPath = path.resolve.apply(path, slice.call(paths).concat([fixture]));
        json = fs.readFileSync(jsonPath).toString();
        json = json.replace(/#\{([\w\[\]]+)\}/g, function(m, w) {
          var _, match;
          if (match = /^\[(\w+)\]$/.exec(w)) {
            _ = match[0], w = match[1];
            return data[w].shift();
          } else {
            return data[w];
          }
        });
        return JSON.parse(json);
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvaGVscGVycy9maXh0dXJlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFFBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxXQUFBLEVBQWEsU0FBQTtBQUFjLFVBQUE7TUFBYjthQUFhLFNBQUMsT0FBRCxFQUFVLElBQVY7QUFDekIsWUFBQTtRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTCxhQUFhLFdBQUEsS0FBQSxDQUFBLFFBQVUsQ0FBQSxPQUFBLENBQVYsQ0FBYjtRQUNYLElBQUEsR0FBTyxFQUFFLENBQUMsWUFBSCxDQUFnQixRQUFoQixDQUF5QixDQUFDLFFBQTFCLENBQUE7UUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxtQkFBYixFQUFrQyxTQUFDLENBQUQsRUFBRyxDQUFIO0FBQ3ZDLGNBQUE7VUFBQSxJQUFHLEtBQUEsR0FBUSxhQUFhLENBQUMsSUFBZCxDQUFtQixDQUFuQixDQUFYO1lBQ0csWUFBRCxFQUFHO21CQUNILElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFSLENBQUEsRUFGRjtXQUFBLE1BQUE7bUJBSUUsSUFBSyxDQUFBLENBQUEsRUFKUDs7UUFEdUMsQ0FBbEM7ZUFPUCxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7TUFWeUI7SUFBZCxDQUFiOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGpzb25GaXh0dXJlOiAocGF0aHMuLi4pIC0+IChmaXh0dXJlLCBkYXRhKSAtPlxuICAgIGpzb25QYXRoID0gcGF0aC5yZXNvbHZlKHBhdGhzLi4uLCBmaXh0dXJlKVxuICAgIGpzb24gPSBmcy5yZWFkRmlsZVN5bmMoanNvblBhdGgpLnRvU3RyaW5nKClcbiAgICBqc29uID0ganNvbi5yZXBsYWNlIC8jXFx7KFtcXHdcXFtcXF1dKylcXH0vZywgKG0sdykgLT5cbiAgICAgIGlmIG1hdGNoID0gL15cXFsoXFx3KylcXF0kLy5leGVjKHcpXG4gICAgICAgIFtfLHddID0gbWF0Y2hcbiAgICAgICAgZGF0YVt3XS5zaGlmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIGRhdGFbd11cblxuICAgIEpTT04ucGFyc2UoanNvbilcbiJdfQ==

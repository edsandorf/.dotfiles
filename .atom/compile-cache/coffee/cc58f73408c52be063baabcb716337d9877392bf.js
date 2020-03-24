(function() {
  var ExpressionsRegistry, PathScanner, VariableExpression, VariableScanner, async, fs;

  async = require('async');

  fs = require('fs');

  VariableScanner = require('../variable-scanner');

  VariableExpression = require('../variable-expression');

  ExpressionsRegistry = require('../expressions-registry');

  PathScanner = (function() {
    function PathScanner(filePath, scope, registry) {
      this.filePath = filePath;
      this.scanner = new VariableScanner({
        registry: registry,
        scope: scope
      });
    }

    PathScanner.prototype.load = function(done) {
      var currentChunk, currentLine, currentOffset, lastIndex, line, readStream, results;
      currentChunk = '';
      currentLine = 0;
      currentOffset = 0;
      lastIndex = 0;
      line = 0;
      results = [];
      readStream = fs.createReadStream(this.filePath);
      readStream.on('data', (function(_this) {
        return function(chunk) {
          var i, index, lastLine, len, result, v;
          currentChunk += chunk.toString();
          index = lastIndex;
          while (result = _this.scanner.search(currentChunk, lastIndex)) {
            result.range[0] += index;
            result.range[1] += index;
            for (i = 0, len = result.length; i < len; i++) {
              v = result[i];
              v.path = _this.filePath;
              v.range[0] += index;
              v.range[1] += index;
              v.definitionRange = result.range;
              v.line += line;
              lastLine = v.line;
            }
            results = results.concat(result);
            lastIndex = result.lastIndex;
          }
          if (result != null) {
            currentChunk = currentChunk.slice(lastIndex);
            line = lastLine;
            return lastIndex = 0;
          }
        };
      })(this));
      return readStream.on('end', function() {
        emit('scan-paths:path-scanned', results);
        return done();
      });
    };

    return PathScanner;

  })();

  module.exports = function(arg) {
    var paths, registry;
    paths = arg[0], registry = arg[1];
    registry = ExpressionsRegistry.deserialize(registry, VariableExpression);
    return async.each(paths, function(arg1, next) {
      var p, s;
      p = arg1[0], s = arg1[1];
      return new PathScanner(p, s, registry).load(next);
    }, this.async());
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9zY2FuLXBhdGhzLWhhbmRsZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUNsQixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0JBQVI7O0VBQ3JCLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx5QkFBUjs7RUFFaEI7SUFDUyxxQkFBQyxRQUFELEVBQVksS0FBWixFQUFtQixRQUFuQjtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1osSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLGVBQUosQ0FBb0I7UUFBQyxVQUFBLFFBQUQ7UUFBVyxPQUFBLEtBQVg7T0FBcEI7SUFEQTs7MEJBR2IsSUFBQSxHQUFNLFNBQUMsSUFBRDtBQUNKLFVBQUE7TUFBQSxZQUFBLEdBQWU7TUFDZixXQUFBLEdBQWM7TUFDZCxhQUFBLEdBQWdCO01BQ2hCLFNBQUEsR0FBWTtNQUNaLElBQUEsR0FBTztNQUNQLE9BQUEsR0FBVTtNQUVWLFVBQUEsR0FBYSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsSUFBQyxDQUFBLFFBQXJCO01BRWIsVUFBVSxDQUFDLEVBQVgsQ0FBYyxNQUFkLEVBQXNCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ3BCLGNBQUE7VUFBQSxZQUFBLElBQWdCLEtBQUssQ0FBQyxRQUFOLENBQUE7VUFFaEIsS0FBQSxHQUFRO0FBRVIsaUJBQU0sTUFBQSxHQUFTLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixZQUFoQixFQUE4QixTQUE5QixDQUFmO1lBQ0UsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUI7WUFDbkIsTUFBTSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWIsSUFBbUI7QUFFbkIsaUJBQUEsd0NBQUE7O2NBQ0UsQ0FBQyxDQUFDLElBQUYsR0FBUyxLQUFDLENBQUE7Y0FDVixDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUixJQUFjO2NBQ2QsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVIsSUFBYztjQUNkLENBQUMsQ0FBQyxlQUFGLEdBQW9CLE1BQU0sQ0FBQztjQUMzQixDQUFDLENBQUMsSUFBRixJQUFVO2NBQ1YsUUFBQSxHQUFXLENBQUMsQ0FBQztBQU5mO1lBUUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsTUFBZjtZQUNULFlBQWE7VUFiaEI7VUFlQSxJQUFHLGNBQUg7WUFDRSxZQUFBLEdBQWUsWUFBYTtZQUM1QixJQUFBLEdBQU87bUJBQ1AsU0FBQSxHQUFZLEVBSGQ7O1FBcEJvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7YUF5QkEsVUFBVSxDQUFDLEVBQVgsQ0FBYyxLQUFkLEVBQXFCLFNBQUE7UUFDbkIsSUFBQSxDQUFLLHlCQUFMLEVBQWdDLE9BQWhDO2VBQ0EsSUFBQSxDQUFBO01BRm1CLENBQXJCO0lBbkNJOzs7Ozs7RUF1Q1IsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsUUFBQTtJQURpQixnQkFBTztJQUN4QixRQUFBLEdBQVcsbUJBQW1CLENBQUMsV0FBcEIsQ0FBZ0MsUUFBaEMsRUFBMEMsa0JBQTFDO1dBQ1gsS0FBSyxDQUFDLElBQU4sQ0FDRSxLQURGLEVBRUUsU0FBQyxJQUFELEVBQVMsSUFBVDtBQUNFLFVBQUE7TUFEQSxhQUFHO2FBQ0gsSUFBSSxXQUFKLENBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLFFBQXRCLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsSUFBckM7SUFERixDQUZGLEVBSUUsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUpGO0VBRmU7QUFqRGpCIiwic291cmNlc0NvbnRlbnQiOlsiYXN5bmMgPSByZXF1aXJlICdhc3luYydcbmZzID0gcmVxdWlyZSAnZnMnXG5WYXJpYWJsZVNjYW5uZXIgPSByZXF1aXJlICcuLi92YXJpYWJsZS1zY2FubmVyJ1xuVmFyaWFibGVFeHByZXNzaW9uID0gcmVxdWlyZSAnLi4vdmFyaWFibGUtZXhwcmVzc2lvbidcbkV4cHJlc3Npb25zUmVnaXN0cnkgPSByZXF1aXJlICcuLi9leHByZXNzaW9ucy1yZWdpc3RyeSdcblxuY2xhc3MgUGF0aFNjYW5uZXJcbiAgY29uc3RydWN0b3I6IChAZmlsZVBhdGgsIHNjb3BlLCByZWdpc3RyeSkgLT5cbiAgICBAc2Nhbm5lciA9IG5ldyBWYXJpYWJsZVNjYW5uZXIoe3JlZ2lzdHJ5LCBzY29wZX0pXG5cbiAgbG9hZDogKGRvbmUpIC0+XG4gICAgY3VycmVudENodW5rID0gJydcbiAgICBjdXJyZW50TGluZSA9IDBcbiAgICBjdXJyZW50T2Zmc2V0ID0gMFxuICAgIGxhc3RJbmRleCA9IDBcbiAgICBsaW5lID0gMFxuICAgIHJlc3VsdHMgPSBbXVxuXG4gICAgcmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oQGZpbGVQYXRoKVxuXG4gICAgcmVhZFN0cmVhbS5vbiAnZGF0YScsIChjaHVuaykgPT5cbiAgICAgIGN1cnJlbnRDaHVuayArPSBjaHVuay50b1N0cmluZygpXG5cbiAgICAgIGluZGV4ID0gbGFzdEluZGV4XG5cbiAgICAgIHdoaWxlIHJlc3VsdCA9IEBzY2FubmVyLnNlYXJjaChjdXJyZW50Q2h1bmssIGxhc3RJbmRleClcbiAgICAgICAgcmVzdWx0LnJhbmdlWzBdICs9IGluZGV4XG4gICAgICAgIHJlc3VsdC5yYW5nZVsxXSArPSBpbmRleFxuXG4gICAgICAgIGZvciB2IGluIHJlc3VsdFxuICAgICAgICAgIHYucGF0aCA9IEBmaWxlUGF0aFxuICAgICAgICAgIHYucmFuZ2VbMF0gKz0gaW5kZXhcbiAgICAgICAgICB2LnJhbmdlWzFdICs9IGluZGV4XG4gICAgICAgICAgdi5kZWZpbml0aW9uUmFuZ2UgPSByZXN1bHQucmFuZ2VcbiAgICAgICAgICB2LmxpbmUgKz0gbGluZVxuICAgICAgICAgIGxhc3RMaW5lID0gdi5saW5lXG5cbiAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHJlc3VsdClcbiAgICAgICAge2xhc3RJbmRleH0gPSByZXN1bHRcblxuICAgICAgaWYgcmVzdWx0P1xuICAgICAgICBjdXJyZW50Q2h1bmsgPSBjdXJyZW50Q2h1bmtbbGFzdEluZGV4Li4tMV1cbiAgICAgICAgbGluZSA9IGxhc3RMaW5lXG4gICAgICAgIGxhc3RJbmRleCA9IDBcblxuICAgIHJlYWRTdHJlYW0ub24gJ2VuZCcsIC0+XG4gICAgICBlbWl0KCdzY2FuLXBhdGhzOnBhdGgtc2Nhbm5lZCcsIHJlc3VsdHMpXG4gICAgICBkb25lKClcblxubW9kdWxlLmV4cG9ydHMgPSAoW3BhdGhzLCByZWdpc3RyeV0pIC0+XG4gIHJlZ2lzdHJ5ID0gRXhwcmVzc2lvbnNSZWdpc3RyeS5kZXNlcmlhbGl6ZShyZWdpc3RyeSwgVmFyaWFibGVFeHByZXNzaW9uKVxuICBhc3luYy5lYWNoKFxuICAgIHBhdGhzLFxuICAgIChbcCwgc10sIG5leHQpIC0+XG4gICAgICBuZXcgUGF0aFNjYW5uZXIocCwgcywgcmVnaXN0cnkpLmxvYWQobmV4dClcbiAgICBAYXN5bmMoKVxuICApXG4iXX0=

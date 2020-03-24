(function() {
  var BufferColorsScanner, ColorContext, ColorExpression, ColorScanner, ColorsChunkSize, ExpressionsRegistry;

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  ColorExpression = require('../color-expression');

  ExpressionsRegistry = require('../expressions-registry');

  ColorsChunkSize = 100;

  BufferColorsScanner = (function() {
    function BufferColorsScanner(config) {
      var colorVariables, registry, variables;
      this.buffer = config.buffer, variables = config.variables, colorVariables = config.colorVariables, this.bufferPath = config.bufferPath, this.scope = config.scope, registry = config.registry;
      registry = ExpressionsRegistry.deserialize(registry, ColorExpression);
      this.context = new ColorContext({
        variables: variables,
        colorVariables: colorVariables,
        referencePath: this.bufferPath,
        registry: registry
      });
      this.scanner = new ColorScanner({
        context: this.context
      });
      this.results = [];
    }

    BufferColorsScanner.prototype.scan = function() {
      var lastIndex, result;
      if (this.bufferPath == null) {
        return;
      }
      lastIndex = 0;
      while (result = this.scanner.search(this.buffer, this.scope, lastIndex)) {
        this.results.push(result);
        if (this.results.length >= ColorsChunkSize) {
          this.flushColors();
        }
        lastIndex = result.lastIndex;
      }
      return this.flushColors();
    };

    BufferColorsScanner.prototype.flushColors = function() {
      emit('scan-buffer:colors-found', this.results);
      return this.results = [];
    };

    return BufferColorsScanner;

  })();

  module.exports = function(config) {
    return new BufferColorsScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9zY2FuLWJ1ZmZlci1jb2xvcnMtaGFuZGxlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVI7O0VBQ2YsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUjs7RUFDZixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDbEIsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSOztFQUN0QixlQUFBLEdBQWtCOztFQUVaO0lBQ1MsNkJBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLDRCQUFWLEVBQXFCLHNDQUFyQixFQUFxQyxJQUFDLENBQUEsb0JBQUEsVUFBdEMsRUFBa0QsSUFBQyxDQUFBLGVBQUEsS0FBbkQsRUFBMEQ7TUFDMUQsUUFBQSxHQUFXLG1CQUFtQixDQUFDLFdBQXBCLENBQWdDLFFBQWhDLEVBQTBDLGVBQTFDO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLFlBQUosQ0FBaUI7UUFBQyxXQUFBLFNBQUQ7UUFBWSxnQkFBQSxjQUFaO1FBQTRCLGFBQUEsRUFBZSxJQUFDLENBQUEsVUFBNUM7UUFBd0QsVUFBQSxRQUF4RDtPQUFqQjtNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxZQUFKLENBQWlCO1FBQUUsU0FBRCxJQUFDLENBQUEsT0FBRjtPQUFqQjtNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFMQTs7a0NBT2IsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBO01BQUEsSUFBYyx1QkFBZDtBQUFBLGVBQUE7O01BQ0EsU0FBQSxHQUFZO0FBQ1osYUFBTSxNQUFBLEdBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxNQUFqQixFQUF5QixJQUFDLENBQUEsS0FBMUIsRUFBaUMsU0FBakMsQ0FBZjtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQ7UUFFQSxJQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsSUFBbUIsZUFBckM7VUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBQUE7O1FBQ0MsWUFBYTtNQUpoQjthQU1BLElBQUMsQ0FBQSxXQUFELENBQUE7SUFUSTs7a0NBV04sV0FBQSxHQUFhLFNBQUE7TUFDWCxJQUFBLENBQUssMEJBQUwsRUFBaUMsSUFBQyxDQUFBLE9BQWxDO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUZBOzs7Ozs7RUFJZixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE1BQUQ7V0FDZixJQUFJLG1CQUFKLENBQXdCLE1BQXhCLENBQStCLENBQUMsSUFBaEMsQ0FBQTtFQURlO0FBN0JqQiIsInNvdXJjZXNDb250ZW50IjpbIkNvbG9yU2Nhbm5lciA9IHJlcXVpcmUgJy4uL2NvbG9yLXNjYW5uZXInXG5Db2xvckNvbnRleHQgPSByZXF1aXJlICcuLi9jb2xvci1jb250ZXh0J1xuQ29sb3JFeHByZXNzaW9uID0gcmVxdWlyZSAnLi4vY29sb3ItZXhwcmVzc2lvbidcbkV4cHJlc3Npb25zUmVnaXN0cnkgPSByZXF1aXJlICcuLi9leHByZXNzaW9ucy1yZWdpc3RyeSdcbkNvbG9yc0NodW5rU2l6ZSA9IDEwMFxuXG5jbGFzcyBCdWZmZXJDb2xvcnNTY2FubmVyXG4gIGNvbnN0cnVjdG9yOiAoY29uZmlnKSAtPlxuICAgIHtAYnVmZmVyLCB2YXJpYWJsZXMsIGNvbG9yVmFyaWFibGVzLCBAYnVmZmVyUGF0aCwgQHNjb3BlLCByZWdpc3RyeX0gPSBjb25maWdcbiAgICByZWdpc3RyeSA9IEV4cHJlc3Npb25zUmVnaXN0cnkuZGVzZXJpYWxpemUocmVnaXN0cnksIENvbG9yRXhwcmVzc2lvbilcbiAgICBAY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe3ZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIHJlZmVyZW5jZVBhdGg6IEBidWZmZXJQYXRoLCByZWdpc3RyeX0pXG4gICAgQHNjYW5uZXIgPSBuZXcgQ29sb3JTY2FubmVyKHtAY29udGV4dH0pXG4gICAgQHJlc3VsdHMgPSBbXVxuXG4gIHNjYW46IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAYnVmZmVyUGF0aD9cbiAgICBsYXN0SW5kZXggPSAwXG4gICAgd2hpbGUgcmVzdWx0ID0gQHNjYW5uZXIuc2VhcmNoKEBidWZmZXIsIEBzY29wZSwgbGFzdEluZGV4KVxuICAgICAgQHJlc3VsdHMucHVzaChyZXN1bHQpXG5cbiAgICAgIEBmbHVzaENvbG9ycygpIGlmIEByZXN1bHRzLmxlbmd0aCA+PSBDb2xvcnNDaHVua1NpemVcbiAgICAgIHtsYXN0SW5kZXh9ID0gcmVzdWx0XG5cbiAgICBAZmx1c2hDb2xvcnMoKVxuXG4gIGZsdXNoQ29sb3JzOiAtPlxuICAgIGVtaXQoJ3NjYW4tYnVmZmVyOmNvbG9ycy1mb3VuZCcsIEByZXN1bHRzKVxuICAgIEByZXN1bHRzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSAoY29uZmlnKSAtPlxuICBuZXcgQnVmZmVyQ29sb3JzU2Nhbm5lcihjb25maWcpLnNjYW4oKVxuIl19

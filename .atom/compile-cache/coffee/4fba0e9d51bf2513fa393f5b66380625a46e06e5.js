(function() {
  var ColorContext, ColorParser, registry,
    slice = [].slice;

  ColorContext = require('../lib/color-context');

  ColorParser = require('../lib/color-parser');

  registry = require('../lib/color-expressions');

  describe('ColorContext', function() {
    var context, itParses, parser, ref;
    ref = [], context = ref[0], parser = ref[1];
    itParses = function(expression) {
      return {
        asUndefined: function() {
          return it("parses '" + expression + "' as undefined", function() {
            return expect(context.getValue(expression)).toBeUndefined();
          });
        },
        asUndefinedColor: function() {
          return it("parses '" + expression + "' as undefined color", function() {
            return expect(context.readColor(expression)).toBeUndefined();
          });
        },
        asInt: function(expected) {
          return it("parses '" + expression + "' as an integer with value of " + expected, function() {
            return expect(context.readInt(expression)).toEqual(expected);
          });
        },
        asFloat: function(expected) {
          return it("parses '" + expression + "' as a float with value of " + expected, function() {
            return expect(context.readFloat(expression)).toEqual(expected);
          });
        },
        asIntOrPercent: function(expected) {
          return it("parses '" + expression + "' as an integer or a percentage with value of " + expected, function() {
            return expect(context.readIntOrPercent(expression)).toEqual(expected);
          });
        },
        asFloatOrPercent: function(expected) {
          return it("parses '" + expression + "' as a float or a percentage with value of " + expected, function() {
            return expect(context.readFloatOrPercent(expression)).toEqual(expected);
          });
        },
        asColorExpression: function(expected) {
          return it("parses '" + expression + "' as a color expression", function() {
            return expect(context.readColorExpression(expression)).toEqual(expected);
          });
        },
        asColor: function() {
          var expected;
          expected = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return it("parses '" + expression + "' as a color with value of " + (jasmine.pp(expected)), function() {
            var ref1;
            return (ref1 = expect(context.readColor(expression))).toBeColor.apply(ref1, expected);
          });
        },
        asInvalidColor: function() {
          var expected;
          expected = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return it("parses '" + expression + "' as an invalid color", function() {
            return expect(context.readColor(expression)).not.toBeValid();
          });
        }
      };
    };
    describe('created without any variables', function() {
      beforeEach(function() {
        return context = new ColorContext({
          registry: registry
        });
      });
      itParses('10').asInt(10);
      itParses('10').asFloat(10);
      itParses('0.5').asFloat(0.5);
      itParses('.5').asFloat(0.5);
      itParses('10').asIntOrPercent(10);
      itParses('10%').asIntOrPercent(26);
      itParses('0.1').asFloatOrPercent(0.1);
      itParses('10%').asFloatOrPercent(0.1);
      itParses('red').asColorExpression('red');
      itParses('red').asColor(255, 0, 0);
      itParses('#ff0000').asColor(255, 0, 0);
      return itParses('rgb(255,127,0)').asColor(255, 127, 0);
    });
    describe('with a variables array', function() {
      var createColorVar, createVar;
      createVar = function(name, value, path) {
        return {
          value: value,
          name: name,
          path: path != null ? path : '/path/to/file.coffee'
        };
      };
      createColorVar = function(name, value, path) {
        var v;
        v = createVar(name, value, path);
        v.isColor = true;
        return v;
      };
      describe('that contains valid variables', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createVar('x', '10'), createVar('y', '0.1'), createVar('z', '10%'), createColorVar('c', 'rgb(255,127,0)')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        itParses('x').asInt(10);
        itParses('y').asFloat(0.1);
        itParses('z').asIntOrPercent(26);
        itParses('z').asFloatOrPercent(0.1);
        itParses('c').asColorExpression('rgb(255,127,0)');
        return itParses('c').asColor(255, 127, 0);
      });
      describe('that contains alias for named colors', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createColorVar('$text-color', 'white', '/path/to/file.css.sass'), createColorVar('$background-color', 'black', '/path/to/file.css.sass')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        itParses('$text-color').asColor(255, 255, 255);
        return itParses('$background-color').asColor(0, 0, 0);
      });
      describe('that contains invalid colors', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@text-height', '@scale-b-xxl * 1rem'), createVar('@component-line-height', '@text-height'), createVar('@list-item-height', '@component-line-height')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        return itParses('@list-item-height').asUndefinedColor();
      });
      describe('that contains circular references', function() {
        beforeEach(function() {
          var variables;
          variables = [createVar('@foo', '@bar'), createVar('@bar', '@baz'), createVar('@baz', '@foo'), createVar('@taz', '@taz')];
          return context = new ColorContext({
            variables: variables,
            registry: registry
          });
        });
        itParses('@foo').asUndefined();
        return itParses('@taz').asUndefined();
      });
      describe('that contains circular references', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createColorVar('@foo', '@bar'), createColorVar('@bar', '@baz'), createColorVar('@baz', '@foo'), createColorVar('@taz', '@taz')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        itParses('@foo').asInvalidColor();
        itParses('@foo').asUndefined();
        return itParses('@taz').asUndefined();
      });
      return describe('that contains circular references nested in operations', function() {
        beforeEach(function() {
          var colorVariables, variables;
          variables = [createColorVar('@foo', 'complement(@bar)'), createColorVar('@bar', 'transparentize(@baz, 0.5)'), createColorVar('@baz', 'darken(@foo, 10%)')];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            variables: variables,
            colorVariables: colorVariables,
            registry: registry
          });
        });
        return itParses('@foo').asInvalidColor();
      });
    });
    describe('with variables from a default file', function() {
      var createColorVar, createVar, projectPath, ref1, referenceVariable;
      ref1 = [], projectPath = ref1[0], referenceVariable = ref1[1];
      createVar = function(name, value, path, isDefault) {
        if (isDefault == null) {
          isDefault = false;
        }
        if (path == null) {
          path = projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path,
          "default": isDefault
        };
      };
      createColorVar = function(name, value, path, isDefault) {
        var v;
        v = createVar(name, value, path, isDefault);
        v.isColor = true;
        return v;
      };
      describe('when there is another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl", true), createVar('b', '20', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(20);
      });
      describe('when there is no another valid value', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl", true), createVar('b', 'c', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      describe('when there is another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', projectPath + "/b.styl", true), createColorVar('b', '#0000ff', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(0, 0, 255);
      });
      return describe('when there is no another valid color', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createColorVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createColorVar('b', '#ff0000', projectPath + "/b.styl", true), createColorVar('b', 'c', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asColor(255, 0, 0);
      });
    });
    describe('with a reference variable', function() {
      var createColorVar, createVar, projectPath, ref1, referenceVariable;
      ref1 = [], projectPath = ref1[0], referenceVariable = ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl"), createVar('b', '20', projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referenceVariable: referenceVariable,
            rootPaths: [projectPath, projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
    return describe('with a reference path', function() {
      var createColorVar, createVar, projectPath, ref1, referenceVariable;
      ref1 = [], projectPath = ref1[0], referenceVariable = ref1[1];
      createVar = function(name, value, path) {
        if (path == null) {
          path = projectPath + "/file.styl";
        }
        return {
          value: value,
          name: name,
          path: path
        };
      };
      createColorVar = function(name, value) {
        var v;
        v = createVar(name, value);
        v.isColor = true;
        return v;
      };
      describe('when there is a single root path', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', '10', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('a', '20', projectPath + "/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referencePath: projectPath + "/a.styl",
            rootPaths: [projectPath]
          });
        });
        return itParses('a').asInt(10);
      });
      return describe('when there are many root paths', function() {
        beforeEach(function() {
          var colorVariables, variables;
          projectPath = atom.project.getPaths()[0];
          referenceVariable = createVar('a', 'b', projectPath + "/a.styl");
          variables = [referenceVariable, createVar('b', '10', projectPath + "/b.styl"), createVar('b', '20', projectPath + "2/b.styl")];
          colorVariables = variables.filter(function(v) {
            return v.isColor;
          });
          return context = new ColorContext({
            registry: registry,
            variables: variables,
            colorVariables: colorVariables,
            referencePath: projectPath + "/a.styl",
            rootPaths: [projectPath, projectPath + "2"]
          });
        });
        return itParses('a').asInt(10);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3ItY29udGV4dC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUEsbUNBQUE7SUFBQTs7RUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSOztFQUNmLFdBQUEsR0FBYyxPQUFBLENBQVEscUJBQVI7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSwwQkFBUjs7RUFFWCxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxNQUFvQixFQUFwQixFQUFDLGdCQUFELEVBQVU7SUFFVixRQUFBLEdBQVcsU0FBQyxVQUFEO2FBQ1Q7UUFBQSxXQUFBLEVBQWEsU0FBQTtpQkFDWCxFQUFBLENBQUcsVUFBQSxHQUFXLFVBQVgsR0FBc0IsZ0JBQXpCLEVBQTBDLFNBQUE7bUJBQ3hDLE1BQUEsQ0FBTyxPQUFPLENBQUMsUUFBUixDQUFpQixVQUFqQixDQUFQLENBQW9DLENBQUMsYUFBckMsQ0FBQTtVQUR3QyxDQUExQztRQURXLENBQWI7UUFJQSxnQkFBQSxFQUFrQixTQUFBO2lCQUNoQixFQUFBLENBQUcsVUFBQSxHQUFXLFVBQVgsR0FBc0Isc0JBQXpCLEVBQWdELFNBQUE7bUJBQzlDLE1BQUEsQ0FBTyxPQUFPLENBQUMsU0FBUixDQUFrQixVQUFsQixDQUFQLENBQXFDLENBQUMsYUFBdEMsQ0FBQTtVQUQ4QyxDQUFoRDtRQURnQixDQUpsQjtRQVFBLEtBQUEsRUFBTyxTQUFDLFFBQUQ7aUJBQ0wsRUFBQSxDQUFHLFVBQUEsR0FBVyxVQUFYLEdBQXNCLGdDQUF0QixHQUFzRCxRQUF6RCxFQUFxRSxTQUFBO21CQUNuRSxNQUFBLENBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBaEIsQ0FBUCxDQUFtQyxDQUFDLE9BQXBDLENBQTRDLFFBQTVDO1VBRG1FLENBQXJFO1FB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YixDQUFBLENBQXdCLENBQUEsQ0FBQTtVQUN0QyxpQkFBQSxHQUFvQixTQUFBLENBQVUsR0FBVixFQUFlLEdBQWYsRUFBdUIsV0FBRCxHQUFhLFNBQW5DO1VBRXBCLFNBQUEsR0FBWSxDQUNWLGlCQURVLEVBRVYsU0FBQSxDQUFVLEdBQVYsRUFBZSxJQUFmLEVBQXdCLFdBQUQsR0FBYSxTQUFwQyxDQUZVLEVBR1YsU0FBQSxDQUFVLEdBQVYsRUFBZSxJQUFmLEVBQXdCLFdBQUQsR0FBYSxVQUFwQyxDQUhVO1VBTVosY0FBQSxHQUFpQixTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1VBQVQsQ0FBakI7aUJBRWpCLE9BQUEsR0FBVSxJQUFJLFlBQUosQ0FBaUI7WUFDekIsVUFBQSxRQUR5QjtZQUV6QixXQUFBLFNBRnlCO1lBR3pCLGdCQUFBLGNBSHlCO1lBSXpCLGFBQUEsRUFBa0IsV0FBRCxHQUFhLFNBSkw7WUFLekIsU0FBQSxFQUFXLENBQUMsV0FBRCxFQUFpQixXQUFELEdBQWEsR0FBN0IsQ0FMYztXQUFqQjtRQVpELENBQVg7ZUFvQkEsUUFBQSxDQUFTLEdBQVQsQ0FBYSxDQUFDLEtBQWQsQ0FBb0IsRUFBcEI7TUFyQnlDLENBQTNDO0lBakNnQyxDQUFsQztFQWxVdUIsQ0FBekI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIlxuQ29sb3JDb250ZXh0ID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLWNvbnRleHQnXG5Db2xvclBhcnNlciA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvci1wYXJzZXInXG5yZWdpc3RyeSA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvci1leHByZXNzaW9ucydcblxuZGVzY3JpYmUgJ0NvbG9yQ29udGV4dCcsIC0+XG4gIFtjb250ZXh0LCBwYXJzZXJdID0gW11cblxuICBpdFBhcnNlcyA9IChleHByZXNzaW9uKSAtPlxuICAgIGFzVW5kZWZpbmVkOiAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIHVuZGVmaW5lZFwiLCAtPlxuICAgICAgICBleHBlY3QoY29udGV4dC5nZXRWYWx1ZShleHByZXNzaW9uKSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBhc1VuZGVmaW5lZENvbG9yOiAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIHVuZGVmaW5lZCBjb2xvclwiLCAtPlxuICAgICAgICBleHBlY3QoY29udGV4dC5yZWFkQ29sb3IoZXhwcmVzc2lvbikpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgYXNJbnQ6IChleHBlY3RlZCkgLT5cbiAgICAgIGl0IFwicGFyc2VzICcje2V4cHJlc3Npb259JyBhcyBhbiBpbnRlZ2VyIHdpdGggdmFsdWUgb2YgI3tleHBlY3RlZH1cIiwgLT5cbiAgICAgICAgZXhwZWN0KGNvbnRleHQucmVhZEludChleHByZXNzaW9uKSkudG9FcXVhbChleHBlY3RlZClcblxuICAgIGFzRmxvYXQ6IChleHBlY3RlZCkgLT5cbiAgICAgIGl0IFwicGFyc2VzICcje2V4cHJlc3Npb259JyBhcyBhIGZsb2F0IHdpdGggdmFsdWUgb2YgI3tleHBlY3RlZH1cIiwgLT5cbiAgICAgICAgZXhwZWN0KGNvbnRleHQucmVhZEZsb2F0KGV4cHJlc3Npb24pKS50b0VxdWFsKGV4cGVjdGVkKVxuXG4gICAgYXNJbnRPclBlcmNlbnQ6IChleHBlY3RlZCkgLT5cbiAgICAgIGl0IFwicGFyc2VzICcje2V4cHJlc3Npb259JyBhcyBhbiBpbnRlZ2VyIG9yIGEgcGVyY2VudGFnZSB3aXRoIHZhbHVlIG9mICN7ZXhwZWN0ZWR9XCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LnJlYWRJbnRPclBlcmNlbnQoZXhwcmVzc2lvbikpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICBhc0Zsb2F0T3JQZXJjZW50OiAoZXhwZWN0ZWQpIC0+XG4gICAgICBpdCBcInBhcnNlcyAnI3tleHByZXNzaW9ufScgYXMgYSBmbG9hdCBvciBhIHBlcmNlbnRhZ2Ugd2l0aCB2YWx1ZSBvZiAje2V4cGVjdGVkfVwiLCAtPlxuICAgICAgICBleHBlY3QoY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoZXhwcmVzc2lvbikpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICBhc0NvbG9yRXhwcmVzc2lvbjogKGV4cGVjdGVkKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGEgY29sb3IgZXhwcmVzc2lvblwiLCAtPlxuICAgICAgICBleHBlY3QoY29udGV4dC5yZWFkQ29sb3JFeHByZXNzaW9uKGV4cHJlc3Npb24pKS50b0VxdWFsKGV4cGVjdGVkKVxuXG4gICAgYXNDb2xvcjogKGV4cGVjdGVkLi4uKSAtPlxuICAgICAgaXQgXCJwYXJzZXMgJyN7ZXhwcmVzc2lvbn0nIGFzIGEgY29sb3Igd2l0aCB2YWx1ZSBvZiAje2phc21pbmUucHAgZXhwZWN0ZWR9XCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LnJlYWRDb2xvcihleHByZXNzaW9uKSkudG9CZUNvbG9yKGV4cGVjdGVkLi4uKVxuXG4gICAgYXNJbnZhbGlkQ29sb3I6IChleHBlY3RlZC4uLikgLT5cbiAgICAgIGl0IFwicGFyc2VzICcje2V4cHJlc3Npb259JyBhcyBhbiBpbnZhbGlkIGNvbG9yXCIsIC0+XG4gICAgICAgIGV4cGVjdChjb250ZXh0LnJlYWRDb2xvcihleHByZXNzaW9uKSkubm90LnRvQmVWYWxpZCgpXG5cbiAgZGVzY3JpYmUgJ2NyZWF0ZWQgd2l0aG91dCBhbnkgdmFyaWFibGVzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7cmVnaXN0cnl9KVxuXG4gICAgaXRQYXJzZXMoJzEwJykuYXNJbnQoMTApXG5cbiAgICBpdFBhcnNlcygnMTAnKS5hc0Zsb2F0KDEwKVxuICAgIGl0UGFyc2VzKCcwLjUnKS5hc0Zsb2F0KDAuNSlcbiAgICBpdFBhcnNlcygnLjUnKS5hc0Zsb2F0KDAuNSlcblxuICAgIGl0UGFyc2VzKCcxMCcpLmFzSW50T3JQZXJjZW50KDEwKVxuICAgIGl0UGFyc2VzKCcxMCUnKS5hc0ludE9yUGVyY2VudCgyNilcblxuICAgIGl0UGFyc2VzKCcwLjEnKS5hc0Zsb2F0T3JQZXJjZW50KDAuMSlcbiAgICBpdFBhcnNlcygnMTAlJykuYXNGbG9hdE9yUGVyY2VudCgwLjEpXG5cbiAgICBpdFBhcnNlcygncmVkJykuYXNDb2xvckV4cHJlc3Npb24oJ3JlZCcpXG5cbiAgICBpdFBhcnNlcygncmVkJykuYXNDb2xvcigyNTUsIDAsIDApXG4gICAgaXRQYXJzZXMoJyNmZjAwMDAnKS5hc0NvbG9yKDI1NSwgMCwgMClcbiAgICBpdFBhcnNlcygncmdiKDI1NSwxMjcsMCknKS5hc0NvbG9yKDI1NSwgMTI3LCAwKVxuXG4gIGRlc2NyaWJlICd3aXRoIGEgdmFyaWFibGVzIGFycmF5JywgLT5cbiAgICBjcmVhdGVWYXIgPSAobmFtZSwgdmFsdWUsIHBhdGgpIC0+XG4gICAgICB7dmFsdWUsIG5hbWUsIHBhdGg6IHBhdGggPyAnL3BhdGgvdG8vZmlsZS5jb2ZmZWUnfVxuXG4gICAgY3JlYXRlQ29sb3JWYXIgPSAobmFtZSwgdmFsdWUsIHBhdGgpIC0+XG4gICAgICB2ID0gY3JlYXRlVmFyKG5hbWUsIHZhbHVlLCBwYXRoKVxuICAgICAgdi5pc0NvbG9yID0gdHJ1ZVxuICAgICAgdlxuXG4gICAgZGVzY3JpYmUgJ3RoYXQgY29udGFpbnMgdmFsaWQgdmFyaWFibGVzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmFyaWFibGVzID0gW1xuICAgICAgICAgIGNyZWF0ZVZhciAneCcsICcxMCdcbiAgICAgICAgICBjcmVhdGVWYXIgJ3knLCAnMC4xJ1xuICAgICAgICAgIGNyZWF0ZVZhciAneicsICcxMCUnXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ2MnLCAncmdiKDI1NSwxMjcsMCknXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHt2YXJpYWJsZXMsIGNvbG9yVmFyaWFibGVzLCByZWdpc3RyeX0pXG5cbiAgICAgIGl0UGFyc2VzKCd4JykuYXNJbnQoMTApXG4gICAgICBpdFBhcnNlcygneScpLmFzRmxvYXQoMC4xKVxuICAgICAgaXRQYXJzZXMoJ3onKS5hc0ludE9yUGVyY2VudCgyNilcbiAgICAgIGl0UGFyc2VzKCd6JykuYXNGbG9hdE9yUGVyY2VudCgwLjEpXG5cbiAgICAgIGl0UGFyc2VzKCdjJykuYXNDb2xvckV4cHJlc3Npb24oJ3JnYigyNTUsMTI3LDApJylcbiAgICAgIGl0UGFyc2VzKCdjJykuYXNDb2xvcigyNTUsIDEyNywgMClcblxuICAgIGRlc2NyaWJlICd0aGF0IGNvbnRhaW5zIGFsaWFzIGZvciBuYW1lZCBjb2xvcnMnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2YXJpYWJsZXMgPVtcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnJHRleHQtY29sb3InLCAnd2hpdGUnLCAnL3BhdGgvdG8vZmlsZS5jc3Muc2FzcydcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnJGJhY2tncm91bmQtY29sb3InLCAnYmxhY2snLCAnL3BhdGgvdG8vZmlsZS5jc3Muc2FzcydcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe3ZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIHJlZ2lzdHJ5fSlcblxuICAgICAgaXRQYXJzZXMoJyR0ZXh0LWNvbG9yJykuYXNDb2xvcigyNTUsMjU1LDI1NSlcbiAgICAgIGl0UGFyc2VzKCckYmFja2dyb3VuZC1jb2xvcicpLmFzQ29sb3IoMCwwLDApXG5cbiAgICBkZXNjcmliZSAndGhhdCBjb250YWlucyBpbnZhbGlkIGNvbG9ycycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZhcmlhYmxlcyA9W1xuICAgICAgICAgIGNyZWF0ZVZhciAnQHRleHQtaGVpZ2h0JywgJ0BzY2FsZS1iLXh4bCAqIDFyZW0nXG4gICAgICAgICAgY3JlYXRlVmFyICdAY29tcG9uZW50LWxpbmUtaGVpZ2h0JywgJ0B0ZXh0LWhlaWdodCdcbiAgICAgICAgICBjcmVhdGVWYXIgJ0BsaXN0LWl0ZW0taGVpZ2h0JywgJ0Bjb21wb25lbnQtbGluZS1oZWlnaHQnXG4gICAgICAgIF1cblxuICAgICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7dmFyaWFibGVzLCByZWdpc3RyeX0pXG5cbiAgICAgIGl0UGFyc2VzKCdAbGlzdC1pdGVtLWhlaWdodCcpLmFzVW5kZWZpbmVkQ29sb3IoKVxuXG4gICAgZGVzY3JpYmUgJ3RoYXQgY29udGFpbnMgY2lyY3VsYXIgcmVmZXJlbmNlcycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZhcmlhYmxlcyA9W1xuICAgICAgICAgIGNyZWF0ZVZhciAnQGZvbycsICdAYmFyJ1xuICAgICAgICAgIGNyZWF0ZVZhciAnQGJhcicsICdAYmF6J1xuICAgICAgICAgIGNyZWF0ZVZhciAnQGJheicsICdAZm9vJ1xuICAgICAgICAgIGNyZWF0ZVZhciAnQHRheicsICdAdGF6J1xuICAgICAgICBdXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe3ZhcmlhYmxlcywgcmVnaXN0cnl9KVxuXG4gICAgICBpdFBhcnNlcygnQGZvbycpLmFzVW5kZWZpbmVkKClcbiAgICAgIGl0UGFyc2VzKCdAdGF6JykuYXNVbmRlZmluZWQoKVxuXG4gICAgZGVzY3JpYmUgJ3RoYXQgY29udGFpbnMgY2lyY3VsYXIgcmVmZXJlbmNlcycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZhcmlhYmxlcyA9W1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdAZm9vJywgJ0BiYXInXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ0BiYXInLCAnQGJheidcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnQGJheicsICdAZm9vJ1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdAdGF6JywgJ0B0YXonXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHt2YXJpYWJsZXMsIGNvbG9yVmFyaWFibGVzLCByZWdpc3RyeX0pXG5cbiAgICAgIGl0UGFyc2VzKCdAZm9vJykuYXNJbnZhbGlkQ29sb3IoKVxuICAgICAgaXRQYXJzZXMoJ0Bmb28nKS5hc1VuZGVmaW5lZCgpXG4gICAgICBpdFBhcnNlcygnQHRheicpLmFzVW5kZWZpbmVkKClcblxuICAgIGRlc2NyaWJlICd0aGF0IGNvbnRhaW5zIGNpcmN1bGFyIHJlZmVyZW5jZXMgbmVzdGVkIGluIG9wZXJhdGlvbnMnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2YXJpYWJsZXMgPVtcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnQGZvbycsICdjb21wbGVtZW50KEBiYXIpJ1xuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdAYmFyJywgJ3RyYW5zcGFyZW50aXplKEBiYXosIDAuNSknXG4gICAgICAgICAgY3JlYXRlQ29sb3JWYXIgJ0BiYXonLCAnZGFya2VuKEBmb28sIDEwJSknXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHt2YXJpYWJsZXMsIGNvbG9yVmFyaWFibGVzLCByZWdpc3RyeX0pXG5cbiAgICAgIGl0UGFyc2VzKCdAZm9vJykuYXNJbnZhbGlkQ29sb3IoKVxuXG4gIGRlc2NyaWJlICd3aXRoIHZhcmlhYmxlcyBmcm9tIGEgZGVmYXVsdCBmaWxlJywgLT5cbiAgICBbcHJvamVjdFBhdGgsIHJlZmVyZW5jZVZhcmlhYmxlXSA9IFtdXG4gICAgY3JlYXRlVmFyID0gKG5hbWUsIHZhbHVlLCBwYXRoLCBpc0RlZmF1bHQ9ZmFsc2UpIC0+XG4gICAgICBwYXRoID89IFwiI3twcm9qZWN0UGF0aH0vZmlsZS5zdHlsXCJcbiAgICAgIHt2YWx1ZSwgbmFtZSwgcGF0aCwgZGVmYXVsdDogaXNEZWZhdWx0fVxuXG4gICAgY3JlYXRlQ29sb3JWYXIgPSAobmFtZSwgdmFsdWUsIHBhdGgsIGlzRGVmYXVsdCkgLT5cbiAgICAgIHYgPSBjcmVhdGVWYXIobmFtZSwgdmFsdWUsIHBhdGgsIGlzRGVmYXVsdClcbiAgICAgIHYuaXNDb2xvciA9IHRydWVcbiAgICAgIHZcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZXJlIGlzIGFub3RoZXIgdmFsaWQgdmFsdWUnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlVmFyICdhJywgJ2InLCBcIiN7cHJvamVjdFBhdGh9L2Euc3R5bFwiXG5cbiAgICAgICAgdmFyaWFibGVzID0gW1xuICAgICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlXG4gICAgICAgICAgY3JlYXRlVmFyICdiJywgJzEwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIiwgdHJ1ZVxuICAgICAgICAgIGNyZWF0ZVZhciAnYicsICcyMCcsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIHJvb3RQYXRoczogW3Byb2plY3RQYXRoXVxuICAgICAgICB9KVxuXG4gICAgICBpdFBhcnNlcygnYScpLmFzSW50KDIwKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlcmUgaXMgbm8gYW5vdGhlciB2YWxpZCB2YWx1ZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgcmVmZXJlbmNlVmFyaWFibGUgPSBjcmVhdGVWYXIgJ2EnLCAnYicsIFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcblxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICBjcmVhdGVWYXIgJ2InLCAnMTAnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiLCB0cnVlXG4gICAgICAgICAgY3JlYXRlVmFyICdiJywgJ2MnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgICAgICByZWdpc3RyeVxuICAgICAgICAgIHZhcmlhYmxlc1xuICAgICAgICAgIGNvbG9yVmFyaWFibGVzXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aF1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0ludCgxMClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZXJlIGlzIGFub3RoZXIgdmFsaWQgY29sb3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlQ29sb3JWYXIgJ2EnLCAnYicsIFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcblxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnYicsICcjZmYwMDAwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIiwgdHJ1ZVxuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdiJywgJyMwMDAwZmYnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgICAgICByZWdpc3RyeVxuICAgICAgICAgIHZhcmlhYmxlc1xuICAgICAgICAgIGNvbG9yVmFyaWFibGVzXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aF1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0NvbG9yKDAsIDAsIDI1NSlcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZXJlIGlzIG5vIGFub3RoZXIgdmFsaWQgY29sb3InLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlQ29sb3JWYXIgJ2EnLCAnYicsIFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcblxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICBjcmVhdGVDb2xvclZhciAnYicsICcjZmYwMDAwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIiwgdHJ1ZVxuICAgICAgICAgIGNyZWF0ZUNvbG9yVmFyICdiJywgJ2MnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgICAgICByZWdpc3RyeVxuICAgICAgICAgIHZhcmlhYmxlc1xuICAgICAgICAgIGNvbG9yVmFyaWFibGVzXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aF1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0NvbG9yKDI1NSwgMCwgMClcblxuICBkZXNjcmliZSAnd2l0aCBhIHJlZmVyZW5jZSB2YXJpYWJsZScsIC0+XG4gICAgW3Byb2plY3RQYXRoLCByZWZlcmVuY2VWYXJpYWJsZV0gPSBbXVxuICAgIGNyZWF0ZVZhciA9IChuYW1lLCB2YWx1ZSwgcGF0aCkgLT5cbiAgICAgIHBhdGggPz0gXCIje3Byb2plY3RQYXRofS9maWxlLnN0eWxcIlxuICAgICAge3ZhbHVlLCBuYW1lLCBwYXRofVxuXG4gICAgY3JlYXRlQ29sb3JWYXIgPSAobmFtZSwgdmFsdWUpIC0+XG4gICAgICB2ID0gY3JlYXRlVmFyKG5hbWUsIHZhbHVlKVxuICAgICAgdi5pc0NvbG9yID0gdHJ1ZVxuICAgICAgdlxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlcmUgaXMgYSBzaW5nbGUgcm9vdCBwYXRoJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgICByZWZlcmVuY2VWYXJpYWJsZSA9IGNyZWF0ZVZhciAnYScsICcxMCcsIFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcblxuICAgICAgICB2YXJpYWJsZXMgPSBbXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICBjcmVhdGVWYXIgJ2EnLCAnMjAnLCBcIiN7cHJvamVjdFBhdGh9L2Iuc3R5bFwiXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgICAgICByZWdpc3RyeVxuICAgICAgICAgIHZhcmlhYmxlc1xuICAgICAgICAgIGNvbG9yVmFyaWFibGVzXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aF1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0ludCgxMClcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZXJlIGFyZSBtYW55IHJvb3QgcGF0aHMnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlVmFyICdhJywgJ2InLCBcIiN7cHJvamVjdFBhdGh9L2Euc3R5bFwiXG5cbiAgICAgICAgdmFyaWFibGVzID0gW1xuICAgICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlXG4gICAgICAgICAgY3JlYXRlVmFyICdiJywgJzEwJywgXCIje3Byb2plY3RQYXRofS9iLnN0eWxcIlxuICAgICAgICAgIGNyZWF0ZVZhciAnYicsICcyMCcsIFwiI3twcm9qZWN0UGF0aH0yL2Iuc3R5bFwiXG4gICAgICAgIF1cblxuICAgICAgICBjb2xvclZhcmlhYmxlcyA9IHZhcmlhYmxlcy5maWx0ZXIgKHYpIC0+IHYuaXNDb2xvclxuXG4gICAgICAgIGNvbnRleHQgPSBuZXcgQ29sb3JDb250ZXh0KHtcbiAgICAgICAgICByZWdpc3RyeVxuICAgICAgICAgIHZhcmlhYmxlc1xuICAgICAgICAgIGNvbG9yVmFyaWFibGVzXG4gICAgICAgICAgcmVmZXJlbmNlVmFyaWFibGVcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aCwgXCIje3Byb2plY3RQYXRofTJcIl1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0ludCgxMClcblxuICBkZXNjcmliZSAnd2l0aCBhIHJlZmVyZW5jZSBwYXRoJywgLT5cbiAgICBbcHJvamVjdFBhdGgsIHJlZmVyZW5jZVZhcmlhYmxlXSA9IFtdXG4gICAgY3JlYXRlVmFyID0gKG5hbWUsIHZhbHVlLCBwYXRoKSAtPlxuICAgICAgcGF0aCA/PSBcIiN7cHJvamVjdFBhdGh9L2ZpbGUuc3R5bFwiXG4gICAgICB7dmFsdWUsIG5hbWUsIHBhdGh9XG5cbiAgICBjcmVhdGVDb2xvclZhciA9IChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgIHYgPSBjcmVhdGVWYXIobmFtZSwgdmFsdWUpXG4gICAgICB2LmlzQ29sb3IgPSB0cnVlXG4gICAgICB2XG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGVyZSBpcyBhIHNpbmdsZSByb290IHBhdGgnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIHJlZmVyZW5jZVZhcmlhYmxlID0gY3JlYXRlVmFyICdhJywgJzEwJywgXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuXG4gICAgICAgIHZhcmlhYmxlcyA9IFtcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIGNyZWF0ZVZhciAnYScsICcyMCcsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgXVxuXG4gICAgICAgIGNvbG9yVmFyaWFibGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5pc0NvbG9yXG5cbiAgICAgICAgY29udGV4dCA9IG5ldyBDb2xvckNvbnRleHQoe1xuICAgICAgICAgIHJlZ2lzdHJ5XG4gICAgICAgICAgdmFyaWFibGVzXG4gICAgICAgICAgY29sb3JWYXJpYWJsZXNcbiAgICAgICAgICByZWZlcmVuY2VQYXRoOiBcIiN7cHJvamVjdFBhdGh9L2Euc3R5bFwiXG4gICAgICAgICAgcm9vdFBhdGhzOiBbcHJvamVjdFBhdGhdXG4gICAgICAgIH0pXG5cbiAgICAgIGl0UGFyc2VzKCdhJykuYXNJbnQoMTApXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGVyZSBhcmUgbWFueSByb290IHBhdGhzJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgICByZWZlcmVuY2VWYXJpYWJsZSA9IGNyZWF0ZVZhciAnYScsICdiJywgXCIje3Byb2plY3RQYXRofS9hLnN0eWxcIlxuXG4gICAgICAgIHZhcmlhYmxlcyA9IFtcbiAgICAgICAgICByZWZlcmVuY2VWYXJpYWJsZVxuICAgICAgICAgIGNyZWF0ZVZhciAnYicsICcxMCcsIFwiI3twcm9qZWN0UGF0aH0vYi5zdHlsXCJcbiAgICAgICAgICBjcmVhdGVWYXIgJ2InLCAnMjAnLCBcIiN7cHJvamVjdFBhdGh9Mi9iLnN0eWxcIlxuICAgICAgICBdXG5cbiAgICAgICAgY29sb3JWYXJpYWJsZXMgPSB2YXJpYWJsZXMuZmlsdGVyICh2KSAtPiB2LmlzQ29sb3JcblxuICAgICAgICBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7XG4gICAgICAgICAgcmVnaXN0cnlcbiAgICAgICAgICB2YXJpYWJsZXNcbiAgICAgICAgICBjb2xvclZhcmlhYmxlc1xuICAgICAgICAgIHJlZmVyZW5jZVBhdGg6IFwiI3twcm9qZWN0UGF0aH0vYS5zdHlsXCJcbiAgICAgICAgICByb290UGF0aHM6IFtwcm9qZWN0UGF0aCwgXCIje3Byb2plY3RQYXRofTJcIl1cbiAgICAgICAgfSlcblxuICAgICAgaXRQYXJzZXMoJ2EnKS5hc0ludCgxMClcbiJdfQ==

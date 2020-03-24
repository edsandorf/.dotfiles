(function() {
  var VariablesCollection;

  VariablesCollection = require('../lib/variables-collection');

  describe('VariablesCollection', function() {
    var changeSpy, collection, createVar, ref;
    ref = [], collection = ref[0], changeSpy = ref[1];
    createVar = function(name, value, range, path, line) {
      return {
        name: name,
        value: value,
        range: range,
        path: path,
        line: line
      };
    };
    return describe('with an empty collection', function() {
      beforeEach(function() {
        collection = new VariablesCollection;
        changeSpy = jasmine.createSpy('did-change');
        return collection.onDidChange(changeSpy);
      });
      describe('::addMany', function() {
        beforeEach(function() {
          return collection.addMany([createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1), createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2), createVar('baz', 'foo', [22, 30], '/path/to/foo.styl', 3), createVar('bat', 'bar', [32, 40], '/path/to/foo.styl', 4), createVar('bab', 'bat', [42, 50], '/path/to/foo.styl', 5)]);
        });
        it('stores them in the collection', function() {
          return expect(collection.length).toEqual(5);
        });
        it('detects that two of the variables are color variables', function() {
          return expect(collection.getColorVariables().length).toEqual(2);
        });
        it('dispatches a change event', function() {
          var arg;
          expect(changeSpy).toHaveBeenCalled();
          arg = changeSpy.mostRecentCall.args[0];
          expect(arg.created.length).toEqual(5);
          expect(arg.destroyed).toBeUndefined();
          return expect(arg.updated).toBeUndefined();
        });
        it('stores the names of the variables', function() {
          return expect(collection.variableNames.sort()).toEqual(['foo', 'bar', 'baz', 'bat', 'bab'].sort());
        });
        it('builds a dependencies map', function() {
          return expect(collection.dependencyGraph).toEqual({
            foo: ['baz'],
            bar: ['bat'],
            bat: ['bab']
          });
        });
        describe('appending an already existing variable', function() {
          beforeEach(function() {
            return collection.addMany([createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1)]);
          });
          it('leaves the collection untouched', function() {
            expect(collection.length).toEqual(5);
            return expect(collection.getColorVariables().length).toEqual(2);
          });
          return it('does not trigger an update event', function() {
            return expect(changeSpy.callCount).toEqual(1);
          });
        });
        return describe('appending an already existing variable with a different value', function() {
          describe('that has a different range', function() {
            beforeEach(function() {
              return collection.addMany([createVar('foo', '#aabbcc', [0, 14], '/path/to/foo.styl', 1)]);
            });
            it('leaves the collection untouched', function() {
              expect(collection.length).toEqual(5);
              return expect(collection.getColorVariables().length).toEqual(2);
            });
            it('updates the existing variable value', function() {
              var variable;
              variable = collection.find({
                name: 'foo',
                path: '/path/to/foo.styl'
              });
              expect(variable.value).toEqual('#aabbcc');
              expect(variable.isColor).toBeTruthy();
              return expect(variable.color).toBeColor('#aabbcc');
            });
            return it('emits a change event', function() {
              var arg;
              expect(changeSpy.callCount).toEqual(2);
              arg = changeSpy.mostRecentCall.args[0];
              expect(arg.created).toBeUndefined();
              expect(arg.destroyed).toBeUndefined();
              return expect(arg.updated.length).toEqual(2);
            });
          });
          describe('that has a different range and a different line', function() {
            beforeEach(function() {
              return collection.addMany([createVar('foo', '#abc', [52, 64], '/path/to/foo.styl', 6)]);
            });
            it('appends the new variables', function() {
              expect(collection.length).toEqual(6);
              return expect(collection.getColorVariables().length).toEqual(3);
            });
            it('stores the two variables', function() {
              var variables;
              variables = collection.findAll({
                name: 'foo',
                path: '/path/to/foo.styl'
              });
              return expect(variables.length).toEqual(2);
            });
            return it('emits a change event', function() {
              var arg;
              expect(changeSpy.callCount).toEqual(2);
              arg = changeSpy.mostRecentCall.args[0];
              expect(arg.created.length).toEqual(1);
              expect(arg.destroyed).toBeUndefined();
              return expect(arg.updated.length).toEqual(1);
            });
          });
          describe('that is still a color', function() {
            beforeEach(function() {
              return collection.addMany([createVar('foo', '#abc', [0, 10], '/path/to/foo.styl', 1)]);
            });
            it('leaves the collection untouched', function() {
              expect(collection.length).toEqual(5);
              return expect(collection.getColorVariables().length).toEqual(2);
            });
            it('updates the existing variable value', function() {
              var variable;
              variable = collection.find({
                name: 'foo',
                path: '/path/to/foo.styl'
              });
              expect(variable.value).toEqual('#abc');
              expect(variable.isColor).toBeTruthy();
              return expect(variable.color).toBeColor('#abc');
            });
            return it('emits a change event', function() {
              var arg;
              expect(changeSpy.callCount).toEqual(2);
              arg = changeSpy.mostRecentCall.args[0];
              expect(arg.created).toBeUndefined();
              expect(arg.destroyed).toBeUndefined();
              return expect(arg.updated.length).toEqual(2);
            });
          });
          describe('that is no longer a color', function() {
            beforeEach(function() {
              return collection.addMany([createVar('foo', '20px', [0, 10], '/path/to/foo.styl', 1)]);
            });
            it('leaves the collection variables untouched', function() {
              return expect(collection.length).toEqual(5);
            });
            it('affects the colors variables within the collection', function() {
              return expect(collection.getColorVariables().length).toEqual(0);
            });
            it('updates the existing variable value', function() {
              var variable;
              variable = collection.find({
                name: 'foo',
                path: '/path/to/foo.styl'
              });
              expect(variable.value).toEqual('20px');
              return expect(variable.isColor).toBeFalsy();
            });
            it('updates the variables depending on the changed variable', function() {
              var variable;
              variable = collection.find({
                name: 'baz',
                path: '/path/to/foo.styl'
              });
              return expect(variable.isColor).toBeFalsy();
            });
            return it('emits a change event', function() {
              var arg;
              arg = changeSpy.mostRecentCall.args[0];
              expect(changeSpy.callCount).toEqual(2);
              expect(arg.created).toBeUndefined();
              expect(arg.destroyed).toBeUndefined();
              return expect(arg.updated.length).toEqual(2);
            });
          });
          describe('that breaks a dependency', function() {
            beforeEach(function() {
              return collection.addMany([createVar('baz', '#abc', [22, 30], '/path/to/foo.styl', 3)]);
            });
            it('leaves the collection untouched', function() {
              expect(collection.length).toEqual(5);
              return expect(collection.getColorVariables().length).toEqual(2);
            });
            it('updates the existing variable value', function() {
              var variable;
              variable = collection.find({
                name: 'baz',
                path: '/path/to/foo.styl'
              });
              expect(variable.value).toEqual('#abc');
              expect(variable.isColor).toBeTruthy();
              return expect(variable.color).toBeColor('#abc');
            });
            return it('updates the dependencies graph', function() {
              return expect(collection.dependencyGraph).toEqual({
                bar: ['bat'],
                bat: ['bab']
              });
            });
          });
          return describe('that adds a dependency', function() {
            beforeEach(function() {
              return collection.addMany([createVar('baz', 'transparentize(foo, bar)', [22, 30], '/path/to/foo.styl', 3)]);
            });
            it('leaves the collection untouched', function() {
              expect(collection.length).toEqual(5);
              return expect(collection.getColorVariables().length).toEqual(2);
            });
            it('updates the existing variable value', function() {
              var variable;
              variable = collection.find({
                name: 'baz',
                path: '/path/to/foo.styl'
              });
              expect(variable.value).toEqual('transparentize(foo, bar)');
              expect(variable.isColor).toBeTruthy();
              return expect(variable.color).toBeColor(255, 255, 255, 0.5);
            });
            return it('updates the dependencies graph', function() {
              return expect(collection.dependencyGraph).toEqual({
                foo: ['baz'],
                bar: ['bat', 'baz'],
                bat: ['bab']
              });
            });
          });
        });
      });
      describe('::removeMany', function() {
        beforeEach(function() {
          return collection.addMany([createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1), createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2), createVar('baz', 'foo', [22, 30], '/path/to/foo.styl', 3), createVar('bat', 'bar', [32, 40], '/path/to/foo.styl', 4), createVar('bab', 'bat', [42, 50], '/path/to/foo.styl', 5)]);
        });
        describe('with variables that were not colors', function() {
          beforeEach(function() {
            return collection.removeMany([createVar('bat', 'bar', [32, 40], '/path/to/foo.styl', 4), createVar('bab', 'bat', [42, 50], '/path/to/foo.styl', 5)]);
          });
          it('removes the variables from the collection', function() {
            return expect(collection.length).toEqual(3);
          });
          it('dispatches a change event', function() {
            var arg;
            expect(changeSpy).toHaveBeenCalled();
            arg = changeSpy.mostRecentCall.args[0];
            expect(arg.created).toBeUndefined();
            expect(arg.destroyed.length).toEqual(2);
            return expect(arg.updated).toBeUndefined();
          });
          it('stores the names of the variables', function() {
            return expect(collection.variableNames.sort()).toEqual(['foo', 'bar', 'baz'].sort());
          });
          it('updates the variables per path map', function() {
            return expect(collection.variablesByPath['/path/to/foo.styl'].length).toEqual(3);
          });
          return it('updates the dependencies map', function() {
            return expect(collection.dependencyGraph).toEqual({
              foo: ['baz']
            });
          });
        });
        return describe('with variables that were referenced by a color variable', function() {
          beforeEach(function() {
            return collection.removeMany([createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1)]);
          });
          it('removes the variables from the collection', function() {
            expect(collection.length).toEqual(4);
            return expect(collection.getColorVariables().length).toEqual(0);
          });
          it('dispatches a change event', function() {
            var arg;
            expect(changeSpy).toHaveBeenCalled();
            arg = changeSpy.mostRecentCall.args[0];
            expect(arg.created).toBeUndefined();
            expect(arg.destroyed.length).toEqual(1);
            return expect(arg.updated.length).toEqual(1);
          });
          it('stores the names of the variables', function() {
            return expect(collection.variableNames.sort()).toEqual(['bar', 'baz', 'bat', 'bab'].sort());
          });
          it('updates the variables per path map', function() {
            return expect(collection.variablesByPath['/path/to/foo.styl'].length).toEqual(4);
          });
          return it('updates the dependencies map', function() {
            return expect(collection.dependencyGraph).toEqual({
              bar: ['bat'],
              bat: ['bab']
            });
          });
        });
      });
      describe('::updatePathCollection', function() {
        beforeEach(function() {
          return collection.addMany([createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1), createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2), createVar('baz', 'foo', [22, 30], '/path/to/foo.styl', 3), createVar('bat', 'bar', [32, 40], '/path/to/foo.styl', 4), createVar('bab', 'bat', [42, 50], '/path/to/foo.styl', 5)]);
        });
        describe('when a new variable is added', function() {
          beforeEach(function() {
            return collection.updatePathCollection('/path/to/foo.styl', [createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1), createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2), createVar('baz', 'foo', [22, 30], '/path/to/foo.styl', 3), createVar('bat', 'bar', [32, 40], '/path/to/foo.styl', 4), createVar('bab', 'bat', [42, 50], '/path/to/foo.styl', 5), createVar('baa', '#f00', [52, 60], '/path/to/foo.styl', 6)]);
          });
          return it('detects the addition and leave the rest of the collection unchanged', function() {
            expect(collection.length).toEqual(6);
            expect(collection.getColorVariables().length).toEqual(3);
            expect(changeSpy.mostRecentCall.args[0].created.length).toEqual(1);
            expect(changeSpy.mostRecentCall.args[0].destroyed).toBeUndefined();
            return expect(changeSpy.mostRecentCall.args[0].updated).toBeUndefined();
          });
        });
        describe('when a variable is removed', function() {
          beforeEach(function() {
            return collection.updatePathCollection('/path/to/foo.styl', [createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1), createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2), createVar('baz', 'foo', [22, 30], '/path/to/foo.styl', 3), createVar('bat', 'bar', [32, 40], '/path/to/foo.styl', 4)]);
          });
          return it('removes the variable that is not present in the new array', function() {
            expect(collection.length).toEqual(4);
            expect(collection.getColorVariables().length).toEqual(2);
            expect(changeSpy.mostRecentCall.args[0].destroyed.length).toEqual(1);
            expect(changeSpy.mostRecentCall.args[0].created).toBeUndefined();
            return expect(changeSpy.mostRecentCall.args[0].updated).toBeUndefined();
          });
        });
        return describe('when a new variable is changed', function() {
          beforeEach(function() {
            return collection.updatePathCollection('/path/to/foo.styl', [createVar('foo', '#fff', [0, 10], '/path/to/foo.styl', 1), createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2), createVar('baz', 'foo', [22, 30], '/path/to/foo.styl', 3), createVar('bat', '#abc', [32, 40], '/path/to/foo.styl', 4), createVar('bab', 'bat', [42, 50], '/path/to/foo.styl', 5)]);
          });
          return it('detects the update', function() {
            expect(collection.length).toEqual(5);
            expect(collection.getColorVariables().length).toEqual(4);
            expect(changeSpy.mostRecentCall.args[0].updated.length).toEqual(2);
            expect(changeSpy.mostRecentCall.args[0].destroyed).toBeUndefined();
            return expect(changeSpy.mostRecentCall.args[0].created).toBeUndefined();
          });
        });
      });
      describe('::serialize', function() {
        describe('with an empty collection', function() {
          return it('returns an empty serialized collection', function() {
            return expect(collection.serialize()).toEqual({
              deserializer: 'VariablesCollection',
              content: []
            });
          });
        });
        describe('with a collection that contains a non-color variable', function() {
          beforeEach(function() {
            return collection.add(createVar('bar', '0.5', [12, 20], '/path/to/foo.styl', 2));
          });
          return it('returns the serialized collection', function() {
            return expect(collection.serialize()).toEqual({
              deserializer: 'VariablesCollection',
              content: [
                {
                  name: 'bar',
                  value: '0.5',
                  range: [12, 20],
                  path: '/path/to/foo.styl',
                  line: 2
                }
              ]
            });
          });
        });
        describe('with a collection that contains a color variable', function() {
          beforeEach(function() {
            return collection.add(createVar('bar', '#abc', [12, 20], '/path/to/foo.styl', 2));
          });
          return it('returns the serialized collection', function() {
            return expect(collection.serialize()).toEqual({
              deserializer: 'VariablesCollection',
              content: [
                {
                  name: 'bar',
                  value: '#abc',
                  range: [12, 20],
                  path: '/path/to/foo.styl',
                  line: 2,
                  isColor: true,
                  color: [170, 187, 204, 1],
                  variables: []
                }
              ]
            });
          });
        });
        return describe('with a collection that contains color variables with references', function() {
          beforeEach(function() {
            collection.add(createVar('foo', '#abc', [0, 10], '/path/to/foo.styl', 1));
            return collection.add(createVar('bar', 'foo', [12, 20], '/path/to/foo.styl', 2));
          });
          return it('returns the serialized collection', function() {
            return expect(collection.serialize()).toEqual({
              deserializer: 'VariablesCollection',
              content: [
                {
                  name: 'foo',
                  value: '#abc',
                  range: [0, 10],
                  path: '/path/to/foo.styl',
                  line: 1,
                  isColor: true,
                  color: [170, 187, 204, 1],
                  variables: []
                }, {
                  name: 'bar',
                  value: 'foo',
                  range: [12, 20],
                  path: '/path/to/foo.styl',
                  line: 2,
                  isColor: true,
                  color: [170, 187, 204, 1],
                  variables: ['foo']
                }
              ]
            });
          });
        });
      });
      return describe('.deserialize', function() {
        beforeEach(function() {
          return collection = atom.deserializers.deserialize({
            deserializer: 'VariablesCollection',
            content: [
              {
                name: 'foo',
                value: '#abc',
                range: [0, 10],
                path: '/path/to/foo.styl',
                line: 1,
                isColor: true,
                color: [170, 187, 204, 1],
                variables: []
              }, {
                name: 'bar',
                value: 'foo',
                range: [12, 20],
                path: '/path/to/foo.styl',
                line: 2,
                isColor: true,
                color: [170, 187, 204, 1],
                variables: ['foo']
              }, {
                name: 'baz',
                value: '0.5',
                range: [22, 30],
                path: '/path/to/foo.styl',
                line: 3
              }
            ]
          });
        });
        it('restores the variables', function() {
          expect(collection.length).toEqual(3);
          return expect(collection.getColorVariables().length).toEqual(2);
        });
        return it('restores all the denormalized data in the collection', function() {
          expect(collection.variableNames).toEqual(['foo', 'bar', 'baz']);
          expect(Object.keys(collection.variablesByPath)).toEqual(['/path/to/foo.styl']);
          expect(collection.variablesByPath['/path/to/foo.styl'].length).toEqual(3);
          return expect(collection.dependencyGraph).toEqual({
            foo: ['bar']
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvdmFyaWFibGVzLWNvbGxlY3Rpb24tc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSw2QkFBUjs7RUFFdEIsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7QUFDOUIsUUFBQTtJQUFBLE1BQTBCLEVBQTFCLEVBQUMsbUJBQUQsRUFBYTtJQUViLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsS0FBZCxFQUFxQixJQUFyQixFQUEyQixJQUEzQjthQUNWO1FBQUMsTUFBQSxJQUFEO1FBQU8sT0FBQSxLQUFQO1FBQWMsT0FBQSxLQUFkO1FBQXFCLE1BQUEsSUFBckI7UUFBMkIsTUFBQSxJQUEzQjs7SUFEVTtXQUdaLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBO01BQ25DLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsVUFBQSxHQUFhLElBQUk7UUFDakIsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFlBQWxCO2VBQ1osVUFBVSxDQUFDLFdBQVgsQ0FBdUIsU0FBdkI7TUFIUyxDQUFYO01BYUEsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtRQUNwQixVQUFBLENBQVcsU0FBQTtpQkFDVCxVQUFVLENBQUMsT0FBWCxDQUFtQixDQUNqQixTQUFBLENBQVUsS0FBVixFQUFpQixNQUFqQixFQUF5QixDQUFDLENBQUQsRUFBRyxFQUFILENBQXpCLEVBQWlDLG1CQUFqQyxFQUFzRCxDQUF0RCxDQURpQixFQUVqQixTQUFBLENBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QixDQUFDLEVBQUQsRUFBSSxFQUFKLENBQXhCLEVBQWlDLG1CQUFqQyxFQUFzRCxDQUF0RCxDQUZpQixFQUdqQixTQUFBLENBQVUsS0FBVixFQUFpQixLQUFq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QUMsTUFBdEMsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFzRCxDQUF0RDtRQUYyQixDQUE3QjtlQUlBLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxTQUFBO1VBQ3pELE1BQUEsQ0FBTyxVQUFVLENBQUMsYUFBbEIsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUF5QyxDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixDQUF6QztVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLFVBQVUsQ0FBQyxlQUF2QixDQUFQLENBQThDLENBQUMsT0FBL0MsQ0FBdUQsQ0FBQyxtQkFBRCxDQUF2RDtVQUNBLE1BQUEsQ0FBTyxVQUFVLENBQUMsZUFBZ0IsQ0FBQSxtQkFBQSxDQUFvQixDQUFDLE1BQXZELENBQThELENBQUMsT0FBL0QsQ0FBdUUsQ0FBdkU7aUJBQ0EsTUFBQSxDQUFPLFVBQVUsQ0FBQyxlQUFsQixDQUFrQyxDQUFDLE9BQW5DLENBQTJDO1lBQ3pDLEdBQUEsRUFBSyxDQUFDLEtBQUQsQ0FEb0M7V0FBM0M7UUFKeUQsQ0FBM0Q7TUF2Q3VCLENBQXpCO0lBN2NtQyxDQUFyQztFQU44QixDQUFoQztBQUZBIiwic291cmNlc0NvbnRlbnQiOlsiVmFyaWFibGVzQ29sbGVjdGlvbiA9IHJlcXVpcmUgJy4uL2xpYi92YXJpYWJsZXMtY29sbGVjdGlvbidcblxuZGVzY3JpYmUgJ1ZhcmlhYmxlc0NvbGxlY3Rpb24nLCAtPlxuICBbY29sbGVjdGlvbiwgY2hhbmdlU3B5XSA9IFtdXG5cbiAgY3JlYXRlVmFyID0gKG5hbWUsIHZhbHVlLCByYW5nZSwgcGF0aCwgbGluZSkgLT5cbiAgICB7bmFtZSwgdmFsdWUsIHJhbmdlLCBwYXRoLCBsaW5lfVxuXG4gIGRlc2NyaWJlICd3aXRoIGFuIGVtcHR5IGNvbGxlY3Rpb24nLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbGxlY3Rpb24gPSBuZXcgVmFyaWFibGVzQ29sbGVjdGlvblxuICAgICAgY2hhbmdlU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC1jaGFuZ2UnKVxuICAgICAgY29sbGVjdGlvbi5vbkRpZENoYW5nZShjaGFuZ2VTcHkpXG5cbiAgICAjIyAgICAgICAjIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjXG4gICAgIyMgICAgICAjIyAjIyAgICMjICAgICAjIyAjIyAgICAgIyNcbiAgICAjIyAgICAgIyMgICAjIyAgIyMgICAgICMjICMjICAgICAjI1xuICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICMjXG4gICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAjIyAjIyAgICAgIyNcbiAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjI1xuICAgICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjIyNcblxuICAgIGRlc2NyaWJlICc6OmFkZE1hbnknLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgIGNyZWF0ZVZhciAnZm9vJywgJyNmZmYnLCBbMCwxMF0sICcvcGF0aC90by9mb28uc3R5bCcsIDFcbiAgICAgICAgICBjcmVhdGVWYXIgJ2JhcicsICcwLjUnLCBbMTIsMjBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAyXG4gICAgICAgICAgY3JlYXRlVmFyICdiYXonLCAnZm9vJywgWzIyLDMwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgM1xuICAgICAgICAgIGNyZWF0ZVZhciAnYmF0JywgJ2JhcicsIFszMiw0MF0sICcvcGF0aC90by9mb28uc3R5bCcsIDRcbiAgICAgICAgICBjcmVhdGVWYXIgJ2JhYicsICdiYXQnLCBbNDIsNTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCA1XG4gICAgICAgIF0pXG5cbiAgICAgIGl0ICdzdG9yZXMgdGhlbSBpbiB0aGUgY29sbGVjdGlvbicsIC0+XG4gICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmxlbmd0aCkudG9FcXVhbCg1KVxuXG4gICAgICBpdCAnZGV0ZWN0cyB0aGF0IHR3byBvZiB0aGUgdmFyaWFibGVzIGFyZSBjb2xvciB2YXJpYWJsZXMnLCAtPlxuICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICBpdCAnZGlzcGF0Y2hlcyBhIGNoYW5nZSBldmVudCcsIC0+XG4gICAgICAgIGV4cGVjdChjaGFuZ2VTcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICAgIGFyZyA9IGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgICAgIGV4cGVjdChhcmcuY3JlYXRlZC5sZW5ndGgpLnRvRXF1YWwoNSlcbiAgICAgICAgZXhwZWN0KGFyZy5kZXN0cm95ZWQpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICBleHBlY3QoYXJnLnVwZGF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgICBpdCAnc3RvcmVzIHRoZSBuYW1lcyBvZiB0aGUgdmFyaWFibGVzJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24udmFyaWFibGVOYW1lcy5zb3J0KCkpLnRvRXF1YWwoWydmb28nLCdiYXInLCdiYXonLCdiYXQnLCdiYWInXS5zb3J0KCkpXG5cbiAgICAgIGl0ICdidWlsZHMgYSBkZXBlbmRlbmNpZXMgbWFwJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZGVwZW5kZW5jeUdyYXBoKS50b0VxdWFsKHtcbiAgICAgICAgICBmb286IFsnYmF6J11cbiAgICAgICAgICBiYXI6IFsnYmF0J11cbiAgICAgICAgICBiYXQ6IFsnYmFiJ11cbiAgICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUgJ2FwcGVuZGluZyBhbiBhbHJlYWR5IGV4aXN0aW5nIHZhcmlhYmxlJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGNvbGxlY3Rpb24uYWRkTWFueShbXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2ZvbycsICcjZmZmJywgWzAsMTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAxXG4gICAgICAgICAgXSlcblxuICAgICAgICBpdCAnbGVhdmVzIHRoZSBjb2xsZWN0aW9uIHVudG91Y2hlZCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDUpXG4gICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgICBpdCAnZG9lcyBub3QgdHJpZ2dlciBhbiB1cGRhdGUgZXZlbnQnLCAtPlxuICAgICAgICAgIGV4cGVjdChjaGFuZ2VTcHkuY2FsbENvdW50KS50b0VxdWFsKDEpXG5cbiAgICAgIGRlc2NyaWJlICdhcHBlbmRpbmcgYW4gYWxyZWFkeSBleGlzdGluZyB2YXJpYWJsZSB3aXRoIGEgZGlmZmVyZW50IHZhbHVlJywgLT5cbiAgICAgICAgZGVzY3JpYmUgJ3RoYXQgaGFzIGEgZGlmZmVyZW50IHJhbmdlJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgICAgICBjcmVhdGVWYXIgJ2ZvbycsICcjYWFiYmNjJywgWzAsMTRdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAxXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgaXQgJ2xlYXZlcyB0aGUgY29sbGVjdGlvbiB1bnRvdWNoZWQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDUpXG4gICAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGV4aXN0aW5nIHZhcmlhYmxlIHZhbHVlJywgLT5cbiAgICAgICAgICAgIHZhcmlhYmxlID0gY29sbGVjdGlvbi5maW5kKHtcbiAgICAgICAgICAgICAgbmFtZTogJ2ZvbydcbiAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZS52YWx1ZSkudG9FcXVhbCgnI2FhYmJjYycpXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUuaXNDb2xvcikudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUuY29sb3IpLnRvQmVDb2xvcignI2FhYmJjYycpXG5cbiAgICAgICAgICBpdCAnZW1pdHMgYSBjaGFuZ2UgZXZlbnQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsQ291bnQpLnRvRXF1YWwoMilcblxuICAgICAgICAgICAgYXJnID0gY2hhbmdlU3B5Lm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICAgICAgICAgIGV4cGVjdChhcmcuY3JlYXRlZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgICBleHBlY3QoYXJnLmRlc3Ryb3llZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgICBleHBlY3QoYXJnLnVwZGF0ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgICAgZGVzY3JpYmUgJ3RoYXQgaGFzIGEgZGlmZmVyZW50IHJhbmdlIGFuZCBhIGRpZmZlcmVudCBsaW5lJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgICAgICBjcmVhdGVWYXIgJ2ZvbycsICcjYWJjJywgWzUyLDY0XSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgNlxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgIGl0ICdhcHBlbmRzIHRoZSBuZXcgdmFyaWFibGVzJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgICAgICAgIGl0ICdzdG9yZXMgdGhlIHR3byB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgICAgdmFyaWFibGVzID0gY29sbGVjdGlvbi5maW5kQWxsKHtcbiAgICAgICAgICAgICAgbmFtZTogJ2ZvbydcbiAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZXMubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgICAgICBpdCAnZW1pdHMgYSBjaGFuZ2UgZXZlbnQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsQ291bnQpLnRvRXF1YWwoMilcblxuICAgICAgICAgICAgYXJnID0gY2hhbmdlU3B5Lm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICAgICAgICAgIGV4cGVjdChhcmcuY3JlYXRlZC5sZW5ndGgpLnRvRXF1YWwoMSlcbiAgICAgICAgICAgIGV4cGVjdChhcmcuZGVzdHJveWVkKS50b0JlVW5kZWZpbmVkKClcbiAgICAgICAgICAgIGV4cGVjdChhcmcudXBkYXRlZC5sZW5ndGgpLnRvRXF1YWwoMSlcblxuICAgICAgICBkZXNjcmliZSAndGhhdCBpcyBzdGlsbCBhIGNvbG9yJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgICAgICBjcmVhdGVWYXIgJ2ZvbycsICcjYWJjJywgWzAsMTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAxXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgaXQgJ2xlYXZlcyB0aGUgY29sbGVjdGlvbiB1bnRvdWNoZWQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDUpXG4gICAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGV4aXN0aW5nIHZhcmlhYmxlIHZhbHVlJywgLT5cbiAgICAgICAgICAgIHZhcmlhYmxlID0gY29sbGVjdGlvbi5maW5kKHtcbiAgICAgICAgICAgICAgbmFtZTogJ2ZvbydcbiAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZS52YWx1ZSkudG9FcXVhbCgnI2FiYycpXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUuaXNDb2xvcikudG9CZVRydXRoeSgpXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUuY29sb3IpLnRvQmVDb2xvcignI2FiYycpXG5cbiAgICAgICAgICBpdCAnZW1pdHMgYSBjaGFuZ2UgZXZlbnQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsQ291bnQpLnRvRXF1YWwoMilcblxuICAgICAgICAgICAgYXJnID0gY2hhbmdlU3B5Lm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICAgICAgICAgIGV4cGVjdChhcmcuY3JlYXRlZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgICBleHBlY3QoYXJnLmRlc3Ryb3llZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgICBleHBlY3QoYXJnLnVwZGF0ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgICAgZGVzY3JpYmUgJ3RoYXQgaXMgbm8gbG9uZ2VyIGEgY29sb3InLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24uYWRkTWFueShbXG4gICAgICAgICAgICAgIGNyZWF0ZVZhciAnZm9vJywgJzIwcHgnLCBbMCwxMF0sICcvcGF0aC90by9mb28uc3R5bCcsIDFcbiAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICBpdCAnbGVhdmVzIHRoZSBjb2xsZWN0aW9uIHZhcmlhYmxlcyB1bnRvdWNoZWQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDUpXG5cbiAgICAgICAgICBpdCAnYWZmZWN0cyB0aGUgY29sb3JzIHZhcmlhYmxlcyB3aXRoaW4gdGhlIGNvbGxlY3Rpb24nLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgICAgIGl0ICd1cGRhdGVzIHRoZSBleGlzdGluZyB2YXJpYWJsZSB2YWx1ZScsIC0+XG4gICAgICAgICAgICB2YXJpYWJsZSA9IGNvbGxlY3Rpb24uZmluZCh7XG4gICAgICAgICAgICAgIG5hbWU6ICdmb28nXG4gICAgICAgICAgICAgIHBhdGg6ICcvcGF0aC90by9mb28uc3R5bCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUudmFsdWUpLnRvRXF1YWwoJzIwcHgnKVxuICAgICAgICAgICAgZXhwZWN0KHZhcmlhYmxlLmlzQ29sb3IpLnRvQmVGYWxzeSgpXG5cbiAgICAgICAgICBpdCAndXBkYXRlcyB0aGUgdmFyaWFibGVzIGRlcGVuZGluZyBvbiB0aGUgY2hhbmdlZCB2YXJpYWJsZScsIC0+XG4gICAgICAgICAgICB2YXJpYWJsZSA9IGNvbGxlY3Rpb24uZmluZCh7XG4gICAgICAgICAgICAgIG5hbWU6ICdiYXonXG4gICAgICAgICAgICAgIHBhdGg6ICcvcGF0aC90by9mb28uc3R5bCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUuaXNDb2xvcikudG9CZUZhbHN5KClcblxuICAgICAgICAgIGl0ICdlbWl0cyBhIGNoYW5nZSBldmVudCcsIC0+XG4gICAgICAgICAgICBhcmcgPSBjaGFuZ2VTcHkubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5jYWxsQ291bnQpLnRvRXF1YWwoMilcblxuICAgICAgICAgICAgZXhwZWN0KGFyZy5jcmVhdGVkKS50b0JlVW5kZWZpbmVkKClcbiAgICAgICAgICAgIGV4cGVjdChhcmcuZGVzdHJveWVkKS50b0JlVW5kZWZpbmVkKClcbiAgICAgICAgICAgIGV4cGVjdChhcmcudXBkYXRlZC5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgICBkZXNjcmliZSAndGhhdCBicmVha3MgYSBkZXBlbmRlbmN5JywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgICAgICBjcmVhdGVWYXIgJ2JheicsICcjYWJjJywgWzIyLDMwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgM1xuICAgICAgICAgICAgXSlcblxuICAgICAgICAgIGl0ICdsZWF2ZXMgdGhlIGNvbGxlY3Rpb24gdW50b3VjaGVkJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmxlbmd0aCkudG9FcXVhbCg1KVxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMilcblxuICAgICAgICAgIGl0ICd1cGRhdGVzIHRoZSBleGlzdGluZyB2YXJpYWJsZSB2YWx1ZScsIC0+XG4gICAgICAgICAgICB2YXJpYWJsZSA9IGNvbGxlY3Rpb24uZmluZCh7XG4gICAgICAgICAgICAgIG5hbWU6ICdiYXonXG4gICAgICAgICAgICAgIHBhdGg6ICcvcGF0aC90by9mb28uc3R5bCdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBleHBlY3QodmFyaWFibGUudmFsdWUpLnRvRXF1YWwoJyNhYmMnKVxuICAgICAgICAgICAgZXhwZWN0KHZhcmlhYmxlLmlzQ29sb3IpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgZXhwZWN0KHZhcmlhYmxlLmNvbG9yKS50b0JlQ29sb3IoJyNhYmMnKVxuXG4gICAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGRlcGVuZGVuY2llcyBncmFwaCcsIC0+XG4gICAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5kZXBlbmRlbmN5R3JhcGgpLnRvRXF1YWwoe1xuICAgICAgICAgICAgICBiYXI6IFsnYmF0J11cbiAgICAgICAgICAgICAgYmF0OiBbJ2JhYiddXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlICd0aGF0IGFkZHMgYSBkZXBlbmRlbmN5JywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgICAgICBjcmVhdGVWYXIgJ2JheicsICd0cmFuc3BhcmVudGl6ZShmb28sIGJhciknLCBbMjIsMzBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAzXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgaXQgJ2xlYXZlcyB0aGUgY29sbGVjdGlvbiB1bnRvdWNoZWQnLCAtPlxuICAgICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDUpXG4gICAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gICAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGV4aXN0aW5nIHZhcmlhYmxlIHZhbHVlJywgLT5cbiAgICAgICAgICAgIHZhcmlhYmxlID0gY29sbGVjdGlvbi5maW5kKHtcbiAgICAgICAgICAgICAgbmFtZTogJ2JheidcbiAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZS52YWx1ZSkudG9FcXVhbCgndHJhbnNwYXJlbnRpemUoZm9vLCBiYXIpJylcbiAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZS5pc0NvbG9yKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIGV4cGVjdCh2YXJpYWJsZS5jb2xvcikudG9CZUNvbG9yKDI1NSwyNTUsMjU1LCAwLjUpXG5cbiAgICAgICAgICBpdCAndXBkYXRlcyB0aGUgZGVwZW5kZW5jaWVzIGdyYXBoJywgLT5cbiAgICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmRlcGVuZGVuY3lHcmFwaCkudG9FcXVhbCh7XG4gICAgICAgICAgICAgIGZvbzogWydiYXonXVxuICAgICAgICAgICAgICBiYXI6IFsnYmF0JywgJ2JheiddXG4gICAgICAgICAgICAgIGJhdDogWydiYWInXVxuICAgICAgICAgICAgfSlcblxuICAgICMjICAgICMjIyMjIyMjICAjIyMjIyMjIyAjIyAgICAgIyMgICMjIyMjIyMgICMjICAgICAjIyAjIyMjIyMjI1xuICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMgICAjIyMgIyMgICAgICMjICMjICAgICAjIyAjI1xuICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyMjICMjIyMgIyMgICAgICMjICMjICAgICAjIyAjI1xuICAgICMjICAgICMjIyMjIyMjICAjIyMjIyMgICAjIyAjIyMgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyNcbiAgICAjIyAgICAjIyAgICMjICAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgIyNcbiAgICAjIyAgICAjIyAgICAjIyAgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgIyNcbiAgICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgIyMgICAgICMjICAjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyNcblxuICAgIGRlc2NyaWJlICc6OnJlbW92ZU1hbnknLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBjb2xsZWN0aW9uLmFkZE1hbnkoW1xuICAgICAgICAgIGNyZWF0ZVZhciAnZm9vJywgJyNmZmYnLCBbMCwxMF0sICcvcGF0aC90by9mb28uc3R5bCcsIDFcbiAgICAgICAgICBjcmVhdGVWYXIgJ2JhcicsICcwLjUnLCBbMTIsMjBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAyXG4gICAgICAgICAgY3JlYXRlVmFyICdiYXonLCAnZm9vJywgWzIyLDMwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgM1xuICAgICAgICAgIGNyZWF0ZVZhciAnYmF0JywgJ2JhcicsIFszMiw0MF0sICcvcGF0aC90by9mb28uc3R5bCcsIDRcbiAgICAgICAgICBjcmVhdGVWYXIgJ2JhYicsICdiYXQnLCBbNDIsNTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCA1XG4gICAgICAgIF0pXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIHZhcmlhYmxlcyB0aGF0IHdlcmUgbm90IGNvbG9ycycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBjb2xsZWN0aW9uLnJlbW92ZU1hbnkoW1xuICAgICAgICAgICAgY3JlYXRlVmFyICdiYXQnLCAnYmFyJywgWzMyLDQwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgNFxuICAgICAgICAgICAgY3JlYXRlVmFyICdiYWInLCAnYmF0JywgWzQyLDUwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgNVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgaXQgJ3JlbW92ZXMgdGhlIHZhcmlhYmxlcyBmcm9tIHRoZSBjb2xsZWN0aW9uJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgICAgICBpdCAnZGlzcGF0Y2hlcyBhIGNoYW5nZSBldmVudCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgICAgICBhcmcgPSBjaGFuZ2VTcHkubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICAgIGV4cGVjdChhcmcuY3JlYXRlZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KGFyZy5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgICAgZXhwZWN0KGFyZy51cGRhdGVkKS50b0JlVW5kZWZpbmVkKClcblxuICAgICAgICBpdCAnc3RvcmVzIHRoZSBuYW1lcyBvZiB0aGUgdmFyaWFibGVzJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi52YXJpYWJsZU5hbWVzLnNvcnQoKSkudG9FcXVhbChbJ2ZvbycsJ2JhcicsJ2JheiddLnNvcnQoKSlcblxuICAgICAgICBpdCAndXBkYXRlcyB0aGUgdmFyaWFibGVzIHBlciBwYXRoIG1hcCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24udmFyaWFibGVzQnlQYXRoWycvcGF0aC90by9mb28uc3R5bCddLmxlbmd0aCkudG9FcXVhbCgzKVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIHRoZSBkZXBlbmRlbmNpZXMgbWFwJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5kZXBlbmRlbmN5R3JhcGgpLnRvRXF1YWwoe1xuICAgICAgICAgICAgZm9vOiBbJ2JheiddXG4gICAgICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggdmFyaWFibGVzIHRoYXQgd2VyZSByZWZlcmVuY2VkIGJ5IGEgY29sb3IgdmFyaWFibGUnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sbGVjdGlvbi5yZW1vdmVNYW55KFtcbiAgICAgICAgICAgIGNyZWF0ZVZhciAnZm9vJywgJyNmZmYnLCBbMCwxMF0sICcvcGF0aC90by9mb28uc3R5bCcsIDFcbiAgICAgICAgICBdKVxuXG4gICAgICAgIGl0ICdyZW1vdmVzIHRoZSB2YXJpYWJsZXMgZnJvbSB0aGUgY29sbGVjdGlvbicsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZ2V0Q29sb3JWYXJpYWJsZXMoKS5sZW5ndGgpLnRvRXF1YWwoMClcblxuICAgICAgICBpdCAnZGlzcGF0Y2hlcyBhIGNoYW5nZSBldmVudCcsIC0+XG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgICAgICBhcmcgPSBjaGFuZ2VTcHkubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICAgIGV4cGVjdChhcmcuY3JlYXRlZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KGFyZy5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KGFyZy51cGRhdGVkLmxlbmd0aCkudG9FcXVhbCgxKVxuXG4gICAgICAgIGl0ICdzdG9yZXMgdGhlIG5hbWVzIG9mIHRoZSB2YXJpYWJsZXMnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLnZhcmlhYmxlTmFtZXMuc29ydCgpKS50b0VxdWFsKFsnYmFyJywnYmF6JywnYmF0JywnYmFiJ10uc29ydCgpKVxuXG4gICAgICAgIGl0ICd1cGRhdGVzIHRoZSB2YXJpYWJsZXMgcGVyIHBhdGggbWFwJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi52YXJpYWJsZXNCeVBhdGhbJy9wYXRoL3RvL2Zvby5zdHlsJ10ubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgaXQgJ3VwZGF0ZXMgdGhlIGRlcGVuZGVuY2llcyBtYXAnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmRlcGVuZGVuY3lHcmFwaCkudG9FcXVhbCh7XG4gICAgICAgICAgICBiYXI6IFsnYmF0J11cbiAgICAgICAgICAgIGJhdDogWydiYWInXVxuICAgICAgICAgIH0pXG5cbiAgICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAjIyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gICAgIyMgICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSAnOjp1cGRhdGVQYXRoQ29sbGVjdGlvbicsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbGxlY3Rpb24uYWRkTWFueShbXG4gICAgICAgICAgY3JlYXRlVmFyICdmb28nLCAnI2ZmZicsIFswLDEwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgMVxuICAgICAgICAgIGNyZWF0ZVZhciAnYmFyJywgJzAuNScsIFsxMiwyMF0sICcvcGF0aC90by9mb28uc3R5bCcsIDJcbiAgICAgICAgICBjcmVhdGVWYXIgJ2JheicsICdmb28nLCBbMjIsMzBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAzXG4gICAgICAgICAgY3JlYXRlVmFyICdiYXQnLCAnYmFyJywgWzMyLDQwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgNFxuICAgICAgICAgIGNyZWF0ZVZhciAnYmFiJywgJ2JhdCcsIFs0Miw1MF0sICcvcGF0aC90by9mb28uc3R5bCcsIDVcbiAgICAgICAgXSlcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gYSBuZXcgdmFyaWFibGUgaXMgYWRkZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sbGVjdGlvbi51cGRhdGVQYXRoQ29sbGVjdGlvbignL3BhdGgvdG8vZm9vLnN0eWwnICxbXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2ZvbycsICcjZmZmJywgWzAsMTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAxXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JhcicsICcwLjUnLCBbMTIsMjBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAyXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JheicsICdmb28nLCBbMjIsMzBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAzXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JhdCcsICdiYXInLCBbMzIsNDBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCA0XG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JhYicsICdiYXQnLCBbNDIsNTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCA1XG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JhYScsICcjZjAwJywgWzUyLDYwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgNlxuICAgICAgICAgIF0pXG5cbiAgICAgICAgaXQgJ2RldGVjdHMgdGhlIGFkZGl0aW9uIGFuZCBsZWF2ZSB0aGUgcmVzdCBvZiB0aGUgY29sbGVjdGlvbiB1bmNoYW5nZWQnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmxlbmd0aCkudG9FcXVhbCg2KVxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDMpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLmNyZWF0ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLmRlc3Ryb3llZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLnVwZGF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIHZhcmlhYmxlIGlzIHJlbW92ZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sbGVjdGlvbi51cGRhdGVQYXRoQ29sbGVjdGlvbignL3BhdGgvdG8vZm9vLnN0eWwnICxbXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2ZvbycsICcjZmZmJywgWzAsMTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAxXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JhcicsICcwLjUnLCBbMTIsMjBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAyXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JheicsICdmb28nLCBbMjIsMzBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAzXG4gICAgICAgICAgICBjcmVhdGVWYXIgJ2JhdCcsICdiYXInLCBbMzIsNDBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCA0XG4gICAgICAgICAgXSlcblxuICAgICAgICBpdCAncmVtb3ZlcyB0aGUgdmFyaWFibGUgdGhhdCBpcyBub3QgcHJlc2VudCBpbiB0aGUgbmV3IGFycmF5JywgLT5cbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5nZXRDb2xvclZhcmlhYmxlcygpLmxlbmd0aCkudG9FcXVhbCgyKVxuICAgICAgICAgIGV4cGVjdChjaGFuZ2VTcHkubW9zdFJlY2VudENhbGwuYXJnc1swXS5kZXN0cm95ZWQubGVuZ3RoKS50b0VxdWFsKDEpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLmNyZWF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChjaGFuZ2VTcHkubW9zdFJlY2VudENhbGwuYXJnc1swXS51cGRhdGVkKS50b0JlVW5kZWZpbmVkKClcblxuXG4gICAgICBkZXNjcmliZSAnd2hlbiBhIG5ldyB2YXJpYWJsZSBpcyBjaGFuZ2VkJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGNvbGxlY3Rpb24udXBkYXRlUGF0aENvbGxlY3Rpb24oJy9wYXRoL3RvL2Zvby5zdHlsJyAsW1xuICAgICAgICAgICAgY3JlYXRlVmFyICdmb28nLCAnI2ZmZicsIFswLDEwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgMVxuICAgICAgICAgICAgY3JlYXRlVmFyICdiYXInLCAnMC41JywgWzEyLDIwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgMlxuICAgICAgICAgICAgY3JlYXRlVmFyICdiYXonLCAnZm9vJywgWzIyLDMwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgM1xuICAgICAgICAgICAgY3JlYXRlVmFyICdiYXQnLCAnI2FiYycsIFszMiw0MF0sICcvcGF0aC90by9mb28uc3R5bCcsIDRcbiAgICAgICAgICAgIGNyZWF0ZVZhciAnYmFiJywgJ2JhdCcsIFs0Miw1MF0sICcvcGF0aC90by9mb28uc3R5bCcsIDVcbiAgICAgICAgICBdKVxuXG4gICAgICAgIGl0ICdkZXRlY3RzIHRoZSB1cGRhdGUnLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmxlbmd0aCkudG9FcXVhbCg1KVxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLnVwZGF0ZWQubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLmRlc3Ryb3llZCkudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgICAgZXhwZWN0KGNoYW5nZVNweS5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdLmNyZWF0ZWQpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjIyNcbiAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAjI1xuICAgICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjXG4gICAgIyMgICAgIyMjIyMjIyMgICMjIyMjIyAgICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjXG4gICAgIyMgICAgIyMgICAjIyAgICMjICAgICAgICAgICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICMjICAgIyNcbiAgICAjIyAgICAjIyAgICAjIyAgIyMgICAgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICAjI1xuICAgICMjICAgICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMjICAgICAjIyAgICAgIyMjIyMjIyAgIyMgICAgICMjICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSAnOjpzZXJpYWxpemUnLCAtPlxuICAgICAgZGVzY3JpYmUgJ3dpdGggYW4gZW1wdHkgY29sbGVjdGlvbicsIC0+XG4gICAgICAgIGl0ICdyZXR1cm5zIGFuIGVtcHR5IHNlcmlhbGl6ZWQgY29sbGVjdGlvbicsIC0+XG4gICAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uc2VyaWFsaXplKCkpLnRvRXF1YWwoe1xuICAgICAgICAgICAgZGVzZXJpYWxpemVyOiAnVmFyaWFibGVzQ29sbGVjdGlvbidcbiAgICAgICAgICAgIGNvbnRlbnQ6IFtdXG4gICAgICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggYSBjb2xsZWN0aW9uIHRoYXQgY29udGFpbnMgYSBub24tY29sb3IgdmFyaWFibGUnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sbGVjdGlvbi5hZGQgY3JlYXRlVmFyICdiYXInLCAnMC41JywgWzEyLDIwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgMlxuXG4gICAgICAgIGl0ICdyZXR1cm5zIHRoZSBzZXJpYWxpemVkIGNvbGxlY3Rpb24nLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLnNlcmlhbGl6ZSgpKS50b0VxdWFsKHtcbiAgICAgICAgICAgIGRlc2VyaWFsaXplcjogJ1ZhcmlhYmxlc0NvbGxlY3Rpb24nXG4gICAgICAgICAgICBjb250ZW50OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnYmFyJ1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnMC41J1xuICAgICAgICAgICAgICAgIHJhbmdlOiBbMTIsMjBdXG4gICAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgICAgIGxpbmU6IDJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIGEgY29sbGVjdGlvbiB0aGF0IGNvbnRhaW5zIGEgY29sb3IgdmFyaWFibGUnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgY29sbGVjdGlvbi5hZGQgY3JlYXRlVmFyICdiYXInLCAnI2FiYycsIFsxMiwyMF0sICcvcGF0aC90by9mb28uc3R5bCcsIDJcblxuICAgICAgICBpdCAncmV0dXJucyB0aGUgc2VyaWFsaXplZCBjb2xsZWN0aW9uJywgLT5cbiAgICAgICAgICBleHBlY3QoY29sbGVjdGlvbi5zZXJpYWxpemUoKSkudG9FcXVhbCh7XG4gICAgICAgICAgICBkZXNlcmlhbGl6ZXI6ICdWYXJpYWJsZXNDb2xsZWN0aW9uJ1xuICAgICAgICAgICAgY29udGVudDogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2JhcidcbiAgICAgICAgICAgICAgICB2YWx1ZTogJyNhYmMnXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFsxMiwyMF1cbiAgICAgICAgICAgICAgICBwYXRoOiAnL3BhdGgvdG8vZm9vLnN0eWwnXG4gICAgICAgICAgICAgICAgbGluZTogMlxuICAgICAgICAgICAgICAgIGlzQ29sb3I6IHRydWVcbiAgICAgICAgICAgICAgICBjb2xvcjogWzE3MCwgMTg3LCAyMDQsIDFdXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiBbXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggYSBjb2xsZWN0aW9uIHRoYXQgY29udGFpbnMgY29sb3IgdmFyaWFibGVzIHdpdGggcmVmZXJlbmNlcycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBjb2xsZWN0aW9uLmFkZCBjcmVhdGVWYXIgJ2ZvbycsICcjYWJjJywgWzAsMTBdLCAnL3BhdGgvdG8vZm9vLnN0eWwnLCAxXG4gICAgICAgICAgY29sbGVjdGlvbi5hZGQgY3JlYXRlVmFyICdiYXInLCAnZm9vJywgWzEyLDIwXSwgJy9wYXRoL3RvL2Zvby5zdHlsJywgMlxuXG4gICAgICAgIGl0ICdyZXR1cm5zIHRoZSBzZXJpYWxpemVkIGNvbGxlY3Rpb24nLCAtPlxuICAgICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLnNlcmlhbGl6ZSgpKS50b0VxdWFsKHtcbiAgICAgICAgICAgIGRlc2VyaWFsaXplcjogJ1ZhcmlhYmxlc0NvbGxlY3Rpb24nXG4gICAgICAgICAgICBjb250ZW50OiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZm9vJ1xuICAgICAgICAgICAgICAgIHZhbHVlOiAnI2FiYydcbiAgICAgICAgICAgICAgICByYW5nZTogWzAsMTBdXG4gICAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgICAgIGxpbmU6IDFcbiAgICAgICAgICAgICAgICBpc0NvbG9yOiB0cnVlXG4gICAgICAgICAgICAgICAgY29sb3I6IFsxNzAsIDE4NywgMjA0LCAxXVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlczogW11cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdiYXInXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdmb28nXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFsxMiwyMF1cbiAgICAgICAgICAgICAgICBwYXRoOiAnL3BhdGgvdG8vZm9vLnN0eWwnXG4gICAgICAgICAgICAgICAgbGluZTogMlxuICAgICAgICAgICAgICAgIGlzQ29sb3I6IHRydWVcbiAgICAgICAgICAgICAgICBjb2xvcjogWzE3MCwgMTg3LCAyMDQsIDFdXG4gICAgICAgICAgICAgICAgdmFyaWFibGVzOiBbJ2ZvbyddXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9KVxuXG4gICAgZGVzY3JpYmUgJy5kZXNlcmlhbGl6ZScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbGxlY3Rpb24gPSBhdG9tLmRlc2VyaWFsaXplcnMuZGVzZXJpYWxpemUoe1xuICAgICAgICAgIGRlc2VyaWFsaXplcjogJ1ZhcmlhYmxlc0NvbGxlY3Rpb24nXG4gICAgICAgICAgY29udGVudDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiAnZm9vJ1xuICAgICAgICAgICAgICB2YWx1ZTogJyNhYmMnXG4gICAgICAgICAgICAgIHJhbmdlOiBbMCwxMF1cbiAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgICBsaW5lOiAxXG4gICAgICAgICAgICAgIGlzQ29sb3I6IHRydWVcbiAgICAgICAgICAgICAgY29sb3I6IFsxNzAsIDE4NywgMjA0LCAxXVxuICAgICAgICAgICAgICB2YXJpYWJsZXM6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiAnYmFyJ1xuICAgICAgICAgICAgICB2YWx1ZTogJ2ZvbydcbiAgICAgICAgICAgICAgcmFuZ2U6IFsxMiwyMF1cbiAgICAgICAgICAgICAgcGF0aDogJy9wYXRoL3RvL2Zvby5zdHlsJ1xuICAgICAgICAgICAgICBsaW5lOiAyXG4gICAgICAgICAgICAgIGlzQ29sb3I6IHRydWVcbiAgICAgICAgICAgICAgY29sb3I6IFsxNzAsIDE4NywgMjA0LCAxXVxuICAgICAgICAgICAgICB2YXJpYWJsZXM6IFsnZm9vJ11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdiYXonXG4gICAgICAgICAgICAgIHZhbHVlOiAnMC41J1xuICAgICAgICAgICAgICByYW5nZTogWzIyLDMwXVxuICAgICAgICAgICAgICBwYXRoOiAnL3BhdGgvdG8vZm9vLnN0eWwnXG4gICAgICAgICAgICAgIGxpbmU6IDNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pXG5cbiAgICAgIGl0ICdyZXN0b3JlcyB0aGUgdmFyaWFibGVzJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24ubGVuZ3RoKS50b0VxdWFsKDMpXG4gICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLmdldENvbG9yVmFyaWFibGVzKCkubGVuZ3RoKS50b0VxdWFsKDIpXG5cbiAgICAgIGl0ICdyZXN0b3JlcyBhbGwgdGhlIGRlbm9ybWFsaXplZCBkYXRhIGluIHRoZSBjb2xsZWN0aW9uJywgLT5cbiAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24udmFyaWFibGVOYW1lcykudG9FcXVhbChbJ2ZvbycsICdiYXInLCAnYmF6J10pXG4gICAgICAgIGV4cGVjdChPYmplY3Qua2V5cyBjb2xsZWN0aW9uLnZhcmlhYmxlc0J5UGF0aCkudG9FcXVhbChbJy9wYXRoL3RvL2Zvby5zdHlsJ10pXG4gICAgICAgIGV4cGVjdChjb2xsZWN0aW9uLnZhcmlhYmxlc0J5UGF0aFsnL3BhdGgvdG8vZm9vLnN0eWwnXS5sZW5ndGgpLnRvRXF1YWwoMylcbiAgICAgICAgZXhwZWN0KGNvbGxlY3Rpb24uZGVwZW5kZW5jeUdyYXBoKS50b0VxdWFsKHtcbiAgICAgICAgICBmb286IFsnYmFyJ11cbiAgICAgICAgfSlcbiJdfQ==

(function() {
  var Pigments, deserializers, registry;

  registry = require('../../lib/color-expressions');

  Pigments = require('../../lib/pigments');

  deserializers = {
    Palette: 'deserializePalette',
    ColorSearch: 'deserializeColorSearch',
    ColorProject: 'deserializeColorProject',
    ColorProjectElement: 'deserializeColorProjectElement',
    VariablesCollection: 'deserializeVariablesCollection'
  };

  beforeEach(function() {
    var jasmineContent, k, v;
    atom.config.set('pigments.markerType', 'native-background');
    atom.views.addViewProvider(Pigments.pigmentsViewProvider);
    for (k in deserializers) {
      v = deserializers[k];
      atom.deserializers.add({
        name: k,
        deserialize: Pigments[v]
      });
    }
    registry.removeExpression('pigments:variables');
    jasmineContent = document.body.querySelector('#jasmine-content');
    jasmineContent.style.width = '100%';
    return jasmineContent.style.height = '100%';
  });

  afterEach(function() {
    return registry.removeExpression('pigments:variables');
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvaGVscGVycy9zcGVjLWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsNkJBQVI7O0VBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUjs7RUFFWCxhQUFBLEdBQ0U7SUFBQSxPQUFBLEVBQVMsb0JBQVQ7SUFDQSxXQUFBLEVBQWEsd0JBRGI7SUFFQSxZQUFBLEVBQWMseUJBRmQ7SUFHQSxtQkFBQSxFQUFxQixnQ0FIckI7SUFJQSxtQkFBQSxFQUFxQixnQ0FKckI7OztFQU1GLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsUUFBQTtJQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQkFBaEIsRUFBdUMsbUJBQXZDO0lBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFYLENBQTJCLFFBQVEsQ0FBQyxvQkFBcEM7QUFFQSxTQUFBLGtCQUFBOztNQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUI7UUFBQSxJQUFBLEVBQU0sQ0FBTjtRQUFTLFdBQUEsRUFBYSxRQUFTLENBQUEsQ0FBQSxDQUEvQjtPQUF2QjtBQURGO0lBR0EsUUFBUSxDQUFDLGdCQUFULENBQTBCLG9CQUExQjtJQUVBLGNBQUEsR0FBaUIsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFkLENBQTRCLGtCQUE1QjtJQUNqQixjQUFjLENBQUMsS0FBSyxDQUFDLEtBQXJCLEdBQTZCO1dBQzdCLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBckIsR0FBOEI7RUFYckIsQ0FBWDs7RUFhQSxTQUFBLENBQVUsU0FBQTtXQUNSLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixvQkFBMUI7RUFEUSxDQUFWO0FBdkJBIiwic291cmNlc0NvbnRlbnQiOlsicmVnaXN0cnkgPSByZXF1aXJlICcuLi8uLi9saWIvY29sb3ItZXhwcmVzc2lvbnMnXG5QaWdtZW50cyA9IHJlcXVpcmUgJy4uLy4uL2xpYi9waWdtZW50cydcblxuZGVzZXJpYWxpemVycyA9XG4gIFBhbGV0dGU6ICdkZXNlcmlhbGl6ZVBhbGV0dGUnXG4gIENvbG9yU2VhcmNoOiAnZGVzZXJpYWxpemVDb2xvclNlYXJjaCdcbiAgQ29sb3JQcm9qZWN0OiAnZGVzZXJpYWxpemVDb2xvclByb2plY3QnXG4gIENvbG9yUHJvamVjdEVsZW1lbnQ6ICdkZXNlcmlhbGl6ZUNvbG9yUHJvamVjdEVsZW1lbnQnXG4gIFZhcmlhYmxlc0NvbGxlY3Rpb246ICdkZXNlcmlhbGl6ZVZhcmlhYmxlc0NvbGxlY3Rpb24nXG5cbmJlZm9yZUVhY2ggLT5cbiAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5tYXJrZXJUeXBlJywgJ25hdGl2ZS1iYWNrZ3JvdW5kJylcbiAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIoUGlnbWVudHMucGlnbWVudHNWaWV3UHJvdmlkZXIpXG5cbiAgZm9yIGssdiBvZiBkZXNlcmlhbGl6ZXJzXG4gICAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCBuYW1lOiBrLCBkZXNlcmlhbGl6ZTogUGlnbWVudHNbdl1cblxuICByZWdpc3RyeS5yZW1vdmVFeHByZXNzaW9uKCdwaWdtZW50czp2YXJpYWJsZXMnKVxuXG4gIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcbiAgamFzbWluZUNvbnRlbnQuc3R5bGUud2lkdGggPSAnMTAwJSdcbiAgamFzbWluZUNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnXG5cbmFmdGVyRWFjaCAtPlxuICByZWdpc3RyeS5yZW1vdmVFeHByZXNzaW9uKCdwaWdtZW50czp2YXJpYWJsZXMnKVxuIl19

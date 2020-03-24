(function() {
  var ColorSearch;

  require('./helpers/matchers');

  ColorSearch = require('../lib/color-search');

  describe('ColorSearch', function() {
    var pigments, project, ref, search;
    ref = [], search = ref[0], pigments = ref[1], project = ref[2];
    beforeEach(function() {
      atom.config.set('pigments.sourceNames', ['**/*.styl', '**/*.less']);
      atom.config.set('pigments.extendedSearchNames', ['**/*.css']);
      atom.config.set('pigments.ignoredNames', ['project/vendor/**']);
      waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
      return waitsForPromise(function() {
        return project.initialize();
      });
    });
    return describe('when created with basic options', function() {
      beforeEach(function() {
        return search = project.findAllColors();
      });
      it('dispatches a did-complete-search when finalizing its search', function() {
        var spy;
        spy = jasmine.createSpy('did-complete-search');
        search.onDidCompleteSearch(spy);
        search.search();
        waitsFor(function() {
          return spy.callCount > 0;
        });
        return runs(function() {
          return expect(spy.argsForCall[0][0].length).toEqual(26);
        });
      });
      return it('dispatches a did-find-matches event for every file', function() {
        var completeSpy, findSpy;
        completeSpy = jasmine.createSpy('did-complete-search');
        findSpy = jasmine.createSpy('did-find-matches');
        search.onDidCompleteSearch(completeSpy);
        search.onDidFindMatches(findSpy);
        search.search();
        waitsFor(function() {
          return completeSpy.callCount > 0;
        });
        return runs(function() {
          expect(findSpy.callCount).toEqual(7);
          return expect(findSpy.argsForCall[0][0].matches.length).toEqual(3);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3Itc2VhcmNoLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLENBQVEsb0JBQVI7O0VBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFFZCxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxNQUE4QixFQUE5QixFQUFDLGVBQUQsRUFBUyxpQkFBVCxFQUFtQjtJQUVuQixVQUFBLENBQVcsU0FBQTtNQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsQ0FDdEMsV0FEc0MsRUFFdEMsV0FGc0MsQ0FBeEM7TUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCLEVBQWdELENBQzlDLFVBRDhDLENBQWhEO01BR0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxDQUN2QyxtQkFEdUMsQ0FBekM7TUFJQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsVUFBOUIsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxTQUFDLEdBQUQ7VUFDaEUsUUFBQSxHQUFXLEdBQUcsQ0FBQztpQkFDZixPQUFBLEdBQVUsUUFBUSxDQUFDLFVBQVQsQ0FBQTtRQUZzRCxDQUEvQztNQUFILENBQWhCO2FBSUEsZUFBQSxDQUFnQixTQUFBO2VBQUcsT0FBTyxDQUFDLFVBQVIsQ0FBQTtNQUFILENBQWhCO0lBaEJTLENBQVg7V0FrQkEsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUE7TUFDMUMsVUFBQSxDQUFXLFNBQUE7ZUFDVCxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBQTtNQURBLENBQVg7TUFHQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQTtBQUNoRSxZQUFBO1FBQUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLHFCQUFsQjtRQUNOLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixHQUEzQjtRQUNBLE1BQU0sQ0FBQyxNQUFQLENBQUE7UUFDQSxRQUFBLENBQVMsU0FBQTtpQkFBRyxHQUFHLENBQUMsU0FBSixHQUFnQjtRQUFuQixDQUFUO2VBQ0EsSUFBQSxDQUFLLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEdBQUcsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBN0IsQ0FBb0MsQ0FBQyxPQUFyQyxDQUE2QyxFQUE3QztRQUFILENBQUw7TUFMZ0UsQ0FBbEU7YUFPQSxFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQTtBQUN2RCxZQUFBO1FBQUEsV0FBQSxHQUFjLE9BQU8sQ0FBQyxTQUFSLENBQWtCLHFCQUFsQjtRQUNkLE9BQUEsR0FBVSxPQUFPLENBQUMsU0FBUixDQUFrQixrQkFBbEI7UUFDVixNQUFNLENBQUMsbUJBQVAsQ0FBMkIsV0FBM0I7UUFDQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsT0FBeEI7UUFDQSxNQUFNLENBQUMsTUFBUCxDQUFBO1FBQ0EsUUFBQSxDQUFTLFNBQUE7aUJBQUcsV0FBVyxDQUFDLFNBQVosR0FBd0I7UUFBM0IsQ0FBVDtlQUNBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsTUFBQSxDQUFPLE9BQU8sQ0FBQyxTQUFmLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsQ0FBbEM7aUJBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDLE1BQXpDLENBQWdELENBQUMsT0FBakQsQ0FBeUQsQ0FBekQ7UUFGRyxDQUFMO01BUHVELENBQXpEO0lBWDBDLENBQTVDO0VBckJzQixDQUF4QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSAnLi9oZWxwZXJzL21hdGNoZXJzJ1xuQ29sb3JTZWFyY2ggPSByZXF1aXJlICcuLi9saWIvY29sb3Itc2VhcmNoJ1xuXG5kZXNjcmliZSAnQ29sb3JTZWFyY2gnLCAtPlxuICBbc2VhcmNoLCBwaWdtZW50cywgcHJvamVjdF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQgJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgW1xuICAgICAgJyoqLyouc3R5bCdcbiAgICAgICcqKi8qLmxlc3MnXG4gICAgXVxuICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuZXh0ZW5kZWRTZWFyY2hOYW1lcycsIFtcbiAgICAgICcqKi8qLmNzcydcbiAgICBdXG4gICAgYXRvbS5jb25maWcuc2V0ICdwaWdtZW50cy5pZ25vcmVkTmFtZXMnLCBbXG4gICAgICAncHJvamVjdC92ZW5kb3IvKionXG4gICAgXVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpLnRoZW4gKHBrZykgLT5cbiAgICAgIHBpZ21lbnRzID0gcGtnLm1haW5Nb2R1bGVcbiAgICAgIHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gIGRlc2NyaWJlICd3aGVuIGNyZWF0ZWQgd2l0aCBiYXNpYyBvcHRpb25zJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZWFyY2ggPSBwcm9qZWN0LmZpbmRBbGxDb2xvcnMoKVxuXG4gICAgaXQgJ2Rpc3BhdGNoZXMgYSBkaWQtY29tcGxldGUtc2VhcmNoIHdoZW4gZmluYWxpemluZyBpdHMgc2VhcmNoJywgLT5cbiAgICAgIHNweSA9IGphc21pbmUuY3JlYXRlU3B5KCdkaWQtY29tcGxldGUtc2VhcmNoJylcbiAgICAgIHNlYXJjaC5vbkRpZENvbXBsZXRlU2VhcmNoKHNweSlcbiAgICAgIHNlYXJjaC5zZWFyY2goKVxuICAgICAgd2FpdHNGb3IgLT4gc3B5LmNhbGxDb3VudCA+IDBcbiAgICAgIHJ1bnMgLT4gZXhwZWN0KHNweS5hcmdzRm9yQ2FsbFswXVswXS5sZW5ndGgpLnRvRXF1YWwoMjYpXG5cbiAgICBpdCAnZGlzcGF0Y2hlcyBhIGRpZC1maW5kLW1hdGNoZXMgZXZlbnQgZm9yIGV2ZXJ5IGZpbGUnLCAtPlxuICAgICAgY29tcGxldGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLWNvbXBsZXRlLXNlYXJjaCcpXG4gICAgICBmaW5kU3B5ID0gamFzbWluZS5jcmVhdGVTcHkoJ2RpZC1maW5kLW1hdGNoZXMnKVxuICAgICAgc2VhcmNoLm9uRGlkQ29tcGxldGVTZWFyY2goY29tcGxldGVTcHkpXG4gICAgICBzZWFyY2gub25EaWRGaW5kTWF0Y2hlcyhmaW5kU3B5KVxuICAgICAgc2VhcmNoLnNlYXJjaCgpXG4gICAgICB3YWl0c0ZvciAtPiBjb21wbGV0ZVNweS5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChmaW5kU3B5LmNhbGxDb3VudCkudG9FcXVhbCg3KVxuICAgICAgICBleHBlY3QoZmluZFNweS5hcmdzRm9yQ2FsbFswXVswXS5tYXRjaGVzLmxlbmd0aCkudG9FcXVhbCgzKVxuIl19

(function() {
  var ColorSearch, click;

  click = require('./helpers/events').click;

  ColorSearch = require('../lib/color-search');

  describe('ColorResultsElement', function() {
    var completeSpy, findSpy, pigments, project, ref, resultsElement, search;
    ref = [], search = ref[0], resultsElement = ref[1], pigments = ref[2], project = ref[3], completeSpy = ref[4], findSpy = ref[5];
    beforeEach(function() {
      atom.config.set('pigments.sourceNames', ['**/*.styl', '**/*.less']);
      waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
      waitsForPromise(function() {
        return project.initialize();
      });
      return runs(function() {
        search = project.findAllColors();
        spyOn(search, 'search').andCallThrough();
        completeSpy = jasmine.createSpy('did-complete-search');
        search.onDidCompleteSearch(completeSpy);
        resultsElement = atom.views.getView(search);
        return jasmine.attachToDOM(resultsElement);
      });
    });
    afterEach(function() {
      return waitsFor(function() {
        return completeSpy.callCount > 0;
      });
    });
    it('is associated with ColorSearch model', function() {
      return expect(resultsElement).toBeDefined();
    });
    it('starts the search', function() {
      return expect(search.search).toHaveBeenCalled();
    });
    return describe('when matches are found', function() {
      beforeEach(function() {
        return waitsFor(function() {
          return completeSpy.callCount > 0;
        });
      });
      it('groups results by files', function() {
        var fileResults;
        fileResults = resultsElement.querySelectorAll('.list-nested-item');
        expect(fileResults.length).toEqual(8);
        return expect(fileResults[0].querySelectorAll('li.list-item').length).toEqual(3);
      });
      describe('when a file item is clicked', function() {
        var fileItem;
        fileItem = [][0];
        beforeEach(function() {
          fileItem = resultsElement.querySelector('.list-nested-item > .list-item');
          return click(fileItem);
        });
        return it('collapses the file matches', function() {
          return expect(resultsElement.querySelector('.list-nested-item.collapsed')).toExist();
        });
      });
      return describe('when a matches item is clicked', function() {
        var matchItem, ref1, spy;
        ref1 = [], matchItem = ref1[0], spy = ref1[1];
        beforeEach(function() {
          spy = jasmine.createSpy('did-add-text-editor');
          atom.workspace.onDidAddTextEditor(spy);
          matchItem = resultsElement.querySelector('.search-result.list-item');
          click(matchItem);
          return waitsFor(function() {
            return spy.callCount > 0;
          });
        });
        return it('opens the file', function() {
          var textEditor;
          expect(spy).toHaveBeenCalled();
          textEditor = spy.argsForCall[0][0].textEditor;
          return expect(textEditor.getSelectedBufferRange()).toEqual([[1, 13], [1, 23]]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3ItcmVzdWx0cy1lbGVtZW50LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFDVixXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUVkLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBO0FBQzlCLFFBQUE7SUFBQSxNQUFvRSxFQUFwRSxFQUFDLGVBQUQsRUFBUyx1QkFBVCxFQUF5QixpQkFBekIsRUFBbUMsZ0JBQW5DLEVBQTRDLG9CQUE1QyxFQUF5RDtJQUV6RCxVQUFBLENBQVcsU0FBQTtNQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsQ0FDdEMsV0FEc0MsRUFFdEMsV0FGc0MsQ0FBeEM7TUFLQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsVUFBOUIsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxTQUFDLEdBQUQ7VUFDaEUsUUFBQSxHQUFXLEdBQUcsQ0FBQztpQkFDZixPQUFBLEdBQVUsUUFBUSxDQUFDLFVBQVQsQ0FBQTtRQUZzRCxDQUEvQztNQUFILENBQWhCO01BSUEsZUFBQSxDQUFnQixTQUFBO2VBQUcsT0FBTyxDQUFDLFVBQVIsQ0FBQTtNQUFILENBQWhCO2FBRUEsSUFBQSxDQUFLLFNBQUE7UUFDSCxNQUFBLEdBQVMsT0FBTyxDQUFDLGFBQVIsQ0FBQTtRQUNULEtBQUEsQ0FBTSxNQUFOLEVBQWMsUUFBZCxDQUF1QixDQUFDLGNBQXhCLENBQUE7UUFDQSxXQUFBLEdBQWMsT0FBTyxDQUFDLFNBQVIsQ0FBa0IscUJBQWxCO1FBQ2QsTUFBTSxDQUFDLG1CQUFQLENBQTJCLFdBQTNCO1FBRUEsY0FBQSxHQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkI7ZUFFakIsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsY0FBcEI7TUFSRyxDQUFMO0lBWlMsQ0FBWDtJQXNCQSxTQUFBLENBQVUsU0FBQTthQUFHLFFBQUEsQ0FBUyxTQUFBO2VBQUcsV0FBVyxDQUFDLFNBQVosR0FBd0I7TUFBM0IsQ0FBVDtJQUFILENBQVY7SUFFQSxFQUFBLENBQUcsc0NBQUgsRUFBMkMsU0FBQTthQUN6QyxNQUFBLENBQU8sY0FBUCxDQUFzQixDQUFDLFdBQXZCLENBQUE7SUFEeUMsQ0FBM0M7SUFHQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQTthQUN0QixNQUFBLENBQU8sTUFBTSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQyxnQkFBdEIsQ0FBQTtJQURzQixDQUF4QjtXQUdBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBO01BQ2pDLFVBQUEsQ0FBVyxTQUFBO2VBQUcsUUFBQSxDQUFTLFNBQUE7aUJBQUcsV0FBVyxDQUFDLFNBQVosR0FBd0I7UUFBM0IsQ0FBVDtNQUFILENBQVg7TUFFQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtBQUM1QixZQUFBO1FBQUEsV0FBQSxHQUFjLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxtQkFBaEM7UUFFZCxNQUFBLENBQU8sV0FBVyxDQUFDLE1BQW5CLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsQ0FBbkM7ZUFFQSxNQUFBLENBQU8sV0FBWSxDQUFBLENBQUEsQ0FBRSxDQUFDLGdCQUFmLENBQWdDLGNBQWhDLENBQStDLENBQUMsTUFBdkQsQ0FBOEQsQ0FBQyxPQUEvRCxDQUF1RSxDQUF2RTtNQUw0QixDQUE5QjtNQU9BLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBO0FBQ3RDLFlBQUE7UUFBQyxXQUFZO1FBQ2IsVUFBQSxDQUFXLFNBQUE7VUFDVCxRQUFBLEdBQVcsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsZ0NBQTdCO2lCQUNYLEtBQUEsQ0FBTSxRQUFOO1FBRlMsQ0FBWDtlQUlBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO2lCQUMvQixNQUFBLENBQU8sY0FBYyxDQUFDLGFBQWYsQ0FBNkIsNkJBQTdCLENBQVAsQ0FBbUUsQ0FBQyxPQUFwRSxDQUFBO1FBRCtCLENBQWpDO01BTnNDLENBQXhDO2FBU0EsUUFBQSxDQUFTLGdDQUFULEVBQTJDLFNBQUE7QUFDekMsWUFBQTtRQUFBLE9BQW1CLEVBQW5CLEVBQUMsbUJBQUQsRUFBWTtRQUNaLFVBQUEsQ0FBVyxTQUFBO1VBQ1QsR0FBQSxHQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLHFCQUFsQjtVQUVOLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsR0FBbEM7VUFDQSxTQUFBLEdBQVksY0FBYyxDQUFDLGFBQWYsQ0FBNkIsMEJBQTdCO1VBQ1osS0FBQSxDQUFNLFNBQU47aUJBRUEsUUFBQSxDQUFTLFNBQUE7bUJBQUcsR0FBRyxDQUFDLFNBQUosR0FBZ0I7VUFBbkIsQ0FBVDtRQVBTLENBQVg7ZUFTQSxFQUFBLENBQUcsZ0JBQUgsRUFBcUIsU0FBQTtBQUNuQixjQUFBO1VBQUEsTUFBQSxDQUFPLEdBQVAsQ0FBVyxDQUFDLGdCQUFaLENBQUE7VUFDQyxhQUFjLEdBQUcsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQTtpQkFDbEMsTUFBQSxDQUFPLFVBQVUsQ0FBQyxzQkFBWCxDQUFBLENBQVAsQ0FBMkMsQ0FBQyxPQUE1QyxDQUFvRCxDQUFDLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBRCxFQUFRLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUixDQUFwRDtRQUhtQixDQUFyQjtNQVh5QyxDQUEzQztJQW5CaUMsQ0FBbkM7RUFqQzhCLENBQWhDO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Y2xpY2t9ID0gcmVxdWlyZSAnLi9oZWxwZXJzL2V2ZW50cydcbkNvbG9yU2VhcmNoID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLXNlYXJjaCdcblxuZGVzY3JpYmUgJ0NvbG9yUmVzdWx0c0VsZW1lbnQnLCAtPlxuICBbc2VhcmNoLCByZXN1bHRzRWxlbWVudCwgcGlnbWVudHMsIHByb2plY3QsIGNvbXBsZXRlU3B5LCBmaW5kU3B5XSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGF0b20uY29uZmlnLnNldCAncGlnbWVudHMuc291cmNlTmFtZXMnLCBbXG4gICAgICAnKiovKi5zdHlsJ1xuICAgICAgJyoqLyoubGVzcydcbiAgICBdXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3BpZ21lbnRzJykudGhlbiAocGtnKSAtPlxuICAgICAgcGlnbWVudHMgPSBwa2cubWFpbk1vZHVsZVxuICAgICAgcHJvamVjdCA9IHBpZ21lbnRzLmdldFByb2plY3QoKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICBydW5zIC0+XG4gICAgICBzZWFyY2ggPSBwcm9qZWN0LmZpbmRBbGxDb2xvcnMoKVxuICAgICAgc3B5T24oc2VhcmNoLCAnc2VhcmNoJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgY29tcGxldGVTcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLWNvbXBsZXRlLXNlYXJjaCcpXG4gICAgICBzZWFyY2gub25EaWRDb21wbGV0ZVNlYXJjaChjb21wbGV0ZVNweSlcblxuICAgICAgcmVzdWx0c0VsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoc2VhcmNoKVxuXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHJlc3VsdHNFbGVtZW50KVxuXG4gIGFmdGVyRWFjaCAtPiB3YWl0c0ZvciAtPiBjb21wbGV0ZVNweS5jYWxsQ291bnQgPiAwXG5cbiAgaXQgJ2lzIGFzc29jaWF0ZWQgd2l0aCBDb2xvclNlYXJjaCBtb2RlbCcsIC0+XG4gICAgZXhwZWN0KHJlc3VsdHNFbGVtZW50KS50b0JlRGVmaW5lZCgpXG5cbiAgaXQgJ3N0YXJ0cyB0aGUgc2VhcmNoJywgLT5cbiAgICBleHBlY3Qoc2VhcmNoLnNlYXJjaCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgJ3doZW4gbWF0Y2hlcyBhcmUgZm91bmQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gd2FpdHNGb3IgLT4gY29tcGxldGVTcHkuY2FsbENvdW50ID4gMFxuXG4gICAgaXQgJ2dyb3VwcyByZXN1bHRzIGJ5IGZpbGVzJywgLT5cbiAgICAgIGZpbGVSZXN1bHRzID0gcmVzdWx0c0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmxpc3QtbmVzdGVkLWl0ZW0nKVxuXG4gICAgICBleHBlY3QoZmlsZVJlc3VsdHMubGVuZ3RoKS50b0VxdWFsKDgpXG5cbiAgICAgIGV4cGVjdChmaWxlUmVzdWx0c1swXS5xdWVyeVNlbGVjdG9yQWxsKCdsaS5saXN0LWl0ZW0nKS5sZW5ndGgpLnRvRXF1YWwoMylcblxuICAgIGRlc2NyaWJlICd3aGVuIGEgZmlsZSBpdGVtIGlzIGNsaWNrZWQnLCAtPlxuICAgICAgW2ZpbGVJdGVtXSA9IFtdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGZpbGVJdGVtID0gcmVzdWx0c0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpc3QtbmVzdGVkLWl0ZW0gPiAubGlzdC1pdGVtJylcbiAgICAgICAgY2xpY2soZmlsZUl0ZW0pXG5cbiAgICAgIGl0ICdjb2xsYXBzZXMgdGhlIGZpbGUgbWF0Y2hlcycsIC0+XG4gICAgICAgIGV4cGVjdChyZXN1bHRzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGlzdC1uZXN0ZWQtaXRlbS5jb2xsYXBzZWQnKSkudG9FeGlzdCgpXG5cbiAgICBkZXNjcmliZSAnd2hlbiBhIG1hdGNoZXMgaXRlbSBpcyBjbGlja2VkJywgLT5cbiAgICAgIFttYXRjaEl0ZW0sIHNweV0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHkgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkLWFkZC10ZXh0LWVkaXRvcicpXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRUZXh0RWRpdG9yKHNweSlcbiAgICAgICAgbWF0Y2hJdGVtID0gcmVzdWx0c0VsZW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1yZXN1bHQubGlzdC1pdGVtJylcbiAgICAgICAgY2xpY2sobWF0Y2hJdGVtKVxuXG4gICAgICAgIHdhaXRzRm9yIC0+IHNweS5jYWxsQ291bnQgPiAwXG5cbiAgICAgIGl0ICdvcGVucyB0aGUgZmlsZScsIC0+XG4gICAgICAgIGV4cGVjdChzcHkpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB7dGV4dEVkaXRvcn0gPSBzcHkuYXJnc0ZvckNhbGxbMF1bMF1cbiAgICAgICAgZXhwZWN0KHRleHRFZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKS50b0VxdWFsKFtbMSwxM10sWzEsMjNdXSlcbiJdfQ==

(function() {
  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, ref;
    ref = [], completionDelay = ref[0], editor = ref[1], editorView = ref[2], pigments = ref[3], autocompleteMain = ref[4], autocompleteManager = ref[5], jasmineContent = ref[6], project = ref[7];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        jasmineContent = document.body.querySelector('#jasmine-content');
        atom.config.set('pigments.autocompleteScopes', ['*']);
        atom.config.set('pigments.sourceNames', ['**/*.styl', '**/*.less']);
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmineContent.appendChild(workspaceElement);
      });
      waitsForPromise('autocomplete-plus activation', function() {
        return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
          return autocompleteMain = pkg.mainModule;
        });
      });
      waitsForPromise('pigments activation', function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          return pigments = pkg.mainModule;
        });
      });
      runs(function() {
        spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
        return spyOn(pigments, 'provideAutocomplete').andCallThrough();
      });
      waitsForPromise('open sample file', function() {
        return atom.workspace.open('sample.styl').then(function(e) {
          editor = e;
          editor.setText('');
          return editorView = atom.views.getView(editor);
        });
      });
      waitsForPromise('pigments project initialized', function() {
        project = pigments.getProject();
        return project.initialize();
      });
      return runs(function() {
        autocompleteManager = autocompleteMain.autocompleteManager;
        spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
        return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
      });
    });
    describe('writing the name of a color', function() {
      it('returns suggestions for the matching colors', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('border: 1px solid ');
          editor.moveToBottom();
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var popup, preview;
          popup = editorView.querySelector('.autocomplete-plus');
          expect(popup).toExist();
          expect(popup.querySelector('span.word').textContent).toEqual('base-color');
          preview = popup.querySelector('.color-suggestion-preview');
          expect(preview).toExist();
          return expect(preview.style.background).toEqual('rgb(255, 255, 255)');
        });
      });
      it('replaces the prefix even when it contains a @', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('@');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return expect(editor.getText()).not.toContain('@@');
        });
      });
      it('replaces the prefix even when it contains a $', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('o');
          editor.insertText('t');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          expect(editor.getText()).toContain('$other-color');
          return expect(editor.getText()).not.toContain('$$');
        });
      });
      return describe('when the extendAutocompleteToColorValue setting is enabled', function() {
        beforeEach(function() {
          return atom.config.set('pigments.extendAutocompleteToColorValue', true);
        });
        describe('with an opaque color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('b');
              editor.insertText('a');
              editor.insertText('s');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('base-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
        });
        describe('when the autocompleteSuggestionsFromValue setting is enabled', function() {
          beforeEach(function() {
            return atom.config.set('pigments.autocompleteSuggestionsFromValue', true);
          });
          it('suggests color variables from hexadecimal values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from hexadecimal values when in a CSS expression', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from rgb values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('r');
              editor.insertText('g');
              editor.insertText('b');
              editor.insertText('(');
              editor.insertText('2');
              editor.insertText('5');
              editor.insertText('5');
              editor.insertText(',');
              editor.insertText(' ');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          return describe('and when extendAutocompleteToVariables is true', function() {
            beforeEach(function() {
              return atom.config.set('pigments.extendAutocompleteToVariables', true);
            });
            return it('returns suggestions for the matching variable value', function() {
              runs(function() {
                expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
                editor.moveToBottom();
                editor.insertText('border: ');
                editor.moveToBottom();
                editor.insertText('6');
                editor.insertText('p');
                editor.insertText('x');
                editor.insertText(' ');
                return advanceClock(completionDelay);
              });
              waitsFor(function() {
                return autocompleteManager.displaySuggestions.calls.length === 1;
              });
              waitsFor(function() {
                return editorView.querySelector('.autocomplete-plus li') != null;
              });
              return runs(function() {
                var popup;
                popup = editorView.querySelector('.autocomplete-plus');
                expect(popup).toExist();
                expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
                return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
              });
            });
          });
        });
        return describe('with a transparent color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('$');
              editor.insertText('o');
              editor.insertText('t');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('$other-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('rgba(255,0,0,0.5)');
            });
          });
        });
      });
    });
    describe('writing the name of a non-color variable', function() {
      return it('returns suggestions for the matching variable', function() {
        atom.config.set('pigments.extendAutocompleteToVariables', false);
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('o');
          editor.insertText('o');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
    return describe('when extendAutocompleteToVariables is true', function() {
      beforeEach(function() {
        return atom.config.set('pigments.extendAutocompleteToVariables', true);
      });
      return describe('writing the name of a non-color variable', function() {
        return it('returns suggestions for the matching variable', function() {
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('b');
            editor.insertText('u');
            editor.insertText('t');
            editor.insertText('t');
            editor.insertText('o');
            editor.insertText('n');
            editor.insertText('-');
            editor.insertText('p');
            return advanceClock(completionDelay);
          });
          waitsFor(function() {
            return autocompleteManager.displaySuggestions.calls.length === 1;
          });
          waitsFor(function() {
            return editorView.querySelector('.autocomplete-plus li') != null;
          });
          return runs(function() {
            var popup;
            popup = editorView.querySelector('.autocomplete-plus');
            expect(popup).toExist();
            expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
            return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
          });
        });
      });
    });
  });

  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, ref;
    ref = [], completionDelay = ref[0], editor = ref[1], editorView = ref[2], pigments = ref[3], autocompleteMain = ref[4], autocompleteManager = ref[5], jasmineContent = ref[6], project = ref[7];
    return describe('for sass files', function() {
      beforeEach(function() {
        runs(function() {
          var workspaceElement;
          jasmineContent = document.body.querySelector('#jasmine-content');
          atom.config.set('pigments.autocompleteScopes', ['*']);
          atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.scss']);
          atom.config.set('autocomplete-plus.enableAutoActivation', true);
          completionDelay = 100;
          atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
          completionDelay += 100;
          workspaceElement = atom.views.getView(atom.workspace);
          return jasmineContent.appendChild(workspaceElement);
        });
        waitsForPromise('autocomplete-plus activation', function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
            return autocompleteMain = pkg.mainModule;
          });
        });
        waitsForPromise('pigments activation', function() {
          return atom.packages.activatePackage('pigments').then(function(pkg) {
            return pigments = pkg.mainModule;
          });
        });
        runs(function() {
          spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
          return spyOn(pigments, 'provideAutocomplete').andCallThrough();
        });
        waitsForPromise('open sample file', function() {
          return atom.workspace.open('sample.styl').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise('pigments project initialized', function() {
          project = pigments.getProject();
          return project.initialize();
        });
        return runs(function() {
          autocompleteManager = autocompleteMain.autocompleteManager;
          spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
          return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        });
      });
      return it('does not display the alternate sass version', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor('suggestions displayed callback', function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor('autocomplete lis', function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var hasAlternate, lis;
          lis = editorView.querySelectorAll('.autocomplete-plus li');
          hasAlternate = Array.prototype.some.call(lis, function(li) {
            return li.querySelector('span.word').textContent === '$base_color';
          });
          return expect(hasAlternate).toBeFalsy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvcGlnbWVudHMtcHJvdmlkZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFBQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTtBQUNoQyxRQUFBO0lBQUEsTUFBa0gsRUFBbEgsRUFBQyx3QkFBRCxFQUFrQixlQUFsQixFQUEwQixtQkFBMUIsRUFBc0MsaUJBQXRDLEVBQWdELHlCQUFoRCxFQUFrRSw0QkFBbEUsRUFBdUYsdUJBQXZGLEVBQXVHO0lBRXZHLFVBQUEsQ0FBVyxTQUFBO01BQ1QsSUFBQSxDQUFLLFNBQUE7QUFDSCxZQUFBO1FBQUEsY0FBQSxHQUFpQixRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWQsQ0FBNEIsa0JBQTVCO1FBRWpCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsQ0FBQyxHQUFELENBQS9DO1FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUN0QyxXQURzQyxFQUV0QyxXQUZzQyxDQUF4QztRQU1BLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFBMEQsSUFBMUQ7UUFFQSxlQUFBLEdBQWtCO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsRUFBeUQsZUFBekQ7UUFDQSxlQUFBLElBQW1CO1FBQ25CLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEI7ZUFFbkIsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsZ0JBQTNCO01BakJHLENBQUw7TUFtQkEsZUFBQSxDQUFnQiw4QkFBaEIsRUFBZ0QsU0FBQTtlQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsbUJBQTlCLENBQWtELENB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QTtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO1VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjtpQkFFQSxZQUFBLENBQWEsZUFBYjtRQVJHLENBQUw7UUFVQSxRQUFBLENBQVMsZ0NBQVQsRUFBMkMsU0FBQTtpQkFDekMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE1BQTdDLEtBQXVEO1FBRGQsQ0FBM0M7UUFHQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtpQkFDM0I7UUFEMkIsQ0FBN0I7ZUFHQSxJQUFBLENBQUssU0FBQTtBQUNILGNBQUE7VUFBQSxHQUFBLEdBQU0sVUFBVSxDQUFDLGdCQUFYLENBQTRCLHVCQUE1QjtVQUNOLFlBQUEsR0FBZSxLQUFLLENBQUEsU0FBRSxDQUFBLElBQUksQ0FBQyxJQUFaLENBQWlCLEdBQWpCLEVBQXNCLFNBQUMsRUFBRDttQkFDbkMsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsV0FBakIsQ0FBNkIsQ0FBQyxXQUE5QixLQUE2QztVQURWLENBQXRCO2lCQUdmLE1BQUEsQ0FBTyxZQUFQLENBQW9CLENBQUMsU0FBckIsQ0FBQTtRQUxHLENBQUw7TUFqQmdELENBQWxEO0lBL0N5QixDQUEzQjtFQUhnQyxDQUFsQztBQXJWQSIsInNvdXJjZXNDb250ZW50IjpbIlxuZGVzY3JpYmUgJ2F1dG9jb21wbGV0ZSBwcm92aWRlcicsIC0+XG4gIFtjb21wbGV0aW9uRGVsYXksIGVkaXRvciwgZWRpdG9yVmlldywgcGlnbWVudHMsIGF1dG9jb21wbGV0ZU1haW4sIGF1dG9jb21wbGV0ZU1hbmFnZXIsIGphc21pbmVDb250ZW50LCBwcm9qZWN0XSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5hdXRvY29tcGxldGVTY29wZXMnLCBbJyonXSlcbiAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuc291cmNlTmFtZXMnLCBbXG4gICAgICAgICcqKi8qLnN0eWwnXG4gICAgICAgICcqKi8qLmxlc3MnXG4gICAgICBdKVxuXG4gICAgICAjIFNldCB0byBsaXZlIGNvbXBsZXRpb25cbiAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQXV0b0FjdGl2YXRpb24nLCB0cnVlKVxuICAgICAgIyBTZXQgdGhlIGNvbXBsZXRpb24gZGVsYXlcbiAgICAgIGNvbXBsZXRpb25EZWxheSA9IDEwMFxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5hdXRvQWN0aXZhdGlvbkRlbGF5JywgY29tcGxldGlvbkRlbGF5KVxuICAgICAgY29tcGxldGlvbkRlbGF5ICs9IDEwMCAjIFJlbmRlcmluZyBkZWxheVxuICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcblxuICAgICAgamFzbWluZUNvbnRlbnQuYXBwZW5kQ2hpbGQod29ya3NwYWNlRWxlbWVudClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAnYXV0b2NvbXBsZXRlLXBsdXMgYWN0aXZhdGlvbicsIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKS50aGVuIChwa2cpIC0+XG4gICAgICAgIGF1dG9jb21wbGV0ZU1haW4gPSBwa2cubWFpbk1vZHVsZVxuXG4gICAgd2FpdHNGb3JQcm9taXNlICdwaWdtZW50cyBhY3RpdmF0aW9uJywgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpLnRoZW4gKHBrZykgLT5cbiAgICAgICAgcGlnbWVudHMgPSBwa2cubWFpbk1vZHVsZVxuXG4gICAgcnVucyAtPlxuICAgICAgc3B5T24oYXV0b2NvbXBsZXRlTWFpbiwgJ2NvbnN1bWVQcm92aWRlcicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKHBpZ21lbnRzLCAncHJvdmlkZUF1dG9jb21wbGV0ZScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAnb3BlbiBzYW1wbGUgZmlsZScsIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdzYW1wbGUuc3R5bCcpLnRoZW4gKGUpIC0+XG4gICAgICAgIGVkaXRvciA9IGVcbiAgICAgICAgZWRpdG9yLnNldFRleHQgJydcbiAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgJ3BpZ21lbnRzIHByb2plY3QgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgcHJvamVjdCA9IHBpZ21lbnRzLmdldFByb2plY3QoKVxuICAgICAgcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgIHJ1bnMgLT5cbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBhdXRvY29tcGxldGVNYWluLmF1dG9jb21wbGV0ZU1hbmFnZXJcbiAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIsICdmaW5kU3VnZ2VzdGlvbnMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnZGlzcGxheVN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gIGRlc2NyaWJlICd3cml0aW5nIHRoZSBuYW1lIG9mIGEgY29sb3InLCAtPlxuICAgIGl0ICdyZXR1cm5zIHN1Z2dlc3Rpb25zIGZvciB0aGUgbWF0Y2hpbmcgY29sb3JzJywgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2JvcmRlcjogMXB4IHNvbGlkICcpXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcblxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICB3YWl0c0ZvciAtPiBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHBvcHVwID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICBleHBlY3QocG9wdXApLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi53b3JkJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJ2Jhc2UtY29sb3InKVxuXG4gICAgICAgIHByZXZpZXcgPSBwb3B1cC5xdWVyeVNlbGVjdG9yKCcuY29sb3Itc3VnZ2VzdGlvbi1wcmV2aWV3JylcbiAgICAgICAgZXhwZWN0KHByZXZpZXcpLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QocHJldmlldy5zdHlsZS5iYWNrZ3JvdW5kKS50b0VxdWFsKCdyZ2IoMjU1LCAyNTUsIDI1NSknKVxuXG4gICAgaXQgJ3JlcGxhY2VzIHRoZSBwcmVmaXggZXZlbiB3aGVuIGl0IGNvbnRhaW5zIGEgQCcsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdAJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG5cbiAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgd2FpdHNGb3IgLT4gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLm5vdC50b0NvbnRhaW4gJ0BAJ1xuXG4gICAgaXQgJ3JlcGxhY2VzIHRoZSBwcmVmaXggZXZlbiB3aGVuIGl0IGNvbnRhaW5zIGEgJCcsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCckJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ28nKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgndCcpXG5cbiAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgd2FpdHNGb3IgLT4gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvclZpZXcsICdhdXRvY29tcGxldGUtcGx1czpjb25maXJtJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQ29udGFpbiAnJG90aGVyLWNvbG9yJ1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkubm90LnRvQ29udGFpbiAnJCQnXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgZXh0ZW5kQXV0b2NvbXBsZXRlVG9Db2xvclZhbHVlIHNldHRpbmcgaXMgZW5hYmxlZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuZXh0ZW5kQXV0b2NvbXBsZXRlVG9Db2xvclZhbHVlJywgdHJ1ZSlcblxuICAgICAgZGVzY3JpYmUgJ3dpdGggYW4gb3BhcXVlIGNvbG9yJywgLT5cbiAgICAgICAgaXQgJ2Rpc3BsYXlzIHRoZSBjb2xvciBoZXhhZGVjaW1hbCBjb2RlIGluIHRoZSBjb21wbGV0aW9uIGl0ZW0nLCAtPlxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3MnKVxuXG4gICAgICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHBvcHVwID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwKS50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLndvcmQnKS50ZXh0Q29udGVudCkudG9FcXVhbCgnYmFzZS1jb2xvcicpXG5cbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLnJpZ2h0LWxhYmVsJykudGV4dENvbnRlbnQpLnRvQ29udGFpbignI2ZmZmZmZicpXG5cbiAgICAgIGRlc2NyaWJlICd3aGVuIHRoZSBhdXRvY29tcGxldGVTdWdnZXN0aW9uc0Zyb21WYWx1ZSBzZXR0aW5nIGlzIGVuYWJsZWQnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5hdXRvY29tcGxldGVTdWdnZXN0aW9uc0Zyb21WYWx1ZScsIHRydWUpXG5cbiAgICAgICAgaXQgJ3N1Z2dlc3RzIGNvbG9yIHZhcmlhYmxlcyBmcm9tIGhleGFkZWNpbWFsIHZhbHVlcycsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnIycpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG5cbiAgICAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgICBleHBlY3QocG9wdXApLnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50KS50b0VxdWFsKCd2YXIxJylcblxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ucmlnaHQtbGFiZWwnKS50ZXh0Q29udGVudCkudG9Db250YWluKCcjZmZmZmZmJylcblxuICAgICAgICBpdCAnc3VnZ2VzdHMgY29sb3IgdmFyaWFibGVzIGZyb20gaGV4YWRlY2ltYWwgdmFsdWVzIHdoZW4gaW4gYSBDU1MgZXhwcmVzc2lvbicsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYm9yZGVyOiAxcHggc29saWQgJylcbiAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyMnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2YnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2YnKVxuXG4gICAgICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHBvcHVwID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwKS50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLndvcmQnKS50ZXh0Q29udGVudCkudG9FcXVhbCgndmFyMScpXG5cbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLnJpZ2h0LWxhYmVsJykudGV4dENvbnRlbnQpLnRvQ29udGFpbignI2ZmZmZmZicpXG5cbiAgICAgICAgaXQgJ3N1Z2dlc3RzIGNvbG9yIHZhcmlhYmxlcyBmcm9tIHJnYiB2YWx1ZXMnLCAtPlxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2JvcmRlcjogMXB4IHNvbGlkICcpXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdyJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdnJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcoJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcyJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc1JylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCc1JylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcsJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcgJylcblxuICAgICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBwb3B1cCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICAgIGV4cGVjdChwb3B1cCkudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi53b3JkJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJ3ZhcjEnKVxuXG4gICAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi5yaWdodC1sYWJlbCcpLnRleHRDb250ZW50KS50b0NvbnRhaW4oJyNmZmZmZmYnKVxuXG4gICAgICAgIGRlc2NyaWJlICdhbmQgd2hlbiBleHRlbmRBdXRvY29tcGxldGVUb1ZhcmlhYmxlcyBpcyB0cnVlJywgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmV4dGVuZEF1dG9jb21wbGV0ZVRvVmFyaWFibGVzJywgdHJ1ZSlcblxuICAgICAgICAgIGl0ICdyZXR1cm5zIHN1Z2dlc3Rpb25zIGZvciB0aGUgbWF0Y2hpbmcgdmFyaWFibGUgdmFsdWUnLCAtPlxuICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYm9yZGVyOiAnKVxuICAgICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJzYnKVxuICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgncCcpXG4gICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd4JylcbiAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuXG4gICAgICAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgICAgICAgIHdhaXRzRm9yIC0+IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgICAgIGV4cGVjdChwb3B1cCkudG9FeGlzdCgpXG4gICAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLndvcmQnKS50ZXh0Q29udGVudCkudG9FcXVhbCgnYnV0dG9uLXBhZGRpbmcnKVxuXG4gICAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLnJpZ2h0LWxhYmVsJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJzZweCA4cHgnKVxuXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIGEgdHJhbnNwYXJlbnQgY29sb3InLCAtPlxuICAgICAgICBpdCAnZGlzcGxheXMgdGhlIGNvbG9yIGhleGFkZWNpbWFsIGNvZGUgaW4gdGhlIGNvbXBsZXRpb24gaXRlbScsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnJCcpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbycpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgndCcpXG5cbiAgICAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgICBleHBlY3QocG9wdXApLnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50KS50b0VxdWFsKCckb3RoZXItY29sb3InKVxuXG4gICAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi5yaWdodC1sYWJlbCcpLnRleHRDb250ZW50KS50b0NvbnRhaW4oJ3JnYmEoMjU1LDAsMCwwLjUpJylcblxuICBkZXNjcmliZSAnd3JpdGluZyB0aGUgbmFtZSBvZiBhIG5vbi1jb2xvciB2YXJpYWJsZScsIC0+XG4gICAgaXQgJ3JldHVybnMgc3VnZ2VzdGlvbnMgZm9yIHRoZSBtYXRjaGluZyB2YXJpYWJsZScsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmV4dGVuZEF1dG9jb21wbGV0ZVRvVmFyaWFibGVzJywgZmFsc2UpXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ28nKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbycpXG5cbiAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gIGRlc2NyaWJlICd3aGVuIGV4dGVuZEF1dG9jb21wbGV0ZVRvVmFyaWFibGVzIGlzIHRydWUnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuZXh0ZW5kQXV0b2NvbXBsZXRlVG9WYXJpYWJsZXMnLCB0cnVlKVxuXG4gICAgZGVzY3JpYmUgJ3dyaXRpbmcgdGhlIG5hbWUgb2YgYSBub24tY29sb3IgdmFyaWFibGUnLCAtPlxuICAgICAgaXQgJ3JldHVybnMgc3VnZ2VzdGlvbnMgZm9yIHRoZSBtYXRjaGluZyB2YXJpYWJsZScsIC0+XG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd1JylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgndCcpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3QnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdvJylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbicpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJy0nKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdwJylcblxuICAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICAgIHdhaXRzRm9yIC0+IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHBvcHVwID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgIGV4cGVjdChwb3B1cCkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50KS50b0VxdWFsKCdidXR0b24tcGFkZGluZycpXG5cbiAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi5yaWdodC1sYWJlbCcpLnRleHRDb250ZW50KS50b0VxdWFsKCc2cHggOHB4JylcblxuZGVzY3JpYmUgJ2F1dG9jb21wbGV0ZSBwcm92aWRlcicsIC0+XG4gIFtjb21wbGV0aW9uRGVsYXksIGVkaXRvciwgZWRpdG9yVmlldywgcGlnbWVudHMsIGF1dG9jb21wbGV0ZU1haW4sIGF1dG9jb21wbGV0ZU1hbmFnZXIsIGphc21pbmVDb250ZW50LCBwcm9qZWN0XSA9IFtdXG5cbiAgZGVzY3JpYmUgJ2ZvciBzYXNzIGZpbGVzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmF1dG9jb21wbGV0ZVNjb3BlcycsIFsnKiddKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLnNvdXJjZU5hbWVzJywgW1xuICAgICAgICAgICcqKi8qLnNhc3MnXG4gICAgICAgICAgJyoqLyouc2NzcydcbiAgICAgICAgXSlcblxuICAgICAgICAjIFNldCB0byBsaXZlIGNvbXBsZXRpb25cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpXG4gICAgICAgICMgU2V0IHRoZSBjb21wbGV0aW9uIGRlbGF5XG4gICAgICAgIGNvbXBsZXRpb25EZWxheSA9IDEwMFxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmF1dG9BY3RpdmF0aW9uRGVsYXknLCBjb21wbGV0aW9uRGVsYXkpXG4gICAgICAgIGNvbXBsZXRpb25EZWxheSArPSAxMDAgIyBSZW5kZXJpbmcgZGVsYXlcbiAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcblxuICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgJ2F1dG9jb21wbGV0ZS1wbHVzIGFjdGl2YXRpb24nLCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKS50aGVuIChwa2cpIC0+XG4gICAgICAgICAgYXV0b2NvbXBsZXRlTWFpbiA9IHBrZy5tYWluTW9kdWxlXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAncGlnbWVudHMgYWN0aXZhdGlvbicsIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdwaWdtZW50cycpLnRoZW4gKHBrZykgLT5cbiAgICAgICAgICBwaWdtZW50cyA9IHBrZy5tYWluTW9kdWxlXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc3B5T24oYXV0b2NvbXBsZXRlTWFpbiwgJ2NvbnN1bWVQcm92aWRlcicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgc3B5T24ocGlnbWVudHMsICdwcm92aWRlQXV0b2NvbXBsZXRlJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgJ29wZW4gc2FtcGxlIGZpbGUnLCAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdzYW1wbGUuc3R5bCcpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICAgIGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgJ3BpZ21lbnRzIHByb2plY3QgaW5pdGlhbGl6ZWQnLCAtPlxuICAgICAgICBwcm9qZWN0ID0gcGlnbWVudHMuZ2V0UHJvamVjdCgpXG4gICAgICAgIHByb2plY3QuaW5pdGlhbGl6ZSgpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IGF1dG9jb21wbGV0ZU1haW4uYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnZmluZFN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBzcHlPbihhdXRvY29tcGxldGVNYW5hZ2VyLCAnZGlzcGxheVN1Z2dlc3Rpb25zJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgaXQgJ2RvZXMgbm90IGRpc3BsYXkgdGhlIGFsdGVybmF0ZSBzYXNzIHZlcnNpb24nLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnJCcpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuXG4gICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgIHdhaXRzRm9yICdzdWdnZXN0aW9ucyBkaXNwbGF5ZWQgY2FsbGJhY2snLCAtPlxuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICB3YWl0c0ZvciAnYXV0b2NvbXBsZXRlIGxpcycsIC0+XG4gICAgICAgIGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgbGlzID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yQWxsKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKVxuICAgICAgICBoYXNBbHRlcm5hdGUgPSBBcnJheTo6c29tZS5jYWxsIGxpcywgKGxpKSAtPlxuICAgICAgICAgIGxpLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50IGlzICckYmFzZV9jb2xvcidcblxuICAgICAgICBleHBlY3QoaGFzQWx0ZXJuYXRlKS50b0JlRmFsc3koKVxuIl19

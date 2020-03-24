(function() {
  var CompositeDisposable, EventsDelegation, StickyTitle;

  EventsDelegation = require('atom-utils').EventsDelegation;

  CompositeDisposable = null;

  module.exports = StickyTitle = (function() {
    EventsDelegation.includeInto(StickyTitle);

    function StickyTitle(stickies, scrollContainer) {
      this.stickies = stickies;
      this.scrollContainer = scrollContainer;
      if (CompositeDisposable == null) {
        CompositeDisposable = require('atom').CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      Array.prototype.forEach.call(this.stickies, function(sticky) {
        sticky.parentNode.style.height = sticky.offsetHeight + 'px';
        return sticky.style.width = sticky.offsetWidth + 'px';
      });
      this.subscriptions.add(this.subscribeTo(this.scrollContainer, {
        'scroll': (function(_this) {
          return function(e) {
            return _this.scroll(e);
          };
        })(this)
      }));
    }

    StickyTitle.prototype.dispose = function() {
      this.subscriptions.dispose();
      this.stickies = null;
      return this.scrollContainer = null;
    };

    StickyTitle.prototype.scroll = function(e) {
      var delta;
      delta = this.lastScrollTop ? this.lastScrollTop - this.scrollContainer.scrollTop : 0;
      Array.prototype.forEach.call(this.stickies, (function(_this) {
        return function(sticky, i) {
          var nextSticky, nextTop, parentTop, prevSticky, prevTop, scrollTop, top;
          nextSticky = _this.stickies[i + 1];
          prevSticky = _this.stickies[i - 1];
          scrollTop = _this.scrollContainer.getBoundingClientRect().top;
          parentTop = sticky.parentNode.getBoundingClientRect().top;
          top = sticky.getBoundingClientRect().top;
          if (parentTop < scrollTop) {
            if (!sticky.classList.contains('absolute')) {
              sticky.classList.add('fixed');
              sticky.style.top = scrollTop + 'px';
              if (nextSticky != null) {
                nextTop = nextSticky.parentNode.getBoundingClientRect().top;
                if (top + sticky.offsetHeight >= nextTop) {
                  sticky.classList.add('absolute');
                  return sticky.style.top = _this.scrollContainer.scrollTop + 'px';
                }
              }
            }
          } else {
            sticky.classList.remove('fixed');
            if ((prevSticky != null) && prevSticky.classList.contains('absolute')) {
              prevTop = prevSticky.getBoundingClientRect().top;
              if (delta < 0) {
                prevTop -= prevSticky.offsetHeight;
              }
              if (scrollTop <= prevTop) {
                prevSticky.classList.remove('absolute');
                return prevSticky.style.top = scrollTop + 'px';
              }
            }
          }
        };
      })(this));
      return this.lastScrollTop = this.scrollContainer.scrollTop;
    };

    return StickyTitle;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9zdGlja3ktdGl0bGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxtQkFBb0IsT0FBQSxDQUFRLFlBQVI7O0VBQ3JCLG1CQUFBLEdBQXNCOztFQUV0QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ0osZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsV0FBN0I7O0lBRWEscUJBQUMsUUFBRCxFQUFZLGVBQVo7TUFBQyxJQUFDLENBQUEsV0FBRDtNQUFXLElBQUMsQ0FBQSxrQkFBRDs7UUFDdkIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQzs7TUFFdkMsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixLQUFLLENBQUEsU0FBRSxDQUFBLE9BQU8sQ0FBQyxJQUFmLENBQW9CLElBQUMsQ0FBQSxRQUFyQixFQUErQixTQUFDLE1BQUQ7UUFDN0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBeEIsR0FBaUMsTUFBTSxDQUFDLFlBQVAsR0FBc0I7ZUFDdkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLEdBQXFCLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO01BRmIsQ0FBL0I7TUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsZUFBZCxFQUErQjtRQUFBLFFBQUEsRUFBVSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7bUJBQzFELEtBQUMsQ0FBQSxNQUFELENBQVEsQ0FBUjtVQUQwRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtPQUEvQixDQUFuQjtJQVJXOzswQkFXYixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBSFo7OzBCQUtULE1BQUEsR0FBUSxTQUFDLENBQUQ7QUFDTixVQUFBO01BQUEsS0FBQSxHQUFXLElBQUMsQ0FBQSxhQUFKLEdBQ04sSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLGVBQWUsQ0FBQyxTQUQ1QixHQUdOO01BRUYsS0FBSyxDQUFBLFNBQUUsQ0FBQSxPQUFPLENBQUMsSUFBZixDQUFvQixJQUFDLENBQUEsUUFBckIsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQsRUFBUyxDQUFUO0FBQzdCLGNBQUE7VUFBQSxVQUFBLEdBQWEsS0FBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLEdBQUksQ0FBSjtVQUN2QixVQUFBLEdBQWEsS0FBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLEdBQUksQ0FBSjtVQUN2QixTQUFBLEdBQVksS0FBQyxDQUFBLGVBQWUsQ0FBQyxxQkFBakIsQ0FBQSxDQUF3QyxDQUFDO1VBQ3JELFNBQUEsR0FBWSxNQUFNLENBQUMsVUFBVSxDQUFDLHFCQUFsQixDQUFBLENBQXlDLENBQUM7VUFDckQsTUFBTyxNQUFNLENBQUMscUJBQVAsQ0FBQTtVQUVSLElBQUcsU0FBQSxHQUFZLFNBQWY7WUFDRSxJQUFBLENBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFqQixDQUEwQixVQUExQixDQUFQO2NBQ0UsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFqQixDQUFxQixPQUFyQjtjQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBYixHQUFtQixTQUFBLEdBQVk7Y0FFL0IsSUFBRyxrQkFBSDtnQkFDRSxPQUFBLEdBQVUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxxQkFBdEIsQ0FBQSxDQUE2QyxDQUFDO2dCQUN4RCxJQUFHLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBYixJQUE2QixPQUFoQztrQkFDRSxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQWpCLENBQXFCLFVBQXJCO3lCQUNBLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBYixHQUFtQixLQUFDLENBQUEsZUFBZSxDQUFDLFNBQWpCLEdBQTZCLEtBRmxEO2lCQUZGO2VBSkY7YUFERjtXQUFBLE1BQUE7WUFZRSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQWpCLENBQXdCLE9BQXhCO1lBRUEsSUFBRyxvQkFBQSxJQUFnQixVQUFVLENBQUMsU0FBUyxDQUFDLFFBQXJCLENBQThCLFVBQTlCLENBQW5CO2NBQ0UsT0FBQSxHQUFVLFVBQVUsQ0FBQyxxQkFBWCxDQUFBLENBQWtDLENBQUM7Y0FDN0MsSUFBc0MsS0FBQSxHQUFRLENBQTlDO2dCQUFBLE9BQUEsSUFBVyxVQUFVLENBQUMsYUFBdEI7O2NBRUEsSUFBRyxTQUFBLElBQWEsT0FBaEI7Z0JBQ0UsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFyQixDQUE0QixVQUE1Qjt1QkFDQSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQWpCLEdBQXVCLFNBQUEsR0FBWSxLQUZyQztlQUpGO2FBZEY7O1FBUDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQjthQTZCQSxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsZUFBZSxDQUFDO0lBbkM1Qjs7Ozs7QUF2QlYiLCJzb3VyY2VzQ29udGVudCI6WyJ7RXZlbnRzRGVsZWdhdGlvbn0gPSByZXF1aXJlICdhdG9tLXV0aWxzJ1xuQ29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RpY2t5VGl0bGVcbiAgRXZlbnRzRGVsZWdhdGlvbi5pbmNsdWRlSW50byh0aGlzKVxuXG4gIGNvbnN0cnVjdG9yOiAoQHN0aWNraWVzLCBAc2Nyb2xsQ29udGFpbmVyKSAtPlxuICAgIENvbXBvc2l0ZURpc3Bvc2FibGUgPz0gcmVxdWlyZSgnYXRvbScpLkNvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBBcnJheTo6Zm9yRWFjaC5jYWxsIEBzdGlja2llcywgKHN0aWNreSkgLT5cbiAgICAgIHN0aWNreS5wYXJlbnROb2RlLnN0eWxlLmhlaWdodCA9IHN0aWNreS5vZmZzZXRIZWlnaHQgKyAncHgnXG4gICAgICBzdGlja3kuc3R5bGUud2lkdGggPSBzdGlja3kub2Zmc2V0V2lkdGggKyAncHgnXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHN1YnNjcmliZVRvIEBzY3JvbGxDb250YWluZXIsICdzY3JvbGwnOiAoZSkgPT5cbiAgICAgIEBzY3JvbGwoZSlcblxuICBkaXNwb3NlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdGlja2llcyA9IG51bGxcbiAgICBAc2Nyb2xsQ29udGFpbmVyID0gbnVsbFxuXG4gIHNjcm9sbDogKGUpIC0+XG4gICAgZGVsdGEgPSBpZiBAbGFzdFNjcm9sbFRvcFxuICAgICAgQGxhc3RTY3JvbGxUb3AgLSBAc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcFxuICAgIGVsc2VcbiAgICAgIDBcblxuICAgIEFycmF5Ojpmb3JFYWNoLmNhbGwgQHN0aWNraWVzLCAoc3RpY2t5LCBpKSA9PlxuICAgICAgbmV4dFN0aWNreSA9IEBzdGlja2llc1tpICsgMV1cbiAgICAgIHByZXZTdGlja3kgPSBAc3RpY2tpZXNbaSAtIDFdXG4gICAgICBzY3JvbGxUb3AgPSBAc2Nyb2xsQ29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgcGFyZW50VG9wID0gc3RpY2t5LnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgICB7dG9wfSA9IHN0aWNreS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICBpZiBwYXJlbnRUb3AgPCBzY3JvbGxUb3BcbiAgICAgICAgdW5sZXNzIHN0aWNreS5jbGFzc0xpc3QuY29udGFpbnMoJ2Fic29sdXRlJylcbiAgICAgICAgICBzdGlja3kuY2xhc3NMaXN0LmFkZCAnZml4ZWQnXG4gICAgICAgICAgc3RpY2t5LnN0eWxlLnRvcCA9IHNjcm9sbFRvcCArICdweCdcblxuICAgICAgICAgIGlmIG5leHRTdGlja3k/XG4gICAgICAgICAgICBuZXh0VG9wID0gbmV4dFN0aWNreS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgICAgICAgaWYgdG9wICsgc3RpY2t5Lm9mZnNldEhlaWdodCA+PSBuZXh0VG9wXG4gICAgICAgICAgICAgIHN0aWNreS5jbGFzc0xpc3QuYWRkKCdhYnNvbHV0ZScpXG4gICAgICAgICAgICAgIHN0aWNreS5zdHlsZS50b3AgPSBAc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcCArICdweCdcblxuICAgICAgZWxzZVxuICAgICAgICBzdGlja3kuY2xhc3NMaXN0LnJlbW92ZSAnZml4ZWQnXG5cbiAgICAgICAgaWYgcHJldlN0aWNreT8gYW5kIHByZXZTdGlja3kuY2xhc3NMaXN0LmNvbnRhaW5zKCdhYnNvbHV0ZScpXG4gICAgICAgICAgcHJldlRvcCA9IHByZXZTdGlja3kuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG4gICAgICAgICAgcHJldlRvcCAtPSBwcmV2U3RpY2t5Lm9mZnNldEhlaWdodCBpZiBkZWx0YSA8IDBcblxuICAgICAgICAgIGlmIHNjcm9sbFRvcCA8PSBwcmV2VG9wXG4gICAgICAgICAgICBwcmV2U3RpY2t5LmNsYXNzTGlzdC5yZW1vdmUoJ2Fic29sdXRlJylcbiAgICAgICAgICAgIHByZXZTdGlja3kuc3R5bGUudG9wID0gc2Nyb2xsVG9wICsgJ3B4J1xuXG4gICAgQGxhc3RTY3JvbGxUb3AgPSBAc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcFxuIl19

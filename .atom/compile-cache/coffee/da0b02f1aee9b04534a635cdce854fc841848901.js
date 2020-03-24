(function() {
  beforeEach(function() {
    var compare;
    compare = function(a, b, p) {
      return Math.abs(b - a) < (Math.pow(10, -p) / 2);
    };
    return this.addMatchers({
      toBeComponentArrayCloseTo: function(arr, precision) {
        var notText;
        if (precision == null) {
          precision = 0;
        }
        notText = this.isNot ? " not" : "";
        this.message = (function(_this) {
          return function() {
            return "Expected " + (jasmine.pp(_this.actual)) + " to" + notText + " be an array whose values are close to " + (jasmine.pp(arr)) + " with a precision of " + precision;
          };
        })(this);
        if (this.actual.length !== arr.length) {
          return false;
        }
        return this.actual.every(function(value, i) {
          return compare(value, arr[i], precision);
        });
      },
      toBeValid: function() {
        var notText;
        notText = this.isNot ? " not" : "";
        this.message = (function(_this) {
          return function() {
            return "Expected " + (jasmine.pp(_this.actual)) + " to" + notText + " be a valid color";
          };
        })(this);
        return this.actual.isValid();
      },
      toBeColor: function(colorOrRed, green, blue, alpha) {
        var color, hex, notText, red;
        if (green == null) {
          green = 0;
        }
        if (blue == null) {
          blue = 0;
        }
        if (alpha == null) {
          alpha = 1;
        }
        color = (function() {
          switch (typeof colorOrRed) {
            case 'object':
              return colorOrRed;
            case 'number':
              return {
                red: colorOrRed,
                green: green,
                blue: blue,
                alpha: alpha
              };
            case 'string':
              colorOrRed = colorOrRed.replace(/#|0x/, '');
              hex = parseInt(colorOrRed, 16);
              switch (colorOrRed.length) {
                case 8:
                  alpha = (hex >> 24 & 0xff) / 255;
                  red = hex >> 16 & 0xff;
                  green = hex >> 8 & 0xff;
                  blue = hex & 0xff;
                  break;
                case 6:
                  red = hex >> 16 & 0xff;
                  green = hex >> 8 & 0xff;
                  blue = hex & 0xff;
                  break;
                case 3:
                  red = (hex >> 8 & 0xf) * 17;
                  green = (hex >> 4 & 0xf) * 17;
                  blue = (hex & 0xf) * 17;
                  break;
                default:
                  red = 0;
                  green = 0;
                  blue = 0;
                  alpha = 1;
              }
              return {
                red: red,
                green: green,
                blue: blue,
                alpha: alpha
              };
            default:
              return {
                red: 0,
                green: 0,
                blue: 0,
                alpha: 1
              };
          }
        })();
        notText = this.isNot ? " not" : "";
        this.message = (function(_this) {
          return function() {
            return "Expected " + (jasmine.pp(_this.actual)) + " to" + notText + " be a color equal to " + (jasmine.pp(color));
          };
        })(this);
        return Math.round(this.actual.red) === color.red && Math.round(this.actual.green) === color.green && Math.round(this.actual.blue) === color.blue && compare(this.actual.alpha, color.alpha, 1);
      }
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvaGVscGVycy9tYXRjaGVycy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7RUFBQSxVQUFBLENBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxPQUFBLEdBQVUsU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7YUFBVyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsR0FBSSxDQUFiLENBQUEsR0FBa0IsQ0FBQyxJQUFJLENBQUMsR0FBTCxDQUFTLEVBQVQsRUFBYSxDQUFDLENBQWQsQ0FBQSxHQUFtQixDQUFwQjtJQUE3QjtXQUVWLElBQUMsQ0FBQSxXQUFELENBQ0U7TUFBQSx5QkFBQSxFQUEyQixTQUFDLEdBQUQsRUFBTSxTQUFOO0FBQ3pCLFlBQUE7O1VBRCtCLFlBQVU7O1FBQ3pDLE9BQUEsR0FBYSxJQUFDLENBQUEsS0FBSixHQUFlLE1BQWYsR0FBMkI7UUFDckMsSUFBSSxDQUFDLE9BQUwsR0FBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLFdBQUEsR0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFSLENBQVcsS0FBQyxDQUFBLE1BQVosQ0FBRCxDQUFYLEdBQWdDLEtBQWhDLEdBQXFDLE9BQXJDLEdBQTZDLHlDQUE3QyxHQUFxRixDQUFDLE9BQU8sQ0FBQyxFQUFSLENBQVcsR0FBWCxDQUFELENBQXJGLEdBQXNHLHVCQUF0RyxHQUE2SDtVQUFoSTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7UUFFZixJQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsS0FBb0IsR0FBRyxDQUFDLE1BQXhDO0FBQUEsaUJBQU8sTUFBUDs7ZUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxTQUFDLEtBQUQsRUFBTyxDQUFQO2lCQUFhLE9BQUEsQ0FBUSxLQUFSLEVBQWUsR0FBSSxDQUFBLENBQUEs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QUFuQixDQUFBLEtBQTJCLEtBQUssQ0FBQyxHQUFqQyxJQUNBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFuQixDQUFBLEtBQTZCLEtBQUssQ0FBQyxLQURuQyxJQUVBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFuQixDQUFBLEtBQTRCLEtBQUssQ0FBQyxJQUZsQyxJQUdBLE9BQUEsQ0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWhCLEVBQXVCLEtBQUssQ0FBQyxLQUE3QixFQUFvQyxDQUFwQztNQXJDUyxDQWRYO0tBREY7RUFIUyxDQUFYO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcbmJlZm9yZUVhY2ggLT5cbiAgY29tcGFyZSA9IChhLGIscCkgLT4gTWF0aC5hYnMoYiAtIGEpIDwgKE1hdGgucG93KDEwLCAtcCkgLyAyKVxuXG4gIEBhZGRNYXRjaGVyc1xuICAgIHRvQmVDb21wb25lbnRBcnJheUNsb3NlVG86IChhcnIsIHByZWNpc2lvbj0wKSAtPlxuICAgICAgbm90VGV4dCA9IGlmIEBpc05vdCB0aGVuIFwiIG5vdFwiIGVsc2UgXCJcIlxuICAgICAgdGhpcy5tZXNzYWdlID0gPT4gXCJFeHBlY3RlZCAje2phc21pbmUucHAoQGFjdHVhbCl9IHRvI3tub3RUZXh0fSBiZSBhbiBhcnJheSB3aG9zZSB2YWx1ZXMgYXJlIGNsb3NlIHRvICN7amFzbWluZS5wcChhcnIpfSB3aXRoIGEgcHJlY2lzaW9uIG9mICN7cHJlY2lzaW9ufVwiXG5cbiAgICAgIHJldHVybiBmYWxzZSBpZiBAYWN0dWFsLmxlbmd0aCBpc250IGFyci5sZW5ndGhcblxuICAgICAgQGFjdHVhbC5ldmVyeSAodmFsdWUsaSkgLT4gY29tcGFyZSh2YWx1ZSwgYXJyW2ldLCBwcmVjaXNpb24pXG5cbiAgICB0b0JlVmFsaWQ6IC0+XG4gICAgICBub3RUZXh0ID0gaWYgQGlzTm90IHRoZW4gXCIgbm90XCIgZWxzZSBcIlwiXG4gICAgICB0aGlzLm1lc3NhZ2UgPSA9PiBcIkV4cGVjdGVkICN7amFzbWluZS5wcChAYWN0dWFsKX0gdG8je25vdFRleHR9IGJlIGEgdmFsaWQgY29sb3JcIlxuXG4gICAgICBAYWN0dWFsLmlzVmFsaWQoKVxuXG4gICAgdG9CZUNvbG9yOiAoY29sb3JPclJlZCxncmVlbj0wLGJsdWU9MCxhbHBoYT0xKSAtPlxuICAgICAgY29sb3IgPSBzd2l0Y2ggdHlwZW9mIGNvbG9yT3JSZWRcbiAgICAgICAgd2hlbiAnb2JqZWN0JyB0aGVuIGNvbG9yT3JSZWRcbiAgICAgICAgd2hlbiAnbnVtYmVyJyB0aGVuIHtyZWQ6IGNvbG9yT3JSZWQsIGdyZWVuLCBibHVlLCBhbHBoYX1cbiAgICAgICAgd2hlbiAnc3RyaW5nJ1xuICAgICAgICAgIGNvbG9yT3JSZWQgPSBjb2xvck9yUmVkLnJlcGxhY2UoLyN8MHgvLCAnJylcbiAgICAgICAgICBoZXggPSBwYXJzZUludChjb2xvck9yUmVkLCAxNilcbiAgICAgICAgICBzd2l0Y2ggY29sb3JPclJlZC5sZW5ndGhcbiAgICAgICAgICAgIHdoZW4gOFxuICAgICAgICAgICAgICBhbHBoYSA9IChoZXggPj4gMjQgJiAweGZmKSAvIDI1NVxuICAgICAgICAgICAgICByZWQgPSBoZXggPj4gMTYgJiAweGZmXG4gICAgICAgICAgICAgIGdyZWVuID0gaGV4ID4+IDggJiAweGZmXG4gICAgICAgICAgICAgIGJsdWUgPSBoZXggJiAweGZmXG4gICAgICAgICAgICB3aGVuIDZcbiAgICAgICAgICAgICAgcmVkID0gaGV4ID4+IDE2ICYgMHhmZlxuICAgICAgICAgICAgICBncmVlbiA9IGhleCA+PiA4ICYgMHhmZlxuICAgICAgICAgICAgICBibHVlID0gaGV4ICYgMHhmZlxuICAgICAgICAgICAgd2hlbiAzXG4gICAgICAgICAgICAgIHJlZCA9IChoZXggPj4gOCAmIDB4ZikgKiAxN1xuICAgICAgICAgICAgICBncmVlbiA9IChoZXggPj4gNCAmIDB4ZikgKiAxN1xuICAgICAgICAgICAgICBibHVlID0gKGhleCAmIDB4ZikgKiAxN1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZWQgPSAwXG4gICAgICAgICAgICAgIGdyZWVuID0gMFxuICAgICAgICAgICAgICBibHVlID0gMFxuICAgICAgICAgICAgICBhbHBoYSA9IDFcblxuICAgICAgICAgIHtyZWQsIGdyZWVuLCBibHVlLCBhbHBoYX1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHtyZWQ6IDAsIGdyZWVuOiAwLCBibHVlOiAwLCBhbHBoYTogMX1cblxuICAgICAgbm90VGV4dCA9IGlmIEBpc05vdCB0aGVuIFwiIG5vdFwiIGVsc2UgXCJcIlxuICAgICAgdGhpcy5tZXNzYWdlID0gPT4gXCJFeHBlY3RlZCAje2phc21pbmUucHAoQGFjdHVhbCl9IHRvI3tub3RUZXh0fSBiZSBhIGNvbG9yIGVxdWFsIHRvICN7amFzbWluZS5wcChjb2xvcil9XCJcblxuICAgICAgTWF0aC5yb3VuZChAYWN0dWFsLnJlZCkgaXMgY29sb3IucmVkIGFuZFxuICAgICAgTWF0aC5yb3VuZChAYWN0dWFsLmdyZWVuKSBpcyBjb2xvci5ncmVlbiBhbmRcbiAgICAgIE1hdGgucm91bmQoQGFjdHVhbC5ibHVlKSBpcyBjb2xvci5ibHVlIGFuZFxuICAgICAgY29tcGFyZShAYWN0dWFsLmFscGhhLCBjb2xvci5hbHBoYSwgMSlcbiJdfQ==

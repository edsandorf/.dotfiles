(function() {
  var Color, ColorMarker;

  Color = require('../lib/color');

  ColorMarker = require('../lib/color-marker');

  describe('ColorMarker', function() {
    var colorMarker, editor, jasmineContent, marker, ref;
    ref = [], editor = ref[0], marker = ref[1], colorMarker = ref[2], jasmineContent = ref[3];
    beforeEach(function() {
      var color, colorBuffer, text;
      editor = atom.workspace.buildTextEditor({});
      editor.setText("body {\n  color: hsva(0, 100%, 100%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      marker = editor.markBufferRange([[1, 9], [1, 33]]);
      color = new Color(255, 0, 0, 0.5);
      text = 'hsva(0, 100%, 100%, 0.5)';
      colorBuffer = {
        editor: editor
      };
      return colorMarker = new ColorMarker({
        marker: marker,
        color: color,
        text: text,
        colorBuffer: colorBuffer
      });
    });
    describe('::copyContentAsHex', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHex();
      });
      return it('write the hexadecimal version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("#ff0000");
      });
    });
    describe('::copyContentAsRGB', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsRGB();
      });
      return it('write the rgb version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("rgb(255, 0, 0)");
      });
    });
    describe('::copyContentAsRGBA', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsRGBA();
      });
      return it('write the rgba version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("rgba(255, 0, 0, 0.5)");
      });
    });
    describe('::copyContentAsHSL', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHSL();
      });
      return it('write the hsl version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("hsl(0, 100%, 50%)");
      });
    });
    describe('::copyContentAsHSLA', function() {
      beforeEach(function() {
        return colorMarker.copyContentAsHSLA();
      });
      return it('write the hsla version in the clipboard', function() {
        return expect(atom.clipboard.read()).toEqual("hsla(0, 100%, 50%, 0.5)");
      });
    });
    describe('::convertContentToHex', function() {
      beforeEach(function() {
        return colorMarker.convertContentToHex();
      });
      return it('replaces the text in the editor by the hexadecimal version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: #ff0000;\n  bar: foo;\n  foo: bar;\n}");
      });
    });
    describe('::convertContentToRGBA', function() {
      beforeEach(function() {
        return colorMarker.convertContentToRGBA();
      });
      it('replaces the text in the editor by the rgba version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: rgba(255, 0, 0, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is 1', function() {
        beforeEach(function() {
          colorMarker.color.alpha = 1;
          return colorMarker.convertContentToRGBA();
        });
        return it('replaces the text in the editor by the rgba version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: rgba(255, 0, 0, 1);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    describe('::convertContentToRGB', function() {
      beforeEach(function() {
        colorMarker.color.alpha = 1;
        return colorMarker.convertContentToRGB();
      });
      it('replaces the text in the editor by the rgb version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: rgb(255, 0, 0);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is not 1', function() {
        beforeEach(function() {
          return colorMarker.convertContentToRGB();
        });
        return it('replaces the text in the editor by the rgb version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: rgb(255, 0, 0);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    describe('::convertContentToHSLA', function() {
      beforeEach(function() {
        return colorMarker.convertContentToHSLA();
      });
      it('replaces the text in the editor by the hsla version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: hsla(0, 100%, 50%, 0.5);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is 1', function() {
        beforeEach(function() {
          colorMarker.color.alpha = 1;
          return colorMarker.convertContentToHSLA();
        });
        return it('replaces the text in the editor by the hsla version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: hsla(0, 100%, 50%, 1);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
    return describe('::convertContentToHSL', function() {
      beforeEach(function() {
        colorMarker.color.alpha = 1;
        return colorMarker.convertContentToHSL();
      });
      it('replaces the text in the editor by the hsl version', function() {
        return expect(editor.getText()).toEqual("body {\n  color: hsl(0, 100%, 50%);\n  bar: foo;\n  foo: bar;\n}");
      });
      return describe('when the color alpha is not 1', function() {
        beforeEach(function() {
          return colorMarker.convertContentToHSL();
        });
        return it('replaces the text in the editor by the hsl version', function() {
          return expect(editor.getText()).toEqual("body {\n  color: hsl(0, 100%, 50%);\n  bar: foo;\n  foo: bar;\n}");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL3NwZWMvY29sb3ItbWFya2VyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLGNBQVI7O0VBQ1IsV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFFZCxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxNQUFnRCxFQUFoRCxFQUFDLGVBQUQsRUFBUyxlQUFULEVBQWlCLG9CQUFqQixFQUE4QjtJQUU5QixVQUFBLENBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQStCLEVBQS9CO01BQ1QsTUFBTSxDQUFDLE9BQVAsQ0FBZSx5RUFBZjtNQU9BLE1BQUEsR0FBUyxNQUFNLENBQUMsZUFBUCxDQUF1QixDQUFDLENBQUMsQ0FBRCxFQUFHLENBQUgsQ0FBRCxFQUFPLENBQUMsQ0FBRCxFQUFHLEVBQUgsQ0FBUCxDQUF2QjtNQUNULEtBQUEsR0FBUSxJQUFJLEtBQUosQ0FBVSxHQUFWLEVBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQixHQUFyQjtNQUNSLElBQUEsR0FBTztNQUNQLFdBQUEsR0FBYztRQUFDLFFBQUEsTUFBRDs7YUFFZCxXQUFBLEdBQWMsSUFBSSxXQUFKLENBQWdCO1FBQUMsUUFBQSxNQUFEO1FBQVMsT0FBQSxLQUFUO1FBQWdCLE1BQUEsSUFBaEI7UUFBc0IsYUFBQSxXQUF0QjtPQUFoQjtJQWRMLENBQVg7SUFnQkEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7TUFDN0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxXQUFXLENBQUMsZ0JBQVosQ0FBQTtNQURTLENBQVg7YUFHQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQTtlQUNuRCxNQUFBLENB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QUssQ0FBQyxLQUFsQixHQUEwQjtlQUMxQixXQUFXLENBQUMsbUJBQVosQ0FBQTtNQUZTLENBQVg7TUFJQSxFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQTtlQUN2RCxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsa0VBQWpDO01BRHVELENBQXpEO2FBU0EsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7UUFDeEMsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsV0FBVyxDQUFDLG1CQUFaLENBQUE7UUFEUyxDQUFYO2VBR0EsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUE7aUJBQ3ZELE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxrRUFBakM7UUFEdUQsQ0FBekQ7TUFKd0MsQ0FBMUM7SUFkZ0MsQ0FBbEM7RUFwSnNCLENBQXhCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJDb2xvciA9IHJlcXVpcmUgJy4uL2xpYi9jb2xvcidcbkNvbG9yTWFya2VyID0gcmVxdWlyZSAnLi4vbGliL2NvbG9yLW1hcmtlcidcblxuZGVzY3JpYmUgJ0NvbG9yTWFya2VyJywgLT5cbiAgW2VkaXRvciwgbWFya2VyLCBjb2xvck1hcmtlciwgamFzbWluZUNvbnRlbnRdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgIGVkaXRvci5zZXRUZXh0KFwiXCJcIlxuICAgIGJvZHkge1xuICAgICAgY29sb3I6IGhzdmEoMCwgMTAwJSwgMTAwJSwgMC41KTtcbiAgICAgIGJhcjogZm9vO1xuICAgICAgZm9vOiBiYXI7XG4gICAgfVxuICAgIFwiXCJcIilcbiAgICBtYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlIFtbMSw5XSxbMSwzM11dXG4gICAgY29sb3IgPSBuZXcgQ29sb3IoMjU1LCAwLCAwLCAwLjUpXG4gICAgdGV4dCA9ICdoc3ZhKDAsIDEwMCUsIDEwMCUsIDAuNSknXG4gICAgY29sb3JCdWZmZXIgPSB7ZWRpdG9yfVxuXG4gICAgY29sb3JNYXJrZXIgPSBuZXcgQ29sb3JNYXJrZXIoe21hcmtlciwgY29sb3IsIHRleHQsIGNvbG9yQnVmZmVyfSlcblxuICBkZXNjcmliZSAnOjpjb3B5Q29udGVudEFzSGV4JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvck1hcmtlci5jb3B5Q29udGVudEFzSGV4KClcblxuICAgIGl0ICd3cml0ZSB0aGUgaGV4YWRlY2ltYWwgdmVyc2lvbiBpbiB0aGUgY2xpcGJvYXJkJywgLT5cbiAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwoXCIjZmYwMDAwXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29weUNvbnRlbnRBc1JHQicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29weUNvbnRlbnRBc1JHQigpXG5cbiAgICBpdCAnd3JpdGUgdGhlIHJnYiB2ZXJzaW9uIGluIHRoZSBjbGlwYm9hcmQnLCAtPlxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbChcInJnYigyNTUsIDAsIDApXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29weUNvbnRlbnRBc1JHQkEnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yTWFya2VyLmNvcHlDb250ZW50QXNSR0JBKClcblxuICAgIGl0ICd3cml0ZSB0aGUgcmdiYSB2ZXJzaW9uIGluIHRoZSBjbGlwYm9hcmQnLCAtPlxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbChcInJnYmEoMjU1LCAwLCAwLCAwLjUpXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29weUNvbnRlbnRBc0hTTCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29weUNvbnRlbnRBc0hTTCgpXG5cbiAgICBpdCAnd3JpdGUgdGhlIGhzbCB2ZXJzaW9uIGluIHRoZSBjbGlwYm9hcmQnLCAtPlxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbChcImhzbCgwLCAxMDAlLCA1MCUpXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29weUNvbnRlbnRBc0hTTEEnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yTWFya2VyLmNvcHlDb250ZW50QXNIU0xBKClcblxuICAgIGl0ICd3cml0ZSB0aGUgaHNsYSB2ZXJzaW9uIGluIHRoZSBjbGlwYm9hcmQnLCAtPlxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbChcImhzbGEoMCwgMTAwJSwgNTAlLCAwLjUpXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29udmVydENvbnRlbnRUb0hleCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29udmVydENvbnRlbnRUb0hleCgpXG5cbiAgICBpdCAncmVwbGFjZXMgdGhlIHRleHQgaW4gdGhlIGVkaXRvciBieSB0aGUgaGV4YWRlY2ltYWwgdmVyc2lvbicsIC0+XG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgIGJvZHkge1xuICAgICAgICBjb2xvcjogI2ZmMDAwMDtcbiAgICAgICAgYmFyOiBmb287XG4gICAgICAgIGZvbzogYmFyO1xuICAgICAgfVxuICAgICAgXCJcIlwiKVxuXG4gIGRlc2NyaWJlICc6OmNvbnZlcnRDb250ZW50VG9SR0JBJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvUkdCQSgpXG5cbiAgICBpdCAncmVwbGFjZXMgdGhlIHRleHQgaW4gdGhlIGVkaXRvciBieSB0aGUgcmdiYSB2ZXJzaW9uJywgLT5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwiXCJcIlxuICAgICAgYm9keSB7XG4gICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMCwgMCwgMC41KTtcbiAgICAgICAgYmFyOiBmb287XG4gICAgICAgIGZvbzogYmFyO1xuICAgICAgfVxuICAgICAgXCJcIlwiKVxuXG4gICAgZGVzY3JpYmUgJ3doZW4gdGhlIGNvbG9yIGFscGhhIGlzIDEnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBjb2xvck1hcmtlci5jb2xvci5hbHBoYSA9IDFcbiAgICAgICAgY29sb3JNYXJrZXIuY29udmVydENvbnRlbnRUb1JHQkEoKVxuXG4gICAgICBpdCAncmVwbGFjZXMgdGhlIHRleHQgaW4gdGhlIGVkaXRvciBieSB0aGUgcmdiYSB2ZXJzaW9uJywgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJcIlwiXG4gICAgICAgIGJvZHkge1xuICAgICAgICAgIGNvbG9yOiByZ2JhKDI1NSwgMCwgMCwgMSk7XG4gICAgICAgICAgYmFyOiBmb287XG4gICAgICAgICAgZm9vOiBiYXI7XG4gICAgICAgIH1cbiAgICAgICAgXCJcIlwiKVxuXG4gIGRlc2NyaWJlICc6OmNvbnZlcnRDb250ZW50VG9SR0InLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yTWFya2VyLmNvbG9yLmFscGhhID0gMVxuICAgICAgY29sb3JNYXJrZXIuY29udmVydENvbnRlbnRUb1JHQigpXG5cbiAgICBpdCAncmVwbGFjZXMgdGhlIHRleHQgaW4gdGhlIGVkaXRvciBieSB0aGUgcmdiIHZlcnNpb24nLCAtPlxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJcIlwiXG4gICAgICBib2R5IHtcbiAgICAgICAgY29sb3I6IHJnYigyNTUsIDAsIDApO1xuICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgZm9vOiBiYXI7XG4gICAgICB9XG4gICAgICBcIlwiXCIpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgY29sb3IgYWxwaGEgaXMgbm90IDEnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvUkdCKClcblxuICAgICAgaXQgJ3JlcGxhY2VzIHRoZSB0ZXh0IGluIHRoZSBlZGl0b3IgYnkgdGhlIHJnYiB2ZXJzaW9uJywgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJcIlwiXG4gICAgICAgIGJvZHkge1xuICAgICAgICAgIGNvbG9yOiByZ2IoMjU1LCAwLCAwKTtcbiAgICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgICBmb286IGJhcjtcbiAgICAgICAgfVxuICAgICAgICBcIlwiXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29udmVydENvbnRlbnRUb0hTTEEnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGNvbG9yTWFya2VyLmNvbnZlcnRDb250ZW50VG9IU0xBKClcblxuICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSBoc2xhIHZlcnNpb24nLCAtPlxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJcIlwiXG4gICAgICBib2R5IHtcbiAgICAgICAgY29sb3I6IGhzbGEoMCwgMTAwJSwgNTAlLCAwLjUpO1xuICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgZm9vOiBiYXI7XG4gICAgICB9XG4gICAgICBcIlwiXCIpXG5cbiAgICBkZXNjcmliZSAnd2hlbiB0aGUgY29sb3IgYWxwaGEgaXMgMScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbG9yTWFya2VyLmNvbG9yLmFscGhhID0gMVxuICAgICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvSFNMQSgpXG5cbiAgICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSBoc2xhIHZlcnNpb24nLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgICAgYm9keSB7XG4gICAgICAgICAgY29sb3I6IGhzbGEoMCwgMTAwJSwgNTAlLCAxKTtcbiAgICAgICAgICBiYXI6IGZvbztcbiAgICAgICAgICBmb286IGJhcjtcbiAgICAgICAgfVxuICAgICAgICBcIlwiXCIpXG5cbiAgZGVzY3JpYmUgJzo6Y29udmVydENvbnRlbnRUb0hTTCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgY29sb3JNYXJrZXIuY29sb3IuYWxwaGEgPSAxXG4gICAgICBjb2xvck1hcmtlci5jb252ZXJ0Q29udGVudFRvSFNMKClcblxuICAgIGl0ICdyZXBsYWNlcyB0aGUgdGV4dCBpbiB0aGUgZWRpdG9yIGJ5IHRoZSBoc2wgdmVyc2lvbicsIC0+XG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgIGJvZHkge1xuICAgICAgICBjb2xvcjogaHNsKDAsIDEwMCUsIDUwJSk7XG4gICAgICAgIGJhcjogZm9vO1xuICAgICAgICBmb286IGJhcjtcbiAgICAgIH1cbiAgICAgIFwiXCJcIilcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBjb2xvciBhbHBoYSBpcyBub3QgMScsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGNvbG9yTWFya2VyLmNvbnZlcnRDb250ZW50VG9IU0woKVxuXG4gICAgICBpdCAncmVwbGFjZXMgdGhlIHRleHQgaW4gdGhlIGVkaXRvciBieSB0aGUgaHNsIHZlcnNpb24nLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcIlwiXCJcbiAgICAgICAgYm9keSB7XG4gICAgICAgICAgY29sb3I6IGhzbCgwLCAxMDAlLCA1MCUpO1xuICAgICAgICAgIGJhcjogZm9vO1xuICAgICAgICAgIGZvbzogYmFyO1xuICAgICAgICB9XG4gICAgICAgIFwiXCJcIilcbiJdfQ==

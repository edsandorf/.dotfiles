(function() {
  var Emitter, ExpressionsRegistry, ref, vm,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = [], Emitter = ref[0], vm = ref[1];

  module.exports = ExpressionsRegistry = (function() {
    ExpressionsRegistry.deserialize = function(serializedData, expressionsType) {
      var data, handle, name, ref1, registry;
      if (vm == null) {
        vm = require('vm');
      }
      registry = new ExpressionsRegistry(expressionsType);
      ref1 = serializedData.expressions;
      for (name in ref1) {
        data = ref1[name];
        handle = vm.runInNewContext(data.handle.replace('function', "handle = function"), {
          console: console,
          require: require
        });
        registry.createExpression(name, data.regexpString, data.priority, data.scopes, handle);
      }
      registry.regexpStrings['none'] = serializedData.regexpString;
      return registry;
    };

    function ExpressionsRegistry(expressionsType1) {
      this.expressionsType = expressionsType1;
      if (Emitter == null) {
        Emitter = require('event-kit').Emitter;
      }
      this.colorExpressions = {};
      this.emitter = new Emitter;
      this.regexpStrings = {};
    }

    ExpressionsRegistry.prototype.dispose = function() {
      return this.emitter.dispose();
    };

    ExpressionsRegistry.prototype.onDidAddExpression = function(callback) {
      return this.emitter.on('did-add-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidRemoveExpression = function(callback) {
      return this.emitter.on('did-remove-expression', callback);
    };

    ExpressionsRegistry.prototype.onDidUpdateExpressions = function(callback) {
      return this.emitter.on('did-update-expressions', callback);
    };

    ExpressionsRegistry.prototype.getExpressions = function() {
      var e, k;
      return ((function() {
        var ref1, results;
        ref1 = this.colorExpressions;
        results = [];
        for (k in ref1) {
          e = ref1[k];
          results.push(e);
        }
        return results;
      }).call(this)).sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

    ExpressionsRegistry.prototype.getExpressionsForScope = function(scope) {
      var expressions, matchScope;
      expressions = this.getExpressions();
      if (scope === '*') {
        return expressions;
      }
      matchScope = function(a) {
        return function(b) {
          var aa, ab, ba, bb, ref1, ref2;
          ref1 = a.split(':'), aa = ref1[0], ab = ref1[1];
          ref2 = b.split(':'), ba = ref2[0], bb = ref2[1];
          return aa === ba && ((ab == null) || (bb == null) || ab === bb);
        };
      };
      return expressions.filter(function(e) {
        return indexOf.call(e.scopes, '*') >= 0 || e.scopes.some(matchScope(scope));
      });
    };

    ExpressionsRegistry.prototype.getExpression = function(name) {
      return this.colorExpressions[name];
    };

    ExpressionsRegistry.prototype.getRegExp = function() {
      var base;
      return (base = this.regexpStrings)['none'] != null ? base['none'] : base['none'] = this.getExpressions().map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.getRegExpForScope = function(scope) {
      var base;
      return (base = this.regexpStrings)[scope] != null ? base[scope] : base[scope] = this.getExpressionsForScope(scope).map(function(e) {
        return "(" + e.regexpString + ")";
      }).join('|');
    };

    ExpressionsRegistry.prototype.createExpression = function(name, regexpString, priority, scopes, handle) {
      var newExpression;
      if (priority == null) {
        priority = 0;
      }
      if (scopes == null) {
        scopes = ['*'];
      }
      if (typeof priority === 'function') {
        handle = priority;
        scopes = ['*'];
        priority = 0;
      } else if (typeof priority === 'object') {
        if (typeof scopes === 'function') {
          handle = scopes;
        }
        scopes = priority;
        priority = 0;
      }
      if (!(scopes.length === 1 && scopes[0] === '*')) {
        scopes.push('pigments');
      }
      newExpression = new this.expressionsType({
        name: name,
        regexpString: regexpString,
        scopes: scopes,
        priority: priority,
        handle: handle
      });
      return this.addExpression(newExpression);
    };

    ExpressionsRegistry.prototype.addExpression = function(expression, batch) {
      if (batch == null) {
        batch = false;
      }
      this.regexpStrings = {};
      this.colorExpressions[expression.name] = expression;
      if (!batch) {
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
        this.emitter.emit('did-update-expressions', {
          name: expression.name,
          registry: this
        });
      }
      return expression;
    };

    ExpressionsRegistry.prototype.createExpressions = function(expressions) {
      return this.addExpressions(expressions.map((function(_this) {
        return function(e) {
          var expression, handle, name, priority, regexpString, scopes;
          name = e.name, regexpString = e.regexpString, handle = e.handle, priority = e.priority, scopes = e.scopes;
          if (priority == null) {
            priority = 0;
          }
          expression = new _this.expressionsType({
            name: name,
            regexpString: regexpString,
            scopes: scopes,
            handle: handle
          });
          expression.priority = priority;
          return expression;
        };
      })(this)));
    };

    ExpressionsRegistry.prototype.addExpressions = function(expressions) {
      var expression, i, len;
      for (i = 0, len = expressions.length; i < len; i++) {
        expression = expressions[i];
        this.addExpression(expression, true);
        this.emitter.emit('did-add-expression', {
          name: expression.name,
          registry: this
        });
      }
      return this.emitter.emit('did-update-expressions', {
        registry: this
      });
    };

    ExpressionsRegistry.prototype.removeExpression = function(name) {
      delete this.colorExpressions[name];
      this.regexpStrings = {};
      this.emitter.emit('did-remove-expression', {
        name: name,
        registry: this
      });
      return this.emitter.emit('did-update-expressions', {
        name: name,
        registry: this
      });
    };

    ExpressionsRegistry.prototype.serialize = function() {
      var expression, key, out, ref1, ref2;
      out = {
        regexpString: this.getRegExp(),
        expressions: {}
      };
      ref1 = this.colorExpressions;
      for (key in ref1) {
        expression = ref1[key];
        out.expressions[key] = {
          name: expression.name,
          regexpString: expression.regexpString,
          priority: expression.priority,
          scopes: expression.scopes,
          handle: (ref2 = expression.handle) != null ? ref2.toString() : void 0
        };
      }
      return out;
    };

    return ExpressionsRegistry;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9leHByZXNzaW9ucy1yZWdpc3RyeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7O0VBQUEsTUFBZ0IsRUFBaEIsRUFBQyxnQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDSixtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLGNBQUQsRUFBaUIsZUFBakI7QUFDWixVQUFBOztRQUFBLEtBQU0sT0FBQSxDQUFRLElBQVI7O01BRU4sUUFBQSxHQUFXLElBQUksbUJBQUosQ0FBd0IsZUFBeEI7QUFFWDtBQUFBLFdBQUEsWUFBQTs7UUFDRSxNQUFBLEdBQVMsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLFVBQXBCLEVBQWdDLG1CQUFoQyxDQUFuQixFQUF5RTtVQUFDLFNBQUEsT0FBRDtVQUFVLFNBQUEsT0FBVjtTQUF6RTtRQUNULFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixJQUExQixFQUFnQyxJQUFJLENBQUMsWUFBckMsRUFBbUQsSUFBSSxDQUFDLFFBQXhELEVBQWtFLElBQUksQ0FBQyxNQUF2RSxFQUErRSxNQUEvRTtBQUZGO01BSUEsUUFBUSxDQUFDLGFBQWMsQ0FBQSxNQUFBLENBQXZCLEdBQWlDLGNBQWMsQ0FBQzthQUVoRDtJQVhZOztJQWNELDZCQUFDLGdCQUFEO01BQUMsSUFBQyxDQUFBLGtCQUFEOztRQUNaLFVBQVcsT0FBQSxDQUFRLFdBQVIsQ0FBb0IsQ0FBQzs7TUFFaEMsSUFBQyxDQUFBLGdCQUFELEdBQW9CO01BQ3BCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBTE47O2tDQU9iLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLE9BQU8s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QUFVLENBQUMsSUFBakI7VUFDQSxZQUFBLEVBQWMsVUFBVSxDQUFDLFlBRHpCO1VBRUEsUUFBQSxFQUFVLFVBQVUsQ0FBQyxRQUZyQjtVQUdBLE1BQUEsRUFBUSxVQUFVLENBQUMsTUFIbkI7VUFJQSxNQUFBLDJDQUF5QixDQUFFLFFBQW5CLENBQUEsVUFKUjs7QUFGSjthQVFBO0lBYlM7Ozs7O0FBNUdiIiwic291cmNlc0NvbnRlbnQiOlsiW0VtaXR0ZXIsIHZtXSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEV4cHJlc3Npb25zUmVnaXN0cnlcbiAgQGRlc2VyaWFsaXplOiAoc2VyaWFsaXplZERhdGEsIGV4cHJlc3Npb25zVHlwZSkgLT5cbiAgICB2bSA/PSByZXF1aXJlICd2bSdcblxuICAgIHJlZ2lzdHJ5ID0gbmV3IEV4cHJlc3Npb25zUmVnaXN0cnkoZXhwcmVzc2lvbnNUeXBlKVxuXG4gICAgZm9yIG5hbWUsIGRhdGEgb2Ygc2VyaWFsaXplZERhdGEuZXhwcmVzc2lvbnNcbiAgICAgIGhhbmRsZSA9IHZtLnJ1bkluTmV3Q29udGV4dChkYXRhLmhhbmRsZS5yZXBsYWNlKCdmdW5jdGlvbicsIFwiaGFuZGxlID0gZnVuY3Rpb25cIiksIHtjb25zb2xlLCByZXF1aXJlfSlcbiAgICAgIHJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24obmFtZSwgZGF0YS5yZWdleHBTdHJpbmcsIGRhdGEucHJpb3JpdHksIGRhdGEuc2NvcGVzLCBoYW5kbGUpXG5cbiAgICByZWdpc3RyeS5yZWdleHBTdHJpbmdzWydub25lJ10gPSBzZXJpYWxpemVkRGF0YS5yZWdleHBTdHJpbmdcblxuICAgIHJlZ2lzdHJ5XG5cbiAgIyBUaGUge09iamVjdH0gd2hlcmUgY29sb3IgZXhwcmVzc2lvbiBoYW5kbGVycyBhcmUgc3RvcmVkXG4gIGNvbnN0cnVjdG9yOiAoQGV4cHJlc3Npb25zVHlwZSkgLT5cbiAgICBFbWl0dGVyID89IHJlcXVpcmUoJ2V2ZW50LWtpdCcpLkVtaXR0ZXJcblxuICAgIEBjb2xvckV4cHJlc3Npb25zID0ge31cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHJlZ2V4cFN0cmluZ3MgPSB7fVxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG5cbiAgb25EaWRBZGRFeHByZXNzaW9uOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1hZGQtZXhwcmVzc2lvbicsIGNhbGxiYWNrXG5cbiAgb25EaWRSZW1vdmVFeHByZXNzaW9uOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1yZW1vdmUtZXhwcmVzc2lvbicsIGNhbGxiYWNrXG5cbiAgb25EaWRVcGRhdGVFeHByZXNzaW9uczogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywgY2FsbGJhY2tcblxuICBnZXRFeHByZXNzaW9uczogLT5cbiAgICAoZSBmb3IgayxlIG9mIEBjb2xvckV4cHJlc3Npb25zKS5zb3J0KChhLGIpIC0+IGIucHJpb3JpdHkgLSBhLnByaW9yaXR5KVxuXG4gIGdldEV4cHJlc3Npb25zRm9yU2NvcGU6IChzY29wZSkgLT5cbiAgICBleHByZXNzaW9ucyA9IEBnZXRFeHByZXNzaW9ucygpXG5cbiAgICByZXR1cm4gZXhwcmVzc2lvbnMgaWYgc2NvcGUgaXMgJyonXG5cbiAgICBtYXRjaFNjb3BlID0gKGEpIC0+IChiKSAtPlxuICAgICAgW2FhLCBhYl0gPSBhLnNwbGl0KCc6JylcbiAgICAgIFtiYSwgYmJdID0gYi5zcGxpdCgnOicpXG5cbiAgICAgIGFhIGlzIGJhIGFuZCAobm90IGFiPyBvciBub3QgYmI/IG9yIGFiIGlzIGJiKVxuXG4gICAgZXhwcmVzc2lvbnMuZmlsdGVyIChlKSAtPlxuICAgICAgJyonIGluIGUuc2NvcGVzIG9yIGUuc2NvcGVzLnNvbWUobWF0Y2hTY29wZShzY29wZSkpXG5cbiAgZ2V0RXhwcmVzc2lvbjogKG5hbWUpIC0+IEBjb2xvckV4cHJlc3Npb25zW25hbWVdXG5cbiAgZ2V0UmVnRXhwOiAtPlxuICAgIEByZWdleHBTdHJpbmdzWydub25lJ10gPz0gQGdldEV4cHJlc3Npb25zKCkubWFwKChlKSAtPlxuICAgICAgXCIoI3tlLnJlZ2V4cFN0cmluZ30pXCIpLmpvaW4oJ3wnKVxuXG4gIGdldFJlZ0V4cEZvclNjb3BlOiAoc2NvcGUpIC0+XG4gICAgQHJlZ2V4cFN0cmluZ3Nbc2NvcGVdID89IEBnZXRFeHByZXNzaW9uc0ZvclNjb3BlKHNjb3BlKS5tYXAoKGUpIC0+XG4gICAgICBcIigje2UucmVnZXhwU3RyaW5nfSlcIikuam9pbignfCcpXG5cbiAgY3JlYXRlRXhwcmVzc2lvbjogKG5hbWUsIHJlZ2V4cFN0cmluZywgcHJpb3JpdHk9MCwgc2NvcGVzPVsnKiddLCBoYW5kbGUpIC0+XG4gICAgaWYgdHlwZW9mIHByaW9yaXR5IGlzICdmdW5jdGlvbidcbiAgICAgIGhhbmRsZSA9IHByaW9yaXR5XG4gICAgICBzY29wZXMgPSBbJyonXVxuICAgICAgcHJpb3JpdHkgPSAwXG4gICAgZWxzZSBpZiB0eXBlb2YgcHJpb3JpdHkgaXMgJ29iamVjdCdcbiAgICAgIGhhbmRsZSA9IHNjb3BlcyBpZiB0eXBlb2Ygc2NvcGVzIGlzICdmdW5jdGlvbidcbiAgICAgIHNjb3BlcyA9IHByaW9yaXR5XG4gICAgICBwcmlvcml0eSA9IDBcblxuICAgIHNjb3Blcy5wdXNoKCdwaWdtZW50cycpIHVubGVzcyBzY29wZXMubGVuZ3RoIGlzIDEgYW5kIHNjb3Blc1swXSBpcyAnKidcblxuICAgIG5ld0V4cHJlc3Npb24gPSBuZXcgQGV4cHJlc3Npb25zVHlwZSh7bmFtZSwgcmVnZXhwU3RyaW5nLCBzY29wZXMsIHByaW9yaXR5LCBoYW5kbGV9KVxuICAgIEBhZGRFeHByZXNzaW9uIG5ld0V4cHJlc3Npb25cblxuICBhZGRFeHByZXNzaW9uOiAoZXhwcmVzc2lvbiwgYmF0Y2g9ZmFsc2UpIC0+XG4gICAgQHJlZ2V4cFN0cmluZ3MgPSB7fVxuICAgIEBjb2xvckV4cHJlc3Npb25zW2V4cHJlc3Npb24ubmFtZV0gPSBleHByZXNzaW9uXG5cbiAgICB1bmxlc3MgYmF0Y2hcbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtZXhwcmVzc2lvbicsIHtuYW1lOiBleHByZXNzaW9uLm5hbWUsIHJlZ2lzdHJ5OiB0aGlzfVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZS1leHByZXNzaW9ucycsIHtuYW1lOiBleHByZXNzaW9uLm5hbWUsIHJlZ2lzdHJ5OiB0aGlzfVxuICAgIGV4cHJlc3Npb25cblxuICBjcmVhdGVFeHByZXNzaW9uczogKGV4cHJlc3Npb25zKSAtPlxuICAgIEBhZGRFeHByZXNzaW9ucyBleHByZXNzaW9ucy5tYXAgKGUpID0+XG4gICAgICB7bmFtZSwgcmVnZXhwU3RyaW5nLCBoYW5kbGUsIHByaW9yaXR5LCBzY29wZXN9ID0gZVxuICAgICAgcHJpb3JpdHkgPz0gMFxuICAgICAgZXhwcmVzc2lvbiA9IG5ldyBAZXhwcmVzc2lvbnNUeXBlKHtuYW1lLCByZWdleHBTdHJpbmcsIHNjb3BlcywgaGFuZGxlfSlcbiAgICAgIGV4cHJlc3Npb24ucHJpb3JpdHkgPSBwcmlvcml0eVxuICAgICAgZXhwcmVzc2lvblxuXG4gIGFkZEV4cHJlc3Npb25zOiAoZXhwcmVzc2lvbnMpIC0+XG4gICAgZm9yIGV4cHJlc3Npb24gaW4gZXhwcmVzc2lvbnNcbiAgICAgIEBhZGRFeHByZXNzaW9uKGV4cHJlc3Npb24sIHRydWUpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWRkLWV4cHJlc3Npb24nLCB7bmFtZTogZXhwcmVzc2lvbi5uYW1lLCByZWdpc3RyeTogdGhpc31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtdXBkYXRlLWV4cHJlc3Npb25zJywge3JlZ2lzdHJ5OiB0aGlzfVxuXG4gIHJlbW92ZUV4cHJlc3Npb246IChuYW1lKSAtPlxuICAgIGRlbGV0ZSBAY29sb3JFeHByZXNzaW9uc1tuYW1lXVxuICAgIEByZWdleHBTdHJpbmdzID0ge31cbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtcmVtb3ZlLWV4cHJlc3Npb24nLCB7bmFtZSwgcmVnaXN0cnk6IHRoaXN9XG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZS1leHByZXNzaW9ucycsIHtuYW1lLCByZWdpc3RyeTogdGhpc31cblxuICBzZXJpYWxpemU6IC0+XG4gICAgb3V0ID1cbiAgICAgIHJlZ2V4cFN0cmluZzogQGdldFJlZ0V4cCgpXG4gICAgICBleHByZXNzaW9uczoge31cblxuICAgIGZvciBrZXksIGV4cHJlc3Npb24gb2YgQGNvbG9yRXhwcmVzc2lvbnNcbiAgICAgIG91dC5leHByZXNzaW9uc1trZXldID1cbiAgICAgICAgbmFtZTogZXhwcmVzc2lvbi5uYW1lXG4gICAgICAgIHJlZ2V4cFN0cmluZzogZXhwcmVzc2lvbi5yZWdleHBTdHJpbmdcbiAgICAgICAgcHJpb3JpdHk6IGV4cHJlc3Npb24ucHJpb3JpdHlcbiAgICAgICAgc2NvcGVzOiBleHByZXNzaW9uLnNjb3Blc1xuICAgICAgICBoYW5kbGU6IGV4cHJlc3Npb24uaGFuZGxlPy50b1N0cmluZygpXG5cbiAgICBvdXRcbiJdfQ==

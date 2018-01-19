'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, QueryPartDef, QueryPart;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function functionRenderer(part, innerExpr) {
    var str = part.def.type + '(';
    var parameters = _.map(part.params, function (value, index) {
      var paramType = part.def.params[index];
      if (paramType.type === 'time') {
        if (value === 'auto') {
          value = '$__interval';
        }
      }
      if (paramType.quote === 'single') {
        return "'" + value + "'";
      } else if (paramType.quote === 'double') {
        return '"' + value + '"';
      }

      return value;
    });

    if (innerExpr) {
      parameters.unshift(innerExpr);
    }
    return str + parameters.join(', ') + ')';
  }

  _export('functionRenderer', functionRenderer);

  function suffixRenderer(part, innerExpr) {
    return innerExpr + ' ' + part.params[0];
  }

  _export('suffixRenderer', suffixRenderer);

  function identityRenderer(part, innerExpr) {
    return part.params[0];
  }

  _export('identityRenderer', identityRenderer);

  function quotedIdentityRenderer(part, innerExpr) {
    return '"' + part.params[0] + '"';
  }

  _export('quotedIdentityRenderer', quotedIdentityRenderer);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('QueryPartDef', QueryPartDef = function QueryPartDef(options) {
        _classCallCheck(this, QueryPartDef);

        this.type = options.type;
        this.params = options.params;
        this.defaultParams = options.defaultParams;
        this.renderer = options.renderer;
        this.category = options.category;
        this.addStrategy = options.addStrategy;
      });

      _export('QueryPartDef', QueryPartDef);

      _export('QueryPart', QueryPart = function () {
        function QueryPart(part, def) {
          _classCallCheck(this, QueryPart);

          this.part = part;
          this.def = def;
          if (!this.def) {
            throw { message: 'Could not find query part ' + part.type };
          }

          part.params = part.params || _.clone(this.def.defaultParams);
          this.params = part.params;
          this.updateText();
        }

        _createClass(QueryPart, [{
          key: 'render',
          value: function render(innerExpr) {
            return this.def.renderer(this, innerExpr);
          }
        }, {
          key: 'hasMultipleParamsInString',
          value: function hasMultipleParamsInString(strValue, index) {
            if (strValue.indexOf(',') === -1) {
              return false;
            }

            return this.def.params[index + 1] && this.def.params[index + 1].optional;
          }
        }, {
          key: 'updateParam',
          value: function updateParam(strValue, index) {
            var _this = this;

            // handle optional parameters
            // if string contains ',' and next param is optional, split and update both
            if (this.hasMultipleParamsInString(strValue, index)) {
              _.each(strValue.split(','), function (partVal, idx) {
                _this.updateParam(partVal.trim(), idx);
              });
              return;
            }

            if (strValue === '' && this.def.params[index].optional) {
              this.params.splice(index, 1);
            } else {
              this.params[index] = strValue;
            }

            this.part.params = this.params;
            this.updateText();
          }
        }, {
          key: 'updateText',
          value: function updateText() {
            if (this.params.length === 0) {
              this.text = this.def.type + '()';
              return;
            }

            var text = this.def.type + '(';
            text += this.params.join(', ');
            text += ')';
            this.text = text;
          }
        }]);

        return QueryPart;
      }());

      _export('QueryPart', QueryPart);
    }
  };
});
//# sourceMappingURL=query_part_helpers.js.map

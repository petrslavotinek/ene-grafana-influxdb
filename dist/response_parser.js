'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, ResponseParser;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function addUnique(arr, value) {
    arr[value] = value;
  }
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

      ResponseParser = function () {
        function ResponseParser() {
          _classCallCheck(this, ResponseParser);
        }

        _createClass(ResponseParser, [{
          key: 'parse',
          value: function parse(query, results) {
            if (!results || results.results.length === 0) {
              return [];
            }

            var influxResults = results.results[0];
            if (!influxResults.series) {
              return [];
            }

            var influxdb11format = query.toLowerCase().indexOf('show tag values') >= 0;

            var res = {};
            _.each(influxResults.series, function (serie) {
              _.each(serie.values, function (value) {
                if (_.isArray(value)) {
                  if (influxdb11format) {
                    addUnique(res, value[1] || value[0]);
                  } else {
                    addUnique(res, value[0]);
                  }
                } else {
                  addUnique(res, value);
                }
              });
            });

            return _.map(res, function (value) {
              return { text: value };
            });
          }
        }]);

        return ResponseParser;
      }();

      _export('default', ResponseParser);
    }
  };
});
//# sourceMappingURL=response_parser.js.map

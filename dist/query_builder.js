'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, EneInfluxQueryBuilder;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function renderTagCondition(tag, index) {
    var str = "";
    var operator = tag.operator;
    var value = tag.value;
    if (index > 0) {
      str = (tag.condition || 'AND') + ' ';
    }

    if (!operator) {
      if (/^\/.*\/$/.test(tag.value)) {
        operator = '=~';
      } else {
        operator = '=';
      }
    }

    // quote value unless regex or number
    if (operator !== '=~' && operator !== '!~' && isNaN(+value)) {
      value = "'" + value + "'";
    }

    return str + '"' + tag.key + '" ' + operator + ' ' + value;
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

      _export('EneInfluxQueryBuilder', EneInfluxQueryBuilder = function () {
        function EneInfluxQueryBuilder(target, database) {
          _classCallCheck(this, EneInfluxQueryBuilder);

          this.target = target;
          this.database = database;
        }

        _createClass(EneInfluxQueryBuilder, [{
          key: 'build',
          value: function build() {
            return this.target.rawQuery ? this._modifyRawQuery() : this._buildQuery();
          }
        }, {
          key: 'buildExploreQuery',
          value: function buildExploreQuery(type, withKey, withMeasurementFilter) {
            var query;
            var measurement;

            if (type === 'TAG_KEYS') {
              query = 'SHOW TAG KEYS';
              measurement = this.target.measurement;
            } else if (type === 'TAG_VALUES') {
              query = 'SHOW TAG VALUES';
              measurement = this.target.measurement;
            } else if (type === 'MEASUREMENTS') {
              query = 'SHOW MEASUREMENTS';
              if (withMeasurementFilter) {
                query += ' WITH MEASUREMENT =~ /' + withMeasurementFilter + '/';
              }
            } else if (type === 'FIELDS') {
              query = 'SHOW FIELD KEYS FROM "' + this.target.measurement + '"';
              return query;
            } else if (type === 'RETENTION POLICIES') {
              query = 'SHOW RETENTION POLICIES on "' + this.database + '"';
              return query;
            }

            if (measurement) {
              if (!measurement.match('^/.*/') && !measurement.match(/^merge\(.*\)/)) {
                measurement = '"' + measurement + '"';
              }
              query += ' FROM ' + measurement;
            }

            if (withKey) {
              query += ' WITH KEY = "' + withKey + '"';
            }

            if (this.target.tags && this.target.tags.length > 0) {
              var whereConditions = _.reduce(this.target.tags, function (memo, tag) {
                // do not add a condition for the key we want to explore for
                if (tag.key === withKey) {
                  return memo;
                }
                memo.push(renderTagCondition(tag, memo.length));
                return memo;
              }, []);

              if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' ');
              }
            }

            return query;
          }
        }]);

        return EneInfluxQueryBuilder;
      }());

      _export('EneInfluxQueryBuilder', EneInfluxQueryBuilder);
    }
  };
});
//# sourceMappingURL=query_builder.js.map

'use strict';

System.register(['lodash', './query_part', 'app/core/utils/kbn'], function (_export, _context) {
  "use strict";

  var _, queryPart, kbn, _createClass, EneInfluxQuery;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_query_part) {
      queryPart = _query_part.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
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

      EneInfluxQuery = function () {

        /** @ngInject */
        function EneInfluxQuery(target, templateSrv, scopedVars) {
          _classCallCheck(this, EneInfluxQuery);

          this.target = target;
          this.templateSrv = templateSrv;
          this.scopedVars = scopedVars;

          target.policy = target.policy || 'default';
          target.dsType = 'influxdb';
          target.resultFormat = target.resultFormat || 'time_series';
          target.tags = target.tags || [];
          target.groupBy = target.groupBy || [{ type: 'time', params: ['$interval'] }, { type: 'fill', params: ['null'] }];
          target.select = target.select || [[{ type: 'field', params: ['value'] }, { type: 'mean', params: [] }]];

          this.updateProjection();
        }

        _createClass(EneInfluxQuery, [{
          key: 'updateProjection',
          value: function updateProjection() {
            this.selectModels = _.map(this.target.select, function (parts) {
              return _.map(parts, queryPart.create);
            });
            this.groupByParts = _.map(this.target.groupBy, queryPart.create);
          }
        }, {
          key: 'updatePersistedParts',
          value: function updatePersistedParts() {
            this.target.select = _.map(this.selectModels, function (selectParts) {
              return _.map(selectParts, function (part) {
                return { type: part.def.type, params: part.params };
              });
            });
          }
        }, {
          key: 'hasGroupByTime',
          value: function hasGroupByTime() {
            return _.find(this.target.groupBy, function (g) {
              return g.type === 'time';
            });
          }
        }, {
          key: 'hasFill',
          value: function hasFill() {
            return _.find(this.target.groupBy, function (g) {
              return g.type === 'fill';
            });
          }
        }, {
          key: 'addGroupBy',
          value: function addGroupBy(value) {
            var stringParts = value.match(/^(\w+)\((.*)\)$/);
            var typePart = stringParts[1];
            var arg = stringParts[2];
            var partModel = queryPart.create({ type: typePart, params: [arg] });
            var partCount = this.target.groupBy.length;

            if (partCount === 0) {
              this.target.groupBy.push(partModel.part);
            } else if (typePart === 'time') {
              this.target.groupBy.splice(0, 0, partModel.part);
            } else if (typePart === 'tag') {
              if (this.target.groupBy[partCount - 1].type === 'fill') {
                this.target.groupBy.splice(partCount - 1, 0, partModel.part);
              } else {
                this.target.groupBy.push(partModel.part);
              }
            } else {
              this.target.groupBy.push(partModel.part);
            }

            this.updateProjection();
          }
        }, {
          key: 'removeGroupByPart',
          value: function removeGroupByPart(part, index) {
            var categories = queryPart.getCategories();

            if (part.def.type === 'time') {
              // remove fill
              this.target.groupBy = _.filter(this.target.groupBy, function (g) {
                return g.type !== 'fill';
              });
              // remove aggregations
              this.target.select = _.map(this.target.select, function (s) {
                return _.filter(s, function (part) {
                  var partModel = queryPart.create(part);
                  if (partModel.def.category === categories.Aggregations) {
                    return false;
                  }
                  if (partModel.def.category === categories.Selectors) {
                    return false;
                  }
                  return true;
                });
              });
            }

            this.target.groupBy.splice(index, 1);
            this.updateProjection();
          }
        }, {
          key: 'removeSelect',
          value: function removeSelect(index) {
            this.target.select.splice(index, 1);
            this.updateProjection();
          }
        }, {
          key: 'removeSelectPart',
          value: function removeSelectPart(selectParts, part) {
            // if we remove the field remove the whole statement
            if (part.def.type === 'field') {
              if (this.selectModels.length > 1) {
                var modelsIndex = _.indexOf(this.selectModels, selectParts);
                this.selectModels.splice(modelsIndex, 1);
              }
            } else {
              var partIndex = _.indexOf(selectParts, part);
              selectParts.splice(partIndex, 1);
            }

            this.updatePersistedParts();
          }
        }, {
          key: 'addSelectPart',
          value: function addSelectPart(selectParts, type) {
            var partModel = queryPart.create({ type: type });
            partModel.def.addStrategy(selectParts, partModel, this);
            this.updatePersistedParts();
          }
        }, {
          key: 'renderTagCondition',
          value: function renderTagCondition(tag, index, interpolate) {
            var str = "";
            var operator = tag.operator;
            var value = tag.value;
            if (index > 0) {
              str = (tag.condition || 'AND') + ' ';
            }

            if (!operator) {
              if (/^\/.*\/$/.test(value)) {
                operator = '=~';
              } else {
                operator = '=';
              }
            }

            // quote value unless regex
            if (operator !== '=~' && operator !== '!~') {
              if (interpolate) {
                value = this.templateSrv.replace(value, this.scopedVars);
              }
              if (operator !== '>' && operator !== '<') {
                value = "'" + value.replace(/\\/g, '\\\\') + "'";
              }
            } else if (interpolate) {
              value = this.templateSrv.replace(value, this.scopedVars, 'regex');
            }

            return str + '"' + tag.key + '" ' + operator + ' ' + value;
          }
        }, {
          key: 'getMeasurementAndPolicy',
          value: function getMeasurementAndPolicy(interpolate) {
            var policy = this.target.policy;
            var measurement = this.target.measurement || 'measurement';

            if (!measurement.match('^/.*/')) {
              measurement = '"' + measurement + '"';
            } else if (interpolate) {
              measurement = this.templateSrv.replace(measurement, this.scopedVars, 'regex');
            }

            if (policy !== 'default') {
              policy = '"' + this.target.policy + '".';
            } else {
              policy = "";
            }

            return policy + measurement;
          }
        }, {
          key: 'interpolateQueryStr',
          value: function interpolateQueryStr(value, variable, defaultFormatFn) {
            // if no multi or include all do not regexEscape
            if (!variable.multi && !variable.includeAll) {
              return value;
            }

            if (typeof value === 'string') {
              return kbn.regexEscape(value);
            }

            var escapedValues = _.map(value, kbn.regexEscape);
            return escapedValues.join('|');
          }
        }, {
          key: 'render',
          value: function render(interpolate) {
            var _this = this;

            var target = this.target;

            if (target.rawQuery) {
              if (interpolate) {
                return this.templateSrv.replace(target.query, this.scopedVars, this.interpolateQueryStr);
              } else {
                return target.query;
              }
            }

            var query = 'SELECT ';
            var i, y;
            for (i = 0; i < this.selectModels.length; i++) {
              var parts = this.selectModels[i];
              var selectText = "";
              for (y = 0; y < parts.length; y++) {
                var _part = parts[y];
                selectText = _part.render(selectText);
              }

              if (i > 0) {
                query += ', ';
              }
              query += selectText;
            }

            query += ' FROM ' + this.getMeasurementAndPolicy(interpolate) + ' WHERE ';
            var conditions = _.map(target.tags, function (tag, index) {
              return _this.renderTagCondition(tag, index, interpolate);
            });

            query += conditions.join(' ');
            query += (conditions.length > 0 ? ' AND ' : '') + '$timeFilter';

            var groupBySection = "";
            for (i = 0; i < this.groupByParts.length; i++) {
              var part = this.groupByParts[i];
              if (i > 0) {
                // for some reason fill has no seperator
                groupBySection += part.def.type === 'fill' ? ' ' : ', ';
              }
              groupBySection += part.render('');
            }

            if (groupBySection.length) {
              query += ' GROUP BY ' + groupBySection;
            }

            if (target.fill) {
              query += ' fill(' + target.fill + ')';
            }

            return query;
          }
        }, {
          key: 'renderAdhocFilters',
          value: function renderAdhocFilters(filters) {
            var _this2 = this;

            var conditions = _.map(filters, function (tag, index) {
              return _this2.renderTagCondition(tag, index, false);
            });
            return conditions.join(' ');
          }
        }]);

        return EneInfluxQuery;
      }();

      _export('default', EneInfluxQuery);
    }
  };
});
//# sourceMappingURL=influx_query.js.map

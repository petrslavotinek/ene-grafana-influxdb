'use strict';

System.register(['lodash', 'app/core/table_model'], function (_export, _context) {
  "use strict";

  var _, TableModel, _createClass, InfluxSeries;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreTable_model) {
      TableModel = _appCoreTable_model.default;
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

      InfluxSeries = function () {
        function InfluxSeries(options) {
          _classCallCheck(this, InfluxSeries);

          this.series = options.series;
          this.alias = options.alias;
          this.annotation = options.annotation;
        }

        _createClass(InfluxSeries, [{
          key: 'getTimeSeries',
          value: function getTimeSeries() {
            var _this = this;

            var output = [];
            var i, j;

            if (this.series.length === 0) {
              return output;
            }

            _.each(this.series, function (series) {
              var columns = series.columns.length;
              var tags = _.map(series.tags, function (value, key) {
                return key + ': ' + value;
              });

              for (j = 1; j < columns; j++) {
                var seriesName = series.name;
                var columnName = series.columns[j];
                if (columnName !== 'value') {
                  seriesName = seriesName + '.' + columnName;
                }

                if (_this.alias) {
                  seriesName = _this._getSeriesName(series, j);
                } else if (series.tags) {
                  seriesName = seriesName + ' {' + tags.join(', ') + '}';
                }

                var datapoints = [];
                if (series.values) {
                  for (i = 0; i < series.values.length; i++) {
                    datapoints[i] = [series.values[i][j], series.values[i][0]];
                  }
                }

                output.push({ target: seriesName, datapoints: datapoints });
              }
            });

            return output;
          }
        }, {
          key: '_getSeriesName',
          value: function _getSeriesName(series, index) {
            var regex = /\$(\w+)|\[\[([\s\S]+?)\]\]/g;
            var segments = series.name.split('.');

            return this.alias.replace(regex, function (match, g1, g2) {
              var group = g1 || g2;
              var segIndex = parseInt(group, 10);

              if (group === 'm' || group === 'measurement') {
                return series.name;
              }
              if (group === 'col') {
                return series.columns[index];
              }
              if (!isNaN(segIndex)) {
                return segments[segIndex];
              }
              if (group.indexOf('tag_') !== 0) {
                return match;
              }

              var tag = group.replace('tag_', '');
              if (!series.tags) {
                return match;
              }
              return series.tags[tag];
            });
          }
        }, {
          key: 'getAnnotations',
          value: function getAnnotations() {
            var _this2 = this;

            var list = [];

            _.each(this.series, function (series) {
              var titleCol = null;
              var timeCol = null;
              var tagsCol = [];
              var textCol = null;

              _.each(series.columns, function (column, index) {
                if (column === 'time') {
                  timeCol = index;
                  return;
                }
                if (column === 'sequence_number') {
                  return;
                }
                if (!titleCol) {
                  titleCol = index;
                }
                if (column === _this2.annotation.titleColumn) {
                  titleCol = index;
                  return;
                }
                if (_.includes((_this2.annotation.tagsColumn || '').replace(' ', '').split(','), column)) {
                  tagsCol.push(index);
                  return;
                }
                if (column === _this2.annotation.textColumn) {
                  textCol = index;
                  return;
                }
              });

              _.each(series.values, function (value) {
                var data = {
                  annotation: _this2.annotation,
                  time: +new Date(value[timeCol]),
                  title: value[titleCol],
                  // Remove empty values, then split in different tags for comma separated values
                  tags: _.flatten(tagsCol.filter(function (t) {
                    return value[t];
                  }).map(function (t) {
                    return value[t].split(',');
                  })),
                  text: value[textCol]
                };

                list.push(data);
              });
            });

            return list;
          }
        }, {
          key: 'getTable',
          value: function getTable(includeMeasurementColumn) {
            var table = new TableModel();
            var i, j;

            if (this.series.length === 0) {
              return table;
            }

            _.each(this.series, function (series, seriesIndex) {
              if (seriesIndex === 0) {
                table.columns.push({ text: 'Time', type: 'time' });
                if (includeMeasurementColumn) {
                  table.columns.push({ text: 'Measurement' });
                }
                _.each(_.keys(series.tags), function (key) {
                  table.columns.push({ text: key });
                });
                for (j = 1; j < series.columns.length; j++) {
                  table.columns.push({ text: series.columns[j] });
                }
              }

              if (series.values) {
                for (i = 0; i < series.values.length; i++) {
                  var values = series.values[i];
                  var reordered = [values[0]];
                  if (includeMeasurementColumn) {
                    reordered.push(series.name);
                  }
                  if (series.tags) {
                    for (var key in series.tags) {
                      if (series.tags.hasOwnProperty(key)) {
                        reordered.push(series.tags[key]);
                      }
                    }
                  }
                  for (j = 1; j < values.length; j++) {
                    reordered.push(values[j]);
                  }
                  table.rows.push(reordered);
                }
              }
            });

            return table;
          }
        }]);

        return InfluxSeries;
      }();

      _export('default', InfluxSeries);
    }
  };
});
//# sourceMappingURL=influx_series.js.map

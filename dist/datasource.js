'use strict';

System.register(['lodash', 'app/core/utils/datemath', './influx_series', './influx_query', './response_parser', './query_builder'], function (_export, _context) {
  "use strict";

  var _, dateMath, InfluxSeries, InfluxQuery, ResponseParser, InfluxQueryBuilder, _createClass, EnesaInfluxDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsDatemath) {
      dateMath = _appCoreUtilsDatemath;
    }, function (_influx_series) {
      InfluxSeries = _influx_series.default;
    }, function (_influx_query) {
      InfluxQuery = _influx_query.default;
    }, function (_response_parser) {
      ResponseParser = _response_parser.default;
    }, function (_query_builder) {
      InfluxQueryBuilder = _query_builder.InfluxQueryBuilder;
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

      EnesaInfluxDatasource = function () {

        /** @ngInject */
        function EnesaInfluxDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, EnesaInfluxDatasource);

          this.type = 'influxdb';
          this.urls = _.map(instanceSettings.url.split(','), function (url) {
            return url.trim();
          });

          this.$q = $q;
          this.instanceSettings = instanceSettings;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;

          var jsonData = instanceSettings.jsonData || {};

          this.username = jsonData.username;
          this.password = jsonData.password;
          this.database = jsonData.database;
          this.name = instanceSettings.name;
          this.basicAuth = instanceSettings.basicAuth;
          this.withCredentials = instanceSettings.withCredentials;
          this.interval = (instanceSettings.jsonData || {}).timeInterval;
          this.supportAnnotations = true;
          this.supportMetrics = true;
          this.responseParser = new ResponseParser();
        }

        _createClass(EnesaInfluxDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            var timeFilter = this.getTimeFilter(options);
            var scopedVars = options.scopedVars;
            var targets = _.cloneDeep(options.targets);
            var queryTargets = [];
            var queryModel;
            var i, y;

            var allQueries = _.map(targets, function (target) {
              if (target.hide) {
                return '';
              }

              queryTargets.push(target);

              // backward compatability
              scopedVars.interval = scopedVars.__interval;

              queryModel = new InfluxQuery(target, _this.templateSrv, scopedVars);
              return queryModel.render(true);
            }).reduce(function (acc, current) {
              if (current !== '') {
                acc += ';' + current;
              }
              return acc;
            });

            if (allQueries === '') {
              return this.$q.when({ data: [] });
            }

            // add global adhoc filters to timeFilter
            var adhocFilters = this.templateSrv.getAdhocFilters(this.name);
            if (adhocFilters.length > 0) {
              timeFilter += ' AND ' + queryModel.renderAdhocFilters(adhocFilters);
            }

            // replace grafana variables
            scopedVars.timeFilter = { value: timeFilter };

            // replace templated variables
            allQueries = this.templateSrv.replace(allQueries, scopedVars);

            return this._seriesQuery(allQueries).then(function (data) {
              if (!data || !data.results) {
                return [];
              }

              var seriesList = [];
              for (i = 0; i < data.results.length; i++) {
                var result = data.results[i];
                if (!result || !result.series) {
                  continue;
                }

                var target = queryTargets[i];
                var alias = target.alias;
                if (alias) {
                  alias = _this.templateSrv.replace(target.alias, options.scopedVars);
                }

                var influxSeries = new InfluxSeries({
                  series: data.results[i].series,
                  alias: alias
                });

                switch (target.resultFormat) {
                  case 'table':
                    {
                      seriesList.push(influxSeries.getTable(target.includeMeasurementColumn));
                      break;
                    }
                  default:
                    {
                      var timeSeries = influxSeries.getTimeSeries();
                      for (y = 0; y < timeSeries.length; y++) {
                        seriesList.push(timeSeries[y]);
                      }
                      break;
                    }
                }
              }

              return { data: seriesList };
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
            if (!options.annotation.query) {
              return this.$q.reject({
                message: 'Query missing in annotation definition'
              });
            }

            var timeFilter = this.getTimeFilter({ rangeRaw: options.rangeRaw });
            var query = options.annotation.query.replace('$timeFilter', timeFilter);
            query = this.templateSrv.replace(query, null, 'regex');

            return this._seriesQuery(query).then(function (data) {
              if (!data || !data.results || !data.results[0]) {
                throw { message: 'No results in response from InfluxDB' };
              }
              return new InfluxSeries({
                series: data.results[0].series,
                annotation: options.annotation
              }).getAnnotations();
            });
          }
        }, {
          key: 'targetContainsTemplate',
          value: function targetContainsTemplate(target) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = target.groupBy[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var group = _step.value;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = group.params[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var param = _step2.value;

                    if (this.templateSrv.variableExists(param)) {
                      return true;
                    }
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                      _iterator2.return();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            for (var i in target.tags) {
              if (this.templateSrv.variableExists(target.tags[i].value)) {
                return true;
              }
            }

            return false;
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query) {
            var interpolated = this.templateSrv.replace(query, null, 'regex');

            return this._seriesQuery(interpolated).then(_.curry(this.responseParser.parse)(query));
          }
        }, {
          key: 'getTagKeys',
          value: function getTagKeys(options) {
            var queryBuilder = new InfluxQueryBuilder({ measurement: '', tags: [] }, this.database);
            var query = queryBuilder.buildExploreQuery('TAG_KEYS');
            return this.metricFindQuery(query);
          }
        }, {
          key: 'getTagValues',
          value: function getTagValues(options) {
            var queryBuilder = new InfluxQueryBuilder({ measurement: '', tags: [] }, this.database);
            var query = queryBuilder.buildExploreQuery('TAG_VALUES', options.key);
            return this.metricFindQuery(query);
          }
        }, {
          key: '_seriesQuery',
          value: function _seriesQuery(query) {
            if (!query) {
              return this.$q.when({ results: [] });
            }

            return this._influxRequest('GET', '/query', { q: query, epoch: 'ms' });
          }
        }, {
          key: 'serializeParams',
          value: function serializeParams(params) {
            if (!params) {
              return '';
            }

            return _.reduce(params, function (memo, value, key) {
              if (value === null || value === undefined) {
                return memo;
              }
              memo.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
              return memo;
            }, []).join('&');
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            var queryBuilder = new InfluxQueryBuilder({ measurement: '', tags: [] }, this.database);
            var query = queryBuilder.buildExploreQuery('RETENTION POLICIES');

            return this._seriesQuery(query).then(function (res) {
              var error = _.get(res, 'results[0].error');
              if (error) {
                return { status: 'error', message: error };
              }
              return { status: 'success', message: 'Data source is working' };
            }).catch(function (err) {
              return { status: 'error', message: err.message };
            });
          }
        }, {
          key: '_influxRequest',
          value: function _influxRequest(method, url, data) {
            var self = this;

            var currentUrl = self.urls.shift();
            self.urls.push(currentUrl);

            var params = {};

            if (self.username) {
              params.u = self.username;
              params.p = self.password;
            }

            if (self.database) {
              params.db = self.database;
            }

            if (method === 'GET') {
              _.extend(params, data);
              data = null;
            }

            var options = {
              method: method,
              url: currentUrl + url,
              params: params,
              data: data,
              precision: 'ms',
              inspect: { type: 'influxdb' },
              paramSerializer: this.serializeParams
            };

            options.headers = options.headers || {};
            if (this.basicAuth || this.withCredentials) {
              options.withCredentials = true;
            }
            if (self.basicAuth) {
              options.headers.Authorization = self.basicAuth;
            }

            return this.backendSrv.datasourceRequest(options).then(function (result) {
              return result.data;
            }, function (err) {
              if (err.status !== 0 || err.status >= 300) {
                if (err.data && err.data.error) {
                  throw {
                    message: 'InfluxDB Error: ' + err.data.error,
                    data: err.data,
                    config: err.config
                  };
                } else {
                  throw {
                    message: 'Network Error: ' + err.statusText + '(' + err.status + ')',
                    data: err.data,
                    config: err.config
                  };
                }
              }
            });
          }
        }, {
          key: 'getTimeFilter',
          value: function getTimeFilter(options) {
            var from = this.getInfluxTime(options.rangeRaw.from, false);
            var until = this.getInfluxTime(options.rangeRaw.to, true);
            var fromIsAbsolute = from[from.length - 1] === 'ms';

            if (until === 'now()' && !fromIsAbsolute) {
              return 'time >= ' + from;
            }

            return 'time >= ' + from + ' and time <= ' + until;
          }
        }, {
          key: 'getInfluxTime',
          value: function getInfluxTime(date, roundUp) {
            if (_.isString(date)) {
              if (date === 'now') {
                return 'now()';
              }

              var parts = /^now-(\d+)([d|h|m|s])$/.exec(date);
              if (parts) {
                var amount = parseInt(parts[1]);
                var unit = parts[2];
                return 'now() - ' + amount + unit;
              }
              date = dateMath.parse(date, roundUp);
            }

            return date.valueOf() + 'ms';
          }
        }]);

        return EnesaInfluxDatasource;
      }();

      _export('default', EnesaInfluxDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map

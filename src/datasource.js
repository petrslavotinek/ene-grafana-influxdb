import angular from 'angular';
import _ from 'lodash';

import * as dateMath from 'app/core/utils/datemath';
import EneInfluxSeries from './influx_series';
import EneInfluxQuery from './influx_query';
import EneResponseParser from './response_parser';
import EneInfluxQueryBuilder from './query_builder';

export default class EneInfluxDatasource {
  type;
  urls;
  username;
  password;
  name;
  database;
  basicAuth;
  withCredentials;
  interval;
  supportAnnotations;
  supportMetrics;
  responseParser;

  /** @ngInject */
  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;

    this.type = 'influxdb';
    this.urls = _.map(instanceSettings.url.split(','), function(url) {
      return url.trim();
    });

    let jsonData = instanceSettings.jsonData || {};

    this.username = jsonData.username;
    this.password = jsonData.password;
    this.name = instanceSettings.name;
    this.database = jsonData.database;
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.interval = jsonData.timeInterval;
    this.supportAnnotations = true;
    this.supportMetrics = true;
    this.responseParser = new EneResponseParser();
  }

  query(options) {
    var timeFilter = this.getTimeFilter(options);
    var scopedVars = options.scopedVars ? _.cloneDeep(options.scopedVars) : {};
    var targets = _.cloneDeep(options.targets);
    var queryTargets = [];
    var queryModel;
    var i, y;

    var allQueries = _.map(targets, target => {
      if (target.hide) { return ""; }

      queryTargets.push(target);

      // build query
      scopedVars.interval = {value: target.interval || options.interval};

      queryModel = new EneInfluxQuery(target, this.templateSrv, scopedVars);
      return queryModel.render(true);

    }).reduce((acc, current) => {
      if (current !== "") {
        acc += ";" + current;
      }
      return acc;
    });

    if (allQueries === '') {
      return this.$q.when({data: []});
    }

    // add global adhoc filters to timeFilter
    var adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    if (adhocFilters.length > 0 ) {
      timeFilter += ' AND ' + queryModel.renderAdhocFilters(adhocFilters);
    }

    // replace grafana variables
    scopedVars.timeFilter = {value: timeFilter};

    // replace templated variables
    allQueries = this.templateSrv.replace(allQueries, scopedVars);

    return this._seriesQuery(allQueries).then((data) => {
      if (!data || !data.results) {
        return [];
      }

      var seriesList = [];
      for (i = 0; i < data.results.length; i++) {
        var result = data.results[i];
        if (!result || !result.series) { continue; }

        var target = queryTargets[i];
        var alias = target.alias;
        if (alias) {
          alias = this.templateSrv.replace(target.alias, options.scopedVars);
        }

        var influxSeries = new EneInfluxSeries({ series: data.results[i].series, alias: alias });

        switch (target.resultFormat) {
          case 'table': {
            seriesList.push(influxSeries.getTable(target.includeMeasurementColumn));
            break;
          }
          default: {
            var timeSeries = influxSeries.getTimeSeries();
            for (y = 0; y < timeSeries.length; y++) {
              seriesList.push(timeSeries[y]);
            }
            break;
          }
        }
      }

      return {data: seriesList};
    });
  };

  annotationQuery(options) {
    if (!options.annotation.query) {
      return this.$q.reject({message: 'Query missing in annotation definition'});
    }

    var timeFilter = this.getTimeFilter({rangeRaw: options.rangeRaw});
    var query = options.annotation.query.replace('$timeFilter', timeFilter);
    query = this.templateSrv.replace(query, null, 'regex');

    return this._seriesQuery(query).then(data => {
      if (!data || !data.results || !data.results[0]) {
        throw { message: 'No results in response from InfluxDB' };
      }
      return new EneInfluxSeries({series: data.results[0].series, annotation: options.annotation}).getAnnotations();
    });
  };

  targetContainsTemplate(target) {
    for (let group of target.groupBy) {
      for (let param of group.params) {
        if (this.templateSrv.variableExists(param)) {
          return true;
        }
      }
    }

    for (let i in target.tags) {
      if (this.templateSrv.variableExists(target.tags[i].value)) {
        return true;
      }
    }

    return false;
  };

  metricFindQuery(query) {
    var interpolated = this.templateSrv.replace(query, null, 'regex');

    return this._seriesQuery(interpolated)
      .then(_.curry(this.responseParser.parse)(query));
  }

  getTagKeys(options) {
    var queryBuilder = new EneInfluxQueryBuilder({measurement: '', tags: []}, this.database);
    var query = queryBuilder.buildExploreQuery('TAG_KEYS');
    return this.metricFindQuery(query);
  }

  getTagValues(options) {
    var queryBuilder = new EneInfluxQueryBuilder({measurement: '', tags: []}, this.database);
    var query = queryBuilder.buildExploreQuery('TAG_VALUES', options.key);
    return this.metricFindQuery(query);
  }

  _seriesQuery(query) {
    if (!query) { return this.$q.when({results: []}); }

    return this._influxRequest('GET', '/query', {q: query, epoch: 'ms'});
  }

  serializeParams(params) {
    if (!params) { return '';}

    return _.reduce(params, (memo, value, key) => {
      if (value === null || value === undefined) { return memo; }
      memo.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      return memo;
    }, []).join("&");
  }

  testDatasource() {
    return this.metricFindQuery('SHOW MEASUREMENTS LIMIT 1').then(() => {
      return { status: "success", message: "Data source is working", title: "Success" };
    });
  }

  _influxRequest(method, url, data) {
    var self = this;

    var currentUrl = self.urls.shift();
    self.urls.push(currentUrl);

    var params = {
      u: self.username,
      p: self.password,
    };

    if (self.database) {
      params.db = self.database;
    }

    if (method === 'GET') {
      _.extend(params, data);
      data = null;
    }

    var options = {
      method: method,
      url:    currentUrl + url,
      params: params,
      data:   data,
      precision: "ms",
      inspect: { type: 'influxdb' },
      paramSerializer: this.serializeParams,
    };

    options.headers = options.headers || {};
    if (this.basicAuth || this.withCredentials) {
      options.withCredentials = true;
    }
    if (self.basicAuth) {
      options.headers.Authorization = self.basicAuth;
    }

    return this.backendSrv.datasourceRequest(options).then(result => {
      return result.data;
    }, function(err) {
      if (err.status !== 0 || err.status >= 300) {
        if (err.data && err.data.error) {
          throw { message: 'InfluxDB Error Response: ' + err.data.error, data: err.data, config: err.config };
        } else {
          throw { message: 'InfluxDB Error: ' + err.message, data: err.data, config: err.config };
        }
      }
    });
  };

  getTimeFilter(options) {
    var from = this.getInfluxTime(options.rangeRaw.from, false);
    var until = this.getInfluxTime(options.rangeRaw.to, true);
    var fromIsAbsolute = from[from.length-1] === 's';

    if (until === 'now()' && !fromIsAbsolute) {
      return 'time > ' + from;
    }

    return 'time > ' + from + ' and time < ' + until;
  }

  getInfluxTime(date, roundUp) {
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
    return (date.valueOf() / 1000).toFixed(0) + 's';
  }
}


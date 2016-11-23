'use strict';

System.register(['angular', 'lodash', './query_builder', './influx_query', './query_part', 'app/plugins/sdk'], function (_export, _context) {
  "use strict";

  var angular, _, EneInfluxQueryBuilder, EneInfluxQuery, queryPart, QueryCtrl, _createClass, EneInfluxQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_angular) {
      angular = _angular.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_query_builder) {
      EneInfluxQueryBuilder = _query_builder.default;
    }, function (_influx_query) {
      EneInfluxQuery = _influx_query.default;
    }, function (_query_part) {
      queryPart = _query_part.default;
    }, function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
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

      _export('EneInfluxQueryCtrl', EneInfluxQueryCtrl = function (_QueryCtrl) {
        _inherits(EneInfluxQueryCtrl, _QueryCtrl);

        /** @ngInject **/
        function EneInfluxQueryCtrl($scope, $injector, templateSrv, $q, uiSegmentSrv) {
          _classCallCheck(this, EneInfluxQueryCtrl);

          var _this = _possibleConstructorReturn(this, (EneInfluxQueryCtrl.__proto__ || Object.getPrototypeOf(EneInfluxQueryCtrl)).call(this, $scope, $injector));

          _this.templateSrv = templateSrv;
          _this.$q = $q;
          _this.uiSegmentSrv = uiSegmentSrv;
          _this.target = _this.target;
          _this.queryModel = new EneInfluxQuery(_this.target, templateSrv, _this.panel.scopedVars);
          _this.queryBuilder = new EneInfluxQueryBuilder(_this.target, _this.datasource.database);
          _this.groupBySegment = _this.uiSegmentSrv.newPlusButton();
          _this.resultFormats = [{ text: 'Time series', value: 'time_series' }, { text: 'Table', value: 'table' }];

          _this.policySegment = uiSegmentSrv.newSegment(_this.target.policy);

          if (!_this.target.measurement) {
            _this.measurementSegment = uiSegmentSrv.newSelectMeasurement();
          } else {
            _this.measurementSegment = uiSegmentSrv.newSegment(_this.target.measurement);
          }

          _this.tagSegments = [];
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _this.target.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var tag = _step.value;

              if (!tag.operator) {
                if (/^\/.*\/$/.test(tag.value)) {
                  tag.operator = "=~";
                } else {
                  tag.operator = '=';
                }
              }

              if (tag.condition) {
                _this.tagSegments.push(uiSegmentSrv.newCondition(tag.condition));
              }

              _this.tagSegments.push(uiSegmentSrv.newKey(tag.key));
              _this.tagSegments.push(uiSegmentSrv.newOperator(tag.operator));
              _this.tagSegments.push(uiSegmentSrv.newKeyValue(tag.value));
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

          _this.fixTagSegments();
          _this.buildSelectMenu();
          _this.removeTagFilterSegment = uiSegmentSrv.newSegment({ fake: true, value: '-- remove tag filter --' });
          return _this;
        }

        _createClass(EneInfluxQueryCtrl, [{
          key: 'buildSelectMenu',
          value: function buildSelectMenu() {
            var categories = queryPart.getCategories();
            this.selectMenu = _.reduce(categories, function (memo, cat, key) {
              var menu = {
                text: key,
                submenu: cat.map(function (item) {
                  return { text: item.type, value: item.type };
                })
              };
              memo.push(menu);
              return memo;
            }, []);
          }
        }, {
          key: 'getGroupByOptions',
          value: function getGroupByOptions() {
            var _this2 = this;

            var query = this.queryBuilder.buildExploreQuery('TAG_KEYS');

            return this.datasource.metricFindQuery(query).then(function (tags) {
              var options = [];
              if (!_this2.queryModel.hasFill()) {
                options.push(_this2.uiSegmentSrv.newSegment({ value: 'fill(null)' }));
              }
              if (!_this2.queryModel.hasGroupByTime()) {
                options.push(_this2.uiSegmentSrv.newSegment({ value: 'time($interval)' }));
              }
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var tag = _step2.value;

                  options.push(_this2.uiSegmentSrv.newSegment({ value: 'tag(' + tag.text + ')' }));
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

              return options;
            }).catch(this.handleQueryError.bind(this));
          }
        }, {
          key: 'groupByAction',
          value: function groupByAction() {
            this.queryModel.addGroupBy(this.groupBySegment.value);
            var plusButton = this.uiSegmentSrv.newPlusButton();
            this.groupBySegment.value = plusButton.value;
            this.groupBySegment.html = plusButton.html;
            this.panelCtrl.refresh();
          }
        }, {
          key: 'addSelectPart',
          value: function addSelectPart(selectParts, cat, subitem) {
            this.queryModel.addSelectPart(selectParts, subitem.value);
            this.panelCtrl.refresh();
          }
        }, {
          key: 'handleSelectPartEvent',
          value: function handleSelectPartEvent(selectParts, part, evt) {
            switch (evt.name) {
              case "get-param-options":
                {
                  var fieldsQuery = this.queryBuilder.buildExploreQuery('FIELDS');
                  return this.datasource.metricFindQuery(fieldsQuery).then(this.transformToSegments(true)).catch(this.handleQueryError.bind(this));
                }
              case "part-param-changed":
                {
                  this.panelCtrl.refresh();
                  break;
                }
              case "action":
                {
                  this.queryModel.removeSelectPart(selectParts, part);
                  this.panelCtrl.refresh();
                  break;
                }
              case "get-part-actions":
                {
                  return this.$q.when([{ text: 'Remove', value: 'remove-part' }]);
                }
            }
          }
        }, {
          key: 'handleGroupByPartEvent',
          value: function handleGroupByPartEvent(part, index, evt) {
            switch (evt.name) {
              case "get-param-options":
                {
                  var tagsQuery = this.queryBuilder.buildExploreQuery('TAG_KEYS');
                  return this.datasource.metricFindQuery(tagsQuery).then(this.transformToSegments(true)).catch(this.handleQueryError.bind(this));
                }
              case "part-param-changed":
                {
                  this.panelCtrl.refresh();
                  break;
                }
              case "action":
                {
                  this.queryModel.removeGroupByPart(part, index);
                  this.panelCtrl.refresh();
                  break;
                }
              case "get-part-actions":
                {
                  return this.$q.when([{ text: 'Remove', value: 'remove-part' }]);
                }
            }
          }
        }, {
          key: 'fixTagSegments',
          value: function fixTagSegments() {
            var count = this.tagSegments.length;
            var lastSegment = this.tagSegments[Math.max(count - 1, 0)];

            if (!lastSegment || lastSegment.type !== 'plus-button') {
              this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
            }
          }
        }, {
          key: 'measurementChanged',
          value: function measurementChanged() {
            this.target.measurement = this.measurementSegment.value;
            this.panelCtrl.refresh();
          }
        }, {
          key: 'getPolicySegments',
          value: function getPolicySegments() {
            var policiesQuery = this.queryBuilder.buildExploreQuery('RETENTION POLICIES');
            return this.datasource.metricFindQuery(policiesQuery).then(this.transformToSegments(false)).catch(this.handleQueryError.bind(this));
          }
        }, {
          key: 'policyChanged',
          value: function policyChanged() {
            this.target.policy = this.policySegment.value;
            this.panelCtrl.refresh();
          }
        }, {
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            try {
              this.target.query = this.queryModel.render(false);
            } catch (err) {
              console.log('query render error');
            }
            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'getMeasurements',
          value: function getMeasurements(measurementFilter) {
            var query = this.queryBuilder.buildExploreQuery('MEASUREMENTS', undefined, measurementFilter);
            return this.datasource.metricFindQuery(query).then(this.transformToSegments(true)).catch(this.handleQueryError.bind(this));
          }
        }, {
          key: 'handleQueryError',
          value: function handleQueryError(err) {
            this.error = err.message || 'Failed to issue metric query';
            return [];
          }
        }, {
          key: 'transformToSegments',
          value: function transformToSegments(addTemplateVars) {
            var _this3 = this;

            return function (results) {
              var segments = _.map(results, function (segment) {
                return _this3.uiSegmentSrv.newSegment({ value: segment.text, expandable: segment.expandable });
              });

              if (addTemplateVars) {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = _this3.templateSrv.variables[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var variable = _step3.value;

                    segments.unshift(_this3.uiSegmentSrv.newSegment({ type: 'template', value: '/^$' + variable.name + '$/', expandable: true }));
                  }
                } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                      _iterator3.return();
                    }
                  } finally {
                    if (_didIteratorError3) {
                      throw _iteratorError3;
                    }
                  }
                }
              }

              return segments;
            };
          }
        }, {
          key: 'getTagsOrValues',
          value: function getTagsOrValues(segment, index) {
            var _this4 = this;

            if (segment.type === 'condition') {
              return this.$q.when([this.uiSegmentSrv.newSegment('AND'), this.uiSegmentSrv.newSegment('OR')]);
            }
            if (segment.type === 'operator') {
              var nextValue = this.tagSegments[index + 1].value;
              if (/^\/.*\/$/.test(nextValue)) {
                return this.$q.when(this.uiSegmentSrv.newOperators(['=~', '!~']));
              } else {
                return this.$q.when(this.uiSegmentSrv.newOperators(['=', '!=', '<>', '<', '>']));
              }
            }

            var query, addTemplateVars;
            if (segment.type === 'key' || segment.type === 'plus-button') {
              query = this.queryBuilder.buildExploreQuery('TAG_KEYS');
              addTemplateVars = false;
            } else if (segment.type === 'value') {
              query = this.queryBuilder.buildExploreQuery('TAG_VALUES', this.tagSegments[index - 2].value);
              addTemplateVars = true;
            }

            return this.datasource.metricFindQuery(query).then(this.transformToSegments(addTemplateVars)).then(function (results) {
              if (segment.type === 'key') {
                results.splice(0, 0, angular.copy(_this4.removeTagFilterSegment));
              }
              return results;
            }).catch(this.handleQueryError.bind(this));
          }
        }, {
          key: 'getFieldSegments',
          value: function getFieldSegments() {
            var fieldsQuery = this.queryBuilder.buildExploreQuery('FIELDS');
            return this.datasource.metricFindQuery(fieldsQuery).then(this.transformToSegments(false)).catch(this.handleQueryError);
          }
        }, {
          key: 'tagSegmentUpdated',
          value: function tagSegmentUpdated(segment, index) {
            this.tagSegments[index] = segment;

            // handle remove tag condition
            if (segment.value === this.removeTagFilterSegment.value) {
              this.tagSegments.splice(index, 3);
              if (this.tagSegments.length === 0) {
                this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
              } else if (this.tagSegments.length > 2) {
                this.tagSegments.splice(Math.max(index - 1, 0), 1);
                if (this.tagSegments[this.tagSegments.length - 1].type !== 'plus-button') {
                  this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
                }
              }
            } else {
              if (segment.type === 'plus-button') {
                if (index > 2) {
                  this.tagSegments.splice(index, 0, this.uiSegmentSrv.newCondition('AND'));
                }
                this.tagSegments.push(this.uiSegmentSrv.newOperator('='));
                this.tagSegments.push(this.uiSegmentSrv.newFake('select tag value', 'value', 'query-segment-value'));
                segment.type = 'key';
                segment.cssClass = 'query-segment-key';
              }

              if (index + 1 === this.tagSegments.length) {
                this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
              }
            }

            this.rebuildTargetTagConditions();
          }
        }, {
          key: 'rebuildTargetTagConditions',
          value: function rebuildTargetTagConditions() {
            var _this5 = this;

            var tags = [];
            var tagIndex = 0;
            var tagOperator = "";

            _.each(this.tagSegments, function (segment2, index) {
              if (segment2.type === 'key') {
                if (tags.length === 0) {
                  tags.push({});
                }
                tags[tagIndex].key = segment2.value;
              } else if (segment2.type === 'value') {
                tagOperator = _this5.getTagValueOperator(segment2.value, tags[tagIndex].operator);
                if (tagOperator) {
                  _this5.tagSegments[index - 1] = _this5.uiSegmentSrv.newOperator(tagOperator);
                  tags[tagIndex].operator = tagOperator;
                }
                tags[tagIndex].value = segment2.value;
              } else if (segment2.type === 'condition') {
                tags.push({ condition: segment2.value });
                tagIndex += 1;
              } else if (segment2.type === 'operator') {
                tags[tagIndex].operator = segment2.value;
              }
            });

            this.target.tags = tags;
            this.panelCtrl.refresh();
          }
        }, {
          key: 'getTagValueOperator',
          value: function getTagValueOperator(tagValue, tagOperator) {
            if (tagOperator !== '=~' && tagOperator !== '!~' && /^\/.*\/$/.test(tagValue)) {
              return '=~';
            } else if ((tagOperator === '=~' || tagOperator === '!~') && /^(?!\/.*\/$)/.test(tagValue)) {
              return '=';
            }
          }
        }, {
          key: 'getCollapsedText',
          value: function getCollapsedText() {
            return this.queryModel.render(false);
          }
        }]);

        return EneInfluxQueryCtrl;
      }(QueryCtrl));

      _export('EneInfluxQueryCtrl', EneInfluxQueryCtrl);

      EneInfluxQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map

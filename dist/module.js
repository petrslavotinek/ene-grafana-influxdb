'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var EneInfluxDatasource, EneInfluxQueryCtrl, EneInfluxConfigCtrl, EneInfluxQueryOptionsCtrl, EneInfluxAnnotationsQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      EneInfluxDatasource = _datasource.default;
    }, function (_query_ctrl) {
      EneInfluxQueryCtrl = _query_ctrl.EneInfluxQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', EneInfluxConfigCtrl = function EneInfluxConfigCtrl() {
        _classCallCheck(this, EneInfluxConfigCtrl);
      });

      EneInfluxConfigCtrl.templateUrl = 'partials/config.html';

      _export('QueryOptionsCtrl', EneInfluxQueryOptionsCtrl = function EneInfluxQueryOptionsCtrl() {
        _classCallCheck(this, EneInfluxQueryOptionsCtrl);
      });

      EneInfluxQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

      _export('AnnotationsQueryCtrl', EneInfluxAnnotationsQueryCtrl = function EneInfluxAnnotationsQueryCtrl() {
        _classCallCheck(this, EneInfluxAnnotationsQueryCtrl);
      });

      EneInfluxAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

      _export('Datasource', EneInfluxDatasource);

      _export('QueryCtrl', EneInfluxQueryCtrl);

      _export('ConfigCtrl', EneInfluxConfigCtrl);

      _export('QueryOptionsCtrl', EneInfluxQueryOptionsCtrl);

      _export('AnnotationsQueryCtrl', EneInfluxAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map

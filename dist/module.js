'use strict';

System.register(['./datasource', './query_ctrl'], function (_export, _context) {
  "use strict";

  var EnesaInfluxDatasource, EnesaInfluxQueryCtrl, EnesaInfluxConfigCtrl, EnesaInfluxAnnotationsQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_datasource) {
      EnesaInfluxDatasource = _datasource.default;
    }, function (_query_ctrl) {
      EnesaInfluxQueryCtrl = _query_ctrl.EnesaInfluxQueryCtrl;
    }],
    execute: function () {
      _export('ConfigCtrl', EnesaInfluxConfigCtrl = function EnesaInfluxConfigCtrl() {
        _classCallCheck(this, EnesaInfluxConfigCtrl);
      });

      EnesaInfluxConfigCtrl.templateUrl = 'partials/config.html';

      _export('AnnotationsQueryCtrl', EnesaInfluxAnnotationsQueryCtrl = function EnesaInfluxAnnotationsQueryCtrl() {
        _classCallCheck(this, EnesaInfluxAnnotationsQueryCtrl);
      });

      EnesaInfluxAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

      _export('Datasource', EnesaInfluxDatasource);

      _export('QueryCtrl', EnesaInfluxQueryCtrl);

      _export('ConfigCtrl', EnesaInfluxConfigCtrl);

      _export('AnnotationsQueryCtrl', EnesaInfluxAnnotationsQueryCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map

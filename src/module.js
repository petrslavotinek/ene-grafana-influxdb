import EneInfluxDatasource from './datasource';
import {EneInfluxQueryCtrl} from './query_ctrl';

class EneInfluxConfigCtrl {
  static templateUrl = 'partials/config.html';
}

class EneInfluxQueryOptionsCtrl {
  static templateUrl = 'partials/query.options.html';
}

class EneInfluxAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  EneInfluxDatasource as Datasource,
  EneInfluxQueryCtrl as QueryCtrl,
  EneInfluxConfigCtrl as ConfigCtrl,
  EneInfluxQueryOptionsCtrl as QueryOptionsCtrl,
  EneInfluxAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};



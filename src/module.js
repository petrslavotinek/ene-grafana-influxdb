import EnesaInfluxDatasource from './datasource';
import { EnesaInfluxQueryCtrl } from './query_ctrl';

class EnesaInfluxConfigCtrl {
  static templateUrl = 'partials/config.html';
}

class EnesaInfluxAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  EnesaInfluxDatasource as Datasource,
  EnesaInfluxQueryCtrl as QueryCtrl,
  EnesaInfluxConfigCtrl as ConfigCtrl,
  EnesaInfluxAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};

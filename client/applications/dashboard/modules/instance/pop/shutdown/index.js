var commonModal = require('client/components/modal_common/index');
var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

function pop(obj, parent, callback) {

  config.fields[0].info = __[config.fields[0].field].replace('{0}', obj.name);

  var props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      request.poweroff(obj).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      switch(field) {
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
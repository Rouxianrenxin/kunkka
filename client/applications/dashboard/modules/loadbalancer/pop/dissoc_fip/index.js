const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');


function pop(obj, parent, callback) {
  config.fields[0].text = obj.name || '(' + obj.id.slice(0, 8) + ')';
  config.fields[1].text = obj.floatingip.floating_ip_address;
  config.btn.disabled = false;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let fipID = obj.floatingip.id;
      request.associateFloatingIp(null, fipID).then(res => {
        callback && callback();
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;

const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');


function pop(obj, callback) {
  config.fields[0].text = obj.floating_ip_address;

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      request.releaseFloatingIp(obj.id).then((res) => {
        callback && callback(res);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {}
  };

  commonModal(props);
}

module.exports = pop;

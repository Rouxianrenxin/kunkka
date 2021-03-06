const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');

const request = require('../../request');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

function pop(obj, parent, callback) {
  const { action, instances } = obj;

  const text = config.fields[0];
  const dataList = config.fields[1];
  config.title = [action, 'instance'];
  text.info = __.confirm_inst_action.replace('{0}', __[action]);
  dataList.data = instances;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onConfirm: function(refs, cb) {
      let ids = [];
      let data = {};
      data[action] = null;

      instances.forEach(item => {
        ids.push(item.id);
      });

      request.changeAction(ids, data).then((res) => {
        cb(true);
        callback && callback(res);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {}
  };

  commonModal(props);
}

module.exports = pop;

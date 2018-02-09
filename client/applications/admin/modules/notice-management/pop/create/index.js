const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

const linkRegExp = /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      let data = {
        title: refs.notice_title.state.value,
        link: refs.notice_link.state.value
      };

      request.createNotice(data).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {
      let title = refs.notice_title.state.value;
      let link = refs.notice_link.state.value;
      let hasError = (title && linkRegExp.test(link)) ? false : true;
      refs.btn.setState({
        disabled: hasError
      });
      switch(field) {
        case 'notice_title':
          refs.notice_title.setState({
            error: !title
          });
          break;
        case 'notice_link':
          refs.notice_link.setState({
            error: !linkRegExp.test(link)
          });
          break;
        default:
          return;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;

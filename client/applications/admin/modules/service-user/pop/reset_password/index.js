const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');


function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;

  let props = {
    __: __,
    width: 550,
    parent: parent,
    config: config,
    onInitialize: function(refs) {},
    onConfirm: function(refs, cb) {
      const passwd = refs.password.state.value;
      const cfmPasswd = refs.confirm_password.state.value;

      if(passwd !== cfmPasswd || !/^\w{8,20}$/.test(passwd) || !/\d+/.test(passwd) || !/[a-z]+/.test(passwd) || !/[A-Z]+/.test(passwd)) {
        refs.password.setState({
          error: true
        });
        refs.confirm_password.setState({
          error: true
        });
        cb(false, __.passwd_not_meet_requirement);
        return;
      }

      let data = {
        name: obj.name,
        password: passwd
      };

      request.editUser(obj.id, data).then((res) => {
        callback && callback(res.user);
        cb(true);
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'password':
          let pwd = refs.password.state.value;
          refs.password.setState({
            error: pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd)
          });
          let _rePsw = refs.confirm_password.state.value;
          let _valid = pwd && (pwd === _rePsw);

          _rePsw && refs.confirm_password.setState({
            error: pwd !== _rePsw
          });

          refs.btn.setState({
            disabled: !_valid
          });
          break;
        case 'confirm_password':
          let psw = refs.password.state.value;
          let rePsw = refs.confirm_password.state.value;
          let valid = psw && (psw === rePsw);
          refs.confirm_password.setState({
            error: !valid
          });
          refs.btn.setState({
            disabled: !valid
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;

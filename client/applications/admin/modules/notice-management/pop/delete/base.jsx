require('./style/index.less');

const React = require('react');
const {Modal, Button, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');

const getErrorMessage = require('../../../../utils/error_message');

class BatchDelete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      errorMessage: '',
      btnDisabled: false
    };
    this.onDelete = this.onDelete.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onDelete(){
    const callback = this.props.callback;
    this.setState({
      btnDisabled: true
    });
    request.batchDelete(this.props.obj.notices).then(() => {
      this.onCancel();
      callback && callback();
    }).catch((err) => {
      this.setState({
        btnDisabled: false,
        errorMessage: getErrorMessage(err)
      });
    });
  }

  render() {
    let props = this.props,
      state = this.state;
    return (
      <Modal refs="modal" {...props} title={__.delete_notice} visible={state.visible}>
        <div className="modal-bd halo-com-modal-delete-notices">
          <div className="content-wrapper">
            <div className="modal-content-title">
              { __.confirm_delete_notice }
            </div>
            <ul className="modal-content">
              {
                props.obj.notices.map((notice) => {
                  return (
                    <li key={notice.id}>
                      <a href={notice.link} target="_blank">{notice.title}</a>
                    </li>
                  );
                })
              }
            </ul>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <div className="right-side">
            <Button ref="btn" value={__.confirm} onClick={this.onDelete} type="create" disabled={state.btnDisabled} />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = BatchDelete;

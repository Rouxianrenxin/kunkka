require('./style/index.less');

var React = require('react');
var {Tab} = require('client/uskin/index');
var router = require('../../cores/router');
var event = require('./event');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      loading: false,
      tabs: this.props.tabs,
      contents: {}
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.visible && !nextState.loading && (Object.keys(nextState.contents).length === 0)) {
      return false;
    }
    return true;
  }

  updateTabContent(tab) {
    var func = this.props.onClickTabs;
    func && func(tab);
  }

  onClickTabs(e, tab) {
    if (tab.key !== this.findDefaultTab().key) {
      var tabs = this.changeDefaultTab(tab);
      this.setState({
        tabs: tabs
      });

      var contents = this.state.contents;
      if (!contents[tab.key]) {
        this.updateTabContent(tab);
      }
    }
  }

  findDefaultTab() {
    return this.state.tabs.filter((t) => t.default)[0];
  }

  changeDefaultTab(tab) {
    event.emit('changeTab', tab);

    var tabs = this.state.tabs;
    tabs.forEach((t) => {
      t.default = (t.key === tab.key) ? true : false;
    });

    return tabs;
  }

  refresh() {
    this.setState({
      contents: {}
    }, () => {
      this.updateTabContent();
    });
  }

  loading() {
    this.setState({
      loading: true
    });
  }

  onClose() {
    var path = router.getPathList();
    router.pushState('/' + path.slice(0, 2).join('/'));
  }

  render() {
    var state = this.state;

    return (
      <div className={'admin-com-table-detail' + (state.visible ? ' visible' : '')}>
        <div className="detail-head">
          <div className="close" onClick={this.onClose.bind(this)}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab ref="tab" items={state.tabs} type="sm" onClick={this.onClickTabs.bind(this)} />
        </div>
        {state.loading ?
          <div className="detail-loading">
            <i className="glyphicon icon-loading" />
          </div>
          : null
        }
        {Object.keys(state.contents).map((key) =>
          state.contents[key] ?
          <div key={key}
            className="detail-content"
            data-filed={key}
            style={{display: key === this.findDefaultTab().key ? 'block' : 'none'}}>
            {state.contents[key]}
          </div>
          : null
        )}
      </div>
    );
  }
}

module.exports = Detail;

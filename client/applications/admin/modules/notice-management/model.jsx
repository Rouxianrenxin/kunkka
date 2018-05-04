require('./style/index.less');

//react components
const React = require('react');
const Main = require('client/components/main_paged/index');

const create = require('./pop/create/index');
const deleteNotice = require('./pop/delete/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.stores = {
      urls: []
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    let column = this.state.config.table.column;
    this.tableColRender(column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.getList();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'deleted':
          column.render = (col, item, i) => {
            return item.deletedAt ? __.yes : __.no;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.loadingTable();
    this.getList();
  }

  getList() {
    this.clearState();
    let pageLimit = localStorage.getItem('page_limit');
    let _config = this.state.config;
    let table = _config.table;

    request.getList(pageLimit).then((res) => {
      table.data = res.notice;

      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

  getNextList(url, refreshDetail) {
    let table = this.state.config.table;
    const limit = localStorage.getItem('page_limit');
    request.getNextList(url, limit).then((res) => {
      if (res.notice) {
        table.data = res.notice;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((err) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(err.responseURL));
    });
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      callback && callback();
    });
  }

  setPagination(table, res) {
    let pagination = {},
      next = res.next ? res.next : null;

    if (next) {
      pagination.nextUrl = next;
    }

    let history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getList();
  }

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'page_limit':
        this.onInitialize();
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;

    switch (key) {
      case 'create':
        create(null, null, () => {
          this.refresh({
            refreshList: true
          });
        });
        break;
      case 'delete':
        deleteNotice({ notices: rows }, () => {
          this.refresh({
            refreshList: true
          });
        });
        break;
      case 'refresh':
        this.refresh({
          refreshList: true,
          loadingTable: true
        });
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev') {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    const haveADeleted = rows.some((item) => {
      return item.deletedAt;
    });

    for (let key in btns) {
      switch (key) {
        case 'delete':
          btns[key].disabled = (rows.length >= 1 && !haveADeleted) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if (data.refreshList) {
      if (!params[2] && data.loadingTable) {
        this.loadingTable();
      }

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  clearUrls() {
    this.stores.urls.length = 0;
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  render() {
    return (
      <div className="halo-module-notice-management" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;

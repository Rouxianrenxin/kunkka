require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const config = require('./config.json');

const request = require('./request');

const moment = require('client/libs/moment');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      page: 1    // 页码，从 1 开始
    };

    // 保存整体的数据，因为分页比较特殊，所以这里采取前端分页的方式
    this.fullData = [];
    // 当前结果是否是搜索的结果
    this.search = {
      useSearch: false,
      searchKey: '',
      searchValue: ''
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'operation_time':
          column.render = (col, item, i) => {
            let uniformTime = item.generated.split('.')[0] + 'Z';
            return moment(uniformTime).fromNow();
          };
          break;
        default:
          break;
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.onInitialize();
    }
  }

  onInitialize() {
    this.setState({
      page: 1
    }, () => {
      this.getList(1);
    });
  }

  getList(page) {
    this.clearState();
    this.loadingTable();
    request.getEvents().then((res) => {
      this.fullData = res;
      this.renderPageData(page);
    }).catch(() => {
      this.handleGetError();
    });
  }

  handleGetError() {
    const table = this.state.config.table;
    this.fullData = [];
    this.search = {
      useSearch: false,
      searchKey: '',
      searchValue: ''
    };
    table.data = [];
    table.pagination = null;
    this.setState({
      page: 1
    }, () => {
      this.updateTableData(table);
    });
  }

  renderPageData(pageNumber) {
    const table = this.state.config.table;
    const pageLimit = localStorage.getItem('page_limit');
    const startIndex = (pageNumber - 1) * pageLimit;
    const endIndex = pageNumber * pageLimit;
    table.data = this.fullData.slice(startIndex, endIndex);
    this.setPagination(table);
    this.updateTableData(table);
  }

  updateTableData(table) {
    const newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    });
  }

  setPagination(table) {
    const pagination = {};
    const { page } = this.state;
    const fullDataLength = this.fullData.length;
    const pageLimit = localStorage.getItem('page_limit');
    if (fullDataLength > page * pageLimit) {
      pagination.nextUrl = page + 1;
    }

    if (page !== 1) {
      pagination.prevUrl = page - 1;
    }
    table.pagination = pagination;

    return table;
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key);
        break;
      case 'filter':
        this.onFilterSearch(actionType, data);
        break;
      case 'table':
        this.onClickTable(actionType, data);
        break;
      case 'page_limit':
        this.setState({
          page: 1
        }, () => {
          this.refresh();
        });
        break;
      default:
        break;
    }
  }

  onClickBtnList(key) {
    switch (key) {
      case 'refresh':
        this.refresh();
        break;
      default:
        break;
    }
  }

  clearState() {
    const dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }


  onClickTable(actionType, data) {
    switch (actionType) {
      case 'pagination':
        this.handlePageChange(data);
        break;
      default:
        break;
    }
  }

  handlePageChange(data) {
    let pageNumber = data.url;
    if (data.direction === 'first') {
      pageNumber = 1;
    }
    this.setState({
      page: pageNumber
    }, () => {
      this.renderPageData(pageNumber);
    });
  }

  onFilterSearch(actionType, data) {
    if (actionType === 'search') {
      this.clearState();

      const projectData = data.project,
        userData = data.user;
      if (projectData) {
        this.handleSearchProject(projectData.project_id);
      } else if (userData){
        this.handleSearchUser(userData.user_id);
      } else {
        this.search = {
          useSearch: false,
          searchKey: '',
          searchValue: ''
        };
        this.setState({
          page: 1
        }, () => {
          this.refresh();
        });
      }
    }
  }

  handleSearchProject(projectId) {
    this.getSearchResult('project_id', projectId, 1);
  }

  handleSearchUser(userId) {
    this.getSearchResult('user_id', userId, 1);
  }

  getSearchResult(searchKey, searchValue, page) {
    this.search = {
      useSearch: true,
      searchKey,
      searchValue
    };
    this.loadingTable();
    request.getSearchResult(searchKey, searchValue).then(res => {
      this.fullData = res;
      this.setState({
        page: page
      }, () => {
        this.renderPageData(page);
      });
    }).catch(() => {
      this.handleGetError();
    });
  }

  refresh() {
    const { page } = this.state;
    const search = this.search;
    if (search.useSearch) {
      this.getSearchResult(search.searchKey, search.searchValue, page);
    } else {
      this.getList(page);
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  render() {
    return (
      <div className="halo-module-action-log" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          config={this.state.config}
          params={this.props.params}
          onAction={this.onAction}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;

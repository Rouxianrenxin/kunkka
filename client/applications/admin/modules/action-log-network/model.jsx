const config = require('./config.json');
const request = require('./request');

const ActionModel = require('../action-log/model');

class Model extends ActionModel {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      page: 1
    };
  }

  // 涉及到 request 的地方需要替换
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
}

module.exports = Model;

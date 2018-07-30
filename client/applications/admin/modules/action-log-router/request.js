const fetch = require('client/applications/dashboard/cores/fetch');
const { handleList, getLogs } = require('../../utils/common-action-log-funcs');

module.exports = {
  getRouters: function() {
    return fetch.get({
      url: '/proxy-search/neutron/v2.0/routers'
    });
  },
  getEvents: function(searchStr) {
    return this.getRouters().then(routers => {
      return this.getRouterlogList(searchStr).then(eventsData => {
        return handleList(routers.list, eventsData);
      });
    });
  },
  getRouterlogList: function(searchStr) {
    let eventTypes = ['router.create.end', 'router.delete.end', 'router.update.start', 'router.update.end'];
    return getLogs(eventTypes, searchStr);
  },
  getSearchResult: function(key, value) {
    const searchStr = '\&q.field=' + key + '\&q.op=eq\&q.value=' + value;
    return this.getEvents(searchStr);
  }
};

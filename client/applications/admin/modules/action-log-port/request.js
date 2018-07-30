const fetch = require('client/applications/admin/cores/fetch');
const { handleList, getLogs } = require('../../utils/common-action-log-funcs');

module.exports = {
  getPorts: function() {
    return fetch.get({
      url: '/proxy/neutron/v2.0/ports?all_tenants=1'
    });
  },
  getEvents: function(searchStr) {
    return this.getPorts().then(res => {
      return this.getPortlogList(searchStr).then(eventsData => {
        return handleList(res.ports, eventsData);
      });
    });
  },
  getPortlogList: function(searchStr) {
    let eventTypes = ['port.create.end', 'port.delete.end', 'port.update.end'];
    return getLogs(eventTypes, searchStr);
  },
  getSearchResult: function(key, value) {
    const searchStr = '\&q.field=' + key + '\&q.op=eq\&q.value=' + value;
    return this.getEvents(searchStr);
  }
};

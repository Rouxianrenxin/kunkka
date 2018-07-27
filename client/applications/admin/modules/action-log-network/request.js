const fetch = require('client/applications/dashboard/cores/fetch');
const { handleList, getLogs } = require('../../utils/common-action-log-funcs');

module.exports = {
  getNetworks: function() {
    return fetch.get({
      url: '/proxy-search/neutron/v2.0/networks'
    });
  },
  getEvents: function(searchStr) {
    return this.getNetworks().then(networks => {
      return this.getNetworklogList(searchStr).then(eventsData => {
        return handleList(networks.list, eventsData);
      });
    });
  },
  getNetworklogList: function(searchStr) {
    let eventTypes = ['network.create.end', 'network.delete.end'];
    return getLogs(eventTypes, searchStr);
  },
  getSearchResult: function(key, value) {
    const searchStr = '\&q.field=' + key + '\&q.op=eq\&q.value=' + value;
    return this.getEvents(searchStr);
  }
};

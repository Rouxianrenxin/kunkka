const fetch = require('client/applications/dashboard/cores/fetch');
const { handleList, getLogs } = require('../../utils/common-action-log-funcs');

module.exports = {
  getSubnets: function() {
    return fetch.get({
      url: '/proxy-search/neutron/v2.0/subnets'
    });
  },
  getEvents: function(searchStr) {
    return this.getSubnets().then(subnets => {
      return this.getSubnetlogList(searchStr).then(eventsData => {
        return handleList(subnets.list, eventsData);
      });
    });
  },
  getSubnetlogList: function(searchStr) {
    let eventTypes = ['subnet.create.end', 'subnet.delete.end'];
    return getLogs(eventTypes, searchStr);
  },
  getSearchResult: function(key, value) {
    const searchStr = '\&q.field=' + key + '\&q.op=eq\&q.value=' + value;
    return this.getEvents(searchStr);
  }
};

const fetch = require('client/applications/dashboard/cores/fetch');
const { handleList, getLogs } = require('../../utils/common-action-log-funcs');

module.exports = {
  getVolumes: function() {
    return fetch.get({
      url: '/proxy-search/cinder/v2/' + HALO.user.projectId + '/volumes/detail?all_tenants=1'
    });
  },
  getEvents: function(searchStr) {
    return this.getVolumes().then(volumes => {
      return this.getVolumelogList(searchStr).then(eventsData => {
        return handleList(volumes.list, eventsData);
      });
    });
  },
  getVolumelogList: function(searchStr) {
    let eventTypes = ['volume.attach.start', 'volume.detach.start', 'volume.create.start', 'volume.delete.start'];

    return getLogs(eventTypes, searchStr);
  },
  getSearchResult: function(key, value) {
    const searchStr = '\&q.field=' + key + '\&q.op=eq\&q.value=' + value;
    return this.getEvents(searchStr);
  }
};

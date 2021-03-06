const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['notification'], forced).then(function(data) {
      return data.notification;
    });
  },
  addEndpoint: function(name, id, data) {
    let url = '/proxy/zaqar/v2/queues/' + name + '/subscriptions/' + id + '/confirm';
    return fetch.post({
      url: url,
      data: data
    });
  },
  deleteItems: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/zaqar/v2/queues/' + item.name,
        headers: {
          'Client-ID': HALO.user.projectId
        }
      }));
    });
    return RSVP.all(deferredList);
  },
  getSubscriptionsByName: function(name) {
    let url = '/proxy/zaqar/v2/queues/' + name + '/subscriptions';
    return fetch.get({
      url: url,
      headers: {
        'Client-ID': HALO.user.projectId
      }
    });
  },
  addSubscriptions: function(name, data) {
    let updateList = [];
    data.subcribers && data.subcribers.forEach((s) => {
      if(s.op === 'add') {
        updateList.push(fetch.post({
          url: '/api/zaqar/v2/queues/' + name + '/subscriptions',
          data: {
            ttl: data.ttl,
            subscriber: s.subscriber
          },
          headers: {
            'Client-ID': HALO.user.projectId
          }
        }));
      } else {
        updateList.push(fetch.delete({
          url: '/proxy/zaqar/v2/queues/' + name + '/subscriptions/' + s.id,
          headers: {
            'Client-ID': HALO.user.projectId
          }
        }));
      }
    });
    return RSVP.all(updateList);
  },
  addQueueWidthSubscriptions: function(data) {
    return fetch.put({
      url: '/proxy/zaqar/v2/queues/' + data.name,
      data: {
        description: data.description
      },
      headers: {
        'Client-ID': HALO.user.projectId
      }
    }).then((res) => {
      if(data.subcribers && data.subcribers.length) {
        return this.addSubscriptions(data.name, data);
      }
      return res;
    });
  },
  updateQueueWidthSubscriptions: function(data) {
    return fetch.patch({
      // only you
      url: '/proxy/zaqar/v2/queues/' + data.name,
      headers: {
        'Client-ID': HALO.user.projectId
      },
      contentType: 'application/openstack-messaging-v2.0-json-patch',
      data: [{
        'op': 'replace',
        'path': '/metadata/description',
        'value': data.description
      }]
    }).then((res) => {
      if(data.subcribers.length > 0) {
        return this.addSubscriptions(data.name, data);
      }
      return res;
    });
  },
  deleteSub: function(name, id) {
    let url = '/proxy/zaqar/v2/queues/' + name + '/subscriptions/' + id;
    return fetch.delete({
      url: url,
      headers: {
        'Client-ID': HALO.user.projectId
      }
    });
  },
  deleteSubs: function(name, subscriptions) {
    let deferredList = [];
    subscriptions.forEach((sub) => {
      deferredList.push(fetch.delete({
        url: '/proxy/zaqar/v2/queues/' + name + '/subscriptions/' + sub,
        headers: {
          'Client-ID': HALO.user.projectId
        }
      }));
    });
    deferredList.push(fetch.delete({
      url: '/proxy/zaqar/v2/queues/undefined',
      headers: {
        'Client-ID': HALO.user.projectId
      }
    }));
    return RSVP.all(deferredList);
  },
  resendVerify: function(sub) {
    let url = '/api/zaqar/v2/queues/' + sub.source + '/subscriptions';
    return fetch.post({
      url: url,
      data: {
        ttl: sub.ttl,
        subscriber: sub.subscriber
      },
      headers: {
        'Client-ID': HALO.user.projectId
      }
    });
  }
};

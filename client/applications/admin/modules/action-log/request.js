const fetch = require('client/applications/dashboard/cores/fetch');
const React = require('react');
const RSVP = require('rsvp');
const moment = require('client/libs/moment');

function handleList(instances, eventsData) {
  let events = [];
  const instanceIdNameMap = {};
  instances.forEach(instance => {
    instanceIdNameMap[instance.id] = instance.name;
  });

  eventsData.forEach(i => {
    events = events.concat(i);
  });
  let sortTime = (a, b) => {
    return moment(b.generated).toDate().getTime() - moment(a.generated).toDate().getTime();
  };
  events.sort(sortTime);
  events.forEach((r, index) => {
    let eventType = r.event_type.split('.');
    if (r.event_type === 'compute.instance.volume.attach' || r.event_type === 'compute.instance.volume.detach') {
      r.operation = __[eventType[3]] + __[eventType[2]];
    } else if (r.event_type === 'compute.instance.resize.confirm.start') {
      r.operation = __[eventType[2]];
    } else {
      r.operation = __[eventType[2]] + __.instance;
    }
    r.traits.forEach(tr => {
      if (tr.name === 'instance_id') {
        r.name = (
          <div>
            <i className="glyphicon icon-instance" />
            {
              tr.value in instanceIdNameMap ? (
                <a data-type="router" href={'/admin/instance/' + tr.value}>
                  {instanceIdNameMap[tr.value] || '(' + tr.value.substring(0, 8) + ')'}
                </a>
              ) : '(' + tr.value.substring(0, 8) + ')'
            }
          </div>
        );
        r.id = tr.value + index;
        r.resource_id = tr.value;
      } else if (tr.name === 'user_id') {
        r.user_id = tr.value;
      }
    });
  });

  return events;
}

module.exports = {
  getInstances: function() {
    return fetch.get({
      url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers?all_tenants=1'
    });
  },
  getEvents: function(searchStr) {
    return this.getInstances().then(instances => {
      return this.getEventList(searchStr).then(eventsData => {
        return handleList(instances.servers, eventsData);
      });
    });
  },
  getEventList: function(searchStr) {
    let eventTypes = ['compute.instance.create.end', 'compute.instance.delete.end', 'compute.instance.reboot.end',
      'compute.instance.volume.attach', 'compute.instance.volume.detach', 'compute.instance.power_off.end',
      'compute.instance.power_on.end', 'compute.instance.resize.confirm.start'];

    let deferredList = [];
    eventTypes.forEach((item) => {
      deferredList.push(fetch.get({
        url: '/proxy/ceilometer/v2/events?' +
        'q.field=all_tenants' + '&q.op=eq' + '&q.value=1&' +
        'q.field=event_type' + '\&q.op=eq' + '\&q.value=' + item +
        (searchStr === undefined ? '' : searchStr)
      }));
    });
    return RSVP.all(deferredList);
  },
  getSearchResult: function(key, value) {
    const searchStr = '\&q.field=' + key + '\&q.op=eq\&q.value=' + value;
    return this.getEvents(searchStr);
  }
};

const React = require('react');
const moment = require('client/libs/moment');
const RSVP = require('rsvp');
const fetch = require('client/applications/admin/cores/fetch');


function handleList(resources, eventsData) {
  let events = [];
  const resourceIdNameMap = {};

  resources.forEach(resource => {
    resourceIdNameMap[resource.id] = resource.name;
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
    if (eventType.length === 4) {
      r.operation = __[eventType[2]] + __[eventType[1]];
    } else {
      r.operation = __[eventType[1]] + __[eventType[0]];
    }

    r.traits.forEach(tr => {
      if (tr.name === 'resource_id') {
        r.name = (
          <div>
            <i className={'glyphicon icon-' + eventType[0]} />
            {
              tr.value in resourceIdNameMap ? (
                <a data-type="router"
                  href={'/admin/' + eventType[0] + '/' + tr.value}>
                  {
                    resourceIdNameMap[tr.value] || '(' + tr.value.substring(0, 8) + ')'
                  }
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

function getLogs(eventTypes, searchStr) {
  const deferredList = [];
  eventTypes.forEach((item) => {
    deferredList.push(fetch.get({
      url: '/proxy/ceilometer/v2/events?' +
      'q.field=all_tenants' + '\&q.op=eq' + '\&q.value=1\&' +
      'q.field=event_type\&q.op=eq\&q.value=' + item +
      (searchStr === undefined ? '' : searchStr)
    }));
  });
  return RSVP.all(deferredList);
}

module.exports = {
  handleList: handleList,
  getLogs: getLogs
};

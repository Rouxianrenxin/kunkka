const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    let url = '/api/admin/notice?limit=' + pageLimit + '&page=1';

    return fetch.get({
      url: url
    }).then((res) => {
      res._url = 1;
      return res;
    });
  },
  getNextList: function(nextUrl, pageLimit) {
    let url = '/api/admin/notice?limit=' + pageLimit + '&page='
      + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = nextUrl;
      return res;
    });
  },
  createNotice: function(data) {
    const url = '/api/admin/notice';
    return fetch.post({
      url: url,
      data: data
    });
  },
  batchDelete: function(notices) {
    const reqs = notices.map((notice) => {
      return fetch.delete({
        url: '/api/admin/notice/' + notice.id
      });
    });
    return RSVP.all(reqs);
  }
};

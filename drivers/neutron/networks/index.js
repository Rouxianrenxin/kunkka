var request = require('superagent');
var neutronRemote = require('config')('remote').neutron;

module.exports = {
  listNetworks: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/networks')
      .set('X-Auth-Token', token)
      .end(callback);
  },
  showNetworkDetail: function (networkId, token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/networks/' + networkId)
      .set('X-Auth-Token', token)
      .end(callback);
  },
  listFloatingips: function (token, region, callback) {
    request
      .get(neutronRemote[region] + '/v2.0/floatingips')
      .set('X-Auth-Token', token)
      .end(callback);
  }
};

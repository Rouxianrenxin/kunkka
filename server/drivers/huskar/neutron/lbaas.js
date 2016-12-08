'use strict';

var Base = require('../base.js');
var driver = new Base();

driver.createLoadBalancer = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/loadbalancers',
    token,
    callback,
    theBody
  );
};
driver.createHealthMonitor = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/healthmonitors',
    token,
    callback,
    theBody
  );
};
driver.createListener = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/listeners',
    token,
    callback,
    theBody
  );
};
driver.createResourcePool = function (theBody, token, remote, callback) {
  return driver.postMethod(
    remote + '/v2.0/lbaas/pools',
    token,
    callback,
    theBody
  );
};

/*** Promise ***/

driver.createLoadBalancerAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/loadbalancers',
    token,
    theBody
  );
};
driver.createHealthMonitorAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/healthmonitors',
    token,
    theBody
  );
};
driver.createListenerAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/listeners',
    token,
    theBody
  );
};
driver.createResourcePoolAsync = function (theBody, token, remote) {
  return driver.postMethodAsync(
    remote + '/v2.0/lbaas/pools',
    token,
    theBody
  );
};

module.exports = driver;

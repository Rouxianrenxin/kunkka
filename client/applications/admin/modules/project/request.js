var fetch = require('../../cores/fetch');
var RSVP = require('rsvp');

module.exports = {
  getListInitialize: function(pageLimit, forced) {
    var req = [];
    req.push(this.getList(pageLimit));

    return RSVP.all(req);
  },
  getProjectByIDInitialize: function(projectID, forced) {
    var req = [];
    req.push(this.getProjectByID(projectID));

    return RSVP.all(req);
  },
  getList: function(pageLimit) {
    if(isNaN(Number(pageLimit))) {
      pageLimit = 10;
    }

    var url = '/proxy/keystone/v3/projects';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNextList: function(nextUrl) {
    var url = '/proxy/keystone/v3/' + nextUrl;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getProjectByID: function(projectID) {
    var url = '/proxy/keystone/v3/projects/' + projectID;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  deleteItem: function(items) {
    var deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + item.id
      }));
    });
    return RSVP.all(deferredList);
  },
  getUserIds: function(projectID) {
    var users = [];
    return fetch.get({
      url: '/proxy/keystone/v3/role_assignments?scope.project.id=' + projectID
    }).then((res) => {
      res.role_assignments.forEach((role) => {
        if (role.user) {
          users.push(role);
        }
      });
      return users;
    });
  },
  getUsers: function(userIds, assignments) {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/roles'
    }));
    userIds.forEach((id) => {
      deferredList.push(fetch.get({
        url: '/proxy/keystone/v3/users/' + id
      }));
    });
    return RSVP.all(deferredList).then((res) => {
      var users = [],
        roles = res[0].roles;
      var filterAssignment = function(assignment) {
        var role = [];
        assignment.forEach((a) => {
          roles.some((r) => {
            if (r.id === a) {
              role.push(r);
              return true;
            }
            return false;
          });
        });
        return role;
      };
      for (var i = 1; i < res.length; i++) {
        res[i].user.role = filterAssignment(assignments[userIds[i - 1]]);
        users.push(res[i].user);
      }
      return users;
    });
  },
  getQuotas: function(projectID) {
    return fetch.get({
      url: '/api/v1/' + HALO.user.projectId + '/quota/' + projectID
    });
  },
  modifyQuota: function(type, projectID, quota) {
    var data = {};
    data[type] = quota;
    return fetch.put({
      url: '/api/v1/' + HALO.user.projectId + '/quota/' + projectID,
      data: data
    });
  },
  createProject: function(data) {
    return fetch.post({
      url: '/proxy/keystone/v3/projects',
      data: {
        project: data
      }
    });
  },
  editProject: function(projectID, data) {
    return fetch.patch({
      url: '/proxy/keystone/v3/projects/' + projectID,
      data: {
        project: data
      }
    });
  },
  getDomains: function() {
    return fetch.get({
      url: '/proxy/keystone/v3/domains'
    }).then((res) => {
      var domains = [];
      res.domains.forEach((domain) => {
        if (domain.id === 'defult') {
          domain.unshift(domain);
        } else {
          domains.push(domain);
        }
      });
      return domains;
    });
  },
  getAllUsers: function() {
    var deferredList = [];
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/users'
    }));
    deferredList.push(fetch.get({
      url: '/proxy/keystone/v3/roles'
    }));
    return RSVP.all(deferredList);
  },
  addUser: function(projectID, userID, roleID) {
    var deferredList = [];
    roleID.forEach((id) => {
      deferredList.push(fetch.put({
        url: '/proxy/keystone/v3/projects/' + projectID + '/users/' + userID + '/roles/' + id
      }));
    });
    return RSVP.all(deferredList);
  },
  removeUser: function(projectID, userID, roles) {
    var deferredList = [];
    roles.forEach((role) => {
      deferredList.push(fetch.delete({
        url: '/proxy/keystone/v3/projects/' + projectID + '/users/' + userID + '/roles/' + role
      }));
    });
    return RSVP.all(deferredList);
  }
};
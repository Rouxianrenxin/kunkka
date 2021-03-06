'use strict';

const Base = require('../base.js');
const paginate = require('helpers/paginate.js');
const csv = require('json2csv');
const cp = require('child_process');

// due to Host is reserved word
function Host(app) {
  this.app = app;
  Base.call(this);
}

Host.prototype = {
  getHostList: function(req, res, next) {
    /* set if use cache. */
    let useCache = false;
    let objVar = this.getVars(req, ['projectId']);
    this.__cacheItem = (item, callback) => {
      if (useCache) {
        this.app.get('CacheClient').get(item, callback);
      } else {
        /* no cache, no error. */
        callback(null, null);
      }
    };
    this.__cacheItem('halo-os-hypervisors', (error, cache) => {
      if (error) {
        /* nothing currently. */
      } else if (cache) {
        let obj = paginate('hypervisors', JSON.parse(cache.toString()), '/api/v1/' + objVar.projectId + '/os-hypervisors/detail', objVar.query.page, objVar.query.limit);
        res.json({
          hypervisors: obj.hypervisors,
          hypervisors_links: obj.hypervisors_links
        });
        cache = null;
      } else {
        this.__hosts(objVar, (err, payload) => {
          if (err) {
            this.handleError(err, req, res, next);
          } else {
            let obj = paginate('hypervisors', payload.hypervisors, '/api/v1/' + objVar.projectId + '/os-hypervisors/detail', objVar.query.page, objVar.query.limit);

            if (useCache) {
              this.app.get('CacheClient').set('halo-os-hypervisors', JSON.stringify(obj.hypervisors), function() {}, 3600 * 24);
            }

            res.json({
              hypervisors: obj.hypervisors,
              hypervisors_links: obj.hypervisors_links
            });
            payload = null;
          }
        });
      }
    });
  },
  getHostCSV: function(req, res, next) {
    req.headers.region = req.session.user.regionId;
    let objVar = this.getVars(req, ['projectId']);
    this.__hosts(objVar, (err, payload) => {
      if (err) {
        this.handleError(err, req, res, next);
      } else {
        let __ = req.i18n.__.bind(req.i18n);
        let fields = [{
          label: __('api.nova.server.name'),
          value: 'hypervisor_hostname'
        }, {
          label: 'IP',
          value: 'host_ip'
        }, {
          label: 'vCPU',
          value: row => row.vcpus_used + '/' + row.vcpus,
          name: 'vcpus'
        }, {
          label: __('api.nova.memory'),
          value: row => (row.memory_mb_used / 1024).toFixed(2) + '/' + (row.memory_mb / 1024).toFixed(2),
          name: 'memory'
        }, {
          label: __('api.nova.disk'),
          value: row => row.local_gb_used + '/' + row.local_gb,
          name: 'disk'
        }, {
          label: __('api.nova.vms'),
          value: 'running_vms'
        }, {
          label: __('api.nova.server.type'),
          value: 'hypervisor_type'
        }, {
          label: __('api.nova.status'),
          value: 'status'
        }, {
          label: 'State',
          value: 'state'
        }];
        let customFields = req.query.fields ? req.query.fields.split(',').filter(f => f) : [];
        let finalFields = [];
        if (customFields.length) {
          fields.forEach(field => {
            if (customFields.indexOf(typeof field.value === 'string' ? field.value : field.name) > -1) {
              finalFields.push({
                label: __(field.label),
                value: field.value
              });
            }
          });
        } else {
          fields.forEach(field => {
            finalFields.push({
              label: __(field.label),
              value: field.value
            });
          });
        }
        res.setHeader('Content-Description', 'File Transfer');
        res.setHeader('Content-Type', 'application/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=hosts.csv');
        res.setHeader('Expires', '0');
        res.setHeader('Cache-Control', 'must-revalidate');
        try {
          let output = csv({
            data: payload.hypervisors,
            fields: finalFields
          });
          res.send(output);
        } catch (e) {
          next(e);
        }
      }
    });
  },
  getOSDStats: function (req, res, next) {
    cp.exec('ceph osd df tree --format json --id openstack', function(err, result) {
      if (err) {
        next(err);
      } else {
        try {
          res.send({stats: JSON.parse(result).nodes.filter(item => item.type === 'root')});
        } catch (e) {
          next(e);
        }
      }
    });
  },
  initRoutes: function () {
    return this.__initRoutes(() => {
      this.app.get('/api/v1/:projectId/os-hypervisors/detail', this.getHostList.bind(this));
      this.app.get('/api/v1/:projectId/os-hypervisors/csv', this.getHostCSV.bind(this));
      this.app.get('/api/admin/host/overview/osd-stats', this.getOSDStats.bind(this));
    });
  }
};

Object.assign(Host.prototype, Base.prototype);

module.exports = Host;

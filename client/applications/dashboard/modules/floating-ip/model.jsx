require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

const BasicProps = require('client/components/basic_props/index');

const deleteModal = require('client/components/modal_delete/index');
const applyModal = require('./pop/apply_ip/index');
const associateInstance = require('./pop/associate_instance/index');
const dissociateRelated = require('./pop/dissociate_related/index');
const changeBandwidth = require('./pop/change_bandwidth/index');
const assciateLb = require('./pop/associate_lb/index');

const config = require('./config.json');

const request = require('./request');
const router = require('client/utils/router');
const msgEvent = require('client/applications/dashboard/cores/msg_event');
const getStatusIcon = require('../../utils/status_icon');
const utils = require('../../utils/utils');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

class Model extends React.Component {

  constructor(props) {
    super(props);

    let enableBandwidth = HALO.settings.enable_floatingip_bandwidth;
    if (!enableBandwidth) {
      let dropdown = config.btns[3].dropdown.items[0].items;
      delete dropdown[2];
    }

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    //In case of having 2 or more external network, show the floating_network of the floating ip.

    this.state.config.table.column.find((col) => {
      if (col.key === 'ip_adrs') {
        col.sortBy = function(item1, item2) {
          let a = item1.floating_ip_address,
            b = item2.floating_ip_address;
          return utils.ipFormat(a) - utils.ipFormat(b);
        };
      }
    });
    this.tableColRender(this.state.config.table.column);

    request.getNetworks().then(networks => {
      let exNetworks = networks.filter(n => n['router:external']);
      if(exNetworks.length > 1) {
        let newConfig = this.state.config,
          newColumn = {
            title: __.external_network,
            key: 'external_network'
          };
        newConfig.table.column.splice(1, 0, newColumn);
        this.setState({
          config: newConfig
        });
      }
      this.tableColRender(this.state.config.table.column);
    });

    msgEvent.on('dataChange', (data) => {
      if (this.props.style.display !== 'none') {
        if (data.resource_type === 'floatingip') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/floating-ip');
          }
        }
        if(data.resource_type === 'instance' && data.action === 'delete' && data.stage === 'end') {
          this.refresh({
            detailRefresh: true
          }, false);
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      if (this.state.config.table.loading) {
        this.loadingTable();
      } else {
        this.getTableData(false);
      }
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'external_network':
          column.render = (col, item, i) => {
            return (<span>
              <i className="glyphicon icon-network" />
              <span>
                {item.floating_network_name || '(' + item.floating_network_id.slice(0, 8) + ')'}
              </span>
            </span>);
          };
          break;
        case 'assc_resource': //router, server or lbaas
          column.render = (col, item, i) => {
            if (item.association && item.association.type === 'server') {
              let server = item.association.device;
              return (
                <span>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/dashboard/instance/' + server.id}>
                    {server.name}
                  </a>
                </span>
              );
            } else if (item.lbaas) {
              return (
                <span>
                  <i className="glyphicon icon-lb" />
                  <a data-type="router" href={'/dashboard/loadbalancer/' + item.lbaas.id}>
                    {item.lbaas.name || '(' + item.lbaas.id.substring(0, 8) + ')'}
                  </a>
                </span>
              );
            }
            return '';
          };
          break;
        case 'bandwidth':
          column.render = (col, item, i) => {
            let rateLimit = Number(item.rate_limit / 1024);
            if(rateLimit === 0) {
              return '';
            }
            return isNaN(rateLimit) ? __.unlimited : (rateLimit + ' Mbps');
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            let status = item.status.toLowerCase();
            if (status === 'active') {
              return (
                <div className="status-data">
                  <i className="glyphicon icon-status-light in-use"></i>
                  {__['in-use']}
                </div>
              );
            } else if (status === 'down') {
              return (
                <div className="status-data">
                  <i className="glyphicon icon-status-light active"></i>
                  {__.available}
                </div>
              );
            } else {
              return item.status;
            }
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      let table = this.state.config.table;
      res.forEach(ele => {
        ele.status = ele.status.toUpperCase();
      });
      table.data = res;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    rows.forEach((row) => {
      row.name = row.floating_ip_address;
    });

    let that = this;
    switch (key) {
      case 'delete':
        let hasSource = rows.some((ele) => ele.association.type === 'server');
        deleteModal({
          __: __,
          action: 'release',
          type: 'floating_ip',
          data: rows,
          disabled: hasSource ? true : false,
          tip: hasSource ? __.tip_fip_has_source : null,
          onDelete: function(_data, cb) {
            request.deleteFloatingIps(rows).then((res) => {
              cb(true);
              that.refresh({}, true);
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'create':
        applyModal(null, () => {
          this.refresh({
            tableLoading: true,
            detailLoading: true,
            clearState: true,
            detailRefresh: true
          }, true);
        });
        break;
      case 'dissociate':
        dissociateRelated(rows[0]);
        break;
      case 'assc_to_instance':
        associateInstance(rows[0]);
        break;
      case 'change_bw':
        changeBandwidth(rows[0], null, () => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'assc_to_lb':
        assciateLb(rows[0]);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    for(let key in btns) {
      switch (key) {
        case 'assc_to_lb':
        case 'assc_to_instance':
          btns[key].disabled = (rows.length === 1 && !rows[0].association.type && !rows[0].lbaas) ? false : true;
          break;
        case 'dissociate':
          btns[key].disabled = (rows.length === 1 && (rows[0].association.type || rows[0].lbaas)) ? false : true;
          break;
        case 'change_bw':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length > 0) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    let isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents
    });
  }

  getBasicPropsItems(item) {
    let rateLimit = Number(item.rate_limit);
    let bandwidth;
    if(rateLimit !== 0) {
      bandwidth = isNaN(rateLimit) ? __.unlimited : (rateLimit / 1024 + ' Mbps');
    } else {
      bandwidth = '-';
    }
    let getResource = function() {
      if(item.association && item.association.type === 'server') {
        return (<span>
          <i className="glyphicon icon-instance" />
          <a data-type="router" href={'/dashboard/instance/' + item.association.device.id}>
            {item.association.device.name}
          </a>
        </span>);
      } else if(item.lbaas) {
        return (<span>
          <i className="glyphicon icon-lb" />
          <a data-type="router" href={'/dashboard/loadbalancer/' + item.lbaas.id}>
            {item.lbaas.name}
          </a>
        </span>);
      } else {
        return '-';
      }
    };
    let type = {}, status;
    if (item.status.toLowerCase() === 'active') {
      type.icon = 'light';
      type.status = 'in-use';
      status = 'in-use';
    } else if (item.status.toLowerCase() === 'down') {
      type.icon = 'light';
      type.status = 'active';
      status = 'available';
    }

    let items = [{
      title: __.id,
      content: item.id
    }, {
      title: __.ip + __.address,
      type: 'copy',
      content: item.floating_ip_address
    }, {
      title: __.associate_gl + __.resource,
      content: getResource()
    }, {
      title: __.bandwidth,
      content: bandwidth
    }, {
      title: __.status,
      content: getStatusIcon(item.status, {status: status, type: type})
    }];

    return items;
  }

  refresh(data, forceUpdate) {
    if (data) {
      let path = router.getPathList();
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(forceUpdate, data ? data.detailRefresh : false);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  render() {
    return (
      <div className="halo-module-floating-ip" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;

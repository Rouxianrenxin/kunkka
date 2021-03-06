const React = require('react');
const {Button, Modal, Step} = require('client/uskin/index');
const SelectMetric = require('./select_metric');
const AlarmConfig = require('./alarm_config');
const SetNotification = require('./set_notification');

const request = require('../../request');
const resourceList = require('./resources');
const initialState = require('./state');
const createNotification = require('../../../notification/pop/modal/index');
const getErrorMessage = require('../../../../utils/error_message');
const {getTime} = require('../../../../utils/utils');
const utils = require('../../utils');
const hour = Number(HALO.configs.telemerty.hour),
  day = Number(HALO.configs.telemerty.day),
  week = Number(HALO.configs.telemerty.week),
  month = Number(HALO.configs.telemerty.month),
  year = Number(HALO.configs.telemerty.year);

let title;
let measureData = [];

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    switch(props.obj.type) {
      case 'alarm':
        this.state = initialState.getAlarmState(props.obj.item);
        title = __.modify + __.alarm;
        break;
      case 'create':
      case 'instance':
      case 'volume':
      default:
        this.state = initialState.getInitialState();
        title = __.create + __.alarm;
        break;
    }

    ['onPrevPage', 'onNextPage', 'onChangeState', 'createNotification', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    this.getResourceList();
    this.getNofications();

    this.InsPortMap = {};
    this.VolumeResourceMap = {};
  }

  getResourceList() {
    request.getResources().then((data) => {
      const obj = this.props.obj;
      let items = [];
      let update = (resources) => {
        this.setState({
          loadingList: false,
          resources: resources
        });
      };

      switch(obj.type) {
        case 'alarm':
          items = resourceList.getInitialList(data);
          resourceList.getOriginalResource(obj.item).then((resource) => {
            this.setState({
              loadingList: false,
              resources: items
            });
            if (resource) {
              this.setState({
                loadingChart: true
              });
              this.onChangeState('resource', resource);
            }
          });
          break;
        case 'create':
          items = resourceList.getInitialList(data);
          update(items);
          break;
        case 'instance':
          items = resourceList.getInstanceList(obj.item);
          update(items);
          break;
        case 'volume':
          items = resourceList.getVolumeList(obj.item);
          update(items);
          break;
        default:
          break;
      }

    });
  }

  updateGraph(data, measureGranularity) {
    this.refs.select_metric.updateGraph(data, measureGranularity);
    this.refs.alarm_config.updateGraph(data, measureGranularity, this.state.threshold);
  }

  getStartTime(granularity) {
    switch(granularity) {
      case hour:
        return getTime('hour');
      case day:
        return getTime('day');
      case week:
        return getTime('week');
      case month:
        return getTime('month');
      case year:
        return getTime('year');
      default:
        return granularity;
    }
  }

  getNofications() {
    request.getNofitications().then((data) => {
      this.setState({
        notifications: data
      });
    });
  }

  onPrevPage(e) {
    this.onChangeState('page', this.state.page - 1);
  }

  onNextPage(e) {
    this.onChangeState('page', this.state.page + 1);
  }

  isNumber(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
  }

  onChangeState(field, value) {
    let state = {}, granularity;
    state[field] = value;

    this.setState(state, () => {
      let st = this.state;

      switch (field) {
        case 'measureGranularity':
        case 'resource':
        case 'granularity':
          if (st.resource && st.measureGranularity) {
            switch(field) {
              case 'granularity':
                granularity = value;
                break;
              case 'resource':
              case 'measureGranularity':
              default:
                granularity = st.granularity;
            }

            let resourceType = this.state.resourceType;

            if (resourceType === 'instance') {
              let resourceID = st.resource.id;
              let startTime = this.getStartTime(st.granularityKey);

              request.getResourceMeasures(resourceID, st.metricType, granularity, startTime).then((data) => {
                measureData = data;
                this.updateGraph(data, granularity);
              }).catch((err) => {
                this.updateGraph([], granularity);
              });

            } else if (resourceType === 'volume') {
              let update = (volResource) => {
                let volResourceId = volResource.metrics[st.metricType];
                if (volResourceId) {
                  let startTime = this.getStartTime(st.granularityKey);
                  request.getVolumeMeasures(volResourceId, granularity, startTime).then((data) => {
                    this.updateGraph(data, granularity);
                  }).catch((err) => {
                    this.updateGraph([], granularity);
                  });
                } else {
                  this.updateGraph([], granularity);
                }
              };

              let volume = st.resource;
              let volumeId = volume.id;
              let attch = volume.attachments[0];
              let originalId = attch.server_id + '-' + attch.device.split('/')[2];

              let map = this.VolumeResourceMap;
              if (map[volumeId]) {
                update(map[volumeId][0]);
              } else {
                request.getVolumeResourceId(originalId).then((resources) => {
                  if (resources.length > 0) {
                    map[volumeId] = resources;
                    update(map[volumeId][0]);
                  } else {
                    this.updateGraph([], granularity);
                  }
                });
              }
            } else if (resourceType === 'instance_network_interface') {
              let resource = st.resource;
              let instanceId = resource.device_id;
              let portId = resource.id;
              let update = (ports) => {
                let portMeasure = this.findPortMeasures(ports, portId);
                if (portMeasure) {
                  let startTime = this.getStartTime(st.granularityKey);

                  request.getResourceMeasures(portMeasure.id, st.metricType, granularity, startTime).then((data) => {
                    this.updateGraph(data, granularity);
                  }).catch((err) => {
                    this.updateGraph([], granularity);
                  });

                  if (!resource._measureId) {
                    resource._measureId = portMeasure.id;
                    this.setState({
                      resource: resource
                    });
                  }
                } else {
                  this.updateGraph([], granularity);
                }
              };

              let map = this.InsPortMap;
              if (map[instanceId]) {
                update(map[instanceId]);
              } else {
                request.getNetworkResources(instanceId).then((ports) => {
                  map[instanceId] = ports;
                  update(map[instanceId]);
                });
              }
            }
          }
          break;
        case 'threshold':
          this.refs.alarm_config.updateGraph(measureData, st.granularityKey, st.threshold);
          break;
        default:
          break;
      }
    });
  }

  findPortMeasures(ports, portId) {
    return ports.find((port) => port.name === ('tap' + portId.substr(0, 11)));
  }

  createNotification(id, e) {
    createNotification(null, this.refs.modal, (notif) => {
      request.getNofitications(true).then((data) => {
        this.setState({
          notifications: data
        });
      });
    });
  }

  onConfirm(e) {
    let reqData = {};
    this.setState({
      disabled: true
    });

    const obj = this.props.obj;
    const state = this.state;
    const notifyList = state.notificationLists;
    let urlPrefix = 'zaqar://?queue_name={0}&project_id=' + HALO.user.projectId + '&paths=/messages&methods=POST&expires=' + utils.getISOTime(1);
    let alarmActions = notifyList.filter((ele) =>
      ele.status === 'alarm' && ele.notification !== 'none'
    ).map((ele) =>
      urlPrefix.replace('{0}', ele.notification)
    );
    let okActions = notifyList.filter((ele) =>
      ele.status === 'ok' && ele.notification !== 'none'
    ).map((ele) =>
      urlPrefix.replace('{0}', ele.notification)
    );
    let insufficientDataActions = notifyList.filter((ele) =>
      ele.status === 'insufficient_data' && ele.notification !== 'none'
    ).map((ele) =>
      urlPrefix.replace('{0}', ele.notification)
    );

    let data = {};
    if (obj.type === 'alarm') {
      data = obj.item;
    }

    let resourceId = '';
    let resourceType = state.resourceType;
    switch(state.resourceType) {
      case 'instance':
        resourceId = state.resource ? state.resource.id : '';
        break;
      case 'instance_network_interface':
        resourceId = state.resource ? state.resource._measureId : '';
        break;
      case 'volume':
        resourceId = this.VolumeResourceMap[state.resource.id][0].id;
        resourceType = 'instance_disk';
        break;
      default:
        break;
    }

    data.name = state.name;
    data.description = state.descrition;
    data.alarm_actions = alarmActions;
    data.ok_actions = okActions;
    data.insufficient_data_actions = insufficientDataActions;
    data.type = 'gnocchi_resources_threshold';
    data.gnocchi_resources_threshold_rule = {
      aggregation_method: state.aggregationMethod,
      comparison_operator: state.comparisonOperator,
      evaluation_periods: state.evaluationPeriods,
      granularity: state.granularity,
      metric: state.metricType,
      resource_id: resourceId,
      resource_type: resourceType,
      threshold: state.threshold
    };
    // deep Clone ORZ~
    let cloneObj = function(ob) {
      let str, newobj = ob.constructor === Array ? [] : {};
      if(typeof ob !== 'object') {
        return null;
      } else {
        str = JSON.stringify(ob);
        newobj = JSON.parse(str);
        for(let i in ob) {
          newobj[i] = typeof ob[i] === 'object' ?
          cloneObj(ob[i]) : ob[i];
        }
      }
      return newobj;
    };
    reqData = cloneObj(data);
    if(obj && obj.item && obj.item.gnocchi_resources_threshold_rule) {
      delete reqData.status;
      reqData.gnocchi_resources_threshold_rule.resource_id = obj.item.gnocchi_resources_threshold_rule.resource_id;
    }

    switch(obj.type) {
      case 'create':
      case 'instance':
      case 'volume':
        request.createAlarm(data).then((res) => {
          this.setState({
            visible: false
          });

          let cb = this.props.callback;
          cb && cb(res);
        }).catch((err) => {
          this.setState({
            disabled: false,
            hideError: false,
            errorMsg: getErrorMessage(err)
          });
        });
        break;
      case 'alarm':
        request.updateAlarm(data.alarm_id, reqData).then((res) => {
          this.setState({
            visible: false
          });
          let cb = this.props.callback;
          cb && cb(res);
        }).catch((err) => {
          this.setState({
            disabled: false,
            hideError: false,
            errorMsg: getErrorMessage(err)
          });
        });
        break;
      default:
        break;
    }

  }

  renderBtns(props, state) {
    let left = {
      value: __.prev,
      type: 'cancel',
      onClick: this.onPrevPage
    };
    let right = {
      value: __.next,
      type: 'create',
      onClick: this.onNextPage
    };

    let disabled = false;
    switch(state.page) {
      case 0:
        disabled = !this.state.resource;
        break;
      case 1:
        disabled = !this.state.name;
        break;
      case 2:
        right = {
          value: this.props.obj.type === 'alarm' ? __.modify : __.create,
          type: 'create',
          onClick: this.onConfirm
        };
        break;
      default:
        break;
    }
    disabled = disabled || state.disabled;

    return (
      <div>
        <div className="left-side">
          {state.page > 0 ? <Button {...left} disabled={state.page === 2 && state.disabled} /> : null}
        </div>
        <div className="right-side">
          <Button {...right} disabled={disabled} />
        </div>
      </div>
    );
  }

  render() {
    const props = this.props;
    const state = this.state;

    let steps = [{
      name: __.select_metric
    }, {
      name: __.set_alarm_policy
    }, {
      name: __.set_notification
    }];
    steps[state.page].default = true;

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible} width={880} nokeyboard>
        <div className="modal-bd halo-com-modal-create-alarm">
          <div className="step-box">
            <Step items={steps} consecutive={true} disabled={true} />
          </div>
          <div className={'slide-box page-' + (state.page)}>
            <SelectMetric ref="select_metric" state={state} onChangeState={this.onChangeState} />
            <AlarmConfig ref="alarm_config" state={state} onChangeState={this.onChangeState} />
            <SetNotification state={state} onChangeState={this.onChangeState} createNotification={this.createNotification} />
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-alarm">
          {this.renderBtns(props, state)}
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;

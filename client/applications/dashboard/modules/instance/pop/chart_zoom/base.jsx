const React = require('react');
const {Modal, Button} = require('client/uskin/index');

const request = require('../../request');
const timeUtils = require('../../../../utils/utils');
const utils = require('../../../alarm/utils');
const LineChart = require('client/components/line_chart/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      contents: {},
      page: props.obj.item.page || 1,
      key: props.obj.item.chartDetail.key || 300,
      data: props.obj.item.chartDetail.data,
      pagingAni: false,
      step: true
    };
  }

  componentWillMount() {
    let moveTo1, moveTo2, rule, rules = 0;

    let ss = document.styleSheets;

    for (let i = 0; i < ss.length; ++i) {
      for (let x = 0; x < ss[i].cssRules.length; ++x) {
        rule = ss[i].cssRules[x];
        if (rule.name && rule.name.indexOf('insDetail') !== -1 && rule.type === CSSRule.KEYFRAMES_RULE) {
          rules ++;
        }
      }
    }
    this.state.data.forEach((d, index) => {
      if (index !== 0 && (rules / 2) < index) {
        moveTo1 = '@keyframes insDetail' + index + (index + 1) + '{0% {left: ' + (-740 * (index - 1)) + 'px;}\n' +
        '100%{left: ' + (-740 * index) + 'px;}}';
        moveTo2 = '@keyframes insDetail' + (index + 1) + index + '{0% {left: ' + (-740 * index) + 'px;}\n' +
        '100%{left: ' + (-740 * (index - 1)) + 'px;}}';
        ss[0].insertRule(moveTo1);
        ss[0].insertRule(moveTo2);
      }
    });

    this.renderChart();
  }

  onRight(page, data, step) {
    this.setState({
      page: page,
      pagingAni: true,
      step: step
    }, () => {
      this.renderChart(data);
    });
  }

  renderChart(rows, refresh) {
    let rawItem = rows || this.props.obj.item.chartDetail;
    let that = this,
      tabKey = 'monitor',
      page = this.state.page;

    let updateDetailMonitor = function(newContents, loading) {
      that.setState({
        contents: newContents,
        loading: loading
      });
    };

    let time = rawItem.time;

    let contents = this.state.contents,
      telemerty = HALO.configs.telemerty,
      hour = telemerty.hour,
      day = telemerty.day,
      week = telemerty.week,
      month = telemerty.month,
      year = telemerty.year;

    let tabItems = [{
      name: __.three_hours,
      key: hour,
      value: hour,
      time: 'hour'
    }, {
      name: __.one_day,
      key: day,
      value: day,
      time: 'day'
    }, {
      name: __.one_week,
      key: week,
      value: week,
      time: 'week'
    }, {
      name: __.one_month,
      key: month,
      value: month,
      time: 'month'
    }, {
      name: __.one_year,
      key: year,
      value: year,
      time: 'year'
    }];

    let granularity = '';
    if (rawItem.granularity) {
      granularity = rawItem.granularity;
    } else {
      granularity = hour;
      contents[tabKey] = (<div/>);
      updateDetailMonitor(contents, true);
    }

    tabItems.some((ele) => ele.key === this.state.key ? (ele.default = true, true) : false);

    let updateContents = (arr) => {
      let style = {
        width: 750 * arr.length + 'px',
        position: 'relative',
        top: '-30px',
        animationDuration: '.3s',
        animationFillMode: 'both'
      };

      if (this.state.pagingAni) {
        if (this.state.step) {
          style.animationName = 'insDetail' + (page + 1) + page;
        } else {
          style.animationName = 'insDetail' + (page - 1) + page;
        }
      } else {
        style.left = -740 * (page - 1) + 'px';
      }

      contents[tabKey] = (
        <div style={{width: '780px'}}>
          <div className={page === 1 ? 'left hidden' : 'left'}
            onClick={this.onRight.bind(this, page - 1, {
              data: arr,
              item: rawItem.item,
              granularity:granularity,
              time: time
            }, true)}>
            <i className="glyphicon icon-arrow-left" />
          </div>
          <div className={page === arr.length ? 'right hidden' : 'right'}
            onClick={this.onRight.bind(this, page + 1, {
              data: arr,
              item: rawItem.item,
              granularity: granularity,
              time: time
            }, false)}>
            <i className="glyphicon icon-arrow-right" />
          </div>
          <LineChart
            __={__}
            item={rawItem.item}
            data={arr}
            granularity={granularity}
            tabItems={tabItems}
            className={'detail'}
            style={style}
            start={timeUtils.getTime(time)}
            clickTabs={(e, tab, item) => {
              this.setState({
                key: tab.key
              }, () => {
                that.renderChart({
                  data: arr,
                  item: item,
                  granularity: tab.value,
                  time: tab.time
                }, true);
              });
            }} >
            <Button iconClass="refresh"
              onClick={this.renderChart.bind(this, {
                data: arr,
                item: rawItem.item,
                granularity: granularity,
                time: time
              }, true)}/>
          </LineChart>
        </div>
      );
      updateDetailMonitor(contents);
    };

    if (rawItem.granularity) {
      updateContents([]);
    }
    let filter = this.props.obj.item.that.state.filter, rawData = [],
      instanceMetricType = [], portMetricType = [], diskMetricType = [];
    let filterMetric = utils.getFilterMetric(filter).filter;
    switch(filter) {
      case 'network_flow':
        instanceMetricType = [];
        diskMetricType = [];
        portMetricType = filterMetric;
        break;
      case 'device':
        instanceMetricType = ['disk.read.bytes.rate', 'disk.write.bytes.rate'];
        portMetricType = [];
        diskMetricType = ['disk.device.read.bytes.rate', 'disk.device.write.bytes.rate', 'disk.device.read.requests.rate', 'disk.device.write.requests.rate'];
        break;
      case 'cpu_memory':
        instanceMetricType = filterMetric;
        portMetricType = [];
        diskMetricType = [];
        break;
      default:
        instanceMetricType = ['cpu_util', 'memory.usage', 'disk.read.bytes.rate', 'disk.write.bytes.rate'];
        portMetricType = ['network.incoming.bytes.rate', 'network.outgoing.bytes.rate'];
        diskMetricType = ['disk.device.read.bytes.rate', 'disk.device.write.bytes.rate', 'disk.device.read.requests.rate', 'disk.device.write.requests.rate'];
    }
    rawItem.data.forEach(item => {
      if (filterMetric.indexOf(item.metricType) !== -1) {
        rawData.push(item);
      }
    });

    if (!refresh) {
      updateContents(rawData);
    } else {
      let resourceId = rawItem.item.id,
        diskInsData = [], ids = [],
        volDeviceId = this.getDiskData(rawItem.item.volume);

      request.getResourceMeasures(resourceId, instanceMetricType, granularity, timeUtils.getTime(time)).then((res) => {
        let arr = res.map((r, index) => ({
          title: utils.getMetricName(instanceMetricType[index]),
          metricType: instanceMetricType[index],
          color: utils.getTriangleColor(instanceMetricType[index]),
          triangleColor: utils.getTriangleColor(instanceMetricType[index]),
          unit: utils.getUnit('instance', instanceMetricType[index], r),
          yAxisData: utils.getChartData(r, granularity, timeUtils.getTime(time), instanceMetricType[index], 'instance'),
          xAxis: utils.getChartData(r, granularity, timeUtils.getTime(time), instanceMetricType[index])
        }));
        diskInsData = arr;
        request.getDiskResourceId(volDeviceId, granularity).then(diskRes => {
          diskMetricType.forEach(type => {
            diskRes.forEach(_disk => {
              _disk[0] && ids.push(_disk[0].metrics[type]);
            });
          });
          if (diskRes.length !== 0) {
            request.getDiskMeasures(ids, granularity, timeUtils.getTime(time)).then((_r) => {
              let arrDisk = _r.map((r, index) => ({
                title: utils.getMetricName(diskMetricType[index % 4], rows[0].volume[parseInt(index / 4, 10)]),
                metricType: diskMetricType[index % 4],
                color: utils.getTriangleColor(diskMetricType[index % 4]),
                triangleColor: utils.getTriangleColor(diskMetricType[index % 4]),
                unit: utils.getUnit('volume', diskMetricType[index % 4], r),
                yAxisData: utils.getChartData(r, granularity, timeUtils.getTime(time), diskMetricType[index % 4], 'volume'),
                xAxis: utils.getChartData(r, granularity, timeUtils.getTime(time), diskMetricType[index % 4])
              }));
              diskInsData = arr.concat(arrDisk);
              request.getNetworkResourceId(resourceId).then(_data => {
                const addresses = rawItem.item.addresses;
                let ips = [], _datas = [];
                for (let _key in addresses) {
                  addresses[_key].filter((addr) => addr['OS-EXT-IPS:type'] === 'fixed').some((addrItem) => {
                    _data.forEach(_portData => {
                      if (addrItem.port.id.substr(0, 11) === _portData.name.substr(3)) {
                        ips.push(addrItem.port.fixed_ips[0].ip_address);
                        _datas.push(_portData);
                      }
                    });
                  });
                }
                request.getNetworkResource(granularity, timeUtils.getTime(time), rawItem.item, _datas).then(resourceData => {
                  let portArr = resourceData.map((_rd, index) => ({
                    title: utils.getMetricName(portMetricType[index % 2], ips[parseInt(index / 2, 10)]),
                    color: utils.getTriangleColor(portMetricType[index % 2]),
                    metricType: portMetricType[index % 2],
                    triangleColor: utils.getTriangleColor(portMetricType[index % 2]),
                    unit: utils.getUnit('instance', portMetricType[parseInt(index / 2, 10)], _rd),
                    yAxisData: utils.getChartData(_rd, granularity, timeUtils.getTime(time), portMetricType[index % 2], 'instance'),
                    xAxis: utils.getChartData(_rd, granularity, timeUtils.getTime(time), portMetricType[index % 2])
                  }));
                  updateContents(diskInsData.concat(portArr));
                });
              });
            });
          } else {
            if (portMetricType.length !== 0) {
              request.getNetworkResourceId(resourceId).then(_data => {
                const addresses = rawItem.item.addresses;
                let ips = [], _datas = [];
                for (let _key in addresses) {
                  addresses[_key].filter((addr) => addr['OS-EXT-IPS:type'] === 'fixed').some((addrItem) => {
                    _data.forEach(_portData => {
                      if (addrItem.port.id.substr(0, 11) === _portData.name.substr(3)) {
                        ips.push(addrItem.port.fixed_ips[0].ip_address);
                        _datas.push(_portData);
                      }
                    });
                  });
                }
                request.getNetworkResource(granularity, timeUtils.getTime(time), rawItem.item, _datas).then(resourceData => {
                  let portArr = resourceData.map((_rd, index) => ({
                    title: utils.getMetricName(portMetricType[index % 2], ips[parseInt(index / 2, 10)]),
                    color: utils.getTriangleColor(portMetricType[index % 2]),
                    metricType: portMetricType[index % 2],
                    triangleColor: utils.getTriangleColor(portMetricType[index % 2]),
                    unit: utils.getUnit('instance', portMetricType[parseInt(index / 2, 10)], _rd),
                    yAxisData: utils.getChartData(_rd, granularity, timeUtils.getTime(time), portMetricType[index % 2], 'instance'),
                    xAxis: utils.getChartData(_rd, granularity, timeUtils.getTime(time), portMetricType[index % 2])
                  }));
                  updateContents(diskInsData.concat(portArr));
                });
              });
            } else {
              updateContents(diskInsData);
            }
          }
        });
      }).catch(error => {
        updateContents([{}]);
      });
    }
  }

  getDiskData(volume) {
    let volDevice, volDeviceId = [];
    volume.forEach(vol => {
      volDevice = vol.attachments[0].device.split('/');
      volDeviceId.push(vol.attachments[0].server_id + '-' + volDevice[volDevice.length - 1]);
    });

    return volDeviceId;
  }

  render() {
    let props = this.props;
    let state = this.state;

    return (
      <Modal ref="modal" {...props} title={__.monitor_data} visible={state.visible} width={778} nokeyboard>
        <div className="modal-bd halo-com-modal-chart-zoom">
          <div className="modal-content">
            {Object.keys(state.contents).map((key) =>
              state.contents[key] ?
              <div key={key}
                className="detail-content"
                data-filed={key}
                style={{display: 'block'}}>
                {state.contents[key]}
              </div>
              : null
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;

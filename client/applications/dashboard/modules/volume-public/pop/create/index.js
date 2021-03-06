let commonModal = require('client/components/modal_common/index');
let config = require('./config.json');
let request = require('../../../volume/request');

let getErrorMessage = require('client/applications/dashboard/utils/error_message');
let volTypes = require('../../../volume/pop/create/volume_type');

const ENABLE_CHARGE = HALO.settings.enable_charge;
const DEFAULT_PRICE = '0.0000';

let allCapacity;

let instanceList = [];

function isLocal(volumeType) {
  return volumeType === 'lvm';
}

function setLocalType(refLocalToInstance, instances, hide, instancesValue) {
  let value;
  instances = [{
    id: undefined,
    name: __.no_select
  }].concat(instances);

  if(instancesValue) {
    value = instancesValue;
  } else {
    value = instances.length > 0 ? instances[0].id : undefined;
  }
  refLocalToInstance.setState({
    hide,
    data: instances.map(ins => {
      return {
        id: ins.id,
        name: ins.name
      };
    }),
    value
  });
}

let copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

function getCapacity(overview) {
  //capacity of all the types
  allCapacity = overview.overview_usage.gigabytes;

  //capacity set by user
  let settings = HALO.settings;
  let singleMax = settings.max_single_gigabytes ? settings.max_single_gigabytes : 1000;

  //capacity set by front-end side
  let defaultTotal = 1000;

  let typeCapacity = {};
  overview.volume_types.forEach((type) => {
    typeCapacity[type] = overview.overview_usage['gigabytes_' + type];

    let min = 1, max, total, used;

    //capacity of the type
    let capacity = overview.overview_usage['gigabytes_' + type];

    if (capacity.total < 0) {
      if (allCapacity.total < 0) {
        if (settings.total_gigabytes) {
          total = settings.total_gigabytes;
        } else {
          total = defaultTotal;
        }
      } else {
        total = allCapacity.total;
      }
      used = allCapacity.used;
    } else {
      total = capacity.total;
      used = capacity.used;
    }

    max = total - used;
    if (max > singleMax) {
      max = singleMax;
    }
    if (max <= 0) {
      max = 0;
      min = 0;
    }

    typeCapacity[type].max = max;
    typeCapacity[type].min = min;
  });

  return typeCapacity;
}

function pop(obj, parent, callback) {
  let copyConfig = copyObj(config);
  if (obj) {
    copyConfig.fields.unshift({
      type: 'icon_label',
      field: 'snapshot',
      icon_type: 'snapshot',
      text: obj.name
    });
  }

  let typeCapacity = {};
  let volumeTypes;

  let props = {
    __: __,
    parent: parent,
    config: copyConfig,
    onInitialize: function(refs) {
      refs.type.setState({
        renderer: volTypes
      });

      request.getSources().then(sources => {
        instanceList = sources.instance;

        request.getOverview().then((overview) => {

          typeCapacity = getCapacity(overview);

          volumeTypes = overview.volume_types;
          let volumeType = volumeTypes[0];

          if (volumeTypes.length !== 0) {
            let setTypes = () => {
              if (obj) {
                volumeType = obj.volume.volume_type || null;
                refs.type.setState({
                  renderer: volTypes,
                  data: volumeType ? [volumeType] : [],
                  value: volumeType,
                  hide: false
                });
                setLocalType(refs.local_to_instance, instanceList, !isLocal(volumeType));
              } else {
                refs.type.setState({
                  renderer: volTypes,
                  data: volumeTypes,
                  value: volumeTypes.length > 0 ? volumeType : null,
                  hide: false
                });
                setLocalType(refs.local_to_instance, instanceList, !isLocal(volumeType));
              }
            };

            setTypes();
            if (ENABLE_CHARGE) {
              refs.charge.setState({
                hide: false
              });
            }
          } else {
            refs.warning.setState({
              value: __.no_avail_type,
              hide: false
            });
          }
        });
      });
    },
    onConfirm: function(refs, cb) {
      let data = {};
      let schedulerHints;
      let localToInstanceUuid = refs.local_to_instance.state.value;
      data.name = refs.name.state.value;
      data.volume_type = obj ? obj.volume.volume_type : refs.type.refs.volume_type.state.value;
      data.size = Number(refs.capacity_size.state.value);
      if (obj) {
        data.snapshot_id = obj.id;
      }

      if(isLocal(data.volume_type) && localToInstanceUuid) {
        schedulerHints = {
          'local_to_instance': localToInstanceUuid
        };
      }

      request.createVolume(data, schedulerHints).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      });
    },
    onAction: function(field, state, refs) {

      let volType = refs.type.refs.volume_type ? refs.type.refs.volume_type.state.value : refs.type.state.data;

      switch (field) {
        case 'capacity_size': {
          let cap = refs.capacity_size.state;
          let isError = cap.max < cap.min || cap.max <= 0;
          let isInputError = state.error;
          let value = state.min >= state.max ? state.min : refs.capacity_size.state.value;
          let inputValue = state.min >= state.max ? state.min : refs.capacity_size.state.inputValue;

          refs.capacity_size.setState({
            value: value,
            inputValue: inputValue || 1,
            disabled: isError
          });

          refs.btn.setState({
            disabled: refs.capacity_size.state.hide || isError || isInputError
          });

          refs.warning.setState({
            value: __.tip_volume_create_error,
            hide: !isError
          });

          if (ENABLE_CHARGE) {
            let sliderEvent = state.eventType === 'mouseup';
            let inputEvnet = state.eventType === 'change' && !state.error;

            if (!isError) {
              if (sliderEvent || inputEvnet) {
                let unitPrice = (HALO.prices && HALO.prices.volume[volType] !== undefined) ? HALO.prices.volume[volType] : DEFAULT_PRICE;
                let price = unitPrice * value;
                price = isNaN(price) ? DEFAULT_PRICE : price.toFixed(4);

                refs.charge.setState({
                  value: price
                });
              }
            } else {
              refs.charge.setState({
                value: DEFAULT_PRICE
              });
            }
          }
          break;
        }
        case 'type': {
          //set slider data

          let cap = typeCapacity[volType],
            min, max, isError;

          setLocalType(refs.local_to_instance, instanceList, !isLocal(state.value));

          if (cap) {
            min = obj ? obj.size : cap.min;
            max = cap.max;
            isError = cap.max < cap.min || cap.max <= 0;
          }

          volType && refs.capacity_size.setState({
            min: min || 1,
            max: max,
            value: min,
            inputValue: min,
            disabled: false,
            error: false,
            hide: false
          });

          //set charge
          if (ENABLE_CHARGE) {
            if (!isError) {
              let unitPrice = (HALO.prices && HALO.prices.volume[volType] !== undefined) ? HALO.prices.volume[volType] : DEFAULT_PRICE;
              let price = unitPrice * min;
              price = isNaN(price) ? DEFAULT_PRICE : price.toFixed(4);

              refs.charge.setState({
                value: price
              });
            } else {
              refs.charge.setState({
                value: DEFAULT_PRICE
              });
            }
          }
          break;
        }
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;

const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const NAME = 'ratelimit.fip';

function pop(obj, parent, callback) {

  let defaultBandwidth = HALO.settings.max_floatingip_bandwidth;
  if (defaultBandwidth) {
    config.fields[0].max = defaultBandwidth;
  }

  let currentBandwidth = obj.rate_limit / 1024;
  if (currentBandwidth < 1 || isNaN(currentBandwidth)) {
    currentBandwidth = 1;
  }
  config.fields[0].value = currentBandwidth;

  let enableCharge = HALO.settings.enable_charge;
  config.btn.disabled = enableCharge;
  config.fields[1].hide = !enableCharge;

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      if (currentBandwidth > defaultBandwidth) {
        refs.bandwidth.setState({
          error: true
        });
        refs.btn.setState({
          disabled: true
        });
      }

      if (enableCharge) {
        let bandwidth = currentBandwidth;
        refs.charge.setState({
          value: HALO.prices ? (Math.max.apply(null, HALO.prices.other[NAME]) * bandwidth).toFixed(4) : 0
        });
        refs.btn.setState({
          disabled: false
        });
      }
    },
    onConfirm: function(refs, cb) {
      let bw = Number(refs.bandwidth.state.value) * 1024;
      let data = {
        fipratelimit: {
          rate: bw
        }
      };

      request.changeBandwidth(obj.id, data).then((res) => {
        cb(true);
        callback && callback(res);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, state, refs) {
      switch (field) {
        case 'bandwidth':
          if (enableCharge) {
            let sliderEvent = state.eventType === 'mouseup';
            let inputEvnet = state.eventType === 'change' && !state.error;

            if (sliderEvent || inputEvnet) {
              refs.charge.setState({
                value: HALO.prices ? (Math.max.apply(null, HALO.prices.other[NAME]) * state.value).toFixed(4) : 0
              });
            }
          }
          refs.btn.setState({
            disabled: state.error
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;

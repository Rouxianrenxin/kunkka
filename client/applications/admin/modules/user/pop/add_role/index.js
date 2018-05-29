const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

const renderer = require('./project_field');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function checkPrjInDomain(type, value, projects) {
  let inDomain = false;
  let currProject = projects.find((project) => {
    return project[type] === value;
  });

  if(currProject !== undefined) {
    inDomain = true;
  } else {
    inDomain = false;
  }

  return inDomain;
}

function getProjectId(projectName, projects) {
  const project = projects.find((p) => {
    return p.name === projectName;
  });
  return project.id;
}

function pop(type, obj, parent, callback) {
  config.fields[0].text = obj.name;
  if (type === 'domain') {
    config.fields[1].hide = false;
    // adapter 类型无法 hide
    config.fields[2].type = 'text';
    config.fields[2].hide = true;
  } else {
    config.fields[1].hide = true;
    config.fields[2].type = 'adapter';
    config.fields[2].hide = false;
  }

  let currPrjsInDomain = [];

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function (refs) {
      let roleError = () => {
        refs.role.setState({
          hide: false
        });
        refs.btn.setState({
          disabled: true
        });
      };

      if (type === 'domain') {
        request.getRoles().then((res) => {
          if (res.length > 0) {
            refs.role.setState({
              data: res,
              value: res[0].id,
              hide: false
            });
            refs.btn.setState({
              disabled: false
            });
          } else {
            roleError();
          }
        }).catch((error) => {
          roleError();
        });
      } else {
        request.getRelatedInfo(obj.domain_id).then((res) => {
          if (res.roles.length > 0) {
            refs.role.setState({
              data: res.roles,
              value: res.roles[0].id,
              hide: false
            });
            refs.btn.setState({
              disabled: false
            });

            // 用户所属域中的所有项目
            currPrjsInDomain = res.projects;

            refs.project.setState({
              renderer: renderer,
              rendererData: {
                field: 'name',
                value: '',
                onValueChange: (data, value) => {
                  const rendererData = Object.assign({}, data, { value: value });
                  refs.project.setState({
                    rendererData: rendererData
                  });
                },
                onClickItem: (data, item, index) => {
                  const listCfg = Object.assign({}, data.listCfg, { selectedIndex: index });
                  const rendererData = Object.assign({}, data, { field: item.key, listCfg: listCfg });

                  refs.project.setState({
                    rendererData: rendererData
                  });
                },
                listCfg: {
                  required: true,
                  selectedIndex: 0,
                  items: [{
                    key: 'name',
                    title: __.project_name
                  }, {
                    key: 'id',
                    title: __.project_id
                  }]
                }
              }
            });

          } else {
            roleError();
          }
        }).catch((error) => {
          roleError();
        });
      }

    },
    onConfirm: function(refs, cb) {
      let id;

      if(type === 'project') {
        const rendererData = refs.project.state.rendererData;
        const fieldType = rendererData.field;
        const fieldValue = rendererData.value.trim();
        let projectInDomain = checkPrjInDomain(fieldType, fieldValue, currPrjsInDomain);

        if(!projectInDomain) {
          cb(false, __.wrong_project_input);
          return;
        }

        if(fieldType === 'id') {
          id = fieldValue;
        } else {
          id = getProjectId(fieldValue, currPrjsInDomain);
        }
      } else {
        id = refs[type].state.value;
      }

      request.addRole(type, obj, refs.role.state.value, id).then((res) => {
        callback && callback(res);
        cb(true);
      }).catch((error) => {
        cb(false, getErrorMessage(error));
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'project':
          if (refs.role.state.value) {
            refs.btn.setState({
              disabled: !refs.project.state.rendererData.value.trim()
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;

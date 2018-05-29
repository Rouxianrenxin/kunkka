'use strict';
const co = require('co');
const adminLogin = require('../api/slardar/common/adminLogin');
const remotes = [];
co(function* () {
  try {
    const {response} = yield adminLogin();
    const catalog = response.body.token.catalog;
    const kunkkaService = catalog.find(service => service.name === 'kunkka');
    kunkkaService.endpoints.forEach(endpoint => {
      if (endpoint.interface === 'public') {
        remotes.push(endpoint);
      }
    });
  } catch (e) {
    console.log(e);
  }
});

function View(app, clientApps, currentView, viewModels) {
  this.name = currentView;
  this.Url = require('url');
  // this.react = require('react');
  // this.reactDOMServer = require('react-dom/server');
  this.glob = require('glob');
  this.co = co;
  // this.viewModel = require(`client/applications/${currentView}/model.jsx`);
  // this.viewModelFactory = this.react.createFactory(this.viewModel);
  this.config = require('config');
  this.tusk = require('api/tusk/dao');
  this.websocketUrl = this.config('websocket');
  this.regions = {};
  this.uskinFile = this.glob.sync('*.uskin.min.css', {
    cwd: 'client/dist/uskin'
  });
  this.staticFiles = {};
  this.domain = this.config('domain');
  this.settingConfig = ['global', currentView];
  this.app = app;
  this.upperCaseLocale = require('helpers/upper_case_locale');
  this.applications = clientApps;
  this.plugins = viewModels;
}

View.prototype = {
  init: function() {
    const languages = Object.keys(this.config('region')[0].name);
    languages.forEach((lang) => {
      this.regions[lang] = [];
      this.config('region').forEach((reg) => {
        this.regions[lang].push({
          name: reg.name[lang],
          id: reg.id
        });
      });
    });
    const files = this.glob.sync('*', {
      cwd: 'client/dist/'
    });
    const locales = JSON.parse(JSON.stringify(global.locales.availableLocales)).map(this.upperCaseLocale);
    locales.forEach((locale) => {
      this.staticFiles[locale] = {};
      let regex = new RegExp(`${locale}.${this.name}.lang.min.js$`);
      files.some((file) => {
        return file.match(regex) && (this.staticFiles[locale][`${this.name}LangJsFile`] = file);
      });
    });
    let cssRegex = new RegExp(`${this.name}.min.css$`);
    let jsRegex = new RegExp(`${this.name}.min.js$`);
    this.staticFiles[`${this.name}CssFile`] = files.find((el) => {
      return el.match(cssRegex) !== null;
    });
    this.staticFiles[`${this.name}JsFile`] = files.find((el) => {
      return el.match(jsRegex) !== null;
    });
    this.initRoute();
  },
  initRoute: function() {
    let routeRegExp = new RegExp(`(^\/${this.name}$)|(^\/${this.name}\/(.*))`);
    this.app.get(routeRegExp, this.renderHandler.bind(this));
  },
  getSetting: function(settings, configs) {
    let result = {};
    settings.forEach(setting => setting.forEach(s => result[s.name] = s.value));
    return result;
  },
  renderHandler: function(req, res, next) {
    let that = this;
    this.co(function* () {
      let yieldArray = [];
      that.settingConfig.forEach(c => yieldArray.push(that.tusk.getSettingsByApp(c)));
      let result = yield yieldArray;
      let setting = that.getSetting(result, that.settingConfig);
      that.renderChecker(setting, req, res, next);
    }).catch(e => {
      res.status(500).send(e);
    });
  },
  renderChecker: function (setting, req, res, next) {
    const session = req.session;
    let ssUser = session && session.user;

    if (!ssUser) {
      res.redirect('/auth/login?cb=' + encodeURI(req.originalUrl));
      return;
    }

    let locale = this.upperCaseLocale(req.i18n.getLocale());
    let HALO = this.getHALO(locale, setting, ssUser);
    if (HALO.application.application_list.indexOf(this.name) === -1) {
      res.redirect('/' + HALO.application.application_list[0]);
      return;
    }

    if (this.name === 'admin' && setting.enable_safety && !ssUser.authAdmin) {
      res.redirect('/auth/admin-reauth?cb=' + encodeURI(req.originalUrl));
      return;
    }

    if (session.endpoint.kiki) {
      HALO.configs.kiki_url = session.endpoint.kiki[ssUser.regionId];
    }
    if (req.session.endpoint.swift) {
      let swift = req.session.endpoint.swift;
      HALO.configs.swift_url = swift[ssUser.regionId];
      HALO.configs.swift_port = swift[ssUser.regionId + '_PUBLICPORT'];
    }
    if (this.plugins) {
      this.plugins.forEach(p => p.model.haloProcessor ? p.model.haloProcessor(ssUser, HALO) : null);
    }
    this.renderTemplate(setting, HALO, locale, req, res, next);
  },
  getHALO: function(locale, setting, user) {
    return {
      configs: {
        lang: locale,
        domain: user.domainName || this.domain,
        domainId: user.domainId,
        adminProjectId: this.config('admin_projectId'),
        neutron_network_vlanranges: this.config('neutron_network_vlanranges')[user.regionId],
        enable_register: setting.enable_register,
        enable_register_approve: setting.enable_register_approve,
        telemerty: this.config('telemetry')
      },
      user: {
        projectId: user.projectId,
        projects: user.projects,
        userId: user.userId,
        username: user.username,
        roles: user.roles,
        phone: user.phone
      },
      region_list: this.regions[locale],
      current_region: user.regionId ? user.regionId : this.regions[locale][0].id,
      // FIXME:
      websocket: {
        url: this.websocketUrl[user.regionId]
      },
      application: {
        application_list: this.applications,
        current_application: this.name
      },
      settings: setting
    };
  },
  getTemplateObj: function(HALO, locale, setting, __) {
    return {
      HALO: JSON.stringify(HALO),
      langJsFile: this.staticFiles[locale][`${this.name}LangJsFile`],
      mainJsFile: this.staticFiles[`${this.name}JsFile`],
      mainCssFile: this.staticFiles[`${this.name}CssFile`],
      uskinFile: this.uskinFile[0],
      favicon: setting.favicon ? setting.favicon : '/static/assets/favicon.ico',
      title: setting.title ? setting.title : 'UnitedStack 有云',
      viewCss: setting['view.css'] ? setting['view.css'] : '',
      modelTmpl: ''
    };
  },
  renderTemplate: function(setting, HALO, locale, req, res, next) {
    const __ = req.i18n.__.bind(req.i18n);
    HALO.application.application_list = HALO.application.application_list.map(a => {
      return {[a]: __(`shared.${a}.application_name`)};
    });
    HALO.kunkka_remotes = remotes;
    global.HALO = JSON.parse(JSON.stringify(HALO));
    global.HALO.configs.renderer = 'server';
    global.HALO.configs.init = false;
    const templateObj = this.getTemplateObj(HALO, locale, setting, __);
    res.render(this.name, templateObj);
  }
};

module.exports = View;

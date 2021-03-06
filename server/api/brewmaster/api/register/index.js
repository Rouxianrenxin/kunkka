'use strict';

const co = require('co');

const userModel = require('../../models').user;
const passwordModel = require('../../models').user_password;
const drivers = require('drivers');
const base = require('../base');
const config = require('config');
const keystoneRemote = config('keystone');
const domainName = config('domain') || 'Default';
const adminEmail = config('admin_email');

const createUserAsync = drivers.keystone.user.createUserAsync;
const listDomainsAsync = drivers.keystone.domain.listDomainsAsync;
const updateUserAsync = drivers.keystone.user.updateUserAsync;
const sendEmail = drivers.email.sendEmailByTemplateAsync;

function User(app) {
  this.app = app;
  this.memClient = app.get('CacheClient');
}

User.prototype = {

  reg: function (req, res, next) {
    const that = this, adminToken = req.admin.token;
    co(function *() {
      const needed = ['name', 'password', 'email', 'phone', 'code', 'full_name', 'company'];
      const lack = [];
      needed.forEach(item => {
        req.body[item] || lack.push(item);
      });
      if (lack.length) {
        return next({status: 400, customRes: true, location: lack, msg: 'MissParams'});
      }
      let {email, name, password, phone, code, full_name, company} = req.body;
      let nameRegExp = /^[a-zA-Z0-9_+-]{1,20}$/;
      if(!(nameRegExp.test(name))) {
        return next({status: 400, customRes: true, msg: 'NameInvalid'});
      }
      password = base.crypto.decrypt(password, req.session.passwordId);

      const domainRes = yield listDomainsAsync(adminToken, keystoneRemote, {name: domainName, enabled: true});
      const domains = domainRes.body.domains;

      if (!domains.length) {
        return next({status: 404, customRes: true, msg: 'domainNotFound'});
      }
      const domainId = domains[0].id;

      let isCurrent = yield base.mem.verifyKeyValueAsync(phone, code, that.memClient);
      if (!isCurrent) {
        return next({status: 400, customRes: true, location: ['code'], msg: 'CodeError'});
      }

      const userKeystoneRes = yield createUserAsync(adminToken, keystoneRemote, {
        user: {name, password, email, domain_id: domainId, enabled: false}
      });
      let user = userKeystoneRes.body.user;

      yield userModel.create({
        id: user.id, links: JSON.stringify(user.links), domain_id: user.domain_id,
        email, phone, name, full_name, company, origin: 'register', status: 'verify-email',
        area_code: config('phone_area_code') || '86', enabled: false
      });
      //CREATE PASSWORD TO DATABASE
      const passworHash = yield base.crypto.hash(password);
      yield passwordModel.create({userId: user.id, password: passworHash});
      next({customRes: true, status: 200, msg: 'registerSuccess'});
    }).catch(next);
  },

  enable: function (req, res, next) {
    const that = this;
    co(function *() {
      const tokenUrl = req.query.token;
      const userId = req.query.user;
      if (!userId || !tokenUrl) {
        return next({customRes: true, status: 400, msg: 'LinkError'});
      }
      const user = yield base.func.verifyUserByIdAsync(req.admin.token, userId);
      if (!user) {
        return next({customRes: true, status: 404, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({customRes: true, status: 400, msg: 'Enabled'});
      }

      let isCorrect = yield base.mem.verifyKeyValueAsync(userId, tokenUrl, that.memClient);
      if (!isCorrect) {
        return next({customRes: true, status: 400, msg: 'LinkError'});
      }
      let result = yield base.func.enableUser(user, req.admin.token);

      yield [
        userModel.update(
          {enabled: true, default_project_id: result.projectId},
          {where: {id: user.id}}
        ),
        that.memClient.deleteAsync(user.id)
      ];

      next({customRes: true, status: 200, msg: 'EnableSuccess'});
    }).catch(next);
  },

  verifyPhone: function (req, res, next) {
    const that = this;
    co(function *() {
      const phone = parseInt(req.body.phone, 10);
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return next({customRes: true, status: 400, msg: 'PhoneError'});
      }
      const user = yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (user) {
        next({customRes: true, status: 400, msg: 'Used'});
      } else {
        next(yield base.func.phoneCaptchaMemAsync({
          phone, usage: 'usageRegister',
          __: req.i18n.__.bind(req.i18n), memClient: that.memClient
        }));
      }
    }).catch(next);
  },

  uniqueEmail: function (req, res, next) {
    let email = req.body.email;
    co(function *() {
      let user = yield base.func.verifyUserAsync(req.admin.token, {email});
      if (!user) {
        next({customRes: true, status: 200, msg: 'Available'});
      } else {
        next({customRes: true, status: 400, msg: 'Used'});
      }
    }).catch(next);
  },

  uniqueName: function (req, res, next) {
    co(function *() {
      const user = yield base.func.verifyUserByNameAsync(req.admin.token, req.body.name);
      if (!user) {
        next({customRes: true, status: 200, msg: 'Available'});
      } else {
        next({customRes: true, status: 400, msg: 'Used'});
      }
    }).catch(next);
  },

  regSuccess: function (req, res, next) {
    const that = this;
    co(function *() {
      const __ = req.i18n.__.bind(req.i18n);
      const query = {};
      Object.assign(query, req.query);
      if (!query.email && !query.name) {
        return next({status: 404, customRes: true, msg: 'UserNotExist'});
      }
      const user = yield base.func.verifyUserAsync(req.admin.token, query);
      if (!user) {
        return next({status: 404, customRes: true, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({status: 400, customRes: true, msg: 'Enabled'});
      }

      const email = user.email;
      const token = yield base.func.emailTokenMemAsync(user, that.memClient);
      const href = `${req.protocol}://${req.hostname}/auth/register/${req.enableRegisterApprove ? 'verify-email' : 'enable'}?user=${user.id}&token=${token}`;
      let subject = __(`api.register.verifyEmail`);
      sendEmail(email, subject, {href}, 'verify-email');
      next({view: 'sendEmail', customRes: true, data: {email}});
    }).catch(next);
  },
  verifyEmail: function (req, res, next) {
    const that = this;
    co(function* (){
      const tokenUrl = req.query.token;
      const userId = req.query.user;
      if (!userId || !tokenUrl) {
        return next({customRes: true, status: 400, msg: 'LinkError'});
      }
      const user = yield base.func.verifyUserByIdAsync(req.admin.token, userId);
      if (!user) {
        return next({customRes: true, status: 404, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({customRes: true, status: 400, msg: 'Enabled'});
      } else if (user.status !== 'verify-email') {
        return next({status: 200, customRes: true, msg: 'verifyEmailSuccess'});
      }

      const isCorrect = yield base.mem.verifyKeyValueAsync(userId, tokenUrl, that.memClient);
      if (!isCorrect) {
        return next({customRes: true, status: 400, msg: 'LinkError'});
      }
      yield [
        userModel.update({status: 'pending'}, {where: {id: user.id}}),
        that.memClient.deleteAsync(user.id),
        sendEmail(
          adminEmail, '有新用户注册申请，请审批',
          {
            content: `
            <p>用户名：${user.name}</p>
            <p>姓名：${user.full_name}</p>
            <p>电话：${user.phone}</p>
            <p>邮箱：${user.email}</p>
            <p>公司：${user.company}</p>`
          }
        )
      ];
      next({status: 200, customRes: true, msg: 'verifyEmailSuccess'});
    }).catch(next);
  },
  changeEmail: function (req, res, next) {
    co(function *() {
      const email = req.query.email;
      const user = yield base.func.verifyUserAsync(req.admin.token, {email});
      if (!user) {
        return next({status: 404, customRes: true, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({status: 400, customRes: true, msg: 'Enabled'});
      }
      next({view: 'changeEmail', status: 200, customRes: true});
    }).catch(next);
  },

  getPhoneCaptchaForChangeEmail: function (req, res, next) {
    const that = this;
    co(function *() {
      const phone = req.body.phone;
      if (!(/^1[34578]\d{9}$/.test(phone))) {
        return next({customRes: true, msg: 'PhoneError'});
      }
      const user = yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (user === false) {
        return next({status: 404, customRes: true, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({customRes: true, msg: 'Enabled'});
      }
      next(yield base.func.phoneCaptchaMemAsync({
        phone, usage: '',
        __: req.i18n.__.bind(req.i18n), memClient: that.memClient
      }));
    }).catch(next);
  },
  changeEmailSubmit: function (req, res, next) {
    let phone = req.body.phone;
    let code = req.body.captcha.toString();
    let email = req.body.email;
    let that = this;

    co(function *() {
      let user = yield base.func.verifyUserAsync(req.admin.token, {phone});
      if (!user) {
        return next({statusCode: 404, customRes: true, msg: 'UserNotExist'});
      } else if (user.enabled) {
        return next({customRes: true, msg: 'Enabled'});
      }
      let isCorrect = yield base.mem.verifyKeyValueAsync(phone, code, that.memClient);
      if (!isCorrect) {
        return next({status: 400, customRes: true, msg: 'CodeError'});
      }
      let userDB = yield userModel.findOne({where: {phone}});
      yield [
        userDB.update({email}),
        updateUserAsync(req.admin.token, keystoneRemote, user.id, {user: {email}})
      ];
      res.redirect(`${req.protocol}://${req.hostname}/auth/register/success?email=${email}`);

    }).catch(e => {
      if (e.name === 'SequelizeUniqueConstraintError') {
        next({customRes: true, msg: 'emailUsed'});
      } else {
        next(e);
      }
    });
  },
  initRoutes: function () {
    this.app.use('/auth/register/*', base.middleware.checkEnableRegister, base.middleware.adminLogin);
    this.app.get('/auth/register/success', this.regSuccess.bind(this));
    this.app.get('/auth/register/verify-email', this.verifyEmail.bind(this));
    this.app.get('/auth/register/enable', this.enable.bind(this));
    this.app.get('/auth/register/change-email', this.changeEmail.bind(this));
    this.app.post('/auth/register/change-email', this.changeEmailSubmit.bind(this));
    this.app.get('/auth/register/resend-email', this.regSuccess.bind(this));
    this.app.use('/auth/register/*', base.middleware.customResPage);

    this.app.post(
      '/api/register',
      base.middleware.checkEnableRegister,
      base.middleware.adminLogin,
      this.reg.bind(this),
      base.middleware.customResApi
    );
    this.app.post('/api/register/*', base.middleware.checkEnableRegister, base.middleware.adminLogin);
    this.app.post('/api/register/phone', base.middleware.checkCaptcha, this.verifyPhone.bind(this));
    this.app.post('/api/register/change-email/phone', base.middleware.checkCaptcha, this.getPhoneCaptchaForChangeEmail.bind(this));
    this.app.post('/api/register/unique-name', this.uniqueName.bind(this));
    this.app.post('/api/register/unique-email', this.uniqueEmail.bind(this));
    this.app.use('/api/register/*', base.middleware.customResApi);
  }
};

module.exports = User;

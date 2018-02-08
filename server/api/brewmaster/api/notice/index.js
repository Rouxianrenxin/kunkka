'use strict';
const co = require('co');
const base = require('../base');
const models = require('../../models');
const userModel = models.user;
const noticeModel = models.notice;

const findAllEmailAddress = function* () {
  let emails = yield userModel.findAll({
    attributes: ['email'],
    where: {email: {$ne: null}},
    raw: true
  });
  return emails;
};

const findAllNoticeByFields = function* (fields) {
  let obj = {
    order: [
      ['createdAt', 'DESC']
    ],
    raw: true
  };
  let page = 1;
  if (fields) {
    if (parseInt(fields.limit, 10) > 0) {
      obj.limit = parseInt(fields.limit, 10);
    }
    if (obj.limit && parseInt(fields.page, 10) > page) {
      page = parseInt(fields.page, 10);
      obj.offset = (page - 1) * fields.limit;
    }
    if(fields.paranoid === false) {
      obj.paranoid = false;
    }
  }
  let data = yield noticeModel.findAndCount(obj);
  let result = {
    notice: data.rows,
    count: data.count
  };
  if (obj.limit) {
    result.next = (data.count / obj.limit) > page ? (page + 1) : null;
    result.prev = page === 1 ? null : (page - 1);
  }
  return result;
};

function Notice(app) {
  this.app = app;
}

Notice.prototype = {
  createNotice: function (req, res, next) {
    co(function* () {
      let {title, content, link} = req.body;
      if (!title) {
        res.status(400).end();
        return;
      }
      yield noticeModel.create({title, content, link});
      res.status(201).end();
    }).catch(next);
  },
  deleteNotice: function (req, res, next) {
    co(function* () {
      let notice = yield noticeModel.destroy({where: {id: req.params.id}});
      if (notice) {
        res.status(204).end();
      } else {
        res.status(404).end();
      }
    }).catch(next);
  },
  listNotice: function (req, res, next) {
    co(function* () {
      let result = yield findAllNoticeByFields({
        limit: req.query.limit,
        page: req.query.page,
        paranoid: false
      });

      res.json(result);
    }).catch(next);
  },
  getLatest: function (req, res, next) {
    co(function* () {
      let result = yield findAllNoticeByFields({limit: 3});
      res.send({notice: result.notice});
    }).catch(next);
  },

  initRoutes: function () {
    this.app.post(
      '/api/admin/notice',
      base.middleware.checkAdmin,
      this.createNotice.bind(this)
    );
    this.app.delete(
      '/api/admin/notice/:id',
      base.middleware.checkAdmin,
      this.deleteNotice
    );
    this.app.get(
      '/api/admin/notice',
      base.middleware.checkAdmin,
      this.listNotice
    );
    this.app.get(
      '/api/notice/latest',
      this.getLatest
    );
  }
};

module.exports = Notice;

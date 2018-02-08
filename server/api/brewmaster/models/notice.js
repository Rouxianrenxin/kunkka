'use strict';
module.exports = function (mysql, DataTypes) {
  return mysql.define('notice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    link: {
      type: DataTypes.TEXT
    },
    content: {
      type: DataTypes.TEXT
    }
  }, {
    charset: 'utf8',
    paranoid: true
  });
};

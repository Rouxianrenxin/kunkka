'use strict';

module.exports = {
  dependencies: {
    'mysql': '^2.10.2'
  },
  config: {
    mysql: {
      host: '121.201.52.181',
      port: 3306,
      user: 'root',
      password: '1234',
      database: 'kunkka',
      table: 'tusk'
    },
    assets_dir: '/opt/assets'
  }
};
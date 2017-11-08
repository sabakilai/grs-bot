'use strict';
module.exports = function(sequelize, DataTypes) {
  var Info = sequelize.define('Info', {
    data_all: DataTypes.TEXT
  }, {
    tableName: 'infos',
    timestamps: false,
  });
  return Info;
};
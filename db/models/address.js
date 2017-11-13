'use strict';
module.exports = function(sequelize, DataTypes) {
  var Address = sequelize.define('Address', {
    address: DataTypes.TEXT
  }, {
    tableName: 'addresses',
    timestamps: false,
  });
  return Address;
};
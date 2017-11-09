'use strict';
module.exports = function(sequelize, DataTypes) {
  var Price = sequelize.define('Price', {
    price: DataTypes.TEXT
  }, {
    tableName: 'prices',
    timestamps: false,
  });
  return Price;
};
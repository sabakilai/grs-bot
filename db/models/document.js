'use strict';
module.exports = function(sequelize, DataTypes) {
  var Document = sequelize.define('Document', {
    document: DataTypes.TEXT
  }, {
    tableName: 'documents',
    timestamps: false,
  });
  return Document;
};
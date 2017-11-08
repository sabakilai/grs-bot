'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var config    = require('./config.js');
var db        = {};
var sequelize = new Sequelize(
    config.DATABASE_NAME, 
    config.DATABASE_USER, 
    config.DATABASE_PASS, 
    {
      host:config.DATABASE_HOST,
      dialect: 'mysql',
      logging: true
    });
var modelsDir = __dirname + '/models';

fs
  .readdirSync(modelsDir)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(modelsDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;

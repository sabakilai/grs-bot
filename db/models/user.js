'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	userId: DataTypes.INTEGER,
	ip: DataTypes.STRING,
	state: {
		type: DataTypes.INTEGER,
	    defaultValue: 0
	},
	subscribed:{
		type:DataTypes.INTEGER,
			defaultValue:0
	}
}, {
    tableName: 'users'
  });
  return User;
};
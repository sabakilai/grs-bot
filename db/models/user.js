'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
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
	tableName: 'users',
	timestamps: false
  });
  return User;
};
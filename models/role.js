'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^[A-Za-z]{1,39}$/i,
          msg: 'role title must be letters only, have no spaces, and be 2 - 40 characters long.'
        }
      },
      set(value) {
        this.setDataValue('title', value ? value.trim() : value);
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        this.setDataValue('description', value ? value.trim() : value);
      }
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true 
      },
      set(value) {
        this.setDataValue('rank', value);
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {});
  Role.associate = function(models) {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
    });
  };
  return Role;
};
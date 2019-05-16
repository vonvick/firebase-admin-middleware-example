'use strict';

module.exports = (sequelize, DataTypes) => {
  const AuthId = sequelize.define('AuthId', {
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Oops. There is an existing account with this auth id.',
      },
      validate: {
        is: {
          args: /\w{5,255}/i,
          msg: 'authId must be a string with 5 - 255 characters.'
        }
      }
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /\w{2,255}/i,
          msg: 'provider must be a string with 2 - 255 characters.'
        }
      },
      set(value) {
        this.setDataValue('provider', value ? value.trim() : value);
      }
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          args: true,
          msg: 'The email you entered is invalid.'
        },
        isTooLong(value) {
          if (value.length > 254) {
            throw new Error('The email you entered is invalid  and longer \
than 254 characters.');
          }
        }
      },
      set(value) {
        this.setDataValue('email', value ? value.trim() : value);
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        is: {
          args: /\d+/,
          msg: 'User Id is required'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {});
  AuthId.associate = function (models) {
    AuthId.belongsTo(models.User, {
      foreignKey: 'userId',
      constraints: false
    });
  };
  
  return AuthId;
};

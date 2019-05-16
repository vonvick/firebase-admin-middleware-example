'use strict';

import bcrypt from 'bcrypt-nodejs';
import jwt    from 'jsonwebtoken';
import {
  showUserDetails
} from '../controllers/helpers/user_helper';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[A-Za-z\-\ \.\'][A-Za-z\-\ \.\']{1,39}$/i,
          msg: 'firstname must start with a letter, have no spaces, and be 2 - \
40 characters long.'
        }
      },
      set(value) {
        this.setDataValue('firstname', value ? value.trim() : value);
      }
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[A-Za-z\-\ \.\'][A-Za-z\-\ \.\']{1,39}$/i,
          msg: 'lastname must start with a letter, have no spaces, and be 2 - \
40 characters long.'
        }
      },
      set(value) {
        this.setDataValue('lastname', value ? value.trim() : value);
      }
    },
    username: {
      allowNull: true,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Oops. There is an existing account with this username.',
      },
      validate: {
        isTooSmall(value) {
          if (value.length < 4) {
            throw new Error('The username you entered is invalid and less than 4 characters.');
          }
        }
      },
      set(value) {
        this.setDataValue('username', value ? value.trim() : value);
      }
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Oops. There is an existing account with this email address.',
      },
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
    password: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        is: {
          args: /\w+/,
          msg: 'Street Address is not valid'
        }
      },
      set(value) {
        this.setDataValue('address', value ? value.trim() : value);
      }
    },
    addressLatLong: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        is: {
          args: /\w+/,
          msg: 'Address Latitude and Longitude is not valid'
        }
      },
      set(value) {
        this.setDataValue('addressLatLong', value ? value.trim() : value);
      }
    },
    town: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[A-Za-z\-\ \.\'][A-Za-z\-\ \.\']{1,39}$/i,
          msg: 'Please enter a valid town'
        }
      },
      set(value) {
        this.setDataValue('town', value ? value.trim() : value);
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[A-Za-z\-\ \.\'][A-Za-z\-\ \.\']{1,39}$/i,
          msg: 'Please enter a valid city'
        }
      },
      set(value) {
        this.setDataValue('city', value ? value.trim() : value);
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[A-Za-z\ ][A-Za-z\ ]{2,39}$/i,
          msg: 'Please enter a state'
        }
      },
      set(value) {
        this.setDataValue('state', value ? value.trim() : value);
      }
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^[A-Za-z\ ][A-Za-z\ ]{1,39}$/i,
          msg: 'Please enter a valid state'
        }
      },
      set(value) {
        this.setDataValue('country', value ? value.trim() : value);
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: {
          args: /^(\d{8}|\d{9}|\d{10}|\d{11}|\d{12}|\d{13}|\d{14}|\d{15}|\d{16})$/,
          msg: 'Please enter a valid phone number'
        }
      },
      set(value) {
        this.setDataValue('phone', value ? value.toString().trim() : value);
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Invalid picture URL' }
      },
      set(value) {
        this.setDataValue('imageUrl', value);
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        is: {
          args: /\d+/,
          msg: 'Please enter a Number for Roles'
        }
      },
    },
    password_digest: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        isLongEnough(val) {
          if (val.length < 6) {
            throw new Error('Please choose a longer password');
          }
        },
        hasConfirmation() {
          const confirmation = this.getDataValue('password_confirmation');
          if (!confirmation) {
            throw new Error('Please confirm password');
          }
        }
      }
    },
    password_confirmation: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        isPassword(value) {
          if (value !== this.getDataValue('password_digest')) {
            throw new Error('Password confirmation does not match password');
          }
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(value, salt);
          this.setDataValue('password', hash);
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {});
  User.associate = function (models) {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId'
    });
  };
  User.prototype.generateToken = function() {
    const user = showUserDetails(this.dataValues);
    return jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: 86400
    });
  };

  User.prototype.authenticatePassword = function(password) {
    const auth = bcrypt.compareSync(password, this.password);
    if (auth) {
      return [true, this.generateToken()];
    }
    return [false, null];
  }

  User.addHook('beforeValidate', async (user) => {
    if (user.password_digest === user.password_confirmation) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(user.password_confirmation, salt);
  
      user.password = hash;
    }
  })

  return User;
};

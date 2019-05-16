'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AuthIds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      uid: {
        type:Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        isEmail: true
      },
      isActive: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AuthIds');
  }
};
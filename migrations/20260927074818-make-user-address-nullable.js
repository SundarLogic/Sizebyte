"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "address");

    await queryInterface.removeColumn("admins", "address");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "address", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("admins", "address", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};

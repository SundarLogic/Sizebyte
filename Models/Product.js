const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const Product = sequelize.define(
  "product",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    imagePublicId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    adminId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    paranoid: true, //For soft deleting
  },
);

module.exports = Product;

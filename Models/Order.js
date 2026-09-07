const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  totalAmount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"),
    defaultValue: "ORDERED",
    allowNull: false,
  },
});

module.exports = Order;

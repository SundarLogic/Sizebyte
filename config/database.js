const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectModule: mysql2,

    ...(process.env.NODE_ENV === "production" && {
      dialectOptions: {
        ssl: {
          rejectUnauthorized: true,
        },
      },
    }),
  },
);

module.exports = sequelize;

/*
//FOR LOCAL DB

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
  },
);

module.exports = sequelize;
*/

"use strict";

const { Sequelize } = require("sequelize");
const path = require("path");
require("dotenv").config();

const dbPath = path.resolve(process.env.DB_PATH || "./database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;

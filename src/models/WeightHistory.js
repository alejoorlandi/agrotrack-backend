'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeightHistory = sequelize.define('WeightHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  animal_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'animals',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  recorded_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'weight_history',
});

module.exports = WeightHistory;

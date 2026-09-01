'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SanitaryRecord = sequelize.define('SanitaryRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  animal_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'animals',
      key: 'id',
    },
  },
  medicine_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'medicines',
      key: 'id',
    },
  },
  application_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  release_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'sanitary_records',
});

module.exports = SanitaryRecord;

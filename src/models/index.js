'use strict';

const sequelize = require('../config/database');
const User = require('./User');
const Animal = require('./Animal');
const Medicine = require('./Medicine');
const SanitaryRecord = require('./SanitaryRecord');
const WeightHistory = require('./WeightHistory');

// --- Associations ---

// Animal hasMany SanitaryRecords
Animal.hasMany(SanitaryRecord, {
  foreignKey: 'animal_id',
  as: 'sanitaryRecords',
});
SanitaryRecord.belongsTo(Animal, {
  foreignKey: 'animal_id',
  as: 'animal',
});

// Medicine hasMany SanitaryRecords
Medicine.hasMany(SanitaryRecord, {
  foreignKey: 'medicine_id',
  as: 'sanitaryRecords',
});
SanitaryRecord.belongsTo(Medicine, {
  foreignKey: 'medicine_id',
  as: 'medicine',
});

// Animal hasMany WeightHistory
Animal.hasMany(WeightHistory, {
  foreignKey: 'animal_id',
  as: 'weightHistory',
});
WeightHistory.belongsTo(Animal, {
  foreignKey: 'animal_id',
  as: 'animal',
});

// User Associations (Multi-Tenancy)
User.hasMany(Animal, { foreignKey: 'user_id', as: 'animals' });
Animal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Medicine, { foreignKey: 'user_id', as: 'medicines' });
Medicine.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(SanitaryRecord, { foreignKey: 'user_id', as: 'sanitaryRecords' });
SanitaryRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(WeightHistory, { foreignKey: 'user_id', as: 'weightHistory' });
WeightHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Animal,
  Medicine,
  SanitaryRecord,
  WeightHistory,
};


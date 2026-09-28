'use strict';

const sequelize = require('../config/database');

// --- Modelos existentes ---
const User = require('./User');
const Animal = require('./Animal');
const Medicine = require('./Medicine');
const SanitaryRecord = require('./SanitaryRecord');
const WeightHistory = require('./WeightHistory');

// --- Modelos RBAC ---
const Group = require('./Group');
const Permission = require('./Permission');
const UserGroup = require('./UserGroup');           // Tabla intermedia User ↔ Group
const GroupPermission = require('./GroupPermission'); // Tabla intermedia Group ↔ Permission

// ============================================================
// ASOCIACIONES — Modelos existentes (Multi-Tenancy)
// ============================================================

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

// User → Animal / Medicine / SanitaryRecord / WeightHistory
User.hasMany(Animal, { foreignKey: 'user_id', as: 'animals' });
Animal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Medicine, { foreignKey: 'user_id', as: 'medicines' });
Medicine.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(SanitaryRecord, { foreignKey: 'user_id', as: 'sanitaryRecords' });
SanitaryRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(WeightHistory, { foreignKey: 'user_id', as: 'weightHistory' });
WeightHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ============================================================
// ASOCIACIONES — RBAC (N:M)
// ============================================================

/**
 * User N:M Group
 * Un usuario puede pertenecer a varios grupos.
 * Un grupo puede tener varios usuarios.
 * Tabla intermedia: user_groups
 */
User.belongsToMany(Group, {
  through: UserGroup,
  foreignKey: 'user_id',
  otherKey: 'group_id',
  as: 'groups',
});
Group.belongsToMany(User, {
  through: UserGroup,
  foreignKey: 'group_id',
  otherKey: 'user_id',
  as: 'users',
});

/**
 * Group N:M Permission
 * Un grupo puede tener varios permisos.
 * Un permiso puede estar asignado a varios grupos.
 * Tabla intermedia: group_permissions
 */
Group.belongsToMany(Permission, {
  through: GroupPermission,
  foreignKey: 'group_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Group, {
  through: GroupPermission,
  foreignKey: 'permission_id',
  otherKey: 'group_id',
  as: 'groups',
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sequelize,
  // Modelos existentes
  User,
  Animal,
  Medicine,
  SanitaryRecord,
  WeightHistory,
  // Modelos RBAC
  Group,
  Permission,
  UserGroup,
  GroupPermission,
};



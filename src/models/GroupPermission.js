'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Tabla intermedia GroupPermission.
 * Implementa la relación N:M entre Group y Permission.
 *
 * Un grupo puede tener múltiples permisos,
 * y un mismo permiso puede pertenecer a múltiples grupos.
 *
 * Esta tabla se define explícitamente para:
 * - Tener control total sobre el nombre de la tabla en SQLite.
 * - Permitir agregar metadatos futuros (ej: fecha de asignación).
 */
const GroupPermission = sequelize.define('GroupPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Las claves foráneas groupId y permissionId son definidas
  // en las asociaciones del index.js (through: GroupPermission)
}, {
  tableName: 'group_permissions',
});

module.exports = GroupPermission;

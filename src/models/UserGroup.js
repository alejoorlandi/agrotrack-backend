'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Tabla intermedia UserGroup.
 * Implementa la relación N:M entre User y Group.
 *
 * Un usuario puede pertenecer a múltiples grupos,
 * y un grupo puede contener múltiples usuarios.
 *
 * Esta tabla se define explícitamente (en lugar de dejar que Sequelize
 * la cree automáticamente) para permitir agregar campos adicionales
 * en el futuro (ej: fecha de asignación, asignado por quién, etc.).
 */
const UserGroup = sequelize.define('UserGroup', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Las claves foráneas userId y groupId son definidas
  // en las asociaciones del index.js (through: UserGroup)
}, {
  tableName: 'user_groups',
});

module.exports = UserGroup;

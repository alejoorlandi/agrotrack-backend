'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Group (Grupo de usuarios).
 * Agrupa usuarios bajo un rol funcional (ej: 'Administrador', 'Veterinario', 'Empleado').
 * Cada grupo puede tener múltiples permisos asignados.
 */
const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nombre único del grupo (ej: Administrador, Veterinario, Empleado)',
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Descripción opcional del grupo y sus responsabilidades',
  },
}, {
  tableName: 'groups',
});

module.exports = Group;

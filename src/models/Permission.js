'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Permission (Permiso granular).
 * Representa una acción específica que puede realizarse en el sistema.
 *
 * Ejemplos de códigos de permiso:
 *   - 'MANAGE_USERS'   → Crear, editar y eliminar usuarios
 *   - 'MANAGE_GROUPS'  → Gestionar grupos y asignaciones
 *   - 'READ_REPORTS'   → Ver reportes e informes
 *   - 'WRITE_SANIDAD'  → Registrar eventos sanitarios
 */
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Código único del permiso en SNAKE_UPPER_CASE (ej: READ_REPORTS)',
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Descripción legible del permiso para mostrar en la UI',
  },
}, {
  tableName: 'permissions',
});

module.exports = Permission;

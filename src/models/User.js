'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo User.
 * Representa a un usuario del sistema AgroTrack.
 *
 * Campos RBAC agregados:
 *   - estado: controla si el usuario puede autenticarse ('ACTIVO' | 'INACTIVO').
 *
 * El campo legacy `role` se mantiene para compatibilidad con el código existente.
 * La autorización granular se realiza a través de Groups y Permissions (RBAC).
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Campo legacy — se conserva para no romper el auth existente
  role: {
    type: DataTypes.ENUM('admin', 'operator'),
    allowNull: false,
    defaultValue: 'operator',
  },
  // Campo RBAC: controla acceso al sistema
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    allowNull: false,
    defaultValue: 'ACTIVO',
    comment: 'ACTIVO permite login; INACTIVO bloquea el acceso sin eliminar el usuario',
  },
}, {
  tableName: 'users',
});

module.exports = User;


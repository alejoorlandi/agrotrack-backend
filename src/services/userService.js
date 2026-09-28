'use strict';

const bcrypt = require('bcrypt');
const { User, Group, Permission } = require('../models');

const SALT_ROUNDS = 10;

/**
 * Helper: lanza un error HTTP-friendly.
 */
const httpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Atributos públicos del usuario (sin password_hash).
 */
const USER_PUBLIC_ATTRS = ['id', 'email', 'role', 'estado', 'createdAt', 'updatedAt'];

/**
 * Include estándar para cargar grupos del usuario.
 */
const USER_INCLUDE_GROUPS = [
  {
    model: Group,
    as: 'groups',
    attributes: ['id', 'nombre', 'descripcion'],
    through: { attributes: [] },
  },
];

class UserService {
  /**
   * GET /api/users
   * Retorna todos los usuarios con sus grupos asignados.
   */
  async findAll() {
    return User.findAll({
      attributes: USER_PUBLIC_ATTRS,
      include: USER_INCLUDE_GROUPS,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * GET /api/users/:id
   * Retorna un usuario por ID con sus grupos y permisos.
   */
  async findById(id) {
    const user = await User.findByPk(id, {
      attributes: USER_PUBLIC_ATTRS,
      include: [
        {
          model: Group,
          as: 'groups',
          attributes: ['id', 'nombre', 'descripcion'],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['id', 'codigo', 'descripcion'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) throw httpError('Usuario no encontrado', 404);
    return user;
  }

  /**
   * POST /api/users
   * Crea un nuevo usuario y lo asigna a uno o más grupos.
   *
   * @param {Object} data - { email, password, role?, estado?, groupIds[] }
   */
  async create({ email, password, role = 'operator', estado = 'ACTIVO', groupIds = [] }) {
    if (!email || !password) throw httpError('Email y contraseña son obligatorios');

    const exists = await User.findOne({ where: { email } });
    if (exists) throw httpError('El email ya está registrado', 409);

    if (password.length < 6) throw httpError('La contraseña debe tener al menos 6 caracteres');

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ email, password_hash, role, estado });

    // Asignar grupos si se proporcionaron
    if (groupIds.length > 0) {
      const groups = await Group.findAll({ where: { id: groupIds } });
      if (groups.length !== groupIds.length) {
        throw httpError('Uno o más groupIds no existen');
      }
      await user.setGroups(groups);
    }

    return this.findById(user.id);
  }

  /**
   * PUT /api/users/:id
   * Actualiza email, estado y/o reasigna grupos.
   *
   * @param {string} id
   * @param {Object} data - { email?, estado?, groupIds? }
   */
  async update(id, { email, estado, groupIds }) {
    const user = await User.findByPk(id);
    if (!user) throw httpError('Usuario no encontrado', 404);

    // Actualizar campos editables
    if (email !== undefined) {
      const taken = await User.findOne({ where: { email } });
      if (taken && taken.id !== id) throw httpError('El email ya está en uso por otro usuario', 409);
      user.email = email;
    }

    if (estado !== undefined) {
      const VALID_ESTADOS = ['ACTIVO', 'INACTIVO'];
      if (!VALID_ESTADOS.includes(estado)) {
        throw httpError(`Estado inválido. Valores permitidos: ${VALID_ESTADOS.join(', ')}`);
      }
      user.estado = estado;
    }

    await user.save();

    // Reasignar grupos si se envió el array (puede ser vacío para quitar todos)
    if (groupIds !== undefined) {
      if (!Array.isArray(groupIds)) throw httpError('groupIds debe ser un array');
      const groups = await Group.findAll({ where: { id: groupIds } });
      if (groups.length !== groupIds.length) {
        throw httpError('Uno o más groupIds no existen');
      }
      await user.setGroups(groups);
    }

    return this.findById(id);
  }

  /**
   * DELETE /api/users/:id
   * Elimina físicamente el usuario de la BD.
   * Si se prefiere soft-delete, usar update con estado='INACTIVO'.
   */
  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) throw httpError('Usuario no encontrado', 404);

    await user.setGroups([]); // Desvincula grupos antes de eliminar
    await user.destroy();

    return { message: `Usuario ${user.email} eliminado correctamente` };
  }

  /**
   * POST /api/users/:id/reset-password
   * El administrador resetea la contraseña de un usuario con una clave temporal.
   *
   * @param {string} id
   * @param {string} newPassword - Contraseña temporal definida por el admin
   */
  async resetPassword(id, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw httpError('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const user = await User.findByPk(id);
    if (!user) throw httpError('Usuario no encontrado', 404);

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { message: `Contraseña del usuario ${user.email} reseteada correctamente` };
  }
}

module.exports = new UserService();

'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Group, Permission } = require('../models');
require('dotenv').config();

const SALT_ROUNDS = 10;

class AuthService {
  /**
   * Registers a new user.
   * @param {Object} data - { email, password, role }
   * @returns {Object} Created user (without password hash)
   */
  async register({ email, password, role }) {
    // Validate required fields
    if (!email || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    // Hash password with bcrypt (cost factor 10)
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      password_hash,
      role: role || 'operator',
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Authenticates a user and returns a JWT.
   * @param {Object} data - { email, password }
   * @returns {Object} { user, token }
   */
  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email y contraseña son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // Buscar el usuario con sus grupos y permisos para construir el contexto RBAC
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Group,
          as: 'groups',
          attributes: ['id', 'nombre'],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['codigo'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Verificar estado antes de permitir login
    if (user.estado === 'INACTIVO') {
      const error = new Error('Cuenta desactivada. Contacte al administrador.');
      error.statusCode = 403;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Construir lista plana de permisos (igual que authMiddleware)
    const permissionSet = new Set();
    for (const group of user.groups) {
      for (const perm of group.permissions) {
        permissionSet.add(perm.codigo);
      }
    }
    const permissions = [...permissionSet];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        estado: user.estado,
        groups: user.groups.map((g) => ({ id: g.id, nombre: g.nombre })),
        permissions, // ✅ Array plano: ['MANAGE_USERS', 'MANAGE_GROUPS', ...]
      },
      token,
    };
  }

  /**
   * POST /api/auth/change-password
   * Permite al usuario autenticado cambiar su contraseña actual.
   * Requiere verificar la contraseña anterior para mayor seguridad.
   *
   * @param {string} userId        - ID del usuario autenticado (de req.user)
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword     - Nueva contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const error = new Error('La contraseña actual y la nueva son obligatorias');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    if (currentPassword === newPassword) {
      const error = new Error('La nueva contraseña no puede ser igual a la actual');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      const error = new Error('La contraseña actual es incorrecta');
      error.statusCode = 401;
      throw error;
    }

    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * POST /api/auth/forgot-password
   * Blanqueo de contraseña por solicitud del usuario.
   * En esta implementación, devuelve una contraseña temporal.
   * En producción, aquí se enviaría un email con un link de reset.
   *
   * @param {string} email - Email del usuario que solicita el blanqueo
   */
  async forgotPassword(email) {
    if (!email) {
      const error = new Error('El email es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ where: { email } });

    // Por seguridad, siempre respondemos lo mismo aunque el email no exista
    // Esto previene la enumeración de usuarios (user enumeration attack)
    if (!user || user.estado === 'INACTIVO') {
      return {
        message: 'Si el email existe en el sistema, se enviará un enlace de recuperación.',
      };
    }

    // Generar contraseña temporal de 8 caracteres
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();

    user.password_hash = await bcrypt.hash(tempPassword, SALT_ROUNDS);
    await user.save();

    // TODO en producción: enviar email con nodemailer u otro servicio
    // await emailService.sendPasswordReset(user.email, tempPassword);

    // En desarrollo, retornamos la clave temporal en la respuesta (¡NO hacer en producción!)
    return {
      message: 'Si el email existe en el sistema, se enviará un enlace de recuperación.',
      // Solo en DEV/TEST:
      ...(process.env.NODE_ENV !== 'production' && {
        _dev_tempPassword: tempPassword,
        _dev_note: 'Este campo solo aparece en entornos que no son producción',
      }),
    };
  }
}

module.exports = new AuthService();


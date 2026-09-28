'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * authMiddleware — Autenticación + carga de contexto RBAC.
 *
 * 1. Extrae y verifica el JWT del header 'Authorization: Bearer <token>'.
 * 2. Busca en la BD al usuario con sus Grupos y los Permisos de cada Grupo.
 * 3. Construye req.user con:
 *      - Los datos del usuario (sin password_hash)
 *      - req.user.groups   → Array de objetos Group
 *      - req.user.permissions → Array plano de códigos de permiso (strings)
 *        Ejemplo: ['MANAGE_USERS', 'READ_REPORTS', 'WRITE_SANIDAD']
 *
 * Esto permite que checkPermission() evalúe permisos sin consultar la BD de nuevo.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // --- 1. Extraer token del header ---
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Token de autenticación no proporcionado',
      });
    }

    const token = authHeader.split(' ')[1];

    // --- 2. Verificar y decodificar el JWT ---
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        error: true,
        message: 'Token inválido o expirado',
      });
    }

    // --- 3. Cargar usuario desde la BD con Grupos y Permisos ---
    // Se importa aquí para evitar dependencias circulares al inicializar
    const { User, Group, Permission } = require('../models');

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }, // No exponer el hash
      include: [
        {
          model: Group,
          as: 'groups',
          attributes: ['id', 'nombre'],
          through: { attributes: [] }, // Omitir campos de la tabla intermedia
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['codigo'],
              through: { attributes: [] }, // Omitir campos de la tabla intermedia
            },
          ],
        },
      ],
    });

    // --- 4. Validaciones de estado ---
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no encontrado',
      });
    }

    if (user.estado === 'INACTIVO') {
      return res.status(403).json({
        error: true,
        message: 'Cuenta desactivada. Contacte al administrador.',
      });
    }

    // --- 5. Construir lista plana de códigos de permiso ---
    // Itera los grupos → los permisos de cada grupo → extrae el código
    // Usa Set para eliminar duplicados si dos grupos tienen el mismo permiso
    const permissionSet = new Set();
    for (const group of user.groups) {
      for (const perm of group.permissions) {
        permissionSet.add(perm.codigo);
      }
    }

    // --- 6. Adjuntar contexto RBAC a req.user ---
    req.user = {
      ...user.toJSON(),          // Datos del usuario (sin password_hash)
      permissions: [...permissionSet], // ['MANAGE_USERS', 'READ_REPORTS', ...]
    };

    next();
  } catch (err) {
    next(err); // Delegamos al errorHandler global
  }
};

module.exports = authMiddleware;


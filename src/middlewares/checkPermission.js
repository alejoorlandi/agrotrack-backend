'use strict';

/**
 * checkPermission — Middleware de autorización granular basado en permisos.
 *
 * Factory function que retorna un middleware de Express. Debe usarse SIEMPRE
 * después de authMiddleware, ya que depende de req.user.permissions.
 *
 * @param {string} requiredPermission - Código del permiso requerido (ej: 'READ_REPORTS')
 * @returns {Function} Middleware de Express
 *
 * @example
 * // En un archivo de rutas:
 * const authMiddleware = require('../middlewares/authMiddleware');
 * const checkPermission = require('../middlewares/checkPermission');
 *
 * // Sólo usuarios con permiso 'READ_REPORTS' pueden acceder
 * router.get('/reports', authMiddleware, checkPermission('READ_REPORTS'), reportsController.list);
 *
 * // Sólo administradores con 'MANAGE_USERS' pueden eliminar usuarios
 * router.delete('/users/:id', authMiddleware, checkPermission('MANAGE_USERS'), usersController.delete);
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {

    // Guardia: authMiddleware debe haber corrido antes
    if (!req.user || !Array.isArray(req.user.permissions)) {
      return res.status(401).json({
        error: true,
        message: 'Autenticación requerida antes de verificar permisos',
      });
    }

    // Verificar si el array de permisos incluye el permiso requerido
    if (req.user.permissions.includes(requiredPermission)) {
      return next(); // ✅ Tiene el permiso → continuar
    }

    // ❌ No tiene el permiso → 403 Forbidden
    return res.status(403).json({
      error: 'Acceso denegado: permiso insuficiente',
    });
  };
};

module.exports = checkPermission;

'use strict';

/**
 * Role-based access control middleware factory.
 * @param {string[]} allowedRoles - Array of roles permitted to access the route.
 * @returns {Function} Express middleware function.
 *
 * Usage: router.delete('/users/:id', authMiddleware, roleCheck(['admin']), controller.delete);
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Autenticación requerida',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
};

module.exports = roleCheck;

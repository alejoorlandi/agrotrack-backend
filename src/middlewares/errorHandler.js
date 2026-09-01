'use strict';

/**
 * Global error handling middleware.
 * Captures all errors and returns a standardized JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      error: true,
      message: messages,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Error interno del servidor';

  return res.status(statusCode).json({
    error: true,
    message,
  });
};

module.exports = errorHandler;

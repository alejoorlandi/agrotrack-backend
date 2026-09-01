'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header.
 * Attaches the decoded user payload to req.user.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Token de autenticación no proporcionado');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token inválido o expirado',
      });
    }
    next(err);
  }
};

module.exports = authMiddleware;

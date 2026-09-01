'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

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
      },
      token,
    };
  }
}

module.exports = new AuthService();

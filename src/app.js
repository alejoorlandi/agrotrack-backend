'use strict';

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Route imports — existentes
const authRoutes = require('./routes/authRoutes');
const animalRoutes = require('./routes/animalRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const sanitaryRecordRoutes = require('./routes/sanitaryRecordRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Route imports — RBAC
const usersRoutes = require('./routes/usersRoutes');
const groupsRoutes = require('./routes/groupsRoutes');
const permissionsRoutes = require('./routes/permissionsRoutes');


const app = express();

// --- Global Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    error: false,
    message: 'API de Trazabilidad Ganadera funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes — existentes ---
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sanitary-records', sanitaryRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- API Routes — RBAC ---
app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/permissions', permissionsRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// --- Global Error Handler ---
app.use(errorHandler);

module.exports = app;

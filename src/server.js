'use strict';

require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

/**
 * Server entry point.
 * Authenticates the database connection, syncs models, and starts listening.
 */
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sync models (creates tables if they don't exist)
    // Using sync() without alter/force to avoid SQLite ALTER TABLE limitations.
    // For schema changes, use dedicated migration scripts (e.g., migrate_add_user_id.js).
    await sequelize.sync();
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor de Trazabilidad Ganadera ejecutándose en http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`\n📌 Endpoints disponibles:`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/animals`);
      console.log(`   POST   /api/animals`);
      console.log(`   GET    /api/medicines`);
      console.log(`   POST   /api/medicines`);
      console.log(`   POST   /api/sanitary-records`);
      console.log(`   GET    /api/sanitary-records`);
      console.log(`   GET    /api/dashboard/alerts`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();

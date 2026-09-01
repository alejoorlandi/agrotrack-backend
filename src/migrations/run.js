'use strict';

/**
 * Database migration runner.
 * Syncs all Sequelize models with the SQLite database.
 */
const { sequelize } = require('../models');

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones...');
    await sequelize.sync({ force: true });
    console.log('✅ Migraciones completadas exitosamente.');
    console.log('📦 Tablas creadas: users, animals, medicines, sanitary_records');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
    process.exit(1);
  }
}

runMigrations();

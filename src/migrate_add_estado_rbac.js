'use strict';

/**
 * migrate_add_estado_rbac.js
 *
 * Migración manual para agregar la columna 'estado' a la tabla 'users'
 * y crear las tablas RBAC (groups, permissions, user_groups, group_permissions).
 *
 * SQLite no soporta ALTER TABLE ADD COLUMN con restricciones complejas,
 * por lo que usamos QueryInterface directamente con valores por defecto simples.
 *
 * Uso: node src/migrate_add_estado_rbac.js
 */

require('dotenv').config();
const { sequelize } = require('./models');
const { DataTypes, QueryTypes } = require('sequelize');

async function runMigration() {
  const qi = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos SQLite.');

    // ── 1. Agregar columna 'estado' a 'users' ──────────────────────────────
    // Primero verificamos si ya existe para que la migración sea idempotente
    const tableDescription = await qi.describeTable('users');

    if (!tableDescription.estado) {
      console.log("🔧 Agregando columna 'estado' a la tabla 'users'...");

      // SQLite solo soporta tipos simples en ALTER TABLE
      // Sequelize se encarga de mapear TEXT con el default
      await qi.addColumn('users', 'estado', {
        type: DataTypes.STRING, // SQLite no soporta ENUM nativo — se valida en el modelo
        allowNull: false,
        defaultValue: 'ACTIVO', // Todos los usuarios existentes quedan como ACTIVO
      });

      // Actualizar todos los registros existentes con el valor por defecto
      await sequelize.query(`UPDATE users SET estado = 'ACTIVO' WHERE estado IS NULL`, {
        type: QueryTypes.UPDATE,
      });

      console.log("   ✅ Columna 'estado' agregada. Usuarios existentes → ACTIVO.");
    } else {
      console.log("   ⏭️  La columna 'estado' ya existe en 'users'. Saltando.");
    }

    // ── 2. Sincronizar tablas RBAC ─────────────────────────────────────────
    // sequelize.sync() solo crea tablas que no existen, nunca modifica existentes
    console.log('\n🔧 Sincronizando tablas RBAC (groups, permissions, user_groups, group_permissions)...');
    await sequelize.sync();
    console.log('   ✅ Tablas RBAC sincronizadas correctamente.');

    console.log('\n✅ Migración completada. Ahora ejecuta: npm run db:seed:rbac\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en la migración:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();

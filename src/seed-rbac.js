'use strict';

/**
 * seed-rbac.js — Script de inicialización del módulo RBAC.
 *
 * Crea la estructura base de permisos, grupos y asignaciones necesaria
 * para que el sistema AgroTrack funcione correctamente.
 *
 * Lo que hace este script:
 *   1. Crea los 4 permisos base del sistema.
 *   2. Crea el grupo 'Administrador'.
 *   3. Asigna todos los permisos al grupo 'Administrador'.
 *   4. Asigna al primer usuario con role='admin' al grupo 'Administrador'.
 *
 * Uso:
 *   node src/seed-rbac.js
 *   node src/seed-rbac.js --email=otro@correo.com   (para asignar un usuario específico)
 *
 * ⚠️  Este script es IDEMPOTENTE: puede correrse múltiples veces sin duplicar datos.
 */

require('dotenv').config();

// Cargamos todos los modelos (esto también establece las asociaciones)
const { sequelize, User, Group, Permission, UserGroup, GroupPermission } = require('./models');

// --- Configuración del seed ---

/** Permisos base del sistema */
const PERMISOS_BASE = [
  {
    codigo: 'MANAGE_USERS',
    descripcion: 'Crear, editar y eliminar usuarios del sistema',
  },
  {
    codigo: 'MANAGE_GROUPS',
    descripcion: 'Crear, editar y eliminar grupos y asignar permisos',
  },
  {
    codigo: 'READ_REPORTS',
    descripcion: 'Ver reportes e informes del sistema',
  },
  {
    codigo: 'WRITE_SANIDAD',
    descripcion: 'Registrar y editar eventos sanitarios de animales',
  },
];

/** Email del usuario a asignar como Administrador (puede sobreescribirse por CLI arg) */
const getTargetEmail = () => {
  const emailArg = process.argv.find((arg) => arg.startsWith('--email='));
  return emailArg ? emailArg.split('=')[1] : null;
};

// --- Función principal ---

async function seedRBAC() {
  try {
    // 1. Conectar y sincronizar tablas RBAC
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    await sequelize.sync(); // Crea las tablas RBAC si no existen
    console.log('✅ Tablas sincronizadas.\n');

    // ── PASO 1: Crear Permisos ──────────────────────────────────────────────
    console.log('📋 Paso 1: Creando permisos base...');
    const permisosCreados = [];

    for (const permisoData of PERMISOS_BASE) {
      // findOrCreate evita duplicados si el script se corre más de una vez
      const [permiso, created] = await Permission.findOrCreate({
        where: { codigo: permisoData.codigo },
        defaults: { descripcion: permisoData.descripcion },
      });

      permisosCreados.push(permiso);
      console.log(`   ${created ? '➕ Creado' : '⏭️  Existente'}: ${permiso.codigo}`);
    }

    // ── PASO 2: Crear Grupo 'Administrador' ────────────────────────────────
    console.log('\n👥 Paso 2: Creando grupo Administrador...');
    const [grupoAdmin, grupoCreado] = await Group.findOrCreate({
      where: { nombre: 'Administrador' },
      defaults: {
        descripcion: 'Acceso total al sistema. Gestiona usuarios, grupos y configuraciones.',
      },
    });

    console.log(`   ${grupoCreado ? '➕ Creado' : '⏭️  Existente'}: ${grupoAdmin.nombre}`);

    // ── PASO 3: Asignar todos los permisos al grupo Administrador ──────────
    console.log('\n🔑 Paso 3: Asignando permisos al grupo Administrador...');
    for (const permiso of permisosCreados) {
      const [, asignado] = await GroupPermission.findOrCreate({
        where: {
          group_id: grupoAdmin.id,
          permission_id: permiso.id,
        },
      });
      console.log(`   ${asignado ? '➕ Asignado' : '⏭️  Ya tenía'}: ${permiso.codigo}`);
    }

    // ── PASO 4: Asignar usuario al grupo Administrador ─────────────────────
    console.log('\n👤 Paso 4: Asignando usuario administrador al grupo...');

    const emailTarget = getTargetEmail();
    let usuarioAdmin;

    if (emailTarget) {
      // Buscar por email específico si se pasó por CLI
      usuarioAdmin = await User.findOne({ where: { email: emailTarget } });
      if (!usuarioAdmin) {
        console.error(`   ❌ No se encontró un usuario con email: ${emailTarget}`);
        process.exit(1);
      }
    } else {
      // Por defecto: primer usuario con role='admin'
      usuarioAdmin = await User.findOne({ where: { role: 'admin' } });
      if (!usuarioAdmin) {
        console.warn('   ⚠️  No se encontró ningún usuario con role=admin.');
        console.warn('      Crea un usuario administrador primero con: node src/create-admin.js');
        console.warn('      Luego vuelve a correr: node src/seed-rbac.js --email=admin@test.com');
        process.exit(0);
      }
    }

    const [, usuarioAsignado] = await UserGroup.findOrCreate({
      where: {
        user_id: usuarioAdmin.id,
        group_id: grupoAdmin.id,
      },
    });

    console.log(`   ${usuarioAsignado ? '➕ Asignado' : '⏭️  Ya era miembro'}: ${usuarioAdmin.email} → ${grupoAdmin.nombre}`);

    // ── RESUMEN ────────────────────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║        RBAC Seed completado con éxito        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Permisos:  ${permisosCreados.length} permisos base                    ║`);
    console.log(`║  Grupo:     ${grupoAdmin.nombre}                     ║`);
    console.log(`║  Usuario:   ${usuarioAdmin.email.padEnd(32)}║`);
    console.log('╚══════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el seed RBAC:');
    console.error(error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

seedRBAC();

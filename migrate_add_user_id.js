'use strict';

/**
 * Migration Script: Adds the missing `user_id` column to `animals`, `medicines`,
 * and `sanitary_records` tables in the SQLite database.
 *
 * SQLite does not support ALTER TABLE ... ADD COLUMN with constraints like
 * REFERENCES, but it DOES support adding a plain column. We add the column
 * as a nullable UUID, which is sufficient for Sequelize's foreign key lookups.
 *
 * Usage: node migrate_add_user_id.js
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(process.env.DB_PATH || './database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log,
});

async function migrate() {
  console.log('🔄 Starting migration...\n');

  // Check existing columns for each table and add user_id if missing
  const tablesToMigrate = ['animals', 'medicines', 'sanitary_records'];

  for (const table of tablesToMigrate) {
    try {
      // Get current columns
      const [columns] = await sequelize.query(`PRAGMA table_info('${table}')`);
      const columnNames = columns.map(col => col.name);

      if (columnNames.includes('user_id')) {
        console.log(`✅ Table '${table}' already has 'user_id' column. Skipping.`);
      } else {
        console.log(`➕ Adding 'user_id' column to '${table}'...`);
        await sequelize.query(`ALTER TABLE '${table}' ADD COLUMN 'user_id' UUID;`);
        console.log(`✅ Column 'user_id' added to '${table}' successfully.`);
      }
    } catch (err) {
      console.error(`❌ Error migrating table '${table}':`, err.message);
    }
  }

  console.log('\n🎉 Migration complete!');
  console.log('\n⚠️  NOTE: Existing rows will have user_id = NULL.');
  console.log('   If you need to assign them to a user, run:');
  console.log("   UPDATE animals SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;");
  console.log("   UPDATE medicines SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;");
  console.log("   UPDATE sanitary_records SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;");

  await sequelize.close();
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

import 'dotenv/config';
import { createClient } from '@libsql/client';

const localClient = createClient({ url: 'file:movies.db' });
const tursoUrl = process.env.TURSO_CONNECTION_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error('❌ Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN in environment variables.');
  process.exit(1);
}

const tursoClient = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

async function pushToTurso() {
  console.log('🚀 Starting Database Push from local movies.db to Turso...');
  console.log(`Target Turso DB: ${tursoUrl}`);

  // Disable FK checks on Turso during migration
  await tursoClient.execute('PRAGMA foreign_keys = OFF;');

  // 1. Get all table definitions from local SQLite
  const tablesRes = await localClient.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%_backup';"
  );

  console.log(`📋 Found ${tablesRes.rows.length} tables in local database.`);

  // Drop existing tables on Turso to ensure clean state
  for (const table of tablesRes.rows) {
    const tableName = table.name;
    console.log(`🧹 Dropping existing table on Turso if exists: ${tableName}`);
    await tursoClient.execute(`DROP TABLE IF EXISTS "${tableName}";`);
  }

  // 2. Create tables on Turso
  for (const table of tablesRes.rows) {
    const tableName = table.name;
    const createSql = table.sql;
    console.log(`🏗️ Creating table: ${tableName}`);
    await tursoClient.execute(createSql);
  }

  // 3. Copy rows for each table
  for (const table of tablesRes.rows) {
    const tableName = table.name;
    const rowsRes = await localClient.execute(`SELECT * FROM "${tableName}";`);
    const rows = rowsRes.rows;

    console.log(`📦 Copying ${rows.length} rows for table: ${tableName}...`);

    if (rows.length === 0) continue;

    // Batch insert rows
    const keys = Object.keys(rows[0]);
    const columns = keys.map((k) => `"${k}"`).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const insertSql = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders});`;

    for (const row of rows) {
      const values = keys.map((k) => row[k]);
      await tursoClient.execute({ sql: insertSql, args: values });
    }
  }

  // Re-enable FK checks
  await tursoClient.execute('PRAGMA foreign_keys = ON;');

  console.log('\n✅ DATABASE PUSH COMPLETE! Verifying remote tables and counts:');
  const verifyRes = await tursoClient.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );

  for (const table of verifyRes.rows) {
    const countRes = await tursoClient.execute(`SELECT COUNT(*) as count FROM "${table.name}";`);
    console.log(`  - Table '${table.name}': ${countRes.rows[0].count} rows`);
  }
}

pushToTurso().catch((err) => {
  console.error('❌ Error during Turso push:', err);
  process.exit(1);
});

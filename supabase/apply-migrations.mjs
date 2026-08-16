/**
 * Apply SQL migrations and seed data to remote Supabase PostgreSQL.
 * Uses node-postgres (pg) with direct database connection.
 * 
 * Requires DATABASE_URL or SUPABASE_DB_URL in .env, OR constructs
 * the connection from the project ref and service role password.
 * 
 * Usage: node supabase/apply-migrations.mjs
 * 
 * For Supabase, the connection string format is:
 *   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 * 
 * If DATABASE_URL is not set, we use the Supabase connection pooler
 * with the postgres user password (database password, not service_role key).
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim().replace(/\r$/, '');
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
});

const DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(`
ERROR: DATABASE_URL is not set.

To get your Supabase database connection string:
1. Go to https://supabase.com/dashboard/project/mboyjhstnzrfzrlwsouv/settings/database
2. Scroll to "Connection string" section
3. Copy the "URI" connection string
4. Add it to your .env file as DATABASE_URL=postgresql://...

Example format:
DATABASE_URL=postgresql://postgres.mboyjhstnzrfzrlwsouv:[YOUR-DB-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
`);
  process.exit(1);
}

async function executeSql(client, sql, label) {
  console.log(`\n=== Applying: ${label} ===`);
  console.log(`SQL length: ${sql.length} chars`);
  
  try {
    await client.query(sql);
    console.log(`✓ ${label} applied successfully`);
    return true;
  } catch (err) {
    console.error(`✗ ${label} failed:`);
    console.error(`  ${err.message}`);
    if (err.detail) console.error(`  Detail: ${err.detail}`);
    if (err.hint) console.error(`  Hint: ${err.hint}`);
    return false;
  }
}

async function main() {
  console.log('SADAN — Applying migrations to Supabase');
  console.log(`Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    const migrations = [
      { file: 'migrations/001_initial_schema.sql', label: '001_initial_schema' },
      { file: 'migrations/002_indexes.sql', label: '002_indexes' },
      { file: 'migrations/003_rls_policies.sql', label: '003_rls_policies' },
    ];

    for (const migration of migrations) {
      const sql = readFileSync(join(__dirname, migration.file), 'utf-8');
      const success = await executeSql(client, sql, migration.label);
      if (!success) {
        console.error(`\nMigration failed at ${migration.label}. Stopping.`);
        process.exit(1);
      }
    }

    // Apply seed
    console.log('\n--- Applying seed data ---');
    const seedSql = readFileSync(join(__dirname, 'seed', 'seed.sql'), 'utf-8');
    const seedSuccess = await executeSql(client, seedSql, 'seed_data');
    if (!seedSuccess) {
      console.error('\nSeed data failed.');
      process.exit(1);
    }
    
    // Verify tables
    console.log('\n--- Verifying tables ---');
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log('Tables created:');
    tablesResult.rows.forEach(r => console.log(`  ✓ ${r.tablename}`));
    
    // Verify indexes
    const indexResult = await client.query(`
      SELECT indexname FROM pg_indexes 
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `);
    console.log(`\nCustom indexes: ${indexResult.rows.length}`);
    
    // Verify RLS
    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity FROM pg_tables 
      WHERE schemaname = 'public' AND rowsecurity = true
      ORDER BY tablename;
    `);
    console.log(`Tables with RLS enabled: ${rlsResult.rows.length}`);
    
    // Verify seed data counts
    const counts = {};
    for (const table of ['fleets', 'drivers', 'vehicles', 'devices', 'trips', 'telemetry', 'alerts', 'ai_reports']) {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = res.rows[0].count;
    }
    console.log('\nSeed data counts:');
    Object.entries(counts).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
    
    console.log('\n✓ All migrations and seed data applied successfully');
    
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

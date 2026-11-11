import { db } from '@/db';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';

async function clearDatabase() {
  const tableNames = Object.values(schema)
    .map((table: any) => table[Symbol.for('drizzle:Name')])
    .filter(Boolean);

  if (tableNames.length === 0) {
    console.log('No tables found in schema.');
    process.exit(0);
  }

  console.log(`Found ${tableNames.length} tables to truncate...`);

  try {
    // Disable foreign key checks or use CASCADE to handle relations
    const tablesList = tableNames.map((name) => `"${name}"`).join(', ');
    await db.execute(sql.raw(`TRUNCATE TABLE ${tablesList} RESTART IDENTITY CASCADE;`));
    console.log('Database data cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    process.exit(0);
  }
}

clearDatabase();

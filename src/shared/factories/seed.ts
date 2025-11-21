/**
 * Database Seeding Script
 *
 * Usage:
 * npm run seed
 */
import { PostgresDatabase } from '../../infrastructure/database/PostgresDatabase.js';
import { DataFactory } from './DataFactory.js';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const database = new PostgresDatabase(
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce'
  );

  try {
    // Seed products
    await DataFactory.seedProducts(database, 50);

    // TODO: Seed other entities
    // await DataFactory.seedCustomers(database, 100);
    // await DataFactory.seedOrders(database, 200);

    console.log('\n✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

seed();

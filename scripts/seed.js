require('dotenv').config({ path: './.env.local' });
const { db } = require('@vercel/postgres');

async function createUsersTable(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "users" table`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

async function createResourcesTable(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "resources" table if it doesn't exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS resources (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      "location" VARCHAR(255),
      "type" VARCHAR(255),
      "capacity" INTEGER
    );
  `;

    console.log(`Created "resources" table`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error creating resources table:', error);
    throw error;
  }
}

async function createReservationsTable(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "reservations" table if it doesn't exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      "userId" UUID NOT NULL,
      "resourceId" UUID NOT NULL,
      "startTime" TIMESTAMP NOT NULL,
      "endTime" TIMESTAMP NOT NULL,
      "status" VARCHAR(255) NOT NULL DEFAULT 'confirmed'
    );
  `;

    console.log(`Created "reservations" table`);

    return {
      createTable,
    };
  } catch (error) {
    console.error('Error creating reservations table:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await createUsersTable(client);
  await createResourcesTable(client);
  await createReservationsTable(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});


import type { PoolClient, Pool } from '@neondatabase/serverless';

async function executeQuery(client: Pool | PoolClient, query: string) {
  return await client.query(query);
}

export async function createResourcesTable(client: Pool | PoolClient) {
  const query = `
    CREATE TABLE IF NOT EXISTS resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      capacity INTEGER NOT NULL,
      equipment TEXT[],
      "imageUrl" TEXT,
      tags TEXT[],
      availability VARCHAR(50) DEFAULT 'Disponível',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  return await executeQuery(client, query);
}

export async function createUsersTable(client: Pool | PoolClient) {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'User',
      avatar TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  return await executeQuery(client, query);
}

export async function createReservationsTable(client: Pool | PoolClient) {
  // Enable pgcrypto extension for gen_random_uuid()
  await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
  const query = `
    CREATE TABLE IF NOT EXISTS reservations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "resourceId" UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
      "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("resourceId", "startTime", "endTime")
    );
  `;
  return await executeQuery(client, query);
}

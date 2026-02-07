
import { Pool } from '@neondatabase/serverless';
import { createUsersTable, createResourcesTable, createReservationsTable } from '../lib/schema';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not set');
  }

  console.log("Connecting to:", connectionString.split('@')[1]); // Log masked host

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    console.log('Creating tables...');
    await createUsersTable(client);
    await createResourcesTable(client);
    await createReservationsTable(client);
    console.log('Tables created successfully.');

    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const userRes = await client.query(`
      INSERT INTO users (id, name, email, password, role)
      VALUES
        ('410544b2-4001-4271-9855-fec4b6a6442a', 'Admin User', 'admin@example.com', '${hashedPassword}', 'Admin'),
        ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Regular User', 'user@example.com', '${hashedPassword}', 'User')
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('Users seeded:', userRes.rowCount);

    console.log('Seeding resources...');
    const resourceRes = await client.query(`
      INSERT INTO resources (id, name, type, location, capacity, equipment, "imageUrl", tags, availability)
      VALUES
        ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sala de Reunião 1', 'Sala', 'Bloco A', 10, '{"Projetor", "Quadro Branco"}', 'https://via.placeholder.com/150', '{"reuniao", "apresentacao"}', 'Disponível'),
        ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Projetor Epson', 'Equipamento', 'Sala de TI', 1, '{"Cabo HDMI", "Cabo VGA"}', 'https://via.placeholder.com/150', '{"projetor", "apresentacao"}', 'Disponível')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('Resources seeded:', resourceRes.rowCount);

    console.log('Seeding reservations...');
    await client.query(`
      INSERT INTO reservations (id, "resourceId", "userId", "startTime", "endTime")
      VALUES
        ('a56e1573-2169-4b69-8692-23c6d8d672a6', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '410544b2-4001-4271-9855-fec4b6a6442a', '2024-01-01T10:00:00Z', '2024-01-01T11:00:00Z')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('An error occurred in main:', err);
  process.exit(1);
});

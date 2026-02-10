
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

async function migrate() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("No connection string");

    const pool = new Pool({ connectionString });

    try {
        const client = await pool.connect();
        console.log("Connected successfully.");

        console.log("Adding 'description' column to 'reservations' table...");
        await client.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS description TEXT');
        console.log("Column added successfully.");

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();

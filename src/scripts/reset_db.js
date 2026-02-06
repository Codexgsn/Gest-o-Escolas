
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

async function reset() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("No connection string");

    const pool = new Pool({ connectionString });

    try {
        const client = await pool.connect();
        console.log("Connected. Dropping tables...");

        // Order matters due to foreign keys
        await client.query('DROP TABLE IF EXISTS reservations CASCADE');
        await client.query('DROP TABLE IF EXISTS resources CASCADE');
        await client.query('DROP TABLE IF EXISTS users CASCADE');

        console.log("Tables dropped successfully.");

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Reset failed:", err);
        process.exit(1);
    }
}

reset();

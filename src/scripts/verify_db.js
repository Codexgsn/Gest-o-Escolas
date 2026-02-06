
const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

async function verify() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("No connection string");

    const pool = new Pool({ connectionString });

    try {
        const client = await pool.connect();
        console.log("Connected successfully.");

        const res = await client.query('SELECT count(*) FROM users');
        console.log('User count:', res.rows[0].count);

        const res2 = await client.query('SELECT count(*) FROM resources');
        console.log('Resource count:', res2.rows[0].count);

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
}

verify();


const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

async function check() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("No connection string");

    const pool = new Pool({ connectionString });

    try {
        const client = await pool.connect();
        console.log("Connected. Checking resources image data...");

        const { rows } = await client.query('SELECT id, name, "imageUrl" FROM resources');

        rows.forEach(row => {
            console.log(`Resource: ${row.name}`);
            console.log(`URL length: ${row.imageUrl ? row.imageUrl.length : 'null'}`);
            console.log(`URL: ${row.imageUrl}`);
            console.log('---');
        });

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Check failed:", err);
        process.exit(1);
    }
}

check();

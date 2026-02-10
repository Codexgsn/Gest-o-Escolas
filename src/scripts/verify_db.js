
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

        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name));

        const res = await client.query('SELECT count(*) FROM reservations');
        console.log('Total reservations:', res.rows[0].count);

        const resWithUser = await client.query('SELECT count(*) FROM reservations r JOIN users u ON r."userId" = u.id');
        console.log('Reservations with valid user:', resWithUser.rows[0].count);

        const resWithResource = await client.query('SELECT count(*) FROM reservations r JOIN resources res ON r."resourceId" = res.id');
        console.log('Reservations with valid resource:', resWithResource.rows[0].count);

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


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

        console.log("Creating 'settings' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                "startTime" TEXT NOT NULL DEFAULT '07:30',
                "endTime" TEXT NOT NULL DEFAULT '17:00',
                "classBlockMinutes" INTEGER NOT NULL DEFAULT 50,
                "operatingDays" INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
                "classBlocks" JSONB NOT NULL DEFAULT '[]',
                "breaks" JSONB NOT NULL DEFAULT '[]',
                "resourceTags" TEXT[] NOT NULL DEFAULT '{}'
            )
        `);
        console.log("Table created.");

        const countRes = await client.query('SELECT count(*) FROM settings');
        if (parseInt(countRes.rows[0].count) === 0) {
            console.log("Inserting default settings...");
            await client.query(`
                INSERT INTO settings ("startTime", "endTime", "classBlockMinutes", "operatingDays", "classBlocks", "breaks", "resourceTags")
                VALUES (
                    '07:30', 
                    '17:10', 
                    50, 
                    '{1,2,3,4,5}', 
                    '[{"startTime": "07:30", "endTime": "08:20"}, {"startTime": "08:20", "endTime": "09:10"}, {"startTime": "09:30", "endTime": "10:20"}, {"startTime": "10:20", "endTime": "11:10"}, {"startTime": "11:10", "endTime": "12:00"}, {"startTime": "13:20", "endTime": "14:10"}, {"startTime": "14:10", "endTime": "15:00"}, {"startTime": "15:20", "endTime": "16:10"}, {"startTime": "16:10", "endTime": "17:00"}]',
                    '[{"startTime": "09:10", "endTime": "09:30"}, {"startTime": "12:00", "endTime": "13:20"}, {"startTime": "15:00", "endTime": "15:20"}]',
                    '{"Sala de Aula", "Laboratório", "Audiovisual", "Reunião", "Estudo"}'
                )
            `);
            console.log("Default settings inserted.");
        }

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();

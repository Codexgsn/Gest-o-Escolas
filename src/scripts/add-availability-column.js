const { Pool } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config();

async function addAvailabilityColumn() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL or POSTGRES_URL is not set');
    }

    const pool = new Pool({ connectionString });
    const client = await pool.connect();

    try {
        console.log('Adicionando coluna "availability" à tabela "resources"...');
        await client.query(`
      ALTER TABLE resources 
      ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'Disponível';
    `);
        console.log('Coluna adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar coluna:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

addAvailabilityColumn();

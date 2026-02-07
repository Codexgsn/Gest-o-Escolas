const { sql } = require('@vercel/postgres');

async function checkUser() {
    try {
        const userId = 'f2a33cb6-66ca-4081-b5ff-5076547744d9';
        const result = await sql`SELECT id, name, email, role FROM users WHERE id = ${userId}`;
        console.log('User data:', result.rows[0]);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkUser();

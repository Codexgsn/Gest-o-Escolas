import { cookies } from 'next/headers';
import { db } from '@vercel/postgres';
import { type User } from '@/lib/definitions';

export async function getCurrentUser(): Promise<User | null> {
    const sessionCookie = cookies().get('session');

    if (!sessionCookie || !sessionCookie.value) {
        return null;
    }

    const userId = sessionCookie.value;

    try {
        const { rows } = await db.sql`SELECT id, name, email, role, avatar, "createdAt" FROM users WHERE id = ${userId}`;
        if (rows.length === 0) {
            return null;
        }
        return rows[0] as any as User;
    } catch (error) {
        console.error('Failed to fetch current user:', error);
        return null;
    }
}

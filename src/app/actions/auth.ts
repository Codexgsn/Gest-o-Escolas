'use server'

import { z } from 'zod';
import { db } from '@vercel/postgres';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Senha é obrigatória'),
});

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            success: false,
            message: 'Dados inválidos.',
            errors: result.error.flatten().fieldErrors,
        };
    }

    const { email, password } = result.data;

    try {
        const { rows } = await db.sql`SELECT * FROM users WHERE email = ${email}`;
        const user = rows[0];

        if (!user) {
            return {
                success: false,
                message: 'Credenciais inválidas.',
            };
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
            return {
                success: false,
                message: 'Credenciais inválidas.',
            };
        }

        // Set a session cookie (simplified for this example)
        // In a production app, use a robust session library or JWT
        cookies().set('session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Ocorreu um erro ao tentar fazer login.',
        };
    }

    redirect('/dashboard');
}

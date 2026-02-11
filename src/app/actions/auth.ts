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
    console.log('Login action started for:', formData.get('email'));
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        const errorResponse = {
            success: false,
            message: 'Dados inválidos.',
            errors: result.error.flatten().fieldErrors,
        };
        console.log('Returning failure response (invalid data):', errorResponse);
        return errorResponse;
    }

    const { email, password } = result.data;

    try {
        const { rows } = await db.sql`SELECT * FROM users WHERE email = ${email}`;
        const user = rows[0];

        if (!user) {
            const errorResponse = {
                success: false,
                message: 'Credenciais inválidas.',
            };
            console.log('Returning failure response (user not found):', errorResponse);
            return errorResponse;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
            const errorResponse = {
                success: false,
                message: 'Credenciais inválidas.',
            };
            console.log('Returning failure response (password mismatch):', errorResponse);
            return errorResponse;
        }

        // Set a session cookie (simplified for this example)
        // In a production app, use a robust session library or JWT
        cookies().set('session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });

        console.log('Login successful, returning success response');
        return {
            success: true,
            message: 'Login realizado com sucesso!',
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Ocorreu um erro ao tentar fazer login.',
        };
    }
}

export async function logout() {
    cookies().delete('session');
    redirect('/');
}

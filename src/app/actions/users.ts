
'use server';

import { z } from "zod"
import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { fetchUserById } from '@/lib/data';
import { hash } from 'bcrypt'; // We'll use bcrypt for hashing passwords

export async function getUsers() {
    try {
        const { rows } = await db.sql`
            SELECT id, name, email, role, avatar, "createdAt" 
            FROM users 
            ORDER BY "createdAt" DESC
        `;
        return rows as any as import("@/lib/definitions").User[];

    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw new Error('Failed to fetch users');
    }
}

// --- Schemas for Validation ---
const userCreationSchema = z.object({
    name: z.string().min(2).max(255),
    email: z.string().email().max(255),
    role: z.enum(["Admin", "Usuário"]),
    password: z.string().min(8),
    avatar: z.string().url().optional().or(z.literal("")),
});

const userUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(2).max(255),
    email: z.string().email().max(255),
    role: z.enum(["Admin", "Usuário"]),
    avatar: z.string().url().optional().or(z.literal("")),
});


// --- User Creation ---
export async function createUserAction(
    values: unknown,
    currentUserId: string | null
) {
    const validatedFields = userCreationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados de criação de usuário inválidos." };
    }

    const { name, email, role, password, avatar } = validatedFields.data;

    if (currentUserId) {
        const currentUser = await fetchUserById(currentUserId);
        if (!currentUser || currentUser.role !== 'Admin') {
            return { success: false, message: "Permissão negada." };
        }
    }

    try {
        // Check if user already exists
        const existingUser = await db.sql`SELECT * FROM users WHERE email = ${email}`;
        if ((existingUser.rowCount ?? 0) > 0) {
            return { success: false, message: "Um usuário com este email já existe." };
        }

        const hashedPassword = await hash(password, 10);
        const id = crypto.randomUUID();

        await db.sql`
            INSERT INTO users (id, name, email, role, password, avatar)
            VALUES (${id}, ${name}, ${email}, ${role}, ${hashedPassword}, ${avatar || `https://i.pravatar.cc/150?u=${email}`})
        `;

        revalidatePath('/dashboard/users');
        return { success: true, message: `Usuário ${name} criado com sucesso!` };

    } catch (error) {
        console.error("Database error:", error);
        return { success: false, message: "Falha ao criar o usuário." };
    }
}

// --- User Update ---
export async function updateUserAction(
    values: unknown,
    currentUserId: string | null
) {
    const validatedFields = userUpdateSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: "Dados de atualização de usuário inválidos." };
    }

    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }
    const currentUser = await fetchUserById(currentUserId);
    if (!currentUser || currentUser.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }

    try {
        const { id, name, email, role, avatar } = validatedFields.data;

        await db.sql`
            UPDATE users
            SET name = ${name}, email = ${email}, role = ${role}, avatar = ${avatar}
            WHERE id = ${id}
        `;

        revalidatePath('/dashboard/users');
        return { success: true, message: `Usuário ${name} atualizado com sucesso!` };

    } catch (error) {
        console.error("Database error:", error);
        return { success: false, message: "Falha ao atualizar o usuário." };
    }
}

// --- User Deletion ---
export async function deleteUserAction(userId: string, currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const currentUser = await fetchUserById(currentUserId);
    if (!currentUser || currentUser.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }

    if (userId === currentUserId) {
        return { success: false, message: "Você não pode excluir sua própria conta." };
    }

    try {
        await db.sql`DELETE FROM users WHERE id = ${userId}`;
        revalidatePath('/dashboard/users');
        return { success: true, message: "Usuário excluído com sucesso." };
    } catch (error) {
        return { success: false, message: "Falha ao excluir o usuário." };
    }
}

export async function deleteMultipleUsersAction(userIds: string[], currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }
    const currentUser = await fetchUserById(currentUserId);
    if (!currentUser || currentUser.role !== 'Admin') {
        return { success: false, message: "Permissão negada." };
    }

    if (userIds.includes(currentUserId)) {
        return { success: false, message: "Você não pode se excluir em uma operação em massa." };
    }

    try {
        const query = `DELETE FROM users WHERE id IN (${userIds.map(id => `'${id}'`).join(',')})`;
        await db.query(query);

        revalidatePath('/dashboard/users');
        return { success: true, message: "Usuários selecionados excluídos com sucesso." };
    } catch (error) {
        return { success: false, message: "Falha ao excluir usuários." };
    }
}

// --- Password Reset ---
export async function resetPasswordAction(email: string) {
    // In a real app, you would:
    // 1. Verify the user with this email exists.
    // 2. Generate a secure, single-use token and save it with an expiration date.
    // 3. Send an email to the user with a link containing the token.
    console.log(`Password reset requested for ${email}.`);

    // For now, we'll just simulate a successful response.
    return {
        success: true,
        message: "Se um usuário com este email existir, um link de redefinição de senha foi enviado."
    };
}

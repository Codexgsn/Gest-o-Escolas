
'use server';

import { z } from "zod";
import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { fetchUserById } from "@/lib/data";

export async function getReservations() {
    try {
        const { rows } = await db.sql`
            SELECT 
                r.id, 
                r."resourceId", 
                r."userId", 
                r."startTime", 
                r."endTime", 
                r.status, 
                r."createdAt",
                res.name as "resourceName",
                u.name as "userName"
            FROM reservations r
            JOIN resources res ON r."resourceId" = res.id
            JOIN users u ON r."userId" = u.id
            ORDER BY r."startTime" DESC
        `;
        return rows as any as import("@/lib/definitions").Reservation[];
    } catch (error) {
        console.error('Failed to fetch reservations:', error);
        throw new Error('Failed to fetch reservations');
    }
}

// Helper function to check for overlapping reservations using SQL
async function hasConflict(resourceId: string, startTime: Date, endTime: Date, reservationId: string | null = null): Promise<boolean> {
    let query = `
        SELECT id FROM reservations
        WHERE "resourceId" = $1
          AND status = 'Confirmada'
          -- Check for overlapping time ranges
          AND ("startTime", "endTime") OVERLAPS ($2, $3)
    `;
    const params: (string | Date)[] = [resourceId, startTime, endTime];

    // If checking for an update, exclude the reservation itself from the check
    if (reservationId) {
        query += ` AND id != $4`;
        params.push(reservationId);
    }

    try {
        const { rows } = await db.query(query, params);
        return rows.length > 0;
    } catch (error) {
        console.error("SQL Error in hasConflict:", error);
        // To be safe, prevent reservation if the check fails
        return true;
    }
}

const baseReservationSchema = z.object({
    resourceId: z.string({ required_error: "Por favor, selecione um recurso." }),
    date: z.coerce.date({ required_error: "Por favor, selecione uma data." }),
    startTime: z.string({ required_error: "Por favor, selecione um horário de início." }),
    endTime: z.string({ required_error: "Por favor, selecione um horário de término." }),
    description: z.string().optional(),
});

const reservationSchema = baseReservationSchema.refine(data => data.endTime > data.startTime, {
    message: "O horário de término deve ser posterior ao horário de início.",
    path: ["endTime"], // Path to the field that gets the error
});

export async function createReservationAction(values: unknown, currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const validatedFields = reservationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { resourceId, date, startTime, endTime } = validatedFields.data;

    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (await hasConflict(resourceId, startDateTime, endDateTime)) {
        return { success: false, message: "Conflito de agendamento. Este horário já está reservado para o recurso selecionado." };
    }

    try {
        await db.sql`
      INSERT INTO reservations ("userId", "resourceId", "startTime", "endTime", status, description)
      VALUES (${currentUserId}, ${resourceId}, ${startDateTime.toISOString()}, ${endDateTime.toISOString()}, 'Confirmada', ${validatedFields.data.description || null})
    `;
        revalidatePath('/dashboard/reservations');
        return { success: true, message: "Reserva criada com sucesso!" };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, message: "Falha ao criar a reserva no banco de dados." };
    }
}

const updateReservationSchema = baseReservationSchema.extend({
    id: z.string(),
});

export async function updateReservationAction(values: unknown, currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const validatedFields = updateReservationSchema.safeParse(values);
    if (!validatedFields.success) {
        return { success: false, message: 'Dados inválidos.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, resourceId, date, startTime, endTime } = validatedFields.data;

    const user = await fetchUserById(currentUserId);
    const reservationResult = await db.sql`SELECT "userId" FROM reservations WHERE id = ${id}`;
    if (reservationResult.rows.length === 0) {
        return { success: false, message: "Reserva não encontrada." };
    }
    const reservationOwnerId = reservationResult.rows[0].userId;

    if (!user || (user.id !== reservationOwnerId && user.role !== 'Admin')) {
        return { success: false, message: "Permissão negada para editar esta reserva." };
    }

    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (await hasConflict(resourceId, startDateTime, endDateTime, id)) {
        return { success: false, message: "Conflito de agendamento. O horário selecionado não está disponível." };
    }

    try {
        await db.sql`
            UPDATE reservations
            SET "resourceId" = ${resourceId}, 
                "startTime" = ${startDateTime.toISOString()}, 
                "endTime" = ${endDateTime.toISOString()},
                description = ${validatedFields.data.description || null}
            WHERE id = ${id}
        `;
        revalidatePath('/dashboard/reservations');
        revalidatePath(`/dashboard/reservations/edit/${id}`);
        return { success: true, message: "Reserva atualizada com sucesso!" };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, message: "Falha ao atualizar a reserva." };
    }
}

export async function cancelReservationAction(reservationId: string, currentUserId: string | null) {
    if (!currentUserId) {
        return { success: false, message: "Usuário não autenticado." };
    }

    const user = await fetchUserById(currentUserId);
    const reservationResult = await db.sql`SELECT "userId" FROM reservations WHERE id = ${reservationId}`;
    if (reservationResult.rows.length === 0) {
        return { success: false, message: "Reserva não encontrada." };
    }
    const reservation = reservationResult.rows[0];

    if (!user || (user.id !== reservation.userId && user.role !== 'Admin')) {
        return { success: false, message: "Permissão negada para cancelar esta reserva." };
    }

    try {
        await db.sql`UPDATE reservations SET status = 'Cancelada' WHERE id = ${reservationId}`;
        revalidatePath('/dashboard/reservations');
        return { success: true, message: "Reserva cancelada com sucesso." };
    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, message: "Falha ao cancelar a reserva." };
    }
}

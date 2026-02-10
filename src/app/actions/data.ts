
'use server'

import pool from '@/lib/db';
import { type Resource, type User, type Reservation } from '@/lib/definitions';
import { sql } from '@vercel/postgres';

// --- Resources ---
export async function getResources(): Promise<Resource[]> {
    try {
        const result = await sql`SELECT id, name, type, location, capacity, equipment, "imageUrl", tags FROM resources ORDER BY name ASC`;
        return result.rows as any as Resource[];
    } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
}

export async function getResourceById(id: string): Promise<Resource | undefined> {
    try {
        const result = await sql<Resource>`SELECT * FROM resources WHERE id = ${id}`;
        return result.rows[0];
    } catch (error) {
        console.error(`Error fetching resource with id: ${id}`, error);
        return undefined;
    }
}


// --- Users ---
export async function getUsers(): Promise<User[]> {
    try {
        const result = await sql<User>`SELECT * FROM users`;
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function getUserById(id: string): Promise<User | undefined> {
    try {
        const result = await sql<User>`SELECT * FROM users WHERE id = ${id}`;
        return result.rows[0];
    } catch (error) {
        console.error(`Error fetching user with id: ${id}`, error);
        return undefined;
    }
}


// --- Reservations ---
export async function getReservations(): Promise<Reservation[]> {
    try {
        const result = await sql<Reservation>`SELECT * FROM reservations`;
        return result.rows;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }
}

export async function getReservationById(id: string): Promise<Reservation | undefined> {
    try {
        const result = await sql`SELECT * FROM reservations WHERE id = ${id}`;
        return result.rows[0] as any as Reservation;
    } catch (error) {
        console.error(`Error fetching reservation with id: ${id}`, error);
        return undefined;
    }
}

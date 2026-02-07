
import { User, Resource, Reservation } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';
import { sql } from '@vercel/postgres';

// --- User Functions ---

export async function fetchUsers(): Promise<User[]> {
  noStore();
  try {
    const { rows } = await sql<User>`
      SELECT id, name, email, role, avatar, "createdAt"
      FROM users
      ORDER BY name ASC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function fetchUserById(id: string): Promise<User | null> {
  noStore();
  console.log(`Fetching user with id: ${id}`);

  try {
    const { rows } = await sql<User>`
      SELECT id, name, email, role, avatar, "createdAt"
      FROM users
      WHERE id = ${id}
    `;

    if (rows.length === 0) {
      console.log(`User not found with id: ${id}`);
      return null;
    }

    console.log(`User found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}


// --- Resource Functions ---

export async function fetchResources(tagFilter?: string[]): Promise<Resource[]> {
  noStore();
  console.log(`Fetching resources with tagFilter: ${tagFilter}`);
  try {
    if (tagFilter && tagFilter.length > 0) {
      const { rows } = await sql<Resource>`
        SELECT id, name, type, location, capacity, equipment, "imageUrl", tags, "createdAt"
        FROM resources
        WHERE tags && ${tagFilter as any}
        ORDER BY name ASC
      `;
      return rows;
    } else {
      const { rows } = await sql<Resource>`
        SELECT id, name, type, location, capacity, equipment, "imageUrl", tags, "createdAt"
        FROM resources
        ORDER BY name ASC
      `;
      return rows;
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
}


export async function fetchResourceById(id: string): Promise<Resource | null> {
  noStore();
  console.log(`Fetching resource with id: ${id}`);
  try {
    const { rows } = await sql<Resource>`
      SELECT id, name, type, location, capacity, equipment, "imageUrl", tags, "createdAt"
      FROM resources
      WHERE id = ${id}
    `;
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching resource:', error);
    return null;
  }
}

export async function fetchResourceTags(): Promise<string[]> {
  noStore();
  console.log('Fetching resource tags...');
  try {
    const { rows } = await sql`SELECT DISTINCT unnest(tags) as tag FROM resources`;
    return rows.map(r => r.tag);
  } catch (error) {
    console.error('Error fetching resource tags:', error);
    return [];
  }
}


// --- Reservation Functions ---

export async function fetchReservations(filters: {
  status?: string | string[];
  userId?: string;
}): Promise<Reservation[]> {
  noStore();
  console.log(`Fetching reservations with filters: ${JSON.stringify(filters)}`);
  try {
    const userId = filters.userId || null;
    const status = filters.status || null;

    let rows;
    if (userId && status) {
      const res = await sql`
        SELECT 
          r.id, r."resourceId", r."userId", r."startTime", r."endTime", r.status, r."createdAt",
          res.name as "resourceName",
          u.name as "userName"
        FROM reservations r
        JOIN resources res ON r."resourceId" = res.id
        JOIN users u ON r."userId" = u.id
        WHERE r."userId" = ${userId} AND r.status = ${status as any}
        ORDER BY r."startTime" DESC
      `;
      rows = res.rows;
    } else if (userId) {
      const res = await sql`
        SELECT 
          r.id, r."resourceId", r."userId", r."startTime", r."endTime", r.status, r."createdAt",
          res.name as "resourceName",
          u.name as "userName"
        FROM reservations r
        JOIN resources res ON r."resourceId" = res.id
        JOIN users u ON r."userId" = u.id
        WHERE r."userId" = ${userId}
        ORDER BY r."startTime" DESC
      `;
      rows = res.rows;
    } else if (status) {
      const res = await sql`
        SELECT 
          r.id, r."resourceId", r."userId", r."startTime", r."endTime", r.status, r."createdAt",
          res.name as "resourceName",
          u.name as "userName"
        FROM reservations r
        JOIN resources res ON r."resourceId" = res.id
        JOIN users u ON r."userId" = u.id
        WHERE r.status = ${status as any}
        ORDER BY r."startTime" DESC
      `;
      rows = res.rows;
    } else {
      const res = await sql`
        SELECT 
          r.id, r."resourceId", r."userId", r."startTime", r."endTime", r.status, r."createdAt",
          res.name as "resourceName",
          u.name as "userName"
        FROM reservations r
        JOIN resources res ON r."resourceId" = res.id
        JOIN users u ON r."userId" = u.id
        ORDER BY r."startTime" DESC
      `;
      rows = res.rows;
    }

    return rows as any as Reservation[];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
}

export async function fetchReservationById(id: string): Promise<Reservation | null> {
  noStore();
  console.log(`Fetching reservation with id: ${id}`);
  try {
    const { rows } = await sql`
      SELECT 
        r.id, r."resourceId", r."userId", r."startTime", r."endTime", r.status, r."createdAt",
        res.name as "resourceName",
        u.name as "userName"
      FROM reservations r
      JOIN resources res ON r."resourceId" = res.id
      JOIN users u ON r."userId" = u.id
      WHERE r.id = ${id}
    `;
    return (rows[0] as any as Reservation) || null;
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }
}

export async function fetchReservationsByResourceId(resourceId: string): Promise<Reservation[]> {
  noStore();
  console.log(`Fetching reservations with resourceId: ${resourceId}`);
  try {
    const { rows } = await sql`
      SELECT 
        r.id, r."resourceId", r."userId", r."startTime", r."endTime", r.status, r."createdAt",
        res.name as "resourceName",
        u.name as "userName"
      FROM reservations r
      JOIN resources res ON r."resourceId" = res.id
      JOIN users u ON r."userId" = u.id
      WHERE r."resourceId" = ${resourceId}
      ORDER BY r."startTime" DESC
    `;
    return rows as any as Reservation[];
  } catch (error) {
    console.error('Error fetching reservations by resource id:', error);
    return [];
  }
}

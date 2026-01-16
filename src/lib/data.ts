import { db } from '@vercel/postgres';
import { User, Resource, Reservation } from './definitions';

// --- User Functions ---
export async function fetchUsers() {
  try {
    const data = await db.sql<User>`SELECT * FROM users ORDER BY name ASC`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function fetchUserById(id: string) {
  try {
    const data = await db.sql<User>`SELECT * FROM users WHERE id = ${id}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

// --- Resource Functions ---
export async function fetchResources(tagFilter?: string[]) {
  try {
    let query = 'SELECT * FROM resources';
    const queryParams = [];

    if (tagFilter && tagFilter.length > 0) {
        query += ' WHERE tags @> $1'; // Use @> for array containment
        queryParams.push(tagFilter);
    }
    
    query += ' ORDER BY name ASC';

    const data = await db.query(query, queryParams);
    return data.rows as Resource[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch resources.');
  }
}

export async function fetchResourceById(id: string) {
  try {
    const data = await db.sql<Resource>`SELECT * FROM resources WHERE id = ${id}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch resource.');
  }
}

export async function fetchResourceTags() {
  try {
    const data = await db.sql`SELECT DISTINCT unnest(tags) as tag FROM resources ORDER BY tag`;
    return data.rows.map(row => row.tag as string);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch resource tags.');
  }
}

// --- Reservation Functions ---
export async function fetchReservations(filters: {
  status?: string | string[];
  userId?: string;
  showAll?: boolean;
  currentUserId?: string;
}) {
  try {
    let query = `
      SELECT
        r.id, r.resource_id AS "resourceId", r.user_id AS "userId",
        r.start_time AS "startTime", r.end_time AS "endTime", r.status,
        u.name AS "userName", u.email AS "userEmail", res.name AS "resourceName"
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN resources res ON r.resource_id = res.id
    `;

    const whereClauses = [];
    const queryParams = [];

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (statuses.length > 0) {
        queryParams.push(statuses);
        whereClauses.push(`r.status = ANY($${queryParams.length})`);
      }
    }

    if (filters.userId) {
      queryParams.push(filters.userId);
      whereClauses.push(`r.user_id = $${queryParams.length}`);
    } else if (!filters.showAll) {
        // Default to only showing the current user's reservations
        queryParams.push(filters.currentUserId);
        whereClauses.push(`r.user_id = $${queryParams.length}`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY r.start_time DESC';

    const data = await db.query(query, queryParams);
    const reservations = data.rows.map(row => ({
      ...row,
      startTime: new Date(row.startTime),
      endTime: new Date(row.endTime),
    }));
    
    return reservations as Reservation[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reservations.');
  }
}

export async function fetchReservationById(id: string) {
  try {
    const data = await db.sql<Reservation>`
      SELECT r.id, r.resource_id AS "resourceId", r.user_id AS "userId", 
             r.start_time AS "startTime", r.end_time AS "endTime", r.status
      FROM reservations r
      WHERE r.id = ${id}
    `;
    if (data.rows.length === 0) return null;
    
    const row = data.rows[0];
    return { ...row, startTime: new Date(row.startTime), endTime: new Date(row.endTime) } as Reservation;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reservation.');
  }
}

'use server'

import { db } from '@vercel/postgres';

export async function getDashboardStats() {
    try {
        const [
            reservationsCount,
            usersCount,
            resourcesCount,
            activeReservationsCount,
            upcomingReservationsCount,
            recentReservations,
            resourceUsage,
            resourceTypes
        ] = await Promise.all([
            // Total reservations
            db.sql`SELECT count(*) FROM reservations`,
            // Total users
            db.sql`SELECT count(*) FROM users`,
            // Total resources
            db.sql`SELECT count(*) FROM resources`,
            // Active reservations (confirmed and currently happening)
            db.sql`SELECT count(*) FROM reservations WHERE status = 'Confirmada' AND current_timestamp BETWEEN "startTime" AND "endTime"`,
            // Upcoming reservations (confirmed and starting in next 7 days)
            db.sql`SELECT count(*) FROM reservations WHERE status = 'Confirmada' AND "startTime" > current_timestamp AND "startTime" <= current_timestamp + interval '7 days'`,
            // Recent activity (last 5 reservations)
            db.sql`
                SELECT r.id, r.status, r."startTime", u.name as "userName", res.name as "resourceName"
                FROM reservations r
                JOIN users u ON r."userId" = u.id
                JOIN resources res ON r."resourceId" = res.id
                ORDER BY r."createdAt" DESC
                LIMIT 5
            `,
            // Resource usage (reservations count per resource)
            db.sql`
                SELECT res.name, count(r.id) as reservations
                FROM resources res
                LEFT JOIN reservations r ON res.id = r."resourceId"
                GROUP BY res.name
                ORDER BY reservations DESC
                LIMIT 5
            `,
            // Resource types
            db.sql`
                SELECT type, count(*) as value
                FROM resources
                GROUP BY type
            `
        ]);

        return {
            totalReservations: Number(reservationsCount.rows[0].count),
            totalUsers: Number(usersCount.rows[0].count),
            totalResources: Number(resourcesCount.rows[0].count),
            activeReservations: Number(activeReservationsCount.rows[0].count),
            upcomingReservations: Number(upcomingReservationsCount.rows[0].count),
            recentReservations: recentReservations.rows,
            resourceUsageData: resourceUsage.rows,
            resourceTypeChartData: resourceTypes.rows.map(r => ({ name: r.type, value: Number(r.value) })),
            bookingTrendsData: [] // TODO: Implement complex query for trends if needed, or leave empty for now
        };

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Failed to fetch dashboard stats');
    }
}

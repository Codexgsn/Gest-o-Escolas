
import { database } from '@/firebase/client';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { User, Resource, Reservation } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';

// --- User Functions ---

export async function fetchUsers(): Promise<User[]> {
  noStore();
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) {
      return [];
    }
    const usersData = snapshot.val();
    const usersList: User[] = Object.keys(usersData).map(key => ({
      id: key,
      ...usersData[key],
    }));
    return usersList;
  } catch (error) {
    console.error('Firebase Database Error fetching users:', error);
    throw new Error('Failed to fetch users from Firebase.');
  }
}

export async function fetchUserById(id: string): Promise<User | null> {
  noStore();
  try {
    const userRef = ref(database, `users/${id}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { id, ...snapshot.val() } as User;
    }
    return null;
  } catch (error) {
    console.error('Firebase Database Error fetching user by ID:', error);
    throw new Error('Failed to fetch user from Firebase.');
  }
}


// --- Resource Functions ---

export async function fetchResources(tagFilter?: string[]): Promise<Resource[]> {
  noStore();
  try {
    const resourcesRef = ref(database, 'resources');
    const snapshot = await get(resourcesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const resourcesData = snapshot.val();
    let resourcesList: Resource[] = Object.keys(resourcesData).map(key => ({
      id: key,
      ...resourcesData[key]
    }));

    // Sort alphabetically by name
    resourcesList.sort((a, b) => a.name.localeCompare(b.name));

    // Apply tag filter if present
    if (tagFilter && tagFilter.length > 0) {
      resourcesList = resourcesList.filter(resource =>
        tagFilter.every(filterTag => resource.tags?.includes(filterTag))
      );
    }

    return resourcesList;
  } catch (error) {
    console.error('Firebase Database Error fetching resources:', error);
    throw new Error('Failed to fetch resources from Firebase.');
  }
}


export async function fetchResourceById(id: string): Promise<Resource | null> {
  noStore();
  try {
    const resourceRef = ref(database, `resources/${id}`);
    const snapshot = await get(resourceRef);
    if (!snapshot.exists()) {
      return null;
    }
    return { id, ...snapshot.val() } as Resource;
  } catch (error) {
    console.error('Firebase Database Error fetching resource by ID:', error);
    throw new Error('Failed to fetch resource from Firebase.');
  }
}

export async function fetchResourceTags(): Promise<string[]> {
  noStore();
  try {
    const resourcesRef = ref(database, 'resources');
    const snapshot = await get(resourcesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const resourcesData = snapshot.val();
    const allTags = new Set<string>();

    Object.values(resourcesData).forEach((resource: any) => {
      if (resource.tags && Array.isArray(resource.tags)) {
        resource.tags.forEach((tag: string) => {
          if (tag) allTags.add(tag);
        });
      }
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Firebase Database Error fetching tags:', error);
    throw new Error('Failed to fetch resource tags from Firebase.');
  }
}


// --- Reservation Functions ---

export async function fetchReservations(filters: {
  status?: string | string[];
  userId?: string;
}): Promise<Reservation[]> {
  noStore();
  try {
    const reservationsRef = ref(database, 'reservations');
    let dataQuery;

    // If a userId is provided, create a query to filter by it.
    // This is much more efficient as it filters data at the database level.
    if (filters.userId) {
      dataQuery = query(reservationsRef, orderByChild('userId'), equalTo(filters.userId));
    } else {
      // If no userId, fetch all reservations. This should typically be for admins.
      dataQuery = reservationsRef;
    }
    
    const snapshot = await get(dataQuery);

    if (!snapshot.exists()) {
      return [];
    }

    const reservationsData = snapshot.val();
    let reservations: Reservation[] = Object.keys(reservationsData).map(key => ({
      id: key,
      ...reservationsData[key],
    }));

    // Apply status filter after fetching
    if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        if (statuses.length > 0) {
            reservations = reservations.filter(r => statuses.includes(r.status));
        }
    }
    
    // Sort by start date, most recent first
    reservations.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return reservations;
  } catch (error) {
    console.error('Firebase Database Error fetching reservations:', error);
    throw new Error('Failed to fetch reservations from Firebase.');
  }
}

export async function fetchReservationById(id: string): Promise<Reservation | null> {
  noStore();
  try {
    const reservationRef = ref(database, `reservations/${id}`);
    const snapshot = await get(reservationRef);

    if (!snapshot.exists()) {
      return null;
    }
    return { id, ...snapshot.val() } as Reservation;
  } catch (error) {
    console.error('Firebase Database Error fetching reservation by ID:', error);
    throw new Error('Failed to fetch reservation from Firebase.');
  }
}

export async function fetchReservationsByResourceId(resourceId: string): Promise<Reservation[]> {
  noStore();
  try {
    const reservationsQuery = query(ref(database, 'reservations'), orderByChild('resourceId'), equalTo(resourceId));
    const snapshot = await get(reservationsQuery);
    
    if (!snapshot.exists()) {
        return [];
    }

    const reservationsData = snapshot.val();
    const reservations: Reservation[] = Object.keys(reservationsData).map(key => ({
        id: key,
        ...reservationsData[key]
    }));

    return reservations;
  } catch (error) {
      console.error('Firebase Database Error fetching reservations by resource ID:', error);
      throw new Error('Failed to fetch reservations for the resource.');
  }
}

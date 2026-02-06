
export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Usuário" | string;
  avatar: string | null;
  createdAt?: Date; // Optional because mock data might not have it yet, or add "createdAt" to mock if keeping mock. 
  // Actually I am replacing mock data usage.
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  equipment: string[];
  imageUrl: string | null;
  tags: string[];
  availability?: string;
  description?: string; // Keep it optional if some components use it, but DB doesn't have it.
};

export type Reservation = {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: "Confirmada" | "Pendente" | "Cancelada" | string;
  createdAt: Date;
  resourceName?: string;
  userName?: string;
};

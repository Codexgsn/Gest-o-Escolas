
export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Usuário";
  avatar: string;
  password?: string;
};

export type Resource = {
  id: string;
  name: string;
  type: string;
  location: string;
  capacity: number;
  equipment: string[];
  availability: string;
  imageUrl: string;
  tags: string[];
};

export type Reservation = {
  id:string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  status: "Confirmada" | "Pendente" | "Cancelada";
};

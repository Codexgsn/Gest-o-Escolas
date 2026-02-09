'use server';

import { z } from "zod"
import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { fetchUserById } from "@/lib/data";
import { cookies } from 'next/headers';

export async function getResources() {
  try {
    const { rows } = await db.sql`
            SELECT id, name, type, location, capacity, equipment, "imageUrl", tags
            FROM resources
            ORDER BY name ASC
        `;
    return rows as any as import("@/lib/definitions").Resource[];
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    throw new Error('Failed to fetch resources');
  }
}

export async function getResourceTags() {
  try {
    const { rows } = await db.sql`
            SELECT DISTINCT unnest(tags) as tag FROM resources ORDER BY tag ASC
        `;
    return rows.map(r => r.tag);
  } catch (error) {
    console.error('Failed to fetch resource tags:', error);
    throw new Error('Failed to fetch resource tags');
  }
}

const resourceSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  type: z.string().min(3, "O tipo deve ter pelo menos 3 caracteres."),
  location: z.string().min(3, "A localização deve ter pelo menos 3 caracteres."),
  capacity: z.coerce.number().min(1, "A capacidade/quantidade deve ser de pelo menos 1."),
  equipment: z.string().optional(),
  imageUrl: z.string().min(1, "A URL ou código da imagem é obrigatório."),
  tags: z.array(z.string()).default([]),
});

export async function createResourceAction(
  values: unknown,
  currentUserId: string | null = null
) {
  const userId = currentUserId || cookies().get('session')?.value;

  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const user = await fetchUserById(userId);
  if (!user || user.role !== 'Admin') {
    return { success: false, message: "Permissão negada. Apenas administradores podem criar recursos." };
  }

  const validatedFields = resourceSchema.safeParse(values);
  if (!validatedFields.success) {
    // A função flatten refina a apresentação dos erros.
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
      errors: errorMessages
    };
  }

  const { name, type, location, capacity, equipment, imageUrl, tags } = validatedFields.data;
  const equipmentArray = equipment ? equipment.split(',').map(e => e.trim()) : [];

  try {
    const id = crypto.randomUUID();
    await db.sql`
        INSERT INTO resources (id, name, type, location, capacity, equipment, "imageUrl", tags, availability)
        VALUES (${id}, ${name}, ${type}, ${location}, ${capacity}, ${equipmentArray as any}, ${imageUrl}, ${tags as any}, 'Disponível')
      `;
    revalidatePath('/dashboard/resources');
    return { success: true, message: "Recurso criado com sucesso!" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Falha ao criar o recurso no banco de dados." };
  }
}

const updateResourceSchema = resourceSchema.extend({
  id: z.string(),
});

export async function updateResourceAction(
  values: unknown,
  currentUserId: string | null = null
) {
  const userId = currentUserId || cookies().get('session')?.value;

  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const user = await fetchUserById(userId);
  if (!user || user.role !== 'Admin') {
    return { success: false, message: "Permissão negada." };
  }

  const validatedFields = updateResourceSchema.safeParse(values);
  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors;
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
      errors: errorMessages
    };
  }

  const { id, name, type, location, capacity, equipment, imageUrl, tags } = validatedFields.data;
  const equipmentArray = equipment ? equipment.split(',').map(e => e.trim()) : [];

  try {
    await db.sql`
        UPDATE resources
        SET name = ${name}, 
            type = ${type}, 
            location = ${location}, 
            capacity = ${capacity}, 
            equipment = ${equipmentArray as any}, 
            "imageUrl" = ${imageUrl}, 
            tags = ${tags as any}
        WHERE id = ${id}
    `;
    revalidatePath('/dashboard/resources');
    revalidatePath(`/dashboard/resources/edit/${id}`); // Revalida a página de edição também
    return { success: true, message: "Recurso atualizado com sucesso!" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Falha ao atualizar o recurso no banco de dados." };
  }
}


export async function deleteResourceAction(resourceId: string, currentUserId: string | null = null) {
  const userId = currentUserId || cookies().get('session')?.value;

  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  const user = await fetchUserById(userId);
  if (!user || user.role !== 'Admin') {
    return { success: false, message: "Permissão negada." };
  }

  try {
    // Primeiro, exclui as reservas associadas ao recurso
    await db.sql`DELETE FROM reservations WHERE "resourceId" = ${resourceId}`;

    // Depois, exclui o recurso
    await db.sql`DELETE FROM resources WHERE id = ${resourceId}`;

    revalidatePath('/dashboard/resources');
    revalidatePath('/dashboard/reservations'); // Revalida a página de reservas também

    return { success: true, message: "Recurso e suas reservas associadas foram excluídos." };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Falha ao excluir o recurso." };
  }
}

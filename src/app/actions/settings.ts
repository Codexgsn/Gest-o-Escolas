
'use server'

import { z } from "zod"

import { db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
});


const settingsSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  classBlockMinutes: z.coerce.number().min(1, "A duração deve ser maior que 0."),
  operatingDays: z.array(z.number().min(0).max(6)),
  classBlocks: z.array(timeSlotSchema),
  breaks: z.array(timeSlotSchema),
  resourceTags: z.array(z.string()).default([]),
});

export type SchoolSettings = z.infer<typeof settingsSchema>;

export async function getSettings(): Promise<SchoolSettings> {
  try {
    const { rows } = await db.sql`SELECT * FROM settings LIMIT 1`;
    if (rows.length === 0) {
      throw new Error("No settings found");
    }

    const settings = rows[0];
    return {
      startTime: settings.startTime,
      endTime: settings.endTime,
      classBlockMinutes: settings.classBlockMinutes,
      operatingDays: settings.operatingDays,
      classBlocks: typeof settings.classBlocks === 'string' ? JSON.parse(settings.classBlocks) : settings.classBlocks,
      breaks: typeof settings.breaks === 'string' ? JSON.parse(settings.breaks) : settings.breaks,
      resourceTags: settings.resourceTags || [],
    };
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw new Error('Failed to fetch settings');
  }
}

export async function updateSettingsAction(values: SchoolSettings) {
  const validatedFields = settingsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Dados de configuração inválidos.' };
  }

  const { startTime, endTime, classBlockMinutes, operatingDays, classBlocks, breaks, resourceTags } = validatedFields.data;

  try {
    await db.sql`
        UPDATE settings
        SET "startTime" = ${startTime},
            "endTime" = ${endTime},
            "classBlockMinutes" = ${classBlockMinutes},
            "operatingDays" = ${operatingDays as any},
            "classBlocks" = ${JSON.stringify(classBlocks)},
            "breaks" = ${JSON.stringify(breaks)},
            "resourceTags" = ${resourceTags as any}
        WHERE id = (SELECT id FROM settings LIMIT 1)
    `;
    revalidatePath('/dashboard/settings');
    return { success: true, message: "Configurações salvas com sucesso!" };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Falha ao atualizar as configurações no banco de dados." };
  }
}

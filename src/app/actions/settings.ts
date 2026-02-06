
'use server'

import { z } from "zod"

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

const defaultSettings: SchoolSettings = {
  startTime: "07:30",
  endTime: "17:10",
  classBlockMinutes: 50,
  operatingDays: [1, 2, 3, 4, 5],
  classBlocks: [
    { startTime: "07:30", endTime: "08:20" },
    { startTime: "08:20", endTime: "09:10" },
    { startTime: "09:30", endTime: "10:20" },
    { startTime: "10:20", endTime: "11:10" },
    { startTime: "11:10", endTime: "12:00" },
    { startTime: "13:20", endTime: "14:10" },
    { startTime: "14:10", endTime: "15:00" },
    { startTime: "15:20", endTime: "16:10" },
    { startTime: "16:10", endTime: "17:00" },
  ],
  breaks: [
    { startTime: "09:10", endTime: "09:30" },
    { startTime: "12:00", endTime: "13:20" },
    { startTime: "15:00", endTime: "15:20" },
  ],
  resourceTags: ["Sala de Aula", "Laboratório", "Audiovisual", "Reunião", "Estudo"],
};


export async function getSettings(): Promise<SchoolSettings> {
  console.log("Fetching settings...");
  // Placeholder implementation - returns default settings
  return Promise.resolve(defaultSettings);
}

export async function updateSettingsAction(values: SchoolSettings) {
  console.log("Updating settings...", values);
  const validatedFields = settingsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Dados de configuração inválidos.' };
  }

  // Placeholder implementation
  return Promise.resolve({ success: true, message: "Configurações salvas com sucesso!" });
}

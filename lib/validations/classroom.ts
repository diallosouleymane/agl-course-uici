import { z } from 'zod';

export const classroomSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  capacity: z
    .number()
    .int('La capacité doit être un nombre entier')
    .min(1, 'La capacité doit être au moins 1')
    .max(500, 'La capacité ne peut pas dépasser 500'),
  location: z
    .string()
    .max(200, 'L\'emplacement ne peut pas dépasser 200 caractères')
    .optional(),
});

export const classroomUpdateSchema = classroomSchema.partial();

export type ClassroomInput = z.infer<typeof classroomSchema>;
export type ClassroomUpdateInput = z.infer<typeof classroomUpdateSchema>;

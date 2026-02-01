import { z } from 'zod';

export const subjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(20, 'Le code ne peut pas dépasser 20 caractères')
    .regex(/^[A-Z0-9-]+$/, 'Le code doit contenir uniquement des majuscules, chiffres et tirets'),
  classroomId: z.string().min(1, 'La salle est requise'),
  departmentId: z.string().min(1, 'Le département est requis'),
});

export const subjectUpdateSchema = subjectSchema.partial();

export type SubjectInput = z.infer<typeof subjectSchema>;
export type SubjectUpdateInput = z.infer<typeof subjectUpdateSchema>;

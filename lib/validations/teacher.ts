import { z } from 'zod';

export const teacherSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  prenom: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  tel: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Numéro de téléphone invalide'),
  mail: z
    .string()
    .email('Email invalide'),
  dateFunction: z
    .date()
    .max(new Date(), 'La date de fonction ne peut pas être dans le futur'),
  indice: z
    .string()
    .min(1, 'L\'indice est requis')
    .max(20, 'L\'indice ne peut pas dépasser 20 caractères'),
  departmentId: z.string().min(1, 'Le département est requis'),
  subjectId: z.string().min(1, 'La matière est requise'),
  userId: z.string().optional(),
});

export const teacherUpdateSchema = teacherSchema.partial();

export type TeacherInput = z.infer<typeof teacherSchema>;
export type TeacherUpdateInput = z.infer<typeof teacherUpdateSchema>;

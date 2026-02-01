import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const studentSchema = z.object({
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
  anneeEntree: z
    .number()
    .int('L\'année doit être un nombre entier')
    .min(2000, 'L\'année d\'entrée ne peut pas être avant 2000')
    .max(currentYear, `L'année d'entrée ne peut pas dépasser ${currentYear}`),
  userId: z.string().optional(),
});

export const studentUpdateSchema = studentSchema.partial();

export const enrollmentSchema = z.object({
  studentId: z.string().min(1, 'L\'étudiant est requis'),
  subjectId: z.string().min(1, 'La matière est requise'),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

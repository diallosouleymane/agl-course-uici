import { z } from 'zod';

export const collegeSchema = z.object({
  name: z
    .string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  websiteUrl: z
    .string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
});

export const collegeUpdateSchema = collegeSchema.partial();

export type CollegeInput = z.infer<typeof collegeSchema>;
export type CollegeUpdateInput = z.infer<typeof collegeUpdateSchema>;

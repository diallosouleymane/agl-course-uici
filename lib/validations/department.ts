import { z } from 'zod';

export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  collegeId: z.string().min(1, 'Le collège est requis'),
  headTeacherId: z.string().optional(),
});

export const departmentUpdateSchema = departmentSchema.partial();

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;

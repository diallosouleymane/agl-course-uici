import { z } from 'zod';

const gradeBaseSchema = z.object({
  studentId: z.string().min(1, 'L\'étudiant est requis'),
  subjectId: z.string().min(1, 'La matière est requise'),
  value: z.number().nonnegative('La note ne peut pas être négative'),
  maxValue: z.number().positive('La note maximale doit être positive'),
  date: z.date().optional(),
});

export const gradeSchema = gradeBaseSchema.refine(
  (data) => data.value <= data.maxValue,
  {
    message: 'La note ne peut pas dépasser la note maximale',
    path: ['value'],
  }
);

export const gradeUpdateSchema = gradeBaseSchema.partial();

export type GradeInput = z.infer<typeof gradeSchema>;
export type GradeUpdateInput = z.infer<typeof gradeUpdateSchema>;

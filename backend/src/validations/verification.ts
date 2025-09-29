import { z } from 'zod';

export const uploadIdCardSchema = z.object({
  body: z.object({
    idCardUrl: z.string().url('Invalid URL format'),
  }),
});

export const verifyStudentSchema = z.object({
  params: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
  }),
});

export const rejectStudentSchema = z.object({
  params: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});

export type UploadIdCardInput = z.infer<typeof uploadIdCardSchema>;
export type VerifyStudentInput = z.infer<typeof verifyStudentSchema>;
export type RejectStudentInput = z.infer<typeof rejectStudentSchema>;

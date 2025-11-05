import { z } from 'zod';

export const createContractSchema = z.object({
  hireRequestId: z.string().min(1, 'Hire request ID is required'),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  timeline: z.number().int().min(1, 'Timeline must be at least 1 day'),
  additionalTerms: z.string().optional(),
});

export const signContractSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
});

export const updateProgressSchema = z.object({
  progressStatus: z.string().min(1, 'Progress status is required'),
  progressNotes: z.string().optional(),
  markAsCompleted: z.boolean().optional(), // Allow marking as complete while updating progress
  completionNotes: z.string().optional(), // Completion notes if marking as complete
});

export const markCompletedSchema = z.object({
  completionNotes: z.string().optional(),
});

export const getContractSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
});


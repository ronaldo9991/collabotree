import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(2000, 'Message is too long'),
});

export const getMessagesSchema = z.object({
  hireId: z.string().cuid('Invalid hire ID'),
  cursor: z.string().optional(),
  limit: z.string().transform(Number).optional(),
});

export const markMessagesReadSchema = z.object({
  hireId: z.string().cuid('Invalid hire ID'),
});

export const joinChatSchema = z.object({
  hireId: z.string().cuid('Invalid hire ID'),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;
export type GetMessagesData = z.infer<typeof getMessagesSchema>;
export type MarkMessagesReadData = z.infer<typeof markMessagesReadSchema>;
export type JoinChatData = z.infer<typeof joinChatSchema>;

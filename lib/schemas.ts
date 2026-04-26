import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['CLIENT', 'CONTRACTOR'])
});

export const requestSchema = z.object({
  title: z.string().min(5),
  categoryId: z.string().min(1),
  description: z.string().min(20),
  city: z.string().min(2),
  zipCode: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  budget: z.coerce.number().optional(),
  preferredDate: z.string().optional(),
  phonePrivate: z.string().min(7),
  emailPrivate: z.string().email()
});

export const bidSchema = z.object({
  requestId: z.string().min(1),
  amount: z.coerce.number().positive(),
  estimatedTimeline: z.string().min(2),
  message: z.string().min(10)
});

export const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(2)
});

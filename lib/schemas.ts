import { z } from 'zod';

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores');

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: usernameSchema,
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CLIENT', 'CONTRACTOR'])
});

export const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'Please select a state').optional(),
  zipCode: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
  budget: z.coerce.number().positive().optional(),
  preferredDate: z.string().optional(),
  phonePrivate: z.string().min(7, 'Please enter a valid phone number'),
  emailPrivate: z.string().email('Please enter a valid email')
});

export const bidSchema = z.object({
  requestId: z.string().min(1),
  amount: z.coerce.number().positive('Amount must be positive'),
  estimatedTimeline: z.string().min(2, 'Please describe the timeline'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const contractorProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  serviceArea: z.string().min(2, 'Service area required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
});

export const adminSettingsSchema = z.object({
  freePostLimit: z.coerce.number().int().min(0).max(100),
  requireContractorSubscription: z.boolean(),
  requireBidCredits: z.boolean()
});

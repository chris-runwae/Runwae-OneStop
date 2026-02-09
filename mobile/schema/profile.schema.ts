import { z } from 'zod';

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Username is required')
    .min(2, 'Username must be at least 2 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers and - or _'
    ),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Allow empty/undefined
      // Validate format if provided
      return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
        val
      );
    }, 'Please enter a valid phone number'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

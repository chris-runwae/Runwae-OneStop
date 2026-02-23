import { z } from 'zod';

export const tripPersonalizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Trip name is required')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Trip name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  headerImage: z.string().url('Invalid image URL').optional(),
});

export type TripPersonalizationData = z.infer<typeof tripPersonalizationSchema>;

export const validateTripPersonalization = (
  data: Partial<TripPersonalizationData>
) => {
  return tripPersonalizationSchema.safeParse(data);
};

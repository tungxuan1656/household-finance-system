import { z } from 'zod'

export const updateProfileRequestSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Display name must not be blank.')
      .nullable()
      .optional(),
    avatarUrl: z.url().nullable().optional(),
  })
  .strict()
  .refine(
    (value) => value.displayName !== undefined || value.avatarUrl !== undefined,
    {
      message: 'At least one profile field must be provided.',
    },
  )

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export interface ProfileResponse {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
}

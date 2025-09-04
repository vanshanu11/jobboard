import { z } from "zod";

export const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const jobCreateSchema = z.object({
  title: z.string().min(3).max(120),
  company: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(["FULL_TIME","PART_TIME","REMOTE","CONTRACT","HYBRID"]),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  description: z.string().min(10)
});

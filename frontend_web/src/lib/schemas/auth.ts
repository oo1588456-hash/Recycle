import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(2),
    phone_number: z.string().optional(),
    password: z.string().min(8),
    confirm: z.string().min(8),
    role: z.enum(["buyer", "seller"]),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

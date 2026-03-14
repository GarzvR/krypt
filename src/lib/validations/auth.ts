import { z } from "zod";

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .regex(/\.[a-z]{2,}$/i, "Email must have a valid domain extension (e.g. .com).")
    .toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

import z from "zod";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(20, "Username cannot be longer than 20 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(20, "Password cannot be more than 20 characters.")
    .superRefine((val, ctx) => {
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one lowercase letter",
        });
      }

      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one uppercase letter",
        });
      }

      if (!/[0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one number",
        });
      }

      if (!/[^a-zA-Z0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one special character",
        });
      }
    }),
  email: z.string().email(),
});

export const signinSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string(),
  })
  .superRefine((val, ctx) => {
    if (!val.email && !val.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either username or email is required.",
        path: ["email"],
      });
    }
  });

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room must be 3 characters long")
    .max(20, "Room cannot be more than 20 characters long"),
});

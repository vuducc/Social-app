import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z
    .string()
    // .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(50, "Mật khẩu không được quá 50 ký tự"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Email không hợp lệ"),
    username: z
      .string()
      .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
      .max(20, "Tên người dùng không được quá 20 ký tự")
      .regex(
        /^[a-zA-Z0-9._]+$/,
        "Tên người dùng chỉ được chứa chữ cái, số và ký tự . _"
      ),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useLogin, useRegister } from "../hooks/useAuth";
import { Icon } from "./ui/Icon";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const registerSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên"),
    company_name: z.string().min(1, "Vui lòng nhập tên công ty"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const inputClass =
  "form-input block w-full h-[44px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm placeholder:text-on-surface-variant focus:border-primary focus:outline-none";

export function AuthPage({ initialTab }: { initialTab: "login" | "register" }) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const login = useLogin();
  const registerUser = useRegister();
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
      router.push("/hr");
    } catch {
      /* handled below */
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    const { confirm_password: _c, ...payload } = data;
    try {
      await registerUser.mutateAsync(payload);
      setTab("login");
      registerForm.reset();
    } catch {
      /* handled below */
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface-tint lg:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-tint via-surface-tint/80 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col justify-between p-8 pt-16">
          <div className="inline-flex items-center gap-2 text-on-primary">
            <Icon name="public" className="text-[32px]" />
            <span className="font-display text-headline-md font-bold tracking-tight">Remote IT</span>
          </div>
          <div className="mb-24">
            <h1 className="mb-6 font-display text-display leading-tight text-on-primary">
              Kết nối tài năng công nghệ toàn cầu.
            </h1>
            <p className="max-w-md text-body-lg text-on-primary/80">
              Nền tảng tuyển dụng chuyên biệt dành cho các kỹ sư phần mềm, DevOps và chuyên gia IT
              mong muốn làm việc từ xa.
            </p>
            <div className="mt-12 flex gap-4">
              <div className="flex items-center gap-2 rounded-full border border-on-primary/20 bg-on-primary/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="check_circle" className="text-[20px] text-on-primary" />
                <span className="text-label-md text-on-primary">Đăng tin nhanh chóng</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-on-primary/20 bg-on-primary/10 px-4 py-2 backdrop-blur-sm">
                <Icon name="group" className="text-[20px] text-on-primary" />
                <span className="text-label-md text-on-primary">Tiếp cận 50,000+ ứng viên</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-surface p-6 lg:w-1/2">
        <div className="w-full max-w-[480px]">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            <div className="relative mb-8 flex rounded-lg bg-surface-container p-1">
              <div
                className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-md bg-surface-container-lowest shadow-sm transition-transform duration-300 ease-out"
                style={{ transform: tab === "login" ? "translateX(0)" : "translateX(calc(100% + 4px))" }}
              />
              <button
                onClick={() => setTab("login")}
                className={`relative z-10 flex-1 rounded-md py-2 text-center text-label-md transition-colors ${
                  tab === "login" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setTab("register")}
                className={`relative z-10 flex-1 rounded-md py-2 text-center text-label-md transition-colors ${
                  tab === "register" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {tab === "login" ? (
              <div>
                <h2 className="mb-2 font-display text-headline-md text-on-surface">Đăng nhập HR</h2>
                <p className="mb-6 text-body-sm text-on-surface-variant">
                  Đăng nhập để đăng tin tuyển dụng remote
                </p>

                <a
                  href="/api/auth/google/login"
                  className="mb-6 flex h-[44px] w-full items-center justify-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface transition-colors hover:bg-surface-container"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Tiếp tục với Google
                </a>

                <div className="relative mb-6 flex items-center py-2">
                  <div className="flex-grow border-t border-outline-variant" />
                  <span className="mx-4 shrink-0 text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Hoặc bằng Email
                  </span>
                  <div className="flex-grow border-t border-outline-variant" />
                </div>

                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Email công việc</label>
                    <input type="email" {...loginForm.register("email")} className={inputClass} placeholder="name@company.com" />
                    {loginForm.formState.errors.email && (
                      <p className="mt-1 text-body-sm text-error">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Mật khẩu</label>
                    <input type="password" {...loginForm.register("password")} className={inputClass} placeholder="••••••••" />
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-body-sm text-error">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  {login.isError && (
                    <p className="text-body-sm text-error">Email hoặc mật khẩu không đúng</p>
                  )}
                  <button
                    type="submit"
                    disabled={login.isPending}
                    className="mt-2 h-[44px] w-full rounded-lg bg-primary text-label-md text-on-primary transition-colors hover:bg-primary-fixed-dim hover:text-on-primary-fixed disabled:opacity-50"
                  >
                    {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                  </button>
                </form>

                <p className="mt-8 text-center text-body-sm text-on-surface-variant">
                  Chưa có tài khoản?{" "}
                  <a className="text-label-sm text-primary hover:underline" onClick={() => setTab("register")}>
                    Đăng ký ngay
                  </a>
                </p>
              </div>
            ) : (
              <div>
                <h2 className="mb-2 font-display text-headline-md text-on-surface">Tạo tài khoản</h2>
                <p className="mb-6 text-body-sm text-on-surface-variant">
                  Trở thành đối tác tuyển dụng của Remote IT
                </p>

                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Tên</label>
                    <input {...registerForm.register("name")} className={inputClass} placeholder="Tên của bạn" />
                    {registerForm.formState.errors.name && (
                      <p className="mt-1 text-body-sm text-error">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Tên công ty</label>
                    <input {...registerForm.register("company_name")} className={inputClass} placeholder="VD: Tech Corp" />
                    {registerForm.formState.errors.company_name && (
                      <p className="mt-1 text-body-sm text-error">{registerForm.formState.errors.company_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Email công việc</label>
                    <input type="email" {...registerForm.register("email")} className={inputClass} placeholder="name@company.com" />
                    {registerForm.formState.errors.email && (
                      <p className="mt-1 text-body-sm text-error">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Mật khẩu</label>
                    <input type="password" {...registerForm.register("password")} className={inputClass} placeholder="Tối thiểu 8 ký tự" />
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 text-body-sm text-error">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-label-sm text-on-surface">Nhập lại mật khẩu</label>
                    <input type="password" {...registerForm.register("confirm_password")} className={inputClass} placeholder="Nhập lại mật khẩu" />
                    {registerForm.formState.errors.confirm_password && (
                      <p className="mt-1 text-body-sm text-error">{registerForm.formState.errors.confirm_password.message}</p>
                    )}
                  </div>
                  {registerUser.isError && (
                    <p className="text-body-sm text-error">Đăng ký thất bại. Email có thể đã tồn tại.</p>
                  )}
                  <div className="pt-2">
                    <p className="mb-4 text-[12px] text-on-surface-variant">
                      Bằng việc đăng ký, bạn đồng ý với{" "}
                      <a className="text-primary hover:underline">Điều khoản dịch vụ</a> và{" "}
                      <a className="text-primary hover:underline">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                    <button
                      type="submit"
                      disabled={registerUser.isPending}
                      className="h-[44px] w-full rounded-lg bg-primary text-label-md text-on-primary transition-colors hover:bg-primary-fixed-dim hover:text-on-primary-fixed disabled:opacity-50"
                    >
                      {registerUser.isPending ? "Đang tạo..." : "Tạo tài khoản"}
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-body-sm text-on-surface-variant">
                  Có tài khoản rồi?{" "}
                  <a className="text-label-sm text-primary hover:underline" onClick={() => setTab("login")}>
                    Đăng nhập
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

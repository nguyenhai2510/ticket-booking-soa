import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import axiosClient from "@/api/axiosClient";

const loginSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/api/users/login", data) as {
        id?: string;
        token?: string;
      };

      if (response.id) {
        localStorage.setItem("userId", response.id);
      }
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      toast.success("Đăng nhập thành công!");
      navigate(redirectTo);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-base text-body-base text-on-background relative">
      {/* Abstract Background Element */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary-container rounded-full blur-[120px] opacity-30"></div>
      </div>

      <main className="flex-grow flex items-center justify-center p-gutter relative z-10 my-auto">
        <div className="w-full max-w-[440px] relative z-10">
          {/* Brand Identity */}
          <div className="text-center mb-stack-gap">
            <h1 
              onClick={() => navigate('/')}
              className="font-h1 text-h1 text-primary cursor-pointer flex items-center justify-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              EventPass
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant mt-2">Chào mừng quay trở lại. Hãy đăng nhập tài khoản của bạn.</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-card-padding">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-gap">
              {/* Tên đăng nhập / Email Input */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="username">Tên đăng nhập</label>
                <input 
                  className={`w-full h-12 px-4 rounded-xl border bg-surface-container-lowest text-on-surface font-body-base text-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                    errors.username ? "border-error" : "border-outline-variant"
                  }`} 
                  id="username" 
                  placeholder="Nhập tên đăng nhập" 
                  type="text"
                  disabled={isLoading}
                  {...register("username")}
                />
                {errors.username && (
                  <span className="text-error text-body-sm font-medium">{errors.username.message}</span>
                )}
              </div>

              {/* Mật khẩu Input */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="password">Mật khẩu</label>
                <div className="relative">
                  <input 
                    className={`w-full h-12 px-4 pr-12 rounded-xl border bg-surface-container-lowest text-on-surface font-body-base text-body-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors ${
                      errors.password ? "border-error" : "border-outline-variant"
                    }`} 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <span className="text-error text-body-sm font-medium">{errors.password.message}</span>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-lowest" 
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Nhớ tài khoản</span>
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">Quên mật khẩu?</a>
              </div>

              {/* Primary Action */}
              <button 
                className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-xl transition-colors shadow-sm mt-2 flex items-center justify-center font-bold" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-stack-gap">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-body-sm text-body-sm">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Login */}
            <button 
              className="w-full h-12 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm" 
              type="button"
            >
              <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB60IIxqf-ZlliNZd3WGLFkSR3NzhprEizc8lFRNCgwtTjcpxOwwl0EEHAmno28xChRPzFJk-xPU7QYwNinqjNN-eeqpZpiM6HBGqes8sAImK_bIFZPv5b8JhMgx5GMR9OtgMJyDAtCy0YRA2FyF70JWxFVZ-fwtNcvcLjnBurIFs5rg7REkDBKfh7tEMQz5gZMrtoDj-P1xf5QKlu2HYP9eRhw5-UMLr8R3YjKDX8ZarznEc52BxIfADUxYG4SjAZhhWuU-gmeqA" />
              Đăng nhập bằng Google
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-stack-gap">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Chưa có tài khoản? 
                <a 
                  onClick={() => navigate("/register")}
                  className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors ml-1 cursor-pointer"
                >
                  Đăng ký tài khoản mới
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 px-gutter flex justify-center items-center mt-auto border-t border-outline-variant bg-surface-container-highest">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          © 2026 EventPass Ticketing Inc. Bảo lưu mọi quyền.
        </p>
      </footer>
    </div>
  );
}

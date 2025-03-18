
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authenticate } from "@/services/userService";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().min(1, { message: "Введите логин" }),
  password: z.string().min(1, { message: "Введите пароль" }),
  rememberMe: z.boolean().optional().default(false)
});

interface LoginFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ onSuccess, onForgotPassword }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      const result = await authenticate(data.email, data.password);
      
      if (result.success) {
        // Store user info in localStorage or sessionStorage based on rememberMe
        if (data.rememberMe) {
          localStorage.setItem('user', JSON.stringify(result.user));
        } else {
          // Use sessionStorage if not remember me - will be cleared when browser is closed
          sessionStorage.setItem('user', JSON.stringify(result.user));
          // Clear any existing localStorage value to avoid conflicts
          localStorage.removeItem('user');
        }
        
        toast({
          title: "Успешный вход",
          description: "Вы успешно вошли в систему",
        });
        
        onSuccess();
        
        // Redirect to admin panel if role is admin, otherwise to dashboard
        if (result.user?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "Ошибка",
          description: result.errorMessage || "Не удалось войти. Проверьте данные и попробуйте снова.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе в систему",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Логин</Label>
        <Input
          id="email"
          type="text"
          placeholder="Введите логин (zerofy)"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Пароль</Label>
          <Button 
            variant="link" 
            size="sm" 
            className="px-0 h-auto"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
          >
            Забыли пароль?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Введите пароль (Zerofy2025)"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="rememberMe" 
          checked={rememberMe}
          onCheckedChange={(checked) => {
            setValue("rememberMe", checked === true);
          }}
        />
        <Label 
          htmlFor="rememberMe" 
          className="text-sm cursor-pointer"
        >
          Запомнить меня
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
};

export default LoginForm;

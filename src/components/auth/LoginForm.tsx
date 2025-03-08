
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

const loginSchema = z.object({
  email: z.string().min(1, { message: "Введите логин" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      const result = await authenticate(data.email, data.password);
      
      if (result.success) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        
        toast({
          title: "Успешный вход",
          description: "Вы успешно вошли в систему",
        });
        
        onSuccess();
        
        // Redirect to admin panel if role is admin
        if (result.user?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
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
          placeholder="Введите логин (admin)"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Пароль</Label>
          <Button variant="link" size="sm" className="px-0 h-auto">
            Забыли пароль?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Введите пароль (admin)"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
};

export default LoginForm;

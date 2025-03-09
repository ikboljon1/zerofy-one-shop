
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/services/userService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

const resetRequestSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
});

interface PasswordResetRequestFormProps {
  onBack: () => void;
  onResetSent: (email: string) => void;
}

const PasswordResetRequestForm = ({
  onBack,
  onResetSent,
}: PasswordResetRequestFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<z.infer<typeof resetRequestSchema>>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resetRequestSchema>) => {
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(data.email);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "Запрос отправлен",
          description: result.message,
        });
        onResetSent(data.email);
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обработке запроса",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-0 h-auto mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium">Восстановление пароля</h2>
      </div>

      {success ? (
        <Alert>
          <AlertDescription>
            Если указанный email зарегистрирован в системе, инструкции по восстановлению
            пароля будут отправлены на него.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Введите email, указанный при регистрации, и мы отправим вам инструкции
            по восстановлению пароля.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Введите ваш email"
                className="pl-9"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              "Отправить инструкции"
            )}
          </Button>
        </>
      )}
    </form>
  );
};

export default PasswordResetRequestForm;

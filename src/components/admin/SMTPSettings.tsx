
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { SMTPSettings as SMTPSettingsType, getSMTPSettings, saveSMTPSettings, sendEmail } from "@/services/userService";

const smtpSchema = z.object({
  host: z.string().min(1, { message: "Хост SMTP-сервера обязателен" }),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean().default(true),
  auth: z.object({
    user: z.string().min(1, { message: "Имя пользователя обязательно" }),
    pass: z.string().min(1, { message: "Пароль обязателен" }),
  }),
  from: z.string().email({ message: "Укажите корректный email отправителя" }),
});

const SMTPSettings = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof smtpSchema>>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: "",
      port: 587,
      secure: true,
      auth: {
        user: "",
        pass: "",
      },
      from: "",
    },
  });

  const secure = watch("secure");

  useEffect(() => {
    const settings = getSMTPSettings();
    if (settings) {
      setValue("host", settings.host);
      setValue("port", settings.port);
      setValue("secure", settings.secure);
      setValue("auth.user", settings.auth.user);
      setValue("auth.pass", settings.auth.pass);
      setValue("from", settings.from);
    }
  }, [setValue]);

  const onSubmit = async (data: z.infer<typeof smtpSchema>) => {
    try {
      saveSMTPSettings(data as SMTPSettingsType);
      toast({
        title: "Настройки сохранены",
        description: "Настройки SMTP успешно сохранены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Ошибка",
        description: "Укажите email для отправки тестового письма",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const result = await sendEmail(
        testEmail,
        "Тестовое письмо от Zerofy",
        "Это тестовое письмо для проверки настроек SMTP. Если вы видите это сообщение, значит настройки работают корректно."
      );
      
      if (result.success) {
        toast({
          title: "Тестовое письмо отправлено",
          description: "Проверьте указанную почту",
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось отправить тестовое письмо",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке тестового письма",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки SMTP</CardTitle>
        <CardDescription>
          Настройте параметры SMTP-сервера для отправки писем пользователям
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">SMTP-сервер</Label>
              <Input id="host" {...register("host")} placeholder="smtp.example.com" />
              {errors.host && (
                <p className="text-sm text-destructive">{errors.host.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="port">Порт</Label>
              <Input id="port" type="number" {...register("port")} placeholder="587" />
              {errors.port && (
                <p className="text-sm text-destructive">{errors.port.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="secure"
              checked={secure}
              onCheckedChange={(checked) => setValue("secure", checked)}
            />
            <Label htmlFor="secure">Использовать SSL/TLS</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auth.user">Имя пользователя</Label>
              <Input id="auth.user" {...register("auth.user")} placeholder="user@example.com" />
              {errors.auth?.user && (
                <p className="text-sm text-destructive">{errors.auth.user.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auth.pass">Пароль</Label>
              <Input id="auth.pass" type="password" {...register("auth.pass")} placeholder="••••••••" />
              {errors.auth?.pass && (
                <p className="text-sm text-destructive">{errors.auth.pass.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from">Email отправителя</Label>
            <Input id="from" {...register("from")} placeholder="noreply@example.com" />
            {errors.from && (
              <p className="text-sm text-destructive">{errors.from.message}</p>
            )}
          </div>
          
          <Button type="submit">Сохранить настройки</Button>
        </form>
        
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">Тестирование настроек</h3>
          <div className="flex space-x-2">
            <Input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Введите email для теста"
              type="email"
            />
            <Button 
              variant="outline" 
              onClick={handleTestEmail}
              disabled={isTesting}
            >
              {isTesting ? "Отправка..." : "Тестировать"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SMTPSettings;

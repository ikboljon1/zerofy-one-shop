
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Check, MessageSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const smsProvidersOptions = [
  { value: "vonage", label: "Vonage (Nexmo)" },
  { value: "twilio", label: "Twilio" },
  { value: "smsc", label: "SMSC" },
  { value: "custom", label: "Другой провайдер" },
];

// Расширенная схема с учетом разных провайдеров
const smsSettingsSchema = z.object({
  smsProvider: z.string().min(1, "Необходимо указать провайдера SMS"),
  apiKey: z.string().min(1, "Необходимо указать API ключ"),
  apiSecret: z.string().optional(),
  senderName: z.string().min(1, "Необходимо указать имя отправителя"),
  webhookUrl: z.string().optional(),
  testPhone: z.string().optional(),
  smsTemplate: z.string().optional(),
});

type SMSSettingsFormValues = z.infer<typeof smsSettingsSchema>;

const SMSIntegrationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<SMSSettingsFormValues>({
    resolver: zodResolver(smsSettingsSchema),
    defaultValues: {
      smsProvider: "",
      apiKey: "",
      apiSecret: "",
      senderName: "",
      webhookUrl: "",
      testPhone: "",
      smsTemplate: "Ваш код подтверждения: {{code}}",
    },
  });
  
  // Отслеживаем текущий провайдер для отображения соответствующих полей
  const selectedProvider = form.watch("smsProvider");
  
  useEffect(() => {
    fetchSMSSettings();
  }, []);
  
  const fetchSMSSettings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/settings/sms");
      form.reset(response.data);
    } catch (error) {
      console.error("Ошибка при получении SMS настроек:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить настройки SMS интеграции",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveSMSSettings = async (data: SMSSettingsFormValues) => {
    setIsSaving(true);
    try {
      await axios.put("http://localhost:3001/api/settings/sms", data);
      
      toast({
        title: "Успех",
        description: "Настройки SMS интеграции успешно сохранены",
      });
    } catch (error) {
      console.error("Ошибка при сохранении SMS настроек:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки SMS интеграции",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const testSMSIntegration = async () => {
    if (!form.getValues().testPhone) {
      toast({
        title: "Ошибка",
        description: "Укажите номер телефона для тестирования",
        variant: "destructive",
      });
      return;
    }
    
    setIsTesting(true);
    try {
      await axios.post("http://localhost:3001/api/settings/sms/test", {
        ...form.getValues(),
      });
      
      toast({
        title: "Успех",
        description: "Тестовое SMS-сообщение отправлено",
      });
    } catch (error) {
      console.error("Ошибка при тестировании SMS интеграции:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить тестовое SMS-сообщение",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Рендеринг дополнительных полей в зависимости от провайдера
  const renderProviderSpecificFields = () => {
    switch (selectedProvider) {
      case "vonage":
        return (
          <>
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Секретный ключ Vonage (требуется для аутентификации)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smsTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Шаблон SMS</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ваш код подтверждения: {{code}}" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Шаблон SMS-сообщения для верификации. Используйте {{code}} для подстановки кода.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "twilio":
        return (
          <>
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Twilio Auth Token
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smsTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Шаблон SMS</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ваш код подтверждения: {{code}}" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Шаблон SMS-сообщения для верификации
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
          <CardTitle>Настройки SMS интеграции</CardTitle>
        </div>
        <CardDescription>
          Настройте параметры интеграции с SMS-сервисом для верификации пользователей по телефону
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(saveSMSSettings)} className="space-y-4">
              <FormField
                control={form.control}
                name="smsProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS провайдер</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите SMS провайдера" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {smsProvidersOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Выберите сервис для отправки SMS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API ключ</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      {selectedProvider === "vonage" 
                        ? "API Key вашего аккаунта Vonage" 
                        : selectedProvider === "twilio" 
                        ? "Account SID вашего аккаунта Twilio" 
                        : "API ключ вашего SMS-провайдера"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Дополнительные поля в зависимости от провайдера */}
              {renderProviderSpecificFields()}
              
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя отправителя</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: MyApp" {...field} />
                    </FormControl>
                    <FormDescription>
                      Имя, которое будет отображаться в качестве отправителя SMS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL для вебхуков (необязательно)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://вашсайт.com/api/sms-webhook" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL для получения статусов доставки SMS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 pb-2">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Тестирование интеграции</AlertTitle>
                  <AlertDescription>
                    Проверьте интеграцию, отправив тестовое SMS-сообщение
                  </AlertDescription>
                </Alert>
              </div>
              
              <FormField
                control={form.control}
                name="testPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер для тестирования</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="+7XXXXXXXXXX" {...field} />
                      </FormControl>
                      <Button 
                        type="button" 
                        onClick={testSMSIntegration}
                        disabled={isTesting}
                      >
                        {isTesting ? "Отправка..." : "Отправить тест"}
                      </Button>
                    </div>
                    <FormDescription>
                      Номер телефона для отправки тестового SMS
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="px-0 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <span className="mr-2">Сохранение...</span>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Сохранить
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSIntegrationSettings;

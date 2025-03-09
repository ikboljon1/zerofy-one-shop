
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  getSmtpSettings, 
  saveSmtpSettings, 
  testSmtpConnection, 
  SmtpSettings as SmtpSettingsType,
  getPopSettings,
  savePopSettings,
  testPopConnection,
  PopSettings as PopSettingsType
} from "@/services/userService";
import { 
  Mail, 
  Key, 
  Server, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff,
  Download
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const smtpSchema = z.object({
  host: z.string().min(1, { message: "SMTP хост обязателен" }),
  port: z.coerce.number().int().positive({ message: "Порт должен быть положительным числом" }),
  secure: z.boolean().default(true),
  username: z.string().min(1, { message: "Имя пользователя обязательно" }),
  password: z.string().min(1, { message: "Пароль обязателен" }),
  fromEmail: z.string().email({ message: "Введите корректный email" }),
  fromName: z.string().min(1, { message: "Имя отправителя обязательно" }),
});

const popSchema = z.object({
  host: z.string().min(1, { message: "POP3 хост обязателен" }),
  port: z.coerce.number().int().positive({ message: "Порт должен быть положительным числом" }),
  secure: z.boolean().default(true),
  username: z.string().min(1, { message: "Имя пользователя обязательно" }),
  password: z.string().min(1, { message: "Пароль обязателен" }),
  leaveOnServer: z.boolean().default(true),
  autoCheckInterval: z.coerce.number().int().min(0, { message: "Интервал должен быть положительным числом" }).default(10),
});

type SmtpFormValues = z.infer<typeof smtpSchema>;
type PopFormValues = z.infer<typeof popSchema>;

const SMTPSettings = () => {
  const [activeProtocol, setActiveProtocol] = useState("smtp");
  const [isSmtpLoading, setIsSmtpLoading] = useState(false);
  const [isSmtpTesting, setIsSmtpTesting] = useState(false);
  const [isSmtpTestSuccess, setIsSmtpTestSuccess] = useState<boolean | null>(null);
  const [smtpTestErrorMessage, setSmtpTestErrorMessage] = useState<string | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  
  const [isPopLoading, setIsPopLoading] = useState(false);
  const [isPopTesting, setIsPopTesting] = useState(false);
  const [isPopTestSuccess, setIsPopTestSuccess] = useState<boolean | null>(null);
  const [popTestErrorMessage, setPopTestErrorMessage] = useState<string | null>(null);
  const [showPopPassword, setShowPopPassword] = useState(false);
  
  const { toast } = useToast();

  const smtpForm = useForm<SmtpFormValues>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: "",
      port: 587,
      secure: true,
      username: "",
      password: "",
      fromEmail: "",
      fromName: "",
    },
  });

  const popForm = useForm<PopFormValues>({
    resolver: zodResolver(popSchema),
    defaultValues: {
      host: "",
      port: 995,
      secure: true,
      username: "",
      password: "",
      leaveOnServer: true,
      autoCheckInterval: 10,
    },
  });

  const smtpSecure = smtpForm.watch("secure");
  const smtpHostValue = smtpForm.watch("host");
  
  const popSecure = popForm.watch("secure");
  const popHostValue = popForm.watch("host");

  // SMTP port auto-update
  useEffect(() => {
    const currentPort = smtpForm.watch("port");
    
    // Only auto-update port if it's one of the standard ports
    if (currentPort === 587 || currentPort === 465) {
      // Set default port based on secure setting
      if (smtpSecure) {
        smtpForm.setValue("port", 465);
      } else {
        smtpForm.setValue("port", 587);
      }
    }
  }, [smtpSecure, smtpForm]);

  // POP port auto-update
  useEffect(() => {
    const currentPort = popForm.watch("port");
    
    // Only auto-update port if it's one of the standard ports
    if (currentPort === 110 || currentPort === 995) {
      // Set default port based on secure setting
      if (popSecure) {
        popForm.setValue("port", 995);
      } else {
        popForm.setValue("port", 110);
      }
    }
  }, [popSecure, popForm]);

  // Load SMTP settings
  useEffect(() => {
    const loadSmtpSettings = async () => {
      try {
        const settings = await getSmtpSettings();
        if (settings) {
          smtpForm.reset({
            host: settings.host || "",
            port: settings.port || 587,
            secure: settings.secure !== undefined ? settings.secure : true,
            username: settings.username || "",
            password: settings.password || "",
            fromEmail: settings.fromEmail || "",
            fromName: settings.fromName || "",
          });
        }
      } catch (error) {
        console.error("Error loading SMTP settings:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить настройки SMTP",
          variant: "destructive",
        });
      }
    };

    loadSmtpSettings();
  }, [smtpForm.reset, toast]);
  
  // Load POP settings
  useEffect(() => {
    const loadPopSettings = async () => {
      try {
        const settings = await getPopSettings();
        if (settings) {
          popForm.reset({
            host: settings.host || "",
            port: settings.port || 995,
            secure: settings.secure !== undefined ? settings.secure : true,
            username: settings.username || "",
            password: settings.password || "",
            leaveOnServer: settings.leaveOnServer !== undefined ? settings.leaveOnServer : true,
            autoCheckInterval: settings.autoCheckInterval || 10,
          });
        }
      } catch (error) {
        console.error("Error loading POP settings:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить настройки POP3",
          variant: "destructive",
        });
      }
    };

    loadPopSettings();
  }, [popForm.reset, toast]);

  // SMTP form submit
  const onSmtpSubmit = async (data: SmtpFormValues) => {
    setIsSmtpLoading(true);

    try {
      // Create a fully validated settings object
      const smtpSettings: SmtpSettingsType = {
        host: data.host,
        port: data.port,
        secure: data.secure,
        username: data.username,
        password: data.password,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
      };
      
      await saveSmtpSettings(smtpSettings);
      
      toast({
        title: "Настройки сохранены",
        description: "Настройки SMTP успешно сохранены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки SMTP",
        variant: "destructive",
      });
    } finally {
      setIsSmtpLoading(false);
    }
  };
  
  // POP form submit
  const onPopSubmit = async (data: PopFormValues) => {
    setIsPopLoading(true);

    try {
      // Create a fully validated settings object
      const popSettings: PopSettingsType = {
        host: data.host,
        port: data.port,
        secure: data.secure,
        username: data.username,
        password: data.password,
        leaveOnServer: data.leaveOnServer,
        autoCheckInterval: data.autoCheckInterval,
      };
      
      await savePopSettings(popSettings);
      
      toast({
        title: "Настройки сохранены",
        description: "Настройки POP3 успешно сохранены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки POP3",
        variant: "destructive",
      });
    } finally {
      setIsPopLoading(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    setIsSmtpTesting(true);
    setIsSmtpTestSuccess(null);
    setSmtpTestErrorMessage(null);

    try {
      const formData = smtpForm.watch();
      
      // Ensure all required fields are present before testing
      if (!formData.host || !formData.username || !formData.password || 
          !formData.fromEmail || !formData.fromName) {
        setIsSmtpTestSuccess(false);
        setSmtpTestErrorMessage("Пожалуйста, заполните все обязательные поля");
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля",
          variant: "destructive",
        });
        setIsSmtpTesting(false);
        return;
      }
      
      // Create a fully validated settings object
      const smtpSettings: SmtpSettingsType = {
        host: formData.host,
        port: formData.port,
        secure: formData.secure,
        username: formData.username,
        password: formData.password,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
      };
      
      const result = await testSmtpConnection(smtpSettings);
      
      if (result.success) {
        setIsSmtpTestSuccess(true);
        toast({
          title: "Тест успешен",
          description: "Соединение с SMTP сервером работает корректно",
        });
      } else {
        setIsSmtpTestSuccess(false);
        setSmtpTestErrorMessage(result.message);
        toast({
          title: "Ошибка соединения",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsSmtpTestSuccess(false);
      setSmtpTestErrorMessage(error instanceof Error ? error.message : "Неизвестная ошибка");
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить тест соединения",
        variant: "destructive",
      });
    } finally {
      setIsSmtpTesting(false);
    }
  };
  
  const handleTestPopConnection = async () => {
    setIsPopTesting(true);
    setIsPopTestSuccess(null);
    setPopTestErrorMessage(null);

    try {
      const formData = popForm.watch();
      
      // Ensure all required fields are present before testing
      if (!formData.host || !formData.username || !formData.password) {
        setIsPopTestSuccess(false);
        setPopTestErrorMessage("Пожалуйста, заполните все обязательные поля");
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля",
          variant: "destructive",
        });
        setIsPopTesting(false);
        return;
      }
      
      // Create a fully validated settings object
      const popSettings: PopSettingsType = {
        host: formData.host,
        port: formData.port,
        secure: formData.secure,
        username: formData.username,
        password: formData.password,
        leaveOnServer: formData.leaveOnServer,
        autoCheckInterval: formData.autoCheckInterval,
      };
      
      const result = await testPopConnection(popSettings);
      
      if (result.success) {
        setIsPopTestSuccess(true);
        toast({
          title: "Тест успешен",
          description: "Соединение с POP3 сервером работает корректно",
        });
      } else {
        setIsPopTestSuccess(false);
        setPopTestErrorMessage(result.message);
        toast({
          title: "Ошибка соединения",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsPopTestSuccess(false);
      setPopTestErrorMessage(error instanceof Error ? error.message : "Неизвестная ошибка");
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить тест соединения",
        variant: "destructive",
      });
    } finally {
      setIsPopTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Mail className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Настройки почтового сервера</h2>
      </div>
      
      <Tabs value={activeProtocol} onValueChange={setActiveProtocol} className="w-full">
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>SMTP (Исходящие)</span>
          </TabsTrigger>
          <TabsTrigger value="pop" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>POP3 (Входящие)</span>
          </TabsTrigger>
        </TabsList>
        
        {/* SMTP Settings Tab */}
        <TabsContent value="smtp">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Настройки SMTP</CardTitle>
              <CardDescription>
                Настройте параметры подключения к SMTP-серверу для отправки системных уведомлений и писем пользователям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={smtpForm.handleSubmit(onSmtpSubmit)} className="space-y-6">
                <Tabs defaultValue="server" className="w-full">
                  <TabsList className="bg-gray-800 mb-6">
                    <TabsTrigger value="server">Сервер</TabsTrigger>
                    <TabsTrigger value="auth">Аутентификация</TabsTrigger>
                    <TabsTrigger value="sender">Отправитель</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="server" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp-host">SMTP хост</Label>
                        <div className="relative">
                          <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="smtp-host"
                            placeholder="smtp.gmail.com"
                            className="pl-9"
                            {...smtpForm.register("host")}
                          />
                        </div>
                        {smtpForm.formState.errors.host && (
                          <p className="text-sm text-destructive">{smtpForm.formState.errors.host.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="smtp-port">SMTP порт</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="smtp-port"
                            type="number"
                            placeholder="587"
                            className="pl-9"
                            {...smtpForm.register("port")}
                          />
                        </div>
                        {smtpForm.formState.errors.port && (
                          <p className="text-sm text-destructive">{smtpForm.formState.errors.port.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smtp-secure"
                        checked={smtpSecure}
                        onCheckedChange={(checked) => smtpForm.setValue("secure", checked)}
                      />
                      <Label htmlFor="smtp-secure">Использовать защищенное соединение (SSL/TLS)</Label>
                    </div>
                    
                    {smtpHostValue?.includes('gmail.com') && (
                      <Alert className="bg-blue-900/40 border-blue-800">
                        <AlertDescription className="text-sm">
                          <strong>Совет по настройке Gmail:</strong> Для аккаунтов Google с двухфакторной аутентификацией необходимо использовать пароль приложения вместо обычного пароля. 
                          <a 
                            href="https://support.google.com/accounts/answer/185833" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 ml-1"
                          >
                            Подробнее о паролях приложений
                          </a>
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="auth" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">Имя пользователя</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="smtp-username"
                          placeholder="user@example.com"
                          className="pl-9"
                          {...smtpForm.register("username")}
                        />
                      </div>
                      {smtpForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{smtpForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Пароль</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="smtp-password"
                          type={showSmtpPassword ? "text" : "password"}
                          placeholder="Пароль или ключ приложения"
                          className="pl-9 pr-10"
                          {...smtpForm.register("password")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        >
                          {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {smtpForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{smtpForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sender" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">Email отправителя</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fromEmail"
                          type="email"
                          placeholder="no-reply@yourcompany.com"
                          className="pl-9"
                          {...smtpForm.register("fromEmail")}
                        />
                      </div>
                      {smtpForm.formState.errors.fromEmail && (
                        <p className="text-sm text-destructive">{smtpForm.formState.errors.fromEmail.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fromName">Имя отправителя</Label>
                      <Input
                        id="fromName"
                        placeholder="Zerofy System"
                        {...smtpForm.register("fromName")}
                      />
                      {smtpForm.formState.errors.fromName && (
                        <p className="text-sm text-destructive">{smtpForm.formState.errors.fromName.message}</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {isSmtpTestSuccess !== null && (
                  <Alert className={isSmtpTestSuccess ? "bg-green-900/40 border-green-800" : "bg-red-900/40 border-red-800"}>
                    <div className="flex items-start">
                      {isSmtpTestSuccess ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                      )}
                      <AlertDescription className="text-sm">
                        {isSmtpTestSuccess 
                          ? "Соединение с SMTP сервером успешно установлено."
                          : `Ошибка соединения: ${smtpTestErrorMessage || "Не удалось подключиться к серверу"}`}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTestSmtpConnection}
                    disabled={isSmtpTesting}
                    className="order-2 sm:order-1"
                  >
                    {isSmtpTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Тестирование...
                      </>
                    ) : (
                      "Проверить соединение"
                    )}
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isSmtpLoading}
                    className="order-1 sm:order-2"
                  >
                    {isSmtpLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      "Сохранить настройки"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* POP3 Settings Tab */}
        <TabsContent value="pop">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Настройки POP3</CardTitle>
              <CardDescription>
                Настройте параметры подключения к POP3-серверу для получения входящих сообщений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={popForm.handleSubmit(onPopSubmit)} className="space-y-6">
                <Tabs defaultValue="server" className="w-full">
                  <TabsList className="bg-gray-800 mb-6">
                    <TabsTrigger value="server">Сервер</TabsTrigger>
                    <TabsTrigger value="auth">Аутентификация</TabsTrigger>
                    <TabsTrigger value="options">Параметры</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="server" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pop-host">POP3 хост</Label>
                        <div className="relative">
                          <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="pop-host"
                            placeholder="pop.gmail.com"
                            className="pl-9"
                            {...popForm.register("host")}
                          />
                        </div>
                        {popForm.formState.errors.host && (
                          <p className="text-sm text-destructive">{popForm.formState.errors.host.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pop-port">POP3 порт</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="pop-port"
                            type="number"
                            placeholder="995"
                            className="pl-9"
                            {...popForm.register("port")}
                          />
                        </div>
                        {popForm.formState.errors.port && (
                          <p className="text-sm text-destructive">{popForm.formState.errors.port.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pop-secure"
                        checked={popSecure}
                        onCheckedChange={(checked) => popForm.setValue("secure", checked)}
                      />
                      <Label htmlFor="pop-secure">Использовать защищенное соединение (SSL/TLS)</Label>
                    </div>
                    
                    {popHostValue?.includes('gmail.com') && (
                      <Alert className="bg-blue-900/40 border-blue-800">
                        <AlertDescription className="text-sm">
                          <strong>Совет по настройке Gmail:</strong> Необходимо активировать доступ POP3 в настройках аккаунта Google. 
                          <a 
                            href="https://support.google.com/mail/answer/7104828" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 ml-1"
                          >
                            Подробнее о настройке POP3 в Gmail
                          </a>
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="auth" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pop-username">Имя пользователя</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="pop-username"
                          placeholder="user@example.com"
                          className="pl-9"
                          {...popForm.register("username")}
                        />
                      </div>
                      {popForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{popForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pop-password">Пароль</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="pop-password"
                          type={showPopPassword ? "text" : "password"}
                          placeholder="Пароль или ключ приложения"
                          className="pl-9 pr-10"
                          {...popForm.register("password")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          onClick={() => setShowPopPassword(!showPopPassword)}
                        >
                          {showPopPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {popForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{popForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="options" className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="leave-on-server"
                        checked={popForm.watch("leaveOnServer")}
                        onCheckedChange={(checked) => popForm.setValue("leaveOnServer", checked)}
                      />
                      <Label htmlFor="leave-on-server">Оставлять сообщения на сервере</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="auto-check-interval">Интервал проверки почты (минуты)</Label>
                      <Input
                        id="auto-check-interval"
                        type="number"
                        min="0"
                        {...popForm.register("autoCheckInterval")}
                      />
                      <p className="text-xs text-gray-400">0 = отключить автоматическую проверку</p>
                      {popForm.formState.errors.autoCheckInterval && (
                        <p className="text-sm text-destructive">{popForm.formState.errors.autoCheckInterval.message}</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {isPopTestSuccess !== null && (
                  <Alert className={isPopTestSuccess ? "bg-green-900/40 border-green-800" : "bg-red-900/40 border-red-800"}>
                    <div className="flex items-start">
                      {isPopTestSuccess ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                      )}
                      <AlertDescription className="text-sm">
                        {isPopTestSuccess 
                          ? "Соединение с POP3 сервером успешно установлено."
                          : `Ошибка соединения: ${popTestErrorMessage || "Не удалось подключиться к серверу"}`}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTestPopConnection}
                    disabled={isPopTesting}
                    className="order-2 sm:order-1"
                  >
                    {isPopTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Тестирование...
                      </>
                    ) : (
                      "Проверить соединение"
                    )}
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isPopLoading}
                    className="order-1 sm:order-2"
                  >
                    {isPopLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      "Сохранить настройки"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SMTPSettings;

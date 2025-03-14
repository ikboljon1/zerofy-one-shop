
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { registerUser, checkPhoneExists } from "@/services/userService";
import { Info } from "lucide-react";
import axios from "axios";

// Country codes with Kyrgyzstan (+996) as default
const countryCodes = [
  { code: "+996", country: "Кыргызстан", pattern: /^\d{9}$/, example: "XXX XXX XXX", maxLength: 9 },
  { code: "+7", country: "Россия", pattern: /^\d{10}$/, example: "XXX XXX XX XX", maxLength: 10 },
  { code: "+375", country: "Беларусь", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+380", country: "Украина", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+998", country: "Узбекистан", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+77", country: "Казахстан", pattern: /^\d{9}$/, example: "XXX XXX XXX", maxLength: 9 },
  { code: "+992", country: "Таджикистан", pattern: /^\d{9}$/, example: "XX XXX XXXX", maxLength: 9 },
  { code: "+993", country: "Туркменистан", pattern: /^\d{8}$/, example: "XXX XX XX", maxLength: 8 },
  { code: "+994", country: "Азербайджан", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+374", country: "Армения", pattern: /^\d{8}$/, example: "XX XXX XXX", maxLength: 8 },
];

// Helper function to format phone number based on country pattern
const formatPhoneNumber = (value: string, countryCode: string) => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, "");
  
  const country = countryCodes.find(c => c.code === countryCode);
  if (!country) return digitsOnly;
  
  // Truncate to max length for the country
  return digitsOnly.slice(0, country.maxLength);
};

const registerSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
  phone: z.string()
    .refine(val => !val.startsWith('0'), {
      message: "Номер не должен начинаться с нуля"
    }),
  verificationCode: z.string().optional(),
});

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+996"); // Kyrgyzstan as default
  const [isPhoneUnique, setIsPhoneUnique] = useState(true);
  const [phoneFormatExample, setPhoneFormatExample] = useState("XXX XXX XXX"); // Default format example
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email");
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get the current country for validation
  const currentCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];

  useEffect(() => {
    // Получаем текущий метод верификации из настроек
    const fetchVerificationMethod = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/settings/verification-method");
        setVerificationMethod(response.data.method);
      } catch (error) {
        console.error("Ошибка при получении метода верификации:", error);
        // По умолчанию используем email
      }
    };
    
    fetchVerificationMethod();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
    getValues,
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      verificationCode: "",
    },
  });
  
  const phoneValue = watch("phone");
  const emailValue = watch("email");
  const verificationCodeValue = watch("verificationCode");
  
  // Update the phone format example when country code changes
  useEffect(() => {
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setPhoneFormatExample(country.example);
      
      // Re-format the current phone number for the new country code
      const currentPhone = getValues("phone");
      if (currentPhone) {
        const formatted = formatPhoneNumber(currentPhone, countryCode);
        setValue("phone", formatted);
      }
      
      trigger("phone"); // Re-validate with new country code
    }
  }, [countryCode, setValue, getValues, trigger]);
  
  // Format phone as user types
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "phone") {
        const formattedValue = formatPhoneNumber(value.phone || "", countryCode);
        if (formattedValue !== value.phone) {
          setValue("phone", formattedValue);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, setValue, countryCode]);
  
  // Validate phone against current country pattern and check if it exists
  useEffect(() => {
    if (phoneValue && phoneValue.length >= currentCountry.maxLength) {
      const checkPhone = async () => {
        // Validate against country pattern
        const isValidForCountry = currentCountry.pattern.test(phoneValue);
        
        if (!isValidForCountry) {
          return;
        }
        
        const fullPhoneNumber = `${countryCode}${phoneValue}`;
        const exists = await checkPhoneExists(fullPhoneNumber);
        setIsPhoneUnique(!exists);
        
        if (exists) {
          toast({
            title: "Предупреждение",
            description: "Номер телефона уже зарегистрирован в системе",
            variant: "destructive",
          });
        }
      };
      
      checkPhone();
    } else {
      setIsPhoneUnique(true);
    }
  }, [phoneValue, countryCode, toast, currentCountry.pattern, currentCountry.maxLength]);

  const sendVerificationCode = async () => {
    setIsLoading(true);
    
    try {
      if (verificationMethod === "phone") {
        // Проверка формата телефона
        if (!currentCountry.pattern.test(phoneValue)) {
          toast({
            title: "Ошибка",
            description: `Неверный формат телефона для ${currentCountry.country}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        const fullPhoneNumber = `${countryCode}${phoneValue}`;
        // Проверка, уникален ли телефон
        const exists = await checkPhoneExists(fullPhoneNumber);
        if (exists) {
          setIsPhoneUnique(false);
          toast({
            title: "Ошибка",
            description: "Номер телефона уже зарегистрирован в системе",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Отправляем SMS с кодом
        await axios.post("http://localhost:3001/api/send-verification-sms", {
          phone: fullPhoneNumber
        });
        
        toast({
          title: "Код отправлен",
          description: `Код верификации отправлен на номер ${fullPhoneNumber}`,
        });
      } else {
        // Отправляем код на email (заглушка, реальная отправка будет реализована на бэкенде)
        toast({
          title: "Код отправлен",
          description: `Код верификации отправлен на email ${emailValue}`,
        });
      }
      
      setVerificationSent(true);
      setVerificationStep(true);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить код верификации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    // Если верификация включена и мы на шаге проверки кода
    if (verificationStep) {
      if (!verificationCodeValue) {
        toast({
          title: "Ошибка",
          description: "Введите код верификации",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      try {
        if (verificationMethod === "phone") {
          const fullPhoneNumber = `${countryCode}${data.phone}`;
          
          // Проверяем код верификации
          const verifyResponse = await axios.post("http://localhost:3001/api/verify-phone", {
            phone: fullPhoneNumber,
            code: data.verificationCode
          });
          
          if (verifyResponse.data.success) {
            // Если код верный, продолжаем регистрацию
            await completeRegistration(data);
          }
        } else {
          // Для email верификации (заглушка)
          // В реальном приложении здесь должна быть проверка кода через API
          await completeRegistration(data);
        }
      } catch (error: any) {
        toast({
          title: "Ошибка",
          description: error.response?.data?.error || "Неверный код верификации",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Отправляем код верификации
      sendVerificationCode();
    }
  };
  
  const completeRegistration = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      // Validate the phone format for the selected country
      if (!currentCountry.pattern.test(data.phone)) {
        toast({
          title: "Ошибка",
          description: `Неверный формат телефона для ${currentCountry.country}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Combine country code with phone number
      const fullPhoneNumber = `${countryCode}${data.phone}`;
      
      // Check if phone is unique before registration
      const exists = await checkPhoneExists(fullPhoneNumber);
      if (exists) {
        setIsPhoneUnique(false);
        toast({
          title: "Ошибка",
          description: "Номер телефона уже зарегистрирован в системе",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Use userService to register the user with phone number
      const result = await registerUser(data.name, data.email, data.password, fullPhoneNumber);
      
      if (result.success) {
        toast({
          title: "Регистрация успешна",
          description: "Вы успешно зарегистрировались в системе",
        });
        
        // Store user in localStorage for session
        localStorage.setItem('user', JSON.stringify(result.user));
        
        onSuccess();
        navigate("/dashboard");
      } else {
        toast({
          title: "Ошибка",
          description: result.errorMessage || "Не удалось зарегистрироваться",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось зарегистрироваться. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      {!verificationStep ? (
        // Шаг 1: Сбор информации и отправка кода
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              placeholder="Введите ваше имя"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">Номер телефона</Label>
              <div className="text-xs text-muted-foreground flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Формат: {phoneFormatExample}
              </div>
            </div>
            <div className="flex">
              <Select 
                value={countryCode} 
                onValueChange={(value) => {
                  setCountryCode(value);
                  trigger("phone"); // Re-validate phone when country code changes
                }}
              >
                <SelectTrigger className="w-[140px] mr-2">
                  <SelectValue placeholder="Код страны" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.country} {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder={phoneFormatExample}
                className={`flex-1 ${!isPhoneUnique ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register("phone")}
                maxLength={currentCountry.maxLength}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
            {!currentCountry.pattern.test(phoneValue) && phoneValue.length > 0 && (
              <p className="text-sm text-amber-500">Неверный формат номера для {currentCountry.country}</p>
            )}
            {!isPhoneUnique && (
              <p className="text-sm text-destructive">Этот номер уже зарегистрирован</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isLoading || 
              !isPhoneUnique || 
              (phoneValue && !currentCountry.pattern.test(phoneValue))
            }
          >
            {isLoading ? "Отправка кода..." : "Получить код верификации"}
          </Button>
        </>
      ) : (
        // Шаг 2: Ввод кода верификации
        <>
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Код верификации</Label>
            <Input
              id="verificationCode"
              placeholder="Введите полученный код"
              {...register("verificationCode")}
            />
            {errors.verificationCode && (
              <p className="text-sm text-destructive">{errors.verificationCode.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Код верификации отправлен на {verificationMethod === "email" ? `email ${emailValue}` : `телефон ${countryCode}${phoneValue}`}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1" 
              onClick={() => setVerificationStep(false)}
              disabled={isLoading}
            >
              Назад
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading || !verificationCodeValue}
            >
              {isLoading ? "Проверка..." : "Завершить регистрацию"}
            </Button>
          </div>
          
          <Button 
            type="button" 
            variant="ghost"
            className="w-full text-sm" 
            onClick={sendVerificationCode}
            disabled={isLoading}
          >
            Отправить код повторно
          </Button>
        </>
      )}
    </form>
  );
};

export default RegisterForm;

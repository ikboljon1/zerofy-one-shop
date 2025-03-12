
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

// Country codes with Kyrgyzstan (+996) as default
const countryCodes = [
  { code: "+996", country: "Кыргызстан" },
  { code: "+7", country: "Россия" },
  { code: "+375", country: "Беларусь" },
  { code: "+380", country: "Украина" },
  { code: "+998", country: "Узбекистан" },
  { code: "+77", country: "Казахстан" },
  { code: "+992", country: "Таджикистан" },
  { code: "+993", country: "Туркменистан" },
  { code: "+994", country: "Азербайджан" },
  { code: "+374", country: "Армения" },
];

const registerSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
  phone: z.string()
    .min(9, { message: "Введите корректный номер телефона" })
    .refine(val => !val.startsWith('0'), {
      message: "Номер не должен начинаться с нуля"
    })
});

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+996"); // Kyrgyzstan as default
  const [isPhoneUnique, setIsPhoneUnique] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });
  
  const phoneValue = watch("phone");
  
  useEffect(() => {
    if (phoneValue && phoneValue.length >= 9) {
      const checkPhone = async () => {
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
  }, [phoneValue, countryCode, toast]);

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
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
        navigate("/dashboard"); // Changed from "/" to "/dashboard" for direct redirect
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
            Без нуля в начале
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
            placeholder="Номер телефона"
            className={`flex-1 ${!isPhoneUnique ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
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
      
      <Button type="submit" className="w-full" disabled={isLoading || !isPhoneUnique}>
        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
    </form>
  );
};

export default RegisterForm;

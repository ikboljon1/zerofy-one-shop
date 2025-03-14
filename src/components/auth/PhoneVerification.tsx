
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { sendVerificationSMS, verifySMSCode, generateVerificationCode } from "@/services/smsService";

const phoneVerificationSchema = z.object({
  phoneNumber: z.string().min(10, "Номер телефона должен содержать минимум 10 цифр"),
  verificationCode: z.string().min(6, "Код должен содержать 6 цифр").max(6)
});

type PhoneVerificationFormValues = z.infer<typeof phoneVerificationSchema>;

interface PhoneVerificationProps {
  onVerificationSuccess: () => void;
  onCancel?: () => void;
}

const PhoneVerification = ({ onVerificationSuccess, onCancel }: PhoneVerificationProps) => {
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const form = useForm<PhoneVerificationFormValues>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      phoneNumber: "",
      verificationCode: ""
    }
  });

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    const phoneNumber = form.getValues("phoneNumber");
    
    if (!phoneNumber || phoneNumber.length < 10) {
      form.setError("phoneNumber", { 
        type: "manual", 
        message: "Введите корректный номер телефона" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const code = generateVerificationCode();
      const success = await sendVerificationSMS(phoneNumber, code);
      
      if (success) {
        toast({
          title: "Код отправлен",
          description: `На номер ${phoneNumber} отправлен код подтверждения`,
        });
        setCodeSent(true);
        startCountdown();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить код подтверждения",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке кода",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (data: PhoneVerificationFormValues) => {
    setIsLoading(true);
    try {
      const { phoneNumber, verificationCode } = data;
      const verified = await verifySMSCode(phoneNumber, verificationCode);
      
      if (verified) {
        toast({
          title: "Успех",
          description: "Номер телефона успешно подтвержден",
        });
        onVerificationSuccess();
      } else {
        toast({
          title: "Ошибка",
          description: "Неверный код подтверждения",
          variant: "destructive",
        });
        form.setError("verificationCode", { 
          type: "manual", 
          message: "Неверный код подтверждения" 
        });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при проверке кода",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(verifyCode)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Номер телефона</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+7XXXXXXXXXX" 
                    {...field} 
                    disabled={codeSent && countdown > 0}
                  />
                </FormControl>
                <FormDescription>
                  Введите номер телефона в международном формате
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!codeSent ? (
            <Button 
              type="button" 
              onClick={sendCode}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Отправка..." : "Отправить код подтверждения"}
            </Button>
          ) : (
            <>
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код подтверждения</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Введите 6-значный код" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Введите код, отправленный на ваш телефон
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={sendCode}
                  disabled={isLoading || countdown > 0}
                  className="text-xs"
                >
                  {countdown > 0 ? `Повторить через ${countdown}с` : "Отправить повторно"}
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Проверка..." : "Подтвердить"}
                </Button>
              </div>
            </>
          )}
          
          {onCancel && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              className="w-full mt-2"
            >
              Отмена
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default PhoneVerification;

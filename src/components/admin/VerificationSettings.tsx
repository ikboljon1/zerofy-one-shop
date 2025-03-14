
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { AlertCircle, Check, Phone, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VerificationSettings = () => {
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchVerificationMethod();
  }, []);
  
  const fetchVerificationMethod = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/settings/verification-method");
      setVerificationMethod(response.data.method);
    } catch (error) {
      console.error("Ошибка при получении метода верификации:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить настройки верификации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveVerificationMethod = async () => {
    setIsSaving(true);
    try {
      await axios.put("http://localhost:3001/api/settings/verification-method", {
        method: verificationMethod,
      });
      
      toast({
        title: "Успех",
        description: "Метод верификации успешно обновлен",
      });
    } catch (error) {
      console.error("Ошибка при сохранении метода верификации:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить метод верификации",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Настройки верификации</CardTitle>
        <CardDescription>
          Выберите способ верификации пользователей при регистрации
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <RadioGroup
              value={verificationMethod}
              onValueChange={(value) => setVerificationMethod(value as "email" | "phone")}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 rounded-md border p-4">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <span>Верификация по email</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-4">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="flex items-center gap-2 cursor-pointer">
                  <Phone className="h-5 w-5 text-green-500" />
                  <span>Верификация по телефону</span>
                </Label>
              </div>
            </RadioGroup>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Важно!</AlertTitle>
              <AlertDescription>
                Изменение метода верификации повлияет только на новых пользователей.
                Для отправки SMS требуется интеграция с SMS-сервисом.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveVerificationMethod} 
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
    </Card>
  );
};

export default VerificationSettings;

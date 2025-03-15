
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneVerification from "../auth/PhoneVerification";
import { Check, AlertCircle } from "lucide-react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VerifyPhoneNumber = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVerificationSettings();
  }, []);

  const fetchVerificationSettings = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/settings/verification-method");
      setIsVerificationEnabled(response.data.enabled !== false); // Default to true if not specified
    } catch (error) {
      console.error("Ошибка при получении настроек верификации:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Проверка SMS интеграции</CardTitle>
          <CardDescription>
            Загрузка настроек верификации...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Проверка SMS интеграции</CardTitle>
        <CardDescription>
          Проверьте работу SMS-интеграции, отправив код подтверждения на ваш телефон
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isVerificationEnabled ? (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Верификация отключена</AlertTitle>
            <AlertDescription>
              В настройках отключена верификация пользователей. Включите верификацию во вкладке "Верификация", чтобы протестировать SMS-интеграцию.
            </AlertDescription>
          </Alert>
        ) : isVerified ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Номер успешно подтвержден</h3>
            <p className="text-muted-foreground mt-2">
              SMS интеграция работает корректно
            </p>
          </div>
        ) : (
          <PhoneVerification onVerificationSuccess={handleVerificationSuccess} />
        )}
      </CardContent>
    </Card>
  );
};

export default VerifyPhoneNumber;

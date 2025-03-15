
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PhoneVerification from "../auth/PhoneVerification";
import { Check } from "lucide-react";

const VerifyPhoneNumber = () => {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Проверка SMS интеграции</CardTitle>
        <CardDescription>
          Проверьте работу SMS-интеграции, отправив код подтверждения на ваш телефон
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isVerified ? (
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

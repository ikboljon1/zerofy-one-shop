
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Info, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

// Country codes
const countryCodes = [
  { code: "+996", country: "Кыргызстан", pattern: /^\d{9}$/, example: "XXX XXX XXX", maxLength: 9 },
  { code: "+7", country: "Россия", pattern: /^\d{10}$/, example: "XXX XXX XX XX", maxLength: 10 },
  { code: "+375", country: "Беларусь", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+380", country: "Украина", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+998", country: "Узбекистан", pattern: /^\d{9}$/, example: "XX XXX XX XX", maxLength: 9 },
  { code: "+77", country: "Казахстан", pattern: /^\d{9}$/, example: "XXX XXX XXX", maxLength: 9 },
];

// Операторы связи по кодам для разных стран
const operatorCodes = {
  "+996": [
    { codes: ["55", "55", "55", "57", "58"], name: "Мегаком" },
    { codes: ["70", "50", "51", "52"], name: "Билайн" },
    { codes: ["77", "75", "76", "78"], name: "О!" },
  ],
  "+7": [
    { codes: ["900", "901", "902", "903", "904", "905", "906", "908", "909", "950", "951", "952", "953", "954", "955", "956", "958", "959", "999"], name: "МТС" },
    { codes: ["910", "911", "912", "913", "914", "915", "916", "917", "918", "919", "980", "981", "982", "983", "984", "985", "986", "987", "988", "989"], name: "Билайн" },
    { codes: ["920", "921", "922", "923", "924", "925", "926", "927", "928", "929", "930", "931", "932", "933", "934", "935", "936", "937", "938", "939", "960", "961", "962", "963", "964", "965", "966", "967", "968", "969"], name: "Мегафон" },
    { codes: ["970", "971", "972", "973", "974", "975", "976", "977", "978", "979", "991", "992", "993", "994", "995", "996", "997", "998", "999"], name: "Tele2" },
  ],
  "+77": [
    { codes: ["00", "01", "02", "05", "07", "08"], name: "Алтел" },
    { codes: ["11", "12", "13", "14", "15", "16", "17", "18", "19", "71", "76", "77", "78"], name: "Билайн" },
    { codes: ["05", "25", "26", "27", "28", "29", "75", "89", "69", "67"], name: "Актив" },
    { codes: ["47", "48", "70", "71", "76", "77", "78"], name: "Теле2" },
  ],
  "+996": [
    { codes: ["55", "55", "55", "57", "58"], name: "Мегаком" },
    { codes: ["70", "50", "51", "52"], name: "Билайн" },
    { codes: ["77", "75", "76", "78"], name: "О!" },
  ],
};

// Helper function to get operator name by phone number and country code
const getOperatorName = (phoneNumber: string, countryCode: string): string | null => {
  const operators = operatorCodes[countryCode as keyof typeof operatorCodes];
  if (!operators) return null;
  
  // Extract start of the phone number to check against operator codes
  // For different countries, we check different numbers of digits
  const digits = phoneNumber.replace(/\D/g, "");
  
  // Define how many digits to check based on country code
  let digitsToCheck = 2; // Default
  if (countryCode === "+7") digitsToCheck = 3;
  
  if (digits.length < digitsToCheck) return null;
  
  const prefix = digits.substring(0, digitsToCheck);
  
  // Find matching operator
  const operator = operators.find(op => op.codes.includes(prefix));
  return operator ? operator.name : null;
};

interface PhoneVerificationProps {
  onVerificationSuccess: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onVerificationSuccess }) => {
  const [countryCode, setCountryCode] = useState("+996");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isPhoneSubmitted, setIsPhoneSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneFormatExample, setPhoneFormatExample] = useState("XXX XXX XXX");
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [isValidOperator, setIsValidOperator] = useState(true);
  
  const { toast } = useToast();
  
  // Get the current country for validation
  const currentCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[0];
  
  // Update phone format example when country code changes
  useEffect(() => {
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setPhoneFormatExample(country.example);
      setPhoneNumber(""); // Reset phone number
      setIsPhoneSubmitted(false); // Reset verification state
      setVerificationCode(""); // Reset verification code
      setOperatorName(null);
      setIsValidOperator(true);
    }
  }, [countryCode]);
  
  // Update operator info when phone number changes
  useEffect(() => {
    if (phoneNumber.length >= 2) {
      const operator = getOperatorName(phoneNumber, countryCode);
      setOperatorName(operator);
      setIsValidOperator(operator !== null);
    } else {
      setOperatorName(null);
      setIsValidOperator(true);
    }
  }, [phoneNumber, countryCode]);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters
    const digitsOnly = e.target.value.replace(/\D/g, "");
    
    // Truncate to max length for the current country
    const truncated = digitsOnly.slice(0, currentCountry.maxLength);
    
    setPhoneNumber(truncated);
  };
  
  const handleSendVerificationCode = async () => {
    // Validate phone number format
    if (!currentCountry.pattern.test(phoneNumber)) {
      toast({
        title: "Ошибка",
        description: `Неверный формат номера для ${currentCountry.country}`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate operator
    if (!isValidOperator) {
      toast({
        title: "Ошибка",
        description: "Указан неверный код оператора для выбранной страны",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send verification code
      await axios.post("http://localhost:3001/api/send-verification-sms", {
        phone: `${countryCode}${phoneNumber}`
      });
      
      setIsPhoneSubmitted(true);
      
      toast({
        title: "Код отправлен",
        description: `Код верификации отправлен на номер ${countryCode}${phoneNumber}`,
      });
    } catch (error) {
      console.error("Ошибка при отправке кода верификации:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить код верификации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Ошибка",
        description: "Введите код верификации",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify the code
      const response = await axios.post("http://localhost:3001/api/verify-phone", {
        phone: `${countryCode}${phoneNumber}`,
        code: verificationCode
      });
      
      if (response.data.success) {
        toast({
          title: "Успех",
          description: "Номер телефона успешно подтвержден",
        });
        
        onVerificationSuccess();
      } else {
        toast({
          title: "Ошибка",
          description: "Неверный код верификации",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при проверке кода верификации:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить код верификации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        {!isPhoneSubmitted ? (
          <div className="space-y-4">
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
                  onValueChange={setCountryCode}
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
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder={phoneFormatExample}
                  className={`flex-1 ${!isValidOperator && phoneNumber.length >= 2 ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  maxLength={currentCountry.maxLength}
                />
              </div>
              {operatorName && (
                <p className="text-sm text-green-600">Оператор: {operatorName}</p>
              )}
              {!isValidOperator && phoneNumber.length >= 2 && (
                <p className="text-sm text-destructive">Неверный код оператора для выбранной страны</p>
              )}
              {!currentCountry.pattern.test(phoneNumber) && phoneNumber.length > 0 && (
                <p className="text-sm text-amber-500">Неверный формат номера для {currentCountry.country}</p>
              )}
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSendVerificationCode}
              disabled={
                isLoading || 
                !phoneNumber || 
                !isValidOperator ||
                !currentCountry.pattern.test(phoneNumber)
              }
            >
              {isLoading ? "Отправка..." : "Отправить код верификации"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код верификации</Label>
              <Input
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Введите полученный код"
              />
              <p className="text-sm text-muted-foreground">
                Код верификации отправлен на номер {countryCode} {phoneNumber}
                {operatorName && ` (${operatorName})`}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsPhoneSubmitted(false)}
                disabled={isLoading}
              >
                Назад
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode}
              >
                {isLoading ? "Проверка..." : "Подтвердить"}
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={handleSendVerificationCode}
              disabled={isLoading}
            >
              Отправить код повторно
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;

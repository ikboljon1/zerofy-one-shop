
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIModel, NewAIModel, aiModelTypes, aiModelVersions } from "@/types/store";
import { PlusCircle, Bot, AlertTriangle, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { validateAIModelApiKey } from "@/utils/storeUtils";
import { toast } from "sonner";

interface AddAIModelDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onAddModel: (model: NewAIModel) => void;
  modelCount: number;
  modelLimit: number;
}

export function AddAIModelDialog({ 
  isOpen, 
  isLoading, 
  onOpenChange, 
  onAddModel,
  modelCount,
  modelLimit
}: AddAIModelDialogProps) {
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState<string>("OpenAI");
  const [modelVersion, setModelVersion] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [apiKeyValidationStatus, setApiKeyValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModelName("");
      setModelType("OpenAI");
      setModelVersion("");
      setApiKey("");
      setApiKeyValidationStatus("idle");
      setValidationError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    // При изменении типа модели сбрасываем версию и устанавливаем первую доступную
    if (modelType && aiModelVersions[modelType as keyof typeof aiModelVersions]) {
      setModelVersion(aiModelVersions[modelType as keyof typeof aiModelVersions][0]);
    }
  }, [modelType]);

  useEffect(() => {
    // Сбрасываем статус валидации при изменении API ключа
    if (apiKey) {
      setApiKeyValidationStatus("idle");
      setValidationError(null);
    }
  }, [apiKey]);

  const validateKey = async () => {
    if (!apiKey || !modelType) return false;
    
    setApiKeyValidationStatus("validating");
    setValidationError(null);
    
    const result = await validateAIModelApiKey(apiKey, modelType);
    
    if (result.isValid) {
      setApiKeyValidationStatus("valid");
      return true;
    } else {
      setApiKeyValidationStatus("invalid");
      setValidationError(result.errorMessage || "API ключ не прошел проверку");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка API ключа при отправке формы
    const isValid = await validateKey();
    if (!isValid) {
      toast.error(validationError || "API ключ не прошел проверку", {
        duration: 4000,
      });
      return;
    }
    
    // Формируем название модели, если пользователь не ввел своё
    const finalModelName = modelName.trim() || `${modelType} - ${modelVersion}`;
    
    onAddModel({
      name: finalModelName,
      type: modelType as any,
      apiKey,
    });
  };

  const resetForm = () => {
    setModelName("");
    setModelType("OpenAI");
    setModelVersion("");
    setApiKey("");
    setApiKeyValidationStatus("idle");
    setValidationError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const isAtModelLimit = modelCount >= modelLimit;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={isAtModelLimit}>
          <PlusCircle className="h-4 w-4" />
          <span>Добавить AI модель</span>
          {modelCount > 0 && (
            <Badge variant="outline" className="ml-1 bg-purple-950/30 text-purple-400 border-purple-800">
              <span>{modelCount}/{modelLimit}</span>
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <DialogTitle>Добавить AI модель</DialogTitle>
          </div>
        </DialogHeader>
        
        {isAtModelLimit && (
          <Alert className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              Вы достигли лимита AI моделей ({modelLimit}) для вашего тарифа. Перейдите на более высокий тариф, чтобы добавить больше моделей.
            </AlertDescription>
          </Alert>
        )}
        
        {!isAtModelLimit && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="name">Название модели (опционально)</Label>
                <Badge variant="outline" className="flex items-center gap-1.5 bg-purple-950/30 text-purple-400 border-purple-800">
                  <span>{modelCount}/{modelLimit}</span>
                </Badge>
              </div>
              <Input
                id="name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Введите название модели или оставьте пустым для автоматического названия"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelType">Тип AI модели</Label>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger id="modelType">
                  <SelectValue placeholder="Выберите тип AI модели" />
                </SelectTrigger>
                <SelectContent>
                  {aiModelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelVersion">Версия модели</Label>
              <Select value={modelVersion} onValueChange={setModelVersion}>
                <SelectTrigger id="modelVersion">
                  <SelectValue placeholder="Выберите версию модели" />
                </SelectTrigger>
                <SelectContent>
                  {modelType && aiModelVersions[modelType as keyof typeof aiModelVersions]?.map((version) => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                API ключ
                {apiKeyValidationStatus === "validating" && (
                  <Badge variant="outline" className="ml-1 px-2 py-0 h-5 bg-blue-950/20 text-blue-300 border-blue-800/50 text-xs flex items-center">
                    <span className="animate-pulse">Проверка...</span>
                  </Badge>
                )}
                {apiKeyValidationStatus === "valid" && (
                  <Badge variant="outline" className="ml-1 px-2 py-0 h-5 bg-green-950/20 text-green-300 border-green-800/50 text-xs flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    <span>Ключ валиден</span>
                  </Badge>
                )}
                {apiKeyValidationStatus === "invalid" && (
                  <Badge variant="outline" className="ml-1 px-2 py-0 h-5 bg-red-950/20 text-red-300 border-red-800/50 text-xs flex items-center">
                    <XCircle className="h-3 w-3 mr-1 text-red-500" />
                    <span>Ключ невалиден</span>
                  </Badge>
                )}
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={validateKey}
                placeholder="Введите API ключ"
              />
              {apiKeyValidationStatus === "invalid" && (
                <div className="text-sm text-red-400 mt-1 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{validationError || "API ключ не прошел проверку. Пожалуйста, убедитесь, что ключ корректен."}</p>
                </div>
              )}
            </div>
            
            <Alert variant="default" className="bg-blue-900/20 border-blue-800/30 text-blue-300">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <AlertDescription>
                API ключи хранятся только локально в вашем браузере и не передаются на сервер
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} className="mr-2">
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !modelType || !modelVersion || !apiKey || apiKeyValidationStatus === "validating" || apiKeyValidationStatus === "invalid"}
              >
                {isLoading ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BrainCircuit, Key, SquareAsterisk } from "lucide-react";
import axios from "axios";

interface AISettingsProps {
  onSettingsChange?: () => void;
}

export interface AISettings {
  id?: number;
  userId: number;
  apiKey: string;
  modelType: string;
  isActive: boolean;
}

export default function AISettings({ onSettingsChange }: AISettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [modelType, setModelType] = useState("gpt-4");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Получаем текущего пользователя из localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast({
        title: "Ошибка",
        description: "Необходимо авторизоваться для настройки ИИ",
        variant: "destructive",
      });
      return;
    }

    const user = JSON.parse(userData);
    setUserId(user.id);

    // Загружаем настройки ИИ пользователя
    loadAISettings(user.id);
  }, []);

  const loadAISettings = async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/user-ai-settings/${userId}`);
      if (response.data) {
        setApiKey(response.data.api_key || "");
        setModelType(response.data.model_type || "gpt-4");
      }
    } catch (error) {
      console.error("Ошибка при загрузке настроек ИИ:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить настройки ИИ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Необходимо авторизоваться для настройки ИИ",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите API ключ",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await axios.post('/api/user-ai-settings', {
        userId,
        apiKey,
        modelType,
        isActive: true
      });

      toast({
        title: "Успешно",
        description: "Настройки ИИ успешно сохранены",
      });

      if (onSettingsChange) {
        onSettingsChange();
      }
    } catch (error) {
      console.error("Ошибка при сохранении настроек ИИ:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки ИИ",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          <CardTitle>Настройки ИИ</CardTitle>
        </div>
        <CardDescription>
          Подключите свой API ключ для использования ИИ-функций
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>API ключ</span>
            </div>
          </Label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Введите ваш API ключ от выбранной модели ИИ
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-type">
            <div className="flex items-center gap-2">
              <SquareAsterisk className="h-4 w-4" />
              <span>Модель ИИ</span>
            </div>
          </Label>
          <Select
            value={modelType}
            onValueChange={setModelType}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите модель ИИ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">OpenAI GPT-4</SelectItem>
              <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
              <SelectItem value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</SelectItem>
              <SelectItem value="gemini-pro">Google Gemini Pro</SelectItem>
              <SelectItem value="gemini-ultra">Google Gemini Ultra</SelectItem>
              <SelectItem value="claude-3-opus">Anthropic Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Anthropic Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Выберите модель ИИ для анализа данных магазина
          </p>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSaveSettings}
          disabled={isLoading || isSaving}
        >
          {isSaving ? "Сохранение..." : "Сохранить настройки"}
        </Button>
      </CardContent>
    </Card>
  );
}

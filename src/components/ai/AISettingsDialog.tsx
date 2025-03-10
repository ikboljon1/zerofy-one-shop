
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAISettings, saveAISettings, getAvailableProviders } from "@/services/aiService";
import { AISettings } from "@/types/ai";

interface AISettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AISettingsDialog = ({ open, onOpenChange }: AISettingsDialogProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>(getAISettings());
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const providers = getAvailableProviders();

  useEffect(() => {
    if (open) {
      setSettings(getAISettings());
    }
  }, [open]);

  const handleSave = () => {
    try {
      saveAISettings(settings);
      
      toast({
        title: "Настройки сохранены",
        description: settings.isEnabled 
          ? "AI-анализ данных включен" 
          : "AI-анализ данных отключен",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      // Упрощенный тест соединения в зависимости от провайдера
      if (!settings.apiKey) {
        throw new Error("API ключ не указан");
      }
      
      let testUrl = '';
      let headers: Record<string, string> = {};
      
      switch (settings.provider) {
        case 'openai':
          testUrl = 'https://api.openai.com/v1/models';
          headers = {
            'Authorization': `Bearer ${settings.apiKey}`
          };
          break;
        case 'gemini':
          // Для Google Gemini API
          testUrl = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + settings.apiKey;
          break;
        case 'anthropic':
          // Для Anthropic Claude API
          testUrl = 'https://api.anthropic.com/v1/messages';
          headers = {
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01'
          };
          break;
      }
      
      const response = await fetch(testUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`Ошибка соединения: ${response.status} ${response.statusText}`);
      }
      
      toast({
        title: "Соединение установлено",
        description: "API ключ работает корректно",
      });
    } catch (error) {
      console.error('Ошибка при тестировании соединения:', error);
      toast({
        title: "Ошибка соединения",
        description: error instanceof Error ? error.message : "Не удалось установить соединение с API",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const selectedProvider = providers.find(p => p.id === settings.provider);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Настройки AI-анализа данных</DialogTitle>
          <DialogDescription>
            Настройте параметры использования искусственного интеллекта для анализа данных вашего магазина
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-enabled" className="text-base">Включить AI-анализ</Label>
            <Switch
              id="ai-enabled"
              checked={settings.isEnabled}
              onCheckedChange={(checked) => setSettings({...settings, isEnabled: checked})}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="ai-provider">Провайдер AI</Label>
            <Select 
              value={settings.provider} 
              onValueChange={(value) => setSettings({...settings, provider: value})}
            >
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Выберите провайдера" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProvider && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedProvider.description}
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key">API ключ</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowApiKey(!showApiKey)}
                className="h-6 px-2"
              >
                {showApiKey ? "Скрыть" : "Показать"}
              </Button>
            </div>
            <Input
              id="api-key"
              type={showApiKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              placeholder="Введите ваш API ключ"
            />
            <p className="text-xs text-muted-foreground">
              Ваш API ключ хранится только локально в браузере и не передается никуда, кроме API выбранного провайдера.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={isTesting || !settings.apiKey}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Проверка...
              </>
            ) : (
              "Проверить соединение"
            )}
          </Button>
          <Button onClick={handleSave}>Сохранить настройки</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsDialog;

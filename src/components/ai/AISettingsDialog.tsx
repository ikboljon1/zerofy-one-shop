
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIUserConfig, AIModelConfig, AIModelProvider, AI_MODELS } from '@/types/ai';
import { getAIConfig, saveAIConfig } from '@/services/aiService';
import { Settings, CheckCircle, KeyRound, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AISettingsDialogProps {
  onConfigSaved?: (config: AIUserConfig) => void;
}

export default function AISettingsDialog({ onConfigSaved }: AISettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('openai');
  const [configs, setConfigs] = useState<Record<string, {
    apiKey: string;
    selectedModelId: string;
    isActive: boolean;
  }>>({
    openai: { apiKey: '', selectedModelId: 'gpt-4o', isActive: false },
    google: { apiKey: '', selectedModelId: 'gemini-pro', isActive: false },
    anthropic: { apiKey: '', selectedModelId: 'claude-3-opus', isActive: false },
    mistral: { apiKey: '', selectedModelId: 'mistral-large', isActive: false },
    perplexity: { apiKey: '', selectedModelId: 'sonar-small-online', isActive: false },
  });
  
  const { toast } = useToast();
  
  // Загружаем существующую конфигурацию при открытии
  useEffect(() => {
    if (open) {
      const savedConfig = getAIConfig();
      if (savedConfig) {
        const providerKey = savedConfig.provider.toLowerCase();
        
        setConfigs(prevConfigs => ({
          ...prevConfigs,
          [providerKey]: {
            apiKey: savedConfig.apiKey,
            selectedModelId: savedConfig.selectedModelId,
            isActive: true
          }
        }));
        
        setActiveTab(providerKey);
      }
    }
  }, [open]);
  
  const handleSave = () => {
    // Определяем активного провайдера
    const activeProviderKey = Object.keys(configs).find(key => configs[key as keyof typeof configs].isActive);
    
    if (!activeProviderKey) {
      toast({
        title: "Ошибка настройки",
        description: "Выберите и активируйте одного провайдера ИИ",
        variant: "destructive"
      });
      return;
    }
    
    const activeProvider = activeProviderKey as keyof typeof configs;
    const providerConfig = configs[activeProvider];
    
    if (!providerConfig.apiKey) {
      toast({
        title: "Ошибка настройки",
        description: "Введите API ключ для выбранного провайдера",
        variant: "destructive"
      });
      return;
    }
    
    // Создаем конфигурацию
    const config: AIUserConfig = {
      id: Date.now().toString(),
      provider: mapProviderKeyToEnum(activeProvider),
      apiKey: providerConfig.apiKey,
      selectedModelId: providerConfig.selectedModelId,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Сохраняем конфигурацию
    saveAIConfig(config);
    
    // Вызываем колбэк
    if (onConfigSaved) {
      onConfigSaved(config);
    }
    
    toast({
      title: "Настройки сохранены",
      description: `Настройки ${config.provider} успешно сохранены`,
    });
    
    setOpen(false);
  };
  
  const handleProviderActivation = (providerKey: string) => {
    setConfigs(prevConfigs => {
      const newConfigs = { ...prevConfigs };
      
      // Деактивируем всех провайдеров
      Object.keys(newConfigs).forEach(key => {
        newConfigs[key as keyof typeof newConfigs].isActive = false;
      });
      
      // Активируем выбранного провайдера
      newConfigs[providerKey as keyof typeof newConfigs].isActive = true;
      
      return newConfigs;
    });
  };
  
  const mapProviderKeyToEnum = (key: string): AIModelProvider => {
    switch (key) {
      case 'openai': return 'OpenAI';
      case 'google': return 'Google';
      case 'anthropic': return 'Anthropic';
      case 'mistral': return 'Mistral';
      case 'perplexity': return 'Perplexity';
      default: return 'OpenAI';
    }
  };
  
  const getModelsByProvider = (provider: AIModelProvider): AIModelConfig[] => {
    return AI_MODELS.filter(model => model.provider === provider);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Настройки ИИ
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Настройки искусственного интеллекта</DialogTitle>
          <DialogDescription>
            Настройте подключение к выбранному провайдеру ИИ для анализа данных вашего магазина
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="openai" onClick={() => setActiveTab('openai')}>OpenAI</TabsTrigger>
            <TabsTrigger value="google" onClick={() => setActiveTab('google')}>Google</TabsTrigger>
            <TabsTrigger value="anthropic" onClick={() => setActiveTab('anthropic')}>Anthropic</TabsTrigger>
            <TabsTrigger value="mistral" onClick={() => setActiveTab('mistral')}>Mistral</TabsTrigger>
            <TabsTrigger value="perplexity" onClick={() => setActiveTab('perplexity')}>Perplexity</TabsTrigger>
          </TabsList>
          
          {/* OpenAI Settings */}
          <TabsContent value="openai" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">OpenAI</h3>
                <p className="text-sm text-muted-foreground">
                  Настройте ваш ключ API OpenAI для использования GPT-4 и других моделей.
                </p>
              </div>
              <Button 
                variant={configs.openai.isActive ? "default" : "outline"}
                onClick={() => handleProviderActivation('openai')}
                className="gap-2"
              >
                {configs.openai.isActive ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {configs.openai.isActive ? "Активен" : "Активировать"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">API ключ</Label>
                <Input
                  id="openai-api-key"
                  type="password"
                  placeholder="sk-..."
                  value={configs.openai.apiKey}
                  onChange={(e) => setConfigs({
                    ...configs,
                    openai: { ...configs.openai, apiKey: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Получите ключ API на <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">сайте OpenAI</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openai-model">Модель</Label>
                <Select
                  value={configs.openai.selectedModelId}
                  onValueChange={(value) => setConfigs({
                    ...configs,
                    openai: { ...configs.openai, selectedModelId: value }
                  })}
                >
                  <SelectTrigger id="openai-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByProvider('OpenAI').map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Google Settings */}
          <TabsContent value="google" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Google</h3>
                <p className="text-sm text-muted-foreground">
                  Настройте ваш ключ API Google для использования Gemini и других моделей.
                </p>
              </div>
              <Button 
                variant={configs.google.isActive ? "default" : "outline"}
                onClick={() => handleProviderActivation('google')}
                className="gap-2"
              >
                {configs.google.isActive ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {configs.google.isActive ? "Активен" : "Активировать"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-api-key">API ключ</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  placeholder="AIza..."
                  value={configs.google.apiKey}
                  onChange={(e) => setConfigs({
                    ...configs,
                    google: { ...configs.google, apiKey: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Получите ключ API на <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">сайте Google AI</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="google-model">Модель</Label>
                <Select
                  value={configs.google.selectedModelId}
                  onValueChange={(value) => setConfigs({
                    ...configs,
                    google: { ...configs.google, selectedModelId: value }
                  })}
                >
                  <SelectTrigger id="google-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByProvider('Google').map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Anthropic Settings */}
          <TabsContent value="anthropic" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Anthropic</h3>
                <p className="text-sm text-muted-foreground">
                  Настройте ваш ключ API Anthropic для использования Claude и других моделей.
                </p>
              </div>
              <Button 
                variant={configs.anthropic.isActive ? "default" : "outline"}
                onClick={() => handleProviderActivation('anthropic')}
                className="gap-2"
              >
                {configs.anthropic.isActive ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {configs.anthropic.isActive ? "Активен" : "Активировать"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anthropic-api-key">API ключ</Label>
                <Input
                  id="anthropic-api-key"
                  type="password"
                  placeholder="sk-ant-..."
                  value={configs.anthropic.apiKey}
                  onChange={(e) => setConfigs({
                    ...configs,
                    anthropic: { ...configs.anthropic, apiKey: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Получите ключ API на <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">сайте Anthropic</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anthropic-model">Модель</Label>
                <Select
                  value={configs.anthropic.selectedModelId}
                  onValueChange={(value) => setConfigs({
                    ...configs,
                    anthropic: { ...configs.anthropic, selectedModelId: value }
                  })}
                >
                  <SelectTrigger id="anthropic-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByProvider('Anthropic').map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Mistral Settings */}
          <TabsContent value="mistral" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Mistral AI</h3>
                <p className="text-sm text-muted-foreground">
                  Настройте ваш ключ API Mistral для использования их моделей.
                </p>
              </div>
              <Button 
                variant={configs.mistral.isActive ? "default" : "outline"}
                onClick={() => handleProviderActivation('mistral')}
                className="gap-2"
              >
                {configs.mistral.isActive ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {configs.mistral.isActive ? "Активен" : "Активировать"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mistral-api-key">API ключ</Label>
                <Input
                  id="mistral-api-key"
                  type="password"
                  placeholder="..."
                  value={configs.mistral.apiKey}
                  onChange={(e) => setConfigs({
                    ...configs,
                    mistral: { ...configs.mistral, apiKey: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Получите ключ API на <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">сайте Mistral AI</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mistral-model">Модель</Label>
                <Select
                  value={configs.mistral.selectedModelId}
                  onValueChange={(value) => setConfigs({
                    ...configs,
                    mistral: { ...configs.mistral, selectedModelId: value }
                  })}
                >
                  <SelectTrigger id="mistral-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByProvider('Mistral').map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          {/* Perplexity Settings */}
          <TabsContent value="perplexity" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Perplexity</h3>
                <p className="text-sm text-muted-foreground">
                  Настройте ваш ключ API Perplexity для использования их моделей с доступом к интернету.
                </p>
              </div>
              <Button 
                variant={configs.perplexity.isActive ? "default" : "outline"}
                onClick={() => handleProviderActivation('perplexity')}
                className="gap-2"
              >
                {configs.perplexity.isActive ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {configs.perplexity.isActive ? "Активен" : "Активировать"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="perplexity-api-key">API ключ</Label>
                <Input
                  id="perplexity-api-key"
                  type="password"
                  placeholder="pplx-..."
                  value={configs.perplexity.apiKey}
                  onChange={(e) => setConfigs({
                    ...configs,
                    perplexity: { ...configs.perplexity, apiKey: e.target.value }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Получите ключ API на <a href="https://www.perplexity.ai/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">сайте Perplexity</a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="perplexity-model">Модель</Label>
                <Select
                  value={configs.perplexity.selectedModelId}
                  onValueChange={(value) => setConfigs({
                    ...configs,
                    perplexity: { ...configs.perplexity, selectedModelId: value }
                  })}
                >
                  <SelectTrigger id="perplexity-model">
                    <SelectValue placeholder="Выберите модель" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByProvider('Perplexity').map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-xs text-muted-foreground">API ключи хранятся только в вашем браузере</span>
          </div>
          <Button onClick={handleSave}>Сохранить настройки</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

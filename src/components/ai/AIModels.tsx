
import { useState, useEffect } from "react";
import { Bot, Plus, Check, RefreshCw, Trash2, AlertTriangle, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AIModel, NewAIModel, aiModelTypes, aiModelVersions } from "@/types/store";
import { loadAIModels, saveAIModels, validateAIModelApiKey, ensureAIModelSelectionPersistence } from "@/utils/storeUtils";
import { AddAIModelDialog } from "./AddAIModelDialog";
import { AIModelCard } from "./AIModelCard";
import { Badge } from "@/components/ui/badge";

interface AIModelsProps {
  onModelSelect?: (model: { id: string; apiKey: string; type: string }) => void;
}

export default function AIModels({ onModelSelect }: AIModelsProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLimit, setModelLimit] = useState<number>(1); // Default to 1
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedModels = ensureAIModelSelectionPersistence();
      setModels(savedModels);
      getModelLimitFromTariff();
    } catch (error) {
      console.error("Ошибка загрузки AI моделей:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список AI моделей",
        variant: "destructive",
      });
    }
  }, []);

  const getModelLimitFromTariff = () => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    try {
      const user = JSON.parse(userData);
      
      // Set model limit based on tariff
      switch (user.tariffId) {
        case "1": // Базовый
          setModelLimit(1);
          break;
        case "2": // Профессиональный
          setModelLimit(2);
          break;
        case "3": // Бизнес
          setModelLimit(3);
          break;
        case "4": // Корпоративный
          setModelLimit(5);
          break;
        default:
          setModelLimit(1); // Default to basic plan
      }
    } catch (error) {
      console.error("Ошибка при получении лимита AI моделей:", error);
      setModelLimit(1); // Default to basic plan on error
    }
  };

  const handleAddModel = async (newModel: NewAIModel) => {
    console.log("Starting AI model addition...");
    
    if (!newModel.type || !newModel.name || !newModel.apiKey) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    // Check if model limit has been reached
    if (models.length >= modelLimit) {
      toast({
        title: "Ограничение тарифа",
        description: `Ваш тариф позволяет добавить максимум ${modelLimit} ${modelLimit === 1 ? 'модель' : modelLimit < 5 ? 'модели' : 'моделей'} ИИ. Перейдите на более высокий тариф для добавления большего количества моделей.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate API key before creating the AI model
      const validationResult = await validateAIModelApiKey(newModel.apiKey!, newModel.type!);
      
      if (!validationResult.isValid) {
        toast({
          title: "Ошибка API ключа",
          description: validationResult.errorMessage || "Указанный API ключ некорректен. Пожалуйста, проверьте ключ и попробуйте снова.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const model: AIModel = {
        id: Date.now().toString(),
        type: newModel.type!,
        name: newModel.name!,
        apiKey: newModel.apiKey!,
        isSelected: models.length === 0, // Автоматически выбираем первую модель
        lastUsed: new Date().toISOString()
      };

      console.log("Created new AI model object:", model);
      
      const updatedModels = [...models, model];
      setModels(updatedModels);
      saveAIModels(updatedModels);
      
      console.log("AI model added successfully:", model);
      
      setIsOpen(false);
      toast({
        title: "Успешно",
        description: "AI модель успешно добавлена",
      });
    } catch (error) {
      console.error("Ошибка при добавлении AI модели:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить AI модель",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (modelId: string) => {
    const updatedModels = models.map(model => ({
      ...model,
      isSelected: model.id === modelId
    }));
    
    setModels(updatedModels);
    saveAIModels(updatedModels);

    // Save the selected model separately for better persistence
    localStorage.setItem('last_selected_ai_model', JSON.stringify({
      modelId,
      timestamp: Date.now()
    }));

    const selectedModel = models.find(model => model.id === modelId);
    if (selectedModel && onModelSelect) {
      onModelSelect({
        id: selectedModel.id,
        apiKey: selectedModel.apiKey,
        type: selectedModel.type
      });
    }
  };

  const handleDeleteModel = (modelId: string) => {
    const modelToDelete = models.find(model => model.id === modelId);
    if (!modelToDelete) return;

    const updatedModels = models.filter(model => model.id !== modelId);
    
    // Если удаляем выбранную модель, выбираем первую из оставшихся
    if (modelToDelete.isSelected && updatedModels.length > 0) {
      updatedModels[0].isSelected = true;
      
      // Сохраняем новую выбранную модель
      localStorage.setItem('last_selected_ai_model', JSON.stringify({
        modelId: updatedModels[0].id,
        timestamp: Date.now()
      }));
    }
    
    setModels(updatedModels);
    saveAIModels(updatedModels);
    
    toast({
      title: "Модель удалена",
      description: `Модель "${modelToDelete.name}" была успешно удалена`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h2 className="text-xl font-semibold">AI модели</h2>
          
          {/* Model count indicator */}
          <Badge variant="outline" className="flex items-center gap-1.5 ml-2 bg-purple-950/30 text-purple-400 border-purple-800">
            <span>{models.length}/{modelLimit}</span>
          </Badge>
        </div>
        <AddAIModelDialog
          isOpen={isOpen}
          isLoading={isLoading}
          onOpenChange={setIsOpen}
          onAddModel={handleAddModel}
          modelCount={models.length}
          modelLimit={modelLimit}
        />
      </div>

      {models.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">У вас пока нет добавленных AI моделей</p>
            {modelLimit > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Ваш текущий тариф позволяет добавить до {modelLimit} {modelLimit === 1 ? 'AI модели' : modelLimit < 5 ? 'AI модели' : 'AI моделей'}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <AIModelCard
              key={model.id}
              model={model}
              onToggleSelection={handleToggleSelection}
              onDelete={handleDeleteModel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

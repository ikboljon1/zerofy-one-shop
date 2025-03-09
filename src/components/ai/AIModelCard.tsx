
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIModel } from "@/types/store";
import { Bot, Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface AIModelCardProps {
  model: AIModel;
  onToggleSelection: (modelId: string) => void;
  onDelete: (modelId: string) => void;
}

export const AIModelCard = ({ model, onToggleSelection, onDelete }: AIModelCardProps) => {
  const [showDelete, setShowDelete] = useState(false);
  
  const getModelIconColor = (type: string): string => {
    switch (type) {
      case "OpenAI":
        return "text-green-500";
      case "Gemini":
        return "text-blue-500";
      case "Anthropic":
        return "text-purple-500";
      case "Mistral":
        return "text-indigo-500";
      case "Llama":
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  };
  
  const getModelBadgeVariant = (type: string): string => {
    switch (type) {
      case "OpenAI":
        return "bg-green-950/20 text-green-400 border-green-900";
      case "Gemini":
        return "bg-blue-950/20 text-blue-400 border-blue-900";
      case "Anthropic":
        return "bg-purple-950/20 text-purple-400 border-purple-900";
      case "Mistral":
        return "bg-indigo-950/20 text-indigo-400 border-indigo-900";
      case "Llama":
        return "bg-amber-950/20 text-amber-400 border-amber-900";
      default:
        return "bg-gray-950/20 text-gray-400 border-gray-900";
    }
  };

  const handleSelectClick = () => {
    onToggleSelection(model.id);
  };

  const handleDeleteClick = () => {
    onDelete(model.id);
  };

  return (
    <Card
      className={cn(
        "relative transition-all duration-200 border",
        model.isSelected
          ? "border-primary shadow-md"
          : "border-border hover:border-primary/30"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Bot className={cn("h-5 w-5 mr-2", getModelIconColor(model.type))} />
            <CardTitle className="text-base font-medium">{model.name}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn("px-2 py-0 h-5 text-xs", getModelBadgeVariant(model.type))}
          >
            {model.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">API ключ:</span>
            <span className="text-sm font-mono">
              {model.apiKey.substring(0, 4)}...{model.apiKey.substring(model.apiKey.length - 4)}
            </span>
          </div>
          {model.lastUsed && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Последнее использование:</span>
              <span className="text-sm">
                {formatDistanceToNow(new Date(model.lastUsed), {
                  addSuffix: true,
                  locale: ru
                })}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            {!showDelete ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить</span>
                </Button>
                
                <Button
                  size="sm"
                  variant={model.isSelected ? "default" : "outline"}
                  className={cn(
                    model.isSelected && "pointer-events-none"
                  )}
                  onClick={handleSelectClick}
                >
                  {model.isSelected && <Check className="h-4 w-4 mr-1" />}
                  {model.isSelected ? "Выбрана" : "Выбрать"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDelete(false)}
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteClick}
                >
                  Удалить
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

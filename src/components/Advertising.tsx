import { useState, useEffect } from "react";
import { Store } from "@/types/store";
import { loadStores } from "@/utils/storeUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AdvertisingProps {
  selectedStore?: Store | null;
}

const Advertising = ({ selectedStore }: AdvertisingProps) => {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [budget, setBudget] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (selectedStore) {
      setCurrentStore(selectedStore);
    } else {
      const stores = loadStores();
      const selected = stores.find(s => s.isSelected);
      if (selected) {
        setCurrentStore(selected);
      }
    }
  }, [selectedStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStore) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин для создания рекламной кампании",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically make an API call to create the campaign
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: "Успех",
        description: "Рекламная кампания успешно создана",
      });
      
      // Reset form
      setBudget("");
      setCampaignName("");
      setTargetAudience("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать рекламную кампанию",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentStore) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Выберите магазин в разделе "Магазины" для управления рекламой
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Создание рекламной кампании</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Название кампании</Label>
            <Input
              id="campaignName"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Введите название кампании"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Бюджет (₽)</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Введите бюджет"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Целевая аудитория</Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Опишите целевую аудиторию"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              "Создать кампанию"
            )}
          </Button>
        </form>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Активные кампании</h2>
        <p className="text-muted-foreground">
          В данный момент активных рекламных кампаний нет
        </p>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Статистика рекламы</h2>
        <p className="text-muted-foreground">
          Статистика будет доступна после запуска рекламных кампаний
        </p>
      </Card>
    </div>
  );
};

export default Advertising;

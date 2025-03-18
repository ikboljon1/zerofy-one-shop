
import { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  PenSquare, 
  Trash2, 
  Check, 
  X, 
  CreditCard,
  BadgePercent,
  Store
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tariff, initialTariffs } from "@/data/tariffs";

interface TariffFormData {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
  storeLimit: number;
}

const TariffManagement = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<TariffFormData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const { toast } = useToast();

  // Загрузка тарифов из данных
  useEffect(() => {
    setTariffs(initialTariffs);
  }, []);

  const handleEditTariff = (tariff: Tariff) => {
    setSelectedTariff({ 
      ...tariff, 
      billingPeriod: tariff.period === 'monthly' ? 'месяц' : 'год' 
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteTariff = (tariff: Tariff) => {
    setSelectedTariff({ 
      ...tariff, 
      billingPeriod: tariff.period === 'monthly' ? 'месяц' : 'год' 
    });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTariff = () => {
    if (selectedTariff) {
      setTariffs(tariffs.filter((tariff) => tariff.id !== selectedTariff.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Тариф удален",
        description: `Тариф "${selectedTariff.name}" был успешно удален.`,
      });
    }
  };

  const saveTariffChanges = () => {
    if (selectedTariff) {
      const updatedTariff: Tariff = {
        id: selectedTariff.id,
        name: selectedTariff.name,
        price: selectedTariff.price,
        period: selectedTariff.billingPeriod === 'месяц' ? 'monthly' : 'yearly',
        description: selectedTariff.id === '1' 
          ? 'Идеально для начинающих продавцов' 
          : selectedTariff.id === '2' 
            ? 'Для растущих магазинов' 
            : 'Комплексное решение для крупных продавцов',
        features: selectedTariff.features,
        isPopular: selectedTariff.isPopular,
        isActive: true,
        storeLimit: selectedTariff.storeLimit
      };

      setTariffs(
        tariffs.map((tariff) => (tariff.id === selectedTariff.id ? updatedTariff : tariff))
      );
      setIsEditDialogOpen(false);
      toast({
        title: "Изменения сохранены",
        description: "Данные тарифа были успешно обновлены.",
      });
    }
  };

  const addNewTariff = () => {
    if (selectedTariff) {
      const newTariff: Tariff = {
        id: Date.now().toString(),
        name: selectedTariff.name,
        price: selectedTariff.price,
        period: selectedTariff.billingPeriod === 'месяц' ? 'monthly' : 'yearly',
        description: 'Новый тарифный план',
        features: selectedTariff.features,
        isPopular: selectedTariff.isPopular,
        isActive: true,
        storeLimit: selectedTariff.storeLimit || 1
      };
      
      setTariffs([...tariffs, newTariff]);
      setIsAddDialogOpen(false);
      toast({
        title: "Тариф добавлен",
        description: `Тариф "${newTariff.name}" был успешно добавлен.`,
      });
    }
  };

  const startAddingTariff = () => {
    setSelectedTariff({
      id: "",
      name: "",
      price: 0,
      billingPeriod: "месяц",
      features: [],
      isPopular: false,
      storeLimit: 1
    });
    setIsAddDialogOpen(true);
  };

  const addFeature = () => {
    if (selectedTariff && newFeature.trim()) {
      setSelectedTariff({
        ...selectedTariff,
        features: [...selectedTariff.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    if (selectedTariff) {
      const updatedFeatures = [...selectedTariff.features];
      updatedFeatures.splice(index, 1);
      setSelectedTariff({
        ...selectedTariff,
        features: updatedFeatures,
      });
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const getStoreLimitText = (limit: number): string => {
    if (limit === 999) return "Неограниченно";
    return `${limit} ${limit === 1 ? 'магазин' : limit < 5 ? 'магазина' : 'магазинов'}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BadgePercent className="h-5 w-5" />
              Управление тарифами
            </h2>
            <Button onClick={startAddingTariff}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить тариф
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {tariffs.map((tariff) => (
              <Card key={tariff.id} className={`border-2 ${tariff.isPopular ? 'border-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{tariff.name}</h3>
                    {tariff.isPopular && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                        Популярный
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{formatPrice(tariff.price)} ₽</span>
                    <span className="text-sm text-muted-foreground">/{tariff.period === 'monthly' ? 'месяц' : 'год'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <Store className="h-4 w-4" />
                    <span>{getStoreLimitText(tariff.storeLimit)}</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {tariff.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex gap-2 justify-end mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditTariff(tariff)}
                    >
                      <PenSquare className="h-4 w-4 mr-1" />
                      Изменить
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteTariff(tariff)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Удалить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Tariff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать тариф</DialogTitle>
            <DialogDescription>
              Внесите изменения в данные тарифа
            </DialogDescription>
          </DialogHeader>
          {selectedTariff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm">
                  Название
                </label>
                <Input
                  id="name"
                  value={selectedTariff.name}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="price" className="text-right text-sm">
                  Цена (₽)
                </label>
                <Input
                  id="price"
                  type="number"
                  value={selectedTariff.price}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, price: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="storeLimit" className="text-right text-sm">
                  Лимит магазинов
                </label>
                <Input
                  id="storeLimit"
                  type="number"
                  min="1"
                  max="999"
                  value={selectedTariff.storeLimit}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, storeLimit: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="billingPeriod" className="text-right text-sm">
                  Период
                </label>
                <select
                  id="billingPeriod"
                  value={selectedTariff.billingPeriod}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, billingPeriod: e.target.value })
                  }
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="день">день</option>
                  <option value="неделя">неделя</option>
                  <option value="месяц">месяц</option>
                  <option value="год">год</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="isPopular" className="text-right text-sm">
                  Популярный
                </label>
                <div className="col-span-3 flex items-center">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={selectedTariff.isPopular}
                    onChange={(e) =>
                      setSelectedTariff({ ...selectedTariff, isPopular: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPopular" className="ml-2 text-sm">
                    Пометить как популярный тариф
                  </label>
                </div>
              </div>
              
              <div className="mt-2">
                <label className="text-sm font-medium mb-2 block">
                  Функции тарифа
                </label>
                <div className="space-y-2">
                  {selectedTariff.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} readOnly className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Добавить функцию..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addFeature} disabled={!newFeature.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveTariffChanges}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tariff Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить тариф</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить тариф?
            </DialogDescription>
          </DialogHeader>
          {selectedTariff && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center gap-3 p-4 border rounded-lg bg-muted/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{selectedTariff.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedTariff.price)} ₽/{selectedTariff.billingPeriod}
                  </p>
                </div>
              </div>
              <p className="text-center text-muted-foreground">
                Это действие нельзя отменить. Тариф будет удален навсегда.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTariff}>
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tariff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить тариф</DialogTitle>
            <DialogDescription>
              Введите данные нового тарифа
            </DialogDescription>
          </DialogHeader>
          {selectedTariff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-name" className="text-right text-sm">
                  Название
                </label>
                <Input
                  id="new-name"
                  value={selectedTariff.name}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-price" className="text-right text-sm">
                  Цена (₽)
                </label>
                <Input
                  id="new-price"
                  type="number"
                  value={selectedTariff.price}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, price: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-storeLimit" className="text-right text-sm">
                  Лимит магазинов
                </label>
                <Input
                  id="new-storeLimit"
                  type="number"
                  min="1"
                  max="999"
                  value={selectedTariff.storeLimit}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, storeLimit: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-billingPeriod" className="text-right text-sm">
                  Период
                </label>
                <select
                  id="new-billingPeriod"
                  value={selectedTariff.billingPeriod}
                  onChange={(e) =>
                    setSelectedTariff({ ...selectedTariff, billingPeriod: e.target.value })
                  }
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="день">день</option>
                  <option value="неделя">неделя</option>
                  <option value="месяц">месяц</option>
                  <option value="год">год</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-isPopular" className="text-right text-sm">
                  Популярный
                </label>
                <div className="col-span-3 flex items-center">
                  <input
                    type="checkbox"
                    id="new-isPopular"
                    checked={selectedTariff.isPopular}
                    onChange={(e) =>
                      setSelectedTariff({ ...selectedTariff, isPopular: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="new-isPopular" className="ml-2 text-sm">
                    Пометить как популярный тариф
                  </label>
                </div>
              </div>
              
              <div className="mt-2">
                <label className="text-sm font-medium mb-2 block">
                  Функции тарифа
                </label>
                <div className="space-y-2">
                  {selectedTariff.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} readOnly className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Добавить функцию..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addFeature} disabled={!newFeature.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button onClick={addNewTariff}>
              <Check className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TariffManagement;

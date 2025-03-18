
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tariff } from "@/data/tariffs";
import { fetchTariffs, updateTariff } from "@/services/tariffService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TariffManagement = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editableTariff, setEditableTariff] = useState<Tariff | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTariffs();
  }, []);

  const loadTariffs = async () => {
    setIsLoading(true);
    try {
      const loadedTariffs = await fetchTariffs();
      setTariffs(loadedTariffs);
    } catch (error) {
      console.error("Ошибка при загрузке тарифов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список тарифов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTariff = (tariff: Tariff) => {
    setEditableTariff({...tariff});
  };

  const handleInputChange = (field: keyof Tariff, value: string | number | boolean) => {
    if (editableTariff) {
      setEditableTariff({
        ...editableTariff,
        [field]: value
      });
    }
  };

  const handleSave = async () => {
    if (!editableTariff) return;
    
    try {
      await updateTariff(editableTariff.id, editableTariff);
      
      // Обновляем список тарифов
      setTariffs(prev => 
        prev.map(tariff => 
          tariff.id === editableTariff.id ? editableTariff : tariff
        )
      );
      
      // Сбрасываем редактируемый тариф
      setEditableTariff(null);
      
      toast({
        title: "Изменения сохранены",
        description: "Данные тарифа были успешно обновлены.",
      });
    } catch (error) {
      console.error("Ошибка при сохранении тарифа:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения тарифа",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditableTariff(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление тарифами</CardTitle>
        <CardDescription>Настройте тарифные планы для пользователей</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tariffList">
          <TabsList className="mb-4">
            <TabsTrigger value="tariffList">Список тарифов</TabsTrigger>
            {editableTariff && <TabsTrigger value="editTariff">Редактирование тарифа</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="tariffList">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Цена</TableHead>
                      <TableHead>Лимит магазинов</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tariffs.map((tariff) => (
                      <TableRow key={tariff.id}>
                        <TableCell>{tariff.id}</TableCell>
                        <TableCell className="font-medium">{tariff.name}</TableCell>
                        <TableCell>{tariff.price} ₽/{tariff.period === 'monthly' ? 'мес' : 'год'}</TableCell>
                        <TableCell>{tariff.storeLimit}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${tariff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {tariff.isActive ? 'Активен' : 'Неактивен'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTariff(tariff)}
                          >
                            Изменить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="editTariff">
            {editableTariff && (
              <div className="space-y-4 border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Название тарифа</Label>
                    <Input
                      id="name"
                      value={editableTariff.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Цена</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editableTariff.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="period">Период</Label>
                    <select
                      id="period"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={editableTariff.period}
                      onChange={(e) => handleInputChange('period', e.target.value as 'monthly' | 'yearly')}
                    >
                      <option value="monthly">Ежемесячно</option>
                      <option value="yearly">Ежегодно</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="storeLimit">Лимит магазинов</Label>
                    <Input
                      id="storeLimit"
                      type="number"
                      min="1"
                      value={editableTariff.storeLimit}
                      onChange={(e) => handleInputChange('storeLimit', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="isActive">Статус</Label>
                    <select
                      id="isActive"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={editableTariff.isActive ? 'true' : 'false'}
                      onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                    >
                      <option value="true">Активен</option>
                      <option value="false">Неактивен</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="isPopular">Популярный</Label>
                    <select
                      id="isPopular"
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={editableTariff.isPopular ? 'true' : 'false'}
                      onChange={(e) => handleInputChange('isPopular', e.target.value === 'true')}
                    >
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={editableTariff.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave}>
                    Сохранить
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TariffManagement;

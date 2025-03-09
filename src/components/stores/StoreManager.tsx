
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Store, Edit, Trash, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Store {
  id: string;
  name: string;
  marketplace: string;
  apiKey: string;
  createdAt: string;
  isSelected?: boolean;
}

interface StoreManagerProps {
  onStoreSelect?: (store: Store | null) => void;
}

const StoreManager = ({ onStoreSelect }: StoreManagerProps) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isAddStoreDialogOpen, setIsAddStoreDialogOpen] = useState(false);
  const [isEditStoreDialogOpen, setIsEditStoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState<Partial<Store>>({
    name: "",
    marketplace: "wildberries",
    apiKey: "",
  });
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Получаем ID текущего пользователя из localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      } catch (error) {
        console.error('Ошибка при парсинге данных пользователя:', error);
      }
    }
  }, []);

  // Загружаем магазины для текущего пользователя
  useEffect(() => {
    if (userId) {
      loadStores();
    }
  }, [userId]);

  const getStoreStorageKey = () => {
    if (!userId) return null;
    return `marketplace_stores_${userId}`;
  };

  const loadStores = () => {
    const storageKey = getStoreStorageKey();
    if (!storageKey) return;

    const savedStores = localStorage.getItem(storageKey);
    if (savedStores) {
      try {
        const parsedStores = JSON.parse(savedStores);
        setStores(parsedStores);
        
        // Если есть выбранный магазин, уведомляем родительский компонент
        const selectedStore = parsedStores.find((store: Store) => store.isSelected);
        if (selectedStore && onStoreSelect) {
          onStoreSelect(selectedStore);
        }
      } catch (error) {
        console.error('Ошибка при загрузке магазинов:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список магазинов",
          variant: "destructive",
        });
      }
    }
  };

  const saveStores = (updatedStores: Store[]) => {
    const storageKey = getStoreStorageKey();
    if (!storageKey) return;
    
    localStorage.setItem(storageKey, JSON.stringify(updatedStores));
    setStores(updatedStores);
  };

  const handleAddStore = () => {
    if (!newStore.name || !newStore.apiKey) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const storageKey = getStoreStorageKey();
    if (!storageKey) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }

    const newStoreData: Store = {
      id: Date.now().toString(),
      name: newStore.name || "",
      marketplace: newStore.marketplace || "wildberries",
      apiKey: newStore.apiKey || "",
      createdAt: new Date().toISOString(),
      isSelected: stores.length === 0 // Делаем первый магазин выбранным по умолчанию
    };

    const updatedStores = [...stores, newStoreData];
    saveStores(updatedStores);

    // Если это первый магазин, уведомляем родительский компонент
    if (stores.length === 0 && onStoreSelect) {
      onStoreSelect(newStoreData);
    }

    setNewStore({
      name: "",
      marketplace: "wildberries",
      apiKey: "",
    });
    setIsAddStoreDialogOpen(false);

    toast({
      title: "Успех",
      description: "Магазин успешно добавлен",
    });
  };

  const handleEditStore = () => {
    if (!editingStore || !editingStore.name || !editingStore.apiKey) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const updatedStores = stores.map(store => 
      store.id === editingStore.id ? editingStore : store
    );
    
    saveStores(updatedStores);
    setIsEditStoreDialogOpen(false);

    // Если редактируемый магазин выбран, обновляем выбранный магазин
    if (editingStore.isSelected && onStoreSelect) {
      onStoreSelect(editingStore);
    }

    toast({
      title: "Успех",
      description: "Информация о магазине обновлена",
    });
  };

  const openEditDialog = (store: Store) => {
    setEditingStore({...store});
    setIsEditStoreDialogOpen(true);
  };

  const openDeleteDialog = (storeId: string) => {
    setDeletingStoreId(storeId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteStore = () => {
    if (!deletingStoreId) return;

    const storeToDelete = stores.find(store => store.id === deletingStoreId);
    const wasSelected = storeToDelete?.isSelected;
    
    const updatedStores = stores.filter(store => store.id !== deletingStoreId);
    
    // Если был удален выбранный магазин и остались другие магазины, выбираем первый из оставшихся
    if (wasSelected && updatedStores.length > 0) {
      updatedStores[0].isSelected = true;
      if (onStoreSelect) {
        onStoreSelect(updatedStores[0]);
      }
    } else if (wasSelected && updatedStores.length === 0 && onStoreSelect) {
      // Если был удален последний магазин, уведомляем об этом родительский компонент
      onStoreSelect(null);
    }
    
    saveStores(updatedStores);
    setIsDeleteDialogOpen(false);
    setDeletingStoreId(null);

    toast({
      title: "Успех",
      description: "Магазин успешно удален",
    });
  };

  const handleSelectStore = (storeId: string) => {
    const updatedStores = stores.map(store => ({
      ...store,
      isSelected: store.id === storeId
    }));
    
    saveStores(updatedStores);
    
    const selectedStore = updatedStores.find(store => store.id === storeId);
    if (selectedStore && onStoreSelect) {
      onStoreSelect(selectedStore);
    }

    toast({
      title: "Информация",
      description: `Выбран магазин "${selectedStore?.name}"`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Мои магазины</h2>
        <Button onClick={() => setIsAddStoreDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить магазин
        </Button>
      </div>

      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Card 
              key={store.id} 
              className={`cursor-pointer transition-all duration-200 ${
                store.isSelected 
                  ? 'border-primary/70 dark:border-primary/70 shadow-md bg-primary-foreground dark:bg-primary-foreground/10' 
                  : 'hover:border-primary/40 hover:shadow-sm'
              }`}
              onClick={() => handleSelectStore(store.id)}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {store.isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                    <span>{store.name}</span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    {store.marketplace === 'wildberries' ? 'Wildberries' : store.marketplace}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(store);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(store.id);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>API ключ:</span>
                    <span className="font-mono truncate max-w-[150px]">
                      {store.apiKey.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mt-1">
                    <span>Создан:</span>
                    <span>{format(new Date(store.createdAt), 'dd.MM.yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">У вас пока нет магазинов</h3>
          <p className="text-muted-foreground text-center mb-4">
            Добавьте свой первый магазин для начала работы
          </p>
          <Button onClick={() => setIsAddStoreDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Добавить магазин
          </Button>
        </div>
      )}

      {/* Диалог добавления магазина */}
      <Dialog open={isAddStoreDialogOpen} onOpenChange={setIsAddStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый магазин</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название магазина</Label>
              <Input
                id="name"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                placeholder="Мой магазин"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace">Маркетплейс</Label>
              <Select
                value={newStore.marketplace}
                onValueChange={(value) => setNewStore({ ...newStore, marketplace: value })}
              >
                <SelectTrigger id="marketplace">
                  <SelectValue placeholder="Выберите маркетплейс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wildberries">Wildberries</SelectItem>
                  <SelectItem value="ozon" disabled>Ozon (скоро)</SelectItem>
                  <SelectItem value="yandex" disabled>Яндекс Маркет (скоро)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API ключ</Label>
              <Input
                id="apiKey"
                value={newStore.apiKey}
                onChange={(e) => setNewStore({ ...newStore, apiKey: e.target.value })}
                placeholder="Введите API ключ"
              />
              <p className="text-xs text-muted-foreground">
                Ключ API используется для получения данных о вашем магазине
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStoreDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddStore}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования магазина */}
      <Dialog open={isEditStoreDialogOpen} onOpenChange={setIsEditStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать магазин</DialogTitle>
          </DialogHeader>
          {editingStore && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название магазина</Label>
                <Input
                  id="edit-name"
                  value={editingStore.name}
                  onChange={(e) => 
                    setEditingStore({ ...editingStore, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-marketplace">Маркетплейс</Label>
                <Select
                  value={editingStore.marketplace}
                  onValueChange={(value) => 
                    setEditingStore({ ...editingStore, marketplace: value })
                  }
                >
                  <SelectTrigger id="edit-marketplace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wildberries">Wildberries</SelectItem>
                    <SelectItem value="ozon" disabled>Ozon (скоро)</SelectItem>
                    <SelectItem value="yandex" disabled>Яндекс Маркет (скоро)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apiKey">API ключ</Label>
                <Input
                  id="edit-apiKey"
                  value={editingStore.apiKey}
                  onChange={(e) => 
                    setEditingStore({ ...editingStore, apiKey: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStoreDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditStore}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления магазина */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить магазин</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Вы уверены, что хотите удалить этот магазин? Это действие нельзя отменить.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteStore}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreManager;

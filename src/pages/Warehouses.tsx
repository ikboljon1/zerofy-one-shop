
import { useEffect, useState } from "react";
import { Box, PackageOpen, PackageCheck, Package2, TruckIcon } from "lucide-react";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import WarehouseMap from "@/components/WarehouseMap";
import { getSelectedStore } from "@/utils/storeUtils";
import StorageProfitabilityAnalysis from "@/components/supplies/StorageProfitabilityAnalysis";
import WarehouseCoefficientsTable from "@/components/supplies/WarehouseCoefficientsTable";
import WarehouseRemains from "@/components/supplies/WarehouseRemains";
import SupplyForm from "@/components/supplies/SupplyForm";
import { 
  fetchWarehouses, 
  fetchAcceptanceCoefficients, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses,
  togglePreferredWarehouse
} from "@/services/suppliesApi";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { PaidStorageItem, Warehouse, WarehouseCoefficient } from "@/types/supplies";
import { useToast } from "@/hooks/use-toast";
import { Store } from "@/types/store";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [acceptanceCoefficients, setAcceptanceCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [paidStorageItems, setPaidStorageItems] = useState<PaidStorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState("map");
  const { toast } = useToast();

  // Получаем выбранный магазин
  useEffect(() => {
    const store = getSelectedStore();
    if (store) {
      setSelectedStore({
        id: store.id,
        apiKey: store.apiKey,
        name: store.name || "Магазин",
        marketplace: store.marketplace || "Wildberries"
      });
      fetchWarehousesData(store.apiKey);
    }
  }, []);

  // Загрузка данных о складах
  const fetchWarehousesData = async (apiKey: string) => {
    setIsLoading(true);
    try {
      // Получаем данные о складах
      const warehousesData = await fetchWarehouses(apiKey);
      setWarehouses(warehousesData);

      // Получаем коэффициенты приемки
      const coefficientsData = await fetchAcceptanceCoefficients(apiKey);
      setAcceptanceCoefficients(coefficientsData);
      
      // Получаем данные о платном хранении за последние 7 дней
      const dateFrom = format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss", { locale: ru });
      const dateTo = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss", { locale: ru });
      
      const storageData = await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
      setPaidStorageItems(storageData);
      
      toast({
        title: "Данные загружены",
        description: `Загружено ${warehousesData.length} складов и ${coefficientsData.length} коэффициентов`,
      });
    } catch (error) {
      console.error("Error fetching warehouses data:", error);
      
      // Устанавливаем тестовые данные в случае ошибки
      const mockWarehouses: Warehouse[] = Array(5).fill(null).map((_, index) => ({
        ID: 1000 + index,
        name: `Склад ${index + 1}`,
        address: `г. Москва, ул. Складская, д. ${index + 1}`,
        workTime: "09:00-18:00",
        acceptsQR: true,
        geoPoint: {
          lat: 55.7 + (Math.random() * 0.5),
          lon: 37.6 + (Math.random() * 0.5)
        },
        isWB: true,
        isWithinFitCargo: index % 2 === 0,
        isBoxOnly: false,
      }));
      
      const mockCoefficients: WarehouseCoefficient[] = Array(5).fill(null).map((_, index) => ({
        warehouseID: 1000 + index,
        warehouseName: `Склад ${index + 1}`,
        allowUnload: true,
        boxTypeName: "Короб",
        boxTypeID: 1,
        date: new Date().toISOString().split('T')[0],
        coefficient: 1 + (index % 3) / 10,
        storageCoef: "1.0",
        deliveryCoef: "1.0",
        deliveryBaseLiter: "10.0",
        deliveryAdditionalLiter: "5.0",
        storageBaseLiter: "8.0",
        storageAdditionalLiter: "4.0",
        isSortingCenter: false
      }));
      
      setWarehouses(mockWarehouses);
      setAcceptanceCoefficients(mockCoefficients);
      
      const mockStorageData: PaidStorageItem[] = Array(10).fill(null).map((_, index) => ({
        date: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logWarehouseCoef: 1,
        officeId: 500 + (index % 3),
        warehouse: ['Коледино', 'Подольск', 'Электросталь'][index % 3],
        warehouseCoef: 1.5 + (index % 5) / 10,
        giId: 100000 + index,
        chrtId: 200000 + index,
        size: ['S', 'M', 'L', 'XL', 'XXL'][index % 5],
        barcode: `2000000${index}`,
        subject: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессуары'][index % 5],
        brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'][index % 5],
        vendorCode: `A${1000 + index}`,
        nmId: 300000 + index,
        volume: 0.5 + (index % 10) / 10,
        calcType: 'короба: без габаритов',
        warehousePrice: 5 + (index % 20),
        barcodesCount: 1 + (index % 5),
        palletPlaceCode: 0,
        palletCount: 0,
        originalDate: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        loyaltyDiscount: index % 3 === 0 ? (2 + index % 5) : 0,
        tariffFixDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tariffLowerDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      
      setPaidStorageItems(mockStorageData);
      
      toast({
        title: "Ошибка при загрузке данных",
        description: "Используются тестовые данные",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Склады</h1>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="map">
            <Box className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline-block">Карта складов</span>
            <span className="sm:hidden">Карта</span>
          </TabsTrigger>
          <TabsTrigger value="coefficients">
            <Package2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline-block">Коэффициенты</span>
            <span className="sm:hidden">Коэф.</span>
          </TabsTrigger>
          <TabsTrigger value="storage">
            <PackageOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline-block">Хранение</span>
            <span className="sm:hidden">Хранение</span>
          </TabsTrigger>
          <TabsTrigger value="supply">
            <PackageCheck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline-block">Поставки</span>
            <span className="sm:hidden">Поставки</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Карта складов Wildberries</CardTitle>
              <CardDescription>
                Географическое расположение складов и информация о них
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseMap 
                warehouses={warehouses} 
                coefficients={acceptanceCoefficients}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="coefficients">
          <WarehouseCoefficientsTable 
            coefficients={acceptanceCoefficients}
          />
        </TabsContent>
        
        <TabsContent value="storage">
          <StorageProfitabilityAnalysis selectedStore={selectedStore} />
        </TabsContent>
        
        <TabsContent value="supply">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <SupplyForm warehouses={warehouses} />
            </div>
            <div>
              <WarehouseRemains 
                data={[]} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Warehouses;

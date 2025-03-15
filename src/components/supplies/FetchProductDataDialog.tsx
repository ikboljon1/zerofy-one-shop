
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { fetchProductDataByNmId } from "@/services/suppliesApi";
import { Store } from "@/types/store";

interface FetchProductDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataFetched: (data: {
    nmId: number;
    averageStorageCost: number;
    averageDailySales: number;
    brand: string;
    vendorCode: string;
    subject: string;
    sa_name: string;
  }) => void;
  selectedStore: Store | null;
}

const FetchProductDataDialog = ({
  open,
  onOpenChange,
  onDataFetched,
  selectedStore
}: FetchProductDataDialogProps) => {
  const [nmId, setNmId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    // Default to 7 days ago
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    // Default to today
    return new Date().toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchData = async () => {
    if (!nmId || !dateFrom || !dateTo) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStore?.apiKey) {
      toast({
        title: "Ошибка",
        description: "API ключ магазина не найден",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert dates to ISO format for storage API
      const dateFromISO = `${dateFrom}T00:00:00`;
      const dateToISO = `${dateTo}T23:59:59`;
      
      const productData = await fetchProductDataByNmId(
        selectedStore.apiKey,
        Number(nmId),
        dateFromISO,
        dateToISO
      );
      
      if (!productData.storageData && !productData.salesData) {
        toast({
          title: "Данные не найдены",
          description: "Не удалось получить данные о хранении и продажах для этого nmId",
          variant: "destructive",
        });
        return;
      }
      
      const data = {
        nmId: Number(nmId),
        averageStorageCost: productData.storageData?.averageStorageCost || 0,
        averageDailySales: productData.salesData?.averageDailySales || 0,
        brand: productData.storageData?.brand || "",
        vendorCode: productData.storageData?.vendorCode || "",
        subject: productData.storageData?.subject || "",
        sa_name: productData.salesData?.sa_name || ""
      };
      
      onDataFetched(data);
      onOpenChange(false);
      
      toast({
        title: "Успешно",
        description: "Данные успешно получены",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные. Проверьте консоль для подробностей.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Получить данные по nmId</DialogTitle>
          <DialogDescription>
            Введите nmId товара и выберите период для получения данных о среднем хранении и продажах.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nmId" className="text-right">
              nmId
            </Label>
            <Input
              id="nmId"
              type="number"
              value={nmId}
              onChange={(e) => setNmId(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateFrom" className="text-right">
              Дата с
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateTo" className="text-right">
              Дата по
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleFetchData} disabled={isLoading || !selectedStore}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Получить данные"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FetchProductDataDialog;

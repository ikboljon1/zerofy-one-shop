import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, RefreshCw, Info, Package, Trophy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Store } from "@/types/store";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BestSellerFilter } from "@/components/supplies";

interface Product {
  nmID?: number;
  nmId?: number;
  vendorCode: string;
  brand: string;
  title: string;
  price?: number;
  discountedPrice?: number;
  quantity?: number;
  subject?: string;
  photos?: Array<{
    big: string;
    c246x328: string;
  }>;
  // Доп. поля для фильтрации
  salesCount?: number;
  margin?: number;
}

interface ProductsListProps {
  selectedStore?: Store | null;
}

type SortField = 'title' | 'price' | 'quantity' | 'salesCount' | 'margin';
type SortDirection = 'asc' | 'desc';
type FilterOption = 'all' | 'bestsellers' | 'high-margin' | 'low-stock';

const ProductsList: React.FC<ProductsListProps> = ({ selectedStore }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');

  // Load products from localStorage or database
  useEffect(() => {
    if (!selectedStore) return;
    
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Try to get from localStorage first
        const storedProducts = localStorage.getItem(`products_${selectedStore.id}`);
        
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          // Add demo data for sales and margin for filtering purposes
          const productsWithSalesData = parsedProducts.map((product: Product) => ({
            ...product,
            // Generate random sales data for demo
            salesCount: Math.floor(Math.random() * 100),
            margin: Math.floor(Math.random() * 40) + 5, // 5-45% margin
          }));
          setProducts(productsWithSalesData);
          setFilteredProducts(productsWithSalesData);
        } else {
          // If not in localStorage, try to fetch from backend (not implemented here)
          console.log("No products found in localStorage");
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить товары",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [selectedStore, toast]);

  // Handle search
  useEffect(() => {
    if (!products.length) return;
    
    // Apply search filter
    let result = products;
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = products.filter(
        product => 
          (product.title && product.title.toLowerCase().includes(searchLower)) ||
          (product.vendorCode && product.vendorCode.toLowerCase().includes(searchLower)) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply category filter
    if (currentFilter !== 'all') {
      switch (currentFilter) {
        case 'bestsellers':
          result = result.filter(p => p.salesCount && p.salesCount > 30);
          break;
        case 'high-margin':
          result = result.filter(p => p.margin && p.margin > 25);
          break;
        case 'low-stock':
          result = result.filter(p => p.quantity !== undefined && p.quantity < 5 && p.quantity > 0);
          break;
      }
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      let aValue: any = a[sortField] ?? 0;
      let bValue: any = b[sortField] ?? 0;
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredProducts(result);
  }, [products, search, sortField, sortDirection, currentFilter]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground/50" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown className="h-4 w-4 ml-1 text-primary" /> 
      : <ArrowUpDown className="h-4 w-4 ml-1 text-primary rotate-180" />;
  };

  const handleFilterChange = (filter: FilterOption) => {
    setCurrentFilter(filter);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Список товаров</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`${isMobile ? '' : 'flex justify-between items-center'} gap-2 space-y-2 md:space-y-0`}>
            <div className={`${isMobile ? 'w-full' : 'w-1/3'} relative`}>
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className={`${isMobile ? 'w-full' : ''}`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
          
          <BestSellerFilter 
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Фото</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center">
                      Название {getSortIcon('title')}
                    </div>
                  </TableHead>
                  {!isMobile && <TableHead>Артикул</TableHead>}
                  {!isMobile && <TableHead>Бренд</TableHead>}
                  <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                    <div className="flex items-center">
                      Цена {getSortIcon('price')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center">
                      Остаток {getSortIcon('quantity')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('salesCount')}>
                    <div className="flex items-center">
                      Продажи {getSortIcon('salesCount')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('margin')}>
                    <div className="flex items-center">
                      Маржа {getSortIcon('margin')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {product.photos && product.photos.length > 0 ? (
                          <img 
                            src={product.photos[0].c246x328} 
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{product.title}</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>{product.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      {!isMobile && <TableCell>{product.vendorCode}</TableCell>}
                      {!isMobile && <TableCell>{product.brand}</TableCell>}
                      <TableCell>
                        {product.discountedPrice ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{product.discountedPrice} ₽</span>
                            <span className="text-xs text-muted-foreground line-through">{product.price} ₽</span>
                          </div>
                        ) : (
                          <span>{product.price ?? 'Н/Д'} ₽</span>
                        )}
                      </TableCell>
                      <TableCell>{product.quantity ?? 'Н/Д'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={product.salesCount && product.salesCount > 30 ? 'text-amber-500 font-medium' : ''}>
                            {product.salesCount ?? 'Н/Д'}
                          </span>
                          {product.salesCount && product.salesCount > 30 && (
                            <Trophy className="h-4 w-4 ml-1 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className={
                              product.margin && product.margin > 25 
                                ? 'text-green-500 font-medium' 
                                : (product.margin && product.margin < 10 ? 'text-red-500 font-medium' : '')
                            }
                          >
                            {product.margin ? `${product.margin}%` : 'Н/Д'}
                          </span>
                          {product.margin && product.margin > 25 && (
                            <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 5 : 7} className="h-24 text-center">
                      {isLoading ? (
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          <span>Загрузка товаров...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-10 w-10 mb-2" />
                          <span>Нет товаров для отображения</span>
                          <span className="text-sm">Попробуйте изменить фильтры или добавить товары</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsList;

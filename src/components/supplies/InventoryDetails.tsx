
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StocksByCategory, WildberriesStock } from '@/types/supplies';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, RefreshCw, ArrowDownLeft } from 'lucide-react';

interface InventoryDetailsProps {
  stocks: WildberriesStock[];
  categorySummary: StocksByCategory[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const InventoryDetails: React.FC<InventoryDetailsProps> = ({ 
  stocks, 
  categorySummary, 
  selectedCategory, 
  onSelectCategory 
}) => {
  // Filter stocks by selected category
  const filteredStocks = selectedCategory 
    ? stocks.filter(stock => stock.category === selectedCategory)
    : [];
  
  // Generate chart data for warehouse distribution of selected category
  const warehouseDistribution = filteredStocks.reduce((acc, stock) => {
    const existing = acc.find(item => item.name === stock.warehouseName);
    if (existing) {
      existing.value += stock.quantity;
    } else {
      acc.push({ name: stock.warehouseName, value: stock.quantity });
    }
    return acc;
  }, [] as { name: string; value: number }[]);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Инвентарь по категориям</CardTitle>
          <CardDescription>
            Общая информация о товарах на всех складах WB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Категория</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Стоимость (₽)</TableHead>
                <TableHead>Товар-лидер</TableHead>
                <TableHead>Ср. оборот</TableHead>
                <TableHead>Возвраты</TableHead>
                <TableHead>В пути</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorySummary.map((category, index) => (
                <TableRow 
                  key={index} 
                  className={`cursor-pointer hover:bg-accent ${selectedCategory === category.category ? 'bg-primary/5' : ''}`}
                  onClick={() => onSelectCategory(category.category)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {category.category}
                    </div>
                  </TableCell>
                  <TableCell>{category.totalItems.toLocaleString()}</TableCell>
                  <TableCell>{category.valueRub.toLocaleString()} ₽</TableCell>
                  <TableCell>{category.topSellingItem}</TableCell>
                  <TableCell>{category.averageTurnover}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.returns.toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.inTransit.toLocaleString()}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {categorySummary.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Нет данных об инвентаре
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedCategory && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Детали категории: {selectedCategory}</CardTitle>
              <CardDescription>
                Распределение товаров по складам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={warehouseDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Bar dataKey="value" name="Количество">
                      {warehouseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Товары категории {selectedCategory}</CardTitle>
              <CardDescription>
                Детальная информация по товарам в выбранной категории
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Склад</TableHead>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Размер</TableHead>
                    <TableHead>Цена (₽)</TableHead>
                    <TableHead>Доступно</TableHead>
                    <TableHead>В пути</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stock.supplierArticle}</TableCell>
                      <TableCell>{stock.subject}</TableCell>
                      <TableCell>{stock.warehouseName}</TableCell>
                      <TableCell>{stock.brand}</TableCell>
                      <TableCell>{stock.techSize === '0' ? 'Без размера' : stock.techSize}</TableCell>
                      <TableCell>
                        {stock.Discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-medium">{(stock.Price * (1 - stock.Discount / 100)).toFixed(0)} ₽</span>
                            <span className="text-xs text-muted-foreground line-through">{stock.Price} ₽</span>
                          </div>
                        ) : (
                          `${stock.Price} ₽`
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-primary" />
                          {stock.quantity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-1 text-amber-500" />
                          {stock.inWayToClient}
                          {stock.inWayFromClient > 0 && (
                            <div className="ml-2 flex items-center">
                              <ArrowDownLeft className="h-4 w-4 mr-1 text-red-500" />
                              {stock.inWayFromClient}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredStocks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Выберите категорию для просмотра товаров
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default InventoryDetails;

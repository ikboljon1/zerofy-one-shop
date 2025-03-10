
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WarehouseRemainItem } from '@/types/supplies';
import { PackageIcon, Search } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface WarehouseRemainsProps {
  data: WarehouseRemainItem[];
  isLoading: boolean;
}

const WarehouseRemains: React.FC<WarehouseRemainsProps> = ({ data, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => {
      if (!searchTerm.trim()) return true;
      
      // Safely check properties before using includes
      const brand = item.brand || '';
      const subject = item.subject || '';
      const supplierArticle = item.supplierArticle || '';
      const warehouseName = item.warehouseName || '';
      const barcode = item.barcode || '';
      
      return (
        brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PackageIcon className="mr-2 h-5 w-5" />
            Остатки на складах
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PackageIcon className="mr-2 h-5 w-5" />
          Остатки на складах
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по бренду, артикулу или наименованию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Бренд</TableHead>
                  <TableHead>Предмет</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Склад</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.supplierArticle || "—"}</TableCell>
                      <TableCell>{item.brand || "—"}</TableCell>
                      <TableCell>{item.subject || "—"}</TableCell>
                      <TableCell>{item.sa || "—"}</TableCell>
                      <TableCell>{item.warehouseName || "—"}</TableCell>
                      <TableCell className="text-right font-medium">{item.quantity || 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm ? (
                        "Нет товаров, соответствующих поисковому запросу"
                      ) : (
                        "Нет товаров на складах"
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

export default WarehouseRemains;

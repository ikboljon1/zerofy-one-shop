
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportDetail {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  create_dt: string;
  currency_name: string;
  suppliercontract_code: string | null;
  rrd_id: number;
  gi_id: number;
  subject_name: string;
  nm_id: number;
  brand_name: string;
  sa_name: string;
  ts_name: string;
  barcode: string;
  doc_type_name: string;
  quantity: number;
  retail_price: number;
  retail_amount: number;
  sale_percent: number;
  commission_percent: number;
  office_name: string;
  supplier_oper_name: string;
  order_dt: string;
  sale_dt: string;
  rr_dt: string;
  shk_id: number;
  retail_price_withdisc_rub: number;
  delivery_amount: number;
  return_amount: number;
  delivery_rub: number;
  gi_box_type_name: string;
  product_discount_for_report: number;
  supplier_promo: number;
  rid: number;
  ppvz_spp_prc: number;
  ppvz_kvw_prc_base: number;
  ppvz_kvw_prc: number;
  sup_rating_prc_up: number;
  is_kgvp_v2: number;
  ppvz_sales_commission: number;
  ppvz_for_pay: number;
  ppvz_reward: number;
  acquiring_fee: number;
  acquiring_percent: number;
  payment_processing: string;
  acquiring_bank: string;
  ppvz_vw: number;
  ppvz_vw_nds: number;
  ppvz_office_name: string;
  ppvz_office_id: number;
  ppvz_supplier_id: number;
  ppvz_supplier_name: string;
  ppvz_inn: string;
  declaration_number: string;
  bonus_type_name: string;
  sticker_id: string;
  site_country: string;
  srv_dbs: boolean;
  penalty: number;
  additional_payment: number;
  rebill_logistic_cost: number;
  rebill_logistic_org: string;
  storage_fee: number;
  deduction: number;
  acceptance: number;
  assembly_id: number;
  kiz?: string;
  srid: string;
  report_type: number;
  is_legal_entity: boolean;
  trbx_id: string;
}

interface FinancialReportProps {
  data: ReportDetail[];
  isLoading: boolean;
  period: string;
}

const FinancialReport: React.FC<FinancialReportProps> = ({ data, isLoading, period }) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("detailed");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("all");
  
  const itemsPerPage = 10;
  
  // Get unique doc_type_name values for the filter dropdown
  const docTypes = useMemo(() => {
    const types = new Set<string>();
    data.forEach(item => {
      if (item.doc_type_name) {
        types.add(item.doc_type_name);
      }
    });
    return Array.from(types);
  }, [data]);
  
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filter by doc_type
      if (docTypeFilter !== "all" && item.doc_type_name !== docTypeFilter) {
        return false;
      }
      
      // Filter by search
      if (search === "") return true;
      
      const searchLower = search.toLowerCase();
      return (
        item.sa_name?.toLowerCase().includes(searchLower) ||
        item.doc_type_name?.toLowerCase().includes(searchLower) ||
        item.subject_name?.toLowerCase().includes(searchLower) ||
        item.brand_name?.toLowerCase().includes(searchLower) ||
        item.office_name?.toLowerCase().includes(searchLower)
      );
    });
  }, [data, docTypeFilter, search]);
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [docTypeFilter, search]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const paginationRange = () => {
    let pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfMax = Math.floor(maxVisiblePages / 2);
      
      // Always show first page
      pages.push(1);
      
      // Add middle pages
      let startPage = Math.max(2, currentPage - halfMax);
      let endPage = Math.min(totalPages - 1, currentPage + halfMax);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Рассчитываем финансовые суммы для сводки
  const calculateSummary = () => {
    return filteredData.reduce((summary, item) => {
      const isReturn = item.doc_type_name === 'Возврат';
      return {
        totalSales: summary.totalSales + (isReturn ? 0 : (item.retail_price_withdisc_rub || 0)),
        totalCommission: summary.totalCommission + Math.abs(item.ppvz_sales_commission || 0),
        totalForPay: summary.totalForPay + (item.ppvz_for_pay || 0),
        totalLogistics: summary.totalLogistics + (item.delivery_rub || 0),
        totalStorage: summary.totalStorage + (item.storage_fee || 0),
        totalPenalties: summary.totalPenalties + (item.penalty || 0),
        totalDeductions: summary.totalDeductions + (item.deduction || 0),
        totalAcceptance: summary.totalAcceptance + (item.acceptance || 0)
      };
    }, {
      totalSales: 0,
      totalCommission: 0,
      totalForPay: 0,
      totalLogistics: 0,
      totalStorage: 0,
      totalPenalties: 0,
      totalDeductions: 0,
      totalAcceptance: 0
    });
  };

  const summary = calculateSummary();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Финансовый отчет</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Финансовый отчет{period ? ` - ${period}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="detailed" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Сводка</TabsTrigger>
            <TabsTrigger value="detailed">Детальный отчет</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Показатель</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Выручка (продажи)</TableCell>
                  <TableCell className="text-right">{summary.totalSales.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Комиссия</TableCell>
                  <TableCell className="text-right">{summary.totalCommission.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>К перечислению</TableCell>
                  <TableCell className="text-right">{summary.totalForPay.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Логистика</TableCell>
                  <TableCell className="text-right">{summary.totalLogistics.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Хранение</TableCell>
                  <TableCell className="text-right">{summary.totalStorage.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Штрафы</TableCell>
                  <TableCell className="text-right">{summary.totalPenalties.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Удержания</TableCell>
                  <TableCell className="text-right">{summary.totalDeductions.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Приемка</TableCell>
                  <TableCell className="text-right">{summary.totalAcceptance.toFixed(2)} ₽</TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Чистая прибыль</TableCell>
                  <TableCell className="text-right">
                    {(summary.totalForPay - summary.totalLogistics - summary.totalStorage - summary.totalPenalties - summary.totalDeductions - summary.totalAcceptance).toFixed(2)} ₽
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="detailed">
            <div className={`mb-4 ${isMobile ? 'space-y-2' : 'flex items-center gap-4'}`}>
              <Input 
                placeholder="Поиск по отчету..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={isMobile ? "w-full" : "max-w-sm"}
              />
              
              <div className={isMobile ? "w-full" : "w-[180px]"}>
                <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип документа" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {docTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className={`overflow-x-auto ${isMobile ? "-mx-4 px-4" : ""}`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Бренд</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>К оплате</TableHead>
                    <TableHead>Логистика</TableHead>
                    <TableHead>Хранение</TableHead>
                    <TableHead>Штрафы</TableHead>
                    <TableHead>Удержания</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length > 0 ? (
                    currentData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.rr_dt}</TableCell>
                        <TableCell>{item.doc_type_name}</TableCell>
                        <TableCell>{item.sa_name}</TableCell>
                        <TableCell>{item.brand_name}</TableCell>
                        <TableCell>{item.subject_name}</TableCell>
                        <TableCell>{item.retail_price_withdisc_rub?.toFixed(2) || 0} ₽</TableCell>
                        <TableCell>{item.ppvz_for_pay?.toFixed(2) || 0} ₽</TableCell>
                        <TableCell>{item.delivery_rub?.toFixed(2) || 0} ₽</TableCell>
                        <TableCell>{item.storage_fee?.toFixed(2) || 0} ₽</TableCell>
                        <TableCell>{item.penalty?.toFixed(2) || 0} ₽</TableCell>
                        <TableCell>{item.deduction?.toFixed(2) || 0} ₽</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-4">
                        Нет данных для отображения
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {paginationRange().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <span className="px-4">...</span>
                      ) : (
                        <PaginationLink 
                          isActive={currentPage === page}
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          className={typeof page === 'number' ? "cursor-pointer" : ""}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialReport;

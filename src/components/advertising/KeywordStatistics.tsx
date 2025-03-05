
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyKeywordStats, KeywordStats, getKeywordStats, getExcludedKeywords, setSearchExcludedKeywords, setAutoExcludedKeywords } from "@/services/advertisingApi";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, RefreshCw, Search, X, Plus, Filter, Download, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const KEYWORD_STATS_STORAGE_KEY = 'keyword_stats';
const EXCLUDED_KEYWORDS_STORAGE_KEY = 'excluded_keywords';
const DATE_RANGE_STORAGE_KEY = 'keyword_date_range';

interface KeywordStatisticsProps {
  campaignId: number;
  campaignType: 'auction' | 'automatic';
  apiKey: string;
}

const KeywordStatistics = ({ campaignId, campaignType, apiKey }: KeywordStatisticsProps) => {
  const [keywordStats, setKeywordStats] = useState<DailyKeywordStats[]>([]);
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showExcludedOnly, setShowExcludedOnly] = useState(false);
  const [addKeywordDialogOpen, setAddKeywordDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [keywordsToExclude, setKeywordsToExclude] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date>(() => {
    const savedRange = localStorage.getItem(`${DATE_RANGE_STORAGE_KEY}_${campaignId}`);
    if (savedRange) {
      const { from } = JSON.parse(savedRange);
      return new Date(from);
    }
    return subDays(new Date(), 7);
  });
  const [dateTo, setDateTo] = useState<Date>(() => {
    const savedRange = localStorage.getItem(`${DATE_RANGE_STORAGE_KEY}_${campaignId}`);
    if (savedRange) {
      const { to } = JSON.parse(savedRange);
      return new Date(to);
    }
    return new Date();
  });
  const { toast } = useToast();

  // Загрузка кэшированных данных при инициализации
  useEffect(() => {
    loadCachedData();
  }, [campaignId]);

  const loadCachedData = () => {
    try {
      const keywordStatsKey = `${KEYWORD_STATS_STORAGE_KEY}_${campaignId}`;
      const excludedKeywordsKey = `${EXCLUDED_KEYWORDS_STORAGE_KEY}_${campaignId}`;
      
      const savedKeywordStats = localStorage.getItem(keywordStatsKey);
      const savedExcludedKeywords = localStorage.getItem(excludedKeywordsKey);
      
      if (savedKeywordStats) {
        setKeywordStats(JSON.parse(savedKeywordStats));
      }
      
      if (savedExcludedKeywords) {
        setExcludedKeywords(JSON.parse(savedExcludedKeywords));
      } else {
        fetchExcludedKeywords();
      }
      
      if (!savedKeywordStats) {
        fetchKeywordStats();
      }
    } catch (error) {
      console.error('Error loading cached keyword data:', error);
    }
  };

  const cacheData = (keywords: DailyKeywordStats[], excluded: string[]) => {
    try {
      const keywordStatsKey = `${KEYWORD_STATS_STORAGE_KEY}_${campaignId}`;
      const excludedKeywordsKey = `${EXCLUDED_KEYWORDS_STORAGE_KEY}_${campaignId}`;
      const dateRangeKey = `${DATE_RANGE_STORAGE_KEY}_${campaignId}`;
      
      localStorage.setItem(keywordStatsKey, JSON.stringify(keywords));
      localStorage.setItem(excludedKeywordsKey, JSON.stringify(excluded));
      localStorage.setItem(dateRangeKey, JSON.stringify({
        from: dateFrom.toISOString(),
        to: dateTo.toISOString()
      }));
    } catch (error) {
      console.error('Error caching keyword data:', error);
    }
  };

  const fetchKeywordStats = async () => {
    setLoading(true);
    try {
      const data = await getKeywordStats(apiKey, campaignId, dateFrom, dateTo);
      setKeywordStats(data.keywords || []);
      cacheData(data.keywords || [], excludedKeywords);
      
      toast({
        title: "Успех",
        description: "Статистика по ключевым фразам успешно загружена",
      });
    } catch (error) {
      console.error('Error fetching keyword stats:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить статистику ключевых фраз",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExcludedKeywords = async () => {
    try {
      const excluded = await getExcludedKeywords(apiKey, campaignId, campaignType);
      setExcludedKeywords(excluded);
      cacheData(keywordStats, excluded);
    } catch (error) {
      console.error('Error fetching excluded keywords:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить минус-фразы",
        variant: "destructive",
      });
    }
  };

  const handleSetExcludedKeywords = async (excluded: string[]) => {
    setLoading(true);
    try {
      if (campaignType === 'auction') {
        await setSearchExcludedKeywords(apiKey, campaignId, excluded);
      } else {
        await setAutoExcludedKeywords(apiKey, campaignId, excluded);
      }
      
      setExcludedKeywords(excluded);
      cacheData(keywordStats, excluded);
      
      toast({
        title: "Успех",
        description: "Минус-фразы успешно обновлены",
      });
    } catch (error) {
      console.error('Error setting excluded keywords:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить минус-фразы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExcludeKeywords = (keywords: string[]) => {
    setKeywordsToExclude(keywords);
    setConfirmDialogOpen(true);
  };

  const confirmExcludeKeywords = async () => {
    const updatedExcluded = [...new Set([...excludedKeywords, ...keywordsToExclude])];
    await handleSetExcludedKeywords(updatedExcluded);
    setSelectedKeywords([]);
    setConfirmDialogOpen(false);
  };

  const handleRemoveExcludedKeywords = async (keywords: string[]) => {
    const updatedExcluded = excludedKeywords.filter(kw => !keywords.includes(kw));
    await handleSetExcludedKeywords(updatedExcluded);
    setSelectedKeywords([]);
  };

  const handleAddManualKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    const updatedExcluded = [...new Set([...excludedKeywords, newKeyword.trim()])];
    await handleSetExcludedKeywords(updatedExcluded);
    setNewKeyword("");
    setAddKeywordDialogOpen(false);
  };

  const handleDateChange = (days: number) => {
    const newDateFrom = new Date(dateFrom);
    newDateFrom.setDate(newDateFrom.getDate() + days);
    
    const newDateTo = new Date(dateTo);
    newDateTo.setDate(newDateTo.getDate() + days);
    
    // Ensure we don't go beyond today
    const today = new Date();
    if (newDateTo > today) {
      newDateTo.setDate(today.getDate());
      newDateFrom.setDate(today.getDate() - 6); // Keep 7 days range
    }
    
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
    
    // Re-fetch data with new dates
    setTimeout(() => {
      fetchKeywordStats();
    }, 100);
  };

  const handleToggleSelectKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword) 
        : [...prev, keyword]
    );
  };

  const handleToggleSelectAll = (stats: KeywordStats[]) => {
    const allKeywords = stats.map(stat => stat.keyword);
    if (selectedKeywords.length === allKeywords.length) {
      setSelectedKeywords([]);
    } else {
      setSelectedKeywords(allKeywords);
    }
  };

  const exportToCSV = () => {
    // Flatten keywords from all days
    const allKeywordStats = keywordStats.flatMap(day => 
      day.stats.map(stat => ({
        date: day.date,
        ...stat
      }))
    );
    
    if (allKeywordStats.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нет данных для экспорта",
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV content
    const headers = ["Дата", "Ключевая фраза", "Показы", "Клики", "CTR", "Затраты", "Минус-фраза"];
    const rows = allKeywordStats.map(stat => [
      stat.date,
      stat.keyword,
      stat.views,
      stat.clicks,
      `${stat.ctr.toFixed(2)}%`,
      stat.sum.toFixed(2),
      excludedKeywords.includes(stat.keyword) ? "Да" : "Нет"
    ]);
    
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.join(";"))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `keywords_campaign_${campaignId}_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Фильтрация ключевых фраз
  const filteredStats = keywordStats.map(day => {
    const filteredDayStats = day.stats.filter(stat => {
      const matchesSearch = searchQuery 
        ? stat.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesExcluded = showExcludedOnly 
        ? excludedKeywords.includes(stat.keyword)
        : true;
      
      return matchesSearch && matchesExcluded;
    });
    
    return {
      ...day,
      stats: filteredDayStats
    };
  }).filter(day => day.stats.length > 0);

  // Общие метрики
  const totalMetrics = keywordStats.flatMap(day => day.stats).reduce(
    (acc, curr) => {
      acc.views += curr.views;
      acc.clicks += curr.clicks;
      acc.sum += curr.sum;
      return acc;
    },
    { views: 0, clicks: 0, sum: 0, ctr: 0 }
  );
  
  if (totalMetrics.views > 0) {
    totalMetrics.ctr = (totalMetrics.clicks / totalMetrics.views) * 100;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="shadow-lg border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-white to-indigo-50/20 dark:from-gray-900 dark:to-indigo-950/30 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/30 dark:to-purple-900/30 pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Статистика по ключевым фразам
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Период: {format(dateFrom, 'dd.MM.yyyy')} — {format(dateTo, 'dd.MM.yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDateChange(-7)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDateChange(7)}
                className="h-8 w-8"
                disabled={new Date(dateTo).toDateString() === new Date().toDateString()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary"
                size="sm"
                onClick={fetchKeywordStats}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-none"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по фразам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExcludedOnly(!showExcludedOnly)}
                className={`text-xs flex items-center gap-1 ${showExcludedOnly ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30' : ''}`}
              >
                <Filter className="h-3 w-3" />
                {showExcludedOnly ? 'Все фразы' : 'Только минус-фразы'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAddKeywordDialogOpen(true)}
                className="text-xs flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Добавить
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                className="text-xs flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                Экспорт
              </Button>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-2">
              {selectedKeywords.length > 0 && (
                <>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleExcludeKeywords(selectedKeywords)}
                    disabled={loading}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Добавить в минус-фразы
                  </Button>
                  
                  {selectedKeywords.some(kw => excludedKeywords.includes(kw)) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveExcludedKeywords(selectedKeywords.filter(kw => excludedKeywords.includes(kw)))}
                      disabled={loading}
                      className="text-xs border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800/30 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Удалить из минус-фраз
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedKeywords([])}
                    className="text-xs"
                  >
                    Сбросить
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="stats" className="mt-2">
            <TabsList>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
              <TabsTrigger value="excluded">
                Минус-фразы 
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  {excludedKeywords.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="mt-4">
              {keywordStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-3">
                    <Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Нет данных о ключевых фразах</h3>
                  <p className="text-muted-foreground text-sm">
                    Нажмите "Обновить" для загрузки данных
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30">
                      <CardContent className="p-4">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">Всего показов</p>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{totalMetrics.views.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30">
                      <CardContent className="p-4">
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Всего кликов</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{totalMetrics.clicks.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30">
                      <CardContent className="p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Средний CTR</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{totalMetrics.ctr.toFixed(2)}%</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30">
                      <CardContent className="p-4">
                        <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">Всего затрат</p>
                        <p className="text-2xl font-bold text-rose-900 dark:text-rose-200">{totalMetrics.sum.toLocaleString()} ₽</p>
                      </CardContent>
                    </Card>
                  </div>
                
                  {filteredStats.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Нет данных для отображения</h3>
                      <p className="text-muted-foreground">Попробуйте изменить фильтры</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {filteredStats.map((day, dayIndex) => (
                        <div key={dayIndex} className="animate-in fade-in duration-500">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{format(new Date(day.date), 'dd MMMM yyyy')}</h3>
                            <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/20">
                              {day.stats.length} фраз
                            </Badge>
                          </div>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[40px]">
                                  <Checkbox 
                                    checked={day.stats.length > 0 && day.stats.every(stat => selectedKeywords.includes(stat.keyword))}
                                    onCheckedChange={() => handleToggleSelectAll(day.stats)}
                                  />
                                </TableHead>
                                <TableHead>Ключевая фраза</TableHead>
                                <TableHead className="text-right">Показы</TableHead>
                                <TableHead className="text-right">Клики</TableHead>
                                <TableHead className="text-right">CTR</TableHead>
                                <TableHead className="text-right">Затраты</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {day.stats.map((stat, statIndex) => {
                                const isExcluded = excludedKeywords.includes(stat.keyword);
                                const isSelected = selectedKeywords.includes(stat.keyword);
                                
                                return (
                                  <TableRow 
                                    key={statIndex}
                                    className={`${isExcluded ? 'bg-red-50 dark:bg-red-950/20' : ''} ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/20' : ''}`}
                                  >
                                    <TableCell>
                                      <Checkbox 
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleSelectKeyword(stat.keyword)}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium flex items-center gap-2">
                                      {stat.keyword}
                                      {isExcluded && (
                                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
                                          минус
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">{stat.views.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{stat.clicks.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{stat.ctr.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right">{stat.sum.toFixed(2)} ₽</TableCell>
                                    <TableCell className="text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <span className="sr-only">Открыть меню</span>
                                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                              <path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                            </svg>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {isExcluded ? (
                                            <DropdownMenuItem onClick={() => handleRemoveExcludedKeywords([stat.keyword])}>
                                              <X className="mr-2 h-4 w-4" />
                                              <span>Удалить из минус-фраз</span>
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem onClick={() => handleExcludeKeywords([stat.keyword])}>
                                              <Plus className="mr-2 h-4 w-4" />
                                              <span>Добавить в минус-фразы</span>
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="excluded" className="mt-4">
              <Card className="border border-dashed p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Список минус-фраз</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAddKeywordDialogOpen(true)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Добавить фразу
                    </Button>
                    
                    {excludedKeywords.length > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleSetExcludedKeywords([])}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Очистить все
                      </Button>
                    )}
                  </div>
                </div>
                
                {excludedKeywords.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full inline-flex mb-3">
                      <AlertCircle className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Нет минус-фраз</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Добавьте ключевые фразы, по которым не хотите показывать рекламу
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {excludedKeywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="px-3 py-1.5 justify-between bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
                      >
                        <span className="truncate">{keyword}</span>
                        <X 
                          className="h-3.5 w-3.5 cursor-pointer ml-2 hover:text-red-900 dark:hover:text-red-300" 
                          onClick={() => handleRemoveExcludedKeywords([keyword])} 
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Диалог добавления минус-фразы */}
      <Dialog open={addKeywordDialogOpen} onOpenChange={setAddKeywordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить минус-фразу</DialogTitle>
            <DialogDescription>
              Добавьте ключевую фразу, по которой не хотите показывать рекламу
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Введите фразу..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddKeywordDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddManualKeyword} disabled={!newKeyword.trim()}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог подтверждения добавления минус-фраз */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите добавить следующие фразы в минус-фразы?
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[200px] overflow-y-auto my-4 border rounded-md p-2">
            {keywordsToExclude.map((keyword, index) => (
              <div key={index} className="py-1 border-b last:border-0">
                {keyword}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
            <Button 
              variant="destructive" 
              onClick={confirmExcludeKeywords}
              disabled={loading}
            >
              {loading ? 'Обработка...' : 'Добавить в минус-фразы'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default KeywordStatistics;

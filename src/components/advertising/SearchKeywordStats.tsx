
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchKeywordResponse, SearchKeywordStat, getSearchKeywordStatistics } from "@/services/advertisingApi";
import { useToast } from "@/hooks/use-toast";
import { Search, Tag, TrendingUp, Eye, MousePointerClick, DollarSign, Clock, Calendar, PercentIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SearchKeywordStatsProps {
  campaignId: number;
  apiKey: string;
}

const SearchKeywordStats = ({ campaignId, apiKey }: SearchKeywordStatsProps) => {
  const [keywordStats, setKeywordStats] = useState<SearchKeywordResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof SearchKeywordStat>("views");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Filter keywords by search term
  const filteredKeywords = useMemo(() => {
    if (!keywordStats?.stat) return [];
    
    return keywordStats.stat.filter(
      stat => stat.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [keywordStats, searchTerm]);

  // Sort the filtered keywords
  const sortedKeywords = useMemo(() => {
    return [...filteredKeywords].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }, [filteredKeywords, sortField, sortDirection]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchData = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const data = await getSearchKeywordStatistics(apiKey, campaignId);
      setKeywordStats(data);
      setLastUpdate(new Date().toISOString());
      
      if (data.stat && data.stat.length > 0) {
        toast({
          title: "Данные обновлены",
          description: "Статистика по ключевым фразам успешно загружена",
        });
      } else {
        toast({
          title: "Нет данных",
          description: "Нет статистики по ключевым фразам для данной кампании",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching search keyword statistics:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить статистику по ключевым фразам",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId && apiKey) {
      fetchData();
    }
  }, [campaignId, apiKey]);

  const handleSort = (field: keyof SearchKeywordStat) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
    
    if (days > 0) {
      return `${days} д ${hours} ч`;
    } else if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    } else {
      return `${minutes} мин`;
    }
  };

  const getFormattedLastUpdate = () => {
    if (!lastUpdate) return "Никогда";
    
    try {
      return formatDistanceToNow(new Date(lastUpdate), { addSuffix: true, locale: ru });
    } catch (e) {
      return "Недавно";
    }
  };

  const renderSortIcon = (field: keyof SearchKeywordStat) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 inline-block">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const KeywordOverview = () => {
    if (!keywordStats || !keywordStats.stat || keywordStats.stat.length === 0) {
      return (
        <div className="p-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <Tag className="w-10 h-10 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">Нет данных о ключевых фразах</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Для этой кампании еще нет статистики по ключевым фразам
            </p>
          </div>
        </div>
      );
    }

    // Найдем общую статистику (первый элемент с keyword "Всего по кампании")
    const totalStats = keywordStats.stat.find(stat => stat.keyword === "Всего по кампании");
    
    // Получим уникальные ключевые слова (без "Всего по кампании")
    const uniqueKeywords = keywordStats.stat.filter(stat => stat.keyword !== "Всего по кампании");
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Метрика 1: Количество ключевых фраз */}
          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <Tag className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">Ключевых фраз</p>
              <p className="text-base font-bold">{uniqueKeywords.length}</p>
            </div>
          </div>

          {/* Метрика 2: Показы */}
          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-blue-100 dark:border-blue-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">Показы</p>
              <p className="text-base font-bold">{totalStats?.views?.toLocaleString('ru-RU') || "0"}</p>
            </div>
          </div>

          {/* Метрика 3: Клики */}
          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-green-100 dark:border-green-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-green-400 to-green-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/40">
                  <MousePointerClick className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Клики</p>
              <p className="text-base font-bold">{totalStats?.clicks?.toLocaleString('ru-RU') || "0"}</p>
            </div>
          </div>

          {/* Метрика 4: CTR */}
          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-amber-100 dark:border-amber-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <PercentIcon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">CTR</p>
              <p className="text-base font-bold">{totalStats?.ctr?.toFixed(2) || "0"}%</p>
            </div>
          </div>

          {/* Метрика 5: Затраты */}
          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-red-400 to-red-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/40">
                  <DollarSign className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-0.5">Затраты</p>
              <p className="text-base font-bold">{totalStats?.sum?.toLocaleString('ru-RU') || "0"} ₽</p>
            </div>
          </div>
        </div>

        {/* Информация о кампании */}
        {totalStats && (
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Информация о кампании</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Название</p>
                <p className="text-sm font-medium">{totalStats.campaignName || "Нет названия"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Начало</p>
                <p className="text-sm font-medium">
                  {totalStats.begin ? new Date(totalStats.begin).toLocaleDateString('ru-RU') : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Длительность</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatDuration(totalStats.duration)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Фиксированные фразы и исключения */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Фиксированные фразы */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>Фиксированные фразы</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {keywordStats.words.pluse && keywordStats.words.pluse.length > 0 ? (
                <div className="space-y-2">
                  {keywordStats.words.pluse.map((phrase, index) => (
                    <Badge key={index} className="mr-2 mb-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Нет фиксированных фраз</p>
              )}
            </CardContent>
          </Card>

          {/* Исключенные фразы */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/40 dark:to-amber-950/40">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4 text-red-500" />
                <span>Исключенные фразы</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {keywordStats.words.excluded && keywordStats.words.excluded.length > 0 ? (
                <div className="space-y-2">
                  {keywordStats.words.excluded.map((phrase, index) => (
                    <Badge key={index} className="mr-2 mb-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Нет исключенных фраз</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Топ ключевых слов */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>Топ ключевых слов</span>
            </h3>
          </div>
          <CardContent className="p-4">
            <div className="space-y-4">
              {uniqueKeywords
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((stat, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs px-1.5 py-0.5">
                          {index + 1}
                        </Badge>
                        <span className="text-sm truncate max-w-[180px]" title={stat.keyword}>
                          {stat.keyword}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{stat.views.toLocaleString('ru-RU')}</span>
                    </div>
                    <Progress 
                      value={(stat.views / (uniqueKeywords[0]?.views || 1)) * 100} 
                      className="h-1.5 bg-blue-100 dark:bg-blue-900/30" 
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{stat.clicks.toLocaleString('ru-RU')} кл.</span>
                      <span>{stat.ctr.toFixed(2)}%</span>
                      <span>{stat.sum.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const KeywordTable = () => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Поиск по ключевым фразам..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8 pr-2 py-1 h-8 text-sm"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="h-8 px-2 text-xs"
          >
            {loading ? "Загрузка..." : "Обновить"}
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                  <TableHead 
                    className="cursor-pointer py-2 px-2 text-xs"
                    onClick={() => handleSort("keyword")}
                  >
                    Ключевая фраза {renderSortIcon("keyword")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                    onClick={() => handleSort("views")}
                  >
                    Показы {renderSortIcon("views")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                    onClick={() => handleSort("clicks")}
                  >
                    Клики {renderSortIcon("clicks")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                    onClick={() => handleSort("ctr")}
                  >
                    CTR {renderSortIcon("ctr")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                    onClick={() => handleSort("cpc")}
                  >
                    CPC {renderSortIcon("cpc")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-20"
                    onClick={() => handleSort("sum")}
                  >
                    Затраты {renderSortIcon("sum")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-20"
                    onClick={() => handleSort("frq")}
                  >
                    Частота {renderSortIcon("frq")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedKeywords.length > 0 ? (
                  sortedKeywords.map((stat, index) => (
                    <TableRow 
                      key={index} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900/20 ${
                        stat.keyword === "Всего по кампании" ? 'font-medium bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <TableCell className="py-1.5 px-2 text-sm">
                        <div className="truncate max-w-[180px]" title={stat.keyword}>
                          {stat.keyword}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.views.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.clicks.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.ctr.toFixed(2)}%</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.cpc.toFixed(2)}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.sum.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.frq.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-20 text-center">
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                        </div>
                      ) : searchTerm ? (
                        <div className="flex flex-col items-center justify-center">
                          <Search className="h-6 w-6 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">Ничего не найдено по запросу "{searchTerm}"</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Tag className="h-6 w-6 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">Нет данных о ключевых фразах</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Поисковые ключевые фразы</h2>
        <div className="text-xs text-gray-500">
          Обновлено: {getFormattedLastUpdate()}
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <div 
          className="p-1 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, #4f87ea, #3972d4)'
          }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-background/90 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg p-1">
              <TabsTrigger value="overview" className="rounded-lg text-sm py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                Обзор
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-lg text-sm py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-sky-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                Таблица
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="overview" className="mt-0">
                <KeywordOverview />
              </TabsContent>
              
              <TabsContent value="table" className="mt-0">
                <KeywordTable />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  );
};

export default SearchKeywordStats;

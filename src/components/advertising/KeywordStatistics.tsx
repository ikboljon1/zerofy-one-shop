import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  KeywordSearchResponse, 
  KeywordSearchStat, 
  getSearchKeywordStatistics 
} from "@/services/advertisingApi";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Tag, TrendingUp, Eye, MousePointerClick, DollarSign, PercentIcon, Filter, AlertCircle, PlusCircle, MinusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface KeywordStatisticsProps {
  campaignId: number;
  apiKey: string;
}

interface ExtendedKeywordStat extends KeywordSearchStat {
  excluded: boolean;
  performance: 'profitable' | 'unprofitable' | 'neutral';
}

const KeywordStatisticsComponent = ({ campaignId, apiKey }: KeywordStatisticsProps) => {
  const [keywordStats, setKeywordStats] = useState<KeywordSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [sortField, setSortField] = useState<keyof KeywordSearchStat>("views");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [excludedKeywords, setExcludedKeywords] = useState<Set<string>>(new Set());

  const processedKeywords = useMemo(() => {
    if (!keywordStats || !keywordStats.stat) return [];

    const keywordEntries = keywordStats.stat.filter(stat => 
      stat.keyword !== "Всего по кампании"
    );

    return keywordEntries.map(stat => ({
      ...stat,
      excluded: excludedKeywords.has(stat.keyword),
      performance: calculatePerformance(stat)
    }));
  }, [keywordStats, excludedKeywords]);

  function calculatePerformance(stat: KeywordSearchStat): 'profitable' | 'unprofitable' | 'neutral' {
    if (stat.ctr > 5 && stat.clicks > 20) {
      return 'profitable';
    } else if (stat.ctr > 3 || (stat.clicks > 10 && stat.sum / stat.clicks < 15)) {
      return 'profitable';
    } else if (stat.views > 1000 && stat.ctr < 0.5) {
      return 'unprofitable';
    } else if ((stat.sum > 100 && stat.ctr < 1) || (stat.sum > 200 && stat.clicks < 10)) {
      return 'unprofitable';
    }
    return 'neutral';
  }

  const filteredKeywords = useMemo(() => {
    return processedKeywords.filter(
      stat => stat.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedKeywords, searchTerm]);

  const sortedKeywords = useMemo(() => {
    return [...filteredKeywords].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
  }, [filteredKeywords, sortField, sortDirection]);

  const toggleKeywordExclusion = (keyword: string) => {
    setExcludedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    
    const timeoutId = setTimeout(() => {
      setSearchTerm(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const fetchData = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      console.log(`Fetching keyword statistics for campaign ID: ${campaignId}`);
      const data = await getSearchKeywordStatistics(apiKey, campaignId);
      console.log('Received keyword data:', data);
      
      setKeywordStats(data);
      setLastUpdate(new Date().toISOString());
      
      if (data.stat && data.stat.length > 0) {
        toast({
          title: "Данные обновлены",
          description: "Статистика по ключевым словам успешно загружена",
        });
      } else {
        toast({
          title: "Нет данных",
          description: "Для данной кампании нет статистики по ключевым словам или кампания не является поисковой",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching keyword statistics:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить статистику по ключевым словам",
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

  const handleSort = (field: keyof KeywordSearchStat) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getFormattedLastUpdate = () => {
    if (!lastUpdate) return "Никогда";
    
    const updateDate = new Date(lastUpdate);
    return `${updateDate.toLocaleDateString('ru-RU')} ${updateDate.toLocaleTimeString('ru-RU')}`;
  };

  const renderSortIcon = (field: keyof KeywordSearchStat) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 inline-block">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const getKeywordPerformanceClass = (performance: 'profitable' | 'unprofitable' | 'neutral') => {
    switch (performance) {
      case 'profitable':
        return "text-blue-600 dark:text-blue-400 font-medium";
      case 'unprofitable':
        return "text-red-600 dark:text-red-400 font-medium";
      default:
        return "";
    }
  };

  const getKeywordPerformanceIcon = (performance: 'profitable' | 'unprofitable' | 'neutral') => {
    switch (performance) {
      case 'profitable':
        return <PlusCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'unprofitable':
        return <MinusCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const KeywordMetricsCard = () => {
    if (!keywordStats || !keywordStats.stat || keywordStats.stat.length === 0) {
      return (
        <div className="p-4 text-center">
          <div className="flex flex-col items-center justify-center">
            <Tag className="w-10 h-10 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">Нет данных о ключевых словах</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Для этой кампании еще нет статистики по ключевым словам или кампания не является поисковой
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="mt-4"
            >
              {loading ? 'Загрузка...' : 'Попробовать еще раз'}
            </Button>
          </div>
        </div>
      );
    }

    const summaryStats = keywordStats.stat.find(stat => stat.keyword === "Всего по кампании");
    
    const totalViews = summaryStats?.views || processedKeywords.reduce((sum, stat) => sum + stat.views, 0);
    const totalClicks = summaryStats?.clicks || processedKeywords.reduce((sum, stat) => sum + stat.clicks, 0);
    const totalSum = summaryStats?.sum || processedKeywords.reduce((sum, stat) => sum + stat.sum, 0);
    const avgCtr = summaryStats?.ctr || (totalViews > 0 ? (totalClicks / totalViews) * 100 : 0);
    const uniqueKeywords = keywordStats.words?.keywords?.length || 
                          new Set(processedKeywords.map(k => k.keyword)).size;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40">
                  <Tag className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">Ключевых слов</p>
              <p className="text-base font-bold">{uniqueKeywords || 0}</p>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-blue-100 dark:border-blue-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">Показы</p>
              <p className="text-base font-bold">{totalViews.toLocaleString('ru-RU')}</p>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-green-100 dark:border-green-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-green-400 to-green-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/40">
                  <MousePointerClick className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-0.5">Клики</p>
              <p className="text-base font-bold">{totalClicks.toLocaleString('ru-RU')}</p>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-amber-100 dark:border-amber-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <PercentIcon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">CTR</p>
              <p className="text-base font-bold">{avgCtr.toFixed(2)}%</p>
            </div>
          </div>

          <div className="rounded-lg p-3 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden relative">
            <div className="w-1 h-full absolute left-0 top-0 bg-gradient-to-b from-red-400 to-red-600 rounded-l-lg"></div>
            <div className="flex flex-col pl-2">
              <div className="flex items-center justify-between mb-1">
                <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/40">
                  <DollarSign className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-0.5">Затраты</p>
              <p className="text-base font-bold">{totalSum.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>

        {keywordStats.words?.pluse && keywordStats.words.pluse.length > 0 && (
          <Card className="border-0 shadow-md rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>Фиксированные фразы</span>
              </h3>
            </div>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {keywordStats.words.pluse.map((phrase, index) => (
                  <Badge key={index} className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-md rounded-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span>Топ ключевых слов</span>
            </h3>
          </div>
          <CardContent className="p-4">
            <div className="space-y-4">
              {processedKeywords
                .filter(stat => !stat.excluded)
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((stat, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs px-1.5 py-0.5">
                          {index + 1}
                        </Badge>
                        <span className={`text-sm ${getKeywordPerformanceClass(stat.performance)}`}>
                          {stat.keyword}
                          {getKeywordPerformanceIcon(stat.performance) && 
                            <span className="ml-1 inline-flex items-center">
                              {getKeywordPerformanceIcon(stat.performance)}
                            </span>
                          }
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{stat.views.toLocaleString('ru-RU')}</span>
                    </div>
                    <Progress 
                      value={(stat.views / (processedKeywords[0]?.views || 1)) * 100} 
                      className={`h-1.5 ${
                        stat.performance === 'profitable' 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : stat.performance === 'unprofitable' 
                            ? 'bg-red-100 dark:bg-red-900/30' 
                            : 'bg-purple-100 dark:bg-purple-900/30'
                      }`} 
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
              placeholder="Поиск по ключевым словам..."
              value={searchInputValue}
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
            <Filter className="h-3.5 w-3.5 mr-1" />
            Обновить
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                  <TableHead className="w-8 p-0 pl-2">
                    <span className="sr-only">Исключить</span>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer py-2 px-2 text-xs"
                    onClick={() => handleSort("keyword")}
                  >
                    Ключевое слово {renderSortIcon("keyword")}
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
                    className="text-right cursor-pointer py-2 px-2 text-xs w-20"
                    onClick={() => handleSort("sum")}
                  >
                    Затраты {renderSortIcon("sum")}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer py-2 px-2 text-xs w-16"
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
                        stat.excluded ? 'opacity-60 bg-gray-50 dark:bg-gray-900/10' : ''
                      }`}
                    >
                      <TableCell className="p-0 pl-2 w-8">
                        <Checkbox 
                          checked={stat.excluded}
                          onCheckedChange={() => toggleKeywordExclusion(stat.keyword)}
                          aria-label={`Исключить ${stat.keyword}`}
                          className="h-3.5 w-3.5"
                        />
                      </TableCell>
                      <TableCell className={`py-1.5 px-2 text-sm ${getKeywordPerformanceClass(stat.performance)}`}>
                        <div className="flex items-center gap-1 truncate max-w-[180px]" title={stat.keyword}>
                          {stat.keyword}
                          {getKeywordPerformanceIcon(stat.performance)}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.views.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.clicks.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.ctr.toFixed(2)}%</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.sum.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-sm">{stat.frq.toFixed(1)}</TableCell>
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
                          <p className="text-xs text-gray-500">Нет данных о ключевых словах</p>
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
        <h2 className="text-xl font-bold">Статистика по ключевым словам</h2>
        <div className="text-xs text-gray-500">
          Обновлено: {getFormattedLastUpdate()}
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden rounded-xl">
        <div 
          className="p-1 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, #9b87f5, #7E69AB)'
          }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-background/90 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg p-1">
              <TabsTrigger value="overview" className="rounded-lg text-sm py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                Обзор
              </TabsTrigger>
              <TabsTrigger value="table" className="rounded-lg text-sm py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
                Таблица
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="overview" className="mt-0">
                <KeywordMetricsCard />
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

export default KeywordStatisticsComponent;

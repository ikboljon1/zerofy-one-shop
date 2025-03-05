
import { useState } from "react";
import { SearchKeywordResponse, SearchKeywordStat, getSearchKeywordStatistics } from "@/services/advertisingApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, Clock, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchKeywords from "./SearchKeywords";
import { format, formatDistance } from "date-fns";
import { ru } from "date-fns/locale";

interface SearchKeywordStatisticsProps {
  campaignId: number;
  apiKey: string;
}

const SearchKeywordStatistics = ({ campaignId, apiKey }: SearchKeywordStatisticsProps) => {
  const [data, setData] = useState<SearchKeywordResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const fetchKeywordStats = async () => {
    try {
      setLoading(true);
      
      const response = await getSearchKeywordStatistics(apiKey, campaignId);
      setData(response);
      
      const now = new Date().toISOString();
      setLastUpdate(now);
      
      // Cache the data
      localStorage.setItem(`search_keywords_${campaignId}`, JSON.stringify({
        data: response,
        lastUpdate: now
      }));
      
      toast({
        title: "Успех",
        description: "Данные по ключевым фразам обновлены",
      });
    } catch (error) {
      console.error("Error fetching search keyword statistics:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные по ключевым фразам",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load cached data on initial render
  useState(() => {
    try {
      const cachedData = localStorage.getItem(`search_keywords_${campaignId}`);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setData(parsed.data);
        setLastUpdate(parsed.lastUpdate);
      } else {
        fetchKeywordStats();
      }
    } catch (error) {
      console.error("Error loading cached keyword data:", error);
      fetchKeywordStats();
    }
  });

  const renderSearchKeywordsTable = () => {
    if (!data?.stat || data.stat.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Search className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Нет данных о ключевых фразах</h3>
          <p className="text-gray-400 dark:text-gray-500 mb-4">
            Информация о поисковых запросах появится после начала работы рекламной кампании
          </p>
          <Button variant="outline" onClick={fetchKeywordStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Обновить данные
          </Button>
        </div>
      );
    }

    // Skip the first row which is the total
    const keywords = data.stat.slice(1);

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50 dark:bg-blue-950/30 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Ключевая фраза</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Показы</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Клики</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">CTR</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">CPC</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Частота</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Затраты</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100 dark:divide-blue-900/20">
            {keywords.map((item, index) => (
              <tr key={index} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                <td className="py-3.5 px-4 text-sm whitespace-nowrap max-w-[300px] truncate">{item.keyword}</td>
                <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap">{item.views.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap">{item.clicks.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap">{item.ctr.toFixed(2)}%</td>
                <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap">{item.cpc.toFixed(2)} ₽</td>
                <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap">{item.frq.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-sm text-right whitespace-nowrap font-medium">{item.sum.toLocaleString()} ₽</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getFormattedLastUpdate = () => {
    if (!lastUpdate) return "Никогда";
    
    const updateDate = new Date(lastUpdate);
    return `${updateDate.toLocaleDateString('ru-RU')} ${updateDate.toLocaleTimeString('ru-RU')}`;
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
      <CardHeader className="bg-blue-50/70 dark:bg-blue-950/20 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-400">
            <Search className="h-5 w-5" />
            Статистика поисковой кампании по ключевым фразам
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Обновлено: {getFormattedLastUpdate()}</span>
            </div>
            <Button 
              size="sm" 
              onClick={fetchKeywordStats} 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Обновить
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span>Фразы</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <TabsContent value="overview" className="m-0">
          <div className="p-6">
            <SearchKeywords data={data || { words: { phrase: [], strong: [], excluded: [], pluse: [], keywords: [] }, stat: [] }} isLoading={loading} />
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="m-0">
          {renderSearchKeywordsTable()}
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default SearchKeywordStatistics;

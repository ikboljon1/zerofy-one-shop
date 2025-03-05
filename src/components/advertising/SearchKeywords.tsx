
import { SearchKeywordResponse, SearchKeyword } from "@/services/advertisingApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tag, Plus, X, ArrowRightLeft, Search, Hash } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { ru } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchKeywordsProps {
  data: SearchKeywordResponse;
  isLoading: boolean;
}

const SearchKeywords = ({ data, isLoading }: SearchKeywordsProps) => {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
        <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-400">
            <Search className="h-5 w-5" />
            Ключевые фразы кампании
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const { words, stat } = data;
  const totalStats = stat.find(s => s.keyword === "Всего по кампании");
  
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    return `${days} ${getDeclension(days, ['день', 'дня', 'дней'])}`;
  };
  
  const getDeclension = (number: number, titles: [string, string, string]) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[
      number % 100 > 4 && number % 100 < 20 
        ? 2 
        : cases[number % 10 < 5 ? number % 10 : 5]
    ];
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
      <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-700 dark:text-blue-400">
          <Search className="h-5 w-5" />
          Ключевые фразы кампании
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {totalStats && (
          <div className="mb-6 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
              Общая статистика
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Просмотры</p>
                <p className="text-lg font-bold">{totalStats.views.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Клики</p>
                <p className="text-lg font-bold">{totalStats.clicks.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">CTR</p>
                <p className="text-lg font-bold">{totalStats.ctr.toFixed(2)}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Затраты</p>
                <p className="text-lg font-bold">{totalStats.sum.toLocaleString()} ₽</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Частота</p>
                <p className="text-lg font-bold">{totalStats.frq.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">CPC</p>
                <p className="text-lg font-bold">{totalStats.cpc.toFixed(2)} ₽</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Длительность</p>
                <p className="text-lg font-bold">{formatDuration(totalStats.duration)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Название</p>
                <p className="text-base font-medium truncate">{totalStats.campaignName}</p>
              </div>
            </div>
            {totalStats.begin && totalStats.end && (
              <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Запуск: {format(new Date(totalStats.begin), 'dd.MM.yyyy HH:mm', {locale: ru})}</span>
                  <span>Окончание: {format(new Date(totalStats.end), 'dd.MM.yyyy HH:mm', {locale: ru})}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" /> 
            Ключевые фразы
          </h3>
          
          {words?.keywords?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {words.keywords.map((keyword, index) => (
                <div 
                  key={index} 
                  className="border border-blue-100 dark:border-blue-900/20 rounded-lg p-3 bg-white dark:bg-gray-800 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium truncate mr-2">{keyword.keyword}</span>
                    {keyword.fixed !== undefined && (
                      <Badge variant={keyword.fixed ? "default" : "outline"} className="shrink-0">
                        {keyword.fixed ? "Фиксированная" : "Нефиксированная"}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center text-sm">
                      <Hash className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Просмотров: <strong>{keyword.count.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-500">Нет данных о ключевых фразах</p>
            </div>
          )}
        </div>

        {(words?.phrase?.length > 0 || words?.strong?.length > 0 || words?.excluded?.length > 0 || words?.pluse?.length > 0) && (
          <div className="space-y-6">
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {words.phrase?.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <ArrowRightLeft className="h-4 w-4" />
                    Фразовое соответствие
                  </h4>
                  <ScrollArea className="h-[200px] border border-amber-100 dark:border-amber-900/20 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <div className="space-y-2">
                      {words.phrase.map((phrase, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-md">
                          <span className="text-sm">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {words.strong?.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Plus className="h-4 w-4" />
                    Точное соответствие
                  </h4>
                  <ScrollArea className="h-[200px] border border-purple-100 dark:border-purple-900/20 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <div className="space-y-2">
                      {words.strong.map((phrase, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-md">
                          <span className="text-sm">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {words.excluded?.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                    <X className="h-4 w-4" />
                    Минус фразы
                  </h4>
                  <ScrollArea className="h-[200px] border border-red-100 dark:border-red-900/20 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <div className="space-y-2">
                      {words.excluded.map((phrase, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md">
                          <span className="text-sm">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {words.pluse?.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Plus className="h-4 w-4" />
                    Фиксированные фразы
                  </h4>
                  <ScrollArea className="h-[200px] border border-green-100 dark:border-green-900/20 rounded-lg p-3 bg-white dark:bg-gray-800">
                    <div className="space-y-2">
                      {words.pluse.map((phrase, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md">
                          <span className="text-sm">{phrase}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchKeywords;

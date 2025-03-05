
import { SearchKeywordResponse, getSearchKeywordStatistics } from '@/services/advertisingApi';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SearchKeywordStats from './SearchKeywordStats';

interface SearchKeywordsProps {
  campaignId: number;
  apiKey: string;
}

const SearchKeywords = ({ campaignId, apiKey }: SearchKeywordsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SearchKeywordResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId || !apiKey) return;
      
      setIsLoading(true);
      try {
        const keywordData = await getSearchKeywordStatistics(apiKey, campaignId);
        setData(keywordData);
      } catch (error) {
        console.error('Error fetching search keyword data:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные по ключевым фразам',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campaignId, apiKey, toast]);

  return (
    <div className="space-y-6">
      <SearchKeywordStats 
        campaignId={campaignId}
        apiKey={apiKey}
      />
    </div>
  );
};

export default SearchKeywords;

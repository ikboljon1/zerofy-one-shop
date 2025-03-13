
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Star, 
  Trophy, 
  Filter, 
  Check
} from 'lucide-react';

type FilterOption = 'all' | 'bestsellers' | 'high-margin' | 'low-stock';

interface BestSellerFilterProps {
  currentFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const BestSellerFilter: React.FC<BestSellerFilterProps> = ({ 
  currentFilter, 
  onFilterChange 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge 
        variant={currentFilter === 'all' ? 'default' : 'outline'} 
        className={`cursor-pointer px-3 py-1 ${currentFilter === 'all' ? 'bg-primary' : 'hover:bg-primary/10'}`}
        onClick={() => onFilterChange('all')}
      >
        <Filter className="h-3.5 w-3.5 mr-1" />
        Все товары
      </Badge>
      
      <Badge 
        variant={currentFilter === 'bestsellers' ? 'default' : 'outline'} 
        className={`cursor-pointer px-3 py-1 ${currentFilter === 'bestsellers' ? 'bg-amber-500 border-amber-500 hover:bg-amber-600' : 'text-amber-500 border-amber-500 hover:bg-amber-500/10'}`}
        onClick={() => onFilterChange('bestsellers')}
      >
        <Trophy className="h-3.5 w-3.5 mr-1" />
        Бестселлеры
      </Badge>
      
      <Badge 
        variant={currentFilter === 'high-margin' ? 'default' : 'outline'} 
        className={`cursor-pointer px-3 py-1 ${currentFilter === 'high-margin' ? 'bg-green-500 border-green-500 hover:bg-green-600' : 'text-green-500 border-green-500 hover:bg-green-500/10'}`}
        onClick={() => onFilterChange('high-margin')}
      >
        <TrendingUp className="h-3.5 w-3.5 mr-1" />
        Высокая маржа
      </Badge>
      
      <Badge 
        variant={currentFilter === 'low-stock' ? 'default' : 'outline'} 
        className={`cursor-pointer px-3 py-1 ${currentFilter === 'low-stock' ? 'bg-red-500 border-red-500 hover:bg-red-600' : 'text-red-500 border-red-500 hover:bg-red-500/10'}`}
        onClick={() => onFilterChange('low-stock')}
      >
        <Star className="h-3.5 w-3.5 mr-1" />
        Низкий остаток
      </Badge>
    </div>
  );
};

export default BestSellerFilter;

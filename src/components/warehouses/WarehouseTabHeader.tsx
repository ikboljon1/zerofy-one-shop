
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Book } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WarehouseTabHeaderProps {
  title: string;
  description: string;
  tooltipContent: React.ReactNode;
  isLoading: boolean;
  onRefresh: () => void;
}

const WarehouseTabHeader: React.FC<WarehouseTabHeaderProps> = ({
  title,
  description,
  tooltipContent,
  isLoading,
  onRefresh
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-1">
                <Book className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Обновить данные
      </Button>
    </div>
  );
};

export default WarehouseTabHeader;

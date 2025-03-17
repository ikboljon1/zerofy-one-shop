
import React, { ReactNode } from 'react';
import { Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface WarehouseTabHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  tooltipContent: ReactNode;
}

const WarehouseTabHeader: React.FC<WarehouseTabHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  tooltipContent 
}) => {
  return (
    <div className="flex items-center mb-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
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
  );
};

export default WarehouseTabHeader;

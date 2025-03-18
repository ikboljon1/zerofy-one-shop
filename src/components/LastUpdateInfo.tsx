
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LastUpdateInfoProps {
  timestamp: number | undefined;
  type: string;
}

export const LastUpdateInfo: React.FC<LastUpdateInfoProps> = ({ timestamp, type }) => {
  if (!timestamp) return null;

  const formattedDate = format(new Date(timestamp), 'dd MMMM yyyy HH:mm', { locale: ru });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Обновлено: {formattedDate}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Последнее обновление данных {type}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

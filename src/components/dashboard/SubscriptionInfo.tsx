
import React from 'react';
import { 
  Shield, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Info,
  Clock,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getUserSubscriptionData, SubscriptionData } from "@/services/userService";
import { format } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionInfoProps {
  userId: string;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [subscriptionData, setSubscriptionData] = React.useState<SubscriptionData | null>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        const data = await getUserSubscriptionData(userId);
        setSubscriptionData(data);
      } catch (error) {
        console.error("Failed to fetch subscription data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [userId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  const getTariffName = (id?: string): string => {
    if (!id) return 'Не определен';
    switch (id) {
      case "1": return "Стартовый";
      case "2": return "Бизнес";
      case "3": return "Премиум";
      case "4": return "Корпоративный";
      default: return `Тариф ${id}`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-muted-foreground">Информация о подписке не доступна</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { status, endDate, daysRemaining, tariffId } = subscriptionData;

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'trial':
        return <Sparkles className="h-6 w-6 text-amber-500" />;
      case 'expired':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Info className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'trial':
        return 'Пробный период';
      case 'expired':
        return 'Истекла';
      default:
        return 'Не определен';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'active':
        return daysRemaining ? `Осталось ${daysRemaining} дней` : 'Активная подписка';
      case 'trial':
        return daysRemaining ? `Осталось ${daysRemaining} дней триала` : 'Пробный период';
      case 'expired':
        return 'Подписка истекла';
      default:
        return 'Статус не определен';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'trial':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'expired':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow">
      <CardContent className={`p-4 ${isMobile ? 'space-y-6' : ''}`}>
        <CardTitle className="mb-4 text-xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Информация о подписке
        </CardTitle>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'}`}>
          <div className={`p-4 rounded-md border ${getStatusColor()} transition-all hover:shadow-md`}>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon()}
              <span className="font-medium text-lg">Статус</span>
            </div>
            <p className="ml-9 text-base font-medium">{getStatusText()}</p>
            <p className="ml-9 text-sm text-muted-foreground mt-1">{getStatusDescription()}</p>
          </div>
          
          <div className="p-4 rounded-md border bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="h-6 w-6 text-blue-500" />
              <span className="font-medium text-lg">Тариф</span>
            </div>
            <p className="ml-9 text-base font-medium">{getTariffName(tariffId)}</p>
            <p className="ml-9 text-sm text-muted-foreground mt-1">
              {status === 'active' ? 'Активный тарифный план' : 'Неактивный тарифный план'}
            </p>
          </div>
          
          {endDate && (
            <div className="p-4 rounded-md border bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-6 w-6 text-purple-500" />
                <span className="font-medium text-lg">Дата окончания</span>
              </div>
              <p className="ml-9 text-base font-medium">{formatDate(endDate)}</p>
              <p className="ml-9 text-sm text-muted-foreground mt-1">
                <Clock className="inline-block h-4 w-4 mr-1 relative -top-[1px]" />
                {daysRemaining ? `${daysRemaining} дней до окончания` : 'Срок истек'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfo;

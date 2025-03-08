
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Store, CreditCard } from "lucide-react";
import { 
  activateSubscription, 
  TARIFF_STORE_LIMITS,
  User,
  getUserSubscriptionData,
  SubscriptionData
} from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

interface TariffSelectionProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

interface TariffOption {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  storeLimit: number;
  isPopular?: boolean;
}

const TARIFF_OPTIONS: TariffOption[] = [
  {
    id: "1",
    name: "Стартовый",
    description: "Идеально для начинающих продавцов",
    price: 990,
    features: [
      "Доступ к основным отчетам",
      "Управление до 100 товаров",
      "Базовая аналитика",
      "Email поддержка"
    ],
    storeLimit: TARIFF_STORE_LIMITS["1"]
  },
  {
    id: "2",
    name: "Бизнес",
    description: "Для растущих магазинов",
    price: 1990,
    features: [
      "Все функции Стартового тарифа",
      "Управление до 1000 товаров",
      "Расширенная аналитика",
      "Приоритетная поддержка",
      "API интеграции"
    ],
    storeLimit: TARIFF_STORE_LIMITS["2"],
    isPopular: true
  },
  {
    id: "3",
    name: "Премиум",
    description: "Комплексное решение для крупных продавцов",
    price: 4990,
    features: [
      "Все функции Бизнес тарифа",
      "Неограниченное количество товаров",
      "Персональный менеджер",
      "Расширенный API доступ",
      "Приоритетные обновления"
    ],
    storeLimit: TARIFF_STORE_LIMITS["3"]
  },
  {
    id: "4",
    name: "Корпоративный",
    description: "Индивидуальные решения для крупного бизнеса",
    price: 9990,
    features: [
      "Все функции Премиум тарифа",
      "Индивидуальные интеграции",
      "Персональная команда поддержки",
      "Консультации экспертов",
      "SLA гарантии"
    ],
    storeLimit: TARIFF_STORE_LIMITS["4"]
  }
];

export default function TariffSelection({ user, onUserUpdated }: TariffSelectionProps) {
  const [selectedTariff, setSelectedTariff] = useState<string | null>(null);
  const [subscriptionMonths, setSubscriptionMonths] = useState(1);
  const [isActivating, setIsActivating] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        const data = await getUserSubscriptionData(user.id);
        setSubscriptionData(data);
        
        // Set default selected tariff to current tariff or first one if no subscription
        if (data.status === 'active') {
          setSelectedTariff(data.tariffId || '1');
        } else {
          setSelectedTariff('2'); // Default to Business plan
        }
      } catch (error) {
        console.error("Failed to load subscription data:", error);
      }
    };
    
    loadSubscriptionData();
  }, [user.id]);

  const handleSubscriptionMonthsChange = (months: number) => {
    setSubscriptionMonths(months);
  };

  const handleTariffSelect = (tariffId: string) => {
    setSelectedTariff(tariffId);
  };

  const handleActivateSubscription = async () => {
    if (!selectedTariff) {
      toast({
        title: "Выберите тариф",
        description: "Пожалуйста, выберите тарифный план",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    try {
      const result = await activateSubscription(
        user.id, 
        selectedTariff, 
        subscriptionMonths
      );
      
      if (result.success && result.user) {
        onUserUpdated(result.user);
        
        const newSubData = await getUserSubscriptionData(user.id);
        setSubscriptionData(newSubData);
        
        toast({
          title: "Подписка активирована",
          description: result.message || "Ваша подписка успешно активирована",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось активировать подписку",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const getActivePlanMessage = () => {
    if (!subscriptionData) return null;
    
    if (subscriptionData.status === 'trial') {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-6">
          <h3 className="font-medium">У вас активирован пробный период</h3>
          <p>Тариф: "Премиум"</p>
          <p>Осталось дней: {subscriptionData.daysRemaining || 0}</p>
          <p className="text-sm mt-2">Выберите и оплатите тариф, чтобы продолжить пользоваться сервисом</p>
        </div>
      );
    }
    
    if (subscriptionData.status === 'active') {
      const tariff = TARIFF_OPTIONS.find(t => t.id === subscriptionData.tariffId) || TARIFF_OPTIONS[0];
      return (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-6">
          <h3 className="font-medium">Ваш текущий тариф: {tariff.name}</h3>
          <p>Активен до: {subscriptionData.endDate ? new Date(subscriptionData.endDate).toLocaleDateString() : 'неизвестно'}</p>
          <p>Осталось дней: {subscriptionData.daysRemaining || 0}</p>
        </div>
      );
    }
    
    if (subscriptionData.status === 'expired') {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-6">
          <h3 className="font-medium">Ваша подписка истекла</h3>
          <p className="text-sm mt-2">Выберите и оплатите тариф, чтобы продолжить пользоваться сервисом</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Выбор тарифа</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Выберите подходящий для вас тарифный план
        </p>
      </div>

      {getActivePlanMessage()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TARIFF_OPTIONS.map((tariff) => (
          <Card 
            key={tariff.id} 
            className={`border-2 h-full flex flex-col relative ${
              tariff.isPopular 
                ? 'border-blue-400 dark:border-blue-600 shadow-lg' 
                : selectedTariff === tariff.id 
                  ? 'border-green-400 dark:border-green-600 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => handleTariffSelect(tariff.id)}
          >
            {tariff.isPopular && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-blue-500">Популярный</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 dark:text-white">
                {tariff.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {tariff.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">
                  {tariff.price} ₽
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  /мес
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-3 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <Store className="mr-2 h-5 w-5" />
                {tariff.storeLimit === 999 ? 
                  'Неограниченное количество магазинов' : 
                  `До ${tariff.storeLimit} ${tariff.storeLimit === 1 ? 'магазина' : 'магазинов'}`
                }
              </div>
              <ul className="space-y-2">
                {tariff.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button 
                variant={selectedTariff === tariff.id ? "default" : "outline"} 
                className="w-full"
                onClick={() => handleTariffSelect(tariff.id)}
              >
                {selectedTariff === tariff.id ? 'Выбрано' : 'Выбрать'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Оформление подписки</CardTitle>
          <CardDescription>Выберите период подписки и произведите оплату</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">Выбранный тариф:</h3>
              {selectedTariff ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">
                    {TARIFF_OPTIONS.find(t => t.id === selectedTariff)?.name || 'Тариф не выбран'}
                  </span>
                </div>
              ) : (
                <p className="text-red-500">Пожалуйста, выберите тариф выше</p>
              )}
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-2">Период подписки:</h3>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 6, 12].map((months) => (
                  <Button
                    key={months}
                    type="button"
                    variant={subscriptionMonths === months ? "default" : "outline"}
                    onClick={() => handleSubscriptionMonthsChange(months)}
                    className={`flex-1 ${
                      months >= 6 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
                    }`}
                  >
                    {months} {months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}
                    {months >= 6 && (
                      <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
                        {months === 6 ? '-5%' : '-10%'}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium mb-2">Сумма к оплате:</h3>
              {selectedTariff ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {(() => {
                        const tariff = TARIFF_OPTIONS.find(t => t.id === selectedTariff);
                        if (!tariff) return '0 ₽';
                        
                        let price = tariff.price * subscriptionMonths;
                        // Apply discount for longer subscription periods
                        if (subscriptionMonths >= 12) {
                          price = Math.round(price * 0.9); // 10% discount
                        } else if (subscriptionMonths >= 6) {
                          price = Math.round(price * 0.95); // 5% discount
                        }
                        
                        return `${price.toLocaleString()} ₽`;
                      })()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {subscriptionMonths} {subscriptionMonths === 1 ? 'месяц' : subscriptionMonths < 5 ? 'месяца' : 'месяцев'}
                    </p>
                  </div>
                  <Button
                    onClick={handleActivateSubscription}
                    disabled={isActivating || !selectedTariff}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isActivating ? 'Обработка...' : 'Оплатить'}
                  </Button>
                </div>
              ) : (
                <p className="text-red-500">Выберите тариф, чтобы увидеть сумму</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

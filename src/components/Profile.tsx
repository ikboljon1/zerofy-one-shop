
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import PasswordChangeForm from './PasswordChangeForm';
import { User, getUserSubscriptionData, SubscriptionData, getPaymentHistory, PaymentHistoryItem } from '@/services/userService';
import { format } from 'date-fns';
import TariffSelection from './TariffSelection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, User as UserIcon, Package } from "lucide-react";

interface ProfileProps {
  user: User;
  onUserUpdated: (user: User) => void;
}

export default function Profile({ user, onUserUpdated }: ProfileProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        const data = await getUserSubscriptionData(user.id);
        setSubscriptionData(data);
      } catch (error) {
        console.error("Failed to load subscription data:", error);
      }
    };

    const loadPaymentHistory = async () => {
      try {
        const history = await getPaymentHistory(user.id);
        setPaymentHistory(history);
      } catch (error) {
        console.error("Failed to load payment history:", error);
      }
    };

    loadSubscriptionData();
    loadPaymentHistory();
  }, [user.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  const getTariffName = (id: string): string => {
    switch (id) {
      case "1": return "Стартовый";
      case "2": return "Бизнес";
      case "3": return "Премиум";
      case "4": return "Корпоративный";
      default: return `Тариф ${id}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="tariff" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Тарифы
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Платежи
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Профиль</CardTitle>
                <CardDescription>Информация о вашем аккаунте</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-500 mb-4">{user.email}</p>
                
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Компания:</span>
                    <span>{user.company || 'Не указана'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Телефон:</span>
                    <span>{user.phone || 'Не указан'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Дата регистрации:</span>
                    <span>{formatDate(user.registeredAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Последний вход:</span>
                    <span>{user.lastLogin ? formatDate(user.lastLogin) : 'Неизвестно'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Изменение пароля</CardTitle>
                <CardDescription>Обновите пароль вашей учетной записи</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm userId={user.id} />
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Информация о подписке</CardTitle>
                <CardDescription>Текущий статус вашей подписки</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</h3>
                        <div className="text-lg font-semibold">
                          {subscriptionData.status === 'active' && (
                            <span className="text-green-600 dark:text-green-400">Активна</span>
                          )}
                          {subscriptionData.status === 'trial' && (
                            <span className="text-amber-600 dark:text-amber-400">Пробный период</span>
                          )}
                          {subscriptionData.status === 'expired' && (
                            <span className="text-red-600 dark:text-red-400">Истекла</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Тариф</h3>
                        <div className="text-lg font-semibold">
                          {subscriptionData.status === 'trial' ? (
                            <span>Премиум (пробный)</span>
                          ) : (
                            <span>{getTariffName(subscriptionData.tariffId || user.tariffId)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {subscriptionData.status === 'expired' ? 'Истекла' : 'Действует до'}
                        </h3>
                        <div className="text-lg font-semibold">
                          {subscriptionData.endDate ? (
                            <span>{formatDate(subscriptionData.endDate)}</span>
                          ) : (
                            <span>-</span>
                          )}
                          {subscriptionData.daysRemaining !== undefined && subscriptionData.daysRemaining > 0 && (
                            <span className="text-sm ml-2 text-gray-500">
                              (осталось {subscriptionData.daysRemaining} {
                                subscriptionData.daysRemaining === 1 ? 'день' : 
                                subscriptionData.daysRemaining < 5 ? 'дня' : 'дней'
                              })
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {subscriptionData.status !== 'active' && (
                      <div className="mt-4">
                        <Button onClick={() => setActiveTab('tariff')}>
                          {subscriptionData.status === 'trial' ? 'Выбрать тариф' : 'Активировать подписку'}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>Загрузка информации о подписке...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tariff">
          <TariffSelection user={user} onUserUpdated={onUserUpdated} />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>История платежей</CardTitle>
              <CardDescription>Информация о ваших платежах</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Дата</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Описание</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Тариф</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Период</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Сумма</th>
                        <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-3">{formatDate(payment.date)}</td>
                          <td className="px-4 py-3">{payment.description}</td>
                          <td className="px-4 py-3">{payment.tariff}</td>
                          <td className="px-4 py-3">{payment.period}</td>
                          <td className="px-4 py-3 font-medium">{payment.amount} ₽</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {payment.status === 'success' ? 'Успешно' : 'Ошибка'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  У вас пока нет платежей
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

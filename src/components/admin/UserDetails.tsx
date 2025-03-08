
import { useState, useEffect } from "react";
import { 
  User, 
  updateUser, 
  getTrialDaysRemaining,
  activateSubscription,
  getSubscriptionStatus as fetchSubscriptionStatus
} from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  User as UserIcon, 
  Save, 
  ShieldAlert, 
  Calendar, 
  Mail, 
  Clock,
  AlertTriangle,
  BadgeDollarSign,
  Badge as BadgeIcon,
  TimerReset,
  CheckCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDetailsProps {
  user: User;
  onBack: () => void;
  onUserUpdated: (user: User) => void;
}

export default function UserDetails({ user, onBack, onUserUpdated }: UserDetailsProps) {
  const [formData, setFormData] = useState<User>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    isActive: boolean;
    daysRemaining: number;
    endDate?: string;
  } | null>(null);
  const [isActivatingSubscription, setIsActivatingSubscription] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(user);
    
    if (user.trialEndDate) {
      // Fetch trial days remaining
      getTrialDaysRemaining(user.id).then(days => {
        setTrialDaysRemaining(days);
      });
    }
    
    if (user.subscriptionEndDate) {
      // Fetch subscription status
      fetchSubscriptionStatus(user.id).then(data => {
        setSubscriptionData(data);
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: 'admin' | 'user') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }));
  };

  const handleExtendTrial = () => {
    // Calculate new trial end date (extend by 7 days)
    const currentDate = new Date();
    const newTrialEndDate = new Date();
    newTrialEndDate.setDate(currentDate.getDate() + 7);
    
    setFormData(prev => ({ 
      ...prev, 
      isInTrial: true,
      trialEndDate: newTrialEndDate.toISOString() 
    }));
    
    toast({
      title: "Пробный период продлен",
      description: "Пробный период продлен на 7 дней",
    });
  };

  const handleActivateSubscription = async () => {
    if (!formData.tariffId) {
      toast({
        title: "Ошибка",
        description: "Выберите тарифный план",
        variant: "destructive"
      });
      return;
    }
    
    setIsActivatingSubscription(true);
    
    try {
      const result = await activateSubscription(formData.id, formData.tariffId, 1);
      
      if (result.success && result.user) {
        setFormData(result.user);
        onUserUpdated(result.user);
        
        // Use the imported async function, not the local synchronous one
        fetchSubscriptionStatus(formData.id).then(data => {
          setSubscriptionData(data);
        });
        
        toast({
          title: "Подписка активирована",
          description: result.message,
        });
      } else {
        throw new Error(result.message || "Ошибка активации подписки");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось активировать подписку",
        variant: "destructive"
      });
    } finally {
      setIsActivatingSubscription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedUser = await updateUser(user.id, formData);
      if (updatedUser) {
        toast({
          title: "Успешно",
          description: "Информация о пользователе обновлена",
        });
        onUserUpdated(updatedUser);
      } else {
        throw new Error("Не удалось обновить пользователя");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию о пользователе",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getTrialProgress = (): number => {
    if (!formData.trialEndDate) return 0;
    
    const startDate = new Date(formData.registeredAt);
    const endDate = new Date(formData.trialEndDate);
    const currentDate = new Date();
    
    const trialDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / trialDuration) * 100));
  };

  const getSubscriptionProgress = (): number => {
    if (!formData.subscriptionEndDate) return 0;
    
    // If we don't know when subscription started, assume it's one month before end date
    const endDate = new Date(formData.subscriptionEndDate);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1);
    
    const currentDate = new Date();
    const subscriptionDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / subscriptionDuration) * 100));
  };

  const getTrialStatus = (): 'active' | 'expired' | 'not-applicable' => {
    if (!formData.trialEndDate) return 'not-applicable';
    if (!formData.isInTrial) return 'not-applicable';
    
    const now = new Date();
    const endDate = new Date(formData.trialEndDate);
    
    if (now > endDate) return 'expired';
    return 'active';
  };

  const getSubscriptionStatus = (): 'active' | 'expired' | 'not-applicable' => {
    if (!formData.subscriptionEndDate) return 'not-applicable';
    
    const now = new Date();
    const endDate = new Date(formData.subscriptionEndDate);
    
    if (now > endDate) return 'expired';
    return 'active';
  };

  const getTariffName = (tariffId?: string): string => {
    if (!tariffId) return 'Не выбран';
    
    switch (tariffId) {
      case '1': return 'Базовый';
      case '2': return 'Профессиональный';
      case '3': return 'Бизнес';
      case '4': return 'Корпоративный';
      default: return `Тариф ${tariffId}`;
    }
  };

  // Directly compute the trial and subscription status
  const trialStatus = getTrialStatus();
  const subscriptionStatus = getSubscriptionStatus();

  // Determine if the user should be blocked from using the system
  const isUserBlocked = (
    (subscriptionStatus === 'expired' && !formData.isInTrial) || 
    (trialStatus === 'expired' && subscriptionStatus !== 'active') ||
    formData.status === 'inactive'
  );

  return (
    <Card className="h-full overflow-hidden border border-gray-800 shadow-xl rounded-3xl bg-gray-900">
      <CardHeader className="p-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full text-white hover:bg-white/20 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <span>Информация о пользователе</span>
          </CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6 overflow-auto h-[calc(100%-14rem)] bg-gray-900">
          {/* User access warning */}
          {isUserBlocked && (
            <Alert className="bg-red-900/30 border-red-800/30 text-red-300 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDescription className="font-semibold">
                Пользователь заблокирован! Доступ к системе ограничен.
                {formData.status === 'inactive' ? 
                  ' Аккаунт пользователя неактивен.' : 
                  ' Срок действия подписки или пробного периода истек.'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-gray-800 shadow-lg">
                <AvatarImage src={formData.avatar} alt={formData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-900 text-white text-2xl">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="w-full rounded-full border-gray-700 bg-gray-800 hover:bg-gray-700">
                Изменить фото
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">ФИО</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="pl-9 rounded-xl bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      className="pl-9 rounded-xl bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-sm font-medium">Роль пользователя</Label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleRoleChange(value as 'admin' | 'user')}
                    >
                      <SelectTrigger className="pl-9 rounded-xl bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="admin">Администратор</SelectItem>
                        <SelectItem value="user">Пользователь</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Статус аккаунта</Label>
                  <div className="flex items-center justify-between border border-gray-700 p-3 rounded-xl bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{formData.status === 'active' ? 'Активен' : 'Неактивен'}</span>
                    </div>
                    <Switch 
                      checked={formData.status === 'active'} 
                      onCheckedChange={handleStatusChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6 bg-gray-800" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-blue-500" />
              Тарифный план и подписка
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-800 rounded-xl p-5 bg-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BadgeIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Текущий тарифный план</span>
                </div>
                <div className="relative">
                  <Select 
                    value={formData.tariffId || '1'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tariffId: value }))}
                  >
                    <SelectTrigger className="w-full rounded-xl bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1">Базовый (1 магазин)</SelectItem>
                      <SelectItem value="2">Профессиональный (3 магазина)</SelectItem>
                      <SelectItem value="3">Бизнес (10 магазинов)</SelectItem>
                      <SelectItem value="4">Корпоративный (без ограничений)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-4 bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Текущий тариф:</span>
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                      {getTariffName(formData.tariffId)}
                    </Badge>
                  </div>
                </div>
                
                {/* Subscription Activation Button */}
                <Button
                  type="button"
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleActivateSubscription}
                  disabled={isActivatingSubscription}
                >
                  {isActivatingSubscription ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">&#8230;</span>
                      Активация...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Активировать подписку на 1 месяц
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Trial Period Card */}
              {formData.isInTrial && (
                <div className="border border-gray-800 rounded-xl p-5 bg-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      trialStatus === 'active' ? 'text-yellow-500' : 
                      trialStatus === 'expired' ? 'text-red-500' : 
                      'text-green-500'
                    }`} />
                    <span className="font-medium">Пробный период</span>
                    
                    {trialStatus === 'active' && (
                      <Badge className="ml-auto bg-yellow-500">
                        Активен
                      </Badge>
                    )}
                    
                    {trialStatus === 'expired' && (
                      <Badge className="ml-auto bg-red-500">
                        Истек
                      </Badge>
                    )}
                  </div>
                  
                  {formData.trialEndDate && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Прогресс</span>
                          <span>{Math.round(getTrialProgress())}%</span>
                        </div>
                        <Progress 
                          value={getTrialProgress()} 
                          className={trialStatus === 'expired' ? "h-2 bg-red-950" : "h-2"}
                        />
                        
                        {trialStatus === 'active' && (
                          <Alert className="bg-yellow-900/30 border-yellow-800/30 text-yellow-300 mt-3">
                            <AlertDescription className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span>Осталось дней:</span>
                                <Badge variant="outline" className="bg-yellow-900/50 border-yellow-700 text-yellow-300">
                                  {trialDaysRemaining !== null ? trialDaysRemaining : '...'}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Дата окончания:</span>
                                <span className="font-medium">{formatDate(formData.trialEndDate)}</span>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {trialStatus === 'expired' && (
                          <Alert className="bg-red-900/30 border-red-800/30 text-red-300 mt-3">
                            <AlertDescription className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span>Дата окончания:</span>
                                <span className="font-medium">{formatDate(formData.trialEndDate)}</span>
                              </div>
                              <div>
                                <span className="text-red-300">
                                  Пробный период истек. Функциональность системы ограничена. Пожалуйста, приобретите подписку для продолжения использования всех функций системы.
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                <Button 
                                  type="button" 
                                  variant="outline"  
                                  className="gap-1 bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/50"
                                  onClick={handleExtendTrial}
                                >
                                  <TimerReset className="h-4 w-4" />
                                  <span>Продлить пробный период</span>
                                </Button>
                                <Button 
                                  type="button"
                                  variant="default"
                                  className="gap-1 bg-green-600 hover:bg-green-700"
                                  onClick={handleActivateSubscription}
                                  disabled={isActivatingSubscription}
                                >
                                  <BadgeDollarSign className="h-4 w-4" />
                                  <span>Оплатить подписку</span>
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Subscription Status Card */}
              {formData.subscriptionEndDate && (
                <div className={`border border-gray-800 rounded-xl p-5 bg-gray-800 shadow-sm ${!formData.isInTrial ? 'md:col-span-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BadgeDollarSign className={`h-5 w-5 ${
                      subscriptionStatus === 'active' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className="font-medium">Подписка</span>
                    
                    {subscriptionStatus === 'active' && (
                      <Badge className="ml-auto bg-green-600">
                        Активна
                      </Badge>
                    )}
                    
                    {subscriptionStatus === 'expired' && (
                      <Badge className="ml-auto bg-red-500">
                        Истекла
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Прогресс подписки</span>
                      <span>{Math.round(getSubscriptionProgress())}%</span>
                    </div>
                    <Progress 
                      value={getSubscriptionProgress()} 
                      className={subscriptionStatus === 'expired' ? "h-2 bg-red-950" : "h-2"}
                    />
                    
                    {subscriptionStatus === 'active' && (
                      <Alert className="bg-green-900/30 border-green-800/30 text-green-300 mt-3">
                        <AlertDescription className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span>Тариф:</span>
                            <Badge variant="outline" className="bg-green-900/50 border-green-700 text-green-300">
                              {getTariffName(formData.tariffId)}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Дата окончания:</span>
                            <span className="font-medium">{formatDate(formData.subscriptionEndDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Осталось дней:</span>
                            <Badge variant="outline" className="bg-green-900/50 border-green-700 text-green-300">
                              {subscriptionData?.daysRemaining || '...'}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {subscriptionStatus === 'expired' && (
                      <Alert className="bg-red-900/30 border-red-800/30 text-red-300 mt-3">
                        <AlertDescription className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span>Дата окончания:</span>
                            <span className="font-medium">{formatDate(formData.subscriptionEndDate)}</span>
                          </div>
                          <div>
                            <span className="text-red-300">
                              Подписка истекла. Доступ к системе ограничен. Пожалуйста, продлите подписку для возобновления доступа.
                            </span>
                          </div>
                          <Button 
                            type="button"
                            onClick={handleActivateSubscription}
                            disabled={isActivatingSubscription}
                            className="mt-2 gap-1 bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/50"
                          >
                            {isActivatingSubscription ? (
                              <span className="animate-spin">&#8230;</span>
                            ) : (
                              <>
                                <BadgeDollarSign className="h-4 w-4" />
                                <span>Продлить подписку</span>
                              </>
                            )}
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-6 bg-gray-800" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Системная информация
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Дата регистрации</span>
                </div>
                <p className="font-medium">{formatDate(formData.registeredAt)}</p>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-700">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Последний вход</span>
                </div>
                <p className="font-medium">{formData.lastLogin ? formatDate(formData.lastLogin) : "Нет данных"}</p>
              </div>
              
              {isUserBlocked && (
                <div className="col-span-1 sm:col-span-2">
                  <Alert className="bg-red-900/20 border-red-800/30 text-red-300">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      {formData.status === 'inactive' 
                        ? "Аккаунт пользователя неактивен. Пользователь не может войти в систему."
                        : "Срок действия подписки истек. Доступ пользователя к системе заблокирован до продления подписки."}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {formData.status === 'active' && subscriptionStatus === 'expired' && !formData.isInTrial && (
                <div className="col-span-1 sm:col-span-2">
                  <Alert className="bg-red-900/20 border-red-800/30 text-red-300">
                    <AlertDescription>
                      Подписка истекла. Доступ к функциям системы ограничен. Для восстановления полного доступа необходимо продлить подписку.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-5 bg-gray-800 border-t border-gray-700 flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} className="rounded-xl bg-gray-700 border-gray-600 hover:bg-gray-600">
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="gap-1 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700"
          >
            {isSubmitting && <span className="animate-spin">&#8230;</span>}
            <Save className="h-4 w-4" />
            <span>Сохранить</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  History,
  User,
  DollarSign,
  Mail,
  Phone,
  Building,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Clock,
  Lock,
  LogOut,
  CreditCardIcon,
  CalendarClock,
  Star,
  ShieldCheck,
  Award,
  ArrowRight,
  ShieldAlert,
  UserCog,
  Check,
  CalendarIcon,
  ShoppingBag
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TARIFF_STORE_LIMITS, getTrialDaysRemaining, getSubscriptionStatus, User as UserType } from "@/services/userService";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SavedCard {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  lastFour: string;
}

interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: string;
  description: string;
  status: string;
  tariff: string;
  period: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan: string;
    endDate: string;
    daysRemaining: number;
    isActive: boolean;
  } | null>(null);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserProfile(user);
      
      const mockSubscriptionData = {
        plan: user.tariffId === "3" ? "Премиум" : 
              user.tariffId === "2" ? "Бизнес" : 
              user.tariffId === "4" ? "Корпоративный" : "Стартовый",
        endDate: user.subscriptionEndDate || "2024-12-31T23:59:59Z",
        daysRemaining: 30,
        isActive: user.isSubscriptionActive || true
      };
      
      setCurrentSubscription(mockSubscriptionData);
      setIsSubscriptionExpired(!mockSubscriptionData.isActive);
      
      setIsLoadingHistory(true);
      import('@/services/userService').then(({ getPaymentHistory }) => {
        getPaymentHistory(user.id).then((history) => {
          setPaymentHistory(history);
          setIsLoadingHistory(false);
        });
      });
    }
    
    const storedCard = localStorage.getItem('savedCard');
    if (storedCard) {
      setSavedCard(JSON.parse(storedCard));
    }
  }, []);

  const userData = userProfile || {
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+7 (999) 123-45-67",
    company: "ООО Компания",
    subscription: "Бизнес",
    subscriptionEnd: "31.12.2024",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan"
  };

  const subscriptionPlans = [
    {
      id: "1",
      name: "Стартовый",
      price: "2000 ₽/мес",
      priceValue: 2000,
      color: "bg-blue-600",
      features: ["1 магазин", "Базовая аналитика", "Email поддержка"],
      icon: ShoppingBag
    },
    {
      id: "2",
      name: "Бизнес",
      price: "5000 ₽/мес",
      priceValue: 5000,
      color: "bg-purple-600",
      features: [
        "До 3 магазинов",
        "Расширенная аналитика",
        "Приоритетная поддержка",
        "API доступ",
      ],
      icon: Star
    },
    {
      id: "3",
      name: "Премиум",
      price: "10000 ₽/мес",
      priceValue: 10000,
      color: "bg-amber-500",
      features: [
        "До 10 магазинов",
        "Полная аналитика",
        "24/7 поддержка",
        "API доступ",
        "Персональный менеджер",
      ],
      icon: Award
    },
    {
      id: "4",
      name: "Корпоративный",
      price: "30000 ₽/мес",
      priceValue: 30000,
      color: "bg-emerald-600",
      features: [
        "Неограниченное количество магазинов",
        "Корпоративные отчеты",
        "Выделенная линия поддержки",
        "Полный API доступ",
        "Команда персональных менеджеров",
        "Интеграция с корпоративными системами"
      ],
      icon: ShieldCheck
    }
  ];

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    toast({
      title: "Подписка выбрана",
      description: `Вы выбрали тариф ${planName}`,
    });
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) {
      toast({
        title: "Выберите тариф",
        description: "Пожалуйста, выберите тариф для продолжения",
        variant: "destructive",
      });
      return;
    }
    setActiveTab("payment");
  };

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }
    return digits;
  };

  const getLastFourDigits = (cardNum: string): string => {
    const digits = cardNum.replace(/\D/g, '');
    return digits.slice(-4);
  };

  const handleAddCard = async () => {
    if (isAddingCard) {
      if (!cardNumber || !expiryDate || !cvv) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все поля карты",
          variant: "destructive",
        });
        return;
      }

      const cardDigits = cardNumber.replace(/\s/g, '');
      if (cardDigits.length !== 16 || !/^\d+$/.test(cardDigits)) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, введите корректный номер карты (16 цифр)",
          variant: "destructive",
        });
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, введите дату в формате ММ/ГГ",
          variant: "destructive",
        });
        return;
      }

      if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        toast({
          title: "Ошибка",
          description: "CVV должен состоять из 3 цифр",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newCard: SavedCard = {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          lastFour: getLastFourDigits(cardNumber)
        };
        
        localStorage.setItem('savedCard', JSON.stringify(newCard));
        setSavedCard(newCard);
        
        toast({
          title: "Карта добавлена",
          description: "Ваша карта успешно добавлена",
        });
        
        setIsAddingCard(false);
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить карту",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsAddingCard(true);
    }
  };

  const handleDeleteCard = () => {
    localStorage.removeItem('savedCard');
    setSavedCard(null);
    toast({
      title: "Карта удалена",
      description: "Ваша карта успешно удалена",
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast({
        title: "Выберите тариф",
        description: "Пожалуйста, выберите тариф для продолжения",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!userProfile) {
        throw new Error("Пользователь не найден");
      }
      
      const selectedPlanObject = subscriptionPlans.find(plan => plan.name === selectedPlan);
      
      if (!selectedPlanObject) {
        throw new Error("Тариф не найден");
      }
      
      const { activateSubscription, addPaymentRecord } = await import('@/services/userService');
      
      const result = await activateSubscription(
        userProfile.id, 
        selectedPlanObject.id, 
        1 // 1 month
      );
      
      if (result.success && result.user) {
        await addPaymentRecord(
          userProfile.id,
          selectedPlanObject.id,
          selectedPlanObject.priceValue,
          1 // 1 month
        );
        
        setUserProfile(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setCurrentSubscription({
          plan: selectedPlan,
          endDate: result.user.subscriptionEndDate || new Date().toISOString(),
          daysRemaining: 30,
          isActive: true
        });
        
        setIsSubscriptionExpired(false);
        
        const history = await import('@/services/userService').then(({ getPaymentHistory }) => 
          getPaymentHistory(userProfile.id)
        );
        setPaymentHistory(history);
      }
      
      toast({
        title: "Успешно",
        description: `Подписка ${selectedPlan} успешно оформлена`,
      });
      
      setActiveTab("subscription");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить платеж",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getSubscriptionProgress = (): number => {
    if (!currentSubscription) return 0;
    if (!currentSubscription.isActive) return 100;
    
    const daysInMonth = 30;
    const daysElapsed = daysInMonth - currentSubscription.daysRemaining;
    return Math.min(100, Math.max(0, (daysElapsed / daysInMonth) * 100));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Вы вышли из системы",
      description: "Перенаправление на страницу входа...",
    });
    
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const SubscriptionExpiredAlert = () => {
    if (!isSubscriptionExpired) return null;
    
    return (
      <Alert variant="destructive" className="mb-6">
        <Lock className="h-5 w-5" />
        <AlertDescription>
          <div className="font-bold text-lg">Ваша подписка истекла!</div>
          <p>Доступ к функциям системы ограничен. Пожалуйста, продлите подписку для восстановления полного доступа.</p>
          <Button 
            className="mt-2 w-full sm:w-auto" 
            onClick={() => setActiveTab("subscription")}
          >
            Продлить подписку
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  const getStoreLimit = () => {
    if (!userProfile || !userProfile.tariffId) return 1;
    return userProfile.tariffId in TARIFF_STORE_LIMITS ? TARIFF_STORE_LIMITS[userProfile.tariffId] : 1;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground">Управление вашим профилем и подпиской</p>
        </div>
        
        <Button 
          variant="destructive" 
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Выйти из системы
        </Button>
      </div>
      
      <SubscriptionExpiredAlert />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{userData.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1 mt-1">
              <Mail className="h-3.5 w-3.5" />
              {userData.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Тариф:</span>
                <Badge className={`${
                  userProfile?.tariffId === "3" ? "bg-amber-500/90" : 
                  userProfile?.tariffId === "2" ? "bg-purple-600/90" : 
                  "bg-blue-600/90"
                }`}>
                  {currentSubscription?.plan || "Стартовый"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Магазины:</span>
                <Badge variant="outline" className="flex items-center gap-1.5 bg-blue-950/30 text-blue-400 border-blue-800">
                  <ShoppingBag className="h-3 w-3" />
                  <span>{userProfile?.storeCount || 0}/{getStoreLimit()}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Статус:</span>
                {isSubscriptionExpired ? (
                  <Badge variant="destructive">Истекла</Badge>
                ) : (
                  <Badge className="bg-green-600">Активна</Badge>
                )}
              </div>
              <Separator className="my-2" />
              <Button 
                onClick={() => setActiveTab("profile")}
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                Редактировать профиль
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Информация о подписке</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSubscription && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Тарифный план:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{currentSubscription.plan}</span>
                    {currentSubscription.isActive ? (
                      <Badge className="bg-green-600">Активна</Badge>
                    ) : (
                      <Badge variant="destructive">Истекла</Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс подписки</span>
                    <span>{Math.round(getSubscriptionProgress())}%</span>
                  </div>
                  <Progress 
                    value={getSubscriptionProgress()} 
                    className={!currentSubscription.isActive ? "h-2 bg-red-950" : "h-2"} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="bg-card rounded-lg p-4 border flex flex-col items-center justify-center space-y-1 text-center">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Дата окончания</span>
                    <span className="font-medium">{formatDate(currentSubscription.endDate)}</span>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border flex flex-col items-center justify-center space-y-1 text-center">
                    <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Осталось дней</span>
                    <Badge variant="outline" className="font-medium mt-1">
                      {currentSubscription.daysRemaining}
                    </Badge>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border flex flex-col items-center justify-center space-y-1 text-center">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Лимит магазинов</span>
                    <Badge variant="outline" className="font-medium mt-1">
                      {getStoreLimit()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2 mt-4">
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab("subscription")}
                  >
                    <Star className="h-4 w-4" />
                    {currentSubscription.isActive ? "Изменить тариф" : "Активировать подписку"}
                  </Button>
                  <Button 
                    className="flex items-center gap-2"
                    variant="outline"
                    onClick={() => setActiveTab("payment")}
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    Управление платежами
                  </Button>
                  <Button 
                    className="flex items-center gap-2"
                    variant="outline"
                    onClick={() => setActiveTab("history")}
                  >
                    <History className="h-4 w-4" />
                    История платежей
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>Подписка</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>Оплата</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>История</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>
                Обновите информацию о себе и вашей компании
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ФИО</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      defaultValue={userData.name}
                      className="pl-10"
                    />
                    <User className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userData.email}
                      className="pl-10"
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      defaultValue={userData.phone || ''}
                      className="pl-10"
                    />
                    <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <div className="relative">
                    <Input
                      id="company"
                      defaultValue={userData.company || ''}
                      className="pl-10"
                    />
                    <Building className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <Button 
                  className="w-full md:w-auto" 
                  disabled={isSubscriptionExpired}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Сохранить изменения
                  {isSubscriptionExpired && (
                    <Lock className="ml-2 h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto ml-2 hidden md:flex"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти из системы
                </Button>
              </div>
              
              {isSubscriptionExpired && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Редактирование профиля недоступно. Пожалуйст��, продлите подписку.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="space-y-6">
            {currentSubscription && (
              <Card className="mb-6 overflow-hidden">
                <div className={`h-2 ${
                  userProfile?.tariffId === "3" ? "bg-amber-500" : 
                  userProfile?.tariffId === "2" ? "bg-purple-600" : 
                  "bg-blue-600"
                }`}></div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ваша текущая подписка</span>
                    {currentSubscription.isActive ? (
                      <Badge className="bg-green-600">Активна</Badge>
                    ) : (
                      <Badge variant="destructive">Истекла</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Тарифный план:</span>
                    <span className="text-lg font-bold">{currentSubscription.plan}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Прогресс подписки</span>
                      <span>{Math.round(getSubscriptionProgress())}%</span>
                    </div>
                    <Progress 
                      value={getSubscriptionProgress()} 
                      className={!currentSubscription.isActive ? "h-2 bg-red-950" : "h-2"} 
                    />
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дата окончания:</span>
                      <span className="font-medium">{formatDate(currentSubscription.endDate)}</span>
                    </div>
                    {currentSubscription.isActive && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Осталось дней:</span>
                        <Badge variant="outline">
                          {currentSubscription.daysRemaining}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {!currentSubscription.isActive && (
                    <Alert variant="destructive">
                      <ShieldAlert className="h-4 w-4" />
                      <AlertDescription>
                        Ваша подписка истекла. Функции системы недоступны.
                        Пожалуйста, продлите подписку для восстановления доступа.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
            
            <h2 className="text-xl font-bold mb-4">Доступные тарифные планы</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                    selectedPlan === plan.name ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className={`h-2 ${plan.color}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <p className="text-2xl font-bold">{plan.price}</p>
                        </CardDescription>
                      </div>
                      <div className={`p-2 rounded-full ${plan.color} text-white`}>
                        <plan.icon className="h-5 w-5" />
                      </div>
                    </div>
                    {selectedPlan === plan.name && (
                      <Badge className="absolute top-10 right-4 bg-primary">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Выбрано
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="h-48 overflow-auto">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="bg-muted/30 pt-4">
                    <Button 
                      className="w-full" 
                      variant={selectedPlan === plan.name ? "secondary" : "default"}
                      onClick={() => handleSelectPlan(plan.name)}
                    >
                      {selectedPlan === plan.name ? "Выбрано" : "Выбрать"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                size="lg"
                onClick={handleProceedToPayment}
                disabled={!selectedPlan || isProcessing}
                className="w-full md:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Перейти к оплате
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Способы оплаты</CardTitle>
              <CardDescription>
                Управление платежными методами и оплата подписки
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedCard ? (
                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Карта **** **** **** {savedCard.lastFour}</p>
                          <p className="text-sm text-muted-foreground">
                            Срок действия: {savedCard.expiryDate}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={handleDeleteCard}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setIsAddingCard(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить еще одну карту
                  </Button>
                </div>
              ) : !isAddingCard ? (
                <div className="space-y-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Добавьте карту для оплаты</p>
                          <p className="text-sm text-muted-foreground">
                            Для оформления подписки необходимо добавить карту
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleAddCard}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Добавить карту
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-lg p-5 border space-y-4">
                  <h3 className="font-medium text-lg">Добавление новой карты</h3>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Номер карты</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Срок действия</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="password"
                        maxLength={3}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setIsAddingCard(false)}
                    >
                      Отмена
                    </Button>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={handleAddCard}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Сохранить карту
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedPlan && (
                <div className="mt-8 space-y-4">
                  <div className="bg-muted/50 rounded-lg p-5 border space-y-4">
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5 text-primary" />
                      Детали подписки
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 border-b">
                        <span className="text-muted-foreground">Тариф:</span>
                        <Badge className={`${
                          selectedPlan === "Премиум" ? "bg-amber-500" : 
                          selectedPlan === "Бизнес" ? "bg-purple-600" : 
                          "bg-blue-600"
                        }`}>
                          {selectedPlan}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border-b">
                        <span className="text-muted-foreground">Стоимость:</span>
                        <span className="font-medium">
                          {subscriptionPlans.find(plan => plan.name === selectedPlan)?.price}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 border-b">
                        <span className="text-muted-foreground">Период:</span>
                        <span className="font-medium">1 месяц</span>
                      </div>
                      <div className="flex justify-between items-center p-2">
                        <span className="text-muted-foreground">Автопродление:</span>
                        <Badge variant="outline" className="bg-green-600/10 text-green-600 border-green-600/30">
                          Включено
                        </Badge>
                      </div>
                      
                      <Alert className="mt-2 bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-300">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          С вашей карты будет автоматически списываться оплата каждый месяц.
                          Вы можете отключить автопродление в любое время.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isProcessing || (!savedCard && !isAddingCard)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Обработка платежа...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="mr-2 h-4 w-4" />
                        Оплатить подписку
                      </>
                    )}
                  </Button>
                  
                  {!savedCard && !isAddingCard && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Для оплаты необходимо добавить карту
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                История платежей
              </CardTitle>
              <CardDescription>
                Ваши последние операции и платежи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">У вас пока нет истории платежей</p>
                  </div>
                ) : (
                  paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-card rounded-lg p-4 border hover:border-primary transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              payment.tariff === "Премиум" ? "bg-amber-500" : 
                              payment.tariff === "Бизнес" ? "bg-purple-600" : 
                              payment.tariff === "Корпоративный" ? "bg-emerald-600" :
                              "bg-blue-600"
                            }`}>
                              {payment.tariff}
                            </Badge>
                            <p className="font-medium">{payment.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{payment.date}</span>
                            <span>•</span>
                            <CalendarClock className="h-3.5 w-3.5" />
                            <span>{payment.period}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-lg">{payment.amount}</span>
                          <Badge variant="outline" className="bg-green-600/10 text-green-600 border-green-600/30">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;

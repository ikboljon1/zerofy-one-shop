
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan: string;
    endDate: string;
    daysRemaining: number;
    isActive: boolean;
  } | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Simulate fetching subscription data on component mount
  useEffect(() => {
    // In a real app, this would come from the backend
    const mockSubscriptionData = {
      plan: "Бизнес",
      endDate: "2024-12-31T23:59:59Z",
      daysRemaining: 30,
      isActive: true
    };
    
    setCurrentSubscription(mockSubscriptionData);
  }, []);

  const userData = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+7 (999) 123-45-67",
    company: "ООО Компания",
    subscription: "Бизнес",
    subscriptionEnd: "31.12.2024",
  };

  const paymentHistory = [
    {
      id: 1,
      date: "2024-02-20",
      amount: "5000 ₽",
      description: "Подписка Бизнес",
      status: "Оплачено",
    },
    {
      id: 2,
      date: "2024-01-20",
      amount: "5000 ₽",
      description: "Подписка Бизнес",
      status: "Оплачено",
    },
  ];

  const subscriptionPlans = [
    {
      name: "Стартовый",
      price: "2000 ₽/мес",
      features: ["1 магазин", "Базовая аналитика", "Email поддержка"],
    },
    {
      name: "Бизнес",
      price: "5000 ₽/мес",
      features: [
        "До 5 магазинов",
        "Расширенная аналитика",
        "Приоритетная поддержка",
        "API доступ",
      ],
    },
    {
      name: "Премиум",
      price: "10000 ₽/мес",
      features: [
        "Неограниченное количество магазинов",
        "Полная аналитика",
        "24/7 поддержка",
        "API доступ",
        "Персональный менеджер",
      ],
    },
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

      setIsProcessing(true);
      
      try {
        // Here we'll later integrate with the payment system
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call
        
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
      // Here we'll later integrate with the payment system
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call
      
      // Update the current subscription with the new plan
      if (currentSubscription) {
        // Calculate new end date (1 month from now)
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        
        setCurrentSubscription({
          plan: selectedPlan,
          endDate: newEndDate.toISOString(),
          daysRemaining: 30,
          isActive: true
        });
      }
      
      toast({
        title: "Успешно",
        description: `Подписка ${selectedPlan} успешно оформлена`,
      });
      
      // Navigate to subscription tab to show the new subscription
      setActiveTab("subscription");
    } catch (error) {
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
    
    // Calculate subscription progress
    const daysInMonth = 30; // Approximation
    const daysElapsed = daysInMonth - currentSubscription.daysRemaining;
    return Math.min(100, Math.max(0, (daysElapsed / daysInMonth) * 100));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Профиль</h1>
      
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
                      defaultValue={userData.phone}
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
                      defaultValue={userData.company}
                      className="pl-10"
                    />
                    <Building className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <Button className="w-full md:w-auto mt-6">Сохранить изменения</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="space-y-6">
            {/* Current Subscription Status */}
            {currentSubscription && (
              <Card className="mb-6">
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
                    <Progress value={getSubscriptionProgress()} className="h-2" />
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дата окончания:</span>
                      <span className="font-medium">{formatDate(currentSubscription.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Осталось дней:</span>
                      <Badge variant="outline">
                        {currentSubscription.daysRemaining}
                      </Badge>
                    </div>
                  </div>
                  
                  {!currentSubscription.isActive && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Ваша подписка истекла. Некоторые функции могут быть недоступны. 
                        Пожалуйста, продлите подписку.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    className="w-full mt-2"
                    onClick={() => {
                      setSelectedPlan(currentSubscription.plan);
                      setActiveTab("payment");
                    }}
                  >
                    {currentSubscription.isActive ? "Изменить тариф" : "Продлить подписку"}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`relative hover:shadow-lg transition-shadow duration-300 ${
                    selectedPlan === plan.name ? 'border-primary' : ''
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{plan.name}</span>
                      {selectedPlan === plan.name && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </CardTitle>
                    <p className="text-2xl font-bold">{plan.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant={selectedPlan === plan.name ? "secondary" : "default"}
                      onClick={() => handleSelectPlan(plan.name)}
                    >
                      {selectedPlan === plan.name ? "Выбрано" : "Выбрать"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center">
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
                  'Перейти к оплате'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Способы оплаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAddingCard ? (
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Номер карты</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Срок действия</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
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
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleAddCard}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение карты...
                      </>
                    ) : (
                      'Сохранить карту'
                    )}
                  </Button>
                </div>
              )}
              
              {selectedPlan && (
                <div className="mt-8 space-y-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <h3 className="font-medium mb-2">Детали подписки</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Тариф:</span>
                        <span className="font-medium">{selectedPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Стоимость:</span>
                        <span className="font-medium">
                          {subscriptionPlans.find(plan => plan.name === selectedPlan)?.price}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Период:</span>
                        <span className="font-medium">1 месяц</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Автопродление:</span>
                        <span className="font-medium">Включено</span>
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
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Обработка платежа...
                      </>
                    ) : (
                      'Оплатить подписку'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История платежей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-card rounded-lg p-4 border hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{payment.amount}</span>
                        <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-sm">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PasswordChangeForm from "@/components/PasswordChangeForm";
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
  ShoppingBag,
  KeyRound,
  BadgePercent,
  GemIcon,
  TrophyIcon
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  TARIFF_STORE_LIMITS, 
  getTrialDaysRemaining, 
  getSubscriptionStatus, 
  User as UserType,
  PaymentHistoryItem,
  activateSubscription,
  addPaymentRecord,
  getPaymentHistory
} from "@/services/userService";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SavedCard {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  lastFour: string;
}

interface ProfileProps {
  user: UserType | null;
  onUserUpdated?: (user: UserType) => void;
}

const Profile = ({ user, onUserUpdated }: ProfileProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [newCard, setNewCard] = useState<SavedCard>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    lastFour: ""
  });
  const [showCardForm, setShowCardForm] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<string>("basic");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Price configuration
  const tariffPrices = {
    basic: 349,
    pro: 649,
    business: 1299
  };
  
  // Tariff limits configuration
  const tariffLimits = {
    basic: {
      stores: 1,
      products: 1000,
      analytics: true,
      automation: false,
      advertising: false,
      support: "email"
    },
    pro: {
      stores: 3,
      products: 5000,
      analytics: true,
      automation: true,
      advertising: true,
      support: "priority"
    },
    business: {
      stores: 10,
      products: "unlimited",
      analytics: true,
      automation: true,
      advertising: true,
      support: "dedicated"
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setCompany(user.company || "");
      setSelectedTariff(user.subscription?.plan || "basic");

      // Get trial days remaining
      const days = getTrialDaysRemaining(user.id);
      setDaysRemaining(days);

      // Get subscription status
      const status = getSubscriptionStatus(user.id);
      setSubscriptionStatus(status);

      // Fetch payment history
      fetchPaymentHistory();

      // Load saved cards from localStorage (in a real app, would be from API)
      const savedCardsData = localStorage.getItem('savedCards');
      if (savedCardsData) {
        try {
          setSavedCards(JSON.parse(savedCardsData));
        } catch (error) {
          console.error('Error parsing saved cards:', error);
        }
      }
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await getPaymentHistory(user.id);
      setPaymentHistory(history);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю платежей",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        name,
        email,
        phone,
        company
      };
      
      // Update in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
    
    toast({
      title: "Вы вышли из системы",
      description: "Успешно выполнен выход из аккаунта",
    });
  };

  const handleAddCard = () => {
    // Validate card info
    if (newCard.cardNumber.length < 16 || !newCard.expiryDate || newCard.cvv.length < 3) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }
    
    // Format card and add to saved cards
    const lastFour = newCard.cardNumber.slice(-4);
    const formattedCard = {
      ...newCard,
      cardNumber: "**** **** **** " + lastFour,
      lastFour
    };
    
    const updatedCards = [...savedCards, formattedCard];
    setSavedCards(updatedCards);
    
    // Save to localStorage (in a real app, would be to API)
    localStorage.setItem('savedCards', JSON.stringify(updatedCards));
    
    // Reset form
    setNewCard({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      lastFour: ""
    });
    
    setShowCardForm(false);
    
    toast({
      title: "Карта добавлена",
      description: `Карта с номером ****${lastFour} успешно добавлена`,
    });
  };

  const handleDeleteCard = (index: number) => {
    const updatedCards = [...savedCards];
    updatedCards.splice(index, 1);
    setSavedCards(updatedCards);
    
    // Save to localStorage
    localStorage.setItem('savedCards', JSON.stringify(updatedCards));
    
    toast({
      title: "Карта удалена",
      description: "Платежная карта успешно удалена",
    });
  };

  const handleSubscribe = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Calculate amount based on selected tariff and period
      const basePrice = tariffPrices[selectedTariff as keyof typeof tariffPrices];
      const period = parseInt(selectedPeriod);
      let amount = basePrice * period;
      
      // Apply discount for longer periods
      if (period === 3) {
        amount = amount * 0.9; // 10% discount
      } else if (period === 6) {
        amount = amount * 0.8; // 20% discount
      } else if (period === 12) {
        amount = amount * 0.7; // 30% discount
      }
      
      // Round to whole number
      amount = Math.round(amount);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add payment record
      await addPaymentRecord({
        id: `payment_${Date.now()}`,
        userId: user.id,
        tariff: selectedTariff,
        amount: amount,
        period: period,
        date: new Date().toISOString(),
        status: "completed"
      });
      
      // Activate subscription
      const updatedUser = await activateSubscription(user.id, {
        plan: selectedTariff,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + period * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active"
      });
      
      // Update user context if callback exists
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      
      // Update subscription status
      setSubscriptionStatus("active");
      
      // Refresh payment history
      fetchPaymentHistory();
      
      toast({
        title: "Подписка активирована",
        description: `Тариф ${selectedTariff.toUpperCase()} успешно активирован на ${period} месяц${period > 1 ? 'а' : ''}`,
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось активировать подписку. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscriptionStatus) return null;
    
    switch (subscriptionStatus) {
      case "trial":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Пробный период ({daysRemaining} дн.)
          </Badge>
        );
      case "active":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Активна
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Истекла
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Вы не авторизованы</h2>
              <p className="text-muted-foreground mb-4">Пожалуйста, войдите в систему для доступа к профилю</p>
              <Button onClick={() => navigate('/')}>
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container pb-12">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start mb-8">
            <TabsTrigger value="profile" className="flex gap-1.5">
              <User className="h-4 w-4" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex gap-1.5">
              <CreditCard className="h-4 w-4" />
              Подписка
            </TabsTrigger>
            <TabsTrigger value="history" className="flex gap-1.5">
              <History className="h-4 w-4" />
              История
            </TabsTrigger>
            <TabsTrigger value="password" className="flex gap-1.5">
              <Lock className="h-4 w-4" />
              Пароль
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Данные профиля</CardTitle>
                  <CardDescription>
                    Управляйте вашими персональными данными
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{name || "Пользователь"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.subscription?.plan ? (
                          <Badge variant="outline" className="mt-1">
                            Тариф {user.subscription?.plan.toUpperCase()}
                          </Badge>
                        ) : (
                          "Базовый аккаунт"
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <div className="flex">
                          <Input 
                            id="name" 
                            placeholder="Ваше имя" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex">
                          <div className="flex-1 flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="rounded-l-none flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон</Label>
                        <div className="flex">
                          <div className="flex-1 flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              <Phone className="h-4 w-4" />
                            </span>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+7 (999) 123-45-67"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="rounded-l-none flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Компания</Label>
                        <div className="flex">
                          <div className="flex-1 flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                              <Building className="h-4 w-4" />
                            </span>
                            <Input
                              id="company"
                              placeholder="Название компании"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              className="rounded-l-none flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating}
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить изменения
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="billing">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Управление подпиской</CardTitle>
                      <CardDescription>
                        Выберите тариф, который подходит вам лучше всего
                      </CardDescription>
                    </div>
                    {getStatusBadge()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subscription Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic Plan */}
                    <Card className={`border-2 ${selectedTariff === "basic" ? "border-primary" : "border-border"}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            Basic
                          </div>
                          {selectedTariff === "basic" && <Check className="h-5 w-5 text-primary" />}
                        </CardTitle>
                        <div className="mt-1 flex items-baseline">
                          <span className="text-3xl font-bold tracking-tight">
                            {tariffPrices.basic}₽
                          </span>
                          <span className="ml-1 text-sm text-muted-foreground">/ мес</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6 pt-2">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            {tariffLimits.basic.stores} магазин
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            До {tariffLimits.basic.products} товаров
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Базовая аналитика
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            Нет автоматизации
                          </li>
                          <li className="flex items-center gap-2 text-muted-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            Нет рекламных инструментов
                          </li>
                        </ul>
                        <Button 
                          className="mt-4 w-full"
                          variant={selectedTariff === "basic" ? "secondary" : "outline"}
                          onClick={() => setSelectedTariff("basic")}
                        >
                          {selectedTariff === "basic" ? "Выбрано" : "Выбрать"}
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Pro Plan */}
                    <Card className={`border-2 ${selectedTariff === "pro" ? "border-primary" : "border-border"}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <BadgePercent className="h-5 w-5 text-primary" />
                            Pro
                          </CardTitle>
                          {selectedTariff === "pro" && <Check className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="mt-1 flex items-baseline">
                          <span className="text-3xl font-bold tracking-tight">
                            {tariffPrices.pro}₽
                          </span>
                          <span className="ml-1 text-sm text-muted-foreground">/ мес</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6 pt-2">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            До {tariffLimits.pro.stores} магазинов
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            До {tariffLimits.pro.products} товаров
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Расширенная аналитика
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Автоматизация процессов
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Рекламные инструменты
                          </li>
                        </ul>
                        <Button 
                          className="mt-4 w-full"
                          variant={selectedTariff === "pro" ? "secondary" : "outline"}
                          onClick={() => setSelectedTariff("pro")}
                        >
                          {selectedTariff === "pro" ? "Выбрано" : "Выбрать"}
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Business Plan */}
                    <Card className={`border-2 ${selectedTariff === "business" ? "border-primary" : "border-border"}`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <GemIcon className="h-5 w-5 text-violet-500" />
                            Business
                          </CardTitle>
                          {selectedTariff === "business" && <Check className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="mt-1 flex items-baseline">
                          <span className="text-3xl font-bold tracking-tight">
                            {tariffPrices.business}₽
                          </span>
                          <span className="ml-1 text-sm text-muted-foreground">/ мес</span>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6 pt-2">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            До {tariffLimits.business.stores} магазинов
                          </li>
                          <li className="flex items-center gap-2">
                            <TrophyIcon className="h-4 w-4 text-yellow-500" />
                            {tariffLimits.business.products} товаров
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Премиум аналитика
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Полная автоматизация
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Расширенные рекламные инструменты
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Выделенная поддержка
                          </li>
                        </ul>
                        <Button 
                          className="mt-4 w-full"
                          variant={selectedTariff === "business" ? "secondary" : "outline"}
                          onClick={() => setSelectedTariff("business")}
                        >
                          {selectedTariff === "business" ? "Выбрано" : "Выбрать"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  {/* Period Selection */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Выберите период подписки</h3>
                    <RadioGroup 
                      value={selectedPeriod} 
                      onValueChange={setSelectedPeriod}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3"
                    >
                      <div>
                        <RadioGroupItem 
                          value="1" 
                          id="period-1" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="period-1"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-xl font-bold">1</span>
                          <span className="text-sm text-muted-foreground">месяц</span>
                          <Badge variant="outline" className="mt-2">
                            Без скидки
                          </Badge>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="3" 
                          id="period-3" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="period-3"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-xl font-bold">3</span>
                          <span className="text-sm text-muted-foreground">месяца</span>
                          <Badge variant="success" className="mt-2">
                            Скидка 10%
                          </Badge>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="6" 
                          id="period-6" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="period-6"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-xl font-bold">6</span>
                          <span className="text-sm text-muted-foreground">месяцев</span>
                          <Badge variant="success" className="mt-2">
                            Скидка 20%
                          </Badge>
                        </Label>
                      </div>
                      
                      <div>
                        <RadioGroupItem 
                          value="12" 
                          id="period-12" 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor="period-12"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span className="text-xl font-bold">12</span>
                          <span className="text-sm text-muted-foreground">месяцев</span>
                          <Badge variant="success" className="mt-2">
                            Скидка 30%
                          </Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Separator />
                  
                  {/* Payment Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Сводка платежа</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Тариф:</span>
                        <span className="font-medium">{selectedTariff.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Период:</span>
                        <span className="font-medium">{selectedPeriod} {
                          Number(selectedPeriod) === 1 ? 'месяц' : 
                          Number(selectedPeriod) < 5 ? 'месяца' : 'месяцев'
                        }</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Базовая стоимость:</span>
                        <span className="font-medium">
                          {tariffPrices[selectedTariff as keyof typeof tariffPrices] * parseInt(selectedPeriod)}₽
                        </span>
                      </div>
                      
                      {selectedPeriod !== "1" && (
                        <div className="flex justify-between text-green-600">
                          <span>Скидка:</span>
                          <span>
                            {selectedPeriod === "3" ? "10%" : selectedPeriod === "6" ? "20%" : "30%"}
                          </span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Итого:</span>
                        <span>
                          {(() => {
                            const basePrice = tariffPrices[selectedTariff as keyof typeof tariffPrices];
                            const period = parseInt(selectedPeriod);
                            let amount = basePrice * period;
                            
                            if (period === 3) {
                              amount = amount * 0.9; // 10% discount
                            } else if (period === 6) {
                              amount = amount * 0.8; // 20% discount
                            } else if (period === 12) {
                              amount = amount * 0.7; // 30% discount
                            }
                            
                            return Math.round(amount);
                          })()}₽
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment method selection */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Способ оплаты</h3>
                    
                    {savedCards.length > 0 && (
                      <div className="space-y-3 mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Сохраненные карты</div>
                        {savedCards.map((card, index) => (
                          <div key={index} className="flex items-center justify-between border rounded-md p-3">
                            <div className="flex items-center gap-3">
                              <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{card.cardNumber}</div>
                                <div className="text-xs text-muted-foreground">Истекает {card.expiryDate}</div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCard(index)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!showCardForm ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCardForm(true)}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Добавить новую карту
                      </Button>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Номер карты</Label>
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={newCard.cardNumber}
                                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiryDate">Срок действия</Label>
                                <Input
                                  id="expiryDate"
                                  placeholder="MM/YY"
                                  value={newCard.expiryDate}
                                  onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  type="password"
                                  value={newCard.cvv}
                                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-4">
                              <Button
                                variant="ghost"
                                onClick={() => setShowCardForm(false)}
                              >
                                Отмена
                              </Button>
                              <Button onClick={handleAddCard}>
                                Сохранить карту
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Вернуться на главную
                  </Button>
                  <Button 
                    onClick={handleSubscribe} 
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Активировать подписку
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>История платежей</CardTitle>
                  <CardDescription>
                    Информация о ваших платежах и продлениях подписки
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-4">
                      <History className="h-12 w-12 mx-auto opacity-20" />
                      <p>У вас пока нет платежей</p>
                      <Button 
                        variant="outline" 
                        onClick={() => document.querySelector('button[value="billing"]')?.click()}
                        className="gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Перейти к подписке
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentHistory.map((payment) => (
                        <div 
                          key={payment.id} 
                          className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              Тариф {payment.tariff.toUpperCase()}
                              {payment.status === "completed" ? (
                                <Badge variant="success" className="text-xs">Оплачено</Badge>
                              ) : payment.status === "pending" ? (
                                <Badge variant="warning" className="text-xs">В обработке</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Отменено</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {payment.period} {
                                Number(payment.period) === 1 ? 'месяц' : 
                                Number(payment.period) < 5 ? 'месяца' : 'месяцев'
                              }
                            </Badge>
                            <span className="font-bold text-lg">
                              {payment.amount.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="password">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Изменение пароля</CardTitle>
                  <CardDescription>
                    Обновите ваш пароль для обеспечения безопасности
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, Users, ShieldCheck, BarChart2, Package, CircleCheck, Rocket, Clock, Settings, CreditCard, HeartHandshake, MessageSquare, ArrowRight, LineChart, PieChart, Gauge, AreaChart, TrendingUp, CheckCircle, Calculator, Database, BellRing, ArrowUpRight, BoxSelect, Wallet, PercentSquare, BadgeDollarSign, TrendingDown, AlertTriangle, ChevronUp, BarChart3, Lightbulb, CircleDollarSign, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [activeDemoTab, setActiveDemoTab] = useState("analytics");
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreenshot(prev => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const screenshots = [{
    src: "/lovable-uploads/84016c72-9b0f-4155-a959-56497d632524.png",
    alt: "Аналитика продаж",
    title: "Детальная аналитика продаж",
    description: "Полная структура продаж, динамика выручки и данные о возвратах в одном интерфейсе"
  }, {
    src: "/lovable-uploads/0a0d0dd7-b54d-4163-ba50-1ddbb5b6dd7d.png",
    alt: "Детализация заказов",
    title: "Мониторинг заказов в реальном времени",
    description: "Отслеживайте статистику заказов и продаж с визуализацией по категориям товаров"
  }, {
    src: "/lovable-uploads/9f6e8e49-868a-45c9-a6e7-9c8878a3e760.png",
    alt: "Статистика рекламных кампаний",
    title: "Эффективность рекламных кампаний",
    description: "Подробная статистика рекламных показателей: CTR, CPC, конверсия и затраты"
  }, {
    src: "/lovable-uploads/ad827d18-f927-4c73-ae94-56ad73d7407c.png",
    alt: "Управление товарами",
    title: "Умное управление товарами",
    description: "Полная информация о каждом товаре с показателями прибыльности и динамикой продаж"
  }];
  
  const features = [{
    icon: <BarChart2 className="h-6 w-6 text-primary" />,
    title: "Интеллектуальная аналитика",
    description: "Превращаем данные в золото с передовой аналитикой и выявляем скрытые тренды для стратегических решений."
  }, {
    icon: <Package className="h-6 w-6 text-primary" />,
    title: "Умное управление товарами",
    description: "Автоматизируем управление ассортиментом, прогнозируем спрос и оптимизируем закупки."
  }, {
    icon: <Calculator className="h-6 w-6 text-primary" />,
    title: "Расчет рентабельности",
    description: "Мгновенно оцениваем прибыльность каждого товара с учетом всех скрытых расходов маркетплейсов."
  }, {
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
    title: "Защита данных",
    description: "Обеспечиваем безопасность вашей бизнес-информации с многоуровневым шифрованием и контролем доступа."
  }, {
    icon: <Rocket className="h-6 w-6 text-primary" />,
    title: "Революционная автоматизация",
    description: "Автоматически обновляем данные, генерируем отчеты и отправляем уведомления о важных событиях."
  }, {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Планирование поставок",
    description: "Анализируем историю продаж и сезонные тренды для оптимизации графика поставок."
  }];
  const recommendations = [{
    productName: "Кроссовки спортивные NIKE Air Max",
    sku: "WB-12547863",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=150&h=150&auto=format&fit=crop",
    recommendation: "сохранить цену",
    reason: "Оптимальный баланс продаж и маржинальности",
    icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    stats: [{
      label: "Текущая цена",
      value: "6 990 ₽"
    }, {
      label: "Продажи/нед.",
      value: "47 шт."
    }, {
      label: "Маржа",
      value: "32%"
    }]
  }, {
    productName: "Сумка женская кожаная COACH",
    sku: "WB-98547632",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&h=150&auto=format&fit=crop",
    recommendation: "снизить цену",
    reason: "Высокая конкуренция и падение спроса",
    icon: <TrendingDown className="h-5 w-5 text-blue-500" />,
    color: "bg-blue-50 text-blue-800 border-blue-200",
    stats: [{
      label: "Текущая цена",
      value: "12 500 ₽"
    }, {
      label: "Рекомендуемая",
      value: "10 900 ₽"
    }, {
      label: "Прогноз роста",
      value: "+45%"
    }]
  }, {
    productName: "Платье летнее ZARA",
    sku: "WB-45632178",
    image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=150&h=150&auto=format&fit=crop",
    recommendation: "срочно продать",
    reason: "Высокие затраты на хранение, конец сезона",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    color: "bg-red-50 text-red-800 border-red-200",
    stats: [{
      label: "Затраты/мес.",
      value: "15 800 ₽"
    }, {
      label: "Текущая цена",
      value: "4 990 ₽"
    }, {
      label: "Рекомендуемая",
      value: "2 990 ₽"
    }]
  }];
  const storageAnalysis = {
    title: "Анализ платного хранения",
    description: "Алгоритм выявил товары с высокими затратами на хранение относительно продаж:",
    data: [{
      name: "Товар А",
      storage: 80,
      sales: 20,
      ratio: 4.0
    }, {
      name: "Товар Б",
      storage: 65,
      sales: 35,
      ratio: 1.86
    }, {
      name: "Товар В",
      storage: 40,
      sales: 60,
      ratio: 0.67
    }]
  };
  const pricingInsight = {
    title: "Оптимизация ценообразования",
    description: "ИИ-модель рассчитала идеальную цену для максимизации прибыли:",
    values: [{
      label: "Текущая цена",
      value: "2 490 ₽"
    }, {
      label: "Оптимальная цена",
      value: "2 190 ₽"
    }, {
      label: "Рост продаж",
      value: "+35%"
    }, {
      label: "Рост прибыли",
      value: "+18%"
    }]
  };
  const pricing = [{
    name: "Стартап",
    price: "0",
    description: "Идеальный выбор для амбициозных начинающих продавцов",
    features: ["Управление до 100 SKU", "Базовая аналитика эффективности", "Один пользовательский аккаунт", "Приоритетная email-поддержка", "30-дневная история данных", "Основные аналитические отчеты"],
    popular: false,
    buttonVariant: "outline" as const
  }, {
    name: "Бизнес",
    price: "1999",
    description: "Оптимальное решение для растущего бизнеса",
    features: ["Управление до 1000 SKU", "Продвинутая аналитика и прогнозирование", "До 3 пользовательских аккаунтов", "Приоритетная поддержка с гарантией ответа", "Бесшовная интеграция с 1С", "Полная история данных за 6 месяцев", "Интеллектуальное прогнозирование спроса", "Мгновенные уведомления о важных событиях"],
    popular: true,
    buttonVariant: "default" as const
  }, {
    name: "Корпоративный",
    price: "4999",
    description: "Максимальные возможности для серьезного бизнеса",
    features: ["Неограниченное количество товаров", "Премиум-аналитика с ИИ-рекомендациями", "Неограниченное число пользователей", "Круглосуточная поддержка 24/7", "Полная интеграционная экосистема", "Расширенный API-доступ", "Неограниченная история данных", "Конструктор индивидуальных отчетов", "Персональный менеджер успеха клиента", "Обучение и сертификация сотрудников"],
    popular: false,
    buttonVariant: "outline" as const
  }];
  const testimonials = [{
    quote: "После внедрения Zerofy наши продажи выросли на 35% всего за три месяца. Точная аналитика помогла выявить неочевидные точки роста, а автоматизация освободила команду от рутины. Это был настоящий прорыв!",
    author: "Анна М.",
    company: "Модный бутик 'Стиль'"
  }, {
    quote: "Раньше подготовка отчетности занимала у нас до 2 дней ежемесячно. С Zerofy все критически важные данные доступны в любой момент. Теперь мы принимаем решения молниеносно, опережая конкурентов.",
    author: "Сергей К.",
    company: "ТехноМаркет"
  }, {
    quote: "Благодаря интеллектуальной системе планирования поставок Zerofy, мы сократили складские издержки на 22% и полностью избавились от проблемы неликвидов. При этом доступность товаров выросла до 98%. Фантастичный результат!",
    author: "Елена В.",
    company: "Детские игрушки 'Радость'"
  }];
  const demoTabs = [{
    id: "analytics",
    title: "Аналитика продаж",
    icon: <BarChart2 className="h-5 w-5" />,
    description: "Полная картина ваших продаж с детализацией по любому параметру"
  }, {
    id: "recommendations",
    title: "AI-рекомендации",
    icon: <Lightbulb className="h-5 w-5" />,
    description: "Умные советы по оптимизации цен и управлению товарами"
  }, {
    id: "warehouses",
    title: "Управление складами",
    icon: <BoxSelect className="h-5 w-5" />,
    description: "Оптимизация логистики и контроль складских запасов"
  }, {
    id: "finance",
    title: "Финансовый контроль",
    icon: <CircleDollarSign className="h-5 w-5" />,
    description: "Отслеживание всех финансовых показателей вашего бизнеса"
  }];
  
  const demoContent = {
    analytics: <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Всесторонняя аналитика продаж</h3>
          <p className="text-muted-foreground">
            Отслеживайте динамику продаж, анализируйте доходность и выявляйте тренды с помощью интерактивных диаграмм и детальных отчетов
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-primary/10 p-1 rounded-full">
                <BarChart2 className="h-4 w-4 text-primary" />
              </div>
              <span>Сравнение данных за любые периоды с визуализацией</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-primary/10 p-1 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span>Автоматический расчет ключевых метрик эффективности</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-primary/10 p-1 rounded-full">
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              <span>Детализация по товарам, категориям и клиентам</span>
            </li>
          </ul>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <img 
            src="/lovable-uploads/42404964-533e-45d7-a4d0-a4be679962cd.png" 
            alt="Структура удержаний по дням" 
            className="w-full h-auto rounded-md border shadow-sm" 
          />
          <img 
            src="/lovable-uploads/5014bd9f-ee06-4894-98d1-49a98e034243.png" 
            alt="Аналитика продаж" 
            className="w-full h-auto rounded-md border shadow-sm" 
          />
        </div>
      </div>,
      
    recommendations: <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <img 
          src="/lovable-uploads/5241b8dd-cd83-40f4-91e9-3bdec64e62f2.png" 
          alt="AI-рекомендации" 
          className="w-full h-auto max-w-sm rounded-md border shadow-sm" 
        />
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Умные AI-рекомендации</h3>
          <p className="text-muted-foreground">
            Интеллектуальная система анализирует множество параметров и предлагает конкретные действия для оптимизации вашего бизнеса
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-green-100 dark:bg-green-900/20 p-1.5 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Анализ рентабельности хранения</p>
                <p className="text-xs text-muted-foreground">Оценка соотношения затрат на хранение и прибыли от продаж</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-amber-100 dark:bg-amber-900/20 p-1.5 rounded-full">
                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">Оптимизация ценообразования</p>
                <p className="text-xs text-muted-foreground">Расчет идеальной цены для максимизации прибыли</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/20 p-1.5 rounded-full">
                <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Сценарное моделирование</p>
                <p className="text-xs text-muted-foreground">Прогнозирование результатов при различных стратегиях</p>
              </div>
            </li>
          </ul>
        </div>
      </div>,
      
    warehouses: <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <img 
          src="/lovable-uploads/d3555da5-3bf5-4985-b8f4-065667922c6f.png" 
          alt="Управление складами" 
          className="w-full h-auto max-w-md rounded-md border shadow-sm" 
        />
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Эффективное управление складами</h3>
          <p className="text-muted-foreground">
            Полный контроль над товарными запасами на всех складах маркетплейсов с аналитикой и оптимизацией поставок
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-indigo-100 dark:bg-indigo-900/20 p-1.5 rounded-full">
                <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium">Мониторинг запасов в реальном времени</p>
                <p className="text-xs text-muted-foreground">Актуальные данные о количестве товаров на каждом складе</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-cyan-100 dark:bg-cyan-900/20 p-1.5 rounded-full">
                <BarChart3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="font-medium">Оптимальное распределение товаров</p>
                <p className="text-xs text-muted-foreground">Рекомендации по распределению товаров между складами</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-purple-100 dark:bg-purple-900/20 p-1.5 rounded-full">
                <TrendingDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Анализ затрат на логистику</p>
                <p className="text-xs text-muted-foreground">Расчет и оптимизация расходов на доставку и хранение</p>
              </div>
            </li>
          </ul>
        </div>
      </div>,
      
    finance: <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <img 
          src="/lovable-uploads/0a0d0dd7-b54d-4163-ba50-1ddbb5b6dd7d.png" 
          alt="Финансовый контроль" 
          className="w-full h-auto max-w-md rounded-md border shadow-sm" 
        />
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">Полный финансовый контроль</h3>
          <p className="text-muted-foreground">
            Отслеживайте все финансовые показатели вашего бизнеса в едином интерфейсе с детализацией и аналитикой
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/20 p-1.5 rounded-full">
                <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Анализ выручки и прибыли</p>
                <p className="text-xs text-muted-foreground">Детальный расчет всех финансовых показателей</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-rose-100 dark:bg-rose-900/20 p-1.5 rounded-full">
                <BadgeDollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="font-medium">Контроль расходов</p>
                <p className="text-xs text-muted-foreground">Отслеживание всех затрат с категоризацией</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 bg-yellow-100 dark:bg-yellow-900/20 p-1.5 rounded-full">
                <LineChart className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-medium">Прогнозирование финансовых результатов</p>
                <p className="text-xs text-muted-foreground">Расчет ожидаемой прибыли на основе исторических данных</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
  };

  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Управляйте бизнесом на маркетплейсах <span className="text-primary">эффективнее</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Аналитическая платформа для эффективного управления продажами на маркетплейсах. Получайте актуальные данные и рекомендации в одном интерфейсе.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => handleAuthClick('register')}>
                  Попробовать бесплатно <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => handleAuthClick('login')}>
                  Войти в аккаунт
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden border shadow-lg">
                <img src={screenshots[activeScreenshot].src} alt={screenshots[activeScreenshot].alt} className="w-full h-auto" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
                <h3 className="font-medium">{screenshots[activeScreenshot].title}</h3>
                <p className="text-sm text-muted-foreground">{screenshots[activeScreenshot].description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 px-6 bg-muted/30 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Инструменты для эффективного управления бизнесом</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Наша платформа предоставляет все необходимые функции для оптимизации процессов и увеличения прибыли
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <Card key={index} className="bg-card hover:shadow-md transition-all">
                <CardHeader>
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Посмотрите как это работает</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Интерактивная демонстрация основных функций платформы
            </p>
          </div>
          
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-muted p-4 flex overflow-x-auto">
              {demoTabs.map(tab => <button key={tab.id} onClick={() => setActiveDemoTab(tab.id)} className={cn("flex items-center px-4 py-2 rounded-lg whitespace-nowrap mr-2", activeDemoTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/40")}>
                  <span className="mr-2">{tab.icon}</span>
                  <span>{tab.title}</span>
                </button>)}
            </div>
            <div className="p-6">
              {demoContent[activeDemoTab as keyof typeof demoContent]}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6 bg-muted/30 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Тарифы</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Выберите подходящий для вас тариф
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricing.map((plan, index) => <Card key={index} className={cn("flex flex-col", plan.popular ? "border-primary shadow-md relative" : "")}>
                {plan.popular && <div className="absolute top-0 right-0 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    Популярный выбор
                  </div>}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price === "0" ? "Бесплатно" : `${plan.price} ₽`}</span>
                    {plan.price !== "0" && <span className="text-muted-foreground ml-1">/мес</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>)}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.buttonVariant}>
                    {plan.price === "0" ? "Начать бесплатно" : "Выбрать план"}
                  </Button>
                </CardFooter>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Отзывы клиентов</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Узнайте, что говорят о нас наши клиенты
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-card">
                <CardContent className="pt-6">
                  <div className="mb-4 text-muted-foreground">
                    <QuoteIcon className="h-10 w-10 opacity-50" />
                  </div>
                  <p className="mb-6 italic">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-primary-foreground md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Начните оптимизировать свой бизнес сегодня</h2>
          <p className="text-lg opacity-90 mb-8 max-w-3xl mx-auto">
            Присоединяйтесь к тысячам продавцов, которые уже используют нашу платформу для повышения эффективности своего бизнеса
          </p>
          <Button size="lg" variant="secondary" className="text-primary font-medium" onClick={() => handleAuthClick('register')}>
            Попробовать бесплатно <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {showAuthModal && <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />}
    </div>;
};

// Quote Icon component for testimonials
const QuoteIcon = ({
  className
}: {
  className?: string;
}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>;

export default LandingPage;


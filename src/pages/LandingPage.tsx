
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
    src: "/lovable-uploads/a6565a9f-933e-4b3d-9010-dd9fd4fba5e7.png",
    alt: "Аналитика продаж - панель показателей",
    title: "Детальная аналитика продаж",
    description: "Полная структура продаж, динамика выручки и данные о возвратах в одном интерфейсе"
  }, {
    src: "/lovable-uploads/0470ca25-d168-4bdc-9273-eb817e91c482.png",
    alt: "Аналитика продаж - структура расходов",
    title: "Детализация расходов и прибыльных товаров",
    description: "Детальная информация о структуре расходов и самых прибыльных товарах"
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
    description: "Автомати��ируем управление ассортиментом, прогнозируем спрос и оптимизируем закупки."
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
    quote: "Благодаря интеллектуальной системе планирования поставок Zerofy, мы сократили складские издержки на 22% и полностью избавились от проблемы неликвидов. При этом доступность товаров выросла до 98%. Фантастический результат!",
    author: "Елена В.",
    company: "Детские игрушки 'Радость'"
  }];

  const demoTabs = [
    {
      id: "analytics",
      title: "Аналитика продаж",
      icon: <BarChart3 className="h-5 w-5" />,
      image: "/lovable-uploads/0470ca25-d168-4bdc-9273-eb817e91c482.png",
      description: "Полный контроль над всеми ключевыми показателями вашего бизнеса",
      features: [
        "Визуализация динамики продаж и выручки",
        "Анализ рентабельности по каждому товару",
        "Структура расходов и комиссий маркетплейсов",
        "Прогнозирование продаж на основе исторических данных"
      ]
    },
    {
      id: "ai-recommendations",
      title: "AI-рекомендации",
      icon: <Lightbulb className="h-5 w-5" />,
      image: "/lovable-uploads/84016c72-9b0f-4155-a959-56497d632524.png",
      description: "Искусственный интеллект, который помогает принимать лучшие решения",
      features: [
        "Рекомендации по оптимизации цен для каждого товара",
        "Выявление неэффективных товаров с высокими складскими издержками",
        "Прогнозирование потенциальных проблем с остатками",
        "Автоматический анализ конкурентов и рыночных цен"
      ]
    },
    {
      id: "warehouse",
      title: "Управление складами",
      icon: <Package className="h-5 w-5" />,
      image: "/lovable-uploads/4ea57e12-c728-4a2d-96bd-041c251862ec.png",
      description: "Эффективное управление складскими запасами и поставками",
      features: [
        "Мониторинг товарных остатков в реальном времени",
        "Расчет оптимального объема поставки для каждого товара",
        "Предотвращение дефицита и избытка товара",
        "Оптимизация затрат на хранение и логистику"
      ]
    },
    {
      id: "finance",
      title: "Финансовый контроль",
      icon: <CircleDollarSign className="h-5 w-5" />,
      image: "/lovable-uploads/a6565a9f-933e-4b3d-9010-dd9fd4fba5e7.png",
      description: "Полный контроль над финансовыми потоками и прибыльностью",
      features: [
        "Детальный учет всех доходов и расходов",
        "Анализ прибыльности по каждому маркетплейсу",
        "Прогнозирование финансовых результатов",
        "Контроль платежей и выплат от маркетплейсов"
      ]
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Управляйте бизнесом на маркетплейсах <span className="text-primary">эффективнее</span>
              </h1>
              <p className="mt-6 text-xl text-muted-foreground">
                Интеллектуальная платформа для анализа, оптимизации и масштабирования вашего бизнеса на маркетплейсах
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => handleAuthClick('register')}>
                  Начать бесплатно <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleAuthClick('login')}>
                  Войти в аккаунт
                </Button>
              </div>
            </div>
            <div className="relative lg:col-span-1">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={screenshots[activeScreenshot].src}
                  alt={screenshots[activeScreenshot].alt}
                  className="w-full rounded-xl"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-xl font-medium text-white">
                    {screenshots[activeScreenshot].title}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {screenshots[activeScreenshot].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Все необходимое для эффективного управления бизнесом на маркетплейсах
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Наша платформа объединяет инструменты аналитики, оптимизации и автоматизации, чтобы вы могли сосредоточиться на стратегических решениях
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl shadow-sm p-6 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Посмотрите как это работает
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Исследуйте возможности нашей платформы и убедитесь в ее эффективности
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-1 bg-muted rounded-lg p-4">
              <div className="space-y-2">
                {demoTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemoTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                      activeDemoTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted-foreground/10"
                    )}
                  >
                    {tab.icon}
                    <span>{tab.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              {demoTabs.map((tab) => (
                <div 
                  key={tab.id} 
                  className={cn(
                    "grid md:grid-cols-2 gap-8 items-center",
                    activeDemoTab !== tab.id && "hidden"
                  )}
                >
                  <div className="order-2 md:order-1">
                    <h3 className="text-2xl font-bold">{tab.title}</h3>
                    <p className="mt-2 text-muted-foreground">{tab.description}</p>
                    <ul className="mt-6 space-y-4">
                      {tab.features.map((feature, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-1 md:order-2">
                    <img
                      src={tab.image}
                      alt={tab.title}
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Искусственный интеллект на службе вашего бизнеса
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Наши алгоритмы анализируют огромные массивы данных, чтобы дать вам точные рекомендации по оптимизации бизнеса
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:gap-12 lg:grid-cols-3">
            {recommendations.map((item, index) => (
              <Card key={index} className={`border ${item.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.image} 
                        alt={item.productName}
                        className="w-16 h-16 rounded-md object-cover" 
                      />
                      <div>
                        <CardTitle className="text-base">{item.productName}</CardTitle>
                        <CardDescription>{item.sku}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <span className="font-medium">{item.recommendation}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                </CardContent>
                <CardFooter>
                  <div className="grid grid-cols-3 w-full gap-2 text-center">
                    {item.stats.map((stat, statIndex) => (
                      <div key={statIndex}>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="font-medium">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:gap-12 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{storageAnalysis.title}</CardTitle>
                <CardDescription>{storageAnalysis.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storageAnalysis.data.map((item, index) => (
                    <div key={index} className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          item.ratio > 1 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          {item.ratio.toFixed(2)}x
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 mb-1">
                        <div className="flex h-full rounded-full">
                          <div 
                            className="bg-red-500 rounded-l-full" 
                            style={{ width: `${item.storage}%` }}
                          ></div>
                          <div 
                            className="bg-green-500 rounded-r-full" 
                            style={{ width: `${item.sales}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Затраты на хранение: {item.storage}%</span>
                        <span>Доля в продажах: {item.sales}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{pricingInsight.title}</CardTitle>
                <CardDescription>{pricingInsight.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    {pricingInsight.values.map((item, index) => (
                      <div key={index} className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className={cn(
                          "text-xl font-semibold",
                          (item.label === "Рост продаж" || item.label === "Рост прибыли") ? "text-green-600" : ""
                        )}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span className="font-medium">AI-рекомендация</span>
                    </div>
                    <p className="mt-2 text-sm">
                      Снижение цены на 12% увеличит объем продаж достаточно, чтобы компенсировать уменьшение маржи и принести дополнительную прибыль.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Простые и понятные тарифы
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Выберите план, который подходит именно вашему бизнесу, и начните оптимизировать свои продажи прямо сейчас
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricing.map((plan, index) => (
              <Card key={index} className={cn(
                "flex flex-col relative",
                plan.popular && "border-primary shadow-lg"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Популярный выбор
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "0" && (
                      <span className="ml-1 text-muted-foreground">₽/мес</span>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CircleCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.buttonVariant}
                    onClick={() => handleAuthClick('register')}
                  >
                    {plan.price === "0" ? "Начать бесплатно" : "Выбрать план"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Что говорят наши клиенты
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Присоединяйтесь к тысячам продавцов, которые уже оптимизировали свой бизнес с нашей платформой
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card h-full flex flex-col">
                <CardContent className="pt-6 flex-grow">
                  <div className="text-muted-foreground mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Zap key={i} className="inline-block h-5 w-5 fill-current text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-lg">"{testimonial.quote}"</blockquote>
                </CardContent>
                <CardFooter className="border-t pt-6">
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 lg:p-16 text-primary-foreground text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Готовы оптимизировать свой бизнес?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              Начните использовать нашу платформу уже сегодня и раскройте полный потенциал вашего бизнеса на маркетплейсах
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => handleAuthClick('register')}
              >
                Начать бесплатно <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
                onClick={() => handleAuthClick('login')}
              >
                Войти в аккаунт
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <h3 className="font-bold text-xl mb-4">Zerofy</h3>
              <p className="text-muted-foreground mb-4">
                Интеллектуальн��я платформа для управления и оптимизации бизнеса на маркетплейсах
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Продукт</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Возможности</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Тарифы</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Интеграции</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Обновления</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Компания</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">О нас</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Клиенты</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Блог</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Карьера</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Поддержка</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Документация</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">База знаний</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Связаться с нами</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Статус сервиса</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-muted-foreground/20 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Zerofy. Все права защищены.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Условия использования
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Политика конфиденциальности
              </a>
            </div>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}
    </div>
  );
};

export default LandingPage;

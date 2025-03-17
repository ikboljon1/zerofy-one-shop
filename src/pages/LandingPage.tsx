import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, Users, ShieldCheck, BarChart2, Package, CircleCheck, Rocket, Clock, Settings, CreditCard, HeartHandshake, MessageSquare, ArrowRight, LineChart, PieChart, Gauge, AreaChart, TrendingUp, CheckCircle, Calculator, Database, BellRing, ArrowUpRight, BoxSelect, Wallet, PercentSquare, BadgeDollarSign, TrendingDown, AlertTriangle, ChevronUp, BarChart3, Lightbulb, CircleDollarSign, Landmark, ThumbsUp, ThumbsDown, TrendingDown, Scale, Ban, XCircle, Frown, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initialTariffs } from "@/data/tariffs";
import Footer from "@/components/layout/Footer";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from "recharts";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [activeDemoTab, setActiveDemoTab] = useState("analytics");
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    
    if (section === 'pricing') {
      setTimeout(() => {
        const pricingSection = document.querySelector('#pricing-section');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // Небольшая задержка для гарантии загрузки DOM
    }
  }, [location]);

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
    src: "/lovable-uploads/dfa6fe03-ed0d-4d26-8a79-dbf4321accfe.png",
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

  const activeTariffs = initialTariffs.filter(tariff => tariff.isActive);

  const pricing = activeTariffs.map(tariff => ({
    name: tariff.name,
    price: `${tariff.price}`,
    description: tariff.description,
    features: tariff.features,
    popular: tariff.isPopular,
    buttonVariant: tariff.isPopular ? "default" : "outline" as "default" | "outline"
  }));

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
    analytics: <div className="rounded-lg overflow-hidden border bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-md overflow-hidden border">
          <img src="/lovable-uploads/0470ca25-d168-4bdc-9273-eb817e91c482.png" alt="Аналитика продаж" className="w-full h-auto" />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-2">Интеллектуальная аналитика продаж</h3>
          <p className="text-muted-foreground mb-3">Комплексный анализ всех показателей позволяет выявить скрытые тренды и принять верные решения</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Автоматический расчет рентабельности с учетом всех комиссий</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Отслеживание динамики продаж по дням, неделям и месяцам</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Мгновенный доступ к ключевым показателям эффективности</span>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    recommendations: <div className="rounded-lg overflow-hidden border bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-md overflow-hidden border">
          <img 
          src="/lovable-uploads/73027550-3b12-417f-9974-895de2852cfe.png" 
          alt="AI-рекомендации" 
          className="w-[300px] h-auto mx-auto" // Changed size here
        />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-2">Интеллектуальные AI-рекомендации</h3>
          <p className="text-muted-foreground mb-3">Искусственный интеллект анализирует ваши данные и выдает точные рекомендации для оптимизации прибыли</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Расчет рентабельности хранения товаров на маркетплейсах</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Определение оптимальных цен и скидок для максимизации прибыли</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Выявление неликвидных товаров и стратегии по минимизации убытков</span>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    warehouses: <div className="rounded-lg overflow-hidden border bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-md overflow-hidden border">
          <img src="/lovable-uploads/7ba9928e-efa7-4698b817-c86fd1469852.png" alt="Управление складами" className="w-full h-auto" />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-2">Эффективное управление складами</h3>
          <p className="text-muted-foreground mb-3">Полный контроль над движением товаров и оптимизация складских процессов</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Мониторинг распределения товаров по всем складам маркетплейсов</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Отслеживание товаров в пути к клиентам и от клиентов (возвраты)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Анализ рентабельности хранения с прогнозированием затрат</span>
            </li>
          </ul>
        </div>
      </div>
    </div>,
    finance: <div className="rounded-lg overflow-hidden border bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="rounded-md overflow-hidden border">
          <img src="/lovable-uploads/758cd31f-77d8-4fba-a4b5-6b5e48980883.png" alt="Финансовый контроль" className="w-full h-auto" />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-2">Полный финансовый контроль</h3>
          <p className="text-muted-foreground mb-3">Отслеживание всех финансовых потоков вашего бизнеса на маркетплейсах в одном месте</p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Учет всех комиссий маркетплейсов и дополнительных расходов</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Расчет чистой прибыли по каждому товару и категории</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
              <span>Планирование финансовых показателей и сравнение с фактическими</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  };

  // New data for pros and cons section
  const prosAndCons = {
    pros: [
      {
        title: "Рост прибыли",
        description: "В среднем +23% к чистой прибыли за счет оптимизации товарного портфеля",
        icon: <TrendingUp className="h-10 w-10 text-emerald-500" />,
        value: 23,
        color: "emerald"
      },
      {
        title: "Экономия времени",
        description: "До 15 часов в неделю экономии на рутинных операциях",
        icon: <Clock className="h-10 w-10 text-blue-500" />,
        value: 15,
        color: "blue"
      },
      {
        title: "Снижение возвратов",
        description: "В среднем на 18% меньше возвратов благодаря грамотному планированию поставок",
        icon: <ArrowUpCircle className="h-10 w-10 text-indigo-500" />,
        value: 18,
        color: "indigo"
      },
      {
        title: "Сокращение остатков",
        description: "До 32% снижение неликвидных товарных остатков",
        icon: <Scale className="h-10 w-10 text-violet-500" />,
        value: 32,
        color: "violet"
      }
    ],
    cons: [
      {
        title: "Потерянная прибыль",
        description: "До 38% потенциальной прибыли теряется из-за неоптимальных цен",
        icon: <TrendingDown className="h-10 w-10 text-red-500" />,
        value: 38,
        color: "red"
      },
      {
        title: "Избыточные расходы",
        description: "В среднем 22% бюджета тратится на неэффективное хранение",
        icon: <AlertTriangle className="h-10 w-10 text-orange-500" />,
        value: 22,
        color: "orange"
      },
      {
        title: "Упущенные возможности",
        description: "До 45% потенциальных продаж теряется из-за отсутствия аналитики",
        icon: <Ban className="h-10 w-10 text-rose-500" />,
        value: 45,
        color: "rose"
      },
      {
        title: "Риск неликвидности",
        description: "До 27% товаров становятся неликвидными без системы контроля",
        icon: <XCircle className="h-10 w-10 text-pink-500" />,
        value: 27,
        color: "pink"
      }
    ]
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

      {/* Pros and Cons Section */}
      <section className="py-20 px-6 md:px-12 lg:px-16 bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-blue-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Факты о работе на маркетплейсах</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Сравните результаты работы с аналитической платформой и без неё
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Pros Column */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                  <ThumbsUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">С Zerofy</h3>
              </div>
              
              <div className="space-y-6">
                {prosAndCons.pros.map((pro, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-${pro.color}-100 dark:border-${pro.color}-900/30 overflow-hidden`}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`bg-${pro.color}-100 dark:bg-${pro.color}-900/30 p-3 rounded-lg`}>
                          {pro.icon}
                        </div>
                        <h4 className="text-xl font-semibold">{pro.title}</h4>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{pro.description}</p>
                      
                      <div className="bg-gray-100 dark:bg-gray-700/50 h-3 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r from-${pro.color}-500 to-${pro.color}-400`}
                          style={{ width: `${pro.value}%` }}
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${pro.value}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <div className="mt-2 text-right text-sm font-medium text-muted-foreground">
                        +{pro.value}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Cons Column */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                  <ThumbsDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400">Без аналитики</h3>
              </div>
              
              <div className="space-y-6">
                {prosAndCons.cons.map((con, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-${con.color}-100 dark:border-${con.color}-900/30 overflow-hidden`}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`bg-${con.color}-100 dark:bg-${con.color}-900/30 p-3 rounded-lg`}>
                          {con.icon}
                        </div>
                        <h4 className="text-xl font-semibold">{con.title}</h4>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{con.description}</p>
                      
                      <div className="bg-gray-100 dark:bg-gray-700/50 h-3 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r from-${con.color}-500 to-${con.color}-400`}
                          style={{ width: `${con.value}%` }}
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${con.value}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <div className="mt-2 text-right text-sm font-medium text-muted-foreground">
                        -{con.value}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Data Visualization */}
          <motion.div 
            className="mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/30">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                    Сравнение эффективности бизнеса
                  </span>
                </CardTitle>
                <CardDescription>Средние показатели компаний до и после внедрения аналитической платформы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Прибыль', withZerofy: 123, withoutZerofy: 100 },

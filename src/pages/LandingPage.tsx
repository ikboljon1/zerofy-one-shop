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
      setActiveScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const screenshots = [
    {
      src: "/lovable-uploads/4ea57e12-c728-4a2d-96bd-041c251862ec.png",
      alt: "Аналитика продаж",
      title: "Детальная аналитика продаж",
      description: "Полная структура продаж, динамика выручки и данные о возвратах в одном интерфейсе"
    },
    {
      src: "/lovable-uploads/0a0d0dd7-b54d-4163-ba50-1ddbb5b6dd7d.png",
      alt: "Детализация заказов",
      title: "Мониторинг заказов в реальном времени",
      description: "Отслеживайте статистику заказов и продаж с визуализацией по категориям товаров"
    },
    {
      src: "/lovable-uploads/9f6e8e49-868a-45c9-a6e7-9c8878a3e760.png",
      alt: "Статистика рекламных кампаний",
      title: "Эффективность рекламных кампаний",
      description: "Подробная статистика рекламных показателей: CTR, CPC, конверсия и затраты"
    },
    {
      src: "/lovable-uploads/ad827d18-f927-4c73-ae94-56ad73d7407c.png",
      alt: "Управление товарами",
      title: "Умное управление товарами",
      description: "Полная информация о каждом товаре с показателями прибыльности и динамикой продаж"
    }
  ];

  const features = [
    {
      icon: <BarChart2 className="h-6 w-6 text-primary" />,
      title: "Интеллектуальная аналитика",
      description: "Превращаем данные в золото с передовой аналитикой и выявляем скрытые тренды для стратегических решений."
    },
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: "Умное управление товарами",
      description: "Автоматизируем управление ассортиментом, прогнозируем спрос и оптимизируем закупки."
    },
    {
      icon: <Calculator className="h-6 w-6 text-primary" />,
      title: "Расчет рентабельности",
      description: "Мгновенно оцениваем прибыльность каждого товара с учетом всех скрытых расходов маркетплейсов."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Защита данных",
      description: "Обеспечиваем безопасность вашей бизнес-информации с многоуровневым шифрованием и контролем доступа."
    },
    {
      icon: <Rocket className="h-6 w-6 text-primary" />,
      title: "Революционная автоматизация",
      description: "Автоматически обновляем данные, генерируем отчеты и отправляем уведомления о важных событиях."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Планирование поставок",
      description: "Анализируем историю продаж и сезонные тренды для оптимизации графика поставок."
    }
  ];

  const recommendations = [
    {
      productName: "Кроссовки спортивные NIKE Air Max",
      sku: "WB-12547863",
      image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=150&h=150&auto=format&fit=crop",
      recommendation: "сохранить цену",
      reason: "Оптимальный баланс продаж и маржинальности",
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      stats: [
        { label: "Текущая цена", value: "6 990 ₽" },
        { label: "Продажи/нед.", value: "47 шт." },
        { label: "Маржа", value: "32%" }
      ]
    },
    {
      productName: "Сумка женская кожаная COACH",
      sku: "WB-98547632",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=150&h=150&auto=format&fit=crop",
      recommendation: "снизить цену",
      reason: "Высокая конкуренция и падение спроса",
      icon: <TrendingDown className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-50 text-blue-800 border-blue-200",
      stats: [
        { label: "Текущая цена", value: "12 500 ₽" },
        { label: "Рекомендуемая", value: "10 900 ₽" },
        { label: "Прогноз роста", value: "+45%" }
      ]
    },
    {
      productName: "Платье летнее ZARA",
      sku: "WB-45632178",
      image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=150&h=150&auto=format&fit=crop",
      recommendation: "срочно продать",
      reason: "Высокие затраты на хранение, конец сезона",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      color: "bg-red-50 text-red-800 border-red-200",
      stats: [
        { label: "Затраты/мес.", value: "15 800 ₽" },
        { label: "Текущая цена", value: "4 990 ₽" },
        { label: "Рекомендуемая", value: "2 990 ₽" }
      ]
    }
  ];

  const storageAnalysis = {
    title: "Анализ платного хранения",
    description: "Алгоритм выявил товары с высокими затратами на хранение относительно продаж:",
    data: [
      { name: "Товар А", storage: 80, sales: 20, ratio: 4.0 },
      { name: "Товар Б", storage: 65, sales: 35, ratio: 1.86 },
      { name: "Товар В", storage: 40, sales: 60, ratio: 0.67 }
    ]
  };

  const pricingInsight = {
    title: "Оптимизация ценообразования",
    description: "ИИ-модель рассчитала идеальную цену для максимизации прибыли:",
    values: [
      { label: "Текущая цена", value: "2 490 ₽" },
      { label: "Оптимальная цена", value: "2 190 ₽" },
      { label: "Рост продаж", value: "+35%" },
      { label: "Рост прибыли", value: "+18%" }
    ]
  };

  const pricing = [
    {
      name: "Стартап",
      price: "0",
      description: "Идеальный выбор для амбициозных начинающих продавцов",
      features: [
        "Управление до 100 SKU",
        "Базовая аналитика эффективности",
        "Один пользовательский аккаунт",
        "Приоритетная email-поддержка",
        "30-дневная история данных",
        "Основные аналитические отчеты"
      ],
      popular: false,
      buttonVariant: "outline" as const
    },
    {
      name: "Бизнес",
      price: "1999",
      description: "Оптимальное решение для растущего бизнеса",
      features: [
        "Управление до 1000 SKU",
        "Продвинутая аналитика и прогнозирование",
        "До 3 пользовательских аккаунтов",
        "Приоритетная поддержка с гарантией ответа",
        "Бесшовная интеграция с 1С",
        "Полная история данных за 6 месяцев",
        "Интеллектуальное прогнозирование спроса",
        "Мгновенные уведомления о важных событиях"
      ],
      popular: true,
      buttonVariant: "default" as const
    },
    {
      name: "Корпоративный",
      price: "4999",
      description: "Максимальные возможности для серьезного бизнеса",
      features: [
        "Неограниченное количество товаров",
        "Премиум-аналитика с ИИ-рекомендациями",
        "Неограниченное число пользователей",
        "Круглосуточная поддержка 24/7",
        "Полная интеграционная экосистема",
        "Расширенный API-доступ",
        "Неограниченная история данных",
        "Конструктор индивидуальных отчетов",
        "Персональный менеджер успеха клиента",
        "Обучение и сертификация сотрудников"
      ],
      popular: false,
      buttonVariant: "outline" as const
    }
  ];

  const testimonials = [
    {
      quote: "После внедрения Zerofy наши продажи выросли на 35% всего за три месяца. Точная аналитика помогла выявить неочевидные точки роста, а автоматизация освободила команду от рутины. Это был настоящий прорыв!",
      author: "Анна М.",
      company: "Модный бутик 'Стиль'"
    },
    {
      quote: "Раньше подготовка отчетности занимала у нас до 2 дней ежемесячно. С Zerofy все критически важные данные доступны в любой момент. Теперь мы принимаем решения молниеносно, опережая конкурентов.",
      author: "Сергей К.",
      company: "ТехноМаркет"
    },
    {
      quote: "Благодаря интеллектуальной системе планирования поставок Zerofy, мы сократили складские издержки на 22% и полностью избавились от проблемы неликвидов. При этом доступность товаров выросла до 98%. Фантастический результат!",
      author: "Елена В.",
      company: "Детские игрушки 'Радость'"
    }
  ];

  const demoTabs = [
    {
      id: "analytics",
      title: "Аналитика продаж",
      icon: <BarChart2 className="h-5 w-5" />,
      description: "Полная картина ваших продаж с детализацией по любому параметру"
    },
    {
      id: "recommendations",
      title: "AI-рекомендации",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Умные советы по оптимизации цен и управлению товарами"
    },
    {
      id: "warehouses",
      title: "Управление складами",
      icon: <BoxSelect className="h-5 w-5" />,
      description: "Оптимизация логистики и контроль складских запасов"
    },
    {
      id: "finance",
      title: "Финансовый контроль",
      icon: <CircleDollarSign className="h-5 w-5" />,
      description: "Отслеживание всех финансовых показателей вашего бизнеса"
    }
  ];

  const demoContent = {
    analytics: (
      <div className="rounded-lg overflow-hidden border bg-card p-1">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Аналитическая панель продаж</h3>
            <p className="text-muted-foreground">Интерактивная визуализация данных о продажах и ключевых метриках</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 text-emerald-500 mr-2" />
                  Продажи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₽1.45M</div>
                <div className="text-sm text-emerald-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +18% к прошлому месяцу
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  Покупатели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3,842</div>
                <div className="text-sm text-blue-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12% к прошлому месяцу
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 text-violet-500 mr-2" />
                  Конверсия
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5.8%</div>
                <div className="text-sm text-violet-600 flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +2.1% к прошлому месяцу
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-lg bg-white/80 backdrop-blur p-4">
            <div className="h-48 w-full flex items-center justify-center">
              <div className="w-full flex space-x-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end"
                  >
                    <div 
                      className="w-full bg-primary/80" 
                      style={{ 
                        height: `${20 + Math.sin(i / 2) * 60}px`,
                        opacity: 0.7 + (i / 24)
                      }}
                    />
                    <div className="text-xs mt-1">{`${i + 1}.${new Date().getMonth() + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-muted-foreground">Динамика продаж за текущий месяц</div>
              <Button variant="ghost" size="sm" className="text-xs">Полный отчет</Button>
            </div>
          </div>
        </div>
      </div>
    ),
    recommendations: (
      <div className="rounded-lg overflow-hidden border bg-card p-1">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Искусственный интеллект для вашего бизнеса</h3>
            <p className="text-muted-foreground">Персонализированные рекомендации по оптимизации цен и товаров</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PercentSquare className="h-5 w-5 text-amber-500 mr-2" />
                  Ценовая оптимизация
                </CardTitle>
                <CardDescription>
                  Идеальная цена для максимизации прибыли
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Текущая цена</span>
                    <span className="font-medium">2 490 ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-600">
                    <span className="text-sm">Оптимальная цена</span>
                    <span className="font-medium">2 190 ₽</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: "85%" }} />
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 text-sm">
                    <span>Прогноз роста продаж</span>
                    <span>+35%</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600 text-sm">
                    <span>Прогноз роста прибыли</span>
                    <span>+18%</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Применить рекомендацию</Button>
              </CardFooter>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BadgeDollarSign className="h-5 w-5 text-red-500 mr-2" />
                  Товарные излишки
                </CardTitle>
                <CardDescription>
                  Товары с высокими затратами на хранение
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Товар А</span>
                      <span className="text-red-500 font-medium">4.0x</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Товар Б</span>
                      <span className="text-amber-500 font-medium">1.86x</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: "65%" }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Товар В</span>
                      <span className="text-emerald-500 font-medium">0.67x</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: "40%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Просмотреть все товары</Button>
              </CardFooter>
            </Card>
          </div>
          <Card className="bg-white/80 backdrop-blur p-4 flex flex-col md:flex-row items-center">
            <div className="p-2 rounded-full bg-amber-100 mr-4 mb-4 md:mb-0">
              <Lightbulb className="h-8 w-8 text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">ИИ-рекомендация дня</h4>
              <p className="text-sm text-muted-foreground">
                Проанализировав данные, мы заметили, что снижение цены на категорию "Летняя одежда" на 10% может увеличить продажи на 28% и общую прибыль на 15%, основываясь на сезонных трендах прошлых лет.
              </p>
            </div>
            <Button className="mt-4 md:mt-0 md:ml-4 whitespace-nowrap" size="sm">
              Применить
            </Button>
          </Card>
        </div>
      </div>
    ),
    warehouses: (
      <div className="rounded-lg overflow-hidden border bg-card p-1">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Управление складской логистикой</h3>
            <p className="text-muted-foreground">Контроль остатков и оптимизация хранения товаров</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur p-4 col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Карта складов и остатков</h4>
                <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
                  12 складов
                </div>
              </div>
              <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute h-40 w-40 rounded-full bg-emerald-100 opacity-50"></div>
                  <div className="absolute h-28 w-28 rounded-full bg-emerald-200 opacity-50"></div>
                  <div className="absolute h-16 w-16 rounded-full bg-emerald-300 opacity-50"></div>
                  
                  {/* Маркеры складов */}
                  <div className="absolute top-1/4 left-1/4 h-3 w-3 rounded-full bg-emerald-500"></div>
                  <div className="absolute top-1/2 left-1/3 h-4 w-4 rounded-full bg-emerald-600"></div>
                  <div className="absolute bottom-1/3 right-1/4 h-3 w-3 rounded-full bg-emerald-500"></div>
                  <div className="absolute top-1/3 right-1/3 h-5 w-5 rounded-full bg-emerald-700"></div>
                  <div className="absolute bottom-1/4 left-1/3 h-3 w-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                  <p className="text-sm">Интерактивная карта складов</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-sm font-medium">МСК</div>
                  <div className="text-xs text-muted-foreground">4582 ед.</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">СПБ</div>
                  <div className="text-xs text-muted-foreground">2871 ед.</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">КЗН</div>
                  <div className="text-xs text-muted-foreground">1458 ед.</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">РСТ</div>
                  <div className="text-xs text-muted-foreground">1254 ед.</div>
                </div>
              </div>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 text-emerald-500 mr-2" />
                  Оптимизация распределения
                </CardTitle>
                <CardDescription>
                  Рекомендации по перераспределению товаров
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2 border-l-4 border-emerald-500 pl-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">МСК → СПБ</div>
                    <div className="text-xs text-muted-foreground">Сократит время доставки на 38%</div>
                  </div>
                  <Button variant="ghost" size="sm">Подробнее</Button>
                </div>
                <div className="flex items-center space-x-2 border-l-4 border-amber-500 pl-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">КЗН → РСТ</div>
                    <div className="text-xs text-muted-foreground">Оптимизирует загрузку складов</div>
                  </div>
                  <Button variant="ghost" size="sm">Подробнее</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Просмотреть все рекомендации</Button>
              </CardFooter>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BellRing className="h-5 w-5 text-red-500 mr-2" />
                  Критические уровни запасов
                </CardTitle>
                <CardDescription>
                  Товары, требующие срочного пополнения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Кроссовки Nike Air Max</div>
                      <div className="text-xs text-muted-foreground">36-40 размеры</div>
                    </div>
                    <div className="text-red-500 text-sm font-medium">
                      5 дней
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Футболки базовые</div>
                      <div className="text-xs text-muted-foreground">Белый цвет</div>
                    </div>
                    <div className="text-amber-500 text-sm font-medium">
                      12 дней
                    </div>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Просмотреть все товары</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    ),
    finance: (
      <div className="rounded-lg overflow-hidden border bg-card p-1">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Финансовый контроль бизнеса</h3>
            <p className="text-muted-foreground">Полная прозрачность всех финансовых потоков в одном месте</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Landmark className="h-5 w-5 text-blue-500 mr-2" />
                  Финансовые показатели
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Выручка</span>
                    <span className="text-lg font-bold">₽1.45M</span>
                    <span className="text-xs text-emerald-600">+12.5%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Прибыль</span>
                    <span className="text-lg font-bold">₽486K</span>
                    <span className="text-xs text-emerald-600">+9.2%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Расходы</span>
                    <span className="text-lg font-bold">₽964K</span>
                    <span className="text-xs text-red-600">+14.1%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Маржа</span>
                    <span className="text-lg font-bold">33.5%</span>
                    <span className="text-xs text-amber-600">-1.8%</span>
                  </div>
                </div>
                <div className="mt-4 h-32 w-full flex items-end justify-between space-x-2">
                  {[35, 42, 38, 54, 48, 62, 58, 70, 65, 75, 78, 82].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div className="w-full flex space-x-[2px]">
                        <div
                          className="flex-1 bg-blue-200"
                          style={{ height: `${height * 0.5}px` }}
                        />
                        <div
                          className="flex-1 bg-blue-400"
                          style={{ height: `${height * 0.8}px` }}
                        />
                        <div
                          className="flex-1 bg-blue-600"
                          style={{ height: `${height}px` }}
                        />
                      </div>
                      <div className="text-xs mt-1">{i + 1}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Database className="h-5 w-5 text-violet-500 mr-2" />
                  Структура расходов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative p-4">
                  <div className="h-40 w-40 mx-auto

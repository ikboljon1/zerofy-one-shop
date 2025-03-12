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
    quote: "Благодаря интеллектуальной системе планирования поставок Zerofy, мы сократили складские издержки на 22% и полностью избавились от проблемы неликвидов. При этом доступность товаров выросла до 98%. Фантастический результат!",
    author: "Елена В.",
    company: "Детские игрушки 'Радость'"
  }];




import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, Users, ShieldCheck, BarChart2, Package, CircleCheck, Rocket, Clock, Settings, CreditCard, HeartHandshake, MessageSquare, ArrowRight, LineChart, PieChart, Gauge, AreaChart, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";
import { motion } from "framer-motion";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeScreenshot, setActiveScreenshot] = useState(0);
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
      description: "Полная информац��я о каждом товаре с показателями прибыльности и динамикой продаж"
    }
  ];

  const features = [
    {
      icon: <BarChart2 className="h-6 w-6 text-primary" />,
      title: "Интеллектуальная аналитика",
      description: "Превратите данные в золото с нашей передовой аналитикой. Отслеживайте динамику продаж, выявляйте скрытые тренды и принимайте стратегические решения на основе точных данных в режиме реального времени."
    },
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: "Умное управление товарами",
      description: "Возьмите полный контроль над вашим ассортиментом. Наша система не просто отслеживает остатки — она прогнозирует спрос, оптимизирует закупки и автоматизирует рутинные процессы управления каталогом."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Непробиваемая защита данных",
      description: "Ваша бизнес-информация под надежной защитой. Многоуровневое шифрование, регулярное резервное копирование и строгий контроль доступа обеспечивают безопасность ваших самых ценных активов — ваших данных."
    },
    {
      icon: <Rocket className="h-6 w-6 text-primary" />,
      title: "Революционная автоматизация",
      description: "Забудьте о рутинных задачах. Наша система автоматически обновляет данные, генерирует отчеты и отправляет уведомления о критически важных событиях, позволяя вам сосредоточиться на стратегическом развитии бизнеса."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Точное планирование поставок",
      description: "Прощайте, неликвиды и упущенные продажи! Наши алгоритмы машинного обучения анализируют историю продаж и сезонные тренды, создавая оптимальный график поставок и идеальный баланс складски�� запасов."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Кристальная финансовая аналитика",
      description: "Трансформируйте хаос финансовых данных в четкую картину. Отслеживайте каждую копейку: от валовой выручки до чистой прибыли, с учетом всех комиссий, налогов и скрытых расходов маркетплейсов."
    }
  ];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Zerofy</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => handleAuthClick('login')}>
              Войти
            </Button>
            <Button onClick={() => handleAuthClick('register')}>
              Начать бесплатно
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-10 left-0 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-6xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Превратите свой бизнес на маркетплейсах в финансовую империю
              </h1>
              <p className="text-xl mb-10 text-muted-foreground max-w-3xl mx-auto">
                Zerofy — интеллектуальная платформа для увеличения прибыли и масштабирования продаж на Wildberries, Ozon и других маркетплейсах. 
                Преобразите хаос данных в ясные стратегические решения и возьмите полный контроль над вашим растущим бизнесом.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => handleAuthClick('register')} 
                  className="group animate-pulse-slow"
                >
                  Начать бесплатно 
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>

            {/* App Screenshots Carousel */}
            <div className="relative mt-16 mb-12 max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {screenshots.map((screenshot, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: activeScreenshot === index ? 1 : 0,
                    scale: activeScreenshot === index ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                  style={{ display: activeScreenshot === index ? 'block' : 'none' }}
                >
                  <img 
                    src={screenshot.src} 
                    alt={screenshot.alt} 
                    className="w-full h-auto object-cover rounded-xl border border-muted shadow-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4 text-white">
                    <h3 className="text-xl font-semibold mb-1">{screenshot.title}</h3>
                    <p className="text-sm text-gray-300">{screenshot.description}</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 z-10">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveScreenshot(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeScreenshot === index 
                        ? "w-8 bg-primary" 
                        : "bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card/60 backdrop-blur-sm p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md"
              >
                <LineChart className="h-10 w-10 text-primary mb-3" />
                <h3 className="text-lg font-medium mb-2">Аналитика в реальном времени</h3>
                <p className="text-muted-foreground text-sm">Все ключевые метрики вашего бизнеса в одном месте с обновлением данных в реальном времени</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card/60 backdrop-blur-sm p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md"
              >
                <PieChart className="h-10 w-10 text-primary mb-3" />
                <h3 className="text-lg font-medium mb-2">Структура расходов</h3>
                <p className="text-muted-foreground text-sm">Детализированная разбивка в��ех расходов для контроля рентабельности каждого товара</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-card/60 backdrop-blur-sm p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md"
              >
                <Gauge className="h-10 w-10 text-primary mb-3" />
                <h3 className="text-lg font-medium mb-2">Эффективность рекламы</h3>
                <p className="text-muted-foreground text-sm">Оценка рентабельности рекламных кампаний с показателями CTR, CPC и конверсии</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-card/60 backdrop-blur-sm p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md"
              >
                <TrendingUp className="h-10 w-10 text-primary mb-3" />
                <h3 className="text-lg font-medium mb-2">Тренды продаж</h3>
                <p className="text-muted-foreground text-sm">Анализ динамики продаж для своевременного выявления растущих и падающих товаров</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-center mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Инновационные возможности платформы</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
                Мы создали комплексную экосистему инструментов для полного контроля над вашим бизнесом на маркетплейсах.
                От глубинной аналитики до интеллектуального управления поставками — весь ваш бизнес на одной платформе.
              </p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className="mb-4 p-3 bg-primary/10 rounded-full inline-block">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-center mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Как работает Zerofy
              </h2>
              <p className="text-center text-muted-foreground max-w-3xl mx-auto">
                Наша платформа интегрируется с вашими маркетплейсами и предоставляет полную картину бизнеса всего за несколько простых шагов
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2 hidden md:block"></div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="bg-card p-8 rounded-lg shadow-lg border border-primary/20 relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">1</div>
                  <h3 className="text-xl font-semibold mb-4 mt-6 text-center">Подключение аккаунта</h3>
                  <p className="text-muted-foreground text-center">
                    Добавьте API-ключи от ваших маркетплейсов и настройте интеграцию в несколько кликов
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="bg-card p-8 rounded-lg shadow-lg border border-primary/20 relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">2</div>
                  <h3 className="text-xl font-semibold mb-4 mt-6 text-center">Мгновенная аналитика</h3>
                  <p className="text-muted-foreground text-center">
                    Система автоматически собирает и обрабатывает данные, представляя их в удобном интерфейсе
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="bg-card p-8 rounded-lg shadow-lg border border-primary/20 relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">3</div>
                  <h3 className="text-xl font-semibold mb-4 mt-6 text-center">Принятие решений</h3>
                  <p className="text-muted-foreground text-center">
                    Используйте аналитические данные для стратегических решений и масштабирования продаж
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-center mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Почему лидеры выбирают Zerofy</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                Мы предоставляем не просто инструменты, а полноценную экосистему для принятия стратегических решений и трансформации вашего бизнеса
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <HeartHandshake className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Интуитивно понятный интерфейс</h3>
                <p className="text-muted-foreground">
                  Мы создали элегантный и простой интерфейс, в котором удобно разберется даже новичок. Забудьте о долгом обучении — начните получать резул��таты с первого дня.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Экспертная поддержка 24/7</h3>
                <p className="text-muted-foreground">
                  За каждым клиентом закреплен персональный менеджер с опытом в e-commerce. Мы не просто решаем технические вопросы, но и помогаем выстраивать стратегию роста.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Rocket className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Постоянное развитие</h3>
                <p className="text-muted-foreground">
                  Мы внедряем новые функции ежемесячно, основываясь на обратной связи от клиентов и анализе рынка. С Zerofy вы всегда на шаг впереди изменений на маркетплейсах.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-center mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Истории успеха наших клиентов</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute -top-4 -left-4 text-8xl text-primary/10 font-serif">"</div>
                  <p className="text-muted-foreground mb-4 italic relative z-10">"{testimonial.quote}"</p>
                  <div className="relative z-10">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Statistics */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-center mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Zerofy в цифрах</h2>
              <p className="text-center text-muted-foreground max-w-3xl mx-auto">
                Измеримые результаты, которые говорят сами за себя
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                  <span className="mr-2">500+</span>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-muted-foreground">Активных клиентов</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">₽1.5 млрд+</div>
                <p className="text-muted-foreground">Ежемесячный оборот клиентов</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">35%</div>
                <p className="text-muted-foreground">Средний рост продаж</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-card p-6 rounded-lg shadow-sm border text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Поддержка клиентов</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-center mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Инвестиции в ваш успех</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                Выберите оптимальный план, соответствующий вашим амбициям. Начните бесплатно и масштабируйтесь вместе с ростом вашего бизнеса.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricing.map((plan, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "bg-card p-6 rounded-lg shadow-sm border relative hover:transform hover:-translate-y-1 transition-all duration-300", 
                    plan.popular && "border-primary shadow-md"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium animate-pulse-slow">
                      Выбор лидеров
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== "0" && <span className="text-muted-foreground ml-1">₽/мес</span>}
                    {plan.price === "0" && <span className="text-muted-foreground ml-1">₽</span>}
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CircleCheck className="h-5 w-5 text-primary mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={cn("w-full group", plan.popular && "animate-pulse-slow")}
                    variant={plan.buttonVariant}
                    onClick={() => handleAuthClick('register')}
                  >
                    {plan.price === "0" ? "Начать бесплатно" : "Выбрать тариф"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-purple-500/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          </div>
          <div className="container mx-auto max-w-3xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Готовы к трансформации бизнеса?</h2>
              <p className="text-xl mb-8 text-muted-foreground">
                Присоединяйтесь к сообществу успешных предпринимателей, которые уже увеличили прибыльность своего бизнеса с помощью Zerofy
              </p>
              <Button 
                size="lg" 
                onClick={() => handleAuthClick('register')} 
                className="group animate-pulse-slow bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                Начать бесплатно прямо сейчас
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Zerofy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Революционная платформа для масштабирования вашего бизнеса на маркетплейсах через интеллектуальную аналитику
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Экосистема решений</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Многомерная аналитика</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Интеллектуальный товарный менеджмент</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Оптимизация складской логистики</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Управление рекламными кампаниями</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">О компании</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Наша миссия</li>
                <li className="hover:text-primary transition-colors cursor-pointer">База знаний</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Карьера в Zerofy</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Связаться с нами</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Клиентская поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Центр помощи 24/7</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Техническая документация</li>
                <li className="hover:text-primary transition-colors cursor-pointer">API для разработчиков</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Сообщество селлеров</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} Zerofy. Все права защищены. Инвестируйте в свой успех.
            </div>
            <div className="space-x-4">
              <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">Политика конфиденциальности</Button>
              <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">Условия использования</Button>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </div>
  );
};

export default LandingPage;

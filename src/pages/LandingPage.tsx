
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, Users, ShieldCheck, BarChart2, Package, CircleCheck, Rocket, Clock, Settings, CreditCard, HeartHandshake, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

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
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Командная синергия",
      description: "Объединяйте усилия вашей команды с продвинутой системой разграничения прав доступа. Создавайте уникальные роли, назначайте задачи и наблюдайте, как эффективность вашего бизнеса растет в геометрической прогрессии."
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
      description: "Прощайте, неликвиды и упущенные продажи! Наши алгоритмы машинного обучения анализируют историю продаж и сезонные тренды, создавая оптимальный график поставок и идеальный баланс складских запасов."
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Безграничная персонализация",
      description: "Настраивайте систему под уникальные потребности вашего бизнеса. От пользовательского интерфейса до сложных бизнес-процессов — Zerofy адаптируется к вам, а не наоборот, обеспечивая максимальную эффективность."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Кристальная финансовая аналитика",
      description: "Трансформируйте хаос финансовых данных в четкую картину. Отслеживайте каждую копейку: от валовой выручки до чистой прибыли, с учетом всех комиссий, налогов и скрытых расходов маркетплейсов."
    }
  ];

  const systemAdvantages = [
    {
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
      title: "Интуитивно понятный интерфейс",
      description: "Дружественный интерфейс, который не требует специального обучения. Вы сможете начать работу с системой с первого дня использования."
    },
    {
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80",
      title: "Повышение эффективности",
      description: "В среднем наши клиенты увеличивают эффективность своей работы на 30% уже в первый месяц использования Zerofy."
    },
    {
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=600&q=80",
      title: "Аналитика на все случаи",
      description: "Точная и глубокая аналитика помогает принимать обоснованные решения и видеть полную картину вашего бизнеса на маркетплейсах."
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
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
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl font-bold md:text-6xl mb-6">
              Превратите свой бизнес на маркетплейсах в финансовую империю
            </h1>
            <p className="text-xl mb-10 text-muted-foreground max-w-3xl mx-auto">
              Zerofy — интеллектуальная платформа для увеличения прибыли и масштабирования продаж на Wildberries, Ozon и других маркетплейсах. 
              Преобразите хаос данных в ясные стратегические решения и возьмите полный контроль над вашим растущим бизнесом.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleAuthClick('register')}>
                Начать бесплатно <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* System Advantages with Images */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Почему Zerofy — это выбор лидеров</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Наша платформа предоставляет уникальные преимущества, которые помогают бизнесу расти и развиваться
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {systemAdvantages.map((advantage, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={advantage.image} 
                      alt={advantage.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                    <p className="text-muted-foreground">{advantage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Инновационные возможности платформы</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Мы создали комплексную экосистему инструментов для полного контроля над вашим бизнесом на маркетплейсах.
              От глубинной аналитики до интеллектуального управления поставками — весь ваш бизнес на одной платформе.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshot/Interface Showcase */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Интуитивно понятный интерфейс</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Современный и удобный интерфейс Zerofy позволяет быстро находить нужную информацию и эффективно управлять вашим бизнесом
            </p>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=1200&q=80" 
                alt="Интерфейс Zerofy" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Почему лидеры выбирают Zerofy</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Мы предоставляем не просто инструменты, а полноценную экосистему для принятия стратегических решений и трансформации вашего бизнеса
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <HeartHandshake className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Интуитивно понятный интерфейс</h3>
                <p className="text-muted-foreground">
                  Мы создали элегантный и простой интерфейс, в котором удобно разберется даже новичок. Забудьте о долгом обучении — начните получать результаты с первого дня.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Экспертная поддержка 24/7</h3>
                <p className="text-muted-foreground">
                  За каждым клиентом закреплен персональный менеджер с опытом в e-commerce. Мы не просто решаем технические вопросы, но и помогаем выстраивать стратегию роста.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                <Rocket className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Постоянное развитие</h3>
                <p className="text-muted-foreground">
                  Мы внедряем новые функции ежемесячно, основываясь на обратной связи от клиентов и анализе рынка. С Zerofy вы всегда на шаг впереди изменений на маркетплейсах.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Истории успеха наших клиентов</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-sm border hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Инвестиции в ваш успех</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Выберите оптимальный план, соответствующий вашим амбициям. Начните бесплатно и масштабируйтесь вместе с ростом вашего бизнеса.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricing.map((plan, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "bg-card p-6 rounded-lg shadow-sm border relative hover:transform hover:-translate-y-1 transition-all duration-300", 
                    plan.popular && "border-primary shadow-md"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
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
                    className="w-full" 
                    variant={plan.buttonVariant}
                    onClick={() => handleAuthClick('register')}
                  >
                    {plan.price === "0" ? "Начать бесплатно" : "Выбрать тариф"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/10">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Готовы к трансформации бизнеса?</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Присоединяйтесь к сообществу успешных предпринимателей, которые уже увеличили прибыльность своего бизнеса с помощью Zerofy
            </p>
            <Button size="lg" onClick={() => handleAuthClick('register')} className="animate-pulse-slow">
              Начать бесплатно прямо сейчас
            </Button>
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
                <li>Многомерная аналитика</li>
                <li>Интеллектуальный товарный менеджмент</li>
                <li>Оптимизация складской логистики</li>
                <li>Управление рекламными кампаниями</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">О компании</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Наша миссия</li>
                <li>База знаний</li>
                <li>Карьера в Zerofy</li>
                <li>Связаться с нами</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Клиентская поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Центр помощи 24/7</li>
                <li>Техническая документация</li>
                <li>API для разработчиков</li>
                <li>Сообщество селлеров</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} Zerofy. Все права защищены. Инвестируйте в свой успех.
            </div>
            <div className="space-x-4">
              <Button variant="ghost" size="sm">Политика конфиденциальности</Button>
              <Button variant="ghost" size="sm">Условия использования</Button>
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


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
      title: "Полная аналитика",
      description: "Подробная аналитика продаж, доходов и расходов для принятия взвешенных решений. Отслеживайте динамику и выявляйте тренды."
    },
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: "Управление товарами",
      description: "Удобное управление каталогом товаров, отслеживание остатков и поставок. Автоматизация рутинных процессов."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Многопользовательский доступ",
      description: "Предоставление доступа команде с разными уровнями прав. Совместная работа над проектами и задачами."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Безопасность данных",
      description: "Защита информации и регулярное резервное копирование. Шифрование данных и контроль доступа."
    },
    {
      icon: <Rocket className="h-6 w-6 text-primary" />,
      title: "Автоматизация процессов",
      description: "Автоматическое обновление данных, генерация отчетов и уведомления о важных событиях. Экономия времени на рутинных задачах."
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Планирование поставок",
      description: "Прогнозирование спроса и оптимизация складских запасов. Автоматическое планирование поставок на основе данных продаж."
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Гибкие настройки",
      description: "Настройка интерфейса и функций под ваши бизнес-процессы. Персонализация отчетов и метрик."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Финансовая аналитика",
      description: "Детальный анализ расходов, доходов и прибыли. Учет всех комиссий и удержаний маркетплейсов."
    }
  ];

  const pricing = [
    {
      name: "Базовый",
      price: "0",
      description: "Идеально для начинающих продавцов",
      features: [
        "До 100 товаров",
        "Базовая аналитика",
        "1 пользователь",
        "Email поддержка",
        "Ограниченная история данных (30 дней)",
        "Основные отчеты"
      ],
      popular: false,
      buttonVariant: "outline" as const
    },
    {
      name: "Стандарт",
      price: "1999",
      description: "Для растущего бизнеса",
      features: [
        "До 1000 товаров",
        "Расширенная аналитика",
        "До 3 пользователей",
        "Приоритетная поддержка",
        "Интеграция с 1С",
        "История данных за 6 месяцев",
        "Прогнозирование продаж",
        "Уведомления в реальном времени"
      ],
      popular: true,
      buttonVariant: "default" as const
    },
    {
      name: "Бизнес",
      price: "4999",
      description: "Полный контроль над бизнесом",
      features: [
        "Неограниченное количество товаров",
        "Премиум аналитика",
        "Неограниченное число пользователей",
        "24/7 поддержка",
        "Все интеграции",
        "API доступ",
        "Полная история данных",
        "Индивидуальные отчеты",
        "Персональный менеджер",
        "Обучение сотрудников"
      ],
      popular: false,
      buttonVariant: "outline" as const
    }
  ];

  const testimonials = [
    {
      quote: "Zerofy помог нам увеличить продажи на 35% за три месяца благодаря точной аналитике и автоматизации процессов.",
      author: "Анна М.",
      company: "Модный бутик 'Стиль'"
    },
    {
      quote: "Раньше мы тратили 2 дня на подготовку отчетов, теперь все данные доступны в реальном времени. Это изменило наш подход к бизнесу.",
      author: "Сергей К.",
      company: "ТехноМаркет"
    },
    {
      quote: "Благодаря Zerofy мы оптимизировали складские запасы и сократили издержки на 22%. Отличный инструмент!",
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
              Регистрация
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl font-bold md:text-6xl mb-6">
              Управляйте своим бизнесом на маркетплейсах эффективно
            </h1>
            <p className="text-xl mb-10 text-muted-foreground max-w-3xl mx-auto">
              Zerofy — платформа для аналитики и управления продажами на Wildberries, Ozon и других маркетплейсах. 
              Увеличьте прибыль, оптимизируйте процессы и получите полный контроль над вашим бизнесом.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleAuthClick('register')}>
                Начать бесплатно <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Возможности платформы</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Наши инструменты созданы, чтобы помочь вам управлять всеми аспектами вашего бизнеса на маркетплейсах.
              От аналитики продаж до управления поставками — всё в одном месте.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-sm border">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-4">Почему выбирают Zerofy</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Мы помогаем продавцам на маркетплейсах принимать решения на основе данных и улучшать бизнес-показатели
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <HeartHandshake className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Дружелюбный интерфейс</h3>
                <p className="text-muted-foreground">
                  Интуитивно понятный дизайн без лишних сложностей. Вы начнете работать с платформой без длительного обучения.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Поддержка реальных людей</h3>
                <p className="text-muted-foreground">
                  Наши специалисты всегда готовы помочь и ответить на ваши вопросы. Мы ценим каждого клиента.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border flex flex-col items-center text-center">
                <Rocket className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Регулярные обновления</h3>
                <p className="text-muted-foreground">
                  Мы постоянно развиваем платформу, добавляя новые функции и улучшая существующие на основе отзывов пользователей.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Отзывы клиентов</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-sm border">
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
            <h2 className="text-3xl font-bold text-center mb-4">Тарифы</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Выберите план, который подходит для вашего бизнеса. Вы всегда можете изменить его по мере роста.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricing.map((plan, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "bg-card p-6 rounded-lg shadow-sm border relative", 
                    plan.popular && "border-primary shadow-md"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Популярный
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
                    Выбрать тариф
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/10">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Готовы начать?</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Присоединяйтесь к сотням продавцов, которые уже оптимизировали свой бизнес с помощью Zerofy
            </p>
            <Button size="lg" onClick={() => handleAuthClick('register')}>
              Создать бесплатный аккаунт
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
                Платформа для аналитики и управления продажами на маркетплейсах
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Возможности</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Аналитика</li>
                <li>Управление товарами</li>
                <li>Складской учет</li>
                <li>Реклама</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>О нас</li>
                <li>Блог</li>
                <li>Карьера</li>
                <li>Контакты</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Центр помощи</li>
                <li>Документация</li>
                <li>API</li>
                <li>Сообщество</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} Zerofy. Все права защищены.
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


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight, Users, ShieldCheck, BarChart2, Package, CircleCheck } from "lucide-react";
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
      description: "Подробная аналитика продаж, доходов и расходов для принятия взвешенных решений."
    },
    {
      icon: <Package className="h-6 w-6 text-primary" />,
      title: "Управление товарами",
      description: "Удобное управление каталогом товаров, отслеживание остатков и поставок."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Многопользовательский доступ",
      description: "Предоставление доступа команде с разными уровнями прав."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Безопасность данных",
      description: "Защита информации и регулярное резервное копирование."
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
        "Email поддержка"
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
        "Интеграция с 1С"
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
        "API доступ"
      ],
      popular: false,
      buttonVariant: "outline" as const
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
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl font-bold md:text-6xl mb-6">
              Управляйте своим бизнесом на маркетплейсах эффективно
            </h1>
            <p className="text-xl mb-10 text-muted-foreground max-w-3xl mx-auto">
              Zerofy — платформа для аналитики и управления продажами на Wildberries, Ozon и других маркетплейсах.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleAuthClick('register')}>
                Начать бесплатно <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
                Демо-доступ
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Возможности платформы</h2>
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

        {/* Pricing */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Тарифы</h2>
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
      </main>

      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Zerofy</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Zerofy. Все права защищены.
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

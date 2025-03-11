
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  LineChart, 
  TrendingUp, 
  BarChart3, 
  ChevronRight, 
  Warehouse, 
  ShoppingCart, 
  ChartPieIcon,
  PlusCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FeatureVisualization from '@/components/FeatureVisualization';

// Создаем иконку ChartPieIcon, так как она не импортируется корректно
const ChartPieIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 dark:from-gray-950 dark:to-indigo-950/30">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
          Управляйте бизнесом на маркетплейсах эффективно
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mb-10">
          Полный набор инструментов для анализа, оптимизации и развития вашего бизнеса на Wildberries, Ozon и других маркетплейсах
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8">
            <Link to="/register">Начать бесплатно</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-lg px-8">
            <Link to="#features">Узнать больше</Link>
          </Button>
        </div>
      </header>

      {/* Features Visualization Section */}
      <section id="features-visual" className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900 rounded-3xl shadow-xl my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
            Полный комплекс аналитики для вашего бизнеса
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Визуальные инструменты для наглядного представления всех аспектов вашего бизнеса
          </p>
        </div>
        
        <FeatureVisualization />
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
            Ключевые возможности
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Все необходимые инструменты для эффективного управления бизнесом на маркетплейсах
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <LineChart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Аналитика продаж</CardTitle>
              <CardDescription>Детальный анализ продаж по товарам, категориям и периодам</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Динамика продаж в реальном времени</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Сравнение с предыдущими периодами</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Выявление трендов и сезонности</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 w-full" asChild>
                <Link to="/register">
                  Узнать больше
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <Warehouse className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Анализ платного хранения</CardTitle>
              <CardDescription>Оптимизация расходов на хранение товаров</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Расчет стоимости хранения по складам</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Анализ рентабельности с учетом хранения</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Рекомендации по оптимизации запасов</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 w-full" asChild>
                <Link to="/register">
                  Узнать больше
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Анализ рекламных кампаний</CardTitle>
              <CardDescription>Контроль эффективности рекламных инвестиций</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Отслеживание ключевых метрик рекламы</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Анализ ROI по рекламным кампаниям</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Оптимизация ставок и бюджетов</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 w-full" asChild>
                <Link to="/register">
                  Узнать больше
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Управление товарами</CardTitle>
              <CardDescription>Контроль ассортимента и характеристик товаров</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Мониторинг остатков и продаж</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Анализ карточек товаров</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Оптимизация ассортимента</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 w-full" asChild>
                <Link to="/register">
                  Узнать больше
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <ChartPieIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Финансовая аналитика</CardTitle>
              <CardDescription>Детальный учет доходов и расходов</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Расчет прибыли и рентабельности</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Учет всех видов расходов</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Прогнозирование финансовых результатов</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 w-full" asChild>
                <Link to="/register">
                  Узнать больше
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/40 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>AI-рекомендации</CardTitle>
              <CardDescription>Интеллектуальные подсказки для роста бизнеса</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Рекомендации по оптимизации цен</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Предложения по развитию ассортимента</span>
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                  <span>Советы по улучшению рекламы</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 w-full" asChild>
                <Link to="/register">
                  Узнать больше
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Готовы начать использовать все возможности?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto opacity-90">
            Зарегистрируйтесь бесплатно и получите доступ ко всем аналитическим инструментам для развития вашего бизнеса на маркетплейсах
          </p>
          <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-indigo-100 text-lg px-8">
            <Link to="/register">
              <PlusCircle className="mr-2 h-5 w-5" />
              Создать аккаунт бесплатно
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400">MarketplaceAnalytics</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Аналитика и оптимизация для маркетплейсов</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Условия использования
              </Link>
              <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                Контакты
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} MarketplaceAnalytics. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

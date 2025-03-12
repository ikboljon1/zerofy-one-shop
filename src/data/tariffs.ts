
export interface Tariff {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  storeLimit: number;
  featureCodes?: FeatureCode[]; // Добавляем коды доступных функций
}

// Список всех возможных функциональных возможностей
export type FeatureCode = 
  | 'analytics' // Аналитика
  | 'warehouse' // Склад
  | 'advertising' // Реклама
  | 'ai_assistant' // ИИ-ассистент
  | 'extended_statistics' // Расширенная статистика
  | 'multi_store' // Несколько магазинов
  | 'api_access' // Доступ к API
  | 'sales_calculator' // Калькулятор продаж
  | 'price_optimization' // Оптимизация цен
  | 'returns_analysis' // Анализ возвратов
  | 'market_insights' // Анализ рынка
  | 'competitor_monitoring' // Мониторинг конкурентов
  | 'forecast' // Прогнозирование
  | 'recommendations' // Рекомендации
  | 'expenses_calculator'; // Калькулятор расходов

// Initial tariff data that will be used both in admin panel and landing page
export const initialTariffs: Tariff[] = [
  {
    id: '1',
    name: 'Базовый',
    price: 990,
    period: 'monthly',
    description: 'Идеально для начинающих продавцов',
    features: [
      'Доступ к основным отчетам',
      'Управление до 100 товаров',
      'Базовая аналитика',
      'Email поддержка'
    ],
    isPopular: false,
    isActive: true,
    storeLimit: 1,
    featureCodes: [
      'analytics', 
      'expenses_calculator',
      'returns_analysis'
    ]
  },
  {
    id: '2',
    name: 'Профессиональный',
    price: 1990,
    period: 'monthly',
    description: 'Для растущих магазинов',
    features: [
      'Все функции Базового тарифа',
      'Управление до 1000 товаров',
      'Расширенная аналитика',
      'Приоритетная поддержка',
      'API интеграции'
    ],
    isPopular: true,
    isActive: true,
    storeLimit: 3,
    featureCodes: [
      'analytics',
      'warehouse',
      'advertising',
      'expenses_calculator',
      'returns_analysis',
      'sales_calculator',
      'price_optimization',
      'api_access'
    ]
  },
  {
    id: '3',
    name: 'Бизнес',
    price: 4990,
    period: 'monthly',
    description: 'Комплексное решение для крупных продавцов',
    features: [
      'Все функции Профессионального тарифа',
      'Неограниченное количество товаров',
      'Персональный менеджер',
      'Расширенный API доступ',
      'Белая метка (White Label)',
      'Приоритетные обновления'
    ],
    isPopular: false,
    isActive: true,
    storeLimit: 10,
    featureCodes: [
      'analytics',
      'warehouse',
      'advertising',
      'ai_assistant',
      'extended_statistics',
      'multi_store',
      'api_access',
      'sales_calculator',
      'price_optimization',
      'returns_analysis',
      'market_insights',
      'competitor_monitoring',
      'forecast',
      'recommendations',
      'expenses_calculator'
    ]
  }
];


import axios from 'axios';

// Типы для работы с AI анализом
export interface AnalysisContext {
  sales?: any[];
  orders?: any[];
  returns?: any[];
  expenses?: any;
  warehouses?: any[];
  products?: any[];
  period?: string;
  store?: {
    id: string;
    name: string;
    marketplace: string;
  };
}

export interface AIRecommendation {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'sales' | 'products' | 'expenses' | 'warehouses' | 'general';
  score?: number; // Оценка важности рекомендации (1-10)
}

// Функция для отправки данных на AI анализ
export const analyzeDataWithAI = async (context: AnalysisContext): Promise<AIRecommendation[]> => {
  try {
    // В реальной имплементации здесь будет запрос к OpenAI API или другому сервису
    // Сейчас используем моковые данные для демонстрации
    console.log('Отправка данных для AI анализа:', context);
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Для демонстрации возвращаем моковые рекомендации
    return generateMockRecommendations(context);
  } catch (error) {
    console.error('Ошибка при выполнении AI анализа:', error);
    throw error;
  }
}

// Генерация моковых рекомендаций на основе контекста
const generateMockRecommendations = (context: AnalysisContext): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  
  // Проверяем наличие данных о продажах
  if (context.sales && context.sales.length > 0) {
    // Проверяем последние 7 дней на падение продаж
    const recentSales = context.sales.slice(-7);
    const salesTrend = recentSales.map(s => typeof s.sales === 'number' ? s.sales : 0);
    
    if (salesTrend.length >= 3) {
      const lastThreeDays = salesTrend.slice(-3);
      const isDecreasing = lastThreeDays[0] > lastThreeDays[1] && lastThreeDays[1] > lastThreeDays[2];
      
      if (isDecreasing) {
        recommendations.push({
          title: 'Падение продаж',
          description: 'В последние 3 дня наблюдается снижение объема продаж. Рекомендуется проверить видимость товаров и активировать рекламные кампании.',
          type: 'warning',
          category: 'sales',
          score: 8
        });
      }
    }
    
    // Добавляем общую рекомендацию по продажам
    recommendations.push({
      title: 'Анализ продаж',
      description: 'Судя по данным, ваши самые активные дни продаж - это выходные. Рассмотрите возможность увеличения рекламного бюджета на пятницу-субботу для максимизации результатов.',
      type: 'info',
      category: 'sales',
      score: 6
    });
  }
  
  // Проверяем данные о расходах
  if (context.expenses) {
    const { logistics, storage, penalties, advertising } = context.expenses;
    
    // Проверяем большие расходы на логистику
    if (logistics && logistics > 10000) {
      recommendations.push({
        title: 'Высокие логистические расходы',
        description: 'Расходы на логистику составляют значительную часть ваших затрат. Рассмотрите возможность оптимизации маршрутов доставки или договоритесь о скидках с логистическими партнерами.',
        type: 'warning',
        category: 'expenses',
        score: 7
      });
    }
    
    // Проверяем штрафы
    if (penalties && penalties > 1000) {
      recommendations.push({
        title: 'Обратите внимание на штрафы',
        description: 'У вас наблюдаются значительные штрафы. Проанализируйте их причины и устраните основные источники для снижения затрат в будущем.',
        type: 'error',
        category: 'expenses',
        score: 9
      });
    }
  }
  
  // Рекомендации по товарам
  if (context.products && context.products.length > 0) {
    recommendations.push({
      title: 'Оптимизация ассортимента',
      description: 'На основе анализа ваших данных, рекомендуем сосредоточиться на развитии категорий с высокой маржинальностью. Наиболее перспективные категории: одежда, аксессуары и товары для дома.',
      type: 'success',
      category: 'products',
      score: 8
    });
    
    // Проверяем наличие возвратов
    if (context.returns && context.returns.length > 0) {
      recommendations.push({
        title: 'Высокий уровень возвратов',
        description: 'Обратите внимание на высокий уровень возвратов в категории "Электроника". Рекомендуем улучшить описание товаров и добавить подробные спецификации для снижения количества возвратов.',
        type: 'warning',
        category: 'products',
        score: 7
      });
    }
  }
  
  // Общие рекомендации по бизнесу
  recommendations.push({
    title: 'Сезонные тренды',
    description: 'Приближается сезон отпусков/праздников. Рекомендуем заранее подготовить маркетинговые кампании и обеспечить достаточные запасы популярных товаров.',
    type: 'info',
    category: 'general',
    score: 5
  });
  
  // Сортируем рекомендации по важности (score)
  return recommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
};

// В реальной имплементации здесь будет функция для формирования промпта для AI
export const formatContextForAI = (context: AnalysisContext): string => {
  return JSON.stringify(context, null, 2);
};

// Функция для вызова OpenAI API (заглушка, которую нужно реализовать при интеграции с реальным API)
export const callOpenAI = async (prompt: string): Promise<string> => {
  // Здесь будет реальный вызов API
  // Пример использования OpenAI API:
  /*
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Ты аналитик маркетплейсов, который дает рекомендации на основе данных о продажах, расходах и товарах." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
  */
  
  return "Мокированный ответ от OpenAI API";
};

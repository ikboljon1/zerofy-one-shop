import axios from 'axios';
import { getSelectedAIModel } from '@/utils/storeUtils';

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
    // Получаем выбранную AI модель
    const selectedModel = getSelectedAIModel();
    
    if (!selectedModel) {
      throw new Error('Не выбрана AI модель для анализа');
    }
    
    console.log(`Отправка данных на анализ с использованием ${selectedModel.type} модели`);
    
    // Форматируем контекст для отправки в AI
    const prompt = formatContextForAI(context);
    
    // В зависимости от типа модели используем разные API
    switch (selectedModel.type) {
      case "OpenAI":
        return await callOpenAI(prompt, selectedModel.apiKey);
      case "Gemini":
        return await callGemini(prompt, selectedModel.apiKey);
      case "Anthropic":
        return await callAnthropic(prompt, selectedModel.apiKey);
      case "Mistral":
        return await callMistral(prompt, selectedModel.apiKey);
      case "Llama":
        return await callLlama(prompt, selectedModel.apiKey);
      default:
        // В случае неизвестного типа модели используем моковые данные
        console.warn('Неизвестный тип AI модели, использую заглушку');
        return generateMockRecommendations(context);
    }
  } catch (error) {
    console.error('Ошибка при выполнении AI анализа:', error);
    
    // В случае ошибки возвращаем базовые рекомендации
    return [
      {
        title: 'Ошибка при анализе данных',
        description: 'Произошла ошибка при обращении к AI модели. Пожалуйста, проверьте валидность API ключа и правильность настроек.',
        type: 'error',
        category: 'general',
        score: 10
      }
    ];
  }
}

// Форматирование контекста для AI
export const formatContextForAI = (context: AnalysisContext): string => {
  const promptPrefix = `
  Ты - эксперт по аналитике маркетплейсов. Проанализируй следующие данные и дай рекомендации по улучшению показателей:
  
  Магазин: ${context.store?.name || "Не указан"}
  Площадка: ${context.store?.marketplace || "Не указана"}
  Период: ${context.period || "Не указан"}
  
  Данные для анализа:
  `;
  
  const contextData = JSON.stringify(context, null, 2);
  
  const promptSuffix = `
  
  Сделай анализ данных и дай рекомендации в следующем формате:
  1. Название рекомендации
  2. Подробное описание рекомендации
  3. Тип рекомендации (успех, предупреждение, информация, ошибка)
  4. Категория (продажи, това��ы, расходы, склады, общее)
  5. Важность (число от 1 до 10, где 10 - наиболее важно)
  
  Дай минимум 3 и максимум a5 конкретных рекомендаций, основанных на анализе данных.
  `;
  
  return promptPrefix + contextData + promptSuffix;
};

// Вызов OpenAI API
export const callOpenAI = async (prompt: string, apiKey: string): Promise<AIRecommendation[]> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Ты - эксперт по аналитике маркетплейсов, который дает рекомендации на основе данных о продажах, расходах и товарах." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const aiResponse = response.data.choices[0].message.content;
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error('Ошибка при вызове OpenAI API:', error);
    throw error;
  }
};

// Вызов Gemini API
export const callGemini = async (prompt: string, apiKey: string): Promise<AIRecommendation[]> => {
  try {
    // Get the selected AI model to determine specific version
    const selectedModel = getSelectedAIModel();
    // Default to gemini-pro if no specific version is found
    const modelVersion = selectedModel?.name?.includes('gemini-') 
      ? selectedModel.name 
      : 'gemini-pro';
    
    console.log(`Using Gemini model: ${modelVersion}`);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        }
      }
    );
    
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error('Ошибка при вызове Gemini API:', error);
    throw error;
  }
};

// Вызов Anthropic API
export const callAnthropic = async (prompt: string, apiKey: string): Promise<AIRecommendation[]> => {
  try {
    // В реальной имплементации здесь будет запрос к Anthropic API
    console.log('Вызов Anthropic API пока не реализован, используем заглушку');
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockRecommendations();
  } catch (error) {
    console.error('Ошибка при вызове Anthropic API:', error);
    throw error;
  }
};

// Вызов Mistral API
export const callMistral = async (prompt: string, apiKey: string): Promise<AIRecommendation[]> => {
  try {
    // В реальной имплементации здесь будет запрос к Mistral API
    console.log('Вызов Mistral API пока не реализован, используем заглушку');
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockRecommendations();
  } catch (error) {
    console.error('Ошибка при вызове Mistral API:', error);
    throw error;
  }
};

// Вызов Llama API
export const callLlama = async (prompt: string, apiKey: string): Promise<AIRecommendation[]> => {
  try {
    // В реальной имплементации здесь будет запрос к Llama API
    console.log('Вызов Llama API пока не реализован, используем заглушку');
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockRecommendations();
  } catch (error) {
    console.error('Ошибка при вызове Llama API:', error);
    throw error;
  }
};

// Парсинг ответа от AI
const parseAIResponse = (aiResponse: string): AIRecommendation[] => {
  try {
    // Попытка распарсить JSON, если AI вернул его
    try {
      const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1].trim());
        if (Array.isArray(jsonData)) {
          return jsonData.map(item => ({
            title: item.title || 'Рекомендация',
            description: item.description || 'Описание отсутствует',
            type: item.type || 'info',
            category: item.category || 'general',
            score: item.score || 5
          }));
        }
      }
    } catch (e) {
      console.warn('Не удалось распарсить JSON из ответа AI:', e);
    }
    
    // Если не удалось распарсить JSON, пытаемся парсить текст
    const recommendations: AIRecommendation[] = [];
    
    // Пытаемся найти рекомендации по структуре текста
    // Например, ищем строки вида "1. Название рекомендации"
    const lines = aiResponse.split('\n');
    let currentRecommendation: Partial<AIRecommendation> | null = null;
    
    for (const line of lines) {
      const titleMatch = line.match(/^\d+\.\s+(.+)/);
      if (titleMatch) {
        // Если нашли новую рекомендацию, сохраняем предыдущую
        if (currentRecommendation && currentRecommendation.title) {
          recommendations.push({
            title: currentRecommendation.title,
            description: currentRecommendation.description || 'Описание отсутствует',
            type: currentRecommendation.type || 'info',
            category: currentRecommendation.category || 'general',
            score: currentRecommendation.score || 5
          });
        }
        
        // Начинаем новую рекомендацию
        currentRecommendation = {
          title: titleMatch[1].trim()
        };
      } else if (currentRecommendation) {
        // Дополняем текущую рекомендацию
        if (line.toLowerCase().includes('тип:') || line.toLowerCase().includes('type:')) {
          const typeMatch = line.match(/(успех|предупреждение|информация|ошибка|success|warning|info|error)/i);
          if (typeMatch) {
            const typeMap: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
              'успех': 'success',
              'предупреждение': 'warning',
              'информация': 'info',
              'ошибка': 'error',
              'success': 'success',
              'warning': 'warning',
              'info': 'info',
              'error': 'error'
            };
            currentRecommendation.type = typeMap[typeMatch[1].toLowerCase()];
          }
        } else if (line.toLowerCase().includes('категория:') || line.toLowerCase().includes('category:')) {
          const categoryMatch = line.match(/(продажи|товары|расходы|склады|общее|sales|products|expenses|warehouses|general)/i);
          if (categoryMatch) {
            const categoryMap: Record<string, 'sales' | 'products' | 'expenses' | 'warehouses' | 'general'> = {
              'продажи': 'sales',
              'товары': 'products',
              'расходы': 'expenses',
              'склады': 'warehouses',
              'общее': 'general',
              'sales': 'sales',
              'products': 'products',
              'expenses': 'expenses',
              'warehouses': 'warehouses',
              'general': 'general'
            };
            currentRecommendation.category = categoryMap[categoryMatch[1].toLowerCase()];
          }
        } else if (line.toLowerCase().includes('важность:') || line.toLowerCase().includes('score:')) {
          const scoreMatch = line.match(/(\d+)/);
          if (scoreMatch) {
            currentRecommendation.score = Math.min(10, Math.max(1, parseInt(scoreMatch[1])));
          }
        } else if (line.trim() && !currentRecommendation.description) {
          currentRecommendation.description = line.trim();
        } else if (line.trim() && currentRecommendation.description) {
          currentRecommendation.description += '\n' + line.trim();
        }
      }
    }
    
    // Добавляем последнюю рекомендацию
    if (currentRecommendation && currentRecommendation.title) {
      recommendations.push({
        title: currentRecommendation.title,
        description: currentRecommendation.description || 'Описание отсутствует',
        type: currentRecommendation.type || 'info',
        category: currentRecommendation.category || 'general',
        score: currentRecommendation.score || 5
      });
    }
    
    // Если удалось найти хотя бы одну рекомендацию, возвращаем их
    if (recommendations.length > 0) {
      return recommendations;
    }
    
    // Если не удалось найти рекомендации, просто разбиваем текст на части и создаем из них рекомендации
    return [
      {
        title: 'Анализ данных',
        description: aiResponse,
        type: 'info',
        category: 'general',
        score: 5
      }
    ];
  } catch (error) {
    console.error('Ошибка при парсинге ответа AI:', error);
    return [
      {
        title: 'Ошибка при анализе',
        description: 'Не удалось обработать ответ от AI модели',
        type: 'error',
        category: 'general',
        score: 10
      }
    ];
  }
};

// Генерация моковых рекомендаций для тестирования
const generateMockRecommendations = (context?: AnalysisContext): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [
    {
      title: 'Оптимизация рекламных кампаний',
      description: 'На основе анализа ваших данных, рекомендуем увеличить рекламный бюджет для топовых товаров и уменьшить его для низкоэффективных позиций. Это может повысить ROAS на 15-20%.',
      type: 'success',
      category: 'sales',
      score: 9
    },
    {
      title: 'Контроль возвратов',
      description: 'В категории "Одежда" наблюдается повышенный уровень возвратов (15%). Рекомендуем улучшить описания товаров и добавить более детальные размерные сетки, чтобы снизить количество возвратов.',
      type: 'warning',
      category: 'products',
      score: 8
    },
    {
      title: 'Оптимизация складских запасов',
      description: 'У вас наблюдается избыток товаров на складах в Москве и недостаток в регионах. Рекомендуем перераспределить запасы для ускорения доставки и снижения логистических расходов.',
      type: 'info',
      category: 'warehouses',
      score: 7
    },
    {
      title: 'Сезонная подготовка',
      description: 'Приближается высокий сезон продаж. Рекомендуем заранее увеличить запасы популярных товаров и подготовить специальные акции для максимизации продаж.',
      type: 'info',
      category: 'general',
      score: 6
    }
  ];
  
  return recommendations;
};

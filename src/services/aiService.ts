
import { AIAnalysisRequest, AIRecommendation, AISettings, AIModel } from '@/types/ai';

const AI_SETTINGS_KEY = 'marketplace_ai_settings';
const AI_RECOMMENDATIONS_KEY = 'marketplace_ai_recommendations';

export const getAISettings = (): AISettings => {
  const settings = localStorage.getItem(AI_SETTINGS_KEY);
  if (settings) {
    return JSON.parse(settings);
  }
  return {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    isEnabled: false
  };
};

export const saveAISettings = (settings: AISettings): void => {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
};

export const getAvailableProviders = () => {
  return [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Платформа OpenAI с моделями GPT',
      requiresApiKey: true
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Платформа Google с моделями Gemini',
      requiresApiKey: true
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Платформа Anthropic с моделями Claude',
      requiresApiKey: true
    }
  ];
};

export const getAvailableModels = (providerId: string): AIModel[] => {
  switch (providerId) {
    case 'openai':
      return [
        {
          id: 'gpt-4o',
          name: 'GPT-4o',
          providerId: 'openai',
          description: 'Последняя и самая мощная мультимодальная модель GPT'
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          providerId: 'openai',
          description: 'Мощная и быстрая модель с расширенным контекстом'
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          providerId: 'openai',
          description: 'Более экономичная и быстрая модель для обычных задач'
        }
      ];
    case 'gemini':
      return [
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          providerId: 'gemini',
          description: 'Мощная универсальная модель для сложных задач и длинного контекста'
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          providerId: 'gemini',
          description: 'Более быстрая и экономичная версия Gemini для обычных задач'
        },
        {
          id: 'gemini-2.0-pro-exp-02-05',
          name: 'Gemini 2.0 Pro',
          providerId: 'gemini',
          description: 'Экспериментальная версия Gemini 2.0 Pro (02-05)'
        },
        {
          id: 'gemini-2.0-flash-thinking-exp-01-21',
          name: 'Gemini 2.0 Flash Thinking',
          providerId: 'gemini',
          description: 'Экспериментальная версия Gemini 2.0 Flash с улучшенным мышлением (01-21)'
        }
      ];
    case 'anthropic':
      return [
        {
          id: 'claude-3-opus',
          name: 'Claude 3 Opus',
          providerId: 'anthropic',
          description: 'Самая мощная модель Claude с расширенными возможностями рассуждения'
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet',
          providerId: 'anthropic',
          description: 'Сбалансированная модель Claude по цене и производительности'
        },
        {
          id: 'claude-3-haiku',
          name: 'Claude 3 Haiku',
          providerId: 'anthropic',
          description: 'Быстрая и экономичная модель Claude для простых задач'
        }
      ];
    default:
      return [];
  }
};

export const getSavedRecommendations = (storeId: string): AIRecommendation[] => {
  const key = `${AI_RECOMMENDATIONS_KEY}_${storeId}`;
  const recommendations = localStorage.getItem(key);
  if (recommendations) {
    return JSON.parse(recommendations);
  }
  return [];
};

export const saveRecommendations = (storeId: string, recommendations: AIRecommendation[]): void => {
  const key = `${AI_RECOMMENDATIONS_KEY}_${storeId}`;
  localStorage.setItem(key, JSON.stringify(recommendations));
};

const createOpenAIPrompt = (request: AIAnalysisRequest): string => {
  const { context, requestType } = request;
  
  let prompt = `Анализ данных магазина на маркетплейсе Wildberries за период с ${context.period.from} по ${context.period.to}.\n\n`;
  
  prompt += "Данные о продажах:\n";
  prompt += `Общий объем продаж: ${context.sales.total} руб.\n`;
  if (context.sales.previousPeriod) {
    const change = ((context.sales.total - context.sales.previousPeriod) / context.sales.previousPeriod * 100).toFixed(2);
    prompt += `Изменение с предыдущего периода: ${change}%\n`;
  }
  
  prompt += "\nДанные о расходах:\n";
  prompt += `Общие расходы: ${context.expenses.total} руб.\n`;
  prompt += `Логистика: ${context.expenses.logistics} руб.\n`;
  prompt += `Хранение: ${context.expenses.storage} руб.\n`;
  prompt += `Штрафы: ${context.expenses.penalties} руб.\n`;
  prompt += `Реклама: ${context.expenses.advertising} руб.\n`;
  prompt += `Приемка: ${context.expenses.acceptance} руб.\n`;
  
  if (context.products) {
    prompt += "\nТоп прибыльных товаров:\n";
    context.products.topProfitable.forEach(product => {
      prompt += `- ${product.name}: прибыль ${product.profit} руб.`;
      if (product.margin) prompt += `, маржа ${product.margin}%`;
      if (product.quantitySold) prompt += `, продано ${product.quantitySold} шт.`;
      prompt += "\n";
    });
    
    prompt += "\nТоп убыточных товаров:\n";
    context.products.topUnprofitable.forEach(product => {
      prompt += `- ${product.name}: прибыль ${product.profit} руб.`;
      if (product.margin) prompt += `, маржа ${product.margin}%`;
      if (product.quantitySold) prompt += `, продано ${product.quantitySold} шт.`;
      prompt += "\n";
    });
  }
  
  if (context.returns && context.returns.length > 0) {
    prompt += "\nДанные о возвратах:\n";
    context.returns.forEach(item => {
      prompt += `- ${item.name}: ${item.value} руб.`;
      if (item.count) prompt += `, количество: ${item.count}`;
      prompt += "\n";
    });
  }
  
  if (context.advertising && context.advertising.campaigns.length > 0) {
    prompt += "\nДанные о рекламных кампаниях:\n";
    context.advertising.campaigns.forEach(campaign => {
      prompt += `- ${campaign.name}: расходы ${campaign.cost} руб.`;
      if (campaign.views) prompt += `, показы: ${campaign.views}`;
      if (campaign.clicks) prompt += `, клики: ${campaign.clicks}`;
      if (campaign.orders) prompt += `, заказы: ${campaign.orders}`;
      prompt += "\n";
    });
    
    if (context.advertising.keywords && context.advertising.keywords.length > 0) {
      prompt += "\nДанные о ключевых словах:\n";
      context.advertising.keywords.forEach(keyword => {
        prompt += `- "${keyword.keyword}": показы ${keyword.views}, клики ${keyword.clicks}, CTR ${keyword.ctr.toFixed(2)}%, затраты ${keyword.sum} руб.`;
        if (keyword.efficiency) prompt += `, эффективность: ${keyword.efficiency.toFixed(2)} руб/клик`;
        prompt += "\n";
      });
    }
  }
  
  // Обработка подробных данных о рекламной кампании
  if (context.campaignDetails) {
    const details = context.campaignDetails;
    
    prompt += "\nПодробные данные о рекламной кампании:\n";
    prompt += `ID кампании: ${details.id}\n`;
    prompt += `Статус: ${details.status}\n`;
    prompt += `Тип: ${details.type}\n`;
    prompt += `CTR (кликабельность): ${details.ctr.toFixed(2)}%\n`;
    prompt += `CR (конверсия): ${details.cr.toFixed(2)}%\n`;
    
    if (details.dailyStats && details.dailyStats.length > 0) {
      prompt += "\nДинамика по дням:\n";
      details.dailyStats.forEach(day => {
        prompt += `- ${day.date}: показы ${day.views}, клики ${day.clicks}, CTR ${day.ctr.toFixed(2)}%, затраты ${day.sum} руб., заказы ${day.orders}\n`;
      });
    }
    
    if (details.productStats && details.productStats.length > 0) {
      prompt += "\nСтатистика по товарам:\n";
      details.productStats.forEach(product => {
        prompt += `- ${product.name} (ID: ${product.nmId}): показы ${product.views}, клики ${product.clicks}, CTR ${product.ctr.toFixed(2)}%, CR ${product.cr.toFixed(2)}%, затраты ${product.sum} руб., заказы ${product.orders}, эффективность ${product.efficiency.toFixed(2)} руб/заказ\n`;
      });
    }
  }
  
  switch (requestType) {
    case 'full_analysis':
      prompt += "\nПожалуйста, предоставь полный анализ бизнеса с рекомендациями по оптимизации продаж, расходов и товарного ассортимента. Выдели 3-5 ключевых рекомендаций.";
      break;
    case 'sales_analysis':
      prompt += "\nПожалуйста, проанализируй продажи и предложи рекомендации по их увеличению.";
      break;
    case 'expense_analysis':
      prompt += "\nПожалуйста, проанализируй расходы и предложи рекомендации по их оптимизации.";
      break;
    case 'product_recommendations':
      prompt += "\nПожалуйста, проанализируй ассортимент товаров и предложи рекомендации по его оптимизации.";
      break;
    case 'advertising_analysis':
      prompt += "\nПожалуйста, тщательно проанализируй данные рекламной кампании и предложи конкретные рекомендации по оптимизации рекламных инвестиций. Обрати особое внимание на:\n";
      prompt += "1. Анализ эффективности ключевых слов - какие ключевые слова приносят наибольшую конверсию и ROI, а какие расходуют бюджет впустую.\n";
      prompt += "2. Анализ эффективности товаров в рекламе - какие товары стоит продвигать активнее, а для каких следует скорректировать стратегию.\n";
      prompt += "3. Рекомендации по оптимизации ставок - для каких ключевых слов стоит увеличить/уменьшить ставки.\n";
      prompt += "4. Предложения по улучшению структуры кампании и возможные изменения в стратегии для максимизации ROI.\n";
      prompt += "5. Конкретные KPI и метрики, которые нужно отслеживать для оценки эффективности рекламы.\n";
      prompt += "\nВыдели 3-7 детальных, практичных рекомендаций, которые помогут максимально увеличить доход магазина от рекламных вложений.";
      break;
  }
  
  prompt += "\nПредоставь ответ в формате JSON-объекта со следующей структурой: { recommendations: [{ title: string, description: string, category: 'sales'|'expenses'|'products'|'advertising'|'general', importance: 'low'|'medium'|'high', actionable: boolean, action?: string }] }";
  
  return prompt;
};

// Функция для генерации рекомендаций при отсутствии ответа от API или ошибке
const generateFallbackRecommendations = (requestType: string): AIRecommendation[] => {
  const timestamp = Date.now();
  
  switch (requestType) {
    case 'advertising_analysis':
      return [
        {
          id: `fallback-${timestamp}-1`,
          title: "Оптимизация карточек товаров для повышения видимости",
          description: "Тщательно проработайте карточки товаров: заполните все характеристики, добавьте качественные фотографии и видео, напишите подробные и привлекательные описания с использованием релевантных ключевых слов. Это улучшит ранжирование в поиске Wildberries.",
          category: 'products',
          importance: 'high',
          timestamp: timestamp,
          actionable: true,
          action: "Провести аудит и оптимизацию всех карточек товаров"
        },
        {
          id: `fallback-${timestamp}-2`,
          title: "Настройка отслеживания конверсии",
          description: "Внедрите систематическое отслеживание основных показателей эффективности: CTR, CR, стоимость клика и стоимость заказа. Регулярно анализируйте эти метрики для своевременной корректировки рекламной стратегии.",
          category: 'advertising',
          importance: 'medium',
          timestamp: timestamp,
          actionable: true,
          action: "Настроить регулярный мониторинг ключевых метрик"
        },
        {
          id: `fallback-${timestamp}-3`,
          title: "Тестирование разных типов рекламных кампаний",
          description: "Попробуйте различные форматы рекламы на Wildberries (автоматические, поисковые, каталожные) для определения наиболее эффективного подхода для ваших товаров.",
          category: 'advertising',
          importance: 'medium',
          timestamp: timestamp,
          actionable: true,
          action: "Создать тестовые кампании разных типов с ограниченным бюджетом"
        }
      ];
    default:
      return [
        {
          id: `fallback-${timestamp}-1`,
          title: "Необходимо больше данных для анализа",
          description: "В текущий момент недостаточно данных для проведения качественного анализа. Рекомендуется продолжить сбор статистики для более точных рекомендаций.",
          category: 'general',
          importance: 'medium',
          timestamp: timestamp,
          actionable: false
        }
      ];
  }
};

// Улучшенный обработчик ответов от AI-моделей
const tryParseAIResponse = (responseText: string, requestType: string): AIRecommendation[] => {
  try {
    console.log('Оригинальный ответ AI:', responseText);
    
    // Пытаемся найти JSON в ответе
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('JSON не найден в ответе AI');
      return generateFallbackRecommendations(requestType);
    }
    
    let jsonStr = jsonMatch[0];
    
    // Проверяем, является ли строка валидным JSON
    try {
      JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Обнаружен невалидный JSON, пытаемся исправить...');
      
      // Если ответ обрезан, пытаемся закрыть JSON-структуру
      if (!jsonStr.includes('}]}')) {
        // Находим последнюю полную рекомендацию
        const lastCompleteRecommendation = jsonStr.lastIndexOf('"}');
        if (lastCompleteRecommendation !== -1) {
          // Закрываем JSON после последней полной рекомендации
          jsonStr = jsonStr.substring(0, lastCompleteRecommendation + 2) + ']}';
        } else {
          // Если не нашли полной рекомендации, просто завершаем массив и объект
          jsonStr = jsonStr + ']}';
        }
        
        try {
          // Проверяем исправленную версию
          JSON.parse(jsonStr);
          console.log('JSON успешно исправлен');
        } catch (e) {
          console.error('Не удалось исправить JSON:', e);
          return generateFallbackRecommendations(requestType);
        }
      }
    }
    
    const parsedResult = JSON.parse(jsonStr);
    if (parsedResult.recommendations && Array.isArray(parsedResult.recommendations)) {
      return parsedResult.recommendations.map((rec: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: rec.title || 'Рекомендация без заголовка',
        description: rec.description || 'Описание отсутствует',
        category: ['sales', 'expenses', 'products', 'advertising', 'general'].includes(rec.category) 
          ? rec.category 
          : 'general',
        importance: ['low', 'medium', 'high'].includes(rec.importance) 
          ? rec.importance 
          : 'medium',
        timestamp: Date.now(),
        actionable: Boolean(rec.actionable),
        action: rec.action
      }));
    } else {
      console.warn('Структура recommendations не найдена или не является массивом');
      return generateFallbackRecommendations(requestType);
    }
  } catch (error) {
    console.error('Ошибка при обработке ответа AI:', error);
    return generateFallbackRecommendations(requestType);
  }
};

export const analyzeData = async (
  request: AIAnalysisRequest, 
  storeId: string
): Promise<AIRecommendation[]> => {
  try {
    const settings = getAISettings();
    
    if (!settings.isEnabled || !settings.apiKey) {
      throw new Error('AI анализ не настроен или отключен');
    }
    
    let recommendations: AIRecommendation[] = [];
    
    switch (settings.provider) {
      case 'openai':
        const prompt = createOpenAIPrompt(request);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
          },
          body: JSON.stringify({
            model: settings.model,
            messages: [
              {
                role: 'system',
                content: 'Ты аналитик данных маркетплейса, который анализирует бизнес-показатели и дает рекомендации по оптимизации.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка OpenAI API: ${response.statusText}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        recommendations = tryParseAIResponse(aiResponse, request.requestType);
        break;
        
      case 'gemini':
        // Реализация для Google Gemini API
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + settings.model + ':generateContent?key=' + settings.apiKey;
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: createOpenAIPrompt(request)
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2000
            }
          })
        });
        
        if (!geminiResponse.ok) {
          throw new Error(`Ошибка Gemini API: ${geminiResponse.statusText}`);
        }
        
        const geminiData = await geminiResponse.json();
        let geminiResponseText = '';
        
        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
          const parts = geminiData.candidates[0].content.parts;
          if (parts && parts.length > 0) {
            geminiResponseText = parts[0].text;
          }
        }
        
        recommendations = tryParseAIResponse(geminiResponseText, request.requestType);
        break;
        
      case 'anthropic':
        // Реализация для Anthropic Claude API
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: settings.model,
            messages: [
              {
                role: 'user',
                content: createOpenAIPrompt(request)
              }
            ],
            max_tokens: 2000
          })
        });
        
        if (!claudeResponse.ok) {
          throw new Error(`Ошибка Claude API: ${claudeResponse.statusText}`);
        }
        
        const claudeData = await claudeResponse.json();
        const claudeResponseText = claudeData.content[0].text;
        
        recommendations = tryParseAIResponse(claudeResponseText, request.requestType);
        break;
        
      default:
        throw new Error('Неизвестный провайдер AI');
    }
    
    // Проверка получили ли мы хоть какие-то рекомендации
    if (!recommendations || recommendations.length === 0) {
      console.warn('Не получено рекомендаций от AI, используем запасные варианты');
      recommendations = generateFallbackRecommendations(request.requestType);
    }
    
    // Сохраняем рекомендации
    saveRecommendations(storeId, [
      ...recommendations,
      ...getSavedRecommendations(storeId).slice(0, 15) // Храним последние 15 рекомендаций
    ]);
    
    return recommendations;
  } catch (error) {
    console.error('Ошибка при анализе данных:', error);
    throw error;
  }
};

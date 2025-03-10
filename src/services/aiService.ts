
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

// Функция для создания промпта с учетом типа анализа
const createOpenAIPrompt = (request: AIAnalysisRequest): string => {
  const { context, requestType } = request;
  
  let prompt = `Анализ данных магазина на маркетплейсе Wildberries за период с ${context.period.from} по ${context.period.to}.\n\n`;
  
  // Данные о продажах
  if (context.sales) {
    prompt += "Данные о продажах:\n";
    prompt += `Общий объем продаж: ${context.sales.total} руб.\n`;
    if (context.sales.previousPeriod) {
      const change = ((context.sales.total - context.sales.previousPeriod) / context.sales.previousPeriod * 100).toFixed(2);
      prompt += `Изменение с предыдущего периода: ${change}%\n`;
    }
  }
  
  // Данные о расходах
  if (context.expenses) {
    prompt += "\nДанные о расходах:\n";
    prompt += `Общие расходы: ${context.expenses.total} руб.\n`;
    prompt += `Логистика: ${context.expenses.logistics} руб.\n`;
    prompt += `Хранение: ${context.expenses.storage} руб.\n`;
    prompt += `Штрафы: ${context.expenses.penalties} руб.\n`;
    prompt += `Реклама: ${context.expenses.advertising} руб.\n`;
    prompt += `Приемка: ${context.expenses.acceptance} руб.\n`;
  }
  
  // Данные о товарах
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
  
  // Данные о возвратах
  if (context.returns && context.returns.length > 0) {
    prompt += "\nДанные о возвратах:\n";
    context.returns.forEach(item => {
      prompt += `- ${item.name}: ${item.value} руб.`;
      if (item.count) prompt += `, количество: ${item.count}`;
      prompt += "\n";
    });
  }
  
  // Данные о рекламных кампаниях
  if (context.advertising && context.advertising.campaigns.length > 0) {
    prompt += "\nДанные о рекламных кампаниях:\n";
    context.advertising.campaigns.forEach(campaign => {
      prompt += `- ${campaign.name}: расходы ${campaign.cost} руб.`;
      if (campaign.views) prompt += `, показы: ${campaign.views}`;
      if (campaign.clicks) prompt += `, клики: ${campaign.clicks}`;
      if (campaign.orders) prompt += `, заказы: ${campaign.orders}`;
      prompt += "\n";
    });
  }
  
  // Указываем конкретный тип запроса
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
      prompt += "\nПожалуйста, проанализируй рекламные кампании и предложи рекомендации по оптимизации рекламы.";
      break;
    case 'warehouse_analysis':
      prompt += "\nПожалуйста, проанализируй данные по складам и предложи рекомендации по оптимизации логистики.";
      break;
    case 'supply_analysis':
      prompt += "\nПожалуйста, проанализируй данные по поставкам и предложи рекомендации по их оптимизации.";
      break;
  }
  
  prompt += "\nПредоставь ответ в формате JSON-объекта со следующей структурой: { recommendations: [{ title: string, description: string, category: 'sales'|'expenses'|'products'|'advertising'|'general', importance: 'low'|'medium'|'high', actionable: boolean, action?: string }] }";
  
  return prompt;
};

// Функция для попытки разбора ответа AI и восстановления неполного JSON
const tryParseAIResponse = (response: string): AIRecommendation[] | null => {
  try {
    // Сначала пробуем найти и разобрать полный JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      if (parsedResult.recommendations) {
        return parsedResult.recommendations.map((rec: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          title: rec.title,
          description: rec.description,
          category: rec.category || 'general',
          importance: rec.importance || 'medium',
          timestamp: Date.now(),
          actionable: rec.actionable || false,
          action: rec.action
        }));
      }
    }
    
    // Если не удалось найти полный JSON, пробуем восстановить обрезанный JSON
    const partialJsonMatch = response.match(/\{[\s\S]*?recommendations[\s\S]*?(\[[\s\S]*)/);
    if (partialJsonMatch) {
      const partialArray = partialJsonMatch[1];
      
      // Попытка восстановить неполный массив
      try {
        // Ищем последний полный объект в массиве
        const objectRegex = /\{[^{}]*\}/g;
        const objects = [];
        let match;
        
        while ((match = objectRegex.exec(partialArray)) !== null) {
          objects.push(match[0]);
        }
        
        if (objects.length > 0) {
          // Пытаемся разобрать каждый найденный объект
          const recommendations = [];
          
          for (let i = 0; i < objects.length; i++) {
            try {
              const obj = JSON.parse(objects[i]);
              recommendations.push({
                id: `${Date.now()}-${i}`,
                title: obj.title || 'Рекомендация',
                description: obj.description || 'Описание отсутствует',
                category: obj.category || 'general',
                importance: obj.importance || 'medium',
                timestamp: Date.now(),
                actionable: obj.actionable || false,
                action: obj.action
              });
            } catch (e) {
              console.error('Невозможно разобрать объект:', objects[i]);
            }
          }
          
          if (recommendations.length > 0) {
            return recommendations;
          }
        }
      } catch (e) {
        console.error('Ошибка при разборе частичного массива:', e);
      }
    }
    
    return null;
  } catch (e) {
    console.error('Ошибка при разборе ответа AI:', e);
    return null;
  }
};

// Функция для создания запасных рекомендаций на случай ошибки
const generateFallbackRecommendations = (requestType: string): AIRecommendation[] => {
  const timestamp = Date.now();
  const recommendations: AIRecommendation[] = [];
  
  // Базовая рекомендация для всех типов
  recommendations.push({
    id: `fallback-${timestamp}-0`,
    title: 'Недостаточно данных для полного анализа',
    description: 'Для получения более точных рекомендаций необходимо накопить больше данных о работе магазина или предоставить более детальную информацию.',
    category: 'general',
    importance: 'medium',
    timestamp: timestamp,
    actionable: false
  });
  
  // Добавляем специфичные рекомендации в зависимости от типа запроса
  switch (requestType) {
    case 'advertising_analysis':
      recommendations.push({
        id: `fallback-${timestamp}-1`,
        title: 'Оптимизируйте ключевые слова',
        description: 'Регулярно анализируйте эффективность ключевых слов и отключайте те, которые не приносят конверсий.',
        category: 'advertising',
        importance: 'high',
        timestamp: timestamp,
        actionable: true,
        action: 'Проверьте отчеты по ключевым словам и отключите слова с высоким расходом и низкой конверсией.'
      });
      break;
      
    case 'sales_analysis':
      recommendations.push({
        id: `fallback-${timestamp}-1`,
        title: 'Улучшите карточки товаров',
        description: 'Качественные фотографии и описания способствуют увеличению конверсии в покупку.',
        category: 'sales',
        importance: 'high',
        timestamp: timestamp,
        actionable: true,
        action: 'Обновите фотографии и описания товаров с низкой конверсией.'
      });
      break;
      
    case 'warehouse_analysis':
      recommendations.push({
        id: `fallback-${timestamp}-1`,
        title: 'Используйте разные склады',
        description: 'Распределение товаров по разным складам поможет сократить время доставки и расширить географию продаж.',
        category: 'general',
        importance: 'medium',
        timestamp: timestamp,
        actionable: true,
        action: 'Рассмотрите возможность отправки товаров на склады в других регионах.'
      });
      break;
      
    default:
      recommendations.push({
        id: `fallback-${timestamp}-1`,
        title: 'Расширяйте ассортимент',
        description: 'Анализируйте спрос и добавляйте новые товары в ассортимент для увеличения продаж.',
        category: 'products',
        importance: 'medium',
        timestamp: timestamp,
        actionable: true,
        action: 'Проведите анализ рынка и выявите перспективные товарные категории.'
      });
  }
  
  return recommendations;
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
        
        // Используем новую функцию для разбора ответа
        const parsedRecommendations = tryParseAIResponse(aiResponse);
        
        if (parsedRecommendations && parsedRecommendations.length > 0) {
          recommendations = parsedRecommendations;
        } else {
          // Если не удалось разобрать ответ, используем запасные рекомендации
          recommendations = generateFallbackRecommendations(request.requestType);
        }
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
        
        // Используем новую функцию для разбора ответа
        const parsedGeminiRecommendations = tryParseAIResponse(geminiResponseText);
        
        if (parsedGeminiRecommendations && parsedGeminiRecommendations.length > 0) {
          recommendations = parsedGeminiRecommendations;
        } else {
          console.error('Не удалось разобрать ответ от Gemini:', geminiResponseText);
          // Если не удалось разобрать ответ, используем запасные рекомендации
          recommendations = generateFallbackRecommendations(request.requestType);
        }
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
        
        // Используем новую функцию для разбора ответа
        const parsedClaudeRecommendations = tryParseAIResponse(claudeResponseText);
        
        if (parsedClaudeRecommendations && parsedClaudeRecommendations.length > 0) {
          recommendations = parsedClaudeRecommendations;
        } else {
          // Если не удалось разобрать ответ, используем запасные рекомендации
          recommendations = generateFallbackRecommendations(request.requestType);
        }
        break;
        
      default:
        throw new Error('Неизвестный провайдер AI');
    }
    
    // Сохраняем рекомендации
    saveRecommendations(storeId, [
      ...recommendations,
      ...getSavedRecommendations(storeId).slice(0, 15) // Храним последние 15 рекомендаций
    ]);
    
    return recommendations;
  } catch (error) {
    console.error('Ошибка при анализе данных:', error);
    
    // В случае ошибки возвращаем запасные рекомендации
    const fallbackRecommendations = generateFallbackRecommendations(request.requestType);
    
    // Не сохраняем запасные рекомендации в локальное хранилище
    
    return fallbackRecommendations;
  }
};

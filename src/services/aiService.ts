
import { AIAnalysisRequest, AIRecommendation, AISettings } from '@/types/ai';

const AI_SETTINGS_KEY = 'marketplace_ai_settings';
const AI_RECOMMENDATIONS_KEY = 'marketplace_ai_recommendations';

export const getAISettings = (): AISettings => {
  const settings = localStorage.getItem(AI_SETTINGS_KEY);
  if (settings) {
    return JSON.parse(settings);
  }
  return {
    provider: 'openai',
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
      name: 'OpenAI GPT-4',
      description: 'Использует модель GPT-4 для анализа данных',
      requiresApiKey: true
    },
    {
      id: 'gemini',
      name: 'Google Gemini Pro',
      description: 'Использует модель Gemini Pro для анализа данных',
      requiresApiKey: true
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Использует модель Claude для анализа данных',
      requiresApiKey: true
    }
  ];
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
  }
  
  prompt += "\nПредоставь ответ в формате JSON-объекта со следующей структурой: { recommendations: [{ title: string, description: string, category: 'sales'|'expenses'|'products'|'advertising'|'general', importance: 'low'|'medium'|'high', actionable: boolean, action?: string }] }";
  
  return prompt;
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
            model: 'gpt-4o',
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
        
        try {
          // Извлекаем JSON-объект из ответа
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0]);
            if (parsedResult.recommendations) {
              recommendations = parsedResult.recommendations.map((rec: any, index: number) => ({
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
        } catch (parseError) {
          console.error('Ошибка при разборе ответа AI:', parseError);
          throw new Error('Не удалось разобрать ответ от AI');
        }
        break;
        
      case 'gemini':
        // Для Google Gemini API - аналогичная реализация
        throw new Error('Поддержка Gemini будет добавлена позже');
        
      case 'anthropic':
        // Для Anthropic Claude API - аналогичная реализация
        throw new Error('Поддержка Claude будет добавлена позже');
        
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
    throw error;
  }
};

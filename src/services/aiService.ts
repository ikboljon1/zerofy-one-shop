
import axios from 'axios';
import { AIUserConfig, AIAnalysisRequest, AIAnalysisResponse, AIModelProvider, AI_CONFIG_STORAGE_KEY, AI_ANALYSIS_STORAGE_KEY } from '@/types/ai';

/**
 * Получает настройки ИИ из localStorage
 */
export const getAIConfig = (): AIUserConfig | null => {
  try {
    const configStr = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
    if (!configStr) return null;
    return JSON.parse(configStr);
  } catch (error) {
    console.error('Ошибка при получении настроек ИИ:', error);
    return null;
  }
};

/**
 * Сохраняет настройки ИИ в localStorage
 */
export const saveAIConfig = (config: AIUserConfig): void => {
  try {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Ошибка при сохранении настроек ИИ:', error);
  }
};

/**
 * Создает промпт для ИИ на основе данных магазина
 */
export const createAIPrompt = (request: AIAnalysisRequest): string => {
  const { marketplaceData, timeframe, analysisType, customPrompt } = request;
  
  let systemPrompt = `Ты - опытный аналитик маркетплейсов, специализирующийся на анализе данных продавцов на площадках вроде Wildberries, Ozon, Яндекс.Маркет. 
  
Твоя задача - проанализировать данные магазина за период с ${timeframe.dateFrom} по ${timeframe.dateTo} и предоставить ценные выводы, инсайты и рекомендации.

Анализируй следующие данные:
- Общие продажи: ${marketplaceData.currentPeriod?.sales || 'Нет данных'}
- К перечислению: ${marketplaceData.currentPeriod?.transferred || 'Нет данных'}
- Затраты на логистику: ${marketplaceData.currentPeriod?.expenses?.logistics || 'Нет данных'}
- Затраты на хранение: ${marketplaceData.currentPeriod?.expenses?.storage || 'Нет данных'}
- Штрафы: ${marketplaceData.currentPeriod?.expenses?.penalties || 'Нет данных'}
- Затраты на рекламу: ${marketplaceData.currentPeriod?.expenses?.advertising || 'Нет данных'}
- Чистая прибыль: ${marketplaceData.currentPeriod?.netProfit || 'Нет данных'}`;

  if (marketplaceData.productSales && marketplaceData.productSales.length > 0) {
    systemPrompt += '\n\nПродажи по категориям товаров:\n';
    marketplaceData.productSales.forEach((item: any) => {
      systemPrompt += `- ${item.subject_name}: ${item.quantity} шт.\n`;
    });
  }

  if (marketplaceData.productReturns && marketplaceData.productReturns.length > 0) {
    systemPrompt += '\n\nТоп возвратов:\n';
    marketplaceData.productReturns.forEach((item: any) => {
      systemPrompt += `- ${item.name}: ${item.value} руб. (${item.count || 0} шт.)\n`;
    });
  }

  if (marketplaceData.penaltiesData && marketplaceData.penaltiesData.length > 0) {
    systemPrompt += '\n\nШтрафы по причинам:\n';
    marketplaceData.penaltiesData.forEach((item: any) => {
      systemPrompt += `- ${item.name}: ${item.value} руб.\n`;
    });
  }

  if (marketplaceData.topProfitableProducts && marketplaceData.topProfitableProducts.length > 0) {
    systemPrompt += '\n\nСамые прибыльные товары:\n';
    marketplaceData.topProfitableProducts.forEach((item: any) => {
      systemPrompt += `- ${item.name}: прибыль ${item.profit} руб., маржа ${item.margin}%\n`;
    });
  }

  if (marketplaceData.topUnprofitableProducts && marketplaceData.topUnprofitableProducts.length > 0) {
    systemPrompt += '\n\nСамые убыточные товары:\n';
    marketplaceData.topUnprofitableProducts.forEach((item: any) => {
      systemPrompt += `- ${item.name}: прибыль ${item.profit} руб., маржа ${item.margin}%\n`;
    });
  }

  let userPrompt = '';
  
  switch (analysisType) {
    case 'general':
      userPrompt = `Проведи общий анализ показателей магазина. Выдели основные тренды, проблемы и возможности. Дай рекомендации по улучшению общих показателей.`;
      break;
    case 'products':
      userPrompt = `Проанализируй ассортимент товаров. Определи наиболее и наименее эффективные товары/категории. Дай рекомендации по оптимизации ассортимента.`;
      break;
    case 'advertising':
      userPrompt = `Проанализируй рекламные расходы и их эффективность. Дай рекомендации по оптимизации маркетинговых затрат.`;
      break;
    case 'returns':
      userPrompt = `Проанализируй возвраты товаров. Определи причины и дай рекомендации по снижению количества возвратов.`;
      break;
    case 'penalties':
      userPrompt = `Проанализируй штрафы. Определи основные причины и дай рекомендации по минимизации штрафных санкций.`;
      break;
    case 'custom':
      userPrompt = customPrompt || 'Проведи общий анализ данных магазина и дай свои рекомендации.';
      break;
  }

  userPrompt += `\n\nСтруктурируй ответ следующим образом:
  
1. Краткое резюме (2-3 предложения о общем состоянии)
2. Ключевые инсайты (3-5 пунктов с конкретными наблюдениями)
3. Рекомендации (3-5 конкретных действий)
  
Для каждой рекомендации укажи:
- Ожидаемое влияние (высокое/среднее/низкое)
- Сложность внедрения (легко/средне/сложно)
- Временные рамки (немедленно/краткосрочно/долгосрочно)`;

  return systemPrompt + '\n\n' + userPrompt;
};

/**
 * Вызывает API OpenAI для анализа данных
 */
export const analyzeWithOpenAI = async (
  apiKey: string, 
  modelId: string, 
  prompt: string
): Promise<any> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'system', content: 'Ты - опытный аналитик данных, специализирующийся на анализе показателей маркетплейсов.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при обращении к OpenAI:', error);
    throw error;
  }
};

/**
 * Вызывает API Google для анализа данных
 */
export const analyzeWithGoogle = async (
  apiKey: string, 
  modelId: string, 
  prompt: string
): Promise<any> => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000
        }
      },
      {
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Ошибка при обращении к Google AI:', error);
    throw error;
  }
};

/**
 * Вызывает API Anthropic для анализа данных
 */
export const analyzeWithAnthropic = async (
  apiKey: string, 
  modelId: string, 
  prompt: string
): Promise<any> => {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: modelId,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Ошибка при обращении к Anthropic:', error);
    throw error;
  }
};

/**
 * Вызывает API Mistral для анализа данных
 */
export const analyzeWithMistral = async (
  apiKey: string, 
  modelId: string, 
  prompt: string
): Promise<any> => {
  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при обращении к Mistral AI:', error);
    throw error;
  }
};

/**
 * Вызывает API Perplexity для анализа данных
 */
export const analyzeWithPerplexity = async (
  apiKey: string, 
  modelId: string, 
  prompt: string
): Promise<any> => {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: modelId,
        messages: [
          { role: 'system', content: 'Be precise and concise.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при обращении к Perplexity AI:', error);
    throw error;
  }
};

/**
 * Анализирует данные с помощью выбранного ИИ провайдера
 */
export const analyzeData = async (
  request: AIAnalysisRequest,
  config: AIUserConfig
): Promise<AIAnalysisResponse> => {
  try {
    const prompt = createAIPrompt(request);
    let analysisText = '';
    const startTime = Date.now();
    
    switch (config.provider) {
      case 'OpenAI':
        analysisText = await analyzeWithOpenAI(config.apiKey, config.selectedModelId, prompt);
        break;
      case 'Google':
        analysisText = await analyzeWithGoogle(config.apiKey, config.selectedModelId, prompt);
        break;
      case 'Anthropic':
        analysisText = await analyzeWithAnthropic(config.apiKey, config.selectedModelId, prompt);
        break;
      case 'Mistral':
        analysisText = await analyzeWithMistral(config.apiKey, config.selectedModelId, prompt);
        break;
      case 'Perplexity':
        analysisText = await analyzeWithPerplexity(config.apiKey, config.selectedModelId, prompt);
        break;
      default:
        throw new Error('Неподдерживаемый провайдер ИИ');
    }
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Парсинг ответа и формирование структурированного результата
    // В реальном приложении здесь потребуется более сложная логика парсинга
    const response: AIAnalysisResponse = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      analysis: {
        summary: extractSummary(analysisText),
        insights: extractInsights(analysisText),
        recommendations: extractRecommendations(analysisText)
      },
      metadata: {
        model: config.selectedModelId,
        provider: config.provider,
        tokensUsed: Math.floor(analysisText.length / 4), // Грубая оценка
        processingTime
      }
    };
    
    // Сохраняем результат анализа в localStorage
    saveAnalysisResult(response);
    
    return response;
  } catch (error) {
    console.error('Ошибка при анализе данных:', error);
    throw error;
  }
};

/**
 * Извлекает краткое резюме из ответа ИИ
 */
function extractSummary(text: string): string {
  // Простая логика извлечения резюме
  // В реальном приложении нужна будет более сложная логика
  const summaryMatch = text.match(/(?:краткое резюме|резюме|summary)(?:\s*:\s*|\n)(.*?)(?:\n\n|\n\d)/is);
  return summaryMatch ? summaryMatch[1].trim() : text.split('\n\n')[0].trim();
}

/**
 * Извлекает инсайты из ответа ИИ
 */
function extractInsights(text: string): Array<{
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  actionable: boolean;
  action?: string;
}> {
  // Упрощенная логика извлечения инсайтов
  const insights: Array<{
    title: string;
    description: string;
    importance: "high" | "medium" | "low";
    actionable: boolean;
    action?: string;
  }> = [];
  
  // Ищем секцию с инсайтами
  const insightsSection = text.match(/(?:ключевые инсайты|инсайты|insights)(?:\s*:\s*|\n)(.*?)(?:\n\n\d|\n\n[А-Я])/is);
  
  if (insightsSection) {
    const insightsText = insightsSection[1];
    const insightsItems = insightsText.split(/\n\s*[-•]\s*/).filter(item => item.trim().length > 0);
    
    insightsItems.forEach(item => {
      // Определяем важность на основе содержания
      let importance: "high" | "medium" | "low" = "medium";
      if (item.toLowerCase().includes('важн') || item.toLowerCase().includes('критич') || item.toLowerCase().includes('срочн')) {
        importance = "high";
      } else if (item.toLowerCase().includes('незначительн') || item.toLowerCase().includes('минор')) {
        importance = "low";
      }
      
      // Определяем, является ли инсайт действенным
      const actionable = item.toLowerCase().includes('можно') || 
                         item.toLowerCase().includes('следует') || 
                         item.toLowerCase().includes('необходимо') ||
                         item.toLowerCase().includes('рекомендуется');
      
      // Попытка извлечь название и описание
      const parts = item.split(/(?::|\.|\?)\s+/);
      const title = parts[0].trim();
      const description = parts.length > 1 ? parts.slice(1).join('. ').trim() : '';
      
      insights.push({
        title,
        description: description || title,
        importance,
        actionable,
        action: actionable ? `Рассмотреть: ${title}` : undefined
      });
    });
  }
  
  // Если не удалось извлечь инсайты, создаем заглушку
  if (insights.length === 0) {
    insights.push({
      title: "Общий анализ",
      description: "На основе предоставленных данных проведен общий анализ показателей.",
      importance: "medium",
      actionable: false
    });
  }
  
  return insights;
}

/**
 * Извлекает рекомендации из ответа ИИ
 */
function extractRecommendations(text: string): Array<{
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  difficulty: "easy" | "medium" | "hard";
  timeframe: "immediate" | "short-term" | "long-term";
}> {
  // Упрощенная логика извлечения рекомендаций
  const recommendations: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    difficulty: "easy" | "medium" | "hard";
    timeframe: "immediate" | "short-term" | "long-term";
  }> = [];
  
  // Ищем секцию с рекомендациями
  const recommendationsSection = text.match(/(?:рекомендации|recommendations)(?:\s*:\s*|\n)(.*)/is);
  
  if (recommendationsSection) {
    const recommendationsText = recommendationsSection[1];
    const recommendationItems = recommendationsText.split(/\n\s*[-•]\s*/).filter(item => item.trim().length > 0);
    
    recommendationItems.forEach(item => {
      // Определяем влияние
      let impact: "high" | "medium" | "low" = "medium";
      if (item.toLowerCase().includes('высок') || item.toLowerCase().includes('значительн')) {
        impact = "high";
      } else if (item.toLowerCase().includes('низк') || item.toLowerCase().includes('незначительн')) {
        impact = "low";
      }
      
      // Определяем сложность
      let difficulty: "easy" | "medium" | "hard" = "medium";
      if (item.toLowerCase().includes('легк') || item.toLowerCase().includes('прост')) {
        difficulty = "easy";
      } else if (item.toLowerCase().includes('сложн') || item.toLowerCase().includes('трудн')) {
        difficulty = "hard";
      }
      
      // Определяем временные рамки
      let timeframe: "immediate" | "short-term" | "long-term" = "short-term";
      if (item.toLowerCase().includes('немедленн') || item.toLowerCase().includes('сразу') || item.toLowerCase().includes('срочн')) {
        timeframe = "immediate";
      } else if (item.toLowerCase().includes('долгосрочн') || item.toLowerCase().includes('стратегическ')) {
        timeframe = "long-term";
      }
      
      // Попытка извлечь название и описание
      const parts = item.split(/(?::|\.|\?)\s+/);
      const title = parts[0].trim();
      const description = parts.length > 1 ? parts.slice(1).join('. ').trim() : '';
      
      recommendations.push({
        title,
        description: description || title,
        impact,
        difficulty,
        timeframe
      });
    });
  }
  
  // Если не удалось извлечь рекомендации, создаем заглушку
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Оптимизация ассортимента",
      description: "Рассмотрите возможность оптимизации ассортимента на основе анализа прибыльности.",
      impact: "medium",
      difficulty: "medium",
      timeframe: "short-term"
    });
  }
  
  return recommendations;
}

/**
 * Сохраняет результат анализа в localStorage
 */
export const saveAnalysisResult = (result: AIAnalysisResponse): void => {
  try {
    // Получаем существующие результаты анализа
    const resultsStr = localStorage.getItem(AI_ANALYSIS_STORAGE_KEY);
    const results: AIAnalysisResponse[] = resultsStr ? JSON.parse(resultsStr) : [];
    
    // Добавляем новый результат
    results.unshift(result);
    
    // Ограничиваем количество сохраняемых результатов
    const maxResults = 10;
    if (results.length > maxResults) {
      results.splice(maxResults);
    }
    
    // Сохраняем обновленный список
    localStorage.setItem(AI_ANALYSIS_STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Ошибка при сохранении результата анализа:', error);
  }
};

/**
 * Получает сохраненные результаты анализа из localStorage
 */
export const getAnalysisResults = (): AIAnalysisResponse[] => {
  try {
    const resultsStr = localStorage.getItem(AI_ANALYSIS_STORAGE_KEY);
    return resultsStr ? JSON.parse(resultsStr) : [];
  } catch (error) {
    console.error('Ошибка при получении результатов анализа:', error);
    return [];
  }
};

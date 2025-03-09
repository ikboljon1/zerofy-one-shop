
import axios from "axios";

export interface AIAnalysisRequest {
  userId: number;
  storeId: string;
  dataType: "sales" | "orders" | "products" | "marketing";
  data: any;
  apiKey: string;
  modelType: string;
}

export async function getAISettings(userId: number) {
  try {
    const response = await axios.get(`/api/user-ai-settings/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении настроек ИИ:", error);
    throw error;
  }
}

export async function saveAISettings(userId: number, apiKey: string, modelType: string) {
  try {
    const response = await axios.post('/api/user-ai-settings', {
      userId,
      apiKey,
      modelType,
      isActive: true
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при сохранении настроек ИИ:", error);
    throw error;
  }
}

export async function analyzeStoreData(request: AIAnalysisRequest) {
  try {
    // Здесь выполняем запрос к API ИИ модели в зависимости от типа модели
    let aiResponse;
    
    // В зависимости от типа модели используем соответствующий API
    switch (request.modelType) {
      case "gpt-4":
      case "gpt-4o":
      case "gpt-3.5-turbo":
        aiResponse = await analyzeWithOpenAI(request);
        break;
      case "gemini-pro":
      case "gemini-ultra":
        aiResponse = await analyzeWithGemini(request);
        break;
      case "claude-3-opus":
      case "claude-3-sonnet":
        aiResponse = await analyzeWithClaude(request);
        break;
      default:
        aiResponse = await analyzeWithOpenAI(request);
    }
    
    // Сохраняем результат анализа в базу данных
    await saveAnalysisResult(request.userId, request.storeId, request.dataType, aiResponse);
    
    return aiResponse;
  } catch (error) {
    console.error("Ошибка при анализе данных:", error);
    throw error;
  }
}

async function analyzeWithOpenAI(request: AIAnalysisRequest) {
  try {
    // Формируем промпт в зависимости от типа данных
    let prompt = "";
    switch (request.dataType) {
      case "sales":
        prompt = `Проанализируй данные продаж магазина и дай рекомендации по увеличению продаж. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "orders":
        prompt = `Проанализируй данные заказов магазина и дай рекомендации по оптимизации обработки заказов. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "products":
        prompt = `Проанализируй данные товаров магазина и дай рекомендации по оптимизации ассортимента. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "marketing":
        prompt = `Проанализируй маркетинговые данные магазина и дай рекомендации по улучшению маркетинговой стратегии. Данные: ${JSON.stringify(request.data)}`;
        break;
    }

    // Вызов API OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: request.modelType === "gpt-3.5-turbo" ? "gpt-3.5-turbo" : "gpt-4",
        messages: [
          { role: "system", content: "Ты - ассистент-аналитик для интернет-магазина. Ты анализируешь данные и даешь конкретные рекомендации для улучшения бизнес-показателей." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Ошибка при анализе данных с OpenAI:", error);
    throw error;
  }
}

async function analyzeWithGemini(request: AIAnalysisRequest) {
  try {
    // Формируем промпт в зависимости от типа данных
    let prompt = "";
    switch (request.dataType) {
      case "sales":
        prompt = `Проанализируй данные продаж магазина и дай рекомендации по увеличению продаж. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "orders":
        prompt = `Проанализируй данные заказов магазина и дай рекомендации по оптимизации обработки заказов. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "products":
        prompt = `Проанализируй данные товаров магазина и дай рекомендации по оптимизации ассортимента. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "marketing":
        prompt = `Проанализируй маркетинговые данные магазина и дай рекомендации по улучшению маркетинговой стратегии. Данные: ${JSON.stringify(request.data)}`;
        break;
    }

    // Вызов API Gemini (пример, может потребоваться адаптация)
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      },
      {
        headers: {
          'x-goog-api-key': request.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Ошибка при анализе данных с Gemini:", error);
    throw error;
  }
}

async function analyzeWithClaude(request: AIAnalysisRequest) {
  try {
    // Формируем промпт в зависимости от типа данных
    let prompt = "";
    switch (request.dataType) {
      case "sales":
        prompt = `Проанализируй данные продаж магазина и дай рекомендации по увеличению продаж. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "orders":
        prompt = `Проанализируй данные заказов магазина и дай рекомендации по оптимизации обработки заказов. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "products":
        prompt = `Проанализируй данные товаров магазина и дай рекомендации по оптимизации ассортимента. Данные: ${JSON.stringify(request.data)}`;
        break;
      case "marketing":
        prompt = `Проанализируй маркетинговые данные магазина и дай рекомендации по улучшению маркетинговой стратегии. Данные: ${JSON.stringify(request.data)}`;
        break;
    }

    // Вызов API Claude
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: request.modelType,
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 2000
      },
      {
        headers: {
          'x-api-key': request.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error("Ошибка при анализе данных с Claude:", error);
    throw error;
  }
}

async function saveAnalysisResult(userId: number, storeId: string, analysisType: string, analysisResult: string) {
  try {
    const response = await axios.post('/api/ai-analysis-results', {
      userId,
      storeId,
      analysisType,
      analysisResult
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при сохранении результата анализа:", error);
    throw error;
  }
}

export async function getAnalysisResults(userId: number, storeId: string) {
  try {
    const response = await axios.get(`/api/ai-analysis-results/${userId}/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении результатов анализа:", error);
    throw error;
  }
}

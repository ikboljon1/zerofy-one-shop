
// Типы поддерживаемых ИИ моделей
export type AIModelProvider = "OpenAI" | "Google" | "Anthropic" | "Mistral" | "Perplexity";

export interface AIModelConfig {
  id: string;
  provider: AIModelProvider;
  name: string;
  description: string;
  maxTokens: number;
  isAvailable: boolean;
}

export interface AIUserConfig {
  id: string;
  provider: AIModelProvider;
  apiKey: string;
  selectedModelId: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface AIAnalysisRequest {
  marketplaceData: any; // Данные магазина
  timeframe: {
    dateFrom: string;
    dateTo: string;
  };
  analysisType: "general" | "products" | "advertising" | "returns" | "penalties" | "custom";
  customPrompt?: string;
}

export interface AIAnalysisResponse {
  id: string;
  timestamp: string;
  analysis: {
    summary: string;
    insights: Array<{
      title: string;
      description: string;
      importance: "high" | "medium" | "low";
      actionable: boolean;
      action?: string;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      impact: "high" | "medium" | "low";
      difficulty: "easy" | "medium" | "hard";
      timeframe: "immediate" | "short-term" | "long-term";
    }>;
    kpis?: {
      [key: string]: {
        current: number;
        previous: number;
        change: number;
        trend: "up" | "down" | "stable";
      };
    };
  };
  metadata: {
    model: string;
    provider: AIModelProvider;
    tokensUsed: number;
    processingTime: number;
  };
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: "gpt-4o",
    provider: "OpenAI",
    name: "GPT-4o",
    description: "Самая продвинутая модель от OpenAI с высокой аналитической способностью",
    maxTokens: 128000,
    isAvailable: true
  },
  {
    id: "gpt-3.5-turbo",
    provider: "OpenAI",
    name: "GPT-3.5 Turbo",
    description: "Быстрая и экономичная модель для базовой аналитики",
    maxTokens: 16000,
    isAvailable: true
  },
  {
    id: "gemini-pro",
    provider: "Google",
    name: "Gemini Pro",
    description: "Мощная модель от Google с широким контекстным окном",
    maxTokens: 32000,
    isAvailable: true
  },
  {
    id: "claude-3-opus",
    provider: "Anthropic",
    name: "Claude 3 Opus",
    description: "Продвинутая модель с высокой точностью анализа",
    maxTokens: 200000,
    isAvailable: true
  },
  {
    id: "claude-3-sonnet",
    provider: "Anthropic",
    name: "Claude 3 Sonnet",
    description: "Сбалансированная модель от Anthropic",
    maxTokens: 180000,
    isAvailable: true
  },
  {
    id: "mistral-large",
    provider: "Mistral",
    name: "Mistral Large",
    description: "Мощная модель с хорошими аналитическими способностями",
    maxTokens: 32000,
    isAvailable: true
  },
  {
    id: "sonar-small-online",
    provider: "Perplexity",
    name: "Sonar Small Online",
    description: "Модель с доступом к интернету для актуальной информации",
    maxTokens: 4000,
    isAvailable: true
  }
];

export const AI_CONFIG_STORAGE_KEY = 'marketplace_ai_config';
export const AI_ANALYSIS_STORAGE_KEY = 'marketplace_ai_analysis';

// AI Provider configuration
// Add new providers here to make them available in the app

export type ProviderID = 'kimi' | 'openai';

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
}

export interface AIProvider {
  id: ProviderID;
  name: string;
  apiUrl: string;
  envKey: string;
  models: AIModel[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    envKey: 'KIMI_API_KEY',
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2', maxTokens: 8000 },
      { id: 'moonshot-v1-8k',       name: 'Moonshot v1 8K', maxTokens: 4000 },
      { id: 'moonshot-v1-32k',      name: 'Moonshot v1 32K', maxTokens: 8000 },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    envKey: 'OPENAI_API_KEY',
    models: [
      { id: 'gpt-4o',       name: 'GPT-4o',        maxTokens: 8000 },
      { id: 'gpt-4o-mini',  name: 'GPT-4o Mini',   maxTokens: 4000 },
      { id: 'gpt-4-turbo',  name: 'GPT-4 Turbo',   maxTokens: 8000 },
    ],
  },
];

export function getProvider(id: ProviderID): AIProvider | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}

export function getDefaultModel(provider: AIProvider): AIModel {
  return provider.models[0];
}

/** Returns the API key from env for the given provider */
export function getApiKey(provider: AIProvider): string | undefined {
  return process.env[provider.envKey];
}

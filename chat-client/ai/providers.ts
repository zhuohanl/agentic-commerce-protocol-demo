import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";

import { 
  customProvider, 
  wrapLanguageModel, 
  extractReasoningMiddleware 
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Reads a config value from environment variables (server) or localStorage (browser).
const getConfig = (key: string): string | undefined => {
  if (process.env[key]) {
    return process.env[key] || undefined;
  }
  
  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }
  
  return undefined;
};

// Create provider instances with API keys from localStorage
const openaiClient = createOpenAI({
  apiKey: getConfig('OPENAI_API_KEY'),
});

const anthropicClient = createAnthropic({
  apiKey: getConfig('ANTHROPIC_API_KEY'),
});

// Lazy Azure credential singleton for server-side Entra ID auth
let _azureCredential: { getToken(scope: string): Promise<{ token: string } | null> } | null = null;

const createEntraIdFetch = (): typeof globalThis.fetch => {
  return async (url, init) => {
    if (!_azureCredential) {
      const { DefaultAzureCredential } = await import('@azure/identity');
      _azureCredential = new DefaultAzureCredential();
    }
    const tokenResponse = await _azureCredential.getToken(
      'https://cognitiveservices.azure.com/.default'
    );
    if (!tokenResponse) throw new Error('Failed to acquire Azure Entra ID token');
    const headers = new Headers(init?.headers as HeadersInit);
    headers.delete('api-key');
    headers.set('Authorization', `Bearer ${tokenResponse.token}`);
    return globalThis.fetch(url as string, { ...init, headers });
  };
};

// Use Entra ID when: running server-side AND no API key configured
const useEntraId = typeof window === 'undefined' && !getConfig('AZURE_API_KEY');

const azureClient = createAzure({
  resourceName: getConfig('AZURE_RESOURCE_NAME'),
  // Placeholder satisfies the SDK's apiKey validation; the custom fetch below
  // strips the api-key header and injects an Entra ID bearer token instead.
  apiKey: getConfig('AZURE_API_KEY') ?? (useEntraId ? 'entra-id' : 'not-configured'),
  ...(useEntraId ? { fetch: createEntraIdFetch() } : {}),
});


// const xaiClient = createXai({
//   apiKey: getConfig('XAI_API_KEY'),
// });

const languageModels = {
  "gpt-5": openaiClient("gpt-5-2025-08-07"),
  "claude-4-sonnet": anthropicClient('claude-sonnet-4-20250514'),
  "azure-openai": azureClient(process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME || 'gpt-4o'),
  // "qwen-qwq": wrapLanguageModel(
  //   {
  //     model: groqClient("qwen-qwq-32b"),
  //     middleware
  //   }
  // ),
  // "grok-3-mini": xaiClient("grok-3-mini-latest"),
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "gpt-5": {
    provider: "OpenAI",
    name: "GPT-5",
    description: "OpenAI's most advanced multimodal model with excellent reasoning, coding, and vision capabilities.",
    apiVersion: "gpt-4o",
    capabilities: ["Reasoning", "Vision", "Code", "Balance"]
  },
  "claude-4-sonnet": {
    provider: "Anthropic",
    name: "Claude 4 Sonnet",
    description: "Latest version of Anthropic's Claude 4 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-sonnet-4-20250514",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "azure-openai": {
    provider: "Azure OpenAI",
    name: `Azure ${(process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME || 'gpt-4o').toUpperCase()}`,
    description: "OpenAI models hosted on Microsoft Azure, configured via your Azure resource and deployment.",
    apiVersion: process.env.NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME || 'gpt-4o',
    capabilities: ["Reasoning", "Vision", "Code", "Balance"]
  },
  // "qwen-qwq": {
  //   provider: "Groq",
  //   name: "Qwen QWQ",
  //   description: "Latest version of Alibaba's Qwen QWQ with strong reasoning and coding capabilities.",
  //   apiVersion: "qwen-qwq",
  //   capabilities: ["Reasoning", "Efficient", "Agentic"]
  // },
  // "grok-3-mini": {
  //   provider: "XAI",
  //   name: "Grok 3 Mini",
  //   description: "Latest version of XAI's Grok 3 Mini with strong reasoning and coding capabilities.",
  //   apiVersion: "grok-3-mini-latest",
  //   capabilities: ["Reasoning", "Efficient", "Agentic"]
  // },
};

// Reload when provider config changes in localStorage so the new values take effect
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Reload the page if any API key changed to refresh the providers
    if (event.key?.includes('API_KEY') || event.key?.includes('AZURE_')) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "gpt-5";

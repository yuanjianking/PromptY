/**
 * 大模型API调用服务
 * 完全依赖页面传入的配置
 */

import { LLMConfig, LLMRequestOptions, LLMStreamChunk } from '../types/prompt.types';


// 默认配置（空，完全由页面传入）
const DEFAULT_CONFIG: LLMConfig = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000
};

// 当前配置（初始为空）
let currentConfig: LLMConfig = { ...DEFAULT_CONFIG };

/**
 * 设置API配置（由页面传入）
 */
export const setAPIConfig = (config: Partial<LLMConfig>): void => {
  currentConfig = {
    ...currentConfig,
    ...config
  };
};

/**
 * 获取当前配置
 */
export const getAPIConfig = (): LLMConfig => {
  return { ...currentConfig };
};

/**
 * 清除配置
 */
export const clearAPIConfig = (): void => {
  currentConfig = { ...DEFAULT_CONFIG };
};

type RequestOptions = LLMRequestOptions;

interface OpenAIResponse {
  choices: Array<{
    message: { content: string };
    delta?: { content?: string };
  }>;
}

/**
 * 基础API调用函数
 */
export const callLLM = async <T>(
  prompt: string,
  systemMessage: string = '你是一个专业的Prompt优化专家，请严格遵循输出格式要求。',
  options: RequestOptions = {}
): Promise<T> => {
  const config = {
    ...currentConfig,
    temperature: options.temperature ?? currentConfig.temperature,
    maxTokens: options.maxTokens ?? currentConfig.maxTokens
  };

  if (!config.apiKey) {
    throw new Error('请先在页面中输入API密钥');
  }

  try {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...(options.headers || {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined
      }),
      signal: options.signal
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API请求失败: ${response.status}\n${errorData}`);
    }

    const data = await response.json() as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API返回内容为空');
    }

    if (options.responseFormat === 'json') {
      try {
        return JSON.parse(content) as T;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知解析错误';
        throw new Error(`JSON解析失败: ${content}\n错误: ${errorMessage}`);
      }
    }

    return content as unknown as T;
  } catch (error) {
    console.error('LLM调用错误:', error);
    throw error;
  }
};

/**
 * 带重试机制的API调用
 */
export const callLLMWithRetry = async <T>(
  prompt: string,
  systemMessage?: string,
  options: RequestOptions = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callLLM<T>(prompt, systemMessage, options);
    } catch (error) {
      lastError = error as Error;
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.warn(`第${attempt}次调用失败: ${errorMsg}`);

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('未知错误');
};

/**
 * 流式API调用
 */
export const callLLMStream = async (
  prompt: string,
  onChunk: (chunk: LLMStreamChunk) => void,
  systemMessage: string = '你是一个专业的Prompt优化专家',
  options: RequestOptions = {}
): Promise<string> => {
  const config = currentConfig;
  let accumulatedContent = '';

  if (!config.apiKey) {
    throw new Error('请先在页面中输入API密钥');
  }

  try {
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...(options.headers || {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true
      }),
      signal: options.signal
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法获取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data) as OpenAIResponse;
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              accumulatedContent += content;
              onChunk({
                content,
                done: false,
                accumulated: accumulatedContent
              });
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知错误';
            console.warn(`解析流数据失败: ${errorMsg}`);
          }
        }
      }
    }

    onChunk({
      content: '',
      done: true,
      accumulated: accumulatedContent
    });

    return accumulatedContent;
  } catch (error) {
    console.error('流式调用错误:', error);
    throw error;
  }
};

export default {
  callLLM,
  callLLMWithRetry,
  callLLMStream,
  setAPIConfig,
  getAPIConfig,
  clearAPIConfig
};
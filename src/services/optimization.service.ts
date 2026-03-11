/**
 * 优化业务逻辑编排
 * 包含主处理函数和各环节调用顺序
 */

import type {
  UserInput,
  SufficiencyOutput,
  PreAnalysisOutput,
  StrategyOutput,
  MetricsOutput,
  PostAnalysisOutput,
} from '../types/prompt.types';

import { callLLMWithRetry } from './llm.service';
import {
  SYSTEM_MESSAGES,
  getSufficiencyPrompt,
  getPreAnalysisPrompt,
  getStrategiesPrompt,
  getMetricsPrompt,
  getPostAnalysisPrompt
} from './prompt-templates';

// ============= 处理选项 =============

export interface OptimizationOptions {
  enablePostAnalysis?: boolean;  // 是否启用事后解释器
  temperature?: number;          // 温度参数
  maxRetries?: number;           // 最大重试次数
  onProgress?: (stage: string, progress: number) => void;  // 进度回调
}

// ============= 处理结果 =============

export interface OptimizationResult {
  sufficiency: SufficiencyOutput;
  preAnalysis: PreAnalysisOutput;
  strategies: StrategyOutput;
  metrics: MetricsOutput;
  postAnalysis?: PostAnalysisOutput;
  success: boolean;
  errors?: Record<string, string>;
}

// ============= 各环节处理函数 =============

/**
 * 1. 信息充分性评估
 */
export const evaluateSufficiency = async (
  userInput: UserInput,
  options?: OptimizationOptions
): Promise<SufficiencyOutput> => {
  try {
    const prompt = getSufficiencyPrompt(userInput);
    const result = await callLLMWithRetry<SufficiencyOutput>(
      prompt,
      SYSTEM_MESSAGES.sufficiency,
      { responseFormat: 'json', temperature: options?.temperature },
      options?.maxRetries
    );
    return result;
  } catch (error) {
    console.error('信息充分性评估失败:', error);
    throw new Error(`信息充分性评估失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 2. 事前分析
 */
export const analyzePrePrompt = async (
  userInput: UserInput,
  sufficiencyResult: SufficiencyOutput,
  options?: OptimizationOptions
): Promise<PreAnalysisOutput> => {
  try {
    const prompt = getPreAnalysisPrompt(userInput, sufficiencyResult);
    const result = await callLLMWithRetry<PreAnalysisOutput>(
      prompt,
      SYSTEM_MESSAGES.preAnalysis,
      { responseFormat: 'json', temperature: options?.temperature },
      options?.maxRetries
    );
    return result;
  } catch (error) {
    console.error('事前分析失败:', error);
    throw new Error(`事前分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 3. 多策略生成
 */
export const generateStrategies = async (
  userInput: UserInput,
  preAnalysisResult: PreAnalysisOutput,
  options?: OptimizationOptions
): Promise<StrategyOutput> => {
  try {
    const prompt = getStrategiesPrompt(userInput, preAnalysisResult);
    const result = await callLLMWithRetry<StrategyOutput>(
      prompt,
      SYSTEM_MESSAGES.strategies,
      { responseFormat: 'json', temperature: options?.temperature },
      options?.maxRetries
    );
    return result;
  } catch (error) {
    console.error('多策略生成失败:', error);
    throw new Error(`多策略生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 4. 指标与问题说明
 */
export const evaluateMetrics = async (
  userInput: UserInput,
  preAnalysisResult: PreAnalysisOutput,
  strategiesResult: StrategyOutput,
  options?: OptimizationOptions
): Promise<MetricsOutput> => {
  try {
    const prompt = getMetricsPrompt(userInput, preAnalysisResult, strategiesResult);
    const result = await callLLMWithRetry<MetricsOutput>(
      prompt,
      SYSTEM_MESSAGES.metrics,
      { responseFormat: 'json', temperature: options?.temperature },
      options?.maxRetries
    );
    return result;
  } catch (error) {
    console.error('指标评估失败:', error);
    throw new Error(`指标评估失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 5. 事后解释器
 */
export const analyzePostPrompt = async (
  userInput: UserInput,
  strategiesResult: StrategyOutput,
  metricsResult: MetricsOutput,
  options?: OptimizationOptions
): Promise<PostAnalysisOutput> => {
  try {
    const prompt = getPostAnalysisPrompt(userInput, strategiesResult, metricsResult);
    const result = await callLLMWithRetry<PostAnalysisOutput>(
      prompt,
      SYSTEM_MESSAGES.postAnalysis,
      { responseFormat: 'json', temperature: options?.temperature },
      options?.maxRetries
    );
    return result;
  } catch (error) {
    console.error('事后解释器失败:', error);
    throw new Error(`事后解释器失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// ============= 主处理函数 =============

/**
 * 完整的优化处理流程
 * @param userInput 用户输入
 * @param options 处理选项
 * @returns 优化结果
 */
export const runOptimization = async (
  userInput: UserInput,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> => {
  const {
    enablePostAnalysis = true,
    onProgress
  } = options;

  const errors: Record<string, string> = {};
  let sufficiency: SufficiencyOutput | null = null;
  let preAnalysis: PreAnalysisOutput | null = null;
  let strategies: StrategyOutput | null = null;
  let metrics: MetricsOutput | null = null;
  let postAnalysis: PostAnalysisOutput | null = null;

  try {
    // 步骤1: 信息充分性评估
    onProgress?.('sufficiency', 0.1);
    try {
      sufficiency = await evaluateSufficiency(userInput, options);
      onProgress?.('sufficiency', 0.2);
    } catch (error) {
      errors.sufficiency = error instanceof Error ? error.message : '未知错误';
      throw error; // 如果这一步失败，终止后续流程
    }

    // 步骤2: 事前分析
    onProgress?.('preAnalysis', 0.3);
    try {
      preAnalysis = await analyzePrePrompt(userInput, sufficiency, options);
      onProgress?.('preAnalysis', 0.4);
    } catch (error) {
      errors.preAnalysis = error instanceof Error ? error.message : '未知错误';
      throw error;
    }

    // 步骤3: 多策略生成
    onProgress?.('strategies', 0.5);
    try {
      strategies = await generateStrategies(userInput, preAnalysis, options);
      onProgress?.('strategies', 0.6);
    } catch (error) {
      errors.strategies = error instanceof Error ? error.message : '未知错误';
      throw error;
    }

    // 步骤4: 指标与问题说明
    onProgress?.('metrics', 0.7);
    try {
      metrics = await evaluateMetrics(userInput, preAnalysis, strategies, options);
      onProgress?.('metrics', 0.8);
    } catch (error) {
      errors.metrics = error instanceof Error ? error.message : '未知错误';
      throw error;
    }

    // 步骤5: 事后解释器（可选）
    if (enablePostAnalysis) {
      onProgress?.('postAnalysis', 0.9);
      try {
        postAnalysis = await analyzePostPrompt(userInput, strategies, metrics, options);
        onProgress?.('postAnalysis', 1.0);
      } catch (error) {
        errors.postAnalysis = error instanceof Error ? error.message : '未知错误';
        // 事后解释器失败不影响主流程
      }
    }

    return {
      sufficiency,
      preAnalysis,
      strategies,
      metrics,
      postAnalysis: postAnalysis || undefined,
      success: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined
    };

  } catch {
    // 主流程失败，返回已成功的部分
    return {
      sufficiency: sufficiency!,
      preAnalysis: preAnalysis!,
      strategies: strategies!,
      metrics: metrics!,
      postAnalysis: postAnalysis || undefined,
      success: false,
      errors
    };
  }
};

/**
 * 验证用户输入是否完整
 */
export const validateUserInput = (input: UserInput): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!input.scenario.originalText) missing.push('原始描述文本');
  if (!input.scenario.type) missing.push('场景类型');
  if (!input.scenario.purpose) missing.push('使用目的');
  if (!input.targetModel.provider) missing.push('模型提供方');
  if (!input.targetModel.name) missing.push('模型名称');
  if (!input.targetModel.version) missing.push('模型版本');

  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * 从用户输入中提取关键信息（用于日志）
 * 修正：使用具体的参数名，并添加非空判断
 */
export const extractKeyInfo = (input: UserInput): Record<string, string> => {
  return {
    scenarioType: input.scenario.type || '未填写',
    purpose: input.scenario.purpose || '未填写',
    model: input.targetModel.provider && input.targetModel.name
      ? `${input.targetModel.provider} ${input.targetModel.name}${input.targetModel.version ? ` (${input.targetModel.version})` : ''}`
      : '未填写',
    constraints: Object.entries(input.constraints)
      .filter(([, value]) => value && value.trim() !== '')
      .map(([key]) => key)
      .join(', ') || '无约束'
  };
};

/**
 * 格式化错误信息
 */
export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '未知错误';
};

export default {
  runOptimization,
  evaluateSufficiency,
  analyzePrePrompt,
  generateStrategies,
  evaluateMetrics,
  analyzePostPrompt,
  validateUserInput,
  extractKeyInfo,
  formatError
};
/**
 * 优化流程的状态管理Hook
 * 封装所有优化相关的状态和逻辑
 */

import { useState, useCallback, useRef } from 'react';
import {
  UserInput,
  SufficiencyOutput,
  PreAnalysisOutput,
  StrategyOutput,
  MetricsOutput,
  PostAnalysisOutput,
  LoadingState,
  ErrorState,
  CollapseState,
  DEFAULT_USER_INPUT,
  DEFAULT_MOCK_DATA
} from '../types/prompt.types';

import { runOptimization as runOptimizationService, OptimizationResult } from '../services/optimization.service';

// ============= Hook 选项类型 =============

export interface UseOptimizationOptions {
  /** 是否启用事后解释器 */
  enablePostAnalysis?: boolean;
  /** 是否在开发环境使用模拟数据 */
  useMockData?: boolean;
  /** 温度参数 */
  temperature?: number;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 进度回调 */
  onProgress?: (stage: string, progress: number) => void;
  /** 完成回调 */
  onComplete?: (result: OptimizationResult) => void;
  /** 错误回调 */
  onError?: (stage: string, error: string) => void;
}

// ============= Hook返回值类型 =============

export interface UseOptimizationReturn {
  // 状态
  userInput: UserInput;
  sufficiencyOutput: SufficiencyOutput | null;
  preAnalysisOutput: PreAnalysisOutput | null;
  strategiesOutput: StrategyOutput | null;
  metricsOutput: MetricsOutput | null;
  postAnalysisOutput: PostAnalysisOutput | null;
  loading: LoadingState;
  error: ErrorState;
  collapse: CollapseState;

  // 输入处理
  updateUserInput: <K extends keyof UserInput>(
    section: K,
    field: string,
    value: string
  ) => void;
  updateNestedInput: (
    path: string[],
    value: string
  ) => void;
  resetUserInput: () => void;

  // 优化流程
  runOptimization: () => Promise<void>;
  cancelOptimization: () => void;

  // 折叠控制
  toggleCollapse: (section: keyof CollapseState) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // 结果管理
  clearResults: () => void;
  exportResults: () => OptimizationResult | null;

  // 模拟数据（开发用）
  loadMockData: () => void;

  // 状态检查
  isProcessing: boolean;
  hasResults: boolean;
  hasError: boolean;
}

// ============= Hook 实现 =============

export const useOptimization = (
  options: UseOptimizationOptions = {}
): UseOptimizationReturn => {
  const {
    enablePostAnalysis = true,
    useMockData = process.env.NODE_ENV === 'development',
    temperature = 0.7,
    maxRetries = 3,
    onProgress,
    onComplete,
    onError
  } = options;

  // ============= 状态定义 =============

  // 用户输入
  const [userInput, setUserInput] = useState<UserInput>(DEFAULT_USER_INPUT);

  // 各环节输出
  const [sufficiencyOutput, setSufficiencyOutput] = useState<SufficiencyOutput | null>(null);
  const [preAnalysisOutput, setPreAnalysisOutput] = useState<PreAnalysisOutput | null>(null);
  const [strategiesOutput, setStrategiesOutput] = useState<StrategyOutput | null>(null);
  const [metricsOutput, setMetricsOutput] = useState<MetricsOutput | null>(null);
  const [postAnalysisOutput, setPostAnalysisOutput] = useState<PostAnalysisOutput | null>(null);

  // 加载状态
  const [loading, setLoading] = useState<LoadingState>({
    sufficiency: false,
    preAnalysis: false,
    strategies: false,
    metrics: false,
    postAnalysis: false
  });

  // 错误状态
  const [error, setError] = useState<ErrorState>({});

  // 折叠状态
  const [collapse, setCollapse] = useState<CollapseState>({
    sufficiency: false,
    preAnalysis: false,
    strategies: false,
    metrics: false,
    postAnalysis: false
  });

  // 中止控制器
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============= 计算属性 =============

  const isProcessing = Object.values(loading).some(Boolean);
  const hasResults = !!(sufficiencyOutput || preAnalysisOutput || strategiesOutput || metricsOutput || postAnalysisOutput);
  const hasError = Object.keys(error).length > 0;

  // ============= 输入处理 =============

  /**
   * 更新用户输入（一层深度的字段）
   */
  const updateUserInput = useCallback(<K extends keyof UserInput>(
    section: K,
    field: string,
    value: string
  ) => {
    setUserInput(prev => {
      const sectionData = prev[section] as Record<string, unknown>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  }, []);

  /**
   * 更新嵌套输入（任意深度的字段）
   */
  const updateNestedInput = useCallback((
    path: string[],
    value: string
  ) => {
    setUserInput(prev => {
      const newInput = { ...prev };
      let current: Record<string, unknown> = newInput as Record<string, unknown>;

      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
      }

      const lastKey = path[path.length - 1];
      current[lastKey] = value;

      return newInput;
    });
  }, []);

  /**
   * 重置用户输入
   */
  const resetUserInput = useCallback(() => {
    setUserInput(DEFAULT_USER_INPUT);
  }, []);

  // ============= 优化流程 =============

  /**
   * 取消优化流程
   */
  const cancelOptimization = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 重置加载状态
    setLoading({
      sufficiency: false,
      preAnalysis: false,
      strategies: false,
      metrics: false,
      postAnalysis: false
    });
  }, []);

  /**
   * 运行优化流程
   */
  const handleRunOptimization = useCallback(async () => {
    // 取消进行中的流程
    if (isProcessing) {
      cancelOptimization();
    }

    // 创建新的中止控制器
    abortControllerRef.current = new AbortController();

    // 清空之前的错误
    setError({});

    try {
      // 如果有模拟数据且处于开发环境
      if (useMockData) {
        setLoading({
          sufficiency: true,
          preAnalysis: true,
          strategies: true,
          metrics: true,
          postAnalysis: enablePostAnalysis
        });

        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSufficiencyOutput(DEFAULT_MOCK_DATA.sufficiency);
        setPreAnalysisOutput(DEFAULT_MOCK_DATA.preAnalysis);
        setStrategiesOutput(DEFAULT_MOCK_DATA.strategies);
        setMetricsOutput(DEFAULT_MOCK_DATA.metrics);
        if (enablePostAnalysis) {
          setPostAnalysisOutput(DEFAULT_MOCK_DATA.postAnalysis);
        }

        // 自动展开有结果的区域
        setCollapse({
          sufficiency: true,
          preAnalysis: true,
          strategies: true,
          metrics: true,
          postAnalysis: enablePostAnalysis
        });

        setLoading({
          sufficiency: false,
          preAnalysis: false,
          strategies: false,
          metrics: false,
          postAnalysis: false
        });

        const result: OptimizationResult = {
          sufficiency: DEFAULT_MOCK_DATA.sufficiency,
          preAnalysis: DEFAULT_MOCK_DATA.preAnalysis,
          strategies: DEFAULT_MOCK_DATA.strategies,
          metrics: DEFAULT_MOCK_DATA.metrics,
          postAnalysis: enablePostAnalysis ? DEFAULT_MOCK_DATA.postAnalysis : undefined,
          success: true,
          errors: undefined
        };

        onComplete?.(result);

        return;
      }

      // 实际调用API
      const result = await runOptimizationService(userInput, {
        enablePostAnalysis,
        temperature,
        maxRetries,
        onProgress: (stage, progress) => {
          // 更新加载状态
          setLoading(prev => ({
            ...prev,
            [stage]: progress < 1
          }));
          onProgress?.(stage, progress);
        }
      });

      // 更新输出
      setSufficiencyOutput(result.sufficiency);
      setPreAnalysisOutput(result.preAnalysis);
      setStrategiesOutput(result.strategies);
      setMetricsOutput(result.metrics);
      if (result.postAnalysis) {
        setPostAnalysisOutput(result.postAnalysis);
      }

      // 如果有错误，更新错误状态
      if (result.errors) {
        // 将 Record<string, string> 转换为 ErrorState
        const errorState: ErrorState = {};
        Object.entries(result.errors).forEach(([key, value]) => {
          if (key === 'sufficiency' || key === 'preAnalysis' || key === 'strategies' ||
              key === 'metrics' || key === 'postAnalysis' || key === 'general') {
            errorState[key as keyof ErrorState] = value;
          }
        });
        setError(errorState);

        Object.entries(errorState).forEach(([stage, err]) => {
          if (err) {
            onError?.(stage, err);
          }
        });
      }

      // 自动展开有结果的区域
      setCollapse({
        sufficiency: true,
        preAnalysis: true,
        strategies: true,
        metrics: true,
        postAnalysis: !!result.postAnalysis
      });

      onComplete?.(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError({ general: errorMessage });
      onError?.('general', errorMessage);
    } finally {
      // 重置加载状态
      setLoading({
        sufficiency: false,
        preAnalysis: false,
        strategies: false,
        metrics: false,
        postAnalysis: false
      });
      abortControllerRef.current = null;
    }
  }, [
    userInput,
    enablePostAnalysis,
    temperature,
    maxRetries,
    useMockData,
    isProcessing,
    cancelOptimization,
    onProgress,
    onComplete,
    onError
  ]);

  // ============= 折叠控制 =============

  /**
   * 切换折叠状态
   */
  const toggleCollapse = useCallback((section: keyof CollapseState) => {
    setCollapse(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  /**
   * 展开所有区域
   */
  const expandAll = useCallback(() => {
    setCollapse({
      sufficiency: true,
      preAnalysis: true,
      strategies: true,
      metrics: true,
      postAnalysis: true
    });
  }, []);

  /**
   * 折叠所有区域
   */
  const collapseAll = useCallback(() => {
    setCollapse({
      sufficiency: false,
      preAnalysis: false,
      strategies: false,
      metrics: false,
      postAnalysis: false
    });
  }, []);

  // ============= 结果管理 =============

  /**
   * 清空所有结果
   */
  const clearResults = useCallback(() => {
    setSufficiencyOutput(null);
    setPreAnalysisOutput(null);
    setStrategiesOutput(null);
    setMetricsOutput(null);
    setPostAnalysisOutput(null);
    setError({});
    collapseAll();
  }, [collapseAll]);

  /**
   * 导出结果
   */
  const exportResults = useCallback((): OptimizationResult | null => {
    if (!hasResults) return null;

    // 构建 errors 对象
    const errors: Record<string, string> | undefined = hasError ? {} : undefined;
    if (hasError) {
      Object.entries(error).forEach(([key, value]) => {
        if (value) {
          errors![key] = value;
        }
      });
    }

    return {
      sufficiency: sufficiencyOutput!,
      preAnalysis: preAnalysisOutput!,
      strategies: strategiesOutput!,
      metrics: metricsOutput!,
      postAnalysis: postAnalysisOutput || undefined,
      success: !hasError,
      errors
    };
  }, [
    sufficiencyOutput,
    preAnalysisOutput,
    strategiesOutput,
    metricsOutput,
    postAnalysisOutput,
    hasResults,
    hasError,
    error
  ]);

  /**
   * 加载模拟数据（开发用）
   */
  const loadMockData = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('loadMockData 只能在开发环境使用');
      return;
    }

    setSufficiencyOutput(DEFAULT_MOCK_DATA.sufficiency);
    setPreAnalysisOutput(DEFAULT_MOCK_DATA.preAnalysis);
    setStrategiesOutput(DEFAULT_MOCK_DATA.strategies);
    setMetricsOutput(DEFAULT_MOCK_DATA.metrics);
    setPostAnalysisOutput(DEFAULT_MOCK_DATA.postAnalysis);

    setCollapse({
      sufficiency: true,
      preAnalysis: true,
      strategies: true,
      metrics: true,
      postAnalysis: true
    });
  }, []);

  // ============= 返回值 =============

  return {
    // 状态
    userInput,
    sufficiencyOutput,
    preAnalysisOutput,
    strategiesOutput,
    metricsOutput,
    postAnalysisOutput,
    loading,
    error,
    collapse,

    // 输入处理
    updateUserInput,
    updateNestedInput,
    resetUserInput,

    // 优化流程
    runOptimization: handleRunOptimization,
    cancelOptimization,

    // 折叠控制
    toggleCollapse,
    expandAll,
    collapseAll,

    // 结果管理
    clearResults,
    exportResults,

    // 模拟数据
    loadMockData,

    // 状态检查
    isProcessing,
    hasResults,
    hasError
  };
};

// ============= 默认导出 =============

export default useOptimization;
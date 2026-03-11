/**
 * Prompt优化工作台类型定义
 */

// ============= 用户输入层类型 =============

export interface UserInput {
  // 使用场景描述
  scenario: {
    originalText: string;      // 原始描述文本
    type: string;              // 场景类型
    purpose: string;           // 使用目的
    expectedOutput: string;    // 期望输出性质
    successCriteria: string;   // 成功判定标准
    unacceptableResults: string; // 不可接受结果
  };
  // 原始 Prompt（只保留文本输入）
  originalPrompt: {
    text: string;  // 原始 Prompt 文本
  };
  // 目标模型（用户只输入基本信息）
  targetModel: {
    provider: string;  // 模型提供方：OpenAI、Anthropic、DeepSeek等
    name: string;      // 模型名称：GPT-4、Claude、deepseek-chat等
    version: string;   // 模型版本
  };
  // 约束条件
  constraints: {
    format: string;           // 格式约束
    length: string;           // 长度约束
    style: string;            // 风格约束
    prohibitedContent: string; // 禁止内容
    userPreferences: string;  // 用户显式偏好
  };
  // 全局生成参数
  globalParams: {
    explorationConvergence: string; // 探索 vs 收敛程度
    riskPreference: string;         // 风险偏好
    constraintStrength: string;     // 约束强度
    expectedLength: string;         // Prompt 期望长度
  };
}

// ============= 通用枚举类型 =============

export type ConclusionType = '信息充分' | '部分充分' | '信息不足';
export type SeverityType = '阻断' | '提示';
export type LevelType = '低' | '中低' | '中' | '中高' | '高';
export type StrengthType = '弱' | '中' | '强';
export type RiskLevelType = '低' | '中' | '高' | '轻微' | '部分' | '无';

// ============= Prompt结构识别 =============

export interface PromptStructure {
  goalSegment: string;        // 目标描述段
  instructionSegment: string; // 行为指令段
  outputSegment: string;      // 输出要求段
  implicitAssumptions: string; // 隐含假设
}

// ============= 模型能力画像 =============

export interface ModelCapabilities {
  reasoningStrength: LevelType;   // 推理能力强度
  creativityTendency: LevelType;  // 创造性倾向
  formatFollowing: LevelType;     // 格式遵循能力
  hallucinationRisk: LevelType;   // 幻觉风险等级
}

// ============= 信息充分性评估输出 =============

export interface SufficiencyOutput {
  conclusion: ConclusionType;

  // Prompt 结构识别
  structure: PromptStructure;
  completenessLevel: LevelType;  // Prompt 完整度等级

  // 模型能力画像
  modelCapabilities: ModelCapabilities;

  // 评估维度
  dimensions: {
    clarity: LevelType;        // 目标清晰度
    completeness: LevelType;   // 成功标准完备度
    constraint: LevelType;     // 约束完整度
    match: LevelType;          // 模型任务匹配度
  };

  // 信息缺失清单（字符串格式）
  missingList: string;

  // 生成决策
  decisions: {
    allowGenerate: string;     // 是否允许生成 Prompt
    riskWarning: string;       // 是否强制风险声明
  };
}

// ============= 事前分析输出 =============

export interface PreAnalysisOutput {
  // 1. 场景拆解
  taskDecomposition: {
    explicit: string;      // 显性任务
    implicit: string;      // 隐性子任务
    boundary: string;      // 任务边界
    nonTarget: string;     // 明确非目标
  };

  // 2. 目标显式化
  objectives: {
    primary: string;       // 主目标
    secondary: string;     // 次级目标
    priority: string;      // 目标优先级
    conflict: string;      // 目标冲突检测
  };

  // 3. 不确定性标注
  uncertainty: {
    vagueTerms: string;         // 含糊词语
    underSpecified: string;     // 未充分说明的要求
    modelDependent: string;     // 强模型依赖点
    implicitAssumptions: string; // 隐含前提标记
  };

  // 4. 风险预测
  risks: {
    ignoreInstruction: LevelType;  // 指令忽略风险
    outputDeviation: LevelType;    // 输出偏移风险
    hallucination: LevelType;      // 幻觉风险
    conservative: LevelType;       // 过度保守风险
    mismatch: LevelType;           // 目标错配风险
  };
}

// ============= 多策略生成输出 =============

export interface StrategyA {
  goal: string;        // 策略目标
  style: string;       // 指令风格
  constraint: string;  // 约束等级
  prompt: string;      // 生成的 Prompt 文本
  condition: string;   // 适用条件
}

export interface StrategyB {
  goal: string;        // 策略目标
  freedom: string;     // 自由度等级
  openness: string;    // 指令开放性
  prompt: string;      // 生成的 Prompt 文本
  riskNote: string;    // 风险提示
}

export interface StrategyC {
  goal: string;        // 策略目标
  constraints: string; // 硬性约束列表
  execution: string;   // 约束执行方式
  prompt: string;      // 生成的 Prompt 文本
  failureMode: string; // 失效模式
}

export interface StrategyD {
  goal: string;        // 推理引导方式
  steps: string;       // 步骤结构
  explanation: string; // 解释要求
  prompt: string;      // 生成的 Prompt 文本
}

export interface StrategyE {
  role: string;        // 角色定义
  constraints: string; // 角色行为约束
  perspective: string; // 视角偏向
  prompt: string;      // 生成的 Prompt 文本
}

export interface StrategyOutput {
  strategies: {
    strategyA: StrategyA;
    strategyB: StrategyB;
    strategyC: StrategyC;
    strategyD: StrategyD;
    strategyE: StrategyE;
  };
}

// ============= 单个策略的指标 =============

export interface StrategyMetrics {
  clarityLevel: LevelType;           // 目标清晰度等级
  constraintLevel: StrengthType;     // 约束强度等级
  explorationConvergence: string;    // 探索-收敛位置
  riskProfile: string;               // 风险偏好摘要
  missingPoints: string;             // 缺失说明｜潜在影响
  modelSensitivePoints: string;      // 敏感点类型｜影响的 Prompt 区段
  deviationSignals: string;          // 偏差名称｜触发条件｜早期预警信号
}

// ============= 指标与问题说明输出 =============

export interface MetricsOutput {
  strategyA: StrategyMetrics;
  strategyB: StrategyMetrics;
  strategyC: StrategyMetrics;
  strategyD: StrategyMetrics;
  strategyE: StrategyMetrics;
}

// ============= 单个策略的事后解释 =============

export interface StrategyPostAnalysis {
  attribution: {
    primary: string;           // 主要原因类别
    promptIssues: string;      // Prompt 层问题
    interactionIssues: string; // 模型交互问题
    userIssues: string;        // 用户输入问题
  };
  deviationTypes: {
    divergence: RiskLevelType;      // 输出发散
    hallucination: RiskLevelType;   // 幻觉生成
    underperformance: RiskLevelType; // 表现不足
    overConstraint: RiskLevelType;  // 过度约束
  };
  improvements: {
    refineGoal: string;         // 目标细化
    adjustConstraint: string;   // 约束调整
    reorderInstructions: string; // 指令重排
    switchStrategy: string;     // 策略切换
  };
  comparison: {
    original: string;   // 原 Prompt 片段
    revised: string;    // 修订后 Prompt 片段
    diff: string;       // 修改差异说明
  };
}

// ============= 事后解释器输出 =============

export interface PostAnalysisOutput {
  strategyA: StrategyPostAnalysis;
  strategyB: StrategyPostAnalysis;
  strategyC: StrategyPostAnalysis;
  strategyD: StrategyPostAnalysis;
  strategyE: StrategyPostAnalysis;
}

// ============= API 相关类型 =============

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  timeout?: number;
  stream?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
  accumulated?: string;
}

// ============= 状态管理类型 =============

export interface LoadingState {
  sufficiency: boolean;
  preAnalysis: boolean;
  strategies: boolean;
  metrics: boolean;
  postAnalysis: boolean;
}

export interface ErrorState {
  sufficiency?: string;
  preAnalysis?: string;
  strategies?: string;
  metrics?: string;
  postAnalysis?: string;
  general?: string;
}

export interface CollapseState {
  sufficiency: boolean;
  preAnalysis: boolean;
  strategies: boolean;
  metrics: boolean;
  postAnalysis: boolean;
}

// ============= 默认值 =============

export const DEFAULT_USER_INPUT: UserInput = {
  scenario: {
    originalText: '',
    type: '',
    purpose: '',
    expectedOutput: '',
    successCriteria: '',
    unacceptableResults: ''
  },
  originalPrompt: {
    text: ''
  },
  targetModel: {
    provider: '',
    name: '',
    version: ''
  },
  constraints: {
    format: '',
    length: '',
    style: '',
    prohibitedContent: '',
    userPreferences: ''
  },
  globalParams: {
    explorationConvergence: '0.6',
    riskPreference: '平衡',
    constraintStrength: '中',
    expectedLength: '200-300字'
  }
};
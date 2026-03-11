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
    provider: string;  // 模型提供方：OpenAI、Anthropic、Google等
    name: string;      // 模型名称：GPT-4、Claude、Gemini等
    version: string;   // 模型版本：gpt-4-turbo-preview、claude-3-opus等
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

export interface MissingItem {
  id: string;
  field: string;
  severity: SeverityType;
  prompt: string;
}

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

// ============= 指标与问题说明输出 =============

export interface MetricsOutput {
  // 核心指标
  clarityLevel: LevelType;           // 目标清晰度等级
  constraintLevel: StrengthType;     // 约束强度等级
  explorationConvergence: string;    // 探索-收敛位置
  riskProfile: string;               // 风险偏好摘要

  // 已识别信息缺失点
  missingPoints: string;             // 缺失说明｜潜在影响

  // 模型敏感点
  modelSensitivePoints: string;      // 敏感点类型｜影响的 Prompt 区段

  // 可能偏差类型
  deviationSignals: string;          // 偏差名称｜触发条件｜早期预警信号
}

// ============= 事后解释器输出 =============

export interface Attribution {
  primary: string;           // 主要原因类别
  promptIssues: string;      // Prompt 层问题
  interactionIssues: string; // 模型交互问题
  userIssues: string;        // 用户输入问题
}

export interface DeviationTypes {
  divergence: RiskLevelType;      // 输出发散
  hallucination: RiskLevelType;   // 幻觉生成
  underperformance: RiskLevelType; // 表现不足
  overConstraint: RiskLevelType;  // 过度约束
}

export interface Improvements {
  refineGoal: string;         // 目标细化
  adjustConstraint: string;   // 约束调整
  reorderInstructions: string; // 指令重排
  switchStrategy: string;     // 策略切换
}

export interface Comparison {
  original: string;   // 原 Prompt 片段
  revised: string;    // 修订后 Prompt 片段
  diff: string;       // 修改差异说明
}

export interface PostAnalysisOutput {
  attribution: Attribution;
  deviationTypes: DeviationTypes;
  improvements: Improvements;
  comparison: Comparison;
}

// ============= API 响应类型 =============

/**
 * 大模型API调用的统一响应格式
 */
export interface LLMResponse<T = unknown> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 请求ID（用于追踪） */
  requestId?: string;
  /** 耗时（毫秒） */
  duration?: number;

}

/**
 * 流式响应的数据块类型
 */
export interface LLMStreamChunk {
  /** 内容片段 */
  content: string;
  /** 是否完成 */
  done: boolean;
  /** 当前累计内容 */
  accumulated?: string;
}

/**
 * API调用配置
 */
export interface LLMConfig {
  /** API密钥 */
  apiKey: string;
  /** API基础URL */
  baseUrl: string;
  /** 模型名称 */
  model: string;
  /** 温度参数 */
  temperature: number;
  /** 最大token数 */
  maxTokens?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * API调用选项
 */
export interface LLMRequestOptions {
  /** 温度参数 */
  temperature?: number;
  /** 最大token数 */
  maxTokens?: number;
  /** 响应格式 */
  responseFormat?: 'json' | 'text';
  /** 超时时间 */
  timeout?: number;
  /** 是否启用流式 */
  stream?: boolean;
  /** 中止信号 */
  signal?: AbortSignal;
  /** 自定义请求头 */
  headers?: Record<string, string>;  // 添加 headers 字段
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

// ============= 折叠状态类型 =============

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

// ============= 默认模拟数据 =============

export const DEFAULT_MOCK_DATA = {
  sufficiency: {
    conclusion: '部分充分' as ConclusionType,
    structure: {
      goalSegment: '生成营销文案',
      instructionSegment: '使用正式语气，突出产品卖点',
      outputSegment: '字数200字左右，适合社交媒体发布',
      implicitAssumptions: '假设目标受众为25-35岁职场人士'
    },
    completenessLevel: '中' as LevelType,
    modelCapabilities: {
      reasoningStrength: '高' as LevelType,
      creativityTendency: '中' as LevelType,
      formatFollowing: '高' as LevelType,
      hallucinationRisk: '中低' as LevelType
    },
    dimensions: {
      clarity: '中' as LevelType,
      completeness: '中低' as LevelType,
      constraint: '低' as LevelType,
      match: '中' as LevelType
    },
    missingList: '1. 缺失字段：成功判定标准，严重级别：阻断，补全提示：请明确如何衡量输出成功\n2. 缺失字段：目标受众，严重级别：提示，补全提示：建议说明目标用户群体',
    decisions: {
      allowGenerate: '是（需附带风险声明）',
      riskWarning: '强制'
    }
  },
  preAnalysis: {
    taskDecomposition: {
      explicit: '生成营销文案',
      implicit: '挖掘产品卖点、适配目标受众',
      boundary: '仅限于社交媒体短文案',
      nonTarget: '不涉及技术说明书'
    },
    objectives: {
      primary: '提升点击率',
      secondary: '保持品牌调性',
      priority: '点击率 > 品牌调性',
      conflict: '无显著冲突'
    },
    uncertainty: {
      vagueTerms: '吸引人、优质',
      underSpecified: '目标受众画像不清晰',
      modelDependent: '创造性要求依赖模型温度参数',
      implicitAssumptions: '假设模型理解‘年轻人’指18-25岁'
    },
    risks: {
      ignoreInstruction: '中' as LevelType,
      outputDeviation: '高' as LevelType,
      hallucination: '中' as LevelType,
      conservative: '低' as LevelType,
      mismatch: '中' as LevelType
    }
  },
  strategies: {
    strategies: {
      strategyA: {
        goal: '信息准确、结构清晰',
        style: '正式、专业',
        constraint: '强',
        prompt: '请根据以下产品信息生成一段精确的产品描述文案，需包含产品名称、核心功能、适用人群，语气专业。',
        condition: '当需要严格遵循产品事实时'
      },
      strategyB: {
        goal: '激发情感、提高传播',
        freedom: '高',
        openness: '开放',
        prompt: '基于产品亮点，创意发挥，写一段富有感染力的社交媒体文案，可以适当夸张。',
        riskNote: '可能存在过度夸张风险'
      },
      strategyC: {
        goal: '信息完整、无歧义',
        constraints: '必须包含价格和链接；禁止形容词；字数不超过150',
        execution: '硬性约束',
        prompt: '严格遵循以下框架：①产品名称 ②痛点 ③解决方案 ④价格 ⑤购买链接。禁止使用形容词。',
        failureMode: '当信息不完整时可能生成占位符'
      },
      strategyD: {
        goal: '说服力强、逻辑严密',
        steps: '①受众画像 ②需求分析 ③产品匹配 ④信息排序',
        explanation: '需解释每一步的推理依据',
        prompt: '请以逻辑推理的方式，先分析目标受众的需求，再结合产品优势，逐步推导出文案的核心信息。'
      },
      strategyE: {
        role: '品牌营销专家',
        constraints: '语气自信、专业，引用行业术语',
        perspective: '行业专家视角',
        prompt: '你是一位资深的品牌营销专家，拥有10年消费品行业经验。请从专家视角为产品撰写推荐语。'
      }
    }
  },
  metrics: {
    clarityLevel: '中' as LevelType,
    constraintLevel: '中' as StrengthType,
    explorationConvergence: '0.6',
    riskProfile: '平衡风险策略，允许中等程度的创造性发挥',
    missingPoints: '缺失说明：目标受众画像不完整；潜在影响：输出内容可能与实际受众不匹配',
    modelSensitivePoints: '敏感点类型：创造性要求；影响的 Prompt 区段：行为指令段',
    deviationSignals: '偏差名称：输出泛化；触发条件：目标不明确时；早期预警信号：内容过于通用、缺乏针对性'
  },
  postAnalysis: {
    attribution: {
      primary: 'Prompt模糊性',
      promptIssues: '目标描述不具体，缺乏成功标准',
      interactionIssues: '模型温度设置过高',
      userIssues: '未提供目标受众画像'
    },
    deviationTypes: {
      divergence: '部分' as RiskLevelType,
      hallucination: '轻微' as RiskLevelType,
      underperformance: '中' as RiskLevelType,
      overConstraint: '无' as RiskLevelType
    },
    improvements: {
      refineGoal: '明确点击率目标',
      adjustConstraint: '增加受众约束',
      reorderInstructions: '将关键指令前置',
      switchStrategy: '尝试精确型策略'
    },
    comparison: {
      original: '写一段吸引人的文案',
      revised: '为18-25岁年轻用户写一段社交媒体文案，突出产品性价比，控制在100字以内',
      diff: '增加了受众、平台、核心卖点和长度约束'
    }
  }
};

// ============= 工具类型 =============

/**
 * 确保类型不为空
 */
export type NonEmpty<T> = T extends null | undefined ? never : T;

/**
 * 提取API响应中的数据
 */
export type ExtractData<T extends LLMResponse> = T['data'];

/**
 * API错误类型
 */
export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
  timestamp?: number;
}
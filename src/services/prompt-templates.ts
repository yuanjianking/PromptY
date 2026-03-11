/**
 * Prompt模板定义
 * 包含各环节的提示词模板和系统消息
 */

import {
  UserInput,
  SufficiencyOutput,
  PreAnalysisOutput,
  StrategyOutput,
  MetricsOutput
} from '../types/prompt.types';

// ============= 系统消息 =============

export const SYSTEM_MESSAGES = {
  sufficiency: '你是一个Prompt优化专家，专注于评估用户输入的信息完整性。请分析以下用户输入，输出严格的JSON格式评估结果，包括Prompt结构识别、模型能力画像等。',
  preAnalysis: '你是一个Prompt分析专家，擅长拆解任务、识别目标和预测风险。请基于用户输入和评估结果进行事前分析，输出JSON格式。',
  strategies: '你是一个Prompt工程专家，擅长设计不同风格的Prompt策略。请基于分析结果生成5种策略的Prompt，输出JSON格式。',
  metrics: '你是一个质量评估专家，负责评估Prompt的质量和潜在问题。请分析并输出JSON格式的评估指标。',
  postAnalysis: '你是一个解释分析专家，负责解释Prompt执行结果的偏差原因和改进方向。请输出JSON格式的分析结果。'
} as const;

// ============= 工具函数 =============

/**
 * 格式化用户输入为字符串
 */
const formatUserInput = (input: UserInput): string => {
  return JSON.stringify(input, null, 2);
};

/**
 * 安全地序列化对象，处理循环引用等问题
 */
const safeStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[序列化错误: ${error instanceof Error ? error.message : '未知错误'}]`;
  }
};

// ============= 信息充分性评估模板 =============

export const getSufficiencyPrompt = (userInput: UserInput): string => {
  return `
你是一个Prompt优化专家。请分析以下用户输入，评估信息充分性。

用户输入：
${formatUserInput(userInput)}

请输出JSON格式的评估结果，严格遵循以下结构：

{
  "conclusion": "部分充分", // 可选值：信息充分 / 部分充分 / 信息不足

  // Prompt 结构识别（基于原始Prompt文本分析）
  "structure": {
    "goalSegment": "生成一篇关于环保的演讲稿",  // 识别出的目标描述段
    "instructionSegment": "使用正式语气，包含数据和案例",  // 识别出的行为指令段
    "outputSegment": "字数在1000字左右，分段清晰",  // 识别出的输出要求段
    "implicitAssumptions": "假设听众具有基本环保知识"  // 识别出的隐含假设
  },
  "completenessLevel": "中",  // Prompt 完整度等级：低/中低/中/中高/高

  // 模型能力画像（基于用户输入的模型信息评估）
  "modelCapabilities": {
    "reasoningStrength": "高",      // 推理能力强度：低/中低/中/中高/高
    "creativityTendency": "中",     // 创造性倾向：低/中低/中/中高/高
    "formatFollowing": "高",        // 格式遵循能力：低/中低/中/中高/高
    "hallucinationRisk": "中低"      // 幻觉风险等级：低/中低/中/中高/高
  },

  "dimensions": {
    "clarity": "中",        // 目标清晰度：低/中低/中/中高/高
    "completeness": "中低",  // 成功标准完备度：低/中低/中/中高/高
    "constraint": "低",      // 约束完整度：低/中低/中/中高/高
    "match": "中"           // 模型任务匹配度：低/中低/中/中高/高
  },
  "missingList": "1. 缺失字段：成功判定标准，严重级别：阻断，补全提示：请明确如何衡量输出成功\\n2. 缺失字段：目标受众，严重级别：提示，补全提示：建议说明目标用户群体",
  "decisions": {
    "allowGenerate": "是（需附带风险声明）",
    "riskWarning": "强制"
  }
}

评估指南：
1. structure 字段需要基于用户提供的原始Prompt文本（userInput.originalPrompt.text）进行分析
2. modelCapabilities 字段需要基于用户提供的模型信息（userInput.targetModel）进行专业评估
   - 不同模型提供方和版本有不同的能力特征
   - 例如：GPT-4 推理能力强，Claude 格式遵循能力强
3. 所有级别字段必须使用：低、中低、中、中高、高 五个等级
4. missingList 是字符串格式，每行一个缺失项，用\\n分隔
5. allowGenerate 和 riskWarning 输出具体的文字描述
`;
};

// ============= 事前分析模板 =============

export const getPreAnalysisPrompt = (
  userInput: UserInput,
  sufficiencyResult: SufficiencyOutput
): string => {
  return `
基于以下用户输入和信息评估结果，进行Prompt事前分析。

用户输入：
${formatUserInput(userInput)}

信息评估结果：
${safeStringify(sufficiencyResult)}

请输出JSON格式的分析结果，严格遵循以下结构：

{
  "taskDecomposition": {
    "explicit": "生成营销文案",
    "implicit": "挖掘产品卖点、适配目标受众",
    "boundary": "仅限于社交媒体短文案",
    "nonTarget": "不涉及技术说明书"
  },
  "objectives": {
    "primary": "提升点击率",
    "secondary": "保持品牌调性",
    "priority": "点击率 > 品牌调性",
    "conflict": "无显著冲突"
  },
  "uncertainty": {
    "vagueTerms": "吸引人、优质",
    "underSpecified": "目标受众画像不清晰",
    "modelDependent": "创造性要求依赖模型温度参数",
    "implicitAssumptions": "假设模型理解‘年轻人’指18-25岁"
  },
  "risks": {
    "ignoreInstruction": "中",
    "outputDeviation": "高",
    "hallucination": "中",
    "conservative": "低",
    "mismatch": "中"
  }
}

注意：
1. uncertainty 中的字段都是字符串格式，多项用顿号分隔
2. risks 中的值必须使用：低/中/高 三个等级
`;
};

// ============= 多策略生成模板 =============

export const getStrategiesPrompt = (
  userInput: UserInput,
  preAnalysisResult: PreAnalysisOutput
): string => {
  return `
基于用户输入和事前分析，生成5种不同策略的Prompt。

用户输入：
${formatUserInput(userInput)}

事前分析：
${safeStringify(preAnalysisResult)}

请生成5种策略的Prompt，输出JSON格式：

{
  "strategies": {
    "strategyA": {
      "goal": "信息准确、结构清晰",
      "style": "正式、专业",
      "constraint": "强",
      "prompt": "生成的精确型Prompt文本",
      "condition": "当需要严格遵循产品事实时"
    },
    "strategyB": {
      "goal": "激发情感、提高传播",
      "freedom": "高",
      "openness": "开放",
      "prompt": "生成的探索型Prompt文本",
      "riskNote": "可能存在过度夸张风险"
    },
    "strategyC": {
      "goal": "信息完整、无歧义",
      "constraints": "必须包含价格和链接；禁止形容词；字数不超过150",
      "execution": "硬性约束",
      "prompt": "生成的强约束型Prompt文本",
      "failureMode": "当信息不完整时可能生成占位符"
    },
    "strategyD": {
      "goal": "说服力强、逻辑严密",
      "steps": "①受众画像 ②需求分析 ③产品匹配 ④信息排序",
      "explanation": "需解释每一步的推理依据",
      "prompt": "生成的分析型Prompt文本"
    },
    "strategyE": {
      "role": "品牌营销专家",
      "constraints": "语气自信、专业，引用行业术语",
      "perspective": "行业专家视角",
      "prompt": "生成的角色导向型Prompt文本"
    }
  }
}

策略说明：
1. 精确型：信息准确、结构清晰，适合需要严格遵循事实的场景
2. 探索型：创意发挥、开放自由，适合需要创新的场景
3. 强约束型：严格遵循框架，适合有明确格式要求的场景
4. 分析型：逻辑推理、逐步推导，适合需要深度思考的场景
5. 角色导向型：特定角色视角，适合需要专业视角的场景

注意：
1. 每个策略的prompt字段需要生成完整可用的Prompt文本
2. 策略目标要清晰说明该策略的主要用途
`;
};

// ============= 指标与问题说明模板 =============

export const getMetricsPrompt = (
  userInput: UserInput,
  preAnalysisResult: PreAnalysisOutput,
  strategiesResult: StrategyOutput
): string => {
  return `
评估Prompt的质量和潜在问题。

用户输入：
${formatUserInput(userInput)}

事前分析：
${safeStringify(preAnalysisResult)}

生成的策略：
${safeStringify(strategiesResult)}

请输出JSON格式的评估指标：

{
  "clarityLevel": "中",
  "constraintLevel": "中",
  "explorationConvergence": "0.6",
  "riskProfile": "平衡风险策略，允许中等程度的创造性发挥",
  "missingPoints": "缺失说明：目标受众画像不完整；潜在影响：输出内容可能与实际受众不匹配",
  "modelSensitivePoints": "敏感点类型：创造性要求；影响的 Prompt 区段：行为指令段",
  "deviationSignals": "偏差名称：输出泛化；触发条件：目标不明确时；早期预警信号：内容过于通用、缺乏针对性"
}

注意：
1. clarityLevel 必须使用：低/中低/中/中高/高 五个等级
2. constraintLevel 必须使用：弱/中/强 三个等级
3. explorationConvergence 是0-1之间的数值，0表示完全收敛，1表示完全探索
4. 所有字段都是字符串格式
`;
};

// ============= 事后解释器模板 =============

export const getPostAnalysisPrompt = (
  userInput: UserInput,
  strategiesResult: StrategyOutput,
  metricsResult: MetricsOutput
): string => {
  return `
解释Prompt执行结果的偏差原因和改进方向。

用户输入：
${formatUserInput(userInput)}

生成的策略：
${safeStringify(strategiesResult)}

评估指标：
${safeStringify(metricsResult)}

请输出JSON格式的分析结果：

{
  "attribution": {
    "primary": "Prompt模糊性",
    "promptIssues": "目标描述不具体，缺乏成功标准",
    "interactionIssues": "模型温度设置过高",
    "userIssues": "未提供目标受众画像"
  },
  "deviationTypes": {
    "divergence": "部分",
    "hallucination": "轻微",
    "underperformance": "中",
    "overConstraint": "无"
  },
  "improvements": {
    "refineGoal": "明确点击率目标",
    "adjustConstraint": "增加受众约束",
    "reorderInstructions": "将关键指令前置",
    "switchStrategy": "尝试精确型策略"
  },
  "comparison": {
    "original": "写一段吸引人的文案",
    "revised": "为18-25岁年轻用户写一段社交媒体文案，突出产品性价比，控制在100字以内",
    "diff": "增加了受众、平台、核心卖点和长度约束"
  }
}

注意：
1. deviationTypes 中的值必须使用：低/中/高/轻微/部分/无 六个等级
2. attribution 字段分析偏差的主要原因
3. improvements 字段提供具体的改进方向
4. comparison 字段展示修改前后的对比
5. 所有字段都是字符串格式
`;
};

export default {
  SYSTEM_MESSAGES,
  getSufficiencyPrompt,
  getPreAnalysisPrompt,
  getStrategiesPrompt,
  getMetricsPrompt,
  getPostAnalysisPrompt
};
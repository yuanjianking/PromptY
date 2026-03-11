import { useState } from "react";
import "./PromptWorkbench.css";
import { useOptimization } from '../hooks/useOptimization';
import { setAPIConfig } from "../services/llm.service";

export default function PromptOptimizationSession() {
  const {
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
    resetUserInput,

    // 优化流程
    runOptimization,
    cancelOptimization,

    // 折叠控制
    toggleCollapse,

    // 结果管理
    clearResults,

    // 状态检查
    isProcessing,
    hasResults,
    hasError
  } = useOptimization({
    enablePostAnalysis: true,
    onProgress: (stage, progress) => {
      console.log(`${stage}: ${progress * 100}%`);
    },
    onComplete: (result) => {
      console.log('优化完成', result);
    },
    onError: (stage, error) => {
      console.error(`${stage}错误:`, error);
    }
  });

  const handleSubmit = async () => {
    await runOptimization();
  };

  const handleClear = () => {
    clearResults();
    resetUserInput();
  };

  // 检查是否有任何加载中的环节
  const isLoadingAny = Object.values(loading).some(Boolean);

  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    baseUrl: 'https://api.deepseek.com', // 修改为 DeepSeek 基础地址
    model: 'deepseek-chat',
  });

  const [showApiConfig, setShowApiConfig] = useState(false);

  // 保存配置到 service
  const handleSaveApiConfig = () => {
    setAPIConfig(apiConfig);
    setShowApiConfig(false);
    alert('API配置已保存（临时生效，刷新页面后失效）');
  };

  return (
    <div className="prompt-workbench">
      <div className="workbench-header">
        <h1>Prompt 优化工作台</h1>
        <p className="header-sub">系统化分析 · 多策略生成 · 深度解释</p>
      </div>


      {/* 全局加载指示器 */}
      {isLoadingAny && (
        <div className="global-loading">
          <div className="loading-spinner"></div>
          <div className="loading-stages">
            {loading.sufficiency && <span className="loading-stage">信息评估中...</span>}
            {loading.preAnalysis && <span className="loading-stage">事前分析中...</span>}
            {loading.strategies && <span className="loading-stage">策略生成中...</span>}
            {loading.metrics && <span className="loading-stage">指标评估中...</span>}
            {loading.postAnalysis && <span className="loading-stage">事后解释中...</span>}
          </div>
        </div>
      )}

      {/* 简单的API配置 */}
      <div className="simple-api-config">
        <button onClick={() => setShowApiConfig(!showApiConfig)} className="api-config-btn">
          {apiConfig.apiKey ? '🔑 API已配置' : '⚙️ 设置API'}
        </button>

        {showApiConfig && (
          <div className="api-config-simple">
            <h4>临时API配置</h4>
            <div className="field-with-label">
              <label>API密钥</label>
              <input
                type="password"
                placeholder="输入API密钥"
                value={apiConfig.apiKey}
                onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
              />
            </div>
            <div className="field-with-label">
              <label>API地址</label>
              <input
                placeholder="https://api.openai.com/v1/chat/completions"
                value={apiConfig.baseUrl}
                onChange={(e) => setApiConfig({...apiConfig, baseUrl: e.target.value})}
              />
            </div>
            <div className="field-with-label">
              <label>模型名称</label>
              <input
                placeholder="gpt-3.5-turbo"
                value={apiConfig.model}
                onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
              />
            </div>
            <div className="api-config-actions">
              <button onClick={handleSaveApiConfig} disabled={!apiConfig.apiKey}>
                保存
              </button>
              <button onClick={() => setShowApiConfig(false)}>取消</button>
            </div>
          </div>
        )}
      </div>

      {/* 一、用户输入层 - 只保留真正的输入字段 */}
      <section className="card input-section">
        <div className="card-title">
          <span className="step-badge">一</span>
          <h2>用户输入层 <span className="subtitle">Input</span></h2>
        </div>

        <div className="section-grid">
          {/* 使用场景描述 */}
          <div className="section-group">
            <h3>1. 使用场景描述 </h3>
            <div className="field-with-label">
              <label>原始描述文本</label>
              <textarea
                placeholder="请输入原始描述文本"
                rows={3}
                value={userInput.scenario.originalText}
                onChange={(e) => updateUserInput('scenario', 'originalText', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>场景类型</label>
              <input
                placeholder="例如：营销、客服、创作等"
                value={userInput.scenario.type}
                onChange={(e) => updateUserInput('scenario', 'type', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>使用目的</label>
              <input
                placeholder="例如：提升转化率、解决问题等"
                value={userInput.scenario.purpose}
                onChange={(e) => updateUserInput('scenario', 'purpose', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>期望输出性质</label>
              <input
                placeholder="例如：创意文案、技术文档等"
                value={userInput.scenario.expectedOutput}
                onChange={(e) => updateUserInput('scenario', 'expectedOutput', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>成功判定标准</label>
              <input
                placeholder="如何衡量输出成功"
                value={userInput.scenario.successCriteria}
                onChange={(e) => updateUserInput('scenario', 'successCriteria', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>不可接受结果</label>
              <input
                placeholder="哪些输出是不可接受的"
                value={userInput.scenario.unacceptableResults}
                onChange={(e) => updateUserInput('scenario', 'unacceptableResults', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* 原始 Prompt - 只保留文本输入 */}
          <div className="section-group">
            <h3>2. 原始 Prompt </h3>
            <div className="field-with-label">
              <label>原始 Prompt 文本</label>
              <textarea
                placeholder="请输入原始 Prompt 文本"
                rows={4}
                value={userInput.originalPrompt.text}
                onChange={(e) => updateUserInput('originalPrompt', 'text', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* 目标模型 - 只保留基本信息 */}
          <div className="section-group">
            <h3>3. 目标模型 </h3>
            <div className="compact-row">
              <div className="field-with-label">
                <label>模型提供方</label>
                <input
                  placeholder="例如：OpenAI、Anthropic"
                  value={userInput.targetModel.provider}
                  onChange={(e) => updateUserInput('targetModel', 'provider', e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div className="field-with-label">
                <label>模型名称</label>
                <input
                  placeholder="例如：GPT-4、Claude"
                  value={userInput.targetModel.name}
                  onChange={(e) => updateUserInput('targetModel', 'name', e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            <div className="field-with-label">
              <label>模型版本</label>
              <input
                placeholder="例如：gpt-4-turbo-preview"
                value={userInput.targetModel.version}
                onChange={(e) => updateUserInput('targetModel', 'version', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* 约束条件 */}
          <div className="section-group">
            <h3>4. 约束条件 </h3>
            <div className="field-with-label">
              <label>格式约束</label>
              <input
                placeholder="例如：JSON、Markdown等"
                value={userInput.constraints.format}
                onChange={(e) => updateUserInput('constraints', 'format', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>长度约束</label>
              <input
                placeholder="例如：不超过500字"
                value={userInput.constraints.length}
                onChange={(e) => updateUserInput('constraints', 'length', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>风格约束</label>
              <input
                placeholder="例如：正式、幽默等"
                value={userInput.constraints.style}
                onChange={(e) => updateUserInput('constraints', 'style', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>禁止内容</label>
              <input
                placeholder="例如：禁止使用特定词汇"
                value={userInput.constraints.prohibitedContent}
                onChange={(e) => updateUserInput('constraints', 'prohibitedContent', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>用户显式偏好</label>
              <input
                placeholder="用户特别指定的偏好"
                value={userInput.constraints.userPreferences}
                onChange={(e) => updateUserInput('constraints', 'userPreferences', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* 全局生成参数 */}
        <div className="global-params">
          <h3>全局生成参数</h3>
          <div className="param-row">
            <div className="field-with-label">
              <label>探索 vs 收敛程度</label>
              <input
                placeholder="0-1之间的数值"
                value={userInput.globalParams.explorationConvergence}
                onChange={(e) => updateUserInput('globalParams', 'explorationConvergence', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>风险偏好</label>
              <input
                placeholder="安全 / 平衡 / 激进"
                value={userInput.globalParams.riskPreference}
                onChange={(e) => updateUserInput('globalParams', 'riskPreference', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>约束强度</label>
              <input
                placeholder="弱 / 中 / 强"
                value={userInput.globalParams.constraintStrength}
                onChange={(e) => updateUserInput('globalParams', 'constraintStrength', e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className="field-with-label">
              <label>Prompt 期望长度</label>
              <input
                placeholder="例如：200-300字"
                value={userInput.globalParams.expectedLength}
                onChange={(e) => updateUserInput('globalParams', 'expectedLength', e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="input-section-footer">
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : '提交优化会话'}
          </button>
          {isProcessing && (
            <button className="cancel-btn" onClick={cancelOptimization}>
              取消
            </button>
          )}
          {hasResults && !isProcessing && (
            <button className="clear-btn" onClick={handleClear}>
              清空结果
            </button>
          )}
          <span className="submit-hint">
            {isProcessing ? '正在分析中，请稍候...' : '点击提交后，系统将基于以上输入生成分析结果'}
          </span>
        </div>

        {/* 错误显示 */}
        {hasError && (
          <div className="error-summary">
            {Object.entries(error).map(([key, msg]) => (
              <div key={key} className="error-item">{key}: {msg}</div>
            ))}
          </div>
        )}
      </section>

      {/* 二、信息充分性评估 */}
      {sufficiencyOutput && (
        <section className="card">
          <div className="card-title collapsible" onClick={() => toggleCollapse('sufficiency')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="step-badge">二</span>
              <h2>信息充分性评估 <span className="subtitle">Sufficiency Check</span></h2>
            </div>
            <button className="collapse-btn">{collapse.sufficiency ? '收起' : '展开'}</button>
            {loading.sufficiency && <span className="stage-loading">加载中...</span>}
          </div>

          {collapse.sufficiency && (
            <>
              <div className="assessment-summary">
                <span className="badge partial">{sufficiencyOutput.conclusion}</span>
              </div>

              {/* Prompt 结构识别 */}
              <h3 className="section-subtitle">Prompt 结构识别</h3>
              <div className="assessment-dimensions-grid">
                <div className="field-with-label">
                  <label>目标描述段</label>
                  <input value={sufficiencyOutput.structure?.goalSegment || ''} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>行为指令段</label>
                  <input value={sufficiencyOutput.structure?.instructionSegment || ''} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>输出要求段</label>
                  <input value={sufficiencyOutput.structure?.outputSegment || ''} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>隐含假设</label>
                  <input value={sufficiencyOutput.structure?.implicitAssumptions || ''} readOnly className="output-input" />
                </div>
              </div>

              {/* Prompt 完整度等级 */}
              <div className="field-with-label" style={{ marginBottom: '20px' }}>
                <label>Prompt 完整度等级</label>
                <input value={sufficiencyOutput.completenessLevel || ''} readOnly className="output-input" style={{ width: '200px' }} />
              </div>

              {/* 模型能力画像 */}
              <h3 className="section-subtitle">模型能力画像</h3>
              <div className="assessment-dimensions-grid">
                <div className="field-with-label">
                  <label>推理能力强度</label>
                  <input value={sufficiencyOutput.modelCapabilities?.reasoningStrength || ''} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>创造性倾向</label>
                  <input value={sufficiencyOutput.modelCapabilities?.creativityTendency || ''} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>格式遵循能力</label>
                  <input value={sufficiencyOutput.modelCapabilities?.formatFollowing || ''} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>幻觉风险等级</label>
                  <input value={sufficiencyOutput.modelCapabilities?.hallucinationRisk || ''} readOnly className="output-input" />
                </div>
              </div>

              {/* 评估维度 */}
              <h3 className="section-subtitle">评估维度</h3>
              <div className="assessment-dimensions-grid">
                <div className="field-with-label">
                  <label>目标清晰度</label>
                  <input value={sufficiencyOutput.dimensions.clarity} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>成功标准完备度</label>
                  <input value={sufficiencyOutput.dimensions.completeness} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>约束完整度</label>
                  <input value={sufficiencyOutput.dimensions.constraint} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>模型任务匹配度</label>
                  <input value={sufficiencyOutput.dimensions.match} readOnly className="output-input" />
                </div>
              </div>

              {/* 信息缺失清单 & 生成决策 */}
              <h3 className="section-subtitle">信息缺失清单 & 生成决策</h3>
              <div className="assessment-missing-grid">
                <div className="field-with-label">
                  <label>缺失项编号｜缺失字段｜严重级别｜补全提示</label>
                  <textarea rows={4} value={sufficiencyOutput.missingList} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>是否允许生成 Prompt</label>
                  <input value={sufficiencyOutput.decisions.allowGenerate} readOnly className="output-input" />
                  <div style={{ marginTop: '12px' }}>
                    <label>是否强制风险声明</label>
                    <input value={sufficiencyOutput.decisions.riskWarning} readOnly className="output-input" />
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* 三、Prompt 事前分析 */}
      {preAnalysisOutput && (
        <section className="card">
          <div className="card-title collapsible" onClick={() => toggleCollapse('preAnalysis')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="step-badge">三</span>
              <h2>Prompt 事前分析 <span className="subtitle">核心分析层</span></h2>
            </div>
            <button className="collapse-btn">{collapse.preAnalysis ? '收起' : '展开'}</button>
            {loading.preAnalysis && <span className="stage-loading">加载中...</span>}
          </div>

          {collapse.preAnalysis && (
            <>
              <div className="pre-analysis-section">
                <h3 className="section-subtitle">1. 场景拆解</h3>
                <div className="pre-analysis-grid">
                  <div className="field-with-label">
                    <label>显性任务</label>
                    <input value={preAnalysisOutput.taskDecomposition.explicit} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>隐性子任务</label>
                    <input value={preAnalysisOutput.taskDecomposition.implicit} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>任务边界</label>
                    <input value={preAnalysisOutput.taskDecomposition.boundary} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>明确非目标</label>
                    <input value={preAnalysisOutput.taskDecomposition.nonTarget} readOnly className="output-input" />
                  </div>
                </div>
              </div>

              <div className="pre-analysis-section">
                <h3 className="section-subtitle">2. 目标显式化</h3>
                <div className="pre-analysis-grid">
                  <div className="field-with-label">
                    <label>主目标</label>
                    <input value={preAnalysisOutput.objectives.primary} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>次级目标</label>
                    <input value={preAnalysisOutput.objectives.secondary} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>目标优先级</label>
                    <input value={preAnalysisOutput.objectives.priority} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>目标冲突检测</label>
                    <input value={preAnalysisOutput.objectives.conflict} readOnly className="output-input" />
                  </div>
                </div>
              </div>

              <div className="pre-analysis-section">
                <h3 className="section-subtitle">3. 不确定性标注</h3>
                <div className="pre-analysis-grid">
                  <div className="field-with-label">
                    <label>含糊词语</label>
                    <input value={preAnalysisOutput.uncertainty.vagueTerms} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>未充分说明的要求</label>
                    <input value={preAnalysisOutput.uncertainty.underSpecified} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>强模型依赖点</label>
                    <input value={preAnalysisOutput.uncertainty.modelDependent} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>隐含前提标记</label>
                    <input value={preAnalysisOutput.uncertainty.implicitAssumptions} readOnly className="output-input" />
                  </div>
                </div>
              </div>

              <div className="pre-analysis-section">
                <h3 className="section-subtitle">4. 风险预测</h3>
                <div className="pre-analysis-grid risks-grid">
                  <div className="field-with-label">
                    <label>指令忽略风险</label>
                    <input value={preAnalysisOutput.risks.ignoreInstruction} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>输出偏移风险</label>
                    <input value={preAnalysisOutput.risks.outputDeviation} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>幻觉风险</label>
                    <input value={preAnalysisOutput.risks.hallucination} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>过度保守风险</label>
                    <input value={preAnalysisOutput.risks.conservative} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>目标错配风险</label>
                    <input value={preAnalysisOutput.risks.mismatch} readOnly className="output-input" />
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* 四、多策略 Prompt 生成 */}
      {strategiesOutput && (
        <section className="card">
          <div className="card-title collapsible" onClick={() => toggleCollapse('strategies')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="step-badge">四</span>
              <h2>多策略 Prompt 生成 <span className="subtitle">Strategy Set</span></h2>
            </div>
            <button className="collapse-btn">{collapse.strategies ? '收起' : '展开'}</button>
            {loading.strategies && <span className="stage-loading">加载中...</span>}
          </div>

          {collapse.strategies && (
            <div className="strategy-grid">
              {/* Strategy A */}
              <div className="strategy-card">
                <h4>⚡ Strategy A：精确型</h4>
                <div className="field-with-label">
                  <label>策略目标</label>
                  <input value={strategiesOutput.strategies.strategyA.goal} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>指令风格</label>
                  <input value={strategiesOutput.strategies.strategyA.style} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>约束等级</label>
                  <input value={strategiesOutput.strategies.strategyA.constraint} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>生成的 Prompt 文本</label>
                  <textarea rows={3} value={strategiesOutput.strategies.strategyA.prompt} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>适用条件</label>
                  <input value={strategiesOutput.strategies.strategyA.condition} readOnly className="output-input" />
                </div>
              </div>

              {/* Strategy B */}
              <div className="strategy-card">
                <h4>🌀 Strategy B：探索型</h4>
                <div className="field-with-label">
                  <label>策略目标</label>
                  <input value={strategiesOutput.strategies.strategyB.goal} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>自由度等级</label>
                  <input value={strategiesOutput.strategies.strategyB.freedom} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>指令开放性</label>
                  <input value={strategiesOutput.strategies.strategyB.openness} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>生成的 Prompt 文本</label>
                  <textarea rows={3} value={strategiesOutput.strategies.strategyB.prompt} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>风险提示</label>
                  <input value={strategiesOutput.strategies.strategyB.riskNote} readOnly className="output-input" />
                </div>
              </div>

              {/* Strategy C */}
              <div className="strategy-card">
                <h4>🔒 Strategy C：强约束型</h4>
                <div className="field-with-label">
                  <label>策略目标</label>
                  <input value={strategiesOutput.strategies.strategyC.goal} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>硬性约束列表</label>
                  <textarea rows={2} value={strategiesOutput.strategies.strategyC.constraints} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>约束执行方式</label>
                  <input value={strategiesOutput.strategies.strategyC.execution} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>生成的 Prompt 文本</label>
                  <textarea rows={3} value={strategiesOutput.strategies.strategyC.prompt} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>失效模式</label>
                  <textarea rows={2} value={strategiesOutput.strategies.strategyC.failureMode} readOnly className="output-input" />
                </div>
              </div>

              {/* Strategy D */}
              <div className="strategy-card">
                <h4>📊 Strategy D：分析型</h4>
                <div className="field-with-label">
                  <label>推理引导方式</label>
                  <input value={strategiesOutput.strategies.strategyD.goal} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>步骤结构</label>
                  <textarea rows={2} value={strategiesOutput.strategies.strategyD.steps} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>解释要求</label>
                  <textarea rows={2} value={strategiesOutput.strategies.strategyD.explanation} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>生成的 Prompt 文本</label>
                  <textarea rows={3} value={strategiesOutput.strategies.strategyD.prompt} readOnly className="output-input" />
                </div>
              </div>

              {/* Strategy E */}
              <div className="strategy-card optional-card">
                <h4>🎭 Strategy E：角色导向型 <span className="optional">可选</span></h4>
                <div className="field-with-label">
                  <label>角色定义</label>
                  <input value={strategiesOutput.strategies.strategyE.role} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>角色行为约束</label>
                  <input value={strategiesOutput.strategies.strategyE.constraints} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>视角偏向</label>
                  <input value={strategiesOutput.strategies.strategyE.perspective} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>生成的 Prompt 文本</label>
                  <textarea rows={3} value={strategiesOutput.strategies.strategyE.prompt} readOnly className="output-input" />
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 五、指标与问题说明 */}
      {metricsOutput && (
        <section className="card">
          <div className="card-title collapsible" onClick={() => toggleCollapse('metrics')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="step-badge">五</span>
              <h2>指标与问题说明 <span className="subtitle">评估与披露</span></h2>
            </div>
            <button className="collapse-btn">{collapse.metrics ? '收起' : '展开'}</button>
            {loading.metrics && <span className="stage-loading">加载中...</span>}
          </div>

          {collapse.metrics && (
            <>
              <h3 className="section-subtitle">核心指标</h3>
              <div className="metrics-grid">
                <div className="field-with-label">
                  <label>目标清晰度等级</label>
                  <input value={metricsOutput.clarityLevel} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>约束强度等级</label>
                  <input value={metricsOutput.constraintLevel} readOnly className="output-input" />
                </div>
                <div className="field-with-label">
                  <label>探索-收敛位置</label>
                  <input value={metricsOutput.explorationConvergence} readOnly className="output-input" />
                </div>
                <div className="field-with-label span-2">
                  <label>风险偏好摘要</label>
                  <textarea rows={2} value={metricsOutput.riskProfile} readOnly className="output-input" />
                </div>
              </div>

              <h3 className="section-subtitle">已识别信息缺失点</h3>
              <div className="metrics-grid">
                <div className="field-with-label span-2">
                  <label>缺失说明｜潜在影响</label>
                  <textarea rows={2} value={metricsOutput.missingPoints} readOnly className="output-input" />
                </div>
              </div>

              <h3 className="section-subtitle">模型敏感点</h3>
              <div className="metrics-grid">
                <div className="field-with-label span-2">
                  <label>敏感点类型｜影响的 Prompt 区段</label>
                  <textarea rows={2} value={metricsOutput.modelSensitivePoints} readOnly className="output-input" />
                </div>
              </div>

              <h3 className="section-subtitle">可能偏差类型</h3>
              <div className="metrics-grid">
                <div className="field-with-label span-2">
                  <label>偏差名称｜触发条件｜早期预警信号</label>
                  <textarea rows={2} value={metricsOutput.deviationSignals} readOnly className="output-input" />
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* 六、事后解释器 */}
      {postAnalysisOutput && (
        <section className="card">
          <div className="card-title collapsible" onClick={() => toggleCollapse('postAnalysis')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="step-badge">六</span>
              <h2>事后解释器 <span className="subtitle">不依赖执行结果</span></h2>
            </div>
            <button className="collapse-btn">{collapse.postAnalysis ? '收起' : '展开'}</button>
            {loading.postAnalysis && <span className="stage-loading">加载中...</span>}
          </div>

          {collapse.postAnalysis && (
            <div className="post-analysis-main-grid">
              {/* 左侧列 */}
              <div>
                <h3 className="section-subtitle">偏差归因</h3>
                <div className="post-analysis-attribution-grid">
                  <div className="field-with-label">
                    <label>主要原因类别</label>
                    <input value={postAnalysisOutput.attribution.primary} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>Prompt 层问题</label>
                    <textarea rows={2} value={postAnalysisOutput.attribution.promptIssues} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>模型交互问题</label>
                    <textarea rows={2} value={postAnalysisOutput.attribution.interactionIssues} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>用户输入问题</label>
                    <textarea rows={2} value={postAnalysisOutput.attribution.userIssues} readOnly className="output-input" />
                  </div>
                </div>

                <h3 className="section-subtitle" style={{ marginTop: '28px' }}>偏差类型</h3>
                <div className="post-analysis-inner-grid">
                  <div className="field-with-label">
                    <label>输出发散</label>
                    <input value={postAnalysisOutput.deviationTypes.divergence} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>幻觉生成</label>
                    <input value={postAnalysisOutput.deviationTypes.hallucination} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>表现不足</label>
                    <input value={postAnalysisOutput.deviationTypes.underperformance} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>过度约束</label>
                    <input value={postAnalysisOutput.deviationTypes.overConstraint} readOnly className="output-input" />
                  </div>
                </div>
              </div>

              {/* 右侧列 */}
              <div>
                <h3 className="section-subtitle">改进方向</h3>
                <div className="post-analysis-inner-grid">
                  <div className="field-with-label">
                    <label>目标细化</label>
                    <input value={postAnalysisOutput.improvements.refineGoal} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>约束调整</label>
                    <input value={postAnalysisOutput.improvements.adjustConstraint} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>指令重排</label>
                    <input value={postAnalysisOutput.improvements.reorderInstructions} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>策略切换</label>
                    <input value={postAnalysisOutput.improvements.switchStrategy} readOnly className="output-input" />
                  </div>
                </div>

                <h3 className="section-subtitle" style={{ marginTop: '28px' }}>对照解释</h3>
                <div className="post-analysis-comparison-grid">
                  <div className="field-with-label">
                    <label>原 Prompt 片段</label>
                    <textarea rows={2} value={postAnalysisOutput.comparison.original} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>修订后 Prompt 片段</label>
                    <textarea rows={2} value={postAnalysisOutput.comparison.revised} readOnly className="output-input" />
                  </div>
                  <div className="field-with-label">
                    <label>修改差异说明</label>
                    <textarea rows={2} value={postAnalysisOutput.comparison.diff} readOnly className="output-input" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="footer-note">结构化 Prompt 工作流 · 所有字段均为示意，可根据实际调整</div>
    </div>
  );
}
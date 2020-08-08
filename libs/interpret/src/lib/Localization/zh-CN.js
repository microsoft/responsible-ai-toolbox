module.exports = {
  selectPoint: "选择一个点以查看其本地说明",
  defaultClassNames: "类 {0}",
  defaultFeatureNames: "特征 {0}",
  absoluteAverage: "绝对值的平均值",
  predictedClass: "预测类",
  datasetExplorer: "数据集资源管理器",
  dataExploration: "数据集浏览",
  aggregateFeatureImportance: "聚合特征重要性",
  globalImportance: "全局重要性",
  explanationExploration: "解释探索",
  individualAndWhatIf: "单个特征重要性和模拟",
  summaryImportance: "摘要重要性",
  featureImportance: "特征重要性",
  featureImportanceOf: "特征重要性为 {0}",
  perturbationExploration: "小改动探索",
  localFeatureImportance: "本地特征重要性",
  ice: "ICE",
  clearSelection: "清除选定内容",
  feature: "功能:",
  intercept: "截获",
  modelPerformance: "模型性能",
  ExplanationScatter: {
    dataLabel: "数据: {0}",
    importanceLabel: "重要性: {0}",
    predictedY: "预测的 Y",
    index: "索引",
    dataGroupLabel: "数据",
    output: "输出",
    probabilityLabel: "概率: {0}",
    trueY: "真实 Y",
    class: "类:",
    xValue: "X 值:",
    yValue: "Y 值:",
    colorValue: "颜色:",
    count: "项计数"
  },
  CrossClass: {
    label: "交叉类权重:",
    info: "有关跨类计算的信息",
    overviewInfo:
      "多类分类模型为每个类生成一个独立的特征重要性向量。每个类的特征重要性向量说明了哪些特征使类的可能性更高或更低。可以选择如何将每个类特征重要性向量的权重汇总为单个值:",
    absoluteValInfo:
      "绝对值的平均值: 显示所有可能类中特征重要性的总和，除以类的数量",
    predictedClassInfo: "预测类: 显示给定点的预测类的特征重要性值",
    enumeratedClassInfo:
      "枚举的类名: 仅显示所有数据点中指定的类的特征重要性值。",
    close: "关闭",
    crossClassWeights: "跨类权重"
  },
  AggregateImportance: {
    scaledFeatureValue: "缩放的特征值",
    low: "低",
    high: "高",
    featureLabel: "特征: {0}",
    valueLabel: "特征值: {0}",
    importanceLabel: "重要性: {0}",
    predictedClassTooltip: "预测类: {0}",
    trueClassTooltip: "真实类: {0}",
    predictedOutputTooltip: "预测输出: {0}",
    trueOutputTooltip: "真实输出: {0}",
    topKFeatures: "前 K 个特征:",
    topKInfo: "前 k 个重要特征的计算方式",
    predictedValue: "预测值",
    predictedClass: "预测类",
    trueValue: "True 值",
    trueClass: "真实类",
    noColor: "无",
    tooManyRows: "提供的数据集大于此图表可支持的数据集"
  },
  BarChart: {
    classLabel: "类: {0}",
    sortBy: "排序依据",
    noData: "无数据",
    absoluteGlobal: "绝对全局",
    absoluteLocal: "绝对本地",
    calculatingExplanation: "正在计算解释"
  },
  IcePlot: {
    numericError: "必须为数值",
    integerError: "必须为整数",
    prediction: "预测",
    predictedProbability: "预测概率",
    predictionLabel: "预测: {0}",
    probabilityLabel: "概率: {0}",
    noModelError: "请提供 operationalized 模型以在 ICE 绘图中浏览预测。",
    featurePickerLabel: "功能:",
    minimumInputLabel: "最小值:",
    maximumInputLabel: "最大值:",
    stepInputLabel: "步骤:",
    loadingMessage: "正在加载数据...",
    submitPrompt: "提交一个范围以查看 ICE 绘图",
    topLevelErrorMessage: "参数错误",
    errorPrefix: "出现错误: {0}"
  },
  PerturbationExploration: {
    loadingMessage: "正在加载...",
    perturbationLabel: "小改动:"
  },
  PredictionLabel: {
    predictedValueLabel: "预测值: {0}",
    predictedClassLabel: "预测类: {0}"
  },
  Violin: {
    groupNone: "不进行分组",
    groupPredicted: "预测 Y",
    groupTrue: "真实 Y",
    groupBy: "分组依据"
  },
  FeatureImportanceWrapper: {
    chartType: "图表类型:",
    violinText: "小提琴",
    barText: "条形图",
    boxText: "框",
    beehiveText: "Swarm",
    globalImportanceExplanation:
      "全局特征重要性是通过对所有点的特征重要性的绝对值求平均值(L1 规范化)计算出来的。",
    multiclassImportanceAddendum:
      "计算所有类的特征重要性时，所有点都包括在内，不使用任何差异权重。因此，对许多预测为非“A 类”的点具有较大负面重要性的特征将大大提高该特征的“A 类”重要性。"
  },
  Filters: {
    equalComparison: "等于",
    greaterThanComparison: "大于",
    greaterThanEqualToComparison: "大于或等于",
    lessThanComparison: "小于",
    lessThanEqualToComparison: "小于或等于",
    inTheRangeOf: "在以下范围内:",
    categoricalIncludeValues: "包含的值:",
    numericValue: "值",
    numericalComparison: "运算",
    minimum: "最小",
    maximum: "最大",
    min: "最小值: {0}",
    max: "最大值: {0}",
    uniqueValues: "唯一值的数目: {0} 个"
  },
  Columns: {
    regressionError: "回归错误",
    error: "错误",
    classificationOutcome: "分类结果",
    truePositive: "真正",
    trueNegative: "真负",
    falsePositive: "假正",
    falseNegative: "假负",
    dataset: "数据集",
    predictedProbabilities: "预测概率",
    none: "计数"
  },
  WhatIf: {
    closeAriaLabel: "关闭",
    defaultCustomRootName: "第 {0} 行的副本",
    filterFeaturePlaceholder: "搜索特征"
  },
  Cohort: {
    cohort: "队列",
    defaultLabel: "所有数据"
  },
  GlobalTab: {
    helperText:
      "了解影响整体模型预测的前 k 个重要特征(亦称为“全局解释”)。使用滑块可以按降序显示特征重要性值。最多选择三个队列，以并排查看它们的特征重要性值。单击图中的任意特征条，以查看所选特征的值如何影响模型预测。",
    topAtoB: "前 {0}-{1} 个特征",
    datasetCohorts: "数据集队列",
    legendHelpText: "通过单击图例项，在绘图中切换启用/禁用队列。",
    sortBy: "排序方式",
    viewDependencePlotFor: "查看以下特征的相关性绘图:",
    datasetCohortSelector: "选择数据集队列",
    aggregateFeatureImportance: "聚合特征重要性",
    missingParameters: "此选项卡要求提供本地特征重要性参数。",
    weightOptions: "类重要性权重",
    dependencePlotTitle: "依赖关系图",
    dependencePlotHelperText:
      "此依赖关系图显示特征的值与特征在整个队列中的相应重要性之间的关系。",
    dependencePlotFeatureSelectPlaceholder: "选择特征",
    datasetRequired: "依赖关系图需要计算数据集和本地特征重要性数组。"
  },
  CohortBanner: {
    dataStatistics: "数据统计信息",
    datapoints: "{0} 个数据点",
    features: "{0} 个特征",
    filters: "{0} 个筛选器",
    binaryClassifier: "两类分类器",
    regressor: "回归量",
    multiclassClassifier: "多类分类器",
    datasetCohorts: "数据集队列",
    editCohort: "编辑队列",
    duplicateCohort: "复制队列",
    addCohort: "添加队列",
    copy: "副本"
  },
  ModelPerformance: {
    helperText:
      "通过研究预测值和模型性能指标值的分布情况来评估模型的性能。通过查看数据集的不同队列或子组之间的性能比较分析，可以进一步调查模型。沿着 y 值和 x 值选择筛选器可以跨越不同的维度。使用图中的齿轮图标可以更改图类型。",
    modelStatistics: "模型统计信息",
    cohortPickerLabel: "选择要浏览的数据集队列",
    missingParameters: "此选项卡要求提供来自模型的预测值数组。",
    missingTrueY: "除了预测结果之外，模型性能统计信息还要求提供 true 结果"
  },
  Charts: {
    yValue: "Y 值",
    numberOfDatapoints: "数据点数",
    xValue: "X 值",
    rowIndex: "行索引",
    featureImportance: "特征重要性",
    countTooltipPrefix: "计数: {0}",
    count: "计数",
    featurePrefix: "特征",
    importancePrefix: "重要性",
    cohort: "队列",
    howToRead: "如何阅读此图表"
  },
  DatasetExplorer: {
    helperText:
      "通过沿着 X 轴、Y 轴和颜色轴选择不同的筛选器来沿着不同的维度对数据进行切片，浏览数据集统计信息。创建上述数据集队列，以使用筛选器(如预测结果、数据集特征和误差组)分析数据集统计信息。使用图表右上角的齿轮图标可以更改图表类型。",
    colorValue: "颜色值",
    individualDatapoints: "单个数据点",
    aggregatePlots: "聚合绘图",
    chartType: "图表类型",
    missingParameters: "此选项卡要求提供评估数据集。",
    noColor: "无"
  },
  DependencePlot: {
    featureImportanceOf: "特性重要性为",
    placeholder: "单击上面条形图中的特征可以显示它的相关性绘图"
  },
  WhatIfTab: {
    helperText:
      "可以通过单击散点图来选择一个数据点，以在下面查看它的局部特征重要性值(局部解释)和个体条件期望(ICE)图。通过使用右侧的面板来扰乱已知数据点的特征，创建假设模拟数据点。特征重要性值基于许多近似，而不是预测的“原因”。如果因果推理没有严格的数学稳健性，不建议用户在现实生活中根据此工具制定决策。",
    panelPlaceholder: "必须有模型，才能对新的数据点进行预测。",
    cohortPickerLabel: "选择要浏览的数据集队列",
    scatterLegendText: "通过单击图例项，在绘图中切换启用和禁用数据点。",
    realPoint: "实际数据点",
    noneSelectedYet: "尚未选择任何点",
    whatIfDatapoints: "模拟数据点",
    noneCreatedYet: "尚未创建任何点",
    showLabel: "显示:",
    featureImportancePlot: "特征重要性绘图",
    icePlot: "个体条件期望(ICE)图",
    featureImportanceLackingParameters:
      "请提供本地特征重要性，以了解每个特征对各个预测有何影响。",
    featureImportanceGetStartedText: "选择一个点来查看特征重要性",
    iceLackingParameters: "ICE 绘图需要运营模型才能对假设数据点进行预测。",
    IceGetStartedText: "选择一个点或创建一个模拟点来查看 ICE 绘图",
    whatIfDatapoint: "模拟数据点",
    whatIfHelpText:
      "在绘图上选择一个点，或手动输入一个要打乱的已知数据点索引，并另存为新的模拟点。",
    indexLabel: "要打乱的数据索引",
    rowLabel: "第 {0} 行",
    whatIfNameLabel: "模拟数据点名称",
    featureValues: "特征值",
    predictedClass: "预测类:",
    predictedValue: "预测值:",
    probability: "概率:",
    trueClass: "真实类:",
    trueValue: "真实值:",
    "trueValue.comment": "用于回归的实际标签的前缀",
    newPredictedClass: "新的预测类:",
    newPredictedValue: "新的预测值:",
    newProbability: "新概率:",
    saveAsNewPoint: "另存为新点",
    saveChanges: "保存更改",
    loading: "正在加载...",
    classLabel: "类: {0}",
    minLabel: "最小",
    maxLabel: "最大",
    stepsLabel: "步进",
    disclaimer:
      "免责声明:这些是基于许多近似值的解释，而不是预测的“原因”。在无法从数学上进行严格、扎实的因果推理的情况下，不建议用户在现实生活中根据此工具制定决策。",
    missingParameters: "此选项卡要求提供评估数据集。",
    selectionLimit: "最多选择 3 个点",
    classPickerLabel: "类",
    tooltipTitleMany: "前 {0} 个预测类",
    whatIfTooltipTitle: "模拟预测类",
    tooltipTitleFew: "预测类",
    probabilityLabel: "概率",
    deltaLabel: "增量",
    nonNumericValue: "值应为数值",
    icePlotHelperText:
      "ICE 图演示了所选数据点的预测值是如何沿介于最小值和最大值之间的一系列特征值变化的。"
  },
  CohortEditor: {
    selectFilter: "选择筛选器",
    TreatAsCategorical: "视为类别",
    addFilter: "添加筛选器",
    addedFilters: "已添加的筛选器",
    noAddedFilters: "尚未添加筛选器",
    defaultFilterState: "请选择筛选器，以将参数添加到数据集队列。",
    cohortNameLabel: "数据集队列名称",
    cohortNamePlaceholder: "命名你的队列",
    save: "保存",
    delete: "删除",
    cancel: "取消",
    cohortNameError: "缺少队列名称",
    placeholderName: "队列 {0}"
  },
  AxisConfigDialog: {
    select: "选择",
    ditherLabel: "应抖动",
    selectFilter: "选择轴数值",
    selectFeature: "选择特征",
    binLabel: "应用数据装箱",
    TreatAsCategorical: "视为类别",
    numOfBins: "箱数",
    groupByCohort: "按队列分组",
    selectClass: "选择类",
    countHelperText: "点数直方图"
  },
  ValidationErrors: {
    predictedProbability: "预测概率",
    predictedY: "预测 Y",
    evalData: "评估数据集",
    localFeatureImportance: "本地特征重要性",
    inconsistentDimensions: "尺寸不一致。{0} 有尺寸 {1}，而应为 {2}",
    notNonEmpty: "{0} 输入不是非空数组",
    varyingLength: "尺寸不一致。{0} 有长度不同的元素",
    notArray: "{0} 不是数组。应为尺寸 {1} 的数组",
    errorHeader: "有些输入参数不一致，将不会被使用:",
    datasizeWarning:
      "计算数据集过大，无法有效地显示在某些图表中，请添加筛选器以减小队列的大小。",
    datasizeError: "所选队列过大，请添加筛选器以减小队列的大小。",
    addFilters: "添加筛选器"
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: "包含 {0}",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} 和另外 {1} 人"
  },
  Statistics: {
    mse: "均方误差: {0}",
    rSquared: "R 平方: {0}",
    meanPrediction: "平均值预测 {0}",
    accuracy: "准确度: {0}",
    precision: "精准率: {0}",
    recall: "召回率: {0}",
    fpr: "假正率: {0}",
    fnr: "假负率: {0}"
  },
  GlobalOnlyChart: {
    helperText:
      "了解可影响整体模型预测的前 k 个重要特征。使用滑块可按降序显示特征重要性。"
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "这些解释是什么意思?",
    clickHere: "了解更多",
    shapTitle: "Shapley 值",
    shapDescription:
      "此解释器使用 SHAP，这是一种用于解释模型的博弈论方法，其中特征集的重要性是通过边缘化从模型中“隐藏”这些特征来衡量的。若要了解详细信息，请单击下面的链接。",
    limeTitle: "LIME (局部可解释的与模型无关的解释)",
    limeDescription:
      "此解释器使用 LIME，它对模型进行线性近似处理。我们通过执行以下操作来获取解释: 扰乱实例，获取模型预测，并将这些预测用作标签来学习局部保真的稀疏线性模型。此线性模型的权重用作“特征重要性”。若要了解详细信息，请单击下面的链接。",
    mimicTitle: "模仿(全局代理解释)",
    mimicDescription:
      "此解释器基于以下理念: 训练全局代理模型来模仿黑盒模型。全局代理模型是一种本质上可解释的模型，它被训练为尽可能准确地对任何黑盒模型的预测进行近似处理。特征重要性值是基础代理模型(LightGBM、线性回归、随机梯度下降或决策树)的基于模型的特征重要性值",
    pfiTitle: "排列特征重要性(PFI)",
    pfiDescription:
      "此解释器对整个数据集一次一个特征地随机选择数据，并计算相关性能指标的变化幅度(默认性能指标: F1 用于二元分类，含微平均的 F1 分数用于多类分类，平均绝对误差用于回归)。变化越大，相应特征就越重要。此解释器只能解释基础模型的整体行为，而不能解释单个预测。特征的特征重要性值代表了通过扰乱相应特定特征实现的模型性能增量。"
  }
};

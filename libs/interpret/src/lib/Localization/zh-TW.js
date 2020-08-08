module.exports = {
  selectPoint: "選取點以查看其區域解釋",
  defaultClassNames: "類別 {0}",
  defaultFeatureNames: "特徵 {0}",
  absoluteAverage: "絕對值的平均值",
  predictedClass: "預測的類別",
  datasetExplorer: "資料集總管",
  dataExploration: "資料集探索",
  aggregateFeatureImportance: "彙總特徵重要度",
  globalImportance: "全域重要性",
  explanationExploration: "解釋探索",
  individualAndWhatIf: "個別特徵重要度與假設",
  summaryImportance: "彙總重要性",
  featureImportance: "特徵重要度",
  featureImportanceOf: "{0} 的特徵重要度",
  perturbationExploration: "更動探索",
  localFeatureImportance: "區域特徵重要度",
  ice: "ICE",
  clearSelection: "清除選取",
  feature: "功能:",
  intercept: "攔截",
  modelPerformance: "模型效能",
  ExplanationScatter: {
    dataLabel: "資料: {0}",
    importanceLabel: "重要性: {0}",
    predictedY: "預測的 Y",
    index: "索引",
    dataGroupLabel: "資料",
    output: "輸出",
    probabilityLabel: "機率: {0}",
    trueY: "實際的 Y",
    class: "類別: ",
    xValue: "X 值:",
    yValue: "Y 值:",
    colorValue: "色彩:",
    count: "計數"
  },
  CrossClass: {
    label: "跨類別加權:",
    info: "跨類別計算的資訊",
    overviewInfo:
      "多類別模型會為每個類別產生獨立的特徵重要度向量。每個類別的特徵重要度向量會呈現出哪些特徵較有可能或較不可能構成某個類別。您可以選取如何將每個類別特徵重要度向量的權重加總成單一值:",
    absoluteValInfo:
      "絕對值的平均值: 顯示所有可能類別的特徵重要性總和除以類別數目",
    predictedClassInfo: "預測的類別: 為指定點的預測類別顯示特徵重要度值",
    enumeratedClassInfo:
      "列舉的類別名稱: 只顯示所有資料點中指定類別的特徵重要度值。",
    close: "關閉",
    crossClassWeights: "跨類別權數"
  },
  AggregateImportance: {
    scaledFeatureValue: "縮放的特徵值",
    low: "低",
    high: "高",
    featureLabel: "特徵: {0}",
    valueLabel: "特徵值: {0}",
    importanceLabel: "重要性: {0}",
    predictedClassTooltip: "預測的類別: {0}",
    trueClassTooltip: "實際的類別: {0}",
    predictedOutputTooltip: "預測的輸出: {0}",
    trueOutputTooltip: "實際的輸出: {0}",
    topKFeatures: "前 K 個特徵:",
    topKInfo: "計算出前 k 項的方法",
    predictedValue: "預測值",
    predictedClass: "預測的類別",
    trueValue: "True 值",
    trueClass: "實際的類別",
    noColor: "無",
    tooManyRows: "提供的資料集超過這個圖表可支援的大小"
  },
  BarChart: {
    classLabel: "類別: {0}",
    sortBy: "排序依據",
    noData: "沒有資料",
    absoluteGlobal: "絕對全域",
    absoluteLocal: "絕對區域",
    calculatingExplanation: "正在計算解釋"
  },
  IcePlot: {
    numericError: "必須為數值",
    integerError: "必須為整數",
    prediction: "預測",
    predictedProbability: "預測的機率",
    predictionLabel: "預測: {0}",
    probabilityLabel: "機率: {0}",
    noModelError: "請提供經操作化的模型，以在 ICE 繪圖中探索預測。",
    featurePickerLabel: "功能:",
    minimumInputLabel: "最小值:",
    maximumInputLabel: "最大值:",
    stepInputLabel: "步驟:",
    loadingMessage: "正在載入資料...",
    submitPrompt: "提交範圍以檢視 ICE 繪圖",
    topLevelErrorMessage: "參數有誤",
    errorPrefix: "發生的錯誤: {0}"
  },
  PerturbationExploration: {
    loadingMessage: "正在載入...",
    perturbationLabel: "更動:"
  },
  PredictionLabel: {
    predictedValueLabel: "預測的值: {0}",
    predictedClassLabel: "預測的類別: {0}"
  },
  Violin: {
    groupNone: "未分組",
    groupPredicted: "預測的 Y",
    groupTrue: "實際的 Y",
    groupBy: "群組依據"
  },
  FeatureImportanceWrapper: {
    chartType: "圖表類型:",
    violinText: "小提琴",
    barText: "橫條圖",
    boxText: "方塊",
    beehiveText: "群集",
    globalImportanceExplanation:
      "全域特徵重要度的計算方法，是先算出所有點之特徵重要性的絕對值，再計算該絕對值的平均值 (L1 正規化)。 ",
    multiclassImportanceAddendum:
      "計算特徵對所有類別的重要性時，所有點皆會予以計入，而不會使用差異加權。因此，若特徵對於許多預測不屬於「A 類別」的點具有重大負面重要性，將會大幅增加該特徵的「A 類別」重要性。"
  },
  Filters: {
    equalComparison: "等於",
    greaterThanComparison: "大於",
    greaterThanEqualToComparison: "大於或等於",
    lessThanComparison: "小於",
    lessThanEqualToComparison: "小於或等於",
    inTheRangeOf: "介於範圍",
    categoricalIncludeValues: "包含的值:",
    numericValue: "值",
    numericalComparison: "作業",
    minimum: "最小值",
    maximum: "最大值",
    min: "下限: {0}",
    max: "上限: {0}",
    uniqueValues: "# 個唯一值: {0}"
  },
  Columns: {
    regressionError: "迴歸錯誤",
    error: "錯誤",
    classificationOutcome: "分類結果",
    truePositive: "確判為真",
    trueNegative: "確判不為真",
    falsePositive: "誤判為真",
    falseNegative: "誤判不為真",
    dataset: "資料集",
    predictedProbabilities: "預測可能性",
    none: "計數"
  },
  WhatIf: {
    closeAriaLabel: "關閉",
    defaultCustomRootName: "資料列 {0} 的複本",
    filterFeaturePlaceholder: "搜尋特徵"
  },
  Cohort: {
    cohort: "世代",
    defaultLabel: "所有資料"
  },
  GlobalTab: {
    helperText:
      "探索影響整體模型預測的前 k 大重要特徵 (亦即全域解釋)。使用滑桿顯示遞減的特徵重要性度。您最多可以選取三個世代，以並排的方式查看其特徵重要度。按一下圖表中的任一特徵列，查看選取的特徵如何影響模型預測。",
    topAtoB: "前 {0}-{1} 個特徵",
    datasetCohorts: "資料集世代",
    legendHelpText: "按一下圖例項目，即可在繪圖中將世代切換為開啟或關閉。",
    sortBy: "排序依據",
    viewDependencePlotFor: "檢視依存性繪圖:",
    datasetCohortSelector: "選取資料集世代",
    aggregateFeatureImportance: "彙總特徵重要度",
    missingParameters: "此索引標籤需要提供本機特徵重要度參數。",
    weightOptions: "類別重要性權數",
    dependencePlotTitle: "依存性繪圖",
    dependencePlotHelperText:
      "此依序性繪圖顯示跨世代的特徵值以及與特徵對應之重要性間的關聯性。",
    dependencePlotFeatureSelectPlaceholder: "選取特徵",
    datasetRequired: "依存性繪圖需要評估資料集與局部特徵重要度陣列。"
  },
  CohortBanner: {
    dataStatistics: "資料統計資訊",
    datapoints: "{0} 個資料點",
    features: "{0} 個特徵",
    filters: "{0} 個篩選",
    binaryClassifier: "二進位分類器",
    regressor: "迴歸輸入變數",
    multiclassClassifier: "多類別分類器",
    datasetCohorts: "資料集世代",
    editCohort: "編輯世代",
    duplicateCohort: "複製世代",
    addCohort: "新增世代",
    copy: " 複本"
  },
  ModelPerformance: {
    helperText:
      "探索您的預測值分佈與模型效能計量的值，以評估您的模型效能。您可以查看資料集不同世代或子群組之間的效能比較分析，以進一步調查您的模型。選取 y 值及 x 值上的篩選，以穿越不同維度。選取圖表中的齒輪可以變更圖表類型。",
    modelStatistics: "模型統計資料",
    cohortPickerLabel: "選取要探索的資料集世代",
    missingParameters: "此索引標籤需要提供來自模型的預測值陣列。",
    missingTrueY: "除了預測結果以外，模型效能統計資料還需要提供真實結果"
  },
  Charts: {
    yValue: "Y 值",
    numberOfDatapoints: "資料點數目",
    xValue: "X 值",
    rowIndex: "資料列索引",
    featureImportance: "特徵重要度",
    countTooltipPrefix: "計數: {0}",
    count: "計數",
    featurePrefix: "特徵",
    importancePrefix: "重要度",
    cohort: "世代",
    howToRead: "如何閱讀此圖表"
  },
  DatasetExplorer: {
    helperText:
      "依 X、Y 與色彩軸選取不同的篩選並根據不同維度分割資料，以探索您的資料集統計資料。您可在上方建立資料集世代，以使用預測結果、資料集功能與錯誤群組等篩選，分析資料集統計資料。使用圖表右上角的齒輪圖示來變更圖表類型。",
    colorValue: "色彩值",
    individualDatapoints: "個別資料點",
    aggregatePlots: "彙總繪圖",
    chartType: "圖表類型",
    missingParameters: "此索引標籤需要提供評估資料集。",
    noColor: "無"
  },
  DependencePlot: {
    featureImportanceOf: "特徵重要度:",
    placeholder: "按一下上方橫條圖上的特徵以顯示其依存性繪圖"
  },
  WhatIfTab: {
    helperText:
      "您可以按一下散佈圖選取資料點，以檢視其局部特徵重要度 (局部解釋) 與下方的個別條件期望 (ICE) 圖。使用右側的面板，建立假設的假設資料點，以擾動已知的資料點特徵。特徵重要度以許多近似值為基礎，而且不是預測的「原因」。若沒有因果推斷的嚴格數學加強性，不建議使用者根據這個工具做出真實生活的決策。",
    panelPlaceholder: "需要模型才能對新的資料點進行預測。",
    cohortPickerLabel: "選取要探索的資料集世代",
    scatterLegendText: "按一下圖例項目，即可在繪圖中將資料點切換為開啟或關閉。",
    realPoint: "實際資料點",
    noneSelectedYet: "尚未選取任何項目",
    whatIfDatapoints: "假設資料點",
    noneCreatedYet: "尚未建立任何項目",
    showLabel: "顯示:",
    featureImportancePlot: "特徵重要度繪圖",
    icePlot: "個別條件預測 (ICE) 平面圖",
    featureImportanceLackingParameters:
      "提供本機特徵重要度，以了解各個特徵如何影響個別預測。",
    featureImportanceGetStartedText: "選取一個點以檢視特徵重要度",
    iceLackingParameters: "ICE 繪圖需要可操作的模型，才可為假設資料點做預測。",
    IceGetStartedText: "選取一個點或建立一個假設點以檢視 ICE 繪圖",
    whatIfDatapoint: "假設資料點",
    whatIfHelpText:
      "在繪圖上選取一個點，或手動輸入已知的資料點索引以用於擾動，並另存為新的假設點。",
    indexLabel: "要擾動的資料索引",
    rowLabel: "資料列 {0}",
    whatIfNameLabel: "假設資料點名稱",
    featureValues: "特徵值",
    predictedClass: "預測的類別: ",
    predictedValue: "預測值: ",
    probability: "可能性: ",
    trueClass: "True 類別: ",
    trueValue: "True 值: ",
    "trueValue.comment": "迴歸實際標籤的前置詞",
    newPredictedClass: "新的預測類別: ",
    newPredictedValue: "新的預測值: ",
    newProbability: "新的可能性: ",
    saveAsNewPoint: "另存為新點",
    saveChanges: "儲存變更",
    loading: "正在載入...",
    classLabel: "類別: {0}",
    minLabel: "最小值",
    maxLabel: "最大值",
    stepsLabel: "步驟",
    disclaimer:
      "免責聲明: 這些是以許多近似值為依據的解釋，而不是預測的「原因」。若在因果推論上沒有嚴謹的數據穩定性，我們並不建議使用者根據這個工具制定實際決策。",
    missingParameters: "此索引標籤需要提供評估資料集。",
    selectionLimit: "最多選取 3 個點",
    classPickerLabel: "類別",
    tooltipTitleMany: "前 {0} 項預測類別",
    whatIfTooltipTitle: "假設預測類別",
    tooltipTitleFew: "預測的類別",
    probabilityLabel: "可能性",
    deltaLabel: "差異",
    nonNumericValue: "值應為數值",
    icePlotHelperText:
      "ICE 繪圖示範所選資料點的預測值，如何按照最小值與最大值之間的特徵值範圍發生變化。"
  },
  CohortEditor: {
    selectFilter: "選取篩選",
    TreatAsCategorical: "視為類別",
    addFilter: "新增篩選",
    addedFilters: "新增的篩選",
    noAddedFilters: "尚未新增任何篩選",
    defaultFilterState: "選取篩選，以將參數新增到您的資料集世代。",
    cohortNameLabel: "資料集世代名稱",
    cohortNamePlaceholder: "為您的世代命名",
    save: "儲存",
    delete: "刪除",
    cancel: "取消",
    cohortNameError: "缺少世代名稱",
    placeholderName: "世代 {0}"
  },
  AxisConfigDialog: {
    select: "選取",
    ditherLabel: "應抖動",
    selectFilter: "選取您的軸值",
    selectFeature: "選取特徵",
    binLabel: "對資料套用量化",
    TreatAsCategorical: "視為類別",
    numOfBins: "量化數目",
    groupByCohort: "依世代分組",
    selectClass: "選取類別",
    countHelperText: "包含點數的長條圖"
  },
  ValidationErrors: {
    predictedProbability: "預測的可能性",
    predictedY: "預測的 Y",
    evalData: "評估資料集",
    localFeatureImportance: "本機特徵重要度",
    inconsistentDimensions: "維度不一致。{0} 有維度 {1}，必須是 {2}",
    notNonEmpty: "{0} 輸入不是非空白陣列",
    varyingLength: "維度不一致。{0} 具有不同長度的元素",
    notArray: "{0} 不是陣列。必須是維度 {1} 的陣列",
    errorHeader: "某些輸入參數不一致，將不予採用: ",
    datasizeWarning:
      "評估資料集太大，無法有效地顯示在某些圖表中。請新增篩選縮小該世代。 ",
    datasizeError: "選取的世代太大。請新增篩選縮小該世代。",
    addFilters: "新增篩選"
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: " 包括 {0} ",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} 及 {1} 個其他"
  },
  Statistics: {
    mse: "MSE: {0}",
    rSquared: "R 平方: {0}",
    meanPrediction: "平均預測 {0}",
    accuracy: "正確性: {0}",
    precision: "精確度: {0}",
    recall: "召回率: {0}",
    fpr: "FPR: {0}",
    fnr: "FNR: {0}"
  },
  GlobalOnlyChart: {
    helperText:
      "探索影響您整體模型預測的前 k 項重要特徵。使用滑桿顯示遞減的特徵重要度。"
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "這些解釋的意思為何?",
    clickHere: "深入了解",
    shapTitle: "Shapley 值",
    shapDescription:
      "此解釋器使用 SHAP，這是一種從遊戲理論來解釋模型的方法，透過邊緣化將模型中的那些特徵「隱藏」以測量特徵集的重要性。按一下下方連結以深入了解。",
    limeTitle: "LIME (不侷限於特定模型，利用局部可解釋性的解釋方法)",
    limeDescription:
      "此解釋器使用 LIME，這提供了模型的線性近似值。若要取得解釋，請執行下列動作: 擾動該執行個體、取得模型預測，並使用這些預測作為標籤，以了解局部忠實的稀疏線性模型。此線性模型的權數會作為「特徵重要度」。按一下下方連結以深入了解。",
    mimicTitle: "模仿 (全域代理解釋)",
    mimicDescription:
      "此解釋器根據訓練全域代理模型的概念來模仿黑箱模型。全域代理模型為一種內部可解釋的模型，經過訓練能夠盡可能正確地近似任何黑箱模型的預測。特徵重要度是基礎代理模型 (LightGBM、線性迴歸或隨機梯度下降法或決策樹) 的模型特徵重要度",
    pfiTitle: "排列特徵重要度 (PFI)",
    pfiDescription:
      "此解釋器針對整個資料集的資料，隨機地一次解釋一個特徵，並計算偏好變數的效能計量 (預設效能計量: F1 用於二進位分類，具有微平均值的 F1 分數用於多元分類，而平均絕對誤差用於迴歸)。變數越大，特徵就越重要。此解釋器只能解釋基礎模型的整體行為，而不會解釋個別的預測。透過擾動該特定特徵，特徵的特徵重要度代表模型效能中的差異。"
  }
};

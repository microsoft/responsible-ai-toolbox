module.exports = {
  selectPoint: "Selecione um ponto para ver a explicação local",
  defaultClassNames: "Classe {0}",
  defaultFeatureNames: "Funcionalidade {0}",
  absoluteAverage: "Média do valor absoluto",
  predictedClass: "Classe prevista",
  datasetExplorer: "Explorador de Conjunto de Dados",
  dataExploration: "Exploração de Conjuntos de Dados",
  aggregateFeatureImportance: "Importância da Funcionalidade Agregada",
  globalImportance: "Importância Global",
  explanationExploration: "Exploração de Explicação",
  individualAndWhatIf: "Importância da Funcionalidade Individual e Hipótese",
  summaryImportance: "Importância do Resumo",
  featureImportance: "Importância da Funcionalidade",
  featureImportanceOf: "Importância da funcionalidade de {0}",
  perturbationExploration: "Exploração de Perturbação",
  localFeatureImportance: "Importância da Funcionalidade Local",
  ice: "ICE",
  clearSelection: "Limpar seleção",
  feature: "Funcionalidade:",
  intercept: "Intercetar",
  modelPerformance: "Desempenho do Modelo",
  ExplanationScatter: {
    dataLabel: "Dados: {0}",
    importanceLabel: "Importância: {0}",
    predictedY: "Y Previsto",
    index: "Índice",
    dataGroupLabel: "Dados",
    output: "Saída",
    probabilityLabel: "Probabilidade: {0}",
    trueY: "Y Verdadeiro",
    class: "classe: ",
    xValue: "Valor X:",
    yValue: "Valor Y:",
    colorValue: "Cor:",
    count: "Contagem"
  },
  CrossClass: {
    label: "Ponderação entre classes:",
    info: "Informações sobre o cálculo entre classes",
    overviewInfo:
      "Os modelos de multiclasse geram um vetor de importância de funcionalidade independente para cada classe. O vetor de importância de funcionalidade de cada classe demonstra que funcionalidades tornaram uma classe mais provável ou menos provável. Pode selecionar a forma como os pesos dos vetores de importância da funcionalidade por classe são resumidos num valor único:",
    absoluteValInfo:
      "Média do valor absoluto: mostra a soma da importância do recurso em todas as classes possíveis, dividida pelo número de classes",
    predictedClassInfo:
      "Classe prevista: mostra o valor de importância da funcionalidade para a classe prevista de um determinado ponto",
    enumeratedClassInfo:
      "Nomes de classe enumerados: mostra apenas os valores de importância da funcionalidade da classe especificada em todos os pontos de dados.",
    close: "Fechar",
    crossClassWeights: "Pesos entre classes"
  },
  AggregateImportance: {
    scaledFeatureValue: "Valor de Funcionalidade Dimensionado",
    low: "Baixa",
    high: "Elevado",
    featureLabel: "Funcionalidade: {0}",
    valueLabel: "Valor da funcionalidade: {0}",
    importanceLabel: "Importância: {0}",
    predictedClassTooltip: "Classe Prevista: {0}",
    trueClassTooltip: "Classe Verdadeira: {0}",
    predictedOutputTooltip: "Saída Prevista: {0}",
    trueOutputTooltip: "Saída Verdadeira: {0}",
    topKFeatures: "Principais Funcionalidades de K:",
    topKInfo: "Como é calculado o top k",
    predictedValue: "Valor Previsto",
    predictedClass: "Classe Prevista",
    trueValue: "Valor Verdadeiro",
    trueClass: "Classe Verdadeira",
    noColor: "Nenhum",
    tooManyRows:
      "O conjunto de dados fornecido é maior do que este gráfico pode suportar"
  },
  BarChart: {
    classLabel: "Classe: {0}",
    sortBy: "Ordenar por",
    noData: "Sem Dados",
    absoluteGlobal: "Global absoluto",
    absoluteLocal: "Local absoluto",
    calculatingExplanation: "A calcular explicação"
  },
  IcePlot: {
    numericError: "Tem de ser numérico",
    integerError: "Tem de ser um número inteiro",
    prediction: "Previsão",
    predictedProbability: "Probabilidade prevista",
    predictionLabel: "Predição: {0}",
    probabilityLabel: "Probabilidade: {0}",
    noModelError:
      "Forneça um modelo operacionalizado para explorar previsões em gráficos ICE.",
    featurePickerLabel: "Funcionalidade:",
    minimumInputLabel: "Mínimo:",
    maximumInputLabel: "Máximo:",
    stepInputLabel: "Passos:",
    loadingMessage: "A carregar dados...",
    submitPrompt: "Submeter um intervalo para ver um gráfico ICE",
    topLevelErrorMessage: "Erro no parâmetro",
    errorPrefix: "Erro encontrado: {0}"
  },
  PerturbationExploration: {
    loadingMessage: "A carregar...",
    perturbationLabel: "Perturbação:"
  },
  PredictionLabel: {
    predictedValueLabel: "Valor previsto: {0}",
    predictedClassLabel: "Classe prevista: {0}"
  },
  Violin: {
    groupNone: "Sem agrupamento",
    groupPredicted: "Y Previsto",
    groupTrue: "Y Verdadeiro",
    groupBy: "Agrupar por"
  },
  FeatureImportanceWrapper: {
    chartType: "Tipo de gráfico:",
    violinText: "Violino",
    barText: "Barras",
    boxText: "Caixa",
    beehiveText: "Swarm",
    globalImportanceExplanation:
      "A importância global da funcionalidade é calculada através da média do valor absoluto da importância da funcionalidade de todos os pontos (normalização de L1). ",
    multiclassImportanceAddendum:
      'Todos os pontos estão incluídos no cálculo da importância de uma funcionalidade para todas as classes, não é utilizada nenhuma ponderação diferencial. Portanto, uma funcionalidade com importância negativa grande para muitos pontos prevista como não sendo de "Classe A" aumentará imensamente a importância "Classe A" da funcionalidade.'
  },
  Filters: {
    equalComparison: "Igual a",
    greaterThanComparison: "Maior do que",
    greaterThanEqualToComparison: "Maior que ou igual a",
    lessThanComparison: "Menor do que",
    lessThanEqualToComparison: "Menor que ou igual a",
    inTheRangeOf: "No intervalo de",
    categoricalIncludeValues: "Valores incluídos:",
    numericValue: "Valor",
    numericalComparison: "Operação",
    minimum: "Mínimo",
    maximum: "Máximo",
    min: "Mín.: {0}",
    max: "Máx.: {0}",
    uniqueValues: "N.º de valores únicos: {0}"
  },
  Columns: {
    regressionError: "Erro de regressão",
    error: "Erro",
    classificationOutcome: "Resultado da classificação",
    truePositive: "Verdadeiro positivo",
    trueNegative: "Verdadeiro negativo",
    falsePositive: "Falso positivo",
    falseNegative: "Falso negativo",
    dataset: "Conjunto de dados",
    predictedProbabilities: "Probabilidades de predição",
    none: "Contagem"
  },
  WhatIf: {
    closeAriaLabel: "Fechar",
    defaultCustomRootName: "Cópia da linha {0}",
    filterFeaturePlaceholder: "Procurar funcionalidades"
  },
  Cohort: {
    cohort: "Coorte",
    defaultLabel: "Todos os dados"
  },
  GlobalTab: {
    helperText:
      "Explore as funcionalidades mais importantes de tipo top k que afetam as previsões gerais do seu modelo (também designadas por explicação global). Utilize o controlo de deslize para mostrar as importâncias das funcionalidades por ordem descendente. Selecione até três coortes para ver as importâncias das respetivas funcionalidades lado a lado. Clique em qualquer uma das barras de funcionalidades no gráfico, para ver como os valores da funcionalidade selecionada afetam a previsão do modelo.",
    topAtoB: "Principais funcionalidades de {0} a {1}",
    datasetCohorts: "Coortes do conjunto de dados",
    legendHelpText:
      "Ative e desative coortes no desenho ao clicar nos itens da legenda.",
    sortBy: "Ordenar por",
    viewDependencePlotFor: "Ver desenho de dependência para:",
    datasetCohortSelector: "Selecionar uma coorte de conjunto de dados",
    aggregateFeatureImportance: "Importância da Funcionalidade Agregada",
    missingParameters:
      "Este separador requer que o parâmetro de importância da funcionalidade local seja fornecido.",
    weightOptions: "Pesos de importância de classe",
    dependencePlotTitle: "Desenhos de Dependência",
    dependencePlotHelperText:
      "Este desenho de dependência mostra a relação entre o valor de uma funcionalidade e a correspondente importância da funcionalidade numa coorte.",
    dependencePlotFeatureSelectPlaceholder: "Selecionar funcionalidade",
    datasetRequired:
      "Os desenhos de dependência requerem o conjunto de dados de avaliação e a matriz de importância da funcionalidade local."
  },
  CohortBanner: {
    dataStatistics: "Estatísticas de Dados",
    datapoints: "{0} pontos de dados",
    features: "{0} funcionalidades",
    filters: "{0} filtros",
    binaryClassifier: "Classificador Binário",
    regressor: "Regressor",
    multiclassClassifier: "Classificador Multiclasse",
    datasetCohorts: "Coortes do Conjunto de Dados",
    editCohort: "Editar Coorte",
    duplicateCohort: "Coorte Duplicada",
    addCohort: "Adicionar Coorte",
    copy: " cópia"
  },
  ModelPerformance: {
    helperText:
      "Avalie o desempenho do modelo ao explorar a distribuição dos seus valores de predição e os valores das métricas de desempenho do modelo. Pode investigar ainda mais o seu modelo ao observar uma análise comparativa do desempenho em diferentes coortes ou subgrupos do seu conjunto de dados. Selecione filtros ao longo dos valores y e x para cortar em diferentes dimensões. Selecione a engrenagem no gráfico para alterar o tipo de gráfico.",
    modelStatistics: "Estatísticas do Modelo",
    cohortPickerLabel:
      "Selecionar uma coorte de conjunto de dados para explorar",
    missingParameters:
      "Este separador requer a matriz de valores previstos do modelo seja fornecida.",
    missingTrueY:
      "As estatísticas de desempenho do modelo requerem que os resultados reais sejam fornecidos para além dos resultados previstos"
  },
  Charts: {
    yValue: "Valor Y",
    numberOfDatapoints: "Número de pontos de dados",
    xValue: "Valor X",
    rowIndex: "Índice de linha",
    featureImportance: "Importância da funcionalidade",
    countTooltipPrefix: "Contagem: {0}",
    count: "Contagem",
    featurePrefix: "Funcionalidade",
    importancePrefix: "Importância",
    cohort: "Coorte",
    howToRead: "Como ler este gráfico"
  },
  DatasetExplorer: {
    helperText:
      "Explore as estatísticas do conjunto de dados, selecionando filtros diferentes ao longo do eixo X, Y e cor para cortar os seus dados ao longo de diferentes dimensões. Crie coortes de conjunto de dados acima para analisar estatísticas de conjunto de dados com filtros como, por exemplo, resultados previstos, funcionalidades de conjunto de dados e grupos de erro. Utilize o ícone de engrenagem no canto superior direito do gráfico para alterar os tipos de gráficos.",
    colorValue: "Valor da cor",
    individualDatapoints: "Pontos de dados individuais",
    aggregatePlots: "Desenhos agregados",
    chartType: "Tipo de gráfico",
    missingParameters:
      "Este separador requer um conjunto de dados de avaliação seja fornecido.",
    noColor: "Nenhum"
  },
  DependencePlot: {
    featureImportanceOf: "Importância da funcionalidade de",
    placeholder:
      "Clicar numa funcionalidade no gráfico de barras acima para mostrar o desenho de dependência"
  },
  WhatIfTab: {
    helperText:
      'Pode selecionar um ponto de dados clicando no gráfico de dispersão para ver os seus valores de importância de funcionalidade local (explicação local) e o gráfico de expectativa condicional individual (ICE) abaixo. Crie um ponto de dados hipotético, utilizando o painel à direito para funcionalidades de perturbação de um ponto de dados conhecido. Os valores de importância da funcionalidade baseiam-se em muitas aproximações e não são a "causa" das previsões. Sem uma robustez matemática rigorosa da inferência causal, não aconselhamos os utilizadores a tomarem decisões da vida real com base nesta ferramenta.',
    panelPlaceholder:
      "É necessário um modelo para fazer predições para novos pontos de dados.",
    cohortPickerLabel:
      "Selecionar uma coorte de conjunto de dados para explorar",
    scatterLegendText:
      "Ative e desative pontos de dados no desenho ao clicar nos itens da legenda.",
    realPoint: "Pontos de dados reais",
    noneSelectedYet: "Ainda não foi selecionado um",
    whatIfDatapoints: "Pontos de dados de hipótese",
    noneCreatedYet: "Ainda não foi criado um",
    showLabel: "Mostrar:",
    featureImportancePlot: "Desenho da importância da funcionalidade",
    icePlot: "Desenho de expectativa condicional individual (ICE)",
    featureImportanceLackingParameters:
      "Forneça importâncias de características locais para ver como cada característica afeta as previsões individuais.",
    featureImportanceGetStartedText:
      "Selecionar um ponto para ver a importância da funcionalidade",
    iceLackingParameters:
      "Os desenhos de ICE requerem um modelo operacionalizado para fazer previsões para pontos de dados hipotéticos.",
    IceGetStartedText:
      "Selecionar um ponto ou criar um ponto de Hipótese para ver desenhos ICE",
    whatIfDatapoint: "Ponto de dados de hipótese",
    whatIfHelpText:
      "Selecione um ponto no desenho ou introduza manualmente um índice de pontos de dados conhecido para transformar e guardar como um novo ponto de Hipótese.",
    indexLabel: "Índice de dados para transformar",
    rowLabel: "Linha {0}",
    whatIfNameLabel: "Nome do ponto de dados de hipótese",
    featureValues: "Valores da funcionalidade",
    predictedClass: "Classe prevista: ",
    predictedValue: "Valor previsto: ",
    probability: "Probabilidade: ",
    trueClass: "Classe verdadeira: ",
    trueValue: "Valor verdadeiro: ",
    "trueValue.comment": "prefixo da etiqueta real para regressão",
    newPredictedClass: "Nova classe prevista: ",
    newPredictedValue: "Novo valor previsto: ",
    newProbability: "Nova probabilidade: ",
    saveAsNewPoint: "Guardar como novo ponto",
    saveChanges: "Guardar alterações",
    loading: "A carregar...",
    classLabel: "Classe: {0}",
    minLabel: "Mín.",
    maxLabel: "Máx.",
    stepsLabel: "Passos",
    disclaimer:
      'Exclusão de responsabilidade: Estas são explicações que se baseiam em diversas aproximações e não são a "causa" das predições. Sem uma robustez matemática rigorosa da inferência causal, não aconselhamos os utilizadores a tomarem decisões da vida real com base nesta ferramenta.',
    missingParameters:
      "Este separador requer um conjunto de dados de avaliação seja fornecido.",
    selectionLimit: "Máximo de 3 pontos selecionados",
    classPickerLabel: "Classe",
    tooltipTitleMany: "{0} classes previstas principais",
    whatIfTooltipTitle: "Classes previstas por hipóteses",
    tooltipTitleFew: "Classes previstas",
    probabilityLabel: "Probabilidade",
    deltaLabel: "Delta",
    nonNumericValue: "O valor deve ser numérico",
    icePlotHelperText:
      "Os gráficos ICE demonstram como os valores de previsão do ponto de dados selecionados se alteram ao longo de um intervalo de valores de funcionalidades, entre um valor mínimo e máximo."
  },
  CohortEditor: {
    selectFilter: "Selecionar Filtro",
    TreatAsCategorical: "Tratar como categórico",
    addFilter: "Adicionar Filtro",
    addedFilters: "Filtros adicionados",
    noAddedFilters: "Ainda não foi adicionado nenhum filtro",
    defaultFilterState:
      "Selecione um filtro para adicionar parâmetros à coorte do conjunto de dados.",
    cohortNameLabel: "Nome da coorte do conjunto de dados",
    cohortNamePlaceholder: "Atribuir nome à coorte",
    save: "Guardar",
    delete: "Eliminar",
    cancel: "Cancelar",
    cohortNameError: "Nome de coorte em falta",
    placeholderName: "Coorte {0}"
  },
  AxisConfigDialog: {
    select: "Selecionar",
    ditherLabel: "Deve compor cores",
    selectFilter: "Selecionar valor do eixo",
    selectFeature: "Selecionar Funcionalidade",
    binLabel: "Aplicar discretização aos dados",
    TreatAsCategorical: "Tratar como categórico",
    numOfBins: "Número de discretizações",
    groupByCohort: "Grupo por coorte",
    selectClass: "Selecionar classe",
    countHelperText: "Um histograma do número de pontos"
  },
  ValidationErrors: {
    predictedProbability: "Probabilidade prevista",
    predictedY: "Y previsto",
    evalData: "Conjunto de dados de avaliação",
    localFeatureImportance: "Importância da funcionalidade local",
    inconsistentDimensions:
      "Dimensões inconsistentes. {0} tem dimensões {1}, previstas {2}",
    notNonEmpty: "A entrada {0} não uma matriz não vazia",
    varyingLength:
      "Dimensões inconsistentes. {0} tem elementos de comprimento variado",
    notArray: "{0} não uma matriz. Matriz esperada de dimensão {1}",
    errorHeader:
      "Alguns parâmetros de entrada são inconsistentes e não serão utilizados: ",
    datasizeWarning:
      "O conjunto de dados de avaliação é demasiado grande para ser exibido eficazmente em alguns gráficos. Adicione filtros para diminuir o tamanho da coorte. ",
    datasizeError:
      "A coorte selecionada é demasiado grande. Adicione filtros para diminuir o tamanho da coorte.",
    addFilters: "Adicionar filtros"
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: " inclui {0} ",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} e {1} outros"
  },
  Statistics: {
    mse: "MSE: {0}",
    rSquared: "R-quadrado: {0}",
    meanPrediction: "Previsão média {0}",
    accuracy: "Precisão: {0}",
    precision: "Precisão: {0}",
    recall: "Revocação: {0}",
    fpr: "FPR: {0}",
    fnr: "FNR: {0}"
  },
  GlobalOnlyChart: {
    helperText:
      "Explore as funcionalidades importantes de top k que afetam as suas predições de modelo globais. Utilize o controlo de deslize para mostrar as importâncias das funcionalidades por ordem descendente."
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "O que significam estas explicações?",
    clickHere: "Saiba mais",
    shapTitle: "Valores de Shapley",
    shapDescription:
      'Este explicador utiliza o SHAP, que é uma abordagem teórica de jogos para explicar os modelos, em que a importância dos conjuntos de funcionalidades é medida por "ocultar" essas funcionalidades do modelo através de marginalização. Clique na ligação abaixo para saber mais.',
    limeTitle: "LIME (Explicações Agnósticas de Modelo Interpretativo Local)",
    limeDescription:
      'Este explicador utiliza LIME, que proporciona uma aproximação linear do modelo. Para obter uma explicação, fazemos o seguinte: perturbar a instância, obter previsões de modelos e utilizar estas previsões como etiquetas para aprender um modelo linear disperso, que é localmente fiel. Os pesos deste modelo linear são utilizados como "funcionalidades importantes". Clique na ligação abaixo para saber mais.',
    mimicTitle: "Simular (Explicações Globais de Substituição)",
    mimicDescription:
      "Este explicador baseia-se na ideia de formar modelos de substituição globais para simular modelos blackbox. Um modelo de substituição global é um modelo intrinsecamente interpretável, que é formado para aproximar as previsões de qualquer modelo de caixa preta com a maior precisão possível. Os valores de importância da característica são valores de importância de funcionalidade baseados no modelo do seu modelo de substituição subjacente (LightGBM, ou Regressão Linear, ou Descida de Gradiente Stochastic, ou Árvore de Decisões)",
    pfiTitle: "Importância da Funcionalidade de Permutação (PFI)",
    pfiDescription:
      "Este explicador baralha aleatoriamente dados uma funcionalidade de cada vez, para todo o conjunto de dados e calcula quanto é a métrica de desempenho das alterações de interesse (métricas de desempenho predefinidas: F1 para classificação binária, Pontuação F1 com micro média para classificação multiclasse e erro absoluto médio para regressão). Quanto maior for a alteração, mais importante é a funcionalidade. Este explicador apenas pode explicar o comportamento geral do modelo subjacente, mas não explica previsões individuais. O valor de importância de uma funcionalidade representa o delta no desempenho do modelo, perturbando essa funcionalidade em particular."
  }
};

module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  defaultClassNames: "Classe {0}",
  defaultFeatureNames: "Recurso confidencial {0}",
  defaultSingleFeatureName: "Recurso confidencial",
  defaultCustomMetricName: "Métrica personalizada {0}",
  accuracyTab: "Equidade no Desempenho",
  opportunityTab: "Equidade na Oportunidade",
  modelComparisonTab: "Comparação de modelo",
  tableTab: "Exibição de Detalhes",
  dataSpecifications: "Estatísticas de dados",
  attributes: "Atributos",
  singleAttributeCount: "1 recurso confidencial",
  attributesCount: "{0} recursos confidenciais",
  instanceCount: "{0} instâncias",
  close: "Fechar",
  calculating: "Calculando...",
  accuracyMetricLegacy: "Métrica de desempenho",
  errorOnInputs:
    "Erro com a entrada. Recursos confidenciais precisam ser valores categóricos neste momento. Mapeie valores para as categorias compartimentalizadas e tente novamente.",
  Accuracy: {
    header: "Como deseja medir o desempenho?",
    modelMakes: "realizado por modelo",
    modelsMake: "realizado por modelos",
    body:
      "Os seus dados contêm {0} rótulos e as suas previsões de {2} {1}. Com base nessas informações, recomendamos as métricas a seguir. Selecione uma métrica na lista.",
    binaryClassifier: "classificador binário",
    probabalisticRegressor: "regressor de probit",
    regressor: "regressor",
    binary: "binário",
    continuous: "contínuo"
  },
  Parity: {
    header: "Equidade medida em termos de disparidade",
    body:
      "As métricas de disparidade quantificam a variação do comportamento do seu modelo nos recursos selecionados. Há dois tipos de métricas de disparidade: mais em breve...."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Documentação"
  },
  Footer: {
    back: "Voltar",
    next: "Avançar"
  },
  Intro: {
    welcome: "Bem-vindo(a) a",
    fairlearnDashboard: "Painel do Fairlearn",
    introBody:
      "O painel do Fairlearn permite que você avalie as compensações entre o desempenho e a equidade dos seus modelos",
    explanatoryStep:
      "Para configurar a avaliação, é necessário especificar um recurso confidencial e uma métrica de desempenho.",
    getStarted: "Introdução",
    features: "Recursos confidenciais",
    featuresInfo:
      "Recursos confidenciais são usados para dividir os seus dados em grupos. A equidade do seu modelo nesses grupos é medida por métricas de disparidade. As métricas de disparidade quantificam o quanto o comportamento do modelo varia nesses grupos.",
    accuracy: "Métrica de desempenho",
    accuracyInfo:
      "As métricas de desempenho são usadas para avaliar a qualidade geral do seu modelo, bem como a qualidade do seu modelo em cada grupo. A diferença entre os valores extremos da métrica de desempenho nos grupos é relatada como a disparidade no desempenho."
  },
  ModelComparison: {
    title: "Comparação de modelo",
    howToRead: "Como ler este gráfico",
    lower: "menor",
    higher: "maior",
    howToReadText:
      "Este gráfico representa cada um dos modelos de {0} como um ponto selecionável. O eixo x representa {1}, no qual {2} é melhor. O eixo y representa a disparidade, na qual um valor menor é melhor.",
    insights: "Insights",
    insightsText1: "O gráfico mostra {0} e a disparidade de modelos de {1}.",
    insightsText2:
      "{0} tem um intervalo de {1} a {2}. A disparidade tem um intervalo de {3} a {4}.",
    insightsText3:
      "O modelo mais preciso atinge {0} de {1} e uma disparidade de {2}.",
    insightsText4:
      "O modelo com menor disparidade atinge {0} de {1} e uma disparidade de {2}.",
    disparityInOutcomes: "Disparidade nas previsões",
    disparityInAccuracy: "A disparidade no {0}",
    howToMeasureDisparity: "Como deve ser medida a disparidade?"
  },
  Report: {
    modelName: "Modelo {0}",
    title: "Disparidade no desempenho",
    globalAccuracyText: "É o {0} geral",
    accuracyDisparityText: "É a disparidade em {0}",
    editConfiguration: "Editar a configuração",
    backToComparisons: "Exibição multimodelo",
    outcomesTitle: "Disparidade nas previsões",
    minTag: "Mín.",
    maxTag: "Máx.",
    groupLabel: "Subgrupo",
    underestimationError: "Subprevisão",
    underpredictionExplanation: "(previsto = 0, verdadeiro = 1)",
    overpredictionExplanation: "(previsto = 1, verdadeiro = 0)",
    overestimationError: "Sobreprevisão",
    classificationOutcomesHowToRead:
      "O gráfico de barras mostra a taxa de seleção em cada grupo, o que significa a fração de pontos classificados como 1.",
    regressionOutcomesHowToRead:
      "Os gráficos de caixa mostram a distribuição de previsões em cada grupo. Os pontos de dados individuais estão sobrepostos na parte superior.",
    classificationAccuracyHowToRead1:
      "O gráfico de barras mostra a distribuição de erros em cada grupo.",
    classificationAccuracyHowToRead2:
      "Os erros são divididos em erros de sobreprevisão (prever 1 quando o rótulo verdadeiro é 0) e erros de subprevisão (prever 0 quando o rótulo verdadeiro é 1).",
    classificationAccuracyHowToRead3:
      "As taxas relatadas são obtidas ao dividir o número de erros pelo tamanho geral do grupo.",
    probabilityAccuracyHowToRead1:
      "O gráfico de barras mostra um erro absoluto médio em cada grupo, dividido em sobreprevisão e subprevisão.",
    probabilityAccuracyHowToRead2:
      "Em cada exemplo, medimos a diferença entre a previsão e o rótulo. Se for positiva, nós a chamaremos de sobreprevisão, e se for negativa, nós a chamaremos de subprevisão.",
    probabilityAccuracyHowToRead3:
      "Relatamos a soma de erros de sobreprevisão e a soma de erros de subprevisão divididas pelo tamanho do grupo geral.",
    regressionAccuracyHowToRead:
      "O erro é a diferença entre a previsão e o rótulo. Os gráficos de caixa mostram a distribuição de erros em cada grupo. Os pontos de dados individuais estão sobrepostos na parte superior.",
    distributionOfPredictions: "Distribuição de previsões",
    distributionOfErrors: "Distribuição de erros",
    tooltipPrediction: "Previsão: {0}",
    tooltipError: "Erro: {0}"
  },
  Feature: {
    header:
      "Junto com quais recursos você deseja avaliar a equidade do seu modelo?",
    body:
      "A equidade é avaliada em termos de disparidades no comportamento do modelo. Vamos dividir os seus dados de acordo com os valores de cada recurso selecionado e avaliar como a métrica de desempenho e as previsões do modelo diferem nessas divisões.",
    learnMore: "Saiba mais",
    summaryCategoricalCount: "Este recurso tem {0} valores exclusivos",
    summaryNumericCount:
      "Este recurso numérico varia de {0} a {1} e é agrupado em {2} compartimentos.",
    showCategories: "Mostrar tudo",
    hideCategories: "Recolher",
    categoriesOverflow: "   e {0} categorias adicionais",
    editBinning: "Editar grupos",
    subgroups: "Subgrupos"
  },
  Metrics: {
    accuracyScore: "Precisão",
    precisionScore: "Precisão",
    recallScore: "Recall",
    zeroOneLoss: "Perda zero-um",
    specificityScore: "Pontuação de especificidade",
    missRate: "Taxa de erros",
    falloutRate: "Taxa de fallout",
    maxError: "Máximo de erros",
    meanAbsoluteError: "Erro absoluto médio",
    meanSquaredError: " MSE (erro quadrático médio)",
    meanSquaredLogError: "Erro logarítmico quadrático médio",
    medianAbsoluteError: "Erro absoluto mediano",
    average: "Previsão média",
    selectionRate: "Taxa de seleção",
    overprediction: "Sobreprevisão",
    underprediction: "Subprevisão",
    r2_score: "Pontuação de R-quadrado",
    rms_error: "RMSE (raiz do erro quadrático médio)",
    auc: "Área abaixo da curva do ROC",
    balancedRootMeanSquaredError: "RMSE equilibrado",
    balancedAccuracy: "Precisão balanceada",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription:
      "A fração de pontos de dados classificados corretamente.",
    precisionDescription:
      "A fração de pontos de dados classificados corretamente entre aqueles classificados como 1.",
    recallDescription:
      "A fração de pontos de dados classificados corretamente entre aqueles cujo rótulo verdadeiro é 1. Nomes alternativos: taxa de verdadeiro positivo, confidencialidade.",
    rmseDescription: "Raiz quadrada da média de erros quadráticos.",
    mseDescription: "A média de erros quadráticos.",
    meanAbsoluteErrorDescription:
      "A média de valores absolutos de erros. Mais robusto para exceções do que para MSE.",
    r2Description: "A fração de variância nos rótulos explicada pelo modelo.",
    aucDescription:
      "A qualidade das previsões, exibidas como pontuações, ao separar exemplos positivos de exemplos negativos.",
    balancedRMSEDescription:
      "Exemplos positivos e negativos são ponderados novamente para que tenham o peso total igual. Adequado se os dados subjacentes forem altamente desequilibrados.",
    balancedAccuracyDescription:
      "Exemplos positivos e negativos são ponderados novamente para que tenham o peso total igual. Adequado se os dados subjacentes forem altamente desequilibrados.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Configurar compartimentos",
    makeCategorical: "Tratar como categórico",
    save: "Salvar",
    cancel: "Cancelar",
    numberOfBins: "Número de compartimentos:",
    categoryHeader: "Valores de compartimento:"
  }
};

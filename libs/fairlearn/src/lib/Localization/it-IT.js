module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  defaultClassNames: "Classe {0}",
  defaultFeatureNames: "Caratteristica sensibile {0}",
  defaultSingleFeatureName: "Caratteristica sensibile",
  defaultCustomMetricName: "Metrica personalizzata {0}",
  accuracyTab: "Equità nelle prestazioni",
  opportunityTab: "Equità nelle opportunità",
  modelComparisonTab: "Confronto tra modelli",
  tableTab: "Visualizzazione dettagli",
  dataSpecifications: "Statistiche dati",
  attributes: "Attributi",
  singleAttributeCount: "1 caratteristica sensibile",
  attributesCount: "{0} caratteristiche sensibili",
  instanceCount: "{0} istanze",
  close: "Chiudi",
  calculating: "Calcolo...",
  accuracyMetric: "Metrica delle prestazioni",
  errorOnInputs:
    "Errore con input. Le caratteristiche sensibili devono essere al momento valori categorici. Eseguire il mapping dei valori alle categorie di cui è stato effettuato il binning e riprovare.",
  Accuracy: {
    header: "Come si vogliono misurare le prestazioni?",
    modelMakes: "il modello crea",
    modelsMake: "i modelli creano",
    body:
      "I dati contengono etichette di tipo {0} e {2} stime con {1}. In base a queste informazioni, è consigliabile usare le metriche seguenti. Selezionare una metrica dall'elenco.",
    binaryClassifier: "classificatore binario",
    probabalisticRegressor: "regressore probit",
    regressor: "regressore",
    binary: "binario",
    continuous: "continuo",
  },
  Parity: {
    header: "Equità misurata in termini di disparità",
    body:
      "Le metriche di disparità quantificano la variazione del comportamento del modello in tutte le funzionalità selezionate. Esistono due tipi di metriche di disparità: altro da aggiungere....",
  },
  Header: {
    title: "Fairlearn",
    documentation: "Documentazione",
  },
  Footer: {
    back: "Indietro",
    next: "Avanti",
  },
  Intro: {
    welcome: "Benvenuti in",
    fairlearnDashboard: "Dashboard Fairlearn",
    introBody: "Il dashboard Fairlearn consente di valutare i compromessi tra prestazioni ed equità dei modelli",
    explanatoryStep:
      "Per configurare la valutazione, è necessario specificare una caratteristica sensibile e una metrica delle prestazioni.",
    getStarted: "Attività iniziali",
    features: "Caratteristiche sensibili",
    featuresInfo:
      "Le caratteristiche sensibili vengono usate per suddividere i dati in gruppi. L'equità del modello in questi gruppi viene misurata con le metriche di disparità. Le metriche di disparità quantificano quanto varia il comportamento del modello in questi gruppi.",
    accuracy: "Metrica delle prestazioni",
    accuracyInfo:
      "Le metriche delle prestazioni vengono usate per valutare la qualità complessiva del modello e la qualità del modello in ogni gruppo. La differenza tra i valori estremi della metrica delle prestazioni nei gruppi viene indicata come disparità nelle prestazioni.",
  },
  ModelComparison: {
    title: "Confronto tra modelli",
    howToRead: "Come leggere questo grafico",
    lower: "più basso",
    higher: "più alto",
    howToReadText:
      "Questo grafico rappresenta ciascuno dei {0} modelli come punto selezionabile. L'asse x rappresenta {1}, con un valore {2} come valore migliore. L'asse y rappresenta la disparità, con un valore più basso come valore migliore.",
    insights: "Informazioni dettagliate",
    insightsText1: "Il grafico mostra {0} e la disparità di {1} modelli.",
    insightsText2: "{0} varia da {1} a {2}. La disparità varia da {3} a {4}.",
    insightsText3: "Il modello più accurato raggiunge {0} di {1} e una disparità di {2}.",
    insightsText4: "Il modello con disparità più bassa raggiunge {0} di {1} e una disparità di {2}.",
    disparityInOutcomes: "Disparità nelle previsioni",
    disparityInAccuracy: "Disparità in {0}",
    howToMeasureDisparity: "Come misurare la disparità?",
  },
  Report: {
    modelName: "Modello {0}",
    title: "Disparità nelle prestazioni",
    globalAccuracyText: "{0} in generale",
    accuracyDisparityText: "Disparità in {0}",
    editConfiguration: "Modifica configurazione",
    backToComparisons: "Vista multimodello",
    outcomesTitle: "Disparità nelle previsioni",
    minTag: "Min",
    maxTag: "Max",
    groupLabel: "Sottogruppo",
    underestimationError: "Sottostima",
    underpredictionExplanation: "(previsto = 0, vero = 1)",
    overpredictionExplanation: "(previsto = 1, vero = 0)",
    overestimationError: "Sovrastima",
    classificationOutcomesHowToRead:
      "Il grafico a barre mostra il tasso di selezione in ogni gruppo, ovvero la frazione dei punti classificati come 1.",
    regressionOutcomesHowToRead:
      "I box plot mostrano la distribuzione delle previsioni in ogni gruppo. I singoli punti dati sono sovrapposti in alto.",
    classificationAccuracyHowToRead1: "Il grafico a barre mostra la distribuzione degli errori in ogni gruppo.",
    classificationAccuracyHowToRead2:
      "Gli errori vengono suddivisi in errori di sovrastima (previsione di 1 quando l'etichetta vero è 0) ed errori di sottostima (previsione di 0 quando l'etichetta vero è 1).",
    classificationAccuracyHowToRead3:
      "Le percentuali indicate si ottengono dividendo il numero di errori per le dimensioni complessive del gruppo.",
    probabilityAccuracyHowToRead1:
      "Il grafico a barre mostra l'errore assoluto medio in ogni gruppo, suddiviso in sovrastima e sottostima.",
    probabilityAccuracyHowToRead2:
      "In ogni esempio, viene misurata la differenza tra la previsione e l'etichetta. Se è positiva, viene definita sovrastima e se è negativa, viene definita sottostima.",
    probabilityAccuracyHowToRead3:
      "Viene riportata la somma degli errori di sovrastima e la somma degli errori di sottostima divisi per le dimensioni complessive del gruppo.",
    regressionAccuracyHowToRead:
      "Errore indica la differenza tra la previsione e l'etichetta. I box plot mostrano la distribuzione degli errori in ogni gruppo. I singoli punti dati sono sovrapposti in alto.",
    distributionOfPredictions: "Distribuzione delle previsioni",
    distributionOfErrors: "Distribuzione degli errori",
    tooltipPrediction: "Previsione: {0}",
    tooltipError: "Errore: {0}",
  },
  Feature: {
    header: "Con quali funzionalità si vuole valutare l'equità del modello?",
    body:
      "L'equità viene valutata in termini di disparità nel comportamento del modello. I dati verranno suddivisi in base ai valori di ogni funzionalità selezionata e verrà valutato il modo in cui le previsioni e la metrica delle prestazioni del modello differiscono tra queste suddivisioni.",
    learnMore: "Altre informazioni",
    summaryCategoricalCount: "Questa funzionalità ha {0} valori univoci",
    summaryNumericCount: "Questa funzionalità numerica varia da {0} a {1} ed è raggruppata in {2} bin.",
    showCategories: "Mostra tutto",
    hideCategories: "Comprimi",
    categoriesOverflow: "   e {0} categorie aggiuntive",
    editBinning: "Modifica gruppi",
    subgroups: "Sottogruppi",
  },
  Metrics: {
    accuracyScore: "Accuratezza",
    precisionScore: "Precisione",
    recallScore: "Richiama",
    zeroOneLoss: "Perdita zero-uno",
    specificityScore: "Punteggio di specificità",
    missRate: "Frequenza di fallimento",
    falloutRate: "Tasso di ricaduta",
    maxError: "Errore massimo",
    meanAbsoluteError: "Errore assoluto medio",
    meanSquaredError: " MSE (errore quadratico medio)",
    meanSquaredLogError: "Errore logaritmico quadratico medio",
    medianAbsoluteError: "Errore assoluto mediano",
    average: "Previsione media",
    selectionRate: "Tasso di selezione",
    overprediction: "Sovrastima",
    underprediction: "Sottostima",
    r2_score: "Punteggio R quadrato",
    rms_error: "RMSE (radice dell'errore quadratico medio)",
    auc: "Area sotto la curva ROC",
    balancedRootMeanSquaredError: "RMSE bilanciato",
    balancedAccuracy: "Accuratezza bilanciata",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription: "Frazione dei punti dati classificati correttamente.",
    precisionDescription: "Frazione dei punti dati classificati correttamente tra quelli classificati come 1.",
    recallDescription:
      "Frazione dei punti dati classificati correttamente tra quelli la cui etichetta vero è 1. Nomi alternativi: percentuale di veri positivi, sensibilità.",
    rmseDescription: "Radice quadrata della media degli errori quadratici.",
    mseDescription: "Media degli errori quadratici.",
    meanAbsoluteErrorDescription:
      "Media dei valori assoluti degli errori. Più affidabile per gli outlier rispetto a MSE.",
    r2Description: "Frazione della varianza nelle etichette spiegata dal modello.",
    aucDescription:
      "Qualità delle previsioni, visualizzate come punteggi, nel separare esempi positivi da esempi negativi.",
    balancedRMSEDescription:
      "Gli esempi positivi e negativi vengono riponderati in modo da avere un peso totale uguale. Adatto se i dati sottostanti sono altamente sbilanciati.",
    balancedAccuracyDescription:
      "Gli esempi positivi e negativi vengono riponderati in modo da avere un peso totale uguale. Adatto se i dati sottostanti sono altamente sbilanciati.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall.",
  },
  BinDialog: {
    header: "Configura bin",
    makeCategorical: "Gestisci come categorie",
    save: "Salva",
    cancel: "Annulla",
    numberOfBins: "Numero di bin:",
    categoryHeader: "Valori bin:",
  },
};

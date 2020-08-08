module.exports = {
  selectPoint: "Selezionare un punto per visualizzarne la spiegazione locale",
  defaultClassNames: "Classe {0}",
  defaultFeatureNames: "Funzionalità {0}",
  absoluteAverage: "Media del valore assoluto",
  predictedClass: "Classe stimata",
  datasetExplorer: "Esplora set di dati",
  dataExploration: "Esplorazione del set di dati",
  aggregateFeatureImportance: "Importanza delle caratteristiche aggregate",
  globalImportance: "Importanza globale",
  explanationExploration: "Esplorazione spiegazioni",
  individualAndWhatIf: "Importanza della singola caratteristica e simulazione",
  summaryImportance: "Riepilogo importanza",
  featureImportance: "Importanza della caratteristica",
  featureImportanceOf: "Importanza della caratteristica di {0}",
  perturbationExploration: "Esplorazione perturbazioni",
  localFeatureImportance: "Importanza della caratteristica locale",
  ice: "ICE",
  clearSelection: "Cancella selezione",
  feature: "Aggiornamento delle funzionalità:",
  intercept: "Intercetta",
  modelPerformance: "Prestazioni del modello",
  ExplanationScatter: {
    dataLabel: "Dati: {0}",
    importanceLabel: "Importanza: {0}",
    predictedY: "Y stimato",
    index: "Indice",
    dataGroupLabel: "Dati",
    output: "Output",
    probabilityLabel: "Probabilità: {0}",
    trueY: "True Y",
    class: "classe: ",
    xValue: "Valore X:",
    yValue: "Valore Y:",
    colorValue: "Colore:",
    count: "Conteggio",
  },
  CrossClass: {
    label: "Ponderazione tra classi:",
    info: "Informazioni sul calcolo tra classi",
    overviewInfo:
      "I modelli multiclasse generano un vettore di importanza della caratteristica indipendente per ogni classe. Il vettore di importanza della caratteristica di ogni classe mostra le caratteristiche che hanno reso una classe più probabile o meno probabile. È possibile selezionare il modo in cui i pesi dei vettori di importanza della caratteristica per classe vengono riepilogati in un singolo valore:",
    absoluteValInfo:
      "Media del valore assoluto: mostra la somma dell'importanza della funzionalità in tutte le classi possibili, divisa per numero di classi",
    predictedClassInfo:
      "Classe stimata: mostra il valore di importanza della caratteristica per la classe stimata di un determinato punto",
    enumeratedClassInfo:
      "Nomi di classi enumerate: mostra solo i valori di importanza della caratteristica della classe specificata in tutti i punti dati.",
    close: "Chiudi",
    crossClassWeights: "Pesi tra classi",
  },
  AggregateImportance: {
    scaledFeatureValue: "Valore della funzionalità in scala",
    low: "Minimo",
    high: "Massimo",
    featureLabel: "Funzionalità: {0}",
    valueLabel: "Valore della funzionalità: {0}",
    importanceLabel: "Importanza: {0}",
    predictedClassTooltip: "Classe stimata: {0}",
    trueClassTooltip: "Classe true: {0}",
    predictedOutputTooltip: "Output stimato: {0}",
    trueOutputTooltip: "Output true: {0}",
    topKFeatures: "Prime K funzionalità:",
    topKInfo: "Come viene calcolato top k",
    predictedValue: "Valore stimato",
    predictedClass: "Classe stimata",
    trueValue: "Valore True",
    trueClass: "Classe true",
    noColor: "Nessuno",
    tooManyRows: "Il set di dati fornito è più grande di quello che questo grafico può supportare",
  },
  BarChart: {
    classLabel: "Classe: {0}",
    sortBy: "Ordina per",
    noData: "Dati non disponibili",
    absoluteGlobal: "Assoluto globale",
    absoluteLocal: "Assoluto locale",
    calculatingExplanation: "Calcolo della spiegazione",
  },
  IcePlot: {
    numericError: "Deve essere un carattere numerico",
    integerError: "Deve essere un numero intero",
    prediction: "Stima",
    predictedProbability: "Probabilità stimata",
    predictionLabel: "Stima: {0}",
    probabilityLabel: "Probabilità: {0}",
    noModelError: "Fornire un modello operativo per esplorare le stime nei tracciati ICE.",
    featurePickerLabel: "Aggiornamento delle funzionalità:",
    minimumInputLabel: "Minimo:",
    maximumInputLabel: "Massimo:",
    stepInputLabel: "Passi:",
    loadingMessage: "Caricamento dei dati...",
    submitPrompt: "Inviare un intervallo per visualizzare un tracciato ICE",
    topLevelErrorMessage: "Errore nel parametro",
    errorPrefix: "Errore riscontrato: {0}",
  },
  PerturbationExploration: {
    loadingMessage: "Caricamento...",
    perturbationLabel: "Perturbazione:",
  },
  PredictionLabel: {
    predictedValueLabel: "Valore stimato: {0}",
    predictedClassLabel: "Classe stimata: {0}",
  },
  Violin: {
    groupNone: "Nessun raggruppamento",
    groupPredicted: "Y stimato",
    groupTrue: "True Y",
    groupBy: "Raggruppa per",
  },
  FeatureImportanceWrapper: {
    chartType: "Tipo di grafico:",
    violinText: "Violino",
    barText: "Barre",
    boxText: "Casella",
    beehiveText: "Swarm",
    globalImportanceExplanation:
      "L'importanza della caratteristica globale viene calcolata facendo la media del valore assoluto dell'importanza della caratteristica di tutti i punti (normalizzazione L1). ",
    multiclassImportanceAddendum:
      "Tutti i punti sono inclusi nel calcolo dell'importanza di una funzionalità per tutte le classi, non viene usata alcuna ponderazione differenziale. Quindi, una funzionalità con grande importanza negativa per molti punti che si prevede non siano di 'Classe A' aumenterà notevolmente l'importanza 'Classe A' di tale funzionalità.",
  },
  Filters: {
    equalComparison: "Uguale a",
    greaterThanComparison: "Maggiore di",
    greaterThanEqualToComparison: "Maggiore o uguale a",
    lessThanComparison: "Minore di",
    lessThanEqualToComparison: "Minore o uguale a",
    inTheRangeOf: "Nell'intervallo",
    categoricalIncludeValues: "Valori inclusi:",
    numericValue: "Valore",
    numericalComparison: "Operazione",
    minimum: "Minimo",
    maximum: "Massimo",
    min: "Min: {0}",
    max: "Max: {0}",
    uniqueValues: "Numero di valori univoci: {0}",
  },
  Columns: {
    regressionError: "Errore di regressione",
    error: "Errore",
    classificationOutcome: "Risultato della classificazione",
    truePositive: "Vero positivo",
    trueNegative: "Vero negativo",
    falsePositive: "Falso positivo",
    falseNegative: "Falso negativo",
    dataset: "Set di dati",
    predictedProbabilities: "Probabilità di stima",
    none: "Conteggio",
  },
  WhatIf: {
    closeAriaLabel: "Chiudi",
    defaultCustomRootName: "Copia della riga {0}",
    filterFeaturePlaceholder: "Cerca funzionalità",
  },
  Cohort: {
    cohort: "Coorte",
    defaultLabel: "Tutti i dati",
  },
  GlobalTab: {
    helperText:
      "Esplorare le caratteristiche importanti top - k che influiscono sulle stime generali del modello (ovvero spiegazione globale). Usare il dispositivo di scorrimento per visualizzare i valori di importanza della caratteristica in ordine decrescente. Selezionare un massimo di tre coorti per visualizzare i valori di importanza della caratteristica affiancati. Fare clic su una delle barre delle caratteristiche nel grafo per visualizzare l'impatto dei valori della caratteristica selezionata sulla previsione del modello.",
    topAtoB: "Prime {0}-{1} caratteristiche",
    datasetCohorts: "Coorti di set di dati",
    legendHelpText: "Attivare e disattivare le coorti nel tracciato facendo clic sugli elementi della legenda.",
    sortBy: "Ordina per",
    viewDependencePlotFor: "Visualizza tracciato delle dipendenze per:",
    datasetCohortSelector: "Seleziona una coorte di set di dati",
    aggregateFeatureImportance: "Importanza delle caratteristiche aggregate",
    missingParameters: "Questa scheda richiede che sia fornito il parametro di importanza della caratteristica locale.",
    weightOptions: "Pesi di importanza della classe",
    dependencePlotTitle: "Tracciati delle dipendenze",
    dependencePlotHelperText:
      "Questo tracciato delle dipendenze mostra la relazione tra il valore di una caratteristica e l'importanza corrispondente della caratteristica in una coorte.",
    dependencePlotFeatureSelectPlaceholder: "Seleziona caratteristica",
    datasetRequired:
      "I tracciati delle dipendenze richiedono il set di dati di valutazione e la matrice di importanza delle caratteristiche locali.",
  },
  CohortBanner: {
    dataStatistics: "Statistiche dati",
    datapoints: "{0} punti dati",
    features: "{0} funzionalità",
    filters: "{0} filtri",
    binaryClassifier: "Classificatore binario",
    regressor: "Regressore",
    multiclassClassifier: "Classificatore multiclasse",
    datasetCohorts: "Coorti di set di dati",
    editCohort: "Modifica coorte",
    duplicateCohort: "Duplica coorte",
    addCohort: "Aggiungi coorte",
    copy: " copia",
  },
  ModelPerformance: {
    helperText:
      "Valutare le prestazioni del modello esplorando la distribuzione dei valori di stima e i valori delle metriche delle prestazioni del modello. È possibile esaminare ulteriormente il modello osservando un'analisi comparativa delle relative prestazioni in diverse coorti o sottogruppi del set di dati. Selezionare i filtri con il valore y e il valore x per intersecare dimensioni diverse. Selezionare l'icona a forma di ingranaggio nel grafico per modificare il tipo di grafico.",
    modelStatistics: "Statistiche modello",
    cohortPickerLabel: "Seleziona una coorte di set di dati da esplorare",
    missingParameters: "Questa scheda richiede che sia fornita la matrice di valori stimati del modello.",
    missingTrueY:
      "Le statistiche sulle prestazioni del modello richiedono che vengano forniti i risultati reali oltre ai risultati previsti",
  },
  Charts: {
    yValue: "Valore Y",
    numberOfDatapoints: "Numero di punti dati",
    xValue: "Valore X",
    rowIndex: "Indice di riga",
    featureImportance: "Importanza della caratteristica",
    countTooltipPrefix: "Conteggio: {0}",
    count: "Conteggio",
    featurePrefix: "Caratteristica",
    importancePrefix: "Importanza",
    cohort: "Coorte",
    howToRead: "Come leggere questo grafico",
  },
  DatasetExplorer: {
    helperText:
      "Esplorare le statistiche dei set di dati selezionando diversi filtri lungo l'asse X, Y e colore per suddividere i dati in dimensioni diverse. Creare le coorti di set di dati sopra per analizzare le statistiche dei set di dati con filtri, ad esempio risultati stimati, funzionalità del set di dati e gruppi di errori. Usare l'icona dell'ingranaggio nell'angolo in alto a destra del grafo per modificare i tipi di grafo.",
    colorValue: "Valore colore",
    individualDatapoints: "Singoli punti dati",
    aggregatePlots: "Aggrega tracciati",
    chartType: "Tipo di grafico",
    missingParameters: "Questa scheda richiede che sia fornito un set di dati di valutazione.",
    noColor: "Nessuno",
  },
  DependencePlot: {
    featureImportanceOf: "Importanza della caratteristica di",
    placeholder:
      "Fare clic su una caratteristica nel grafico a barre sopra per mostrarne il tracciato delle dipendenze",
  },
  WhatIfTab: {
    helperText:
      'È possibile selezionare un punto dati facendo clic sul diagramma di dispersione per visualizzarne i valori di importanza della caratteristica locali (spiegazione locale) e il tracciato Aspettativa condizionale individuale (ICE, Individual Conditional Expectation) seguente. Creare un punto dati What If ipotetico usando il pannello sulla destra per perturbare le caratteristiche di un punto dati noto. I valori di importanza della caratteristica si basano su molte approssimazioni e non sono la "causa" delle stime. Senza una rigorosa affidabilità matematica dell\'inferenza causale, non si consiglia agli utenti di prendere decisioni reali basate su questo strumento.',
    panelPlaceholder: "Per effettuare stime per i nuovi punti dati, è necessario un modello.",
    cohortPickerLabel: "Seleziona una coorte di set di dati da esplorare",
    scatterLegendText: "Attivare e disattivare i punti dati nel tracciato facendo clic sugli elementi della legenda.",
    realPoint: "Punti dati reali",
    noneSelectedYet: "Non è stato ancora selezionato alcun punto",
    whatIfDatapoints: "Punti dati di simulazione",
    noneCreatedYet: "Non è stato ancora creato alcun punto",
    showLabel: "Mostra:",
    featureImportancePlot: "Tracciato dell'importanza della caratteristica",
    icePlot: "Tracciato Aspettativa condizionale individuale (ICE, Individual Conditional Expectation)",
    featureImportanceLackingParameters:
      "Fornire l'importanza delle caratteristiche locali per vedere in che modo ogni caratteristica influisce sulle singole stime.",
    featureImportanceGetStartedText: "Seleziona un punto per visualizzare l'importanza della caratteristica",
    iceLackingParameters: "I tracciati ICE richiedono un modello operativo per fare stime per punti dati ipotetici.",
    IceGetStartedText: "Selezionare un punto o creare un punto di simulazione per visualizzare i tracciati ICE",
    whatIfDatapoint: "Punto dati di simulazione",
    whatIfHelpText:
      "Selezionare un punto nel tracciato o immettere manualmente un indice del punto dati noto per perturbare e salvare come nuovo punto di simulazione.",
    indexLabel: "Indice dati da perturbare",
    rowLabel: "Riga {0}",
    whatIfNameLabel: "Nome del punto dati di simulazione",
    featureValues: "Valori delle caratteristiche",
    predictedClass: "Classe stimata: ",
    predictedValue: "Valore stimato: ",
    probability: "Probabilità: ",
    trueClass: "Classe true: ",
    trueValue: "Valore true: ",
    "trueValue.comment": "prefisso per l'etichetta effettiva per la regressione",
    newPredictedClass: "Nuova classe stimata: ",
    newPredictedValue: "Nuovo valore stimato: ",
    newProbability: "Nuova probabilità: ",
    saveAsNewPoint: "Salva come nuovo punto",
    saveChanges: "Salva modifiche",
    loading: "Caricamento...",
    classLabel: "Classe: {0}",
    minLabel: "Min",
    maxLabel: "Max",
    stepsLabel: "Passi",
    disclaimer:
      'Dichiarazione di non responsabilità: queste sono spiegazioni basate su molte approssimazioni e non sono la "causa" delle stime. Senza una rigorosa affidabilità matematica dell\'inferenza causale, non si consiglia agli utenti di prendere decisioni reali basate su questo strumento.',
    missingParameters: "Questa scheda richiede che sia fornito un set di dati di valutazione.",
    selectionLimit: "Massimo di 3 punti selezionati",
    classPickerLabel: "Classe",
    tooltipTitleMany: "Prime {0} classi stimate",
    whatIfTooltipTitle: "Classi stimate di simulazione",
    tooltipTitleFew: "Classi stimate",
    probabilityLabel: "Probabilità",
    deltaLabel: "Delta",
    nonNumericValue: "Il valore deve essere un valore numerico",
    icePlotHelperText:
      "I tracciati ICE illustrano la variazione dei valori di stima del punto dati selezionato in un intervallo di valori di caratteristica compreso tra un valore minimo e un valore massimo.",
  },
  CohortEditor: {
    selectFilter: "Seleziona filtro",
    TreatAsCategorical: "Gestisci come categorie",
    addFilter: "Aggiungi filtro",
    addedFilters: "Filtri aggiunti",
    noAddedFilters: "Non sono stati ancora aggiunti filtri",
    defaultFilterState: "Selezionare un filtro per aggiungere i parametri alla coorte del set di dati.",
    cohortNameLabel: "Nome coorte del set di dati",
    cohortNamePlaceholder: "Assegnare un nome alla coorte",
    save: "Salva",
    delete: "Elimina",
    cancel: "Annulla",
    cohortNameError: "Nome coorte mancante",
    placeholderName: "Coorte {0}",
  },
  AxisConfigDialog: {
    select: "Seleziona",
    ditherLabel: "Applica il dithering",
    selectFilter: "Seleziona il valore dell'asse",
    selectFeature: "Seleziona funzionalità",
    binLabel: "Raggruppa i dati in contenitori",
    TreatAsCategorical: "Gestisci come categorie",
    numOfBins: "Numero di contenitori",
    groupByCohort: "Raggruppa per coorte",
    selectClass: "Seleziona classe",
    countHelperText: "Istogramma del numero di punti",
  },
  ValidationErrors: {
    predictedProbability: "Probabilità stimata",
    predictedY: "Y stimato",
    evalData: "Set di dati di valutazione",
    localFeatureImportance: "Importanza della caratteristica locale",
    inconsistentDimensions: "Dimensioni incoerenti. {0} contiene dimensioni {1}, previsto {2}",
    notNonEmpty: "Input {0} non contiene una matrice non vuota",
    varyingLength: "Dimensioni incoerenti. {0} contiene elementi di lunghezza variabile",
    notArray: "{0} non contiene una matrice. È prevista una matrice di dimensione {1}",
    errorHeader: "Alcuni parametri di input sono incoerenti e non verranno usati: ",
    datasizeWarning:
      "Il set di dati di valutazione è troppo grande per essere visualizzato in modo efficace in alcuni grafici, aggiungere i filtri per ridurre le dimensioni della coorte. ",
    datasizeError: "La coorte selezionata è troppo grande, aggiungere i filtri per ridurre le dimensioni della coorte.",
    addFilters: "Aggiungi filtri",
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: " include {0} ",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} e altri {1}",
  },
  Statistics: {
    mse: "MSE: {0}",
    rSquared: "R-squared: {0}",
    meanPrediction: "Stima media {0}",
    accuracy: "Accuratezza: {0}",
    precision: "Precisione: {0}",
    recall: "Richiamo: {0}",
    fpr: "FPR: {0}",
    fnr: "FNR: {0}",
  },
  GlobalOnlyChart: {
    helperText:
      "Esplorare le caratteristiche importanti top k che influiscono sulle stime generali del modello. Usare il dispositivo di scorrimento per visualizzare l'importanza delle caratteristiche in ordine decrescente.",
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "Che cosa indicano queste spiegazioni?",
    clickHere: "Altre informazioni",
    shapTitle: "Valori di Shapley",
    shapDescription:
      'Questo explainer usa SHAP, ovvero un approccio basato sulla teoria dei giochi per spiegare i modelli, in cui l\'importanza dei set di caratteristiche viene misurata "nascondendo" tali caratteristiche nel modello tramite la marginalizzazione. Per altre informazioni, fare clic sul collegamento seguente.',
    limeTitle: "LIME (Local Interpretable Model-Agnostic Explanations)",
    limeDescription:
      "Questo explainer usa LIME, che fornisce un'approssimazione lineare del modello. Per ottenere una spiegazione, seguire questa procedura: perturbare l'istanza, ottenere le stime del modello e usarle come etichette per apprendere un modello lineare di tipo sparse fedele a livello locale. I pesi di questo modello lineare vengono usati come 'importanze della caratteristica'. Per altre informazioni, fare clic sul collegamento seguente.",
    mimicTitle: "Simulazione (Global Surrogate Explanations)",
    mimicDescription:
      "Questo explainer si basa sul concetto di training dei modelli di surrogato globale per simulare modelli black box. Per modello di surrogato globale si intende un modello intrinsecamente interpretabile di cui viene eseguito il training per approssimare le stime di qualsiasi modello black box nel modo più accurato possibile. I valori di importanza della caratteristica sono valori di importanza della caratteristica basati sul modello del modello surrogato sottostante (LightGBM, regressione lineare, discesa stocastica del gradiente o albero delle decisioni)",
    pfiTitle: "Permutation Feature Importance (PFI)",
    pfiDescription:
      "Questo explainer seleziona in ordine casuale i dati una caratteristica alla volta per l'intero set di dati e calcola la variazione della metrica delle prestazioni di interesse (metriche delle prestazioni predefinite: F1 per la classificazione binaria, punteggio F1 con media micro per la classificazione multiclasse e errore assoluto medio per la regressione). Maggiore è la variazione, più importante è la caratteristica. Questo explainer può solo spiegare il comportamento complessivo del modello sottostante, ma non spiega le singole stime. Il valore dell'importanza di una caratteristica rappresenta il delta nelle prestazioni del modello e causa la perturbazione di tale caratteristica specifica.",
  },
};

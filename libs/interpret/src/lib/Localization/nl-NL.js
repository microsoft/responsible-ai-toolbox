module.exports = {
  selectPoint: "Selecteer een punt om de lokale uitleg ervan weer te geven",
  defaultClassNames: "Klasse {0}",
  defaultFeatureNames: "Functie {0}",
  absoluteAverage: "Gemiddelde van absolute waarde",
  predictedClass: "Voorspelde klasse",
  datasetExplorer: "Gegevenssetverkenner",
  dataExploration: "Verkenning van gegevensset",
  aggregateFeatureImportance: "Belang van de functie Samenvoegen",
  globalImportance: "Algemene urgentie",
  explanationExploration: "Uitlegverkenning",
  individualAndWhatIf: "Belang van afzonderlijke functies en What-If",
  summaryImportance: "Urgentiesamenvatting",
  featureImportance: "Functie-urgentie",
  featureImportanceOf: "Belang van de functie van {0}",
  perturbationExploration: "Storingsverkenning",
  localFeatureImportance: "Lokale functie-urgentie",
  ice: "ICE",
  clearSelection: "Selectie wissen",
  feature: "Functie:",
  intercept: "Snijpunt",
  modelPerformance: "Modelprestaties",
  ExplanationScatter: {
    dataLabel: "Gegevens: {0}",
    importanceLabel: "Urgentie: {0}",
    predictedY: "Voorspelde Y",
    index: "Index",
    dataGroupLabel: "Gegevens",
    output: "Uitvoer",
    probabilityLabel: "Waarschijnlijkheid: {0}",
    trueY: "Ware Y",
    class: "klasse: ",
    xValue: "X-waarde:",
    yValue: "Y-waarde:",
    colorValue: "Kleur:",
    count: "Aantal"
  },
  CrossClass: {
    label: "Weging voor alle klassen:",
    info: "Informatie over de berekening van meerdere klassen",
    overviewInfo:
      "Modellen met meerdere klassen genereren een onafhankelijke functie-urgentievector voor elke klasse. De functie-urgentievector van elke klasse geeft aan welke functies een klasse waarschijnlijk of minder waarschijnlijk hebben gemaakt. U kunt selecteren hoe de wegingen van de functie-urgentievector per klasse wordt samengevat in één waarde:",
    absoluteValInfo:
      "Gemiddelde van absolute waarde: hiermee wordt de som van de urgentie van de functie weergegeven voor alle mogelijke klassen, gedeeld door het aantal klassen",
    predictedClassInfo:
      "Voorspelde klasse: hiermee wordt de functie-urgentiewaarde weergegeven voor de voorspelde klasse van een bepaald punt",
    enumeratedClassInfo:
      "Geïnventariseerde klassenamen: hiermee worden alleen de functie-urgentiewaarden van de opgegeven klasse weergegeven voor alle gegevenspunten.",
    close: "Sluiten",
    crossClassWeights: "Gewichten in meerdere klassen"
  },
  AggregateImportance: {
    scaledFeatureValue: "Geschaalde functiewaarde",
    low: "Laag",
    high: "Hoog",
    featureLabel: "Functie: {0}",
    valueLabel: "Functiewaarde: {0}",
    importanceLabel: "Urgentie: {0}",
    predictedClassTooltip: "Voorspelde klasse: {0}",
    trueClassTooltip: "Ware klasse: {0}",
    predictedOutputTooltip: "Voorspelde uitvoer: {0}",
    trueOutputTooltip: "Ware uitvoer: {0}",
    topKFeatures: "Belangrijkste K-functies:",
    topKInfo: "Zo wordt de top k berekend",
    predictedValue: "Voorspelde waarde",
    predictedClass: "Voorspelde klasse",
    trueValue: "Ware waarde",
    trueClass: "Ware klasse",
    noColor: "Geen",
    tooManyRows:
      "De opgegeven gegevensset is groter dan door deze grafiek wordt ondersteund"
  },
  BarChart: {
    classLabel: "Klasse: {0}",
    sortBy: "Sorteren op",
    noData: "Geen gegevens",
    absoluteGlobal: "Absoluut algemeen",
    absoluteLocal: "Absoluut lokaal",
    calculatingExplanation: "Berekeningsuitleg"
  },
  IcePlot: {
    numericError: "Moet numeriek zijn",
    integerError: "Moet een geheel getal zijn",
    prediction: "Voorspelling",
    predictedProbability: "Voorspelde waarschijnlijkheid",
    predictionLabel: "Voorspelling: {0}",
    probabilityLabel: "Waarschijnlijkheid: {0}",
    noModelError:
      "Geef een operationeel model op om voorspellingen te verkennen in ICE-tekeningen.",
    featurePickerLabel: "Functie:",
    minimumInputLabel: "Minimum:",
    maximumInputLabel: "Maximum:",
    stepInputLabel: "Stappen:",
    loadingMessage: "Gegevens laden...",
    submitPrompt: "Een bereik verzenden om een ICE-tekening weer te geven",
    topLevelErrorMessage: "Fout in parameter",
    errorPrefix: "Fout aangetroffen: {0}"
  },
  PerturbationExploration: {
    loadingMessage: "Laden...",
    perturbationLabel: "Storing:"
  },
  PredictionLabel: {
    predictedValueLabel: "Voorspelde waarde: {0}",
    predictedClassLabel: "Voorspelde klasse: {0}"
  },
  Violin: {
    groupNone: "Geen groepering",
    groupPredicted: "Voorspelde Y",
    groupTrue: "Ware Y",
    groupBy: "Groeperen op"
  },
  FeatureImportanceWrapper: {
    chartType: "Grafiektype:",
    violinText: "Violin",
    barText: "Staaf",
    boxText: "Vak",
    beehiveText: "Swarm",
    globalImportanceExplanation:
      "De algemene functie-urgentie wordt berekend door het gemiddelde te berekenen van de absolute waarde van de functie-urgentie van alle punten (L1-normalisatie). ",
    multiclassImportanceAddendum:
      "Alle punten worden opgenomen in de berekening van de urgentie van een functie voor alle klassen. Er wordt geen differentiële weging gebruikt. Een functie met een grote negatieve urgentie voor veel punten die volgens de voorspelling niet van klasse A zijn, verhoogt het belang van de klasse A-urgentie van die functie aanzienlijk."
  },
  Filters: {
    equalComparison: "Is gelijk aan",
    greaterThanComparison: "Groter dan",
    greaterThanEqualToComparison: "Groter dan of gelijk aan",
    lessThanComparison: "Kleiner dan",
    lessThanEqualToComparison: "Kleiner dan of gelijk aan",
    inTheRangeOf: "Binnen het bereik van",
    categoricalIncludeValues: "Inbegrepen waarden:",
    numericValue: "Waarde",
    numericalComparison: "Bewerking",
    minimum: "Minimum",
    maximum: "Maximum",
    min: "Min: {0}",
    max: "Max: {0}",
    uniqueValues: "aantal unieke waarden: {0}"
  },
  Columns: {
    regressionError: "Regressiefout",
    error: "Fout",
    classificationOutcome: "Classificatieresultaten",
    truePositive: "Terecht-positief",
    trueNegative: "Terecht-negatief",
    falsePositive: "Fout-positief",
    falseNegative: "Fout-negatief",
    dataset: "Gegevensset",
    predictedProbabilities: "Voorspellingskansen",
    none: "Aantal"
  },
  WhatIf: {
    closeAriaLabel: "Sluiten",
    defaultCustomRootName: "Kopie van rij {0}",
    filterFeaturePlaceholder: "Zoeken naar functies"
  },
  Cohort: {
    cohort: "Cohort",
    defaultLabel: "Alle gegevens"
  },
  GlobalTab: {
    helperText:
      "Verken de k belangrijkste functies die invloed hebben op uw algemene modelvoorspellingen (ofwel algemene verklaring). Gebruik de schuifregelaar om waarden voor functie-urgentie aflopend weer te geven. Selecteer maximaal drie cohorten om de bijbehorende waarden voor functie-urgentie naast elkaar weer te geven. Klik op een functiebalk in de grafiek om te bekijken hoe waarden van de geselecteerde functie invloed hebben op de modelvoorspelling.",
    topAtoB: "Belangrijkste {0}-{1} functies",
    datasetCohorts: "Gegevenssetcohorten",
    legendHelpText:
      "Schakel cohorten in en uit in de plot door op de legenda-items te klikken.",
    sortBy: "Sorteren op",
    viewDependencePlotFor: "Plot met afhankelijkheden weergeven voor:",
    datasetCohortSelector: "Een gegevenssetcohort selecteren",
    aggregateFeatureImportance: "Belang van de functie Samenvoegen",
    missingParameters:
      "Op dit tabblad moet de parameter voor het lokale functiebelang worden opgegeven.",
    weightOptions: "Gewichten voor urgentie van klassen",
    dependencePlotTitle: "Plots met afhankelijkheden",
    dependencePlotHelperText:
      "In deze plot met afhankelijkheden wordt de relatie tussen de waarde van een functie en het bijbehorende belang van de functie in een cohort weergegeven.",
    dependencePlotFeatureSelectPlaceholder: "Functie selecteren",
    datasetRequired:
      "Plots met afhankelijkheden vereisen de evaluatiegegevensset en de prioriteitsmatrix van lokale functies."
  },
  CohortBanner: {
    dataStatistics: "Gegevensstatistieken",
    datapoints: "{0} gegevenspunten",
    features: "Functies van {0}",
    filters: "{0} filters",
    binaryClassifier: "Binaire classificatie",
    regressor: "Regressor",
    multiclassClassifier: "Classificatie voor meerdere klassen",
    datasetCohorts: "Gegevenssetcohorten",
    editCohort: "Cohort bewerken",
    duplicateCohort: "Dubbele cohort",
    addCohort: "Cohort toevoegen",
    copy: " kopiëren"
  },
  ModelPerformance: {
    helperText:
      "Evalueer de prestaties van uw model door de distributie van uw voorspellingswaarden en de waarden van uw metrische prestatiegegevens van het model te verkennen. U kunt uw model nog verder onderzoeken door naar de vergelijkende analyse van de prestaties van verschillende cohorten of subgroepen van uw gegevensset te kijken. Selecteer filters voor de y- en de x-waarde om een beeld van verschillende dimensies te krijgen. Selecteer het tandwieltje in de grafiek om het grafiektype te wijzigen.",
    modelStatistics: "Modelstatistieken",
    cohortPickerLabel: "Een gegevenssetcohort selecteren om te verkennen",
    missingParameters:
      "Op dit tabblad moet de matrix van voorspelde waarden uit het model worden opgegeven.",
    missingTrueY:
      "Prestatiestatistieken voor modellen moeten naast de voorspelde resultaten ook de echte resultaten weergeven"
  },
  Charts: {
    yValue: "Y-waarde",
    numberOfDatapoints: "Aantal gegevenspunten",
    xValue: "X-waarde",
    rowIndex: "Rij-index",
    featureImportance: "Belang van de functie",
    countTooltipPrefix: "Aantal: {0}",
    count: "Aantal",
    featurePrefix: "Functie",
    importancePrefix: "Urgentie",
    cohort: "Cohort",
    howToRead: "Hoe u deze grafiek moet lezen"
  },
  DatasetExplorer: {
    helperText:
      "Verken de statistieken van uw gegevensset door verschillende filters langs de X-, Y- en kleuras te selecteren om uw gegevens te segmenteren in verschillende dimensies. Maak hierboven gegevenssetcohorten om statistieken van de gegevensset te analyseren met filters zoals voorspelde resultaten, gegevenssetfuncties en foutgroepen. Gebruik het tandwielpictogram in de rechterbovenhoek van de grafiek om grafiektypen te wijzigen.",
    colorValue: "Kleurwaarde",
    individualDatapoints: "Afzonderlijke gegevenspunten",
    aggregatePlots: "Plots samenvoegen",
    chartType: "Grafiektype",
    missingParameters:
      "Op dit tabblad moet een evaluatiegegevensset worden opgegeven.",
    noColor: "Geen"
  },
  DependencePlot: {
    featureImportanceOf: "Belang van de functie van",
    placeholder:
      "Klik op een functie in het bovenstaande staafdiagram om de bijbehorende plot met afhankelijkheden weer te geven"
  },
  WhatIfTab: {
    helperText:
      "U kunt een gegevenspunt selecteren door op het spreidingsdiagram te klikken om de bijbehorende waarden voor lokale functie-urgentie (lokale uitleg) en ICE (afzonderlijke voorwaardelijke verwachting) hieronder weer te geven. Maak een hypothetisch what-if-gegevenspunt door het deelvenster aan de rechterkant te gebruiken om functies van een bekend gegevenspunt te verstoren. De waarden voor functie-urgentie zijn op vele benaderingen gebaseerd en niet de 'oorzaak' van voorspellingen. Zonder een strikte wiskundige onderbouwing van causale interferentie is het niet raadzaam dat gebruikers echte beslissingen nemen op basis van dit hulpprogramma.",
    panelPlaceholder:
      "Een model is vereist om voorspellingen te maken voor nieuwe gegevenspunten.",
    cohortPickerLabel: "Een gegevenssetcohort selecteren om te verkennen",
    scatterLegendText:
      "Schakel gegevenspunten in en uit in de plot door op de legenda-items te klikken.",
    realPoint: "Werkelijke gegevenspunten",
    noneSelectedYet: "Nog geen geselecteerd",
    whatIfDatapoints: "What-If-gegevenspunten",
    noneCreatedYet: "Nog geen gemaakt",
    showLabel: "Weergeven:",
    featureImportancePlot: "Plot met belang van functies",
    icePlot: "ICE-tekenbewerking (Individual Conditional Expectation)",
    featureImportanceLackingParameters:
      "Geef het belang van de lokale functie op om te zien hoe elke functie invloed heeft op afzonderlijke voorspellingen.",
    featureImportanceGetStartedText:
      "Selecteer een punt om het belang van de functie weer te geven",
    iceLackingParameters:
      "Voor ICE-grafieken is een operationeel model vereist om voorspellingen te maken voor hypothetische gegevenspunten.",
    IceGetStartedText:
      "Een punt selecteren of een What-If-punt maken om ICE-plots weer te geven",
    whatIfDatapoint: "What-If-gegevenspunt",
    whatIfHelpText:
      "Selecteer een punt in de plot of voer handmatig een bekende gegevenspuntindex voor verstoren en om als een nieuw What-If-punt op te slaan.",
    indexLabel: "Gegevensindex die moet worden verstoord",
    rowLabel: "Rij {0}",
    whatIfNameLabel: "Naam van What-If-gegevenspunt",
    featureValues: "Functiewaarden",
    predictedClass: "Voorspelde klasse: ",
    predictedValue: "Voorspelde waarde: ",
    probability: "Waarschijnlijkheid: ",
    trueClass: "Werkelijke klasse: ",
    trueValue: "Werkelijke waarde: ",
    "trueValue.comment": "voorvoegsel van werkelijk label voor regressie",
    newPredictedClass: "Nieuwe voorspelde klasse: ",
    newPredictedValue: "Nieuwe voorspelde waarde: ",
    newProbability: "Nieuwe waarschijnlijkheid: ",
    saveAsNewPoint: "Opslaan als nieuw punt",
    saveChanges: "Wijzigingen opslaan",
    loading: "Laden...",
    classLabel: "Klasse: {0}",
    minLabel: "Minimum",
    maxLabel: "Maximum",
    stepsLabel: "Stappen",
    disclaimer:
      "Disclaimer: dit zijn verklaringen die op vele schattingen zijn gebaseerd en niet de 'oorzaak' van voorspellingen. Zonder een strikte wiskundige onderbouwing van causale interferentie is het niet raadzaam dat gebruikers echte beslissingen nemen op basis van dit hulpprogramma.",
    missingParameters:
      "Op dit tabblad moet een evaluatiegegevensset worden opgegeven.",
    selectionLimit: "Maximaal drie geselecteerde punten",
    classPickerLabel: "Klasse",
    tooltipTitleMany: "Belangrijkste {0} voorspelde klassen",
    whatIfTooltipTitle: "Voorspelde what if-klassen",
    tooltipTitleFew: "Voorspelde klassen",
    probabilityLabel: "Kans",
    deltaLabel: "Delta",
    nonNumericValue: "Waarde moet numeriek zijn",
    icePlotHelperText:
      "Met ICE-spreidingsdiagrammen wordt aangegeven hoe de voorspellingswaarden van het geselecteerde gegevenspunt worden gewijzigd langs een aantal functiewaarden tussen een minimum- en maximumwaarde."
  },
  CohortEditor: {
    selectFilter: "Filter selecteren",
    TreatAsCategorical: "Beschouwen als categorisch",
    addFilter: "Filter toevoegen",
    addedFilters: "Toegevoegde filters",
    noAddedFilters: "Nog geen filters toegevoegd",
    defaultFilterState:
      "Selecteer een filter om parameters aan uw gegevenssetcohort toe te voegen.",
    cohortNameLabel: "Naam van de gegevenssetcohort",
    cohortNamePlaceholder: "Een naam voor uw cohort invoeren",
    save: "Opslaan",
    delete: "Verwijderen",
    cancel: "Annuleren",
    cohortNameError: "Cohortnaam ontbreekt",
    placeholderName: "Cohort {0}"
  },
  AxisConfigDialog: {
    select: "Selecteren",
    ditherLabel: "Moet op raster worden weergegeven",
    selectFilter: "Uw aswaarde selecteren",
    selectFeature: "Functie selecteren",
    binLabel: "Binning toepassen op gegevens",
    TreatAsCategorical: "Beschouwen als categorisch",
    numOfBins: "Aantal opslaglocaties",
    groupByCohort: "Groeperen op cohort",
    selectClass: "Klasse selecteren",
    countHelperText: "Een histogram van het aantal punten"
  },
  ValidationErrors: {
    predictedProbability: "Voorspelde waarschijnlijkheid",
    predictedY: "Voorspelde Y",
    evalData: "Evaluatiegegevensset",
    localFeatureImportance: "Belang van lokale functie",
    inconsistentDimensions:
      "Inconsistente dimensies. {0} heeft dimensies {1}, verwacht {2}",
    notNonEmpty: "{0} invoer is geen niet-lege matrix",
    varyingLength:
      "Inconsistente dimensies. {0} heeft elementen van verschillende lengte",
    notArray:
      "{0} geen matrix. Er wordt een matrix van de dimensie {1} verwacht",
    errorHeader:
      "Sommige invoerparameters zijn inconsistent en worden niet gebruikt: ",
    datasizeWarning:
      "De gegevensset voor evaluatie is te groot om in sommige grafieken effectief te kunnen worden weergegeven. Voeg filters toe om de grootte van de cohort te verkleinen. ",
    datasizeError:
      "De geselecteerde cohort is te groot. Voeg filters toe om de grootte van de cohort te verkleinen.",
    addFilters: "Filters toevoegen"
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: " bevat {0} ",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} en {1} anderen"
  },
  Statistics: {
    mse: "MSE: {0}",
    rSquared: "R-kwadraat: {0}",
    meanPrediction: "Gemiddelde voorspelling {0}",
    accuracy: "Nauwkeurigheid: {0}",
    precision: "Precisie: {0}",
    recall: "Terughalen: {0}",
    fpr: "FPR: {0}",
    fnr: "FNR: {0}"
  },
  GlobalOnlyChart: {
    helperText:
      "Verken de k belangrijkste functies die invloed hebben op uw algemene modelvoorspellingen. Gebruik de schuifbalk om functies van aflopend belang weer te geven."
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "Wat betekenen deze toelichtingen?",
    clickHere: "Meer informatie",
    shapTitle: "Shap-waarden",
    shapDescription:
      "Deze verklarende factor maakt gebruik van SHAP, een speltheoretische benadering voor het uitleggen van modellen, waarbij de betekenis van de functiesets wordt gemeten door deze functies te 'verbergen' voor het model via marginalisatie. Klik op de onderstaande koppeling voor meer informatie.",
    limeTitle: "LIME (Local Interpretable Model-Agnostic Explanations)",
    limeDescription:
      "Deze verklarende factor maakt gebruik van LIME, waarmee een lineaire benadering van het model wordt geleverd. Een uitleg wordt verkregen door de instantie te verstoren, modelvoorspellingen op te halen en deze voorspellingen te gebruiken als labels om een eenvoudig lineair model te verkrijgen dat lokaal getrouw is. De gewichten van dit lineaire model wordt gebruikt als functie-urgenties. Klik op de onderstaande koppeling voor meer informatie.",
    mimicTitle: "Nabootsen (verklaringen met globale surrogaatmodellen)",
    mimicDescription:
      "Deze verklarende factor is gebaseerd op het idee van het trainen van globale surrogaatmodellen om black box-modellen na te bootsen. Een globaal surrogaatmodel is een intrinsiek interpreteerbaar model dat is getraind om de voorspellingen van elk black box-model zo nauwkeurig mogelijk te benaderen. De waarden voor functie-urgentie zijn modelwaarden voor functie-urgentie van het onderliggende surrogaatmodel (LightGBM, lineaire regressie, Stochastic Gradient Descent of beslissingsstructuur)",
    pfiTitle: "PFI (Permutation Feature Importance)",
    pfiDescription:
      "Met deze verklarende factor worden per functie de gegevens van een volledige gegevensset willekeurig gebruikt en wordt berekend in welke mate de metrische prestatiegegevens voor het belang veranderen (standaardwaarden voor metrische prestatiegegevens: F1 voor binaire classificatie, F1-score met microgemiddelde voor classificatie met meerdere klassen en gemiddelde absolute fout voor regressie). Hoe groter de verandering, hoe belangrijker de functie. Deze verklarende factor kan alleen het algemene gedrag van het onderliggende model uitleggen. Er worden geen afzonderlijke voorspellingen uitgelegd. De waarde voor functie-urgentie van een functie geeft het verschil in de prestatie van het model aan wanneer die specifieke functie wordt verstoord."
  }
};

module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  defaultClassNames: "Klasse {0}",
  defaultFeatureNames: "Gevoelige functie {0}",
  defaultSingleFeatureName: "Gevoelige functie",
  defaultCustomMetricName: "Aangepaste metrische gegevens {0}",
  accuracyTab: "Verdeling in prestaties",
  opportunityTab: "Verdeling in verkoopkans",
  modelComparisonTab: "Modelvergelijking",
  tableTab: "Detailweergave",
  dataSpecifications: "Gegevensstatistieken",
  attributes: "Kenmerken",
  singleAttributeCount: "1 gevoelige functie",
  attributesCount: "{0} gevoelige functies",
  instanceCount: "{0} exemplaren",
  close: "Sluiten",
  calculating: "Berekenen...",
  accuracyMetricLegacy: "Metrische prestatiegegevens",
  errorOnInputs:
    "Fout bij invoer. Gevoelige functies moeten op dit moment categorisch zijn. Wijs waarden toe aan categorieën in bins en probeer het opnieuw.",
  Accuracy: {
    header: "Hoe wilt u de prestaties meten?",
    modelMakes: "model maakt",
    modelsMake: "modellen maken",
    body:
      "Uw gegevens bevatten {0} labels en uw {2} {1} voorspellingen. Op basis van deze informatie raden we de volgende metrische gegevens aan. Selecteer één waarde in de lijst.",
    binaryClassifier: "binaire classificatie",
    probabalisticRegressor: "probit regressor",
    regressor: "regressor",
    binary: "binair",
    continuous: "doorlopend"
  },
  Parity: {
    header: "Verdeling gemeten in termen van verschil",
    body:
      "Met de verschilwaarden wordt de variatie van het gedrag van uw model op geselecteerde functies gekwantificeerd. Er zijn twee soorten verschilwaarden: wordt vervolgd...."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Documentatie"
  },
  Footer: {
    back: "Vorige",
    next: "Volgende"
  },
  Intro: {
    welcome: "Welkom bij",
    fairlearnDashboard: "Fairlearn-dashboard",
    introBody:
      "Met het Fairlearn-dashboard kunt u de compromissen tussen prestaties en verdeling van uw modellen evalueren",
    explanatoryStep:
      "Als u de evaluatie wilt instellen, moet u een gevoelige functie en metrische prestatiegegevens opgeven.",
    getStarted: "Aan de slag",
    features: "Gevoelige functies",
    featuresInfo:
      "Gevoelige functies worden gebruikt om uw gegevens te splitsen in groepen. De verdeling van uw model over deze groepen wordt gemeten door de verschilwaarden te meten. Met de verschilwaarden wordt bepaald hoeveel het gedrag van uw model tussen deze groepen kan variëren.",
    accuracy: "Metrische prestatiegegevens",
    accuracyInfo:
      "Metrische prestatiegegevens worden gebruikt om de algehele kwaliteit van uw model en de kwaliteit van uw model in elke groep te evalueren. Het verschil tussen de uitersten van de metrische prestatiegegevens in de groepen wordt gerapporteerd als de prestatieverhouding."
  },
  ModelComparison: {
    title: "Modelvergelijking",
    howToRead: "Hoe u deze grafiek moet lezen",
    lower: "lager",
    higher: "hoger",
    howToReadText:
      "Deze grafiek toont elk van de {0} modellen als een selecteerbaar punt. De x-as toont {1}, waarbij {2} beter is. De y-as toont het verschil, waarbij lager beter is.",
    insights: "Inzichten",
    insightsText1: "De grafiek toont {0} en het verschil tussen {1} modellen.",
    insightsText2:
      "{0} loopt van {1} tot {2}. Het verschil loopt van {3} tot {4}.",
    insightsText3:
      "Het meest nauwkeurige model bereikt {0} van {1} en een verschil van {2}.",
    insightsText4:
      "Het model met het kleinste verschil bereikt {0} van {1} en een verschil van {2}.",
    disparityInOutcomes: "Verschil in voorspellingen",
    disparityInAccuracy: "Verschil in {0}",
    howToMeasureDisparity: "Hoe moet het verschil worden gemeten?"
  },
  Report: {
    modelName: "Model {0}",
    title: "Verschil in prestaties",
    globalAccuracyText: "Is de algemene {0}",
    accuracyDisparityText: "Is het verschil in {0}",
    editConfiguration: "Configuratie bewerken",
    backToComparisons: "Weergave met meerdere modellen",
    outcomesTitle: "Verschil in voorspellingen",
    minTag: "Minimum",
    maxTag: "Maximum",
    groupLabel: "Subgroep",
    underestimationError: "Ondervoorspelling",
    underpredictionExplanation: "(voorspeld = 0, werkelijk = 1)",
    overpredictionExplanation: "(voorspeld = 1, werkelijk = 0)",
    overestimationError: "Overvoorspelling",
    classificationOutcomesHowToRead:
      "Het staafdiagram toont het selectiepercentage in elke groep, dat wil zeggen het aantal punten dat wordt geclassificeerd als 1.",
    regressionOutcomesHowToRead:
      "In boxplots wordt de distributie van voorspellingen in elke groep weergegeven. Afzonderlijke gegevenspunten worden hier overheen gelegd.",
    classificationAccuracyHowToRead1:
      "In het staafdiagram wordt de distributie van fouten in elke groep weergegeven.",
    classificationAccuracyHowToRead2:
      "Fouten zijn opgesplitst in fouten met overvoorspelling (voorspelling 1 wanneer het werkelijke label 0 is) en fouten met ondervoorspelling (voorspelling 0 wanneer het werkelijke label 1 is).",
    classificationAccuracyHowToRead3:
      "De gerapporteerde aantallen worden verkregen door het aantal fouten te delen door de totale groepsgrootte.",
    probabilityAccuracyHowToRead1:
      "Het staafdiagram laat de gemiddelde absolute fout in elke groep zien, gesplitst naar overvoorspelling en ondervoorspellinig.",
    probabilityAccuracyHowToRead2:
      "In elk voorbeeld wordt het verschil gemeten tussen de voorspelling en het label. Als het positief is, wordt het overvoorspelling genoemd en als het negatief is, wordt het ondervoorspelling genoemd.",
    probabilityAccuracyHowToRead3:
      "We rapporteren de som van de fouten met overvoorspelling en de som van de fouten met ondervoorspelling, gedeeld door de totale groepsgrootte.",
    regressionAccuracyHowToRead:
      "De fout is het verschil tussen de voorspelling en het label. In boxplots wordt de distributie van fouten in elke groep weergegeven. Afzonderlijke gegevenspunten worden hier overheen gelegd.",
    distributionOfPredictions: "Distributie van voorspellingen",
    distributionOfErrors: "Distributie van fouten",
    tooltipPrediction: "Voorspelling: {0}",
    tooltipError: "Fout: {0}"
  },
  Feature: {
    header: "Voor welke functies wilt u de verdeling van uw model evalueren?",
    body:
      "Verdeling wordt geëvalueerd in termen van verschillen in het gedrag van uw model. Uw gegevens worden gesplitst op basis van de waarden van elke geselecteerde functie en er wordt geëvalueerd hoe deze splitsingen verschillen in de prestatiegegevens en voorspellingen van uw model.",
    learnMore: "Meer informatie",
    summaryCategoricalCount: "Deze functie heeft {0} unieke waarden",
    summaryNumericCount:
      "Deze numerieke functie heeft een bereik van {0} tot {1} en is gegroepeerd in {2} bins.",
    showCategories: "Alles weergeven",
    hideCategories: "Samenvouwen",
    categoriesOverflow: "   en {0} aanvullende categorieën",
    editBinning: "Groepen bewerken",
    subgroups: "Subgroepen"
  },
  Metrics: {
    accuracyScore: "Nauwkeurigheid",
    precisionScore: "Precisie",
    recallScore: "Terughalen",
    zeroOneLoss: "Nul-één verlies",
    specificityScore: "Score voor specificiteit",
    missRate: "Aantal missers",
    falloutRate: "Uitvalpercentage",
    maxError: "Maximumfout",
    meanAbsoluteError: "Gemiddelde absolute fout",
    meanSquaredError: " MSE (gemiddelde fout in het kwadraat)",
    meanSquaredLogError: "Gemiddelde logboekfout in kwadraat",
    medianAbsoluteError: "Mediaan absolute fout",
    average: "Gemiddelde voorspelling",
    selectionRate: "Selectiesnelheid",
    overprediction: "Overvoorspelling",
    underprediction: "Ondervoorspelling",
    r2_score: "R-kwadraatscore",
    rms_error: "RMSE (wortel gemiddelde kwadratische fout)",
    auc: "Gebied onder ROC-curve",
    balancedRootMeanSquaredError: "Verdeelde RMSE",
    balancedAccuracy: "Verdeelde nauwkeurigheid",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription:
      "Het deel van de gegevenspunten dat op de juiste wijze is ingedeeld.",
    precisionDescription:
      "Het deel van de gegevenspunten dat correct is geclassificeerd van alle gegevenspunten die als 1 zijn geclassificeerd.",
    recallDescription:
      "Het deel van de gegevenspunten dat correct is geclassificeerd van alle gegevenspunten waarvan het werkelijke label 1 is. Alternatieve benamingen: frequentie terecht-positieven, gevoeligheid.",
    rmseDescription:
      "Vierkantswortel van het gemiddelde van de kwadratische fouten.",
    mseDescription: "Het gemiddelde van de kwadratische fouten.",
    meanAbsoluteErrorDescription:
      "Het gemiddelde van de absolute waarden van fouten. Robuuster voor uitschieters dan MSE.",
    r2Description:
      "Het deel afwijking in de labels die worden uitgelegd door het model.",
    aucDescription:
      "De kwaliteit van de voorspellingen, die worden weergegeven als scores, in het scheiden van positieve voorbeelden van negatieve voorbeelden.",
    balancedRMSEDescription:
      "Positieve en negatieve voorbeelden worden opnieuw gewogen zodat ze even zwaar wegen. Geschikt als de onderliggende gegevens zeer ongelijk zijn verdeeld.",
    balancedAccuracyDescription:
      "Positieve en negatieve voorbeelden worden opnieuw gewogen zodat ze even zwaar wegen. Geschikt als de onderliggende gegevens zeer ongelijk zijn verdeeld.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Bins configureren",
    makeCategorical: "Beschouwen als categorisch",
    save: "Opslaan",
    cancel: "Annuleren",
    numberOfBins: "Aantal bins:",
    categoryHeader: "Binwaarden:"
  }
};

module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  defaultClassNames: "Třída {0}",
  defaultFeatureNames: "Citlivý příznak {0}",
  defaultSingleFeatureName: "Citlivý příznak",
  defaultCustomMetricName: "Vlastní metrika {0}",
  accuracyTab: "Nestrannost ve výkonu",
  opportunityTab: "Nestrannost v příležitosti",
  modelComparisonTab: "Porovnání modelů",
  tableTab: "Zobrazení podrobností",
  dataSpecifications: "Statistiky dat",
  attributes: "Atributy",
  singleAttributeCount: "1 citlivý příznak",
  attributesCount: "Počet citlivých příznaků: {0}",
  instanceCount: "Počet instancí: {0}",
  close: "Zavřít",
  calculating: "Probíhá výpočet...",
  accuracyMetric: "Metrika výkonu",
  errorOnInputs:
    "Chyba ve vstupu. Citlivé příznaky musí být v tuto chvíli kategorické hodnoty. Namapujte prosím hodnoty na intervalové kategorie a zkuste to znovu.",
  Accuracy: {
    header: "Jak chcete měřit výkon?",
    modelMakes: "Značky modelů",
    modelsMake: "Značka modelů",
    body:
      "Vaše data obsahují několik popisků (celkem {0}) a predikce {2} {1}. Na základě této informace doporučujeme následující metriky. Vyberte prosím ze seznamu jednu metriku.",
    binaryClassifier: "binární klasifikátor",
    probabalisticRegressor: "Regresor probit",
    regressor: "regresor",
    binary: "binární",
    continuous: "průběžné"
  },
  Parity: {
    header: "Nestrannost měřená ve smyslu nekonzistence",
    body:
      "Metriky nekonzistence vyjadřují proměnlivost chování modelu mezi vybranými příznaky. Existují dva druhy metrik nekonzistence: další připravujeme..."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Dokumentace"
  },
  Footer: {
    back: "Zpět",
    next: "Další"
  },
  Intro: {
    welcome: "Vítá vás",
    fairlearnDashboard: "Řídicí panel Fairlearn",
    introBody:
      "Řídicí panel Fairlearn umožňuje posoudit kompromisy mezi výkonem a nestranností modelů.",
    explanatoryStep:
      "Pokud chcete nastavit posouzení, musí se zadat citlivý příznak a metrika výkonu.",
    getStarted: "Začínáme",
    features: "Citlivé příznaky",
    featuresInfo:
      "Citlivé příznaky se používají k rozdělení dat do skupin. Nestrannost modelu mezi těmito skupinami se měří jako metriky nekonzistence. Metriky nekonzistence vyjadřují, jak moc se chování modelu liší mezi jednotlivými skupinami.",
    accuracy: "Metrika výkonu",
    accuracyInfo:
      "Metriky výkonu se používají k vyhodnocení celkové kvality modelu i kvality modelu v jednotlivých skupinách. Rozdíl mezi odlehlými hodnotami metriky výkonu ve skupinách se označuje za nekonzistenci ve výkonu."
  },
  ModelComparison: {
    title: "Porovnání modelů",
    howToRead: "Jak přečíst tento graf",
    lower: "méně",
    higher: "více",
    howToReadText:
      "Tento graf reprezentuje každý z modelů {0} jako bod, který se dá vybrat. Osa x představuje {1}, kde {2} je lépe. Osa y představuje nekonzistenci a méně je lépe.",
    insights: "Přehledy",
    insightsText1: "Graf zobrazuje {0} a nekonzistenci modelů {1}.",
    insightsText2:
      "{0} má rozsah od {1} do {2}. Rozsah nekonzistence je od {3} do {4}.",
    insightsText3:
      "Nejpřesnější model dosahuje {0} z {1} a má nekonzistenci {2}.",
    insightsText4: "Model s nejmenší nekonzistencí {2} dosahuje {0} z {1}.",
    disparityInOutcomes: "Nekonzistence v predikcích",
    disparityInAccuracy: "Nekonzistence v {0}",
    howToMeasureDisparity: "Jak se má nekonzistence měřit?"
  },
  Report: {
    modelName: "Model {0}",
    title: "Nekonzistence ve výkonu",
    globalAccuracyText: "Je celkové {0}",
    accuracyDisparityText: "Je nekonzistence v {0}",
    editConfiguration: "Upravit konfiguraci",
    backToComparisons: "Vícemodelové zobrazení",
    outcomesTitle: "Nekonzistence v predikcích",
    minTag: "Minimum",
    maxTag: "Maximum",
    groupLabel: "Podskupina",
    underestimationError: "Podhodnocení",
    underpredictionExplanation: "(predikováno = 0, skutečnost = 1)",
    overpredictionExplanation: "(predikováno = 1, skutečnost = 0)",
    overestimationError: "Nadhodnocení",
    classificationOutcomesHowToRead:
      "Pruhový graf zobrazuje míru výběru v jednotlivých skupinách, tedy podíl bodů klasifikovaných jako 1.",
    regressionOutcomesHowToRead:
      "Krabicové diagramy zobrazují distribuci chyb v jednotlivých skupinách. Jednotlivé datové body se zobrazují v popředí.",
    classificationAccuracyHowToRead1:
      "Pruhový graf zobrazuje distribuci chyb v jednotlivých skupinách.",
    classificationAccuracyHowToRead2:
      "Chyby jsou rozdělené na chyby nadhodnocení (predikuje se 1, když skutečný popisek je 0) a chyby podhodnocení (predikuje se 0, když skutečný popisek je 1).",
    classificationAccuracyHowToRead3:
      "Uvedené míry se získají vydělením počtu chyb celkovou velikostí skupiny.",
    probabilityAccuracyHowToRead1:
      "Pruhový graf zobrazuje střední absolutní chybu v jednotlivých skupinách rozdělenou na nadhodnocení a podhodnocení.",
    probabilityAccuracyHowToRead2:
      "Pro každou ukázku změříme rozdíl mezi predikcí a popiskem. Pokud je kladný, nazveme ho nadhodnocením, a pokud je záporný, je to podhodnocení.",
    probabilityAccuracyHowToRead3:
      "Uvedeme součet chyb nadhodnocení a součet chyb podhodnocení vydělené celkovou velikostí skupiny.",
    regressionAccuracyHowToRead:
      "Chyba je rozdíl mezi predikcí a popiskem. Krabicové diagramy zobrazují distribuci chyb v jednotlivých skupinách. Jednotlivé datové body se zobrazují v popředí.",
    distributionOfPredictions: "Distribuce predikcí",
    distributionOfErrors: "Distribuce chyb",
    tooltipPrediction: "Predikce: {0}",
    tooltipError: "Chyba: {0}"
  },
  Feature: {
    header: "Se kterým příznakem byste chtěli vyhodnotit nestrannost modelu?",
    body:
      "Nestrannost se vyhodnocuje ve smyslu nekonzistence chování modelů. Vaše data rozdělíme podle hodnot každého vybraného příznaku a vyhodnotíme, jak se mezi jednotlivými částmi liší metrika výkonu a predikce modelu.",
    learnMore: "Další informace",
    summaryCategoricalCount:
      "Tento příznak má následující počet jedinečných hodnot: {0}",
    summaryNumericCount:
      "Tento číselný příznak má rozsah od {0} do {1} a je seskupený do {2} intervalů.",
    showCategories: "Zobrazit vše",
    hideCategories: "Sbalit",
    categoriesOverflow: "   a tento počet dalších kategorií: {0}",
    editBinning: "Upravit skupiny",
    subgroups: "Podskupiny"
  },
  Metrics: {
    accuracyScore: "Úspěšnost",
    precisionScore: "Přesnost",
    recallScore: "Úplnost",
    zeroOneLoss: "Funkce zero-one loss",
    specificityScore: "Skóre specifičnosti",
    missRate: "Míra nesprávných predikcí",
    falloutRate: "Míra vypuštění",
    maxError: "Maximální chyba",
    meanAbsoluteError: "Střední absolutní chyba",
    meanSquaredError: " MSE (střední kvadratická chyba)",
    meanSquaredLogError: "Střední kvadratická logaritmická chyba",
    medianAbsoluteError: "Mediánová absolutní chyba",
    average: "Průměrná predikce",
    selectionRate: "Míra výběru",
    overprediction: "Nadhodnocení",
    underprediction: "Podhodnocení",
    r2_score: "Skóre spolehlivosti R",
    rms_error: "RMSE (odmocněná střední kvadratická chyba)",
    auc: "Oblast pod křivkou ROC",
    balancedRootMeanSquaredError: "Vyrovnané RMSE",
    balancedAccuracy: "Vyrovnaná přesnost",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription: "Část správně klasifikovaných datových bodů",
    precisionDescription:
      "Část správně klasifikovaných datových bodů mezi body klasifikovanými jako 1",
    recallDescription:
      "Část správně klasifikovaných datových bodů mezi body, jejichž skutečný popisek je 1. Alternativní názvy: míra pravdivě pozitivních predikcí, citlivost",
    rmseDescription: "Druhá odmocnina průměru kvadratických chyb",
    mseDescription: "Průměr kvadratických chyb",
    meanAbsoluteErrorDescription:
      "Průměr absolutních hodnot chyb. Je robustnější vůči odlehlým hodnotám než MSE.",
    r2Description: "Část odchylky v popiscích vysvětlené modelem",
    aucDescription:
      "Kvalita predikcí při oddělování pozitivních příkladů od těch negativních, zobrazovaná jako skóre",
    balancedRMSEDescription:
      "Váhy pozitivních a negativních příkladů se nastaví znovu, aby příklady měly stejnou celkovou váhu. Vhodné v situacích, kdy jsou základní data ve výrazné nerovnováze.",
    balancedAccuracyDescription:
      "Váhy pozitivních a negativních příkladů se nastaví znovu, aby příklady měly stejnou celkovou váhu. Vhodné v situacích, kdy jsou základní data ve výrazné nerovnováze.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Nakonfigurovat intervaly",
    makeCategorical: "Považovat za kategorické",
    save: "Uložit",
    cancel: "Zrušit",
    numberOfBins: "Počet intervalů:",
    categoryHeader: "Hodnoty intervalů:"
  }
};

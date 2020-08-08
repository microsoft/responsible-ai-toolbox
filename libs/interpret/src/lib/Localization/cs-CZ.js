module.exports = {
  selectPoint:
    "Pokud si chcete zobrazit místní vysvětlení určitého bodu, vyberte daný bod.",
  defaultClassNames: "Třída {0}",
  defaultFeatureNames: "Příznak {0}",
  absoluteAverage: "Průměr absolutní hodnoty",
  predictedClass: "Predikovaná třída",
  datasetExplorer: "Průzkumník datových sad",
  dataExploration: "Průzkum datové sady",
  aggregateFeatureImportance: "Důležitost agregovaného příznaku",
  globalImportance: "Globální důležitost",
  explanationExploration: "Průzkum vysvětlení",
  individualAndWhatIf: "Důležitost jednotlivých příznaků a citlivostní analýza",
  summaryImportance: "Důležitost souhrnu",
  featureImportance: "Významnost atributu",
  featureImportanceOf: "Důležitost příznaku {0}",
  perturbationExploration: "Průzkum perturbace",
  localFeatureImportance: "Významnost místního atributu",
  ice: "ICE",
  clearSelection: "Vymazat výběr",
  feature: "Funkce:",
  intercept: "Zachycení",
  modelPerformance: "Výkon modelu",
  ExplanationScatter: {
    dataLabel: "Data: {0}",
    importanceLabel: "Důležitost: {0}",
    predictedY: "Predikované Y",
    index: "Index",
    dataGroupLabel: "Data",
    output: "Výstup",
    probabilityLabel: "Pravděpodobnost: {0}",
    trueY: "Skutečné Y",
    class: "třída: ",
    xValue: "Hodnota X:",
    yValue: "Hodnota Y:",
    colorValue: "Barva:",
    count: "Počet"
  },
  CrossClass: {
    label: "Vážení mezi třídami:",
    info: "Informace o výpočtu mezi třídami",
    overviewInfo:
      "Modely s více třídami generují pro každou třídu vektor významností nezávislých atributů. Vektor významností atributů jednotlivých tříd ukazuje, kvůli kterým příznakům je určitá třída pravděpodobnější nebo méně pravděpodobná. Můžete vybrat, jak se váhy vektorů významností atributů pro jednotlivé třídy shrnují do jedné hodnoty:",
    absoluteValInfo:
      "Průměr absolutní hodnoty: Udává součet důležitosti příznaku ve všech možných třídách vydělený počtem tříd.",
    predictedClassInfo:
      "Predikovaná třída: Udává hodnotu významnosti atributu pro predikovanou třídu daného bodu.",
    enumeratedClassInfo:
      "Výčet názvů tříd: Udává jen významnost atributu zadané třídy ve všech datových bodech.",
    close: "Zavřít",
    crossClassWeights: "Váhy mezi třídami"
  },
  AggregateImportance: {
    scaledFeatureValue: "Škálovaná hodnota příznaku",
    low: "Nízká",
    high: "Vysoká",
    featureLabel: "Příznak: {0}",
    valueLabel: "Hodnota příznaku: {0}",
    importanceLabel: "Důležitost: {0}",
    predictedClassTooltip: "Predikovaná třída: {0}",
    trueClassTooltip: "Skutečná třída: {0}",
    predictedOutputTooltip: "Predikovaný výstup: {0}",
    trueOutputTooltip: "Skutečný výstup: {0}",
    topKFeatures: "Hlavních K příznaků:",
    topKInfo: "Jak se počítá prvních k",
    predictedValue: "Předpokládaná hodnota",
    predictedClass: "Predikovaná třída",
    trueValue: "Pravdivá hodnota",
    trueClass: "Skutečná třída",
    noColor: "Žádné",
    tooManyRows:
      "Poskytnutá datová sada je větší, než jakou tento graf podporuje."
  },
  BarChart: {
    classLabel: "Třída: {0}",
    sortBy: "Řadit podle",
    noData: "Žádná data",
    absoluteGlobal: "Absolutní globální",
    absoluteLocal: "Absolutní lokální",
    calculatingExplanation: "Počítá se vysvětlení."
  },
  IcePlot: {
    numericError: "Musí to být číslo.",
    integerError: "Musí to být celé číslo.",
    prediction: "Predikce",
    predictedProbability: "Predikovaná pravděpodobnost",
    predictionLabel: "Predikce: {0}",
    probabilityLabel: "Pravděpodobnost: {0}",
    noModelError:
      "Pokud chcete prozkoumat predikce v grafech ICE, poskytněte prosím zprovozněný model.",
    featurePickerLabel: "Funkce:",
    minimumInputLabel: "Minimum:",
    maximumInputLabel: "Maximum:",
    stepInputLabel: "Kroky:",
    loadingMessage: "Načítají se data...",
    submitPrompt: "Pokud si chcete zobrazit graf ICE, odešlete rozsah.",
    topLevelErrorMessage: "Chyba v parametru",
    errorPrefix: "Došlo k chybě: {0}"
  },
  PerturbationExploration: {
    loadingMessage: "Načítání...",
    perturbationLabel: "Perturbace:"
  },
  PredictionLabel: {
    predictedValueLabel: "Predikovaná hodnota: {0}",
    predictedClassLabel: "Predikovaná třída: {0}"
  },
  Violin: {
    groupNone: "Bez seskupení",
    groupPredicted: "Predikované Y",
    groupTrue: "Skutečné Y",
    groupBy: "Seskupit podle"
  },
  FeatureImportanceWrapper: {
    chartType: "Typ grafu:",
    violinText: "Houslový",
    barText: "Pruhový",
    boxText: "Pole",
    beehiveText: "Swarm",
    globalImportanceExplanation:
      "Globální významnost atributu se počítá jako průměr absolutní hodnoty významnosti atributu ve všech bodech (normalizace L1). ",
    multiclassImportanceAddendum:
      "Do výpočtu důležitosti příznaku pro všechny třídy se zahrnují všechny body, nepoužívá se žádné rozdílové vážení. Proto příznak, který má velkou zápornou důležitost pro mnoho bodů, pro které se predikovalo, že nejsou třída A, výrazně zvýší důležitost třídy A daného příznaku."
  },
  Filters: {
    equalComparison: "Rovno",
    greaterThanComparison: "Větší než",
    greaterThanEqualToComparison: "Je větší nebo rovno",
    lessThanComparison: "Menší než",
    lessThanEqualToComparison: "Je menší nebo rovno",
    inTheRangeOf: "V rozsahu",
    categoricalIncludeValues: "Zahrnuté hodnoty:",
    numericValue: "Hodnota",
    numericalComparison: "Operace",
    minimum: "Minimum",
    maximum: "Maximum",
    min: "Minimum: {0}",
    max: "Maximum: {0}",
    uniqueValues: "Počet jedinečných hodnot: {0}"
  },
  Columns: {
    regressionError: "Chyba regrese",
    error: "Chyba",
    classificationOutcome: "Výsledek klasifikace",
    truePositive: "Pravdivě pozitivní",
    trueNegative: "Pravdivě negativní",
    falsePositive: "Falešně pozitivní",
    falseNegative: "Falešně negativní",
    dataset: "Datová sada",
    predictedProbabilities: "Pravděpodobnosti predikce",
    none: "Počet"
  },
  WhatIf: {
    closeAriaLabel: "Zavřít",
    defaultCustomRootName: "Kopie řádku {0}",
    filterFeaturePlaceholder: "Vyhledat příznaky"
  },
  Cohort: {
    cohort: "Kohorta",
    defaultLabel: "Všechna data"
  },
  GlobalTab: {
    helperText:
      "Prozkoumejte hlavních k důležitých příznaků, které mají vliv na celkové predikce modelu (tzv. globální vysvětlení). Pomocí posuvníku můžete zobrazit hodnoty důležitosti příznaků v sestupném pořadí. Pokud si chcete hodnoty důležitosti příznaků zobrazit vedle sebe, můžete vybrat až tři kohorty. Klikněte na kterýkoli z pruhů příznaků v grafu a zobrazí se míra vlivu vybraného příznaku na predikci modelu.",
    topAtoB: "Hlavních {0}–{1} příznaků",
    datasetCohorts: "Kohorty datové sady",
    legendHelpText:
      "Kliknutím na položky legendy v grafu můžete zapínat nebo vypínat kohorty.",
    sortBy: "Řadit podle",
    viewDependencePlotFor: "Zobrazit graf závislostí pro:",
    datasetCohortSelector: "Vyberte kohortu datové sady.",
    aggregateFeatureImportance: "Důležitost agregovaného příznaku",
    missingParameters:
      "Tato karta vyžaduje, aby se zadal parametr významnosti místního příznaku.",
    weightOptions: "Váhy důležitosti tříd",
    dependencePlotTitle: "Grafy závislostí",
    dependencePlotHelperText:
      "Tento graf závislostí zobrazuje vztah mezi hodnotou příznaku a odpovídající důležitostí příznaku v celé kohortě.",
    dependencePlotFeatureSelectPlaceholder: "Vyberte příznak.",
    datasetRequired:
      "Grafy závislostí vyžadují vyhodnocovací datovou sadu a místní pole důležitostí příznaků."
  },
  CohortBanner: {
    dataStatistics: "Statistiky dat",
    datapoints: "Počet datových bodů: {0}",
    features: "Počet příznaků: {0}",
    filters: "Počet filtrů: {0}",
    binaryClassifier: "Binární klasifikátor",
    regressor: "Regresor",
    multiclassClassifier: "Klasifikátor pro více tříd",
    datasetCohorts: "Kohorty datové sady",
    editCohort: "Upravit kohortu",
    duplicateCohort: "Duplikovat kohortu",
    addCohort: "Přidat kohortu",
    copy: " kopírovat"
  },
  ModelPerformance: {
    helperText:
      "Vyhodnoťte výkon modelu tím, že prozkoumáte distribuci hodnot predikce a hodnot metrik výkonu modelu. Podrobněji můžete model prozkoumat tak, že se podíváte na srovnávací analýzu výkonu mezi různými kohortami nebo podskupinami v datové sadě. Pro informace v různých dimenzích použijte filtry pro hodnoty x a y. Ozubené kolo v grafu umožňuje změnit typ grafu.",
    modelStatistics: "Statistika modelu",
    cohortPickerLabel: "Vyberte kohortu databáze, kterou chcete prozkoumat.",
    missingParameters:
      "Tato karta vyžaduje, aby se zadalo pole predikovaných hodnot z modelu.",
    missingTrueY:
      "Statistika výkonu modelu vyžaduje, aby se kromě predikovaných výsledků poskytly i skutečné výsledky."
  },
  Charts: {
    yValue: "Hodnota Y",
    numberOfDatapoints: "Počet datových bodů",
    xValue: "Hodnota X",
    rowIndex: "Index řádku",
    featureImportance: "Důležitost příznaku",
    countTooltipPrefix: "Počet: {0}",
    count: "Počet",
    featurePrefix: "Příznak",
    importancePrefix: "Důležitost",
    cohort: "Kohorta",
    howToRead: "Jak přečíst tento graf"
  },
  DatasetExplorer: {
    helperText:
      "Prozkoumejte statistiky datové sady tím, že vyberete různé filtry pro osy X, Y a barvy a rozdělíte data podle různých dimenzí. Vytvořte výše uvedené kohorty datové sady a analyzujte její statistiky pomocí filtrů, jako jsou predikované výsledky, příznaky datové sady a skupiny chyb. Pomocí ikony ozubeného kola v pravém horním rohu grafu můžete změnit typy grafů.",
    colorValue: "Hodnota barvy",
    individualDatapoints: "Jednotlivé datové body",
    aggregatePlots: "Agregované grafy",
    chartType: "Typ grafu",
    missingParameters:
      "Tato karta vyžaduje, aby se zadala datová sada pro vyhodnocení.",
    noColor: "Žádný"
  },
  DependencePlot: {
    featureImportanceOf: "Důležitost příznaku",
    placeholder:
      "Pokud si chcete zobrazit graf závislostí příznaku, klikněte na příznak v pruhovém grafu výše."
  },
  WhatIfTab: {
    helperText:
      "Když kliknete na bodový diagram, můžete vybrat datový bod, aby se zobrazily jeho místní hodnoty důležitosti příznaků (místní vysvětlení) a graf jednotlivých podmíněných očekávání (ICE) níže. Pomocí panelu napravo můžete perturbovat příznaky známého datového bodu a vytvořit hypotetický datový bod citlivostní analýzy. Hodnoty důležitosti příznaků se zakládají na mnoha odhadech, nepředstavují odůvodnění predikcí. Bez striktní matematické robustnosti běžného vyvozování nedoporučujeme uživatelům zakládat na tomto nástroji skutečná rozhodnutí.",
    panelPlaceholder:
      "Aby bylo možné predikovat nové datové body, vyžaduje se model.",
    cohortPickerLabel: "Vyberte kohortu databáze, kterou chcete prozkoumat.",
    scatterLegendText:
      "Kliknutím na položky legendy v grafu můžete zapínat nebo vypínat datové body.",
    realPoint: "Skutečné datové body",
    noneSelectedYet: "Zatím se žádné nevybraly.",
    whatIfDatapoints: "Datové body citlivostní analýzy",
    noneCreatedYet: "Zatím se žádné nevytvořily.",
    showLabel: "Zobrazit:",
    featureImportancePlot: "Graf důležitosti příznaku",
    icePlot: "Graf jednotlivých podmíněných očekávání (ICE)",
    featureImportanceLackingParameters:
      "Pokud si chcete zobrazit, jak každý příznak ovlivňuje jednotlivé predikce, poskytněte významnosti místních příznaků.",
    featureImportanceGetStartedText:
      "Pokud si chcete zobrazit důležitost příznaku, vyberte nějaký bod.",
    iceLackingParameters:
      "Aby bylo možné provádět predikce hypotetických datových bodů, grafy ICE vyžadují zprovozněný model.",
    IceGetStartedText:
      "Pokud si chcete zobrazit grafy ICE, vyberte bod nebo vytvořte bod citlivostní analýzy",
    whatIfDatapoint: "Datový bod citlivostní analýzy",
    whatIfHelpText:
      "Vyberte bod na grafu nebo ručně zadejte známý index datového bodu, který se má perturbovat, a uložte ho jako nový bod citlivostní analýzy.",
    indexLabel: "Datový index pro perturbaci",
    rowLabel: "Řádek {0}",
    whatIfNameLabel: "Název datového bodu citlivostní analýzy",
    featureValues: "Hodnoty příznaku",
    predictedClass: "Predikovaná třída: ",
    predictedValue: "Předpokládaná hodnota: ",
    probability: "Pravděpodobnost: ",
    trueClass: "Skutečná třída: ",
    trueValue: "Skutečná hodnota: ",
    "trueValue.comment": "Předpona pro skutečný popisek pro regresi",
    newPredictedClass: "Nová predikovaná třída: ",
    newPredictedValue: "Nová predikovaná hodnota: ",
    newProbability: "Nová pravděpodobnost: ",
    saveAsNewPoint: "Uložit jako nový bod",
    saveChanges: "Uložit změny",
    loading: "Načítání...",
    classLabel: "Třída: {0}",
    minLabel: "Min.",
    maxLabel: "Max.",
    stepsLabel: "Kroky",
    disclaimer:
      "Upozornění: Tato vysvětlení se zakládají na mnoha odhadech, nepředstavují odůvodnění predikcí. Bez striktní matematické robustnosti běžného vyvozování nedoporučujeme uživatelům zakládat na tomto nástroji skutečná rozhodnutí.",
    missingParameters:
      "Tato karta vyžaduje, aby se zadala datová sada pro vyhodnocení.",
    selectionLimit: "Maximálně 3 vybrané body",
    classPickerLabel: "Třída",
    tooltipTitleMany: "Hlavních {0} predikovaných tříd",
    whatIfTooltipTitle: "Predikované třídy citlivostní analýzy",
    tooltipTitleFew: "Predikované třídy",
    probabilityLabel: "Pravděpodobnost",
    deltaLabel: "Delta",
    nonNumericValue: "Hodnota by měla být číselná.",
    icePlotHelperText:
      "Grafy ICE ukazují, jak se hodnoty predikcí vybraného datového bodu mění v rozsahu mezi maximální a minimální hodnotou příznaku."
  },
  CohortEditor: {
    selectFilter: "Vybrat filtr",
    TreatAsCategorical: "Považovat za kategorické",
    addFilter: "Přidat filtr",
    addedFilters: "Přidané filtry",
    noAddedFilters: "Zatím se nepřidaly žádné filtry.",
    defaultFilterState:
      "Pokud chcete do kohorty datové sady přidat parametry, vyberte filtr.",
    cohortNameLabel: "Název kohorty datové sady",
    cohortNamePlaceholder: "Pojmenujte svou kohortu.",
    save: "Uložit",
    delete: "Odstranit",
    cancel: "Zrušit",
    cohortNameError: "Chybí název kohorty",
    placeholderName: "Kohorta {0}"
  },
  AxisConfigDialog: {
    select: "Vybrat",
    ditherLabel: "Použít dithering",
    selectFilter: "Vyberte hodnotu osy.",
    selectFeature: "Vyberte funkci.",
    binLabel: "Použít pro data binning",
    TreatAsCategorical: "Považovat za kategorické",
    numOfBins: "Počet intervalů",
    groupByCohort: "Seskupit podle kohorty",
    selectClass: "Vybrat třídu",
    countHelperText: "Histogram počtu bodů"
  },
  ValidationErrors: {
    predictedProbability: "Predikovaná pravděpodobnost",
    predictedY: "Predikované Y",
    evalData: "Datová sada pro vyhodnocení",
    localFeatureImportance: "Významnost místního příznaku",
    inconsistentDimensions:
      "Nekonzistentní dimenze. {0} má dimenze {1}, očekávalo se {2}.",
    notNonEmpty: "Vstup {0} není neprázdné pole.",
    varyingLength: "Nekonzistentní dimenze. {0} má prvky různé délky.",
    notArray: "{0} není pole. Očekávalo se pole dimenze {1}.",
    errorHeader:
      "Některé vstupní parametry nebyly konzistentní a nepoužijí se: ",
    datasizeWarning:
      "Datová sada pro vyhodnocení je příliš velká na to, aby se dala efektivně zobrazit v některých grafech. Přidejte prosím filtry, které kohortu zmenší. ",
    datasizeError:
      "Vybraná kohorta je příliš velká, přidejte prosím filtry, které ji zmenší.",
    addFilters: "Přidat filtry"
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: " zahrnuje {0} ",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} a další (celkem {1})"
  },
  Statistics: {
    mse: "MSE: {0}",
    rSquared: "Spolehlivost R: {0}",
    meanPrediction: "Střední predikce: {0}",
    accuracy: "Úspěšnost: {0}",
    precision: "Přesnost: {0}",
    recall: "Úplnost: {0}",
    fpr: "FPR: {0}",
    fnr: "FNR: {0}"
  },
  GlobalOnlyChart: {
    helperText:
      "Prozkoumejte hlavních k důležitých příznaků, které mají vliv na celkové predikce modelu. Pomocí posuvníku můžete zobrazit důležitosti příznaků v sestupném pořadí."
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "Co tato vysvětlení znamenají?",
    clickHere: "Další informace",
    shapTitle: "Hodnoty Shapley",
    shapDescription:
      "Tento nástroj pro vysvětlení používá SHAP. To je přístup pro vysvětlování modelů založený na teorii her, u kterého se důležitost sad příznaků měří skrýváním těchto příznaků před modelem prostřednictvím marginalizace. Pro další informace klikněte na odkaz uvedený níže.",
    limeTitle: "LIME (Local Interpretable Model-Agnostic Explanations)",
    limeDescription:
      "Tento nástroj pro vysvětlení používá vysvětlení LIME, které nabízí lineární aproximaci modelu. Abychom získali vysvětlení, provádíme tyto kroky: perturbace instance, získání predikcí modelu a využití těchto predikcí jako popisky, abychom naučili zhuštěný, místně věrohodný lineární model. Váhy tohoto lineárního modelu se používají jako důležitosti příznaků. Pro další informace klikněte na odkaz uvedený níže.",
    mimicTitle: "Napodobenina (globální náhradní vysvětlení)",
    mimicDescription:
      "Tento nástroj pro vysvětlení se zakládá na myšlence trénování globálních náhradních modelů, které napodobují modely typu černá skříňka. Globální náhradní model je vnitřně interpretovatelný model, který je natrénovaný tak, aby co nejpřesněji aproximoval predikce jakéhokoli modelu typu černá skříňka. Hodnoty důležitosti příznaků se zakládají na modelu a jsou platné pro základní náhradní model (LightGBM, nebo lineární regrese, nebo metoda Stochastic Gradient Descent, nebo rozhodovací strom).",
    pfiTitle: "Důležitost příznaků permutace (PFI)",
    pfiDescription:
      "Tento nástroj pro vysvětlení náhodně přeuspořádá data pro celou datovou sadu po jednotlivých příznacích a vypočítá, jak moc se mění zkoumaná metrika výkonu (výchozí metriky výkonu: F1 pro binární klasifikaci, skóre F1 s mikroprůměrem pro klasifikaci s více třídami a střední absolutní chybu pro regresi). Čím větší bude změna, tím důležitější je příznak. Tento nástroj pro vysvětlení dokáže vysvětlit jen celkové chování základního modelu, nevysvětluje jednotlivé predikce. Hodnota důležitosti funkce příznaku představuje rozdíl ve výkonu modelu perturbací určitého příznaku."
  }
};

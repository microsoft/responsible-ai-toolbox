module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  defaultClassNames: "{0} osztály",
  defaultFeatureNames: "Érzékeny jellemző: {0}",
  defaultSingleFeatureName: "Érzékeny jellemző",
  defaultCustomMetricName: "Egyéni metrika: {0}",
  accuracyTab: "Teljesítmény méltányossága",
  opportunityTab: "Lehetőség méltányossága",
  modelComparisonTab: "Modell-összehasonlítás",
  tableTab: "Részletes nézet",
  dataSpecifications: "Adatok statisztikái",
  attributes: "Attribútumok",
  singleAttributeCount: "1 érzékeny jellemző",
  attributesCount: "{0} érzékeny jellemző",
  instanceCount: "{0} példány",
  close: "Bezárás",
  calculating: "Számítás...",
  accuracyMetric: "Teljesítménymutató",
  errorOnInputs:
    "Hiba történt a bemenettel. Az érzékeny jellemzőknek jelenleg kategorikus értékeknek kell lenniük. Rendelje hozzá az értékeket dobozolt kategóriákhoz, majd próbálja újra.",
  Accuracy: {
    header: "Hogyan szeretné mérni a teljesítményt?",
    modelMakes: "modell végrehajt",
    modelsMake: "modellek végrehajtanak",
    body:
      "Az adatok {0} címkét és {2} {1} előrejelzést tartalmaznak. Ezen információ alapján a következő metrikákat javasoljuk. Válasszon ki egy metrikát a listából.",
    binaryClassifier: "bináris osztályozó",
    probabalisticRegressor: "probit magyarázó változója",
    regressor: "magyarázó változó",
    binary: "bináris",
    continuous: "folyamatos"
  },
  Parity: {
    header: "Egyenlőtlenség alapján mért méltányosság",
    body:
      "Az egyenlőtlenségi metrikák számszerűsítik a modell viselkedésének variációját a kiválasztott jellemzők tekintetében. Kétféle egyenlőtlenségi metrika létezik: hamarosan...."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Dokumentáció"
  },
  Footer: {
    back: "Vissza",
    next: "Tovább"
  },
  Intro: {
    welcome: "Üdvözöli a",
    fairlearnDashboard: "Fairlearn irányítópult",
    introBody:
      "A Fairlearn-irányítópult lehetővé teszi a modellek teljesítménye és a méltányossága közötti kompromisszumok értékelését",
    explanatoryStep:
      "Az értékelés beállításához meg kell adnia egy érzékeny jellemzőt és egy teljesítménymutatót.",
    getStarted: "Első lépések",
    features: "Érzékeny jellemzők",
    featuresInfo:
      "Az érzékeny jellemzők csoportokra osztják az adatokat. A modell csoportonkénti méltányossága az egyenlőtlenségi metrikák alapján van mérve. Az egyenlőtlenségi metrikák számszerűsítik, hogy a modell csoportonkénti viselkedése mennyire változatos.",
    accuracy: "Teljesítménymutató",
    accuracyInfo:
      "A teljesítménymutató a modell összesített és csoportonkénti teljesítményének kiértékelésére szolgálnak. A teljesítménymutató szélsőséges értékei közötti csoportonkénti különbséget a rendszer teljesítménybeli egyenlőtlenségként fogja lejelenteni."
  },
  ModelComparison: {
    title: "Modell-összehasonlítás",
    howToRead: "A diagram értelmezése",
    lower: "alacsonyabb",
    higher: "magasabb",
    howToReadText:
      "Ez a diagram a(z) {0} modellek mindegyikét kijelölhető pontként ábrázolja. Az x tengelyen {1} látható, ahol {2} jobb. Az Y tengely az egyenlőtlenséget mutatja, ahol az alacsonyabb érték jobb.",
    insights: "Elemzések",
    insightsText1:
      "A diagramon látható a(z) {0} és a(z) {1} modellek egyenlőtlensége.",
    insightsText2:
      "A(z) {0} terjedelme: {1}–{2}. Az egyenlőtlenség terjedelme: {3}–{4}.",
    insightsText3:
      "A legpontosabb modell {1}/{0} értéket és {2} egyenlőtlenséget ér el.",
    insightsText4:
      "A legkisebb egyenlőtlenséges modell {1}/{0} értéket és {2} egyenlőtlenséget ér el.",
    disparityInOutcomes: "Egyenlőtlenség az előrejelzések között",
    disparityInAccuracy: "Egyenlőtlenség itt: {0}",
    howToMeasureDisparity: "Hogyan szeretné mérni az egyenlőtlenséget?"
  },
  Report: {
    modelName: "{0} modell",
    title: "Teljesítménybeli egyenlőtlenség",
    globalAccuracyText: "A teljes {0}",
    accuracyDisparityText: "A(z) {0} egyenlőtlenségét jelenti",
    editConfiguration: "Konfiguráció szerkesztése",
    backToComparisons: "Többmodelles nézet",
    outcomesTitle: "Egyenlőtlenség az előrejelzések között",
    minTag: "Minimum",
    maxTag: "Maximum",
    groupLabel: "Alcsoport",
    underestimationError: "Alábecslés",
    underpredictionExplanation: "(előrejelzett = 0, igaz = 1)",
    overpredictionExplanation: "(előrejelzett = 1, igaz = 0)",
    overestimationError: "Túlbecslés",
    classificationOutcomesHowToRead:
      "A sávdiagram az egyes csoportok kiválasztási arányát, vagyis az 1-es osztályozású ponthányadokat jeleníti meg.",
    regressionOutcomesHowToRead:
      "A dobozdiagramok a csoportonként eloszló előrejelzéseket mutatják. Az egyéni adatpontok felül, átfedésben jelennek meg.",
    classificationAccuracyHowToRead1:
      "A sávdiagram az eltérések eloszlását mutatja az egyes csoportokban.",
    classificationAccuracyHowToRead2:
      "Az eltéréseket a rendszer túlbecslési eltérésekre (az előrejelzés 1, miközben a valós címke 0) és alábecslési eltérésekre (az előrejelzés 0, miközben a valós címke 1) bontja.",
    classificationAccuracyHowToRead3:
      "A jelentett arányokat az eltérések számának a csoport teljes méretével való elosztása eredményezi.",
    probabilityAccuracyHowToRead1:
      "A sávdiagram az egyes csoportokátlagos abszolút eltérését mutatja, túlbecslésre és alábecslésre osztva.",
    probabilityAccuracyHowToRead2:
      "Minden példa esetében az előrejelzés és a címke közti különbséget mérjük. Ha a különbség pozitív, azt túlbecslésnek, ha negatív, azt alábecslésnek nevezzük.",
    probabilityAccuracyHowToRead3:
      "A jelentésben a túlbecslések és az alábecslések eltérései összegének és a csoport teljes méretének hányadosa szerepel.",
    regressionAccuracyHowToRead:
      "Az eltérés az előrejelzés és a címke közötti különbséget jelöli. A dobozdiagramok a csoportonkénti hibaeloszlást mutatják. Az egyéni adatpontok felül, átfedésben jelennek meg.",
    distributionOfPredictions: "Előrejelzések eloszlása",
    distributionOfErrors: "Eltérések eloszlása",
    tooltipPrediction: "Előrejelzés: {0}",
    tooltipError: "Eltérés: {0}"
  },
  Feature: {
    header:
      "Mely jellemzők mellett szeretné kiértékelni a modell méltányosságát?",
    body:
      "A méltányosságot a rendszer a modell viselkedésében mutatkozó egyenlőtlenségek alapján értékeli ki. Az adatokat az egyes kiválasztott jellemzők értékei szerint osztjuk fel, és kiértékeljük, hogy a modell teljesítménymutatója és előrejelzései felosztásonként hogyan változik.",
    learnMore: "További információ",
    summaryCategoricalCount: "Ez a jellemző {0} egyedi értékeket tartalmaz",
    summaryNumericCount:
      "Ez a numerikus jellemző {0} és {1} között mozog, és {2} dobozba van csoportosítva.",
    showCategories: "Összes megjelenítése",
    hideCategories: "Összecsukás",
    categoriesOverflow: "   és további {0} kategória",
    editBinning: "Csoportok szerkesztése",
    subgroups: "Alcsoportok"
  },
  Metrics: {
    accuracyScore: "Pontosság",
    precisionScore: "Pontosság",
    recallScore: "Felidézés",
    zeroOneLoss: "Nulla–egy veszteség",
    specificityScore: "Specifikussági pontszám",
    missRate: "Kihagyási arány",
    falloutRate: "Kiesési valószínűség",
    maxError: "Maximális eltérés",
    meanAbsoluteError: "Átlagos abszolút eltérés",
    meanSquaredError: " MSE (átlagos négyzetes eltérés)",
    meanSquaredLogError: "Átlagos négyzetes naplóeltérés",
    medianAbsoluteError: "Medián abszolút eltérés",
    average: "Átlagos előrejelzés",
    selectionRate: "Kiválasztási arány",
    overprediction: "Túlbecslés",
    underprediction: "Alábecslés",
    r2_score: "Négyzetgyök pontszám",
    rms_error: "RMSE (gyökér-átlagos négyzetes eltérés)",
    auc: "ROC-görbe alatti terület",
    balancedRootMeanSquaredError: "Kiegyensúlyozott RMSE",
    balancedAccuracy: "Kiegyensúlyozott pontosság",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription: "A megfelelően osztályozott adatpontok hányada.",
    precisionDescription:
      "Az 1-es osztályozású adatpontok hányada, amelyek helyesen vannak osztályozva.",
    recallDescription:
      "Az 1-es valós címkével rendelkező adatpontok hányada, amelyek helyesen vannak osztályozva. Alternatív megnevezés: valós pozitív arány, érzékenység.",
    rmseDescription: "A négyzetes eltérések átlagának négyzetgyöke.",
    mseDescription: "A négyzetes eltérések átlaga.",
    meanAbsoluteErrorDescription:
      "Az eltérések abszolút értékeinek átlaga. Ellenállóbbak a kiugró értékekkel szemben, mint az MSE.",
    r2Description: "A címkék modell által kifejtett varianciahányada.",
    aucDescription:
      "Az előrejelzések pontszámként ábrázolt minősége a pozitív és a negatív példák elkülönítése terén.",
    balancedRMSEDescription:
      "A rendszer újrasúlyozza a pozitív és negatív példákat, hogy a teljes súly egyenlő legyen. Akkor ajánlott, ha a mögöttes adatok nagy mértékben kiegyensúlyozatlanok.",
    balancedAccuracyDescription:
      "A rendszer újrasúlyozza a pozitív és negatív példákat, hogy a teljes súly egyenlő legyen. Akkor ajánlott, ha a mögöttes adatok nagy mértékben kiegyensúlyozatlanok.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Dobozok konfigurálása",
    makeCategorical: "Kezelés kategorikusként",
    save: "Mentés",
    cancel: "Mégse",
    numberOfBins: "Dobozok száma:",
    categoryHeader: "Dobozértékek:"
  }
};

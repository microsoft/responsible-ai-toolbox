module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
  defaultClassNames: "Klasa {0}",
  defaultFeatureNames: "Cecha wrażliwa {0}",
  defaultSingleFeatureName: "Cecha wrażliwa",
  defaultCustomMetricName: "Metryka niestandardowa {0}",
  accuracyTab: "Atrakcyjność wydajności",
  opportunityTab: "Atrakcyjność okazji",
  modelComparisonTab: "Porównanie modeli",
  tableTab: "Widok szczegółów",
  dataSpecifications: "Statystyki danych",
  attributes: "Atrybuty",
  singleAttributeCount: "1 cecha wrażliwa",
  attributesCount: "Cechy wrażliwe w liczbie {0}",
  instanceCount: "Wystąpienia: {0}",
  close: "Zamknij",
  calculating: "Trwa obliczanie...",
  accuracyMetricLegacy: "Metryka wydajności",
  errorOnInputs:
    "Błąd danych wejściowych. Cechy wrażliwe muszą być teraz wartościami kategorialnymi. Zamapuj wartości do kategorii w przedziałach i ponów próbę.",
  Accuracy: {
    header: "Jak chcesz mierzyć wydajność?",
    modelMakes: "model tworzy",
    modelsMake: "modele tworzą",
    body:
      "Dane zawierają etykiety w liczbie {0} oraz przewidywania ({2} {1}). Na podstawie tych informacji zalecamy następujące metryki. Wybierz jedną metrykę z listy.",
    binaryClassifier: "klasyfikator binarny",
    probabalisticRegressor: "regresor probitów",
    regressor: "regresor",
    binary: "binarny",
    continuous: "ciągły"
  },
  Parity: {
    header: "Atrakcyjność mierzona za pomocą rozbieżności",
    body:
      "Metryki rozbieżności określają wartość odchylenia dla zachowania modelu w ramach wybranych cech. Istnieją dwa rodzaje metryk rozbieżności: informacje zostaną uzupełnione...."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Dokumentacja"
  },
  Footer: {
    back: "Wstecz",
    next: "Dalej"
  },
  Intro: {
    welcome: "Witamy w",
    fairlearnDashboard: "Pulpit nawigacyjny Fairlearn",
    introBody:
      "Pulpit nawigacyjny Fairlearn umożliwia ocenę kompromisów między wydajnością i atrakcyjnością modeli",
    explanatoryStep:
      "Aby skonfigurować ocenę, należy określić cechę wrażliwą i metrykę wydajności.",
    getStarted: "Rozpocznij",
    features: "Cechy wrażliwe",
    featuresInfo:
      "Cechy wrażliwe służą do dzielenia danych na grupy. Atrakcyjność modelu w ramach tych grup jest mierzona za pomocą metryk rozbieżności. Metryki rozbieżności określają wielkość różnic w zachowaniu modelu względem grup.",
    accuracy: "Metryka wydajności",
    accuracyInfo:
      "Metryki wydajności służą do oceny ogólnej jakości modelu oraz jakości modelu w każdej grupie. Różnica między skrajnymi wartościami metryki wydajności w grupach jest zgłaszana jako rozbieżność wydajności."
  },
  ModelComparison: {
    title: "Porównanie modeli",
    howToRead: "Jak czytać ten wykres",
    lower: "mniejsza",
    higher: "większa",
    howToReadText:
      "Ten wykres reprezentuje każdy z {0} modeli jako punkt, który można wybrać. Oś X reprezentuje {1}, przy czym wartość {2} jest lepsza. Oś Y reprezentuje rozbieżność, przy czym wartość mniejsza jest lepsza.",
    insights: "Analizy",
    insightsText1: "Wykres pokazuje {0} i rozbieżność {1} modeli.",
    insightsText2:
      "Zakresy w liczbie {0} od {1} do {2}. Zakresy rozbieżności od {3} do {4}.",
    insightsText3:
      "Najbardziej dokładny model osiąga {0} z {1} i rozbieżność {2}.",
    insightsText4:
      "Model najniższej rozbieżności osiąga {0} z {1} i rozbieżność {2}.",
    disparityInOutcomes: "Rozbieżność w przewidywaniach",
    disparityInAccuracy: "Rozbieżność w {0}",
    howToMeasureDisparity: "Jak należy mierzyć rozbieżności?"
  },
  Report: {
    modelName: "Model {0}",
    title: "Rozbieżność wydajności",
    globalAccuracyText: "To ogólnie {0}",
    accuracyDisparityText: "To rozbieżność w {0}",
    editConfiguration: "Edytuj konfigurację",
    backToComparisons: "Widok wielu modeli",
    outcomesTitle: "Rozbieżność w przewidywaniach",
    minTag: "Min.",
    maxTag: "Maks.",
    groupLabel: "Podgrupa",
    underestimationError: "Niedoszacowanie",
    underpredictionExplanation: "(przewidywane = 0, rzeczywiste = 1)",
    overpredictionExplanation: "(przewidywane = 1, rzeczywiste = 0)",
    overestimationError: "Przeszacowanie",
    classificationOutcomesHowToRead:
      "Wykres słupkowy pokazuje współczynnik wyboru w każdej grupie, co oznacza ułamek punktów sklasyfikowanych jako 1.",
    regressionOutcomesHowToRead:
      "Wykresy skrzynkowe pokazują rozkład przewidywań w każdej grupie. Poszczególne punkty danych są nałożone na górze.",
    classificationAccuracyHowToRead1:
      "Wykres słupkowy pokazuje rozkład błędów w każdej grupie.",
    classificationAccuracyHowToRead2:
      "Błędy są podzielone na błędy przeszacowania (przewidywanie 1, gdy rzeczywista etykieta to 0) i niedoszacowania (przewidywanie 0, gdy rzeczywista etykieta to 1).",
    classificationAccuracyHowToRead3:
      "Zgłoszone współczynniki uzyskuje się przez podzielenie liczby błędów przez łączny rozmiar grupy.",
    probabilityAccuracyHowToRead1:
      "Wykres słupkowy pokazuje średni błąd bezwzględny w każdej grupie podzielony na przeszacowania i niedoszacowania.",
    probabilityAccuracyHowToRead2:
      "Dla każdej próbki mierzymy różnicę między przewidywaniem i etykietą. Jeśli jest dodatnia, oznacza to przeszacowanie, a jeśli ujemna — niedoszacowanie.",
    probabilityAccuracyHowToRead3:
      "Zgłaszamy sumę błędów przeszacowania oraz sumę błędów niedoszacowania podzieloną przez łączny rozmiar grupy.",
    regressionAccuracyHowToRead:
      "Błąd to różnica między przewidywaniem i etykietą. Wykresy skrzynkowe pokazują rozkład błędów w każdej grupie. Poszczególne punkty danych są nałożone na górze.",
    distributionOfPredictions: "Rozkład przewidywań",
    distributionOfErrors: "Rozkład błędów",
    tooltipPrediction: "Przewidywanie: {0}",
    tooltipError: "Błąd: {0}"
  },
  Feature: {
    header: "Względem jakich cech chcesz ocenić atrakcyjność modelu?",
    body:
      "Atrakcyjność jest oceniana pod względem rozbieżności w zachowaniu modelu. Dane zostaną podzielone według wartości każdej wybranej cechy, a następnie zostaną ocenione różnice między metryką wydajności i przewidywaniami modelu w ramach tych podziałów.",
    learnMore: "Dowiedz się więcej",
    summaryCategoricalCount: "Liczba unikatowych wartości tej cechy to {0}",
    summaryNumericCount:
      "Zakres tej cechy liczbowej to od {0} do {1} w {2} przedziałach.",
    showCategories: "Pokaż wszystko",
    hideCategories: "Zwiń",
    categoriesOverflow: "   i dodatkowe kategorie w liczbie {0}",
    editBinning: "Edytuj grupy",
    subgroups: "Podgrupy"
  },
  Metrics: {
    accuracyScore: "Dokładność",
    precisionScore: "Dokładność",
    recallScore: "Unieważnij",
    zeroOneLoss: "Utrata zerojedynkowa",
    specificityScore: "Wynik swoistości",
    missRate: "Współczynnik chybień",
    falloutRate: "Współczynnik odpadów",
    maxError: "Maksymalny błąd",
    meanAbsoluteError: "Średni błąd bezwzględny",
    meanSquaredError: " MSE (średni błąd kwadratowy)",
    meanSquaredLogError: "Błąd dziennika średniego kwadratowego",
    medianAbsoluteError: "Mediana błędu bezwzględnego",
    average: "Średnie przewidywanie",
    selectionRate: "Współczynnik wyboru",
    overprediction: "Przeszacowanie",
    underprediction: "Niedoszacowanie",
    r2_score: "Wynik współczynnika R do kwadratu",
    rms_error: "RMSE (średni błąd kwadratowy)",
    auc: "Obszar pod krzywą ROC",
    balancedRootMeanSquaredError: "Zrównoważone RMSE",
    balancedAccuracy: "Zrównoważona dokładność",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription: "Ułamek punktów danych sklasyfikowanych poprawnie.",
    precisionDescription:
      "Ułamek punktów danych sklasyfikowanych poprawnie wśród tych, które sklasyfikowano jako 1.",
    recallDescription:
      "Ułamek punktów danych sklasyfikowanych poprawnie wśród tych, których rzeczywista etykieta to 1. Alternatywne nazwy: rzeczywisty współczynnik poprawności, wrażliwość.",
    rmseDescription: "Pierwiastek kwadratowy ze średniej błędów do kwadratu.",
    mseDescription: "Średnia kwadratów błędów.",
    meanAbsoluteErrorDescription:
      "Średnia wartości bezwzględnych błędów. Bardziej niezawodna dla wartości odstających niż wartość MSE.",
    r2Description: "Ułamek odchylenia w etykietach objaśnionych przez model.",
    aucDescription:
      "Jakość przewidywań dla oddzielania próbek pozytywnych od negatywnych wyświetlana w postaci wyników.",
    balancedRMSEDescription:
      "Próbki pozytywne i negatywne są ważone ponownie, tak aby miały równą wagę łączną. Odpowiednie, jeśli dane podstawowe są bardzo niezrównoważone.",
    balancedAccuracyDescription:
      "Próbki pozytywne i negatywne są ważone ponownie, tak aby miały równą wagę łączną. Odpowiednie, jeśli dane podstawowe są bardzo niezrównoważone.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Konfiguruj przedziały",
    makeCategorical: "Traktuj jako kategorialne",
    save: "Zapisz",
    cancel: "Anuluj",
    numberOfBins: "Liczba przedziałów:",
    categoryHeader: "Wartości przedziału:"
  }
};

module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  defaultClassNames: "{0} sınıfı",
  defaultFeatureNames: "{0} hassas özelliği",
  defaultSingleFeatureName: "Hassas özellik",
  defaultCustomMetricName: "Özel {0} ölçümü",
  accuracyTab: "Performans Eşitliği",
  opportunityTab: "Fırsat Eşitliği",
  modelComparisonTab: "Model karşılaştırması",
  tableTab: "Ayrıntı Görünümü",
  dataSpecifications: "Veri istatistikleri",
  attributes: "Öznitelikler",
  singleAttributeCount: "1 hassas özellik",
  attributesCount: "{0} hassas özellik",
  instanceCount: "{0} örnek",
  close: "Kapat",
  calculating: "Hesaplanıyor...",
  accuracyMetricLegacy: "Performans ölçümü",
  errorOnInputs:
    "Giriş hatası. Hassas özellikler şu anda kategorik değerler olmalıdır. Lütfen değerleri bölmelenmiş kategorilere eşleyip yeniden deneyin.",
  Accuracy: {
    header: "Performansı nasıl ölçmek istiyorsunuz?",
    modelMakes: "model şunları yapar:",
    modelsMake: "modeller şunları yapar:",
    body:
      "Verileriniz {0} etiket ve {2} {1} tahmininizi içeriyor. Bu bilgilere dayanarak, aşağıdaki ölçümleri kullanmanızı öneririz. Lütfen listeden bir ölçüm seçin.",
    binaryClassifier: "ikili sınıflandırıcı",
    probabalisticRegressor: "probit regresörü",
    regressor: "regresör",
    binary: "ikili",
    continuous: "sürekli"
  },
  Parity: {
    header: "Eşitlik, farklar temel alınarak ölçülür",
    body:
      "Fark ölçümleri, modelinizin seçilen özelliklerde gösterdiği davranışın varyasyon miktarını ölçer. İki tür fark ölçümü vardır. Daha fazla ölçüm kullanıma sunulacak..."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Belgeler"
  },
  Footer: {
    back: "Geri",
    next: "Sonraki"
  },
  Intro: {
    welcome: "Hoş geldiniz",
    fairlearnDashboard: "Fairlearn panosu",
    introBody:
      "Fairlearn panosu, modellerinizin performansı ve eşitliği arasındaki karşılaştırmaları değerlendirmenizi sağlar",
    explanatoryStep:
      "Değerlendirmeyi ayarlamak için hassas bir özellik ve performans ölçümü belirtmeniz gerekir.",
    getStarted: "Kullanmaya başlayın",
    features: "Hassas özellikler",
    featuresInfo:
      "Hassas özellikler, verilerinizi gruplara bölmek için kullanılır. Modelinizin bu gruplar arasındaki eşitliği, fark ölçümleriyle ölçülür. Fark ölçümleri, modelinizin bu gruplar arasında ne kadar farklı davrandığını ölçer.",
    accuracy: "Performans ölçümü",
    accuracyInfo:
      "Performans ölçümleri, modelinizin genel ve her gruptaki kalitesini değerlendirmek için kullanılır. Gruplar arasındaki performans ölçümünün uç değerleri arasındaki fark, performans farkı olarak bildirilir."
  },
  ModelComparison: {
    title: "Model karşılaştırması",
    howToRead: "Bu grafiği okuma",
    lower: "daha düşük",
    higher: "daha yüksek",
    howToReadText:
      "Bu grafik, {0} modelin her birini seçilebilir bir nokta olarak temsil eder. X ekseni {1} temsil eder, {2} değerler daha iyidir. Y ekseni farkı temsil eder, düşük değerler daha iyidir.",
    insights: "İçgörüler",
    insightsText1: "Grafik, {1} modelin {0} ve farkını gösterir.",
    insightsText2:
      "{0}, {1} ile {2} aralığındayken, fark {3} ile {4} aralığındadır.",
    insightsText3: "En doğru model, {0}/{1} ve {2} farkını alır.",
    insightsText4: "En düşük farka sahip model {0}/{1} ve {2} farkını alır.",
    disparityInOutcomes: "Tahmin farkı",
    disparityInAccuracy: "{0} farkı",
    howToMeasureDisparity: "Fark nasıl ölçülür?"
  },
  Report: {
    modelName: "{0} modeli",
    title: "Performans farkı",
    globalAccuracyText: "Genel {0}",
    accuracyDisparityText: "{0} farkıdır",
    editConfiguration: "Yapılandırmayı düzenle",
    backToComparisons: "Çoklu model görünümü",
    outcomesTitle: "Tahmin farkı",
    minTag: "Minimum",
    maxTag: "Maksimum",
    groupLabel: "Alt grup",
    underestimationError: "Düşük tahmin",
    underpredictionExplanation: "(tahmini = 0, true = 1)",
    overpredictionExplanation: "(tahmini = 1, true = 0)",
    overestimationError: "Yüksek tahmin",
    classificationOutcomesHowToRead:
      "Çubuk grafik, her gruptaki seçim oranını gösterir. Bu, 1 olarak sınıflandırılan noktaların kesir değerini ifade eder.",
    regressionOutcomesHowToRead:
      "Kutu grafikleri her gruptaki tahminlerin dağılımını gösterir. Veri noktaları ayrı ayrı olacak şekilde en üstte yer alır.",
    classificationAccuracyHowToRead1:
      "Çubuk grafik, her gruptaki hataların dağılımını gösterir.",
    classificationAccuracyHowToRead2:
      "Hatalar, yüksek tahmin hataları (1 tahmin edilirken gerçek etiketin 0 olması) ve düşük tahmin hataları (0 tahmin edilirken gerçek etiketin 1 olması) olarak ayrılır.",
    classificationAccuracyHowToRead3:
      "Bildirilen oranlar, hata sayısı genel grup boyutuna bölünerek bulunur.",
    probabilityAccuracyHowToRead1:
      "Çubuk grafik, her gruptaki ortalama mutlak hataları yüksek tahmin ve düşük tahmin olarak ayrılmış şekilde gösterir.",
    probabilityAccuracyHowToRead2:
      "Her örnekte, tahmin ile etiket arasındaki farkı ölçeriz. Fark pozitifse yüksek tahmin, negatifse düşük tahmin olarak adlandırırız.",
    probabilityAccuracyHowToRead3:
      "Yüksek tahmin hataları ile düşük tahmin hatalarının toplamını toplam grup boyutuna bölerek bildiririz.",
    regressionAccuracyHowToRead:
      "Hata, tahmin ile etiket arasındaki farktır. Kutu grafikleri, her gruptaki hataların dağılımını gösterir. Veri noktaları ayrı ayrı olacak şekilde en üste yer alır.",
    distributionOfPredictions: "Tahmin dağılımı",
    distributionOfErrors: "Hata dağılımı",
    tooltipPrediction: "Tahmin: {0}",
    tooltipError: "Hata: {0}"
  },
  Feature: {
    header:
      "Modelinizin eşitliğini hangi özelliklerle birlikte değerlendirmek istiyorsunuz?",
    body:
      "Eşitlik, modelinizin davranışındaki farklara yönelik olarak değerlendirilir. Verilerinizi seçilen her bir özelliğin değerlerine göre böleriz ve modelinizin performans ölçümü ile tahminlerinin bu bölmeler arasında nasıl farklılık gösterdiğini değerlendiririz.",
    learnMore: "Daha fazla bilgi",
    summaryCategoricalCount: "Bu özellik, {0} benzersiz değer içeriyor",
    summaryNumericCount:
      "Bu sayısal özellik {0} ile {1} aralığındadır ve {2} bölmeye gruplandırılmıştır.",
    showCategories: "Tümünü göster",
    hideCategories: "Daralt",
    categoriesOverflow: "   ve {0} ek kategori",
    editBinning: "Grupları düzenle",
    subgroups: "Alt gruplar"
  },
  Metrics: {
    accuracyScore: "Doğruluk",
    precisionScore: "Duyarlık",
    recallScore: "Geri çağırma",
    zeroOneLoss: "0-1 kayıp",
    specificityScore: "Belirginlik puanı",
    missRate: "İsabetsizlik oranı",
    falloutRate: "Hata oranı",
    maxError: "Maksimum hata sayısı",
    meanAbsoluteError: "Ortalama mutlak hata sayısı",
    meanSquaredError: " MSE (ortalama hata karesi)",
    meanSquaredLogError: "Ortalama günlük hatası karesi",
    medianAbsoluteError: "Ortanca mutlak hata",
    average: "Ortalama tahmin",
    selectionRate: "Seçim oranı",
    overprediction: "Yüksek tahmin",
    underprediction: "Düşük tahmin",
    r2_score: "R kare puanı",
    rms_error: "RMSE (kök ortalama hata karesi)",
    auc: "ROC eğrisinin altındaki alan",
    balancedRootMeanSquaredError: "Dengeli RMSE",
    balancedAccuracy: "Dengeli doğruluk",
    f1Score: "F1-Score",
    logLoss: "Log Loss",
    accuracyDescription:
      "Doğru olarak sınıflandırılmış veri noktalarının kesir değeri.",
    precisionDescription:
      "1 olarak sınıflandırılanların arasında doğru şekilde sınıflandırılmış veri noktalarının kesir değeri.",
    recallDescription:
      "Gerçek etiketi 1 olanların arasında doğru bir şekilde sınıflandırılmış veri noktalarının kesir değeri. Alternatif adlar: gerçek pozitif oran, hassasiyet.",
    rmseDescription: "Hata karelerinin ortalamasının karekökü.",
    mseDescription: "Hata karelerinin ortalaması.",
    meanAbsoluteErrorDescription:
      "Hata mutlak değerlerinin ortalaması. Aykırı değerlere karşı MSE'den daha dayanıklıdır.",
    r2Description:
      "Model tarafından açıklanan etiketlerdeki varyansın kesir değeri.",
    aucDescription:
      "Olumlu örnekleri olumsuz örneklerden ayırırken puan olarak görüntülenen tahminlerin kalitesi.",
    balancedRMSEDescription:
      "Pozitif ve negatif örnekler eşit toplam ağırlığa sahip olacak şekilde yeniden ağırlıklandırılır. Bu, temel alınan verilerin fazla dengesiz olması durumunda uygundur.",
    balancedAccuracyDescription:
      "Pozitif ve negatif örnekler eşit toplam ağırlığa sahip olacak şekilde yeniden ağırlıklandırılır. Bu, temel alınan verilerin fazla dengesiz olması durumunda uygundur.",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Bölmeleri yapılandır",
    makeCategorical: "Kategorik olarak değerlendir",
    save: "Kaydet",
    cancel: "İptal",
    numberOfBins: "Bölme sayısı:",
    categoryHeader: "Bölme değerleri:"
  }
};

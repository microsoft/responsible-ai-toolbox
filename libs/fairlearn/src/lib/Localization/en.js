module.exports = {
  loremIpsum:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "_loremIpsum.comment":
    "DO NOT TRANSLATE. This is placeholder text the user will NOT see",
  defaultClassNames: "Class {0}",
  "_defaultClassNames.comment":
    "models that output classes have this as the default class names when name are not given by the user",
  defaultFeatureNames: "Sensitive feature {0}",
  "_defaultFeatureNames.comment":
    "models that output classes have this as the default class names when name are not given by the user",
  defaultSingleFeatureName: "Sensitive feature",
  defaultCustomMetricName: "Custom metric {0}",
  "_defaultCustomMetricName.comment":
    "prepend in front of the numerical index of the custom metric from the list of custom metrics",
  accuracyTab: "Fairness in Performance",
  opportunityTab: "Fairness in Opportunity",
  modelComparisonTab: "Model comparison",
  tableTab: "Detail View",
  dataSpecifications: "Data statistics",
  attributes: "Attributes",
  singleAttributeCount: "1 sensitive feature",
  attributesCount: "{0} sensitive features",
  "_attributesCount.comment": "formatted string of the number of attributes",
  instanceCount: "{0} instances",
  "_instanceCount.comment": "formatted string of the number of instances",
  close: "Close",
  done: "Done",
  calculating: "Calculating...",
  sensitiveFeatures: "01 Sensitive features",
  accuracyMetric: "02 Performance metrics",
  disparityMetric: "03 Disparity metrics",
  errorOnInputs:
    "Error with input. Sensitive features must be categorical values at this time. Please map values to binned categories and retry.",
  Accuracy: {
    header: "How do you want to measure performance?",
    modelMakes: "model makes",
    modelsMake: "models make",
    body:
      "Your data contains {0} labels and your {2} {1} predictions. Based on that information, we recommend the following metrics. Please select one metric from the list.",
    "_body.comment":
      "States whether labels are binary or continuous (0) and whether predictions are binary or continuous (1). (2) simply allows 'model(s) make' to be either singular or plural",
    binaryClassifier: "binary classifier",
    probabalisticRegressor: "probit regressor",
    regressor: "regressor",
    binary: "binary",
    continuous: "continuous"
  },
  Parity: {
    header: "Fairness measured in terms of disparity",
    body:
      "Disparity metrics quantify variation of your model's behavior across selected features. There are four kinds of disparity metrics: more to come...."
  },
  Header: {
    title: "Fairlearn",
    documentation: "Documentation"
  },
  Footer: {
    back: "Back",
    next: "Next"
  },
  Intro: {
    welcome: "Welcome to the",
    fairlearnDashboard: "Fairlearn dashboard",
    introBody:
      "The Fairlearn dashboard enables you to assess tradeoffs between performance and fairness of your models",
    explanatoryStep:
      "To set up the assessment, you need to specify a sensitive feature and a performance metric.",
    getStarted: "Get started",
    features: "Sensitive features",
    featuresInfo:
      "Sensitive features are used to split your data into groups. Fairness of your model across these groups is measured by disparity metrics. Disparity metrics quantify how much your model's behavior varies across these groups.",
    accuracy: "Performance metric",
    accuracyInfo: "Performance metrics are used to evaluate the overall quality of your model as well as the quality of your model in each group. The difference between the extreme values of the performance metric across the groups is reported as the disparity in performance.",
    parity: "Disparity metrics",
    parityInfo: "Parity metrics are used to evaluate the overall quality of your model as well as the quality of your model in each group. The difference between the extreme values of accuracy is reported as the disparity in accuracy."
  },
  ModelComparison: {
    title: "Model comparison",
    howToRead: "How to read this chart",
    lower: "lower",
    higher: "higher",
    howToReadText:
      "This chart represents each of the {0} models as a selectable point. The x-axis represents {1}, with {2} being better. The y-axis represents disparity, with lower being better.",
    "_howToReadText.comment":
      "Instructions for reading a chart. The number of models in the chart (0), the metric shown of the x-axix (1), and orientation for interpreting the x-axis",
    insights: "Key Insights",
    downloadReport: "Download report",
    disparity: " The disparity ",
    rangesFrom: " ranges from ",
    to: " to ",
    period: ". ",
    introModalText: "Each model is a selectable point. Click or tap on model for it's full fairness assessment.", 
    helpModalText1: "The x-axis represents accuracy, with higher being better.",
    helpModalText2: "The y-axis represents disparity,  with lower being better.",
    insightsText1: "The chart shows {0} and disparity of {1} models.",
    "_insightsText1.comment": "??? NOT FOUND IN SRC",
    insightsText2:
      "{0} ranges from {1} to {2}. The disparity ranges from {3} to {4}.",
    "_insightsText2.comment":
      "The range (low to high) of the metric, and range (low to high) of the associated disparity for that metric",
    insightsText3:
      "The most accurate model achieves {0} of {1} and a disparity of {2}.",
    "_insightsText3.comment":
      "For the most accurate model: The name of the accuracy measure (0), the formatted numerical value of the accuracy (1), and the formatted numerical value of the disparity (2)",
    insightsText4:
      "The lowest-disparity model achieves {0} of {1} and a disparity of {2}.",
    "_insightsText4.comment":
      "For the lowest-disparity model: The name of the accuracy measure (0), the formatted numerical value of the accuracy (1), and the formatted numerical value of the disparity (2)",
    disparityInOutcomes: "Disparity in predictions",
    disparityInAccuracy: "Disparity in {0}",
    "_disparityInAccuracy.comment":
      "The name of the metric for which disparity is assessed",
    howToMeasureDisparity: "How should disparity be measured?"
  },
  Report: {
    modelName: "Model {0}",
    "_modelName.comment": "The name of the model",
    title: "Disparity in performance",
    globalAccuracyText: "Is the overall {0}",
    "_globalAccuracyText.comment":
      "The title of the metric for which accuracy is being assessed",
    accuracyDisparityText: "Is the disparity in {0}",
    "_accuracyDisparityText.comment":
      "The title of the metric for which accuracy is being assessed",
    editConfiguration: "Edit configuration",
    backToComparisons: "Back to all models",
    assessmentResults: "Assessment results for",
    equalizedOddsDisparity: "Equalized odds disparity",
    outcomesTitle: "Disparity in predictions",
    expandSensitiveAttributes: "Expand sensitive attributes",
    collapseSensitiveAttributes: "Collapse sensitive attributes",
    minTag: "Min",
    maxTag: "Max",
    groupLabel: "Subgroup",
    overallLabel: "Overall",
    underestimationError: "Underprediction",
    underpredictionExplanation: "(predicted = 0, true = 1)",
    overpredictionExplanation: "(predicted = 1, true = 0)",
    overestimationError: "Overprediction",
    classificationOutcomesHowToRead:
      "The bar chart shows the selection rate in each group, meaning the fraction of points classified as 1.",
    regressionOutcomesHowToRead:
      "Box plots show the distribution of predictions in each group. Individual data points are overlaid on top.",
    classificationAccuracyHowToRead1:
      "The bar chart shows the distribution of errors in each group.",
    classificationAccuracyHowToRead2:
      "Errors are split into overprediction errors (predicting 1 when the true label is 0), and underprediction errors (predicting 0 when the true label is 1).",
    classificationAccuracyHowToRead3:
      "The reported rates are obtained by dividing the number of errors by the overall group size.",
    probabilityAccuracyHowToRead1:
      "The bar chart shows mean absolute error in each group, split into overprediction and underprediction.",
    probabilityAccuracyHowToRead2:
      "On each example, we measure the difference between the prediction and the label. If it is positive, we call it overprediction and if it is negative, we call it underprediction.",
    probabilityAccuracyHowToRead3:
      "We report the sum of overprediction errors and the sum of underprediction errors divided by the overall group size.",
    regressionAccuracyHowToRead:
      "Error is the difference between the prediction and the label. Box plots show the distribution of errors in each group. Individual data points are overlaid on top.",
    distributionOfPredictions: "Distribution of predictions",
    distributionOfErrors: "Distribution of errors",
    tooltipPrediction: "Prediction: {0}",
    "_tooltipPrediction.comment":
      "Displays tooltip with the formatted numerical value of the prediction",
    tooltipError: "Error: {0}",
    "_tooltipError.comment":
      "Displays tooltip with the formatted numerical value of the error"
  },
  Feature: {
    header:
      "Along which features would you like to evaluate your model's fairness?",
    body:
      "Fairness is evaluated in terms of disparities in your model's behavior. We will split your data according to values of each selected feature, and evaluate how your model's performance metric and predictions differ across these splits.",
    learnMore: "Learn more",
    summaryCategoricalCount: "This feature has {0} unique values",
    "_summaryCategoricalCount.comment":
      "Number of unique values of the feature",
    summaryNumericCount:
      "This numeric feature ranges from {0} to {1}, and is grouped into {2} bins.",
    "_summaryNumericalCount.comment":
      "The numerical range (low and high values) of the feature, and number of bin groups within that range",
    showCategories: "Show all",
    hideCategories: "Collapse",
    categoriesOverflow: "   and {0} additional categories",
    "_categoriesOverflow.comment":
      "??? NOT IN SRC - number of remaining additional categories",
    editBinning: "Edit groups",
    subgroups: "Subgroups"
  },
  Metrics: {
    accuracyScore: "Accuracy",
    precisionScore: "Precision",
    recallScore: "Recall",
    zeroOneLoss: "Zero-one loss",
    specificityScore: "Specificity score",
    missRate: "Miss rate",
    falloutRate: "Fallout rate",
    maxError: "Max error",
    meanAbsoluteError: "Mean absolute error",
    meanSquaredError: " MSE (mean squared error)",
    meanSquaredLogError: "Mean squared log error",
    medianAbsoluteError: "Median absolute error",
    average: "Average prediction",
    selectionRate: "Selection rate",
    overprediction: "Overprediction",
    underprediction: "Underprediction",
    r2_score: "R-squared score",
    rms_error: "RMSE (root mean squared error)",
    auc: "Area under ROC curve",
    balancedRootMeanSquaredError: "Balanced RMSE",
    balancedAccuracy: "Balanced accuracy",
    f1Score: "F1-Score",
    "_f1Score.comment":
      "Data science terminology: https://en.wikipedia.org/wiki/F1_score",
    logLoss: "Log Loss",
    "_logLoss.comment": "Data science terminology",
    accuracyDescription: "The fraction of data points classified correctly.",
    precisionDescription:
      "The fraction of data points classified correctly among those classified as 1.",
    recallDescription:
      "The fraction of data points classified correctly among those whose true label is 1. Alternative names: true positive rate, sensitivity.",
    rmseDescription: "Square root of the average of squared errors.",
    mseDescription: "The average of squared errors.",
    meanAbsoluteErrorDescription:
      "The average of absolute values of errors. More robust to outliers than MSE.",
    r2Description:
      "The fraction of variance in the labels explained by the model.",
    aucDescription:
      "The quality of the predictions, viewed as scores, in separating positive examples from negative examples.",
    balancedRMSEDescription:
      "Positive and negative examples are reweighted to have equal total weight. Suitable if the underlying data is highly imbalanced.",
    balancedAccuracyDescription:
      "Positive and negative examples are reweighted to have equal total weight. Suitable if the underlying data is highly imbalanced.",
    parityDifference: "Parity difference",
    parityDifferenceDescription: "Parity difference",
    parityRatio: "Parity ratio",
    parityRatioDescription: "Parity ratio",
    errorRateDifference: "Error rate difference",
    errorRateDifferenceDescription: "Error rate difference",
    equalOpportunityDifference: "Equal opportunity difference",
    equalOpportunityDifferenceDescription: "Equal opportunity difference",
    f1ScoreDescription: "F1-Score is the harmonic mean of precision and recall."
  },
  BinDialog: {
    header: "Configure bins",
    makeCategorical: "Treat as categorical",
    save: "Save",
    cancel: "Cancel",
    numberOfBins: "Number of bins:",
    categoryHeader: "Bin values:"
  }
};

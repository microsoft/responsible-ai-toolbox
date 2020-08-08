module.exports = {
  selectPoint: "Select a point to see its local explanation",
  "_selectPoint.comment": "Prompts the user to select a point",
  defaultClassNames: "Class {0}",
  "_defaultClassNames.comment":
    " models that output classes have this as the default class names",
  defaultFeatureNames: "Feature {0}",
  "_defaultFeatureNames.comment": "the default column names",
  absoluteAverage: "Average of absolute value",
  "_absoluteAverage.comment":
    "https://en.wikipedia.org/wiki/Norm_(mathematics) Absolute value norm",
  predictedClass: "Predicted class",
  "_predictedClass.comment":
    "Norm based on the predicted class rather than absolute value as above",
  datasetExplorer: "Dataset Explorer",
  dataExploration: "Dataset Exploration",
  "_dataExploration.comment":
    "Label for tab showing scatterplot of dataset and predictions",
  aggregateFeatureImportance: "Aggregate Feature Importance",
  "_aggregateFeatureImportance.comment":
    "tab label for view of aggregated (summed and averaged) feature importances",
  globalImportance: "Global Importance",
  "_globalImportance.comment":
    "Label for tab showing bar chart of importance of features at a global level",
  explanationExploration: "Explanation Exploration",
  individualAndWhatIf: "Individual Feature Importance & What-If",
  "_individualAndWhatIf.comment":
    "tab label for feature importances of single rows, and 'what if?' which allows seeing hypothetical results",
  "_explanationExploration.comment":
    "Label for tab showing scatter plot of dataset and importance of features data",
  summaryImportance: "Summary Importance",
  "_summmaryImportance.comment":
    "Label showing all importance of feature datapoints in scatter plot",
  featureImportance: "Feature Importance",
  "_featureImportance.comment": "Label for feature importance ",
  featureImportanceOf: "Feature importance of {0}",
  perturbationExploration: "Perturbation Exploration",
  "_perturbationExploration.comment":
    "Label for local tab allowing the user to change parameters on a selected point",
  localFeatureImportance: "Local Feature Importance",
  "_localFeatureImportance.comment":
    "Label for local tab showing feature importance of selected point",
  ice: "ICE",
  "_ice.comment":
    "Label for tab showing https://christophm.github.io/interpretable-ml-book/ice.html",
  clearSelection: "Clear selection",
  feature: "Feature:",
  intercept: "Intercept",
  "_intercept.comment": "The label for the linear intercept, the bias value",
  modelPerformance: "Model Performance",
  "_modelPerformance.comment":
    "tab label to see how well a model predicted values when compared to true",
  ExplanationScatter: {
    dataLabel: "Data : {0}",
    "_dataLabel.comment": "prepend in front of column names",
    importanceLabel: "Importance : {0}",
    "_importanceLabel.comment":
      "prepend in front of feature importance of column name",
    predictedY: "Predicted Y",
    "_predictedY.comment": "predicted output",
    index: "Index",
    "_index.comment": "the index value (an integer of the row number)",
    dataGroupLabel: "Data",
    output: "Output",
    probabilityLabel: "Probability : {0}",
    "_probabilityLabel.comment":
      "Probability prefix for all classes in a multiclass problem",
    trueY: "True Y",
    "_trueY.comment": "The true value to be predicted",
    class: "class: ",
    "_class.comment": "label for predicted class",
    xValue: "X value:",
    "_xValue.comment": "label for x value dropdown",
    yValue: "Y value:",
    "_yValue.comment": "label for y value dropdown",
    colorValue: "Color:",
    "_colorValue.comment": "label for selecting color value",
    count: "Count",
    "_count.comment": "the default axis is the count of items"
  },
  CrossClass: {
    label: "Cross-class weighting:",
    "_label.comment":
      "label for dropdown allowing user to select how importance across multiple output classes is aggregated",
    info: "Information on cross-class calculation",
    "_info.comment": "tooltip on hover",
    overviewInfo:
      "Multiclass models generate an independent feature importance vector for each class. Each class's feature importance vector demonstrates which features made a class more likely or less likely. You can select how the weights of the per-class feature importance vectors are summarized into a single value:",
    "_overview.comment": "explains absolute value weights",
    absoluteValInfo:
      "Average of absolute value: Shows the sum of the feature's importance across all possible classes, divided by number of classes",
    predictedClassInfo:
      "Predicted class: Shows the feature importance value for a given point's predicted class",
    "_predictedClassInfo.comment": "explains predicted class weight",
    enumeratedClassInfo:
      "Enumerated class names: Shows only the specified class's feature importance values across all data points.",
    "_enumeratedClassInfo.comment":
      "explains the weights for selecting a single class",
    close: "Close",
    crossClassWeights: "Cross class weights"
  },
  AggregateImportance: {
    scaledFeatureValue: "Scaled Feature Value",
    "_scaledFeatureValue.comment":
      "The chart shows all data in a color scale (normalized to 0 - 1). This is the label for the color bar",
    low: "Low",
    "_low.comment": "The low end of the color bar",
    high: "High",
    "_high.comment": "label for the high end of the color bar",
    featureLabel: "Feature: {0}",
    "_featureLabel.comment": "Prefix to the feature name",
    valueLabel: "Feature value: {0}",
    "_valueLabel.comment": "prefix to the feature value",
    importanceLabel: "Importance: {0}",
    "_importanceLabel.comment": "prefix to the feature importance",
    predictedClassTooltip: "Predicted Class: {0}",
    "_predictedClassTooltip.comment":
      "prefixed in front of the output class names predicted by the model",
    trueClassTooltip: "True Class: {0}",
    "_trueClassTooltip.comment": "prefixed in front of the true class labels",
    predictedOutputTooltip: "Predicted Output: {0}",
    "_predictedOutputTooltip.comment":
      "prefixed in front of the output in a regression model (numeric, no classes)",
    trueOutputTooltip: "True Output: {0}",
    "_trueOutputTooltip.comment":
      "prefixed in front of the true value in a regression model (numeric, no classes)",
    topKFeatures: "Top K Features:",
    "_topKFeatures.comment":
      "Label for slider to show only the top (k) most important features, where the slider is used to set the value of k",
    topKInfo: "How top k is calculated",
    predictedValue: "Predicted Value",
    "_predictedValue.comment":
      "Label for dropdown option, group data by the predicted value from the model (numeric values)",
    predictedClass: "Predicted Class",
    "_predictedClass.comment":
      "Label for dropdown option, group data by predicted class from model",
    trueValue: "True Value",
    "_trueValue.comment":
      "label for dropdown option, group data by true value (numeric)",
    trueClass: "True Class",
    "_trueClass.comment": "label for dropdown, group data by true class",
    noColor: "None",
    "_noColor.comment": "label for dropdown, do not apply any grouping",
    tooManyRows: "The provided dataset is larger than this chart can support",
    "_tooManyRows.comment":
      "error message if the dataset is too large to visualize"
  },
  BarChart: {
    classLabel: "Class: {0}",
    "_classLabel.comment": "Prefix for class",
    sortBy: "Sort by",
    "_sortBy.comment": "prompt for setting how values are sorted",
    noData: "No Data",
    "_noData.comment": "Error message for no applicable data",
    absoluteGlobal: "Absolute global",
    "_absoluteGlobal.comment":
      "sorting option, sort by the absolute value of the importance of all datapoints",
    absoluteLocal: "Absolute local",
    "_absoluteLocal.comment":
      "sorting option, sort by the absolute value of the importance for the single selected point",
    calculatingExplanation: "Calculating explanation",
    "_calculatingExplanation.comment": "loading message"
  },
  IcePlot: {
    numericError: "Must be numeric",
    "_numericError.comment": "error message if non-numeric characters typed",
    integerError: "Must be an integer",
    "_integerError.comment":
      "error message if non-integer values typed by user",
    prediction: "Prediction",
    "_prediction.comment": "Prediction label for y-axis",
    predictedProbability: "Predicted probability",
    "_predictedProbability.comment": "predicted probability label for y-axis",
    predictionLabel: "Prediction: {0}",
    "_predictionLabel.comment": "prediction hover prefix",
    probabilityLabel: "Probability: {0}",
    "_probabilityLabel.comment": "probability hover prefix",
    noModelError:
      "Please provide an operationalized model to explore predictions in ICE plots.",
    "_noModelError.comment": "error message for no model present",
    featurePickerLabel: "Feature:",
    "_featurePicker.comment": "feature dropdown label",
    minimumInputLabel: "Minimum:",
    "_minimumInputLabel.comment": "Set minimum bounds label",
    maximumInputLabel: "Maximum:",
    "_maximumInputLabel.comment": "set maximum bounds label",
    stepInputLabel: "Steps:",
    "_stepInputLabel.comment":
      "number of samples to include between minimum and maximum (integer)",
    loadingMessage: "Loading data...",
    "_loadingMessage.comment": "loading message",
    submitPrompt: "Submit a range to view an ICE plot",
    "_submitPrompt.comment":
      "prompt to user giving instructions to enter a numeric range",
    topLevelErrorMessage: "Error in parameter",
    "_topLevelErrorMessage.comment": "error message for any parameter issue",
    errorPrefix: "Error encountered: {0}",
    "_errorPrefix.comment": "prefix in front of external error"
  },
  PerturbationExploration: {
    loadingMessage: "Loading...",
    perturbationLabel: "Perturbation:",
    "_perturbationLabel.comment":
      "Perturbation (ie. the user has made a set of small changes to the original data -- a perturbation. This is the label for the resulting prediction)"
  },
  PredictionLabel: {
    predictedValueLabel: "Predicted value : {0}",
    "_predictionValueLabel.comment": "label for prediction of numeric values",
    predictedClassLabel: "Predicted class : {0}",
    "_predictedClassLabel.comment": "label for prediction of class value"
  },
  Violin: {
    groupNone: "No grouping",
    "_groupName.comment": "Do not group data option",
    groupPredicted: "Predicted Y",
    "_groupPredicted.comment": "option to group data by predicted class",
    groupTrue: "True Y",
    "_groupTrue.comment": "option to group data by true class",
    groupBy: "Group by",
    "_groupBy.comment":
      "Group by prompt for dropdown to select how data should be grouped"
  },
  FeatureImportanceWrapper: {
    chartType: "Chart type:",
    "_chartType.comment": "label for dropdown to select chart format",
    violinText: "Violin",
    "_violinText.comment":
      "a violin plot https://en.wikipedia.org/wiki/Violin_plot",
    barText: "Bar",
    "_barText.comment": "a bar plot ",
    boxText: "Box",
    "_boxText.comment": "a box plot https://en.wikipedia.org/wiki/Box_plot",
    beehiveText: "Swarm",
    "_beehiveText.comment":
      "A swarm plot (its like a scatter plot with categorical x axis with dithering, see examples https://seaborn.pydata.org/generated/seaborn.swarmplot.html)",
    globalImportanceExplanation:
      "Global feature importance is calculated by averaging the absolute value of the feature importance of all points (L1 normalization). ",
    "_globalImportanceExplanation.comment":
      "explains how global feature importance is calculated ",
    multiclassImportanceAddendum:
      "All points are included in calculating a feature's importance for all classes, no differential weighting is used. So a feature that has large negative importance for many points predicted to not be of 'Class A' will greatly increase that feature's 'Class A'  importance.",
    "_multiclassImportanceAddendum.comment":
      "explains how global importance is calculated for each class in a multiclass case."
  },
  Filters: {
    equalComparison: "Equal to",
    "_equalComparison.comment": "filter for rows that are exactly equal",
    greaterThanComparison: "Greater than",
    "_greaterThanComparison.comment":
      "filter for rows that are greater than a value",
    greaterThanEqualToComparison: "Greater than or equal to",
    "_greaterThanEqualToComparison.comment":
      "filter for rows that are greater than or equal to a value",
    lessThanComparison: "Less than",
    "_lessThanComparison.comment": "filter for rows that are less than a value",
    lessThanEqualToComparison: "Less than or equal to",
    "_lessThanEqualToComparison.comment":
      "filter for rows that are less than or equal to a value",
    inTheRangeOf: "In the range of",
    "_inTheRangeOf.comment": "filter for rows that are between two values",
    categoricalIncludeValues: "Included values:",
    "_categoricalIncludeValues.comment": "filter to selected categories",
    numericValue: "Value",
    "_numericValue.comment":
      "the value to compare to in greater/less than or equal to filter",
    numericalComparison: "Operation",
    "_numericalComparison.comment":
      "label for dropdown containing [greater than, less than, equal to]",
    minimum: "Minimum",
    maximum: "Maximum",
    min: "Min: {0}",
    max: "Max: {0}",
    uniqueValues: "# of unique values: {0}",
    "_uniqueValues.comment":
      "the number of unique values for a selected categorical filter"
  },
  Columns: {
    regressionError: "Regression error",
    "_regressionError.comment":
      "true value minus predicted value is regression error",
    error: "Error",
    classificationOutcome: "Classification outcome",
    "_classificationOutcome.comment":
      "Whether the prediction from the model matched the true value",
    truePositive: "True positive",
    trueNegative: "True negative",
    falsePositive: "False positive",
    falseNegative: "False negative",
    dataset: "Dataset",
    predictedProbabilities: "Prediction probabilities",
    none: "Count",
    "_none.comment":
      "option to not have data on this axis, instead just counts number of points"
  },
  WhatIf: {
    closeAriaLabel: "Close",
    defaultCustomRootName: "Copy of row {0}",
    "_defaultCustomRootName.comment":
      "default prefix for a hypothetical point made by copying another point",
    filterFeaturePlaceholder: "Search features",
    "_filterFeaturePlaceholder.comment":
      "placeholder in search box for searching for features by name"
  },
  Cohort: {
    cohort: "Cohort",
    "_cohort.comment": "a subset of the data is called a cohort",
    defaultLabel: "All data"
  },
  GlobalTab: {
    "_helperText.comment":
      "paragraph summarizing the view on this page and available actions",
    helperText:
      "Explore the top-k important features that impact your overall model predictions (a.k.a. global explanation). Use the slider to show descending feature importance values. Select up to three cohorts to see their feature importance values side by side. Click on any of the feature bars in the graph to see how values of the selected feature impact model prediction.",
    topAtoB: "Top {0}-{1} features",
    "_topAtoB.comment":
      "label on a slider, will tell user the index of the features they are currently seeing, like Top 5-10 features",
    datasetCohorts: "Dataset cohorts",
    "_datasetCohorts.comment":
      "label for dropdown allowing users to select what cohorts to view",
    legendHelpText:
      "Toggle cohorts on and off in the plot by clicking on the legend items.",
    "_legendHelperText.comment":
      "explanatory text on what actions can be done on a list of cohorts",
    sortBy: "Sort by",
    "_sortBy.comment": "prompt for setting how values are sorted",
    viewDependencePlotFor: "View dependence plot for:",
    "_viewDependencePlotFor.comment":
      "label for dropdown to select feature to be shown in a dependence plot (a kind of graph)",
    datasetCohortSelector: "Select a dataset cohort",
    "_datasetCohortSelector.comment": "label for selecting single cohort",
    aggregateFeatureImportance: "Aggregate Feature Importance",
    "_aggregateFeatureImportance.comment":
      "graph label for aggregated (summed and averaged) feature importances",
    missingParameters:
      "This tab requires the local feature importance parameter be supplied.",
    "_missingParameters.comment":
      "Show a message if the required feature importance parameter is not provided",
    weightOptions: "Class importance weights",
    "_weightOptions.comment":
      "Weight how importance values are averaged https://en.wikipedia.org/wiki/Weighted_arithmetic_mean",
    dependencePlotTitle: "Dependence Plots",
    dependencePlotHelperText:
      "This dependence plot shows the relationship between the value of a feature to the corresponding importance of the feature across a cohort.",
    dependencePlotFeatureSelectPlaceholder: "Select feature",
    datasetRequired:
      "Dependence plots require the evaluation dataset and local feature importance array."
  },
  CohortBanner: {
    dataStatistics: "Data Statistics",
    "_dataStatistics.comment":
      "label for section containing statistics about the dataset",
    datapoints: "{0} datapoints",
    "_datapoints.comment":
      "formatted string of the number of datapoints in the dataset",
    features: "{0} features",
    "_features.comment":
      "formatted string of the number of features (columns) in a dataset",
    filters: "{0} filters",
    "_filters.comment": "the number of filters that define a cohort",
    binaryClassifier: "Binary Classifier",
    "_binaryClassifier.comment":
      "a model that predicts true or false is a binary classifier, this is the label",
    regressor: "Regressor",
    "_regressor.comment":
      "a class of models that output a numeric score, name is derived from statistical regression",
    multiclassClassifier: "Multiclass Classifier",
    "_multiclassClassifier.comment":
      "models that output a category, with more than two categories",
    datasetCohorts: "Dataset Cohorts",
    "_datasetCohorts.comment":
      "a subset of the original data, defined by filtering the data. This is the label for presenting all cohorts the user created",
    editCohort: "Edit Cohort",
    "_editCohort.comment":
      "button text to edit the filters defining an existing cohort",
    duplicateCohort: "Duplicate Cohort",
    "_duplicateCohort.comment": "button text to copy an existing cohort",
    addCohort: "Add Cohort",
    "_addCohort.comment": "button text to create a new cohort",
    copy: " copy",
    "_copy.comment":
      "suffix attached to name of cohort created by copying other cohort, by default."
  },
  ModelPerformance: {
    helperText:
      "Evaluate the performance of your model by exploring the distribution of your prediction values and the values of your model performance metrics. You can further investigate your model by looking at a comparative analysis of its performance across different cohorts or subgroups of your dataset. Select filters along y-value and x-value to cut across different dimensions. Select the gear in the graph to change graph type.",
    "_helperText.comment":
      "explains the view on this page and what actions can be taken",
    modelStatistics: "Model Statistics",
    "_modelStatistics.comment":
      "label for area listing statistics about model prediction",
    cohortPickerLabel: "Select a dataset cohort to explore",
    "_cohortPickerLabel.comment":
      "label for single-select dropdown to pick a cohort to view",
    missingParameters:
      "This tab requires the array of predicted values from the model be supplied.",
    "_missingPArameters.comment":
      "Show a message if the required prediction array not provided",
    missingTrueY:
      "Model performance statistics require the true outcomes be provided in addition to the predicted outcomes",
    "_missingTrueY.comment":
      "Show message if true Y values are not provided, since statistics require the true value"
  },
  Charts: {
    yValue: "Y-value",
    "_yValue.comment": "label for y value button on chart",
    numberOfDatapoints: "Number of datapoints",
    "_numberOfDatapoints.comment":
      "some charts will always show the count of the number of rows in a group, this is the axis label on the chart",
    xValue: "X-value",
    "_xValue.comment": "label for x value button on chart",
    rowIndex: "Row index",
    "_rowIndex.comment": "the index of a row in a dataset",
    featureImportance: "Feature importance",
    countTooltipPrefix: "Count: {0}",
    "_countTooltipPrefix.comment":
      "on hover, show the prefix followed by the total number of points",
    count: "Count",
    featurePrefix: "Feature",
    "_featurePrefix.comment": "label shown before feature name in tooltip",
    importancePrefix: "Importance",
    "_importance.comment": "label shown before importance value in tooltip",
    cohort: "Cohort",
    howToRead: "How to read this chart"
  },
  DatasetExplorer: {
    helperText:
      "Explore your dataset statistics by selecting different filters along the X, Y, and color axis to slice your data along different dimensions. Create dataset cohorts above to analyze dataset statistics with filters such as predicted outcome, dataset features and error groups. Use the gear icon in the upper right-hand corner of the graph to change graph types.",
    "_helperText.comment":
      "paragraph summarizing the view on this page and what actions the user can take",
    colorValue: "Color value",
    "_colorValue.comment":
      "label on button to set how data is mapped to color in chart",
    individualDatapoints: "Individual datapoints",
    "_individualDatapoints.comment":
      "configuration option to view chart with each individual point, opposed to chart summing/averaging points",
    aggregatePlots: "Aggregate plots",
    "_aggregatePlots.comment":
      "configuration option to view plots that sum or average points, opposed to sowing each point on its own",
    chartType: "Chart type",
    "_chartType.comment": "label for dropdown to select chart format",
    missingParameters: "This tab requires an evaluation dataset be supplied.",
    "_missingPArameters.comment":
      "Show a message if the required dataset parameter is not provided",
    noColor: "None",
    "_noColor.comment": "placeholder text when no color axis picked"
  },
  DependencePlot: {
    featureImportanceOf: "Feature importance of",
    "_featureImportanceOf.comment":
      "axis label on chart showing the importance of a selected feature (column)",
    placeholder:
      "Click on a feature on the bar chart above to show its dependence plot",
    "_placeholder.comment":
      "placeholder text explaining how to activate this chart, by clicking on a neighboring chart."
  },
  WhatIfTab: {
    helperText:
      'You can select a datapoint by clicking on the scatterplot to view its local feature importance values (local explanation) and individual conditional expectation (ICE) plot below. Create a hypothetical what-if datapoint by using the panel on the right to perturb features of a known datapoint. Feature importance values are based on many approximations and are not the "cause" of predictions. Without strict mathematical robustness of causal inference, we do not advise users to make real-life decisions based on this tool.',
    "_helperText.comment":
      "explains what is shown in this tab and what actions are available",
    panelPlaceholder:
      "A model is required to make predictions for new data points.",
    "_panelPlaceholder.comment":
      "message shown to user when they did not give a model as inputs",
    cohortPickerLabel: "Select a dataset cohort to explore",
    "_cohortPickerLabel.comment":
      "label for single-select dropdown to pick a cohort to view",
    scatterLegendText:
      "Toggle datapoints on and off in the plot by clicking on the legend items.",
    "_scatterLegendText.comment":
      "describes actions possible on the legend items in the chart",
    realPoint: "Real datapoints",
    "_realPoint.comment": "label above the list of points from the dataset",
    noneSelectedYet: "None selected yet",
    "_noneSelectedYet.comment":
      "placeholder if no points are selected, where list of points would go",
    whatIfDatapoints: "What-If datapoints",
    "_whatIfDatapoints.comment":
      "label above the list of what if (hypothetical) points",
    noneCreatedYet: "None created yet",
    "_noneCreatedYet.comment":
      "placeholder if no hypothetical points have been created, goes where list of points would be",
    showLabel: "Show:",
    "_showLabel.comment":
      "label on button to pick what additional chart to show",
    featureImportancePlot: "Feature importance plot",
    "_featureImportancePlot.comment":
      "name of a plot type showing the importance of each feature in making a decision",
    icePlot: "Individual conditional expectation (ICE) plot",
    "_icePlot.comment":
      "name of a plot type named Individual Conditional Expectation (ICE)",
    featureImportanceLackingParameters:
      "Provide local feature importances to see how each feature impacts individual predictions.",
    "_featureImportanceLackingParameters.comment":
      "placeholder if no local feature importances passed in",
    featureImportanceGetStartedText:
      "Select a point to view feature importance",
    "_featureImportanceGetStartedText.comment":
      "placeholder to prompt user to click point in neighboring chart to view this chart",
    iceLackingParameters:
      "ICE plots require an operationalized model to make predictions for hypothetical datapoints.",
    "_iceLackingParameters.comment":
      "placeholder text if a required parameter is not passed in, cannot show ICE plot if no model passed in",
    IceGetStartedText:
      "Select a point or create a What-If point to view ICE plots",
    "_IceGetStartedText.comment":
      "placeholder to prompt user to click point in neighboring chart to see this chart",
    whatIfDatapoint: "What-If datapoint",
    "_whatIfDatapoint.comment":
      "header text for area where user writes a hypothetical point's values",
    whatIfHelpText:
      "Select a point on the plot or manually enter a known datapoint index to perturb and save as a new What-If point.",
    "_whatIfHelpText.comment":
      "describe how to create a what-if hypothetical row",
    indexLabel: "Data index to perturb",
    "_indexLabel.comment":
      "label for dropdown for selecting a row by index value",
    rowLabel: "Row {0}",
    "_rowLabel.comment":
      "the label for a selected row, with its index number appended",
    whatIfNameLabel: "What-If datapoint name",
    "_whatIfNameLabel.comment":
      "label above text field where user can name their what-if hypothetical point",
    featureValues: "Feature values",
    "_featureValues.comment":
      "header above the list of feature names (column names)",
    predictedClass: "Predicted class: ",
    "_predictedClass.comment": "the predicted class for a row",
    predictedValue: "Predicted value: ",
    "_predictedValue.comment": "the predicted value for a row",
    probability: "Probability: ",
    "_probability.comment":
      "the probability that the predicted class is correct",
    trueClass: "True class: ",
    "_trueClass.comment": "prefix to actual label",
    trueValue: "True value: ",
    "trueValue.comment": "prefix to actual label for regression",
    newPredictedClass: "New predicted class: ",
    "_newPredictedClass.comment":
      "the prediction after the user changed features",
    newPredictedValue: "New predicted value: ",
    "_newPredictedValue.comment":
      "the prediction after the user changed features",
    newProbability: "New probability: ",
    "_newProbability.comment": "the probability for the new prediction",
    saveAsNewPoint: "Save as new point",
    "_saveAsNewPoint.comment": "button to save hypothetical point",
    saveChanges: "Save changes",
    "_saveChanges.comment": "button text to save changes made to a row",
    loading: "Loading...",
    "_loading.comment": "loading message while prediction is made",
    classLabel: "Class: {0}",
    "_classLabel.comment": "Prefix for class",
    minLabel: "Min",
    "_minLabel.comment": "minimum (small space available)",
    maxLabel: "Max",
    "_maxLabel.comment": "maximum (small space available)",
    stepsLabel: "Steps",
    "_stepsLabel.comment":
      "number of increments to use between minimum and maximum",
    disclaimer:
      'Disclaimer: These are explanations based on many approximations and are not the "cause" of predictions. Without strict mathematical robustness of causal inference, we do not advise users to make real-life decisions based on this tool.',
    "_disclaimer.comment":
      "the tool should not be liable for any bad predictions",
    missingParameters: "This tab requires an evaluation dataset be supplied.",
    "_missingParameters.comment":
      "Show a message if the required dataset parameter is not provided",
    selectionLimit: "Maximum of 3 selected points",
    "_selectionLimit.comment":
      "A user can only select 3 points from a chart at a time, this message is displayed if they click a 4th",
    classPickerLabel: "Class",
    tooltipTitleMany: "Top {0} predicted classes",
    "_tooltipTitleMany.comment": "placeholder is the number of classes shown",
    whatIfTooltipTitle: "What-If predicted classes",
    tooltipTitleFew: "Predicted classes",
    probabilityLabel: "Probability",
    deltaLabel: "Delta",
    "_deltaLabel.comment": "represents the change in a value",
    nonNumericValue: "Value should be numeric",
    icePlotHelperText:
      "ICE plots demonstrate how the selected datapoint's prediction values change along a range of feature values between a minimum and maximum value."
  },
  CohortEditor: {
    selectFilter: "Select Filter",
    "_selectFilter.comment": "prompt to select an attribute to filter on",
    TreatAsCategorical: "Treat as categorical",
    "_TreatAsCategorical.comment":
      "a checkbox label to treat integers as categories instead of as numbers",
    addFilter: "Add Filter",
    "_addFilter.comment":
      "button text to add the current settings as a new filter",
    addedFilters: "Added Filters",
    "_addedFilters.comment":
      "header above the list of filters that have been saved",
    noAddedFilters: "No filters added yet",
    "_noAddedFilters.comment": "placeholder text when no filters are included",
    defaultFilterState:
      "Select a filter to add parameters to your dataset cohort.",
    "_defaultFilterState.comment":
      "placeholder text prompting user to start making a filter",
    cohortNameLabel: "Dataset cohort name",
    "_cohortNameLabel.comment":
      "label for text filed where user adds name of a cohort (subset)",
    cohortNamePlaceholder: "Name your cohort",
    "_cohortNamePlaceholder.comment": "placeholder for cohort name",
    save: "Save",
    delete: "Delete",
    cancel: "Cancel",
    cohortNameError: "Missing cohort name",
    "_cohortNameError.comment": "error message if required name is missing",
    placeholderName: "Cohort {0}",
    "_placeholderName.comment": "starting name for a new cohort"
  },
  AxisConfigDialog: {
    select: "Select",
    "_select.comment": "label above dropdown to promp user to pick a feature",
    ditherLabel: "Should dither",
    "_ditherLabel.comment":
      "checkbox label for if small random changes should be added to numbers to more easily see large clusters",
    selectFilter: "Select your axis value",
    "_selectFilter.comment": "label on dropdown to pick value for charting",
    selectFeature: "Select Feature",
    "_selectFeature.comment":
      "dropdown label to select feature (column) for charting",
    binLabel: "Apply binning to data",
    "_binLabel.comment":
      "group all values into a fixed number of groups (bins)",
    TreatAsCategorical: "Treat as categorical",
    "_TreatAsCategorical.comment":
      "a checkbox label to treat integers as categories instead of as numbers",
    numOfBins: "Number of bins",
    "_numberOfBins.comment":
      "the number of groups (bins) to place all values into",
    groupByCohort: "Group by cohort",
    "_groupByCohort.comment":
      "if user selects to group by cohort, no further parameters to set, just show a message to fill space",
    selectClass: "Select class",
    "_selectClass.comment": "label for dropdown listing all classes",
    countHelperText: "A histogram of the number of points"
  },
  ValidationErrors: {
    predictedProbability: "Predicted probability",
    predictedY: "Predicted Y",
    evalData: "Evaluation dataset",
    localFeatureImportance: "Local feature importance",
    inconsistentDimensions:
      "Inconsistent dimensions. {0} has dimensions {1}, expected {2}",
    "_inconsistentDimensions.comment":
      "Raise warning if arguments passed in have different sizes, listing dimensions of both mismatching pieces.",
    notNonEmpty: "{0} input not a non-empty array",
    varyingLength:
      "Inconsistent dimensions. {0} has elements of varying length",
    notArray: "{0} not an array. Expected array of dimension {1}",
    errorHeader:
      "Some input parameters were inconsistent and will not be used: ",
    datasizeWarning:
      "The evaluation dataset is too large to be effectively displayed in some charts, please add filters to decrease the size of the cohort. ",
    datasizeError:
      "The selected cohort is too large, please add filters to decrease the size of the cohort.",
    addFilters: "Add filters"
  },
  FilterOperations: {
    equals: " = {0}",
    lessThan: " < {0}",
    greaterThan: " > {0}",
    lessThanEquals: " <= {0}",
    greaterThanEquals: " >= {0}",
    includes: " includes {0} ",
    "_includes.comment": "tooltip label for a filter with included values",
    inTheRangeOf: "[ {0} ]",
    overflowFilterArgs: "{0} and {1} others",
    "_overflowFilterArgs.comment":
      "first placeholder is the first one or two items in a long list, the second placeholder is the count of remaining items"
  },
  Statistics: {
    mse: "MSE: {0}",
    "_mse.comment":
      "the mean squared error, see https://en.wikipedia.org/wiki/Mean_squared_error",
    rSquared: "R-squared: {0}",
    "_rSquared.comment":
      "the coefficient of determination, see https://en.wikipedia.org/wiki/Coefficient_of_determination",
    meanPrediction: "Mean prediction {0}",
    "_meanPrediction.comment": "the average of all the predictions",
    accuracy: "Accuracy: {0}",
    "_accuracy.comment":
      "computed accuracy of model on a subgroup, see https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers",
    precision: "Precision: {0}",
    "_precision.comment":
      "computed precision of model, see https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers",
    recall: "Recall: {0}",
    "_recall.comment":
      "computed recall of model, see https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers",
    fpr: "FPR: {0}",
    "_fpr.comment":
      "False positive rate, see https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers",
    fnr: "FNR: {0}",
    "_fnr.comment":
      "False negative rate, see https://en.wikipedia.org/wiki/Evaluation_of_binary_classifiers"
  },
  GlobalOnlyChart: {
    helperText:
      "Explore the top k important features that impact your overall model predictions. Use the slider to show descending feature importances."
  },
  ExplanationSummary: {
    whatDoExplanationsMean: "What do these explanations mean?",
    clickHere: "Learn more",
    shapTitle: "Shapley values",
    shapDescription:
      'This explainer uses SHAP, which is a game theoretic approach to explaining models, where the importance of features sets is measured by "hiding" those features from the model through marginalization. Click the link below to learn more.',
    limeTitle: "LIME (Local Interpretable Model-Agnostic Explanations)",
    limeDescription:
      "This explainer uses LIME, which provides a linear approximation of the model. To get an explanation, we do the following: perturb the instance, get model predictions, and use these predictions as labels to learn a sparse linear model that is locally faithful. The weights of this linear model are used as 'feature importances'. Click the link below to learn more.",
    mimicTitle: "Mimic (Global Surrogate Explanations)",
    mimicDescription:
      "This explainer is based on the idea of training global surrogate models to mimic blackbox models. A global surrogate model is an intrinsically interpretable model that is trained to approximate the predictions of any black box model as accurately as possible. Feature importance values are model-based feature importance values of your underlying surrogate model (LightGBM, or Linear Regression, or Stochastic Gradient Descent, or Decision Tree)",
    pfiTitle: "Permutation Feature Importance (PFI)",
    pfiDescription:
      "This explainer randomly shuffles data one feature at a time for the entire dataset and calculates how much the performance metric of interest changes (default performance metrics: F1 for binary classification, F1 Score with micro average for multiclass classification and mean absolute error for regression). The larger the change, the more important that feature is. This explainer can only explain the overall behavior of the underlying model but does not explain individual predictions. Feature importance value of a feature represents the delta in the performance of the model by perturbing that particular feature."
  }
};

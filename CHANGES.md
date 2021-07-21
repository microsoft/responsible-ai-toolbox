# Changes

This file tracks changes to the raiwidgets package.
It should be updated in PRs that make changes, not separately.
At the top of the file will always be a v-next entry to add changes that
were made since the last release.
Each set of changes should be grouped by

- educational materials
- new features
- breaking changes
- bug fixes
- other

Note that it is not required to have an entry for every pull request.
Instead, please try to add only changes that are meaningful to users who read
this file to understand what changed.

## v-next

- educational materials
- new features
- breaking changes
- bug fixes
- other

## v0.9.0

- educational materials
  - add Model Analysis notebook for regression
- new features
  - local importance chart for counterfactual dashboard
  - add multi causal policy support
  - add delete tab dialog and remove inline widget for model assessment dashboard
  - add treatment policy and table to causal analysis dashboard
  - create new custom individual feature importance component
- breaking changes
- bug fixes
  - Model Analysis:
    - sticky layer for cohort and dashboard settings
    - restrict EA tree to 80% width
    - restrict ipykernel<0.6
    - fix flyout title and description
    - fix add button behavior by adding components in the appropriate spot
    - show add button only for components that can render
    - add validations for input parameters for Model Analysis class
    - validate treatment features in causal manager
    - explicitly pass model task to MimicExplainer in model analyzer
  - Error Analysis:
    - remove 100k row limit
    - fix zero nodes in tree view
    - fix search functionality in features list
    - fix displayed filter order in tree view to start from root node
    - raise warning for older version of pandas when feature names contain '-'
    - expand number of decimals shown in filter tooltips when values below 0.1
    - fix regression case for 1d heatmap matrix metrics being calculated incorrectly
  - set original data from dropdown for counterfactuals
  - use test data instead of train data for error analysis manager in model analyzer
  - causal analysis to keep all levels in dataframe outputs
  - pin networkx pip package to prevent installation of matplotlib
  - add target_column causal policy gain to UI control
- other
  - unit tests for multiclass classification for causal analysis
  - add model analysis notebooks to notebook gate
  - add test for causal manager for None categoricals
  - fix example code for model assessment

## v0.8.0

- educational materials
- new features
  - enabled categoricals on MimicExplainer for the explainer manager
  - updated causal constants to enable linear models and allow high cardinality features by default
  - support newest policy output format from econml
- breaking changes
  - continuous_features in CounterfactualManager.add() is deprecated in favor of categorical_features in ModelAnalysis
- bug fixes
  - fixed error analysis add after model analysis deserialization
- other
  - improved tests for visualization dependencies

## v0.7.0

- educational materials
- new features
  - added widget serialization for causal analysis
- breaking changes
- bug fixes
- other

## v0.6.1

- educational materials
- new features
- breaking changes
- bug fixes
- other

## v0.6.0

- educational materials
- new features
- breaking changes
- bug fixes
- other

## v0.5.0

- educational materials
  - cleanup commented out explainers from interpretability notebook
- new features
  - added support for causal, counterfactual, and error analysis tools in responsibleai
  - added model analysis widget to raiwidgets
  - added support for regression to error analysis
  - added policy tree to causal manager
- breaking changes
  - renamed package raitools to responsibleai
  - renamed top-level class RAIAnalyzer to ModelAnalysis
  - removed support for fairness in responsibleai package
- bug fixes
  - fixed bug in precision statistic calculation in dashboard
  - fixed bug in loading explanations with ModelAnalysis
  - fixed on predict method to use correct dtypes
  - fixed individual importances chart when no data available
- other
  - create combined feature importances tab for local and global explanation in model assessment
  - add section headers to model assessment dashboard
  - add manual cohort creation to the model assessment dashboard

## v0.4.0

- educational materials
  - cleanup commented out explainers from interpretability notebook
- new features
  - fix databricks environment with raiwidgets dashboards
  - updates to `ErrorAnalysisDashboard`:
    - improve the features list to use DetailsList
    - added tooltips to legend
    - initial static view for error analysis, specifically matrix filter and tree view
    - fixed tooltip node hover
    - fix indexing issue on cohort shift
    - add new simple dashboard implementation, which only takes in predictions and does not need model or dataset
  - updates to `ModelAssessmentDashboard`:
    - set up tabs on the left side
    - add model statistics tab
    - add pivot for error analysis
    - remove fullscreen button
  - refactor error analysis python code into separate common package
- breaking changes
- bug fixes
  - reduce the lower-bound on the lightgbm dependency
  - update greenlet and gevent dependencies to fix releases
- other
  - use global context in interpret, error-analysis, and model-assessment
  - moved dataset explorer into a new project `dataset-explorer`
  - created new projects `causality` and `counterfactuals`
  - remove fairness v1 dashboard

## v0.3.1

- Bug fix:
  - fix public VM failing requests in rai-core-flask package,
    update raiwidgets to latest rai-core-flask package

## v0.3.0

- Bug fixes:
  - Fix all data cohort always appearing first in cohorts lists
  - Add number selected text under local explanation radio buttons
  - Fix the issue that categorical feature is not able to change in cohort editor.
  - Fix categorical feature in what-if tab

## v0.2.2

- Bug fix:
  - Fix categorical feature in ice plot
  - Left align tabs in explanation window of error analysis
  - Move the selected features and feature importances inside a scrollable pane
  - Show aggregate plots by default in dataset explorer
  - Fix indexing issue in heatmap when selecting all cells

## v0.2.1

- educational materials:
  - add imports for `MimicExplainer` and `PFIExplainer` in the
    interpretability-dashboard-employee-attrition notebook
- features
  - migrate cohort and dataset utilities to core-ui
  - remove circular dependencies
  - add confirmation popup in `ExplanationDashboard` when cancelling editing
    a cohort.
  - fix clipped dropdown in `FairnessDashboard`
  - keep `FairnessDashboard` chart state in single model view
  - updates to `ErrorAnalysisDashboard`:
    - in large data view, change cohort state to use full data instead
      of downsampled explanation data
    - add true y and predicted y values
    - fix categorical labels handling in what if panel
    - add breadcrumb to error explorer view and minor style adjustments to
      navigation panel
    - fix indexing issues for all data cohort
    - add color column to local explanation view

## v0.2.0

This is the first release of the `raiwidgets` package.

- educational materials:
  - notebook `analyze-categoricals-binary-classification-local.ipynb` added
  - notebook `erroranalysis-pretability-dashboard-breast-cancer.ipynb` added
  - notebook `erroranalysis-interpretability-dashboard-census.ipynb` added
  - notebook `fairness-credit.ipynb` added
  - notebook `fairness-dashboard-loan-allocation.ipynb` added
  - notebook `fairness-interpretability-dashboard-loan-allocation.ipynb` added
  - notebook `interpretability-dashboard-employee-attrition.ipynb` added
- features
  - `FairnessDashboard` changes compared to `fairlearn`'s `FairlearnDashboard`
    which was migrated to `raiwidgets`:
    - Restructured performance metric selection as list rather than set of
      tiles for easier navigation.
    - Added fairness metric selection using a grouped list.
    - Added dropdowns to model comparison view and single model view to allow
      users to quickly switch between sensitive features, performance metrics,
      and fairness metrics.
    - Added metric table to single model view.
    - Added dropdown to switch between charts in single model view.
    - Simplified API to extract sensitive feature names directly from
      `sensitive_features`.
  - `ErrorAnalysisDashboard`: first release
  - migrated `ExplanationDashboard` from `interpret-community` to `raiwidgets`

We're skipping v0.1.0 to get all our packages onto the same version:

- pypi:

  - raiwidgets: first real release

- npm:
  - @responsible-ai/fairness: previously 0.1.\*
  - @responsible-ai/interpret: previously 0.0.\*
  - @responsible-ai/error-analysis: first real release
  - @responsible-ai/mlchartlib: previously 0.0.\*
  - @responsible-ai/core-ui: previously 0.0.\*
  - @responsible-ai/localization: previously 0.0.\*

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

## v0.11.0

- new features
  - table for list of available cohorts
- bug fixes
  - fix various UI usability bugs
  - fix for clicking custom scatter plot point
- other
  - improve validation for model prediction
  - reorder counterfactual table columns
  - add absolute sorting for local importance charts
  - improve spacing and fonts across dashboard
  - fix typos in docstrings
  - improve wording of text on dashboard
  - add warnings for soft data limits

## v0.10.0

- educational materials
  - update current model analysis classification notebook by adding treatment features for causal analysis
- ## new features
- breaking changes
- bug fixes

  - ## Model Analysis:
    - change icon for ViewList in main menu
    - fix model statistics component not showing all cohorts
    - put causal component last, remove navigation
    - hide removal dialog on click
    - move cohort info and button to sticky menu, replace error stats with filters
  - ## Error Analysis:
    - refactor heatmap code and fix display issues for categoricals
    - fix incorrect values in heatmap when there are empty error cells
    - added quantile binning and number of bins functionality to erroranalysis package
    - added quantile binning and number of bins to UX and hooked up calls to backend
    - added tooltip to list of features for tree view
    - fix backend to support equals filter for integer categorical columns
    - fix backend to support include and exclude filters for integer categorical columns
    - update default value for matrix feature
    - fix cohort when switching tree view
  - ## Causal:
    - remove unnecessary z-index on what-if and causal components
    - update causal policy to support categorical features
    - format policy tree categorical features
    - fix description on how confounding features are handled
    - use lighter lines for causal plotly point graphs
  - ## Fairness:
    - incorporate uncertainty quantification in fairness widget v2
  - ## Counterfactuals:
    - upgrade dice-ml to 0.7
    - update counterfactual list to allow string values
    - extend unseen categorical check to counterfactuals
  - add dropdown to dataset explorer by default
  - fix removing what if point will keep a faded start on the chart
  - suppress distracting logging from flask when running widgets
  - fix large x and y axis going out of bounds
  - refactor multiple instances of convert to list method in several dashboards
  - add missing interpretability information and guidelines

- other
  - fix message and check for environment in release pipeline

## v0.9.4

- bug fixes
  - fixed causal treatment policy display issue happening when switching between features

## v0.9.3

- educational materials
- new features
  - causal treatment cost argument can be passed per feature/sample/category
  - target added to counterfactual tabular output
  - causal analysis now trains the model on training data, not both train and test
  - min_child_samples parameter for error analysis
- breaking changes
- bug fixes
  - improved text for causal what-if
  - fix for missing values in dataset
  - improvement for default explanation tab
  - fix for multiple feature importances detail view
  - fix for causal what-if slider being stuck
  - fixes for cohort selection
  - fixes for error analysis matrix view
  - fix for extra scroll bar in counterfactuals view
  - fix for train data input in classification notebook
  - fix for bug in counterfactual feature_to_vary parameter
  - fix for x and y axes of error analysis heatmap
  - fix for counterfactual predict
- other
  - improved error messages for responsibleai ModelAnalysis
  - improved validation when not passing a model to ModelAnalysis
  - updated ModelAnalysis classification notebook to use separate train and test datasets

## v0.9.2

- educational materials
- new features
  - Model Analysis:
    - add search box to counterfactuals panel
    - add support for feature to vary and permitted range in counterfactual manager
  - add matrix features and tree features to error report object in erroranalysis package
- breaking changes
- bug fixes
  - call flask service credential
  - Model Analysis:
    - fix hardcoded feature name in counterfactual panel
    - fix refresh on global cohort change
    - add tree_features and matrix_features params to static tree and heatmap
    - update sticky menu
    - change counter factual desired_range to tuple
  - fix aggregate feature importance chart for multiclass classification
  - fix serialize_json_safe not escaping special characters which caused
    dashboard to fail to render on pandas dataframe that had double quotes
    in string values
- other
  - add dice-ml to intersphinx_mapping
  - add missing documentation for counterfactual manager
  - fix python responsibleai package test for windows

## v0.9.1

- educational materials
- new features
- breaking changes
  - error report in erroranalysis package had json_tree renamed to tree and json_matrix renamed to matrix
- bug fixes
  - fix econML inputs
  - add categorical feature to causal whatif
  - fix counterfactual panel scroll bar
  - round precision in causal analysis tables
  - fix calculating feature importances after error report due to dataframe on analyzer being modified
- other
  - dump information about the most time consuming tests

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

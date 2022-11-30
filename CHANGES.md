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

## v0.23.0

- educational materials
  - fixed the link to developer blog for housing example by @aminadibi in https://github.com/microsoft/responsible-ai-toolbox/pull/1713
  - Fix developer blog link in notebook by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1715
  - readme-enhancements by @mesameki in https://github.com/microsoft/responsible-ai-toolbox/pull/1704
- bug fixes and tests
  - ## Responsible AI Dashboard
    - Update UT - use new ErrorCohort() to mock data by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1711
    - [A11y] 1.Error analysis tree node text alignment 2. Add ariaLabel for new cohort panel 3. Model overview chart fix by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1719
    - reduce file size for e2e by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1723
    - fix max line line error for vision by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1725
    - clean up fairness by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1724
    - rollback local importance selection by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1726
    - add fridge dataset to test app for RAI vision dashboard and fix bug with large images in flyout by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1730
    - fix images in data characteristics panel hiding the success/failure instances by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1731
    - add test watch mode by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1728
    - refactor vision dashboard to remove getDerivedStateFromProps by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1732
    - [A11y]Show Error analysis tree focus && Add Screen reader for 1. New cohort panel, 2. Add component callout 3. Callout tooltip by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1727
    - [A11y] Fix bug - Screen reader is not announcing the associated information with axis selection radio buttons in data analysis chart view by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1736
    - Fix cohort deletion not working by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1738
    - fix e2e watch mode by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1740
    - fix an reference issue for chart lib by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1741
    - fix chart that generates duplicate plotly data by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1744
    - [A11y] Fix table view keyboard access by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1739
    - add data characteristics search and fix switching between tabs in RAI vision dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1745
    - fix RAI dashboard for vision models crashing when selecting individual datapoints in data analysis by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1733
    - remove duplicate settings button in RAI dashboard for images by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1747
    - in data characteristics of RAI vision dashboard, fix bug where labels to display is reset when changing number of rows by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1748
    - [A11y][screen reader] Announce component added after adding a component by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1751
    - [A11y] 1. Hide chart heading & 2. Fix Add component callout high contrast focus indicator by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1758
    - Fix full name not visible for features in highcharts by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1761
    - Filter out undefined filters to resolve a robot page exception by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1764
  - ## RAIInsights
    - Correct predict call to predict_proba by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1717
    - Port over cohort filtering tests for 'Predicted Y' cohort to responsibleai by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1709
    - Raise exception in case categorical feature list doesn't have all string features by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1720
    - Pass classes into the sklearn confusion_matrix by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1674
    - fix flaky test test_rai_insights_add_save_load_save on dataset fetch by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1734
    - Add validations to catch empty train/test scenarios by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1749
    - responsibleai: Move tests into respective directories by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1746
  - ## Counterfactual
    - Update requirements.txt to upgrade dice-ml to 0.9 by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1782
  - ## Causal
    - Add attributes 'outcome', 'feature' and 'feature_value' to causal global effects by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1750
    - Move causal only function from core-ui to causality by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1752
  - ## Error Analysis
    - Change multiclass F1_Score metrics to Macro_F1_Score/Micro_F1_Score by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1710
    - Fix "Clear” button of Search field under 'Feature List' dialog is not Functional and Focus indicator is not visible on all four sides for “Tree map” and "heat map" tabs. by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1718
    - Rename 'Error' filter name to 'Regression error' by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1729
    - [A11y] announce the displayed search results information of Feature List "Search" edit field. by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1757
    - fix error analysis cohort filter for string label values by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1766
    - fix isnan exception in erroranalysis for newer versions of pandas and numpy when calling qcut by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1784
    - update raiwidgets and responsibleai to erroranalysis 0.3.11 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1767
  - ## Dataset Explorer
    - clean up dataset explorer by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1721
  - ## Model Overview
    - Fix [Keyboard navigation - Azure Machine Learning - Model overview - Dataset cohorts]: Focus indicator is overlapping with the "help me choose metrics" button. by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1716
  - ## Interpret
    - in RAI text dashboard, fix topK and maxK on slidebar not updating when selecting different text documents by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1737
    - fix table view for image and text based on discussions for local importances and data analysis by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1735
    - Fix dependency plot showing Average of abs value by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1765
  - ## NLP Feature Extractors
    - Bump protobuf from 3.17.3 to 3.18.3 in /nlp_feature_extractors by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1743
- ## other
  - fix lint rules by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1714
  - Add postga build trigger by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1755
  - Update flake8 to 4.0.1 in requirements-linting.txt to fix failing linting build by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1760

## v0.22.0

- educational materials
  - Notebook change showing the usage of identity feature and feature metadata by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1627
- new features
  - ## Responsible AI Dashboard
    - Vision Dashboard Table View and initial explanation flyout by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1621
    - Vision dashboard backend without data characteristics tab by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1668
    - Vision dashboard data characteristics tab by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1675
    - Vision dashboard cohorts by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1686
    - Vision model overview metrics by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1688
  - ## Error Analysis
  - ## NLP Feature Extractors
    - Add the code for the nlp_feature_extractors to the RAI Toolbox by @ilmarinen in https://github.com/microsoft/responsible-ai-toolbox/pull/1580
- bug fixes and tests
  - ## Responsible AI Dashboard
    - [Accessibility] Data analysis scatter chart - use symbol and color to differentiate data series by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1667
    - Bump moment-timezone from 0.5.34 to 0.5.35 by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1677
    - Add validations for dashboard endpoints by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1672
    - [Accessibility][reflow] Error analysis tree map & Data explorer & Feature importance Reflow by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1678
    - [Accessibility][reflow] Error Analysis heat map & Model overview & Counterfactual & Causal analysis by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1680
    - [localization] Localize high chart context menu items by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1691
    - for RAI text dashboard, remove radio buttons and legend text when avg of abs value local importances selected by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1683
    - Vision dashboard UI Fixups by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1687
    - touch ups from designer feedback to RAI dashboard for text data by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1695
  - ## RAIInsights
    - Update econml to 0.13.1 by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1660
    - [responsibleai]: Add tests for classification outcome (multiclass) and regression error by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1662
    - JSON serialize the endpoint output and add tests by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1679
    - Cache predict() and predict_proba() output by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1702
    - Reduce the train and test dataset sizes in responsibleai to reduce test time by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1630
  - ## Counterfactual
  - ## Causal
    - Add validations for heterogeneity_features in causal manager by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1659
    - Fix localization for causal tooltips by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1690
  - ## Error Analysis
    - [Accessibility] Error analysis screen reader by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1663
    - Add metric computation of mean prediction by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1693
    - Add support for 'True Y' filter for cohort filtering by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1685
    - Avoid additional predict call in case of ModelAnalyzer by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1701
    - release erroranalysis v0.3.10 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1706
  - ## Dataset Explorer
    - refactor table view into data analysis component by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1673
    - add mini-table to feature importances view by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1682
  - ## Model Overview
    - [Model Overview] Box plot data for classification probabilities from SDK endpoint by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1689
    - Change 'Accuracy' to 'Accuracy score' in ModelOverview by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1700
  - ## Interpret
    - [Accessibility][reflow] Individual conditional expectation plot by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1699
  - ## NLP Feature Extractors
    - update nlp-feature-extractors readme, dependencies and add a release script by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1666
    - fix nlp-feature-extractors release by renaming requirements file by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1670
    - add missing positive negative words csv file to attribute extractors by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1671
- ## other
  - [localization] LEGO: Pull request from JUNO/hb_a12a4630-4852-4e7d-9cbc-c0e1117da1ab_20220907180147477 to main by @csigs in https://github.com/microsoft/responsible-ai-toolbox/pull/1694
  - Update CODEOWNERS by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1696

## v0.21.0

- educational materials
  - [docs] Add Data Balance README by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1567
  - Replace SynapseML links with RAIToolbox links by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1592
- new features
  - ## Responsible AI Dashboard
    - Data Balance UX Part 2: Add visualizations as a flight by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1512
    - add new interpret-vision library skeleton by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1586
    - add support for multiclass local importance values for text by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1601
    - Vision explanation dashboard -- Image explorer view by @jamesbchao in https://github.com/microsoft/responsible-ai-toolbox/pull/1587
  - ## Error Analysis
    - Make generic class interface for cohort based filtering by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1597
- bug fixes and tests
  - ## Responsible AI Dashboard
    - update release workflows to include interpret-text npm package by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1582
    - Add RAI prefix for OSS UI telemetry events by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1584
    - Bump moment from 2.29.2 to 2.29.4 by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1538
    - Bump eventsource from 1.0.7 to 1.1.1 by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1456
    - [Bugfix] Fix Dropdown bug and Update styling for feature balance measures by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1583
    - Refactor tests in test_responsibleai_dashboard_input.py to have common success and failure criteria by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1591
    - update raiwidgets and responsibleai to erroranalysis 0.3.6 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1588
    - Fix tooltip location showing up incorrectly due to conflicting ids by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1599
    - Update e2e test to expand correct predictions caret symbol by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1603
    - Updates to RAI text dashboard - update test app values to latest shap release, fix predicted label, limit selection to one row, fix random crash by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1605
    - [300 line limit] Refactor AxisConfigDialog: create AxisConfigBinOptions and AxisConfigChoiceGroup component by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1609
    - [300 line limit] Refactor CohortEditor, OverallMetricChart, set max-lines rule for core-ui package by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1612
    - design updates for the RAI text dashboard local importances view by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1611
    - [Accessibility] Fix all existing accessibility bugs by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1613
    - Move CalculateBoxPlot.test.tsx to core-ui by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1620
    - Add feature metadata to IDataset and JointDataset by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1614
    - Remove console.log() statement from CohortEditor.tsx by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1628
    - update raiwidgets and responsibleai to erroranalysis 0.3.8 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1629
    - add new interpret-vision package to npm publish workflows in build and release gates by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1615
    - [Accessibility] fix several accessibility bugs by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1632
    - add UI tests for RAI text dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1636
    - Fix typo for indices by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1640
    - Add extra space between Identity feature and the actual feature name by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1641
    - Use JointDataset API in ProcessPreBuiltCohort.ts by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1635
    - add wrapping for long text documents to text highlighting component in RAI dashboard for text by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1643
    - add tests to RAI text dashboard importances part 2 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1642
    - add radio button tests for RAI text dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1648
    - Localized file check-in by OneLocBuild Task: Build definition ID 21368: Build ID 69976515 by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1653
    - Add unit test for calculateLineData by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1654
    - Add test for uncovered condition in responsibleai_dashboard_input.py by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1638
    - update raiwidgets and responsibleai to erroranalysis 0.3.9 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1657
  - ## RAIInsights
    - responsibleai: Add FeatureMetadata class and related tests by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1604
    - Add categorical statistics computation in RAIInsights by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1598
    - Add cohort filtering capability in RAIInsights class by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1618
    - Inject FeatureMetadata into RAIInsights by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1616
    - responsibleai: Remove old manager namespaces by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1564
    - Fix docs in rai_base_insights.py by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1650
    - fix failing RAI Insights test due to change in EA \_string_ind_data type by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1658
    - Enable validations for FeatureMetadata when passed into RAIInsights by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1651
  - ## Counterfactual
    - [300 line limit] Refactor CounterfactualList by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1619
    - Reduce the time taken by RAIInsights counterfactual tests by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1622
    - [300 line limit] Refactor CounterfactualChart by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1624
    - Add identity feature value to counterfactual hover over by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1626
    - Minor refactoring in counterfactual package by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1634
    - [Accessibility] Add headings & change counterfactual text color by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1646
  - ## Causal
    - Add backend functions in causal_manager.py to handle dashboard requests by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1579
    - SDK change for computing aggregate causal effects and policy tree per cohort by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1552
    - Add identity feature value to causal hover over by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1633
  - ## Error Analysis
    - Refactor categorical statistics computation in separate module by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1600
    - Add more classification metrics to erroranalysis by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1575
    - Improve error message when categorical string column is treated as numeric and error analysis is run by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1562
    - fix bug in treeview filtering logic in error analysis package by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1593
    - erroranalysis: Bug fix in classification outcome cohort filter by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1596
    - release erroranalysis 0.3.7 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1606
    - fix error analysis predictions analyzer failing due to new filtering refactor by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1625
    - Make return type of string_ind_data in process_categoricals consistent by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1617
    - Handle 'Classification outcome' cohort filter for multiclass scenario in SDK by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1623
    - Handle 'Regression Error' cohort filter for regression scenario in SDK by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1644
    - [Accessibility] Error analysis tree node change 1. Bubble error rate colors; 2. Bubble text & fill by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1649
    - release erroranalysis 0.3.9 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1655
  - ## Dataset Explorer
    - Add identity feature value to dataset explorer scatter plot by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1645
  - ## Model Overview
    - If feature groups is more than 10, short it to 10 with "Other" for the rest by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1602
    - [Model Overview]Fix bug: x axis selection is not kept between tab switch by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1607
    - [ModelOverview] Fix bug- On choosing a specific feature cohort and trying to choose feature cohort again - dropdown has all cohorts selected by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1608
    - [ModelOverview]Fix bug- Model Overview: Clarification - Should state of 'use line chart' be persisted when switched from Probability -> Metrics -> Prob tab by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1610
    - enable new Model Overview experience in OSS RAI Dashboard by default by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1647
  - ## Interpret
    - Add backend functions in explainer_manager.py to handle dashboard requests by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1585
    - Add identity feature value to feature importance hover over by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1637
- ## other
  - update CHANGES.md release notes to reflect delay in package release by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1581
  - Remove strict pinnings from rai-core-flask requirements.txt. by @janjagusch in https://github.com/microsoft/responsible-ai-toolbox/pull/1578
  - release rai-core-flask 0.5.0 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1589
  - update deprecated pypi publish github action to new supported version by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1595
  - Update CODEOWNERS to add default reviewers for core-ui by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1639

## v0.20.0

- new features
  - ## Responsible AI Dashboard
    - Model overview: add legend to probability line chart by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1492
    - Model overview: add cohort selection hint by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1496
    - Model overview: wrap text after max line width by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1503
    - Model overview: use spline instead of line chart by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1508
    - Model overview: turn on heatmap colors by default by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1510
    - Model overview: disable confirm button when no changes were made by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1509
    - Add e2e tests for new model overview experience (part 1) by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1467
    - Model overview: use unique key to avoid heatmap color mismatch by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1517
    - Model overview: new cohorts should show up by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1519
    - Model overview: bold cohort names in tooltip by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1531
    - add text interpretability dashboard UI by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1159
    - Data Balance UX Part 1: add data_balance_measures to IDataset by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1511
    - refactor individual importances view to integrate local importances view for text data by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1569
  - ## RAIInsights
    - Create DataBalanceManager + unit tests; clean up data balance conftest by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1485
- bug fixes and tests
  - ## Responsible AI Dashboard
    - [office-ui upgrade] Move components in causality, counterfactuals and dataset-explorer package to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1481
    - [office-ui upgrade] Move components in error-analysis package to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1484
    - [office-ui upgrade] Move components in interpret package to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1495
    - [office-ui upgrade] Move components in fairness package to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1494
    - [office-ui upgrade] Move components in model-assessment & dependencies to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1497
    - [office-ui upgrade] Move ChoiceGroup & all other remaining dependencies to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1501
    - [Bugfix] HeatmapHighChart: Prioritize configOverride over defaultOptions by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1490
    - Remove download svg option due to highcharts limitations by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1498
    - Upgrade highcharts from v9.3.0 to v10.1.0, remove highcharts bundle by setting it to external module by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1506
    - Fix highcharts tooltip is clipped by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1502
    - Bump shell-quote from 1.7.2 to 1.7.3 by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1514
    - [UI refactor] Remove all alert functions and set no-alert rule by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1518
    - Use of "==" and "!=" confusing to non-programmers, update operators to strings by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1525
    - [UI refactor] Remove .bind() part 1 - Remove .bind(this, true/false) by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1523
    - Panel buttons should be uniform: change all buttons to "Apply"; all buttons should be at bottom by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1524
    - Fix slider bug by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1526
    - Fix e2e-widget.js for the case without flight argument by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1529
    - Make the local point selection drop down consistent in causal and counterfactual by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1539
    - [UI refactor] Remove .bind() part2 - Remove .bind in counterfactual folder and part of .bind() in other folders by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1542
    - [UI refactor] Remove .bind() part3 - Remove .bind for SpinButton in AxisConfigDialog, MultiICEPlot and Fairness by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1555
    - refactor text highlighting component to use Text and Label from FluentUI instead of styles on spans by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1558
    - centralize plot colors to core ui by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1559
    - create other cohort in model overview when there are more than 10 cohorts by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1572
    - [Telemetry] Add button click event tracking for main menu and error analysis component by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1570
    - Remove redundant lines of code in StatisticsUtils.ts by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1571
    - [Telemetry] Add button click event trackers for new model overview, data explorer, feature importances, counterfactual and causal by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1574
  - ## RAIInsights
    - update responsibleai package to latest interpret-community 0.26.0 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1491
    - Update requirements.txt to bump up econml to 0.13.0 by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1499
    - remove version for flask by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1515
    - Remove unused variables from create_classification_pipeline() by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1520
    - update raiwidgets and responsibleai to latest erroranalysis 0.3.3 release by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1535
    - Add column and feature range meta data to meta file by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1541
    - update raiwidgets and responsibleai to erroranalysis 0.3.4 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1544
    - update packages to new raiutils 0.2.0 and rai-core-flask 0.4.0 releases by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1550
    - Add hierarchy to rai exceptions by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1568
    - Add multiclass classification test in raiwidgets by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1576
  - ## Counterfactual
    - Update counterfactual serialization via dice-ml APIs by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1479
    - Fix unable to input decimal point in what if counterfactual feature text field by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1459
    - Bold input text for values that have changed from the original reference values for counterfactual list by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1516
    - Fix bug in deserializing counterfactual explainer by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1554
    - Add ID to counterfactual config and serialized counterfactual data by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1553
  - ## Causal
    - Enable skipped causal unit test by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1565
  - ## Error Analysis
    - add more docs to matrix filter aka heatmap in error analysis by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1489
    - part 2: add pyspark support to tree surrogate model in error analysis by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1388
    - use new getNativeModel method in get_surrogate_booster_pyspark to simplify erroranalysis code by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1475
    - fix erroranalysis erroring on serialization with numpy int64 feature names by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1537
  - ## Dataset Explorer
    - Reorder controls in data explorer legend by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1493
    - Fill color for data explorer box plot by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1504
- ## other
  - Add issues template for bugs and feature requests by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1486
  - Taking dependency on `is_classifier()` method and `SKLearn` constants class from `raiutils` by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1289
  - Localized file check-in by OneLocBuild Task: Build definition ID 21368: Build ID 65085801 by @riedgar-ms in https://github.com/microsoft/responsible-ai-toolbox/pull/1500
  - Split raiwidgets/e2e-notebooks test pipeline in two by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1478
  - Derandomize notebooks by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1507
  - Unify naming between notebooks and test cases by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1505
  - Update CODEOWNERS by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1513
  - Add License and Requirements to Source Distribtion by @janjagusch in https://github.com/microsoft/responsible-ai-toolbox/pull/1522
  - Move references for \_convert_to_list() and \_convert_to_string_list_dict() to raiutils by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1534
  - Move references for serialize_json_safe() to raiutils by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1536
  - fix flaky test by adding retry logic to fetch openml dataset in notebook by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1547
  - release rai-core-flask 0.4.0 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1546
  - release raiutils v0.2.0 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1545
  - update sphinx dependencies to fix jinja2 doc build error by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1551
  - Update CODEOWNERS by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1557
  - [E2ETests]Add flight && screenshots by @RubyZ10 in https://github.com/microsoft/responsible-ai-toolbox/pull/1566
  - fix release pipeline failing on UI widget tests by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1573
  - fix e2e UI tests incorrectly running tests with flights when no notebook name specified and reduce number of test jobs by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1577

## v0.19.0

- educational materials
  - add info about PR reviews to the contributing docs file by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1472
  - Adding extra statement in PR template for e2e by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1461
- new features
  - ## Responsible AI Dashboard
    - Model overview: improve placeholder, put confirm/cancel buttons at the bottom, and hide toggle when needed by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1433
  - ## RAIInsights
    - Add DataBalanceAnalysis module to ResponsibleAI package to be consumed by visualizations by @ms-kashyap in https://github.com/microsoft/responsible-ai-toolbox/pull/1473
- bug fixes and tests
  - ## Responsible AI Dashboard
    - Fix locators logic for string features - data explorer component by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1441
    - Fix cohort name conflict and not run few tests for AML by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1442
    - Few e2e tests changes to accommodate AML static tests by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1445
    - Fix locators logic for string features - data explorer and model statistics components by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1446
    - Add more unittests RAI dashboard input class by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1448
    - Update the way to get the length of elements obtained in e2e tests by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1450
    - Fix dataset explorer plot with count not displaying by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1454
    - Add toggle for switching classes in binary classification case by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1444
    - [office-ui upgrade] Move checkbox to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1465
    - [office-ui upgrade] Move combobox to fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1469
    - [office-ui upgrade] Move components in core-ui packageto fluentui by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1471
    - Fix TypeError: Cannot read properties of undefined (reading 'treatAsCategorical')" by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1452
    - Update predicted class value to uneditable text in counterfactual panel by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1458
    - Collapse correct prediction by default for individual feature importance by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1474
  - ## RAIInsights
    - Update requirements.txt to pin dice-ml at 0.8 by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1470
- ## other
  - Add more utilities into raiutils by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1295
  - Release raiutils v0.1.0 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1480
  - Update responsibleai to raiutils 0.1.0, raiwidgets and responsibleai to erroranalysis 0.3.2 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1483
  - Merge postbuild branch back into main by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1466
  - Remove postbuild branch triggers by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1476

## v0.18.2

- bug fixes and tests
  - ## Responsible AI Dashboard
    - Bug fixes on 'Set value' not copying over feature values correctly in what if counterfactual panel by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1416
    - Fix description for model overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1425
    - Fix math.min / max for array size more than 10^7 by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1427
  - ## RAIInsights
    - Add warning in counterfactual manager when unable to load explainer by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1412
  - ## Counterfactual
    - Remove "Set Value" blurb in case it is not available in counterfactual panel by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1426
    - Add y-axis description to counterfactual feature importance chart by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1423
  - ## Causal
    - Fix causal UI strings according to classification/regression tasks by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1419
    - Add the user class name to causal UI strings by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1422
    - Upper bound SciKit-Learn to address freeze in causal by @riedgar-ms in https://github.com/microsoft/responsible-ai-toolbox/pull/1432
  - ## Error Analysis
    - Fix error on machines with pyspark installed where passed dataframe is not spark pandas by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1415
    - Fix failing to create error report when filter_features is empty list by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1421
  - ## Interpret
    - Filter out missing values from what if dropdown to prevent explanation dashboard from crashing by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1418
    - Fix dependency chart axis updating with incorrect values in explanation dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1437
- ## other
  - Add postbuild branch trigger by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1417
  - Upgrade numpy to fix random segfault test failures by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1424
  - Fix flaky notebook causing build failures by adding retry logic by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1431
  - Fix codecov and widget test screenshot uploads by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1428

## v0.18.1

- educational materials
  - Add pre-built cohort into adult census notebook by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1243
  - Add pre-defined cohorts in responsibleaidashboard-diabetes-decision-making.ipynb by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1252
- new features
  - ## Responsible AI Dashboard
    - Add a summary for disaggregated analysis showing ratio and difference by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1367
    - Use global cohort for disaggregated analysis by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1370
    - Add accuracy as multiclass metric by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1371
    - Add a top-level pivot to model overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1375
    - Add a toggle to model overview to turn heatmap colors on and off by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1376
    - Add feature and metric configuration flyouts to model overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1381
    - Add probability distribution line chart to model overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1382
    - Provide feature flight support to dashboard, test environment, and Python widget by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1385
  - ## Error Analysis
    - add pyspark support to tree surrogate model in error analysis by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1251
- bug fixes and tests
  - ## Responsible AI Dashboard
    - Fix bug on scatter points in dataset explorer; remove outlier for aggregate feature importance box chart by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1364
    - Change procedural loops to functions map() and filter() by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1255
    - Create rai-e2e package for tests shared with AML by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1378
    - Create e2e package for tests shared with AML by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1383
    - fix race condition in tree view update code which can cause root stats to be ignored on selected cohort in RAI dashboard static view by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1386
    - String updates for model overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1387
    - Some fixes for data explorer, heatmap, counterfactual components by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1389
    - disable causal treatment whatif in static view by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1391
    - Fix feature selection state carry-over bug in model overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1390
  - ## RAIInsights
    - Rename \_validate_model_analysis_input_parameters() to \_validate_rai_insights_input_parameters() by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1373
  - ## Counterfactual
    - Add missing desired range to counterfactual chart by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1366
    - Cache and serialize the counterfactual explainer by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1374
    - fix big data set for counter factual chart by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1393
  - ## Causal
    - Handle the loading of causal models more gracefully by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1377
    - Alignment and style fixes for causal by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1392
- ## other
  - Add more context to download print statement in fetch_dataset by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1368
  - Update PR template to be more intuitive by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1116
  - Update CODEOWNERS file by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1369
  - update code owner by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1372

## v0.18.0

- educational materials
  - Simplify the train pipeline responsibleaidashboard-census-classification-model-debugging.ipynb by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1195
  - Add supported models, data types and capability matrix to README.md responsibleai by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1259
  - make getting-started notebook a markdown file showing APIs by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1223
  - fix readme link to fairness and interpretability example notebook by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1282
- new features
  - ## Responsible AI Dashboard
    - Replace dependence plot with highchart lib by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1208
    - Add user defined cohort injection logic into raiwidgets by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1237
    - Add feature importance box & bar chart by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1241
    - PreBuilt cohorts UX changes by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1242
    - Add individual causal scatter chart by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1258
    - Add what-If scatter chart from highchart lib by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1262
    - add new RAI Utils package for common utilities shared across RAI packages by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1280
    - Add ICE chart by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1283
    - Add highchart for Dataset Explorer by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1286
    - Add disaggregated analysis table/heatmap by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1332
    - Add disaggregated analysis table to Model Overview by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1341
- bug fixes and tests

  - ## Responsible AI Dashboard

    - update raiwidgets to rai-core-flask 0.2.5 release by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1221
    - Add e2e tests for Housing decision making and multiclass dnn notebooks by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1212
    - Refactor highchart defaultOptions by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1220
    - fix categorical what-if in RAI dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1225
    - Add scatter highchart get coordinate for e2e by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1226
    - update several required dependencies by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1219
    - add ut for DashboardSettingDeleteButton by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1231
    - Create pytest fixtures raiwidgets tests by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1232
    - Refactor dependence plot by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1230
    - Add regression test for pre-defined cohorts in raiwidgets by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1249
    - Set bar color to align with plot style by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1248
    - fix notebook build failures due to pywinpty dependency release failing in python 3.6 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1257
    - refactor tabs out of RAI dashboard into a separate component by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1256
    - minor fix to url for responsibleai package in setup.py by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1260
    - fix whitespace in values of adult census income dataset by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1263
    - allow rai text insights to work with RAI dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1269
    - remove duplicate code in explanation dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1266
    - Allow duplicating cohorts multiple times by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1274
    - Disable column header highlighting on hover in IndividualFeatureImportanceView by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1272
    - Rename new cohorts from "Unsaved" to "Temporary cohort" by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1273
    - Reorder "Sort by" controls in local feature importance chart by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1281
    - Fix cohort info styling by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1277
    - update docstring for explanation dashboard in regards to min number of rows by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1271
    - make builds more reliable by adding retry logic to urlretrieve calls in notebooks by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1218
    - upgrade pytest to 7.0.1, remove mock and upgrade pytest-mock to 3.6.1 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1287
    - fix jinja2 build error and remove deprecated codecov parameter by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1293
    - Fix min/max special case in cohort filter creation with "in the range of" by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1279
    - Rename 'Dashboard navigation' to 'Dashboard configuration' by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1291
    - Add raiutils to PR template by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1290
    - Fix heatmap bug by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1297
    - Make "save and switch" work from cohort settings by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1276
    - add retry logic to codecov step and only upload results for one python version and platform by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1298
    - add github action to release raiutils to pypi by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1294
    - Update requirements-linting.txt to add flake8-pytest-style by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1296
    - Fix sort by absolute value from local importance chart by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1299
    - Rename "base cohort" to "global cohort" by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1278
    - fix codecov comment not appearing on PRs by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1302
    - take absolute value of error calculation for regression scenario by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1301
    - Limit individual feature importance selection to up to 5 by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1305
    - Add to_json() and from_json() methods to Cohort class by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1300
    - Add a highchart heatmap helper class by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1307
    - Fix cohort setting string by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1304
    - Fix Inconsistent font size on "All data" cohort by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1303
    - Add a feature flag for the new model overview experience by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1306
    - Clean up charts code by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1313
    - Bump minimist from 1.2.5 to 1.2.6 by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1292
    - fix random node download failures by upgrading to latest github action with retry logic by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1317
    - Add dataset cohort table to new ModelOverview experience by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1314
    - Add installation instructions for raiwidgets to README by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1320
    - refactor RAIInsights into RAIBaseInsights class for basic functionality by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1284
    - Raise UserConfigValidationException in case no model but valid model serializer by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1325
    - show shift to an empty cohort in tree view as an empty node by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1318
    - Bug fixing by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1326
    - Add box outlier for dataset explorer by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1323
    - Update string when no datapoint selected for local importance by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1331
    - Fix Big empty space for featureImportance chart by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1328
    - Change warning message to user exception for model type and task type mismatch by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1330
    - Limit each component description width up to 750px for readability by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1336
    - block empty cohort creation in RAI Dashboard by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1335
    - Add warning message in cohort editor for invalid input value; Update 'Shift cohort' to 'Switch cohort' by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1339
    - All component title and descriptions should be aligned by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1346
    - Remove 5K limit blurb from local explanations tab by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1347
    - Bump moment from 2.28.0 to 2.29.2 by @dependabot in https://github.com/microsoft/responsible-ai-toolbox/pull/1333@vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1350
    - disable turbo checking for large amount of data by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1351
    - force re-render when chart type changes by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1354
    - Show column chart for categorical feature in data explorer by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1355
    - update fluentui by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1356
    - update code owner by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1308
    - update version to match studio by @xuke444 in https://github.com/microsoft/responsible-ai-toolbox/pull/1357
    - A few UI alignment fixes by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1359

  - ## RAIInsights
    - Add heterogeneity_model checks by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1210
    - DOC add type annotations to responsibleai package by @romanlutz in https://github.com/microsoft/responsible-ai-toolbox/pull/1214
    - Add data validations to SDK defined cohorts by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1227
    - Pin markupsafe and itsdangerous to unblock gates by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1238
    - Make cohortData empty list in case no pre-defined cohorts are injected by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1247
    - Make \_cohort.py module a public module by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1253
  - ## Counterfactual

    - Counterfactual Chart: Correct target description according to task_type by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1261
    - Counterfactual style refactor by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1275
    - Add error message for counterfactual panel by @tongyu-microsoft in https://github.com/microsoft/responsible-ai-toolbox/pull/1310
    - Change the counterfactual text color from black to grey by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1337
    - Expand the counterfactual flyout to cover the full page by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1315
    - Fix what if counterfactual header and description text misaligned by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1316
    - Rename counterfactual style files to confirm with -.styles.ts by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1338
    - Sort features by default in counterfactual flyout by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1312
    - Counterfactual flyout top section need to be moved to left & Error analysis move side content to align with description text by
    - Rename output column name in the counterfactual flyout by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1353

  - ## Error Analysis
    - fix tree api being called twice on initial load due to uninitialized context being used by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1229
    - fix total metric changing with different num bins when using quantile binning on diabetes dataset by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1233
    - erroranalysis version bump in raiwidgets to 0.1.31 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1245
    - add clear temporary cohort button to error analysis by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1322
    - move the root all data statistics to ErrorReport and ErrorAnalysisData by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1344
    - update error analysis documentation to clarify the error tree splits on errors even when other metrics are selected by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1349
    - Disable save as new cohort button if nothing is selected in error tree by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1327
    - update erroranalysis to 0.2.1 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1334
    - move the root all data statistics to ErrorReport and ErrorAnalysisData (part 2) by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1352
  - ## Interpret
    - update responsibleai to interpret-community 0.25.0 by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1343
  - ## Causal
    - Individual causal style responsive by @zhb000 in https://github.com/microsoft/responsible-ai-toolbox/pull/1268
    - Add test case for handling different types in causal manager by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1321
    - Rename causal style files to confirm with -.styles.ts by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1342

- ## other

  - Remove widget tests from CI-notebook pipeline by @vinuthakaranth in https://github.com/microsoft/responsible-ai-toolbox/pull/1213
  - add missing release steps causing rai-core-flask release errors by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1216
  - fix release pipeline by adding pytorch packages for tests by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1222
  - fix release error on unknown shell command when uploading to pypi by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1224
  - Correct falsey to falsely by @gaugup in https://github.com/microsoft/responsible-ai-toolbox/pull/1228
  - add a builddebug yarn command to build UX locally which can be debugged in browser e2e by @imatiach-msft in https://github.com/microsoft/responsible-ai-toolbox/pull/1265

## v0.17.0

- educational materials
  - add e2e test steps to CONTRIBUTING.md file for developers/contributors
  - add steps for validating UX and SDK changes to documentation
  - replace boston housing dataset with california housing dataset in tests and example notebook due to ethical concerns and biases
  - update dnn pytorch notebook example to give more interesting results by increasing model epochs
- new features
  - ## Responsible AI Dashboard
    - move performance metric chart, disaggregated metric table, and StatisticsUtils into core-ui
    - add highchart, all components will be moved to highchart instead of plotly gradually
    - add metrics to StatisticsUtils - F1 score, selection rate, mean absolute error
    - add cohort and filter definitions in raiwidgets SDK
    - enable highchart exporting functionality
  - ## Responsible AI Dashboard for Text
    - add new interpret-text library skeleton
  - ## Causal
    - add treatment bar chart
- bug fixes and tests
  - ## Responsible AI Dashboard
    - add e2e UI tests for Causal Analysis - classification tests
    - add e2e UI tests for Feature Importance - aggregate importances
    - add e2e UI tests for Feature Importance - individual importances
    - add e2e UI tests for What-If Counterfactuals
    - add e2e UI tests for Data Explorer - diabetes-regression-model-debugging notebook
    - add e2e UI tests for Causal Analysis - diabetes-regression-model-debugging notebook
    - add e2e UI tests for Model Overview - diabetes-regression-model-debugging notebook
    - add e2e UI tests for responsibleaidashboard-housing-classification-model-debugging notebook
    - fix e2e UI What-if sort test
    - add e2e UI tests for Feature Importance - responsibleaidashboard-diabetes-decision-making notebook
    - add e2e UI tests for What-if, Model Overview and Data explorer - responsibleaidashboard-diabetes-decision-making notebook
    - add e2e UI tests for Aggregate Causal Analysis - diabetes-decision-making notebook
    - add multiclass classification dataset to UI test app and set up basic model-assessment tests for Model Overview
    - add notebook test for pytorch example notebook and add pytorch to CI
    - move to new fluentUI dependency
    - correctly annotate python warnings
    - separate out raiwidgets and UI tests into its own workflow, and added new pipeline to run RAIwidget e2e tests
    - add js and raiwidget code coverage
    - add upload step to e2e test for CI RAIWidgets Python Typescript pipeline
    - add upload step to e2e test to CI notebooks pipeline
    - return exception details to UI
    - add docstrings for locale parameter
  - ## RAIInsights
    - catch dirty data conditions in RAI Insights validation
    - update responsibleai to interpret-community 0.24.0
    - update responsibleai to interpret-community 0.24.1
    - update responsibleai to interpret-community 0.24.2
    - make responsibleai managers public and add back compat connectors
    - make explanations save behavior similar to other managers
    - change logic to walk categorical columns in validate_train_test_categories
    - cover missing test scenario in state_directory_management.py
    - default categorical feature to array
    - add error analysis test for regression task in RAIInsights
    - make causal manager add and compute behavior similar to other managers
  - ## Counterfactual
    - add feature importance description for counterfactual local importance
    - update Counterfactual explanation text description
  - ## Error Analysis
    - fix importances taking too long to calculate for large data in error analysis
    - add a perf test for validating training the surrogate error tree on large data and a minor optimization for traversing the tree
    - add filtering on index to error analysis backend for RAI dashboard cohort switch
    - remove unnecessary multiple calls to tree api
    - refactor tree view state to be private static in tree view renderer and not in parent
    - create github action to release erroranalysis
    - add excludes cohort filter test in erroranalysis
    - refactor matrix filter and area state to be private static
    - make search case insensitive in feature list
    - add more docs for error analysis surrogate tree
    - optimize tree traversal logic in error analysis to reduce execution time when running on several million rows
  - ## Interpret
    - allow ExplanationDashboard to show limited view for more than 1k features instead of erroring
  - ## Causal
    - improve documentation for nuisance_model and heterogeneity_model
    - implement list method in causal manager
- ## other
  - fix pypi releases by reverting back to pypi token per package
  - fix dummy counterfactual feature importance values for UI test app
  - add pseudo language for localization test
  - integrate codecov into responsible-ai-toolbox repository
  - remove test warning due to use of deprecated np.object
  - add python 3.9 tests
  - fix ipython dependency in rai-core-flask and remove from raiwidgets
  - update setup.py files to carry python 3.9 classifiers
  - fix broken builds due to pip upgrade which broke pip-tools
  - remove mac temporarily from rai widgets step to fix failing builds
  - remove node-version from CI-python.yml
  - fix flaky flask test
  - improve description for responsibleai and raiwidgets pypi packages

## v0.16.0

- educational materials
  - major readme refactoring changes + filename changes for public release of RAI Dashboard
  - add missing doc for pred_y_dataset and min_child_samples
  - add npm and yarn installation instructions
- new features
  - ## Counterfactual
    - counterfactual list style updates: highlight counterfactual examples columns with different color, and bold size
    - highlight first and last row of counterfactual list
    - implement list method for counterfactual manager
  - ## Error Analysis
    - add scrollbar area around matrix cells when there are many categories
    - add warning message for downsampled explanation data in ErrorAnalysis
- bug fixes and tests
  - ## Responsible AI Dashboard
    - add e2e UI tests for Dataset Explorer - whisker plot
    - add e2e UI tests for Dataset Explorer - scatter plot
    - add e2e UI tests for Dataset Explorer - flyout
    - add e2e UI tests for Dataset Explorer - cohort scenarios
    - add e2e UI tests for Model Statistics - chart tests
    - refactor binding this with arrow func
    - add error message for duplicate cohort name
    - handle context cohort delete cases for data explorer
  - ## RAIInsights
    - throw error on mutating predict function in RAIInsights
    - use spilt orientation to save train and test dataframe to address duplicate indices condition in them
    - add .json extension to dtypes files and add tests
    - add predict and predict_proba outputs to RAIInsights save method
    - refactor RAIInsights load function into smaller functions
    - refactor classifier detection logic into common function
    - fix issue with missing directories
    - gracefully handle failure in loading model.pkl from disk
    - remove unused test dependencies responsibleai
    - add missing unit tests for \_convert_to_list()
    - separate out save() and load() tests
    - add more unit tests for serialize_json_safe()
    - update responsibleai to interpret-community 0.23.0
  - ## Counterfactual
    - add e2e UI tests for what-if counterfactuals - creating counterfactuals
  - ## Error Analysis
    - fix coverage calculation for cell tooltips in heatmap for recall, precision and f1 score metrics
    - fix handling numpy types in heatmap for categories
  - ## Interpret
    - improve state management for explainer manager
    - test for save/load/save bug in Explanations
- other
  - fix top broken image link in tour notebook on github
  - add isort to build pipelines
  - fix SubBarChart flaky test
  - update notebook tests for new notebooks
  - add flake8-bugbear for better python code contructs
  - add flake8-breakpoint to avoid code checkin with active breakpoints
  - remove csv files from source for cognitive services example notebooks
  - add yarn e2e-watch shortcut
  - replace existing user token with shared account token for releases

## v0.15.1

- educational materials
  - Notebooks updated for new class names (`ResponsibleAIDashboard` etc.)
- new features
  - None
- breaking changes
  - ## RAI Insights/Model Analysis
    - Rename `explainers` directory to `generators` when saving RAI Insights object
- bug fixes
  - ## RAI Insights/Model Analysis
    - Fix [Issue #1046](https://github.com/microsoft/responsible-ai-toolbox/issues/1046), related to a save/load/save cycle when no explainer present
- other
  - Extra tests for WhatIf counterfactuals
  - Checks on the UUID directory structure of RAI Insights

## v0.15.0

- new features
  - ## Model Analysis
    - move raw data into /data directory
    - perform schema validations during compute and load
    - rename model analysis to rai insights
    - rename ModelAnalysisDashboard to ResponsibleAIDashboard
    - directory based state management for model analysis tools
    - add .json extension to train and test dataset
  - ## Error Analysis
    - port ErrorReport schema validation for error analysis to responsibleai
    - add error analysis error importances (aka correlation of features with error) to model analyzer API
    - add support for special classification outcome filter to error analysis backend to work with model analysis filters
  - ## Counterfactual
    - remove save as new data point option for read-only mode on What-if counterfactual
    - split counterfactual output into individual json files
    - add support for non-string categorical values
- bug fixes
  - ## Model Analysis
    - fix cohort text out of button box
    - fix bug when the tree node has 0 errors and N correct, the raw data table shows the opposite with N+1 errors and -1 correct.
    - when classes are not passed, sort them automatically in RAIInsights
    - fix composite filter issues
  - ## Counterfactual
    - fix sort feature columns by counterfactual
  - ## Error Analysis
    - fix map shift text not being clear, provide conditional dialog text based on current view
    - fix tree map connection line doubled after switching to dark theme
- ## other
  - update readme links to be absolute instead of relative path
  - add more UX IFI tests for responsibleaitoolbox-classification-model-assessment notebook
  - several E2E UX test fixes
  - add E2E UX tests for Feature Importance - Cohort functionality
  - add test to render ModelAnalysisDashboard after save and load
  - add test to render ResponsibleAIDashboard after save and load
  - add E2E tests for What-if Counterfactuals - common functionalities & Y Axis Flyout
  - add separate github workflow for python linting

## v0.14.0

- educational materials
  - add Cognitive Service fairness assessment notebooks
- new features
  - ## Error Analysis
    - add new accuracy and f1-score metrics in erroranalysis python backend and UI frontend
    - add importances to ErrorReport for error analysis
    - make ErrorReport, PredictionsAnalyzer and ModelAnalyzer public in erroranalysis package
    - display message bar after saving a cohort in error analysis dashboard
  - ## Counterfactual
    - implement save and load for counterfactual manager
    - make load method uniform across all RAI managers
    - perform schema validations on serialized counterfactual output
  - ## Interpret
    - upgrade interpret-community to 0.22.0
- bug fixes
  - ## Model Analysis
    - remove drag and drop instructions in the dashboard navigation
    - add theme support for model statistics and dataset explorer
    - remove setup_explainer after ModelAnalysis load call in tests
    - add theme support for feature importances, causal, counterfactual tabs
    - hide opened feature list when clicking on the heatmap tab in model analysis
    - add localization for delete cohort dialog
  - ## Interpret
    - set is_run class variable in explainer manager
  - ## Causal
    - add init file to causal schema directory
  - ## Error Analysis
    - fix color for metrics that are not error metrics to be green in legend and heatmap nan cells
    - update features list in static view to have apply button removed and labels disabled for tree view parameters
    - update features list text for static case
    - fix running what if on categorical numeric values in error analysis dashboard
    - add theme support for error analysis view
    - fix for importances in static view causing failures when unspecified
    - fix feature list alignment issue
- ## other
  - add documentation for the release process
  - add E2E test for model analysis, running from python jupyter notebook and validating in cypress
  - sort all python imports using isort
  - add aggregate feature importance tests for responsibleaitoolbox
  - add E2E individual feature importance tests for responsibleaitoolbox-classification-model-assessment notebook
  - fix image links in responsibleaitoolbox-classification-model-assessment.ipynb notebook to reference images in folder instead of using embedded images directly
  - rename causal tests

## v0.13.0

- new features
  - ## Model Analysis
    - add "Save amd switch" button to cohort creation
    - pass classes parameter to both error analysis dashboard and error analysis manager in model analysis
    - upgrade interpret-community to 0.20.0
  - ## Error Analysis
    - update erroranalysis to 0.1.24
- bug fixes
  - ## Model Analysis
    - fix issue with widgets rendering with 8px height
  - ## Error Analysis
    - fix precision and recall score failing on string labels in error analysis
    - fix multiclass precision and recall calculation for NA zero values in heatmap
    - edit string in error analysis cohort creation
    - remove text in heatmap suggesting to select features when in static view
    - minor doc fix for examples in error analysis dashboard
  - ## Counterfactual
    - fix horizontal scroll bar disappears for small screen in what-if panel
  - ## Fairness
    - fix data issue caused robot page exception on fairnessDetails
- other
  - fix broken link to getting started notebook
  - fix broken image link on main readme
  - fix the issues with sample notebooks markdown images
  - delete old notebooks
  - change tests to run on new notebooks, add new notebook to tests

## v0.12.1

- new features
  - ## Error Analysis
    - add disabled tree view and heatmap for static view
- bug fixes
  - ## Error Analysis
    - fix class length causing labels to not be shown in simple view of Error Analysis
    - fix cohort filter tooltip behind cohort info panel
  - ## Causal
    - fix trace0 appearing on hover tooltip in plots
  - ## Counterfactual
    - handle cases where counterfactuals failed to compute
    - add tooltip for counterfactual info
- other
  - some grammatical errors were corrected on documentation page

## v0.12.0

- new features
  - ## Model Analysis
    - add global cohort statistics
  - ## Error Analysis
    - add metric selector dropdown
    - add tree view parameters as sliders to features selector panel
    - add tooltip to heatmap categories and left-justify the heatmap
  - ## Counterfactual
    - upgrade dice-ml to 0.7.2
- bug fixes
  - ## Model Analysis
    - fix cohort information in heatmap resizing in model analysis
    - log warning when regression model has predict_proba()
  - ## Error Analysis
    - fix error rate gradient for classification scenario
    - fix quantile binning toggle should stay on when making actions
    - fix multiple issues in instance view, including:
      - when selecting multiple rows in correct and incorrect panels, and going to all selected, if a point is removed in the middle all of the points below get removed
      - when removing points in the all selected panel, the count does not get updates in the correct/incorrect panels until they are selected
      - when using what if, make points not selectable
    - fix precision and recall calculation in the UI changing with number of bins
    - decrease the lower bound on first category for quantile binning
    - fix handling of numeric features names in pandas for error analysis tree view
    - reverse y axis in heatmap so that higher values are towards the top of the matrix
    - add warnings for 2d heatmap case and test for quantile binning with duplicate edges
  - ## Causal
    - sort causal data point by effect size
    - set treatment list spin range
    - fix causal global effect plot x-axis titles cut off
    - fix causal categorical treatment average gains text
  - ## Counterfactual
    - change current class label for regression task
    - raise exception when users configures less than required counterfactuals
    - show options for categorical features on counterfactual list
  - ## Fairness
    - add error handling for missing metrics in fairness
- other
  - remove Axios library from dependencies
  - rename wrapped-flask to rai_core_flask
  - remove deprecated babelconfig option in workspace.json

## v0.11.0

- new features
  - table for list of available cohorts
  - added more metrics to ErrorAnalysisDashboard, including precision, recall and mean abs error
- bug fixes
  - fix various UI usability bugs
  - fix for clicking custom scatter plot point
  - ## Error Analysis
    - fix selecting what if datapoint crashing dashboard
    - fix error in quantile binning when there are too many duplicate points
    - fix displayed error rate in all data cohort in cohort list
    - fix error in heatmap for classification case
    - fix features list not getting disabled in static view
    - update description text for static view
- other
  - improve validation for model prediction
  - reorder counterfactual table columns
  - add absolute sorting for local importance charts
  - improve spacing and fonts across dashboard
  - fix typos in docstrings
  - improve wording of text on dashboard
  - add warnings for soft data limits
  - remove font override for all components
  - add code coverage to repository

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

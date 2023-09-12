![Responsible AI Widgets Python Build](https://github.com/microsoft/responsible-ai-widgets/workflows/Responsible%20AI%20Widgets/badge.svg) ![CD](https://github.com/microsoft/responsible-ai-widgets/workflows/CD/badge.svg) ![MIT license](https://img.shields.io/badge/License-MIT-blue.svg) ![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?color=blue) ![PyPI rai_core_flask](https://img.shields.io/pypi/v/rai_core_flask?color=blue) ![npm fairness](https://img.shields.io/npm/v/@responsible-ai/fairness?label=npm%20%40responsible-ai%2Ffairness) ![npm interpret](https://img.shields.io/npm/v/@responsible-ai/interpret?label=npm%20%40responsible-ai%2Finterpret) ![npm mlchartlib](https://img.shields.io/npm/v/@responsible-ai/mlchartlib?label=npm%20%40responsible-ai%2Fmlchartlib) ![npm core-ui](https://img.shields.io/npm/v/@responsible-ai/core-ui?label=npm%20%40responsible-ai%2Fcore-ui) ![npm dataset-explorer](https://img.shields.io/npm/v/@responsible-ai/dataset-explorer?label=npm%20%40responsible-ai%2Fdataset-explorer) ![npm causality](https://img.shields.io/npm/v/@responsible-ai/causality?label=npm%20%40responsible-ai%2Fcausality) ![npm counterfactuals](https://img.shields.io/npm/v/@responsible-ai/counterfactuals?label=npm%20%40responsible-ai%2Fcounterfactuals)

# Explanations For Object Detection Scenario

## Implementation Architecture

![Explanations - Object Detection - Architecture](./img/ObjectDetection-Explanations.png)

## Description

Currently, computer vision object detection AutoML customers only receive performance metrics and have asked for better ways to debug their models and obtain model explanations. Without the right tools and infrastructure, operationalizing Responsible AI is tedious, manual and time consuming with minimal instructions and very few disjointed frameworks. Metrics alone are not enough to inform and update subject matter experts and stakeholders.
Using visual explanations of object detection predictions, ML practitioners can gain stakeholder trust and ultimately build better models. That is where ![DRISE](https://arxiv.org/pdf/2006.03204.pdf) comes into play.
In the RAI Dashboard (Object Detection scenario), we build in capabilities for data scientists to view saliency maps explaining predictions.

## User Experience

Explanations can be calculated on the fly or prior to instantiation of the dashboard. For the former, users can set precompute_explanations=False when creating the dashboard. For the latter, users can set precompute_explanations=True when creating the dashboard.  
Note that an **attached compute** will be required to access these explanations for either setting.

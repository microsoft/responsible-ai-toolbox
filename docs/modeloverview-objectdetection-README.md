![Responsible AI Widgets Python Build](https://github.com/microsoft/responsible-ai-widgets/workflows/Responsible%20AI%20Widgets/badge.svg) ![CD](https://github.com/microsoft/responsible-ai-widgets/workflows/CD/badge.svg) ![MIT license](https://img.shields.io/badge/License-MIT-blue.svg) ![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?color=blue) ![PyPI rai_core_flask](https://img.shields.io/pypi/v/rai_core_flask?color=blue) ![npm fairness](https://img.shields.io/npm/v/@responsible-ai/fairness?label=npm%20%40responsible-ai%2Ffairness) ![npm interpret](https://img.shields.io/npm/v/@responsible-ai/interpret?label=npm%20%40responsible-ai%2Finterpret) ![npm mlchartlib](https://img.shields.io/npm/v/@responsible-ai/mlchartlib?label=npm%20%40responsible-ai%2Fmlchartlib) ![npm core-ui](https://img.shields.io/npm/v/@responsible-ai/core-ui?label=npm%20%40responsible-ai%2Fcore-ui) ![npm dataset-explorer](https://img.shields.io/npm/v/@responsible-ai/dataset-explorer?label=npm%20%40responsible-ai%2Fdataset-explorer) ![npm causality](https://img.shields.io/npm/v/@responsible-ai/causality?label=npm%20%40responsible-ai%2Fcausality) ![npm counterfactuals](https://img.shields.io/npm/v/@responsible-ai/counterfactuals?label=npm%20%40responsible-ai%2Fcounterfactuals)

# Model Overview for Object Detection

## Implementation Architecture

![Model Overview - Object Detection - Architecture](./img/ModelOverview-ObjectDetection-Architecture.png)

## Description

### User

When the user generates the dashboard and attaches compute, the RAI Dashboard automatically starts calculating the metrics for the specified test dataset. Calculation of metrics is also triggered as soon as the user adds a new Cohort.

### RAI Dashboard

The dashboard displays NaN with a magenta background while calculating the metrics, and re-renders the Model Overview metrics table with the metric values.

### Flask endpoint

A dedicated Flask endpoint `requestObjectDetectionMetrics` is triggered by the dashboard’s frontend to calculate metrics. The structure, I/O contract of the endpoint is made entirely by piggybacking on RAI toolbox repo’s existing infrastructure for creating custom endpoints.

### TorchMetrics

This python module contains the implementation for the surfaced metrics (Mean Average Precision, Average Precision, and Average Recall) - ![Mean-Average-Precision (mAP) — PyTorch-Metrics 0.11.4 documentation (torchmetrics.readthedocs.io)](https://torchmetrics.readthedocs.io/en/stable/detection/mean_average_precision.html)

### Endpoint:

Typescript: requestObjectDetectionMetrics
Python: compute_object_detection_metrics

|                   Input                   |                                           Type                                            |
| :---------------------------------------: | :---------------------------------------------------------------------------------------: |
|             Selection indexes             | 2D list with each list <br> specifying indices of the images <br> included in that cohort |
| Aggregate Method (egs - ‘Macro’, ‘Micro’) |                                          Value 5                                          |
|                Class name                 |                                            str                                            |
|               IoU threshold               |                                           float                                           |

|                    Output                     |                                          Type                                          |
| :-------------------------------------------: | :------------------------------------------------------------------------------------: |
| Metrics as displayed in the <br> below table. | 2D List (where each <br> list has cohort-based metrics <br> [MAP, class-AP, class-AR]) |

The metrics function on the python side is defined in `responsibleai_dashboard_input.py` and invoked in `responsibleai_dashboard.py`.

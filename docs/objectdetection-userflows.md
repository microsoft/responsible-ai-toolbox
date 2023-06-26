![Responsible AI Widgets Python Build](https://github.com/microsoft/responsible-ai-widgets/workflows/Responsible%20AI%20Widgets/badge.svg) ![CD](https://github.com/microsoft/responsible-ai-widgets/workflows/CD/badge.svg) ![MIT license](https://img.shields.io/badge/License-MIT-blue.svg) ![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?color=blue) ![PyPI rai_core_flask](https://img.shields.io/pypi/v/rai_core_flask?color=blue) ![npm fairness](https://img.shields.io/npm/v/@responsible-ai/fairness?label=npm%20%40responsible-ai%2Ffairness) ![npm interpret](https://img.shields.io/npm/v/@responsible-ai/interpret?label=npm%20%40responsible-ai%2Finterpret) ![npm mlchartlib](https://img.shields.io/npm/v/@responsible-ai/mlchartlib?label=npm%20%40responsible-ai%2Fmlchartlib) ![npm core-ui](https://img.shields.io/npm/v/@responsible-ai/core-ui?label=npm%20%40responsible-ai%2Fcore-ui) ![npm dataset-explorer](https://img.shields.io/npm/v/@responsible-ai/dataset-explorer?label=npm%20%40responsible-ai%2Fdataset-explorer) ![npm causality](https://img.shields.io/npm/v/@responsible-ai/causality?label=npm%20%40responsible-ai%2Fcausality) ![npm counterfactuals](https://img.shields.io/npm/v/@responsible-ai/counterfactuals?label=npm%20%40responsible-ai%2Fcounterfactuals)

# Object Detection Userflows

## Open Source Users

![Object Detection - OS Users](./img/ObjectDetection-OSArchitecture.png)

## Enterprise Users

![Object Detection - Enterprise Users](./img/ObjectDetection-EnterpriseArchitecture.png)

## Developers/Contributors

![Object Detection - Developers/Contributors](./img/ObjectDetection-DevArchitecture.png)

## Description

### Input Artifacts

The user provides inputs including a model (from pytorch or an E2E differentiable AutoML model), dataset (with pandas or AML’s MLTable format for non-OS users), and a compute for enterprise users.

### MLFlow Model Loading

For enterprise customers running a DPv2 job to generate the dashboard, the models must be serialized using AML’s Model Serializer which utilizes MLflow under the hood to ensure a uniform interface to load the model.

### Dashboard Insights

The user inputs are passed to the `RAIVisionInsights` method in python, which sets up all the insights to be passed to the dashboard.

### Wrappers

The RAI Vision Insights method utilizes wrappers from the `ml-wrappers` GitHub repo to wrap the supplied model for actions such as inference and for generating explanations. Additional wrappers may needed to support new kinds of models or explanation methods.

### Image Dashboard Generator

The `ResponsibleAIDashboard` method takes the Vision Insights object and generates the dashboard. This method is directly invoked by open-source users to get a localhost link of the dashboard, and abstracted away by a DPv2 job for enterprise users.

### Environment

Open-source can use typical python notebooks (such as Jupyter, VS Code etc) to invoke the python methods for generating the dashboard locally.

### UI

This specifies the interface where the dashboard is deployed for viewing and interactions by the user. Open-source users can view this on a typical web browser from the localhost link.

Enterprise users can view the dashboard on Azure AI Studio and get added benefits of using larger CPU/GPU compute, and having access to all dashboards generated for their registered model and user inputs (including the specific dataset version).

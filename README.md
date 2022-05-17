![Responsible AI Widgets Python Build](https://github.com/microsoft/responsible-ai-widgets/workflows/Responsible%20AI%20Widgets/badge.svg) ![CD](https://github.com/microsoft/responsible-ai-widgets/workflows/CD/badge.svg) ![MIT license](https://img.shields.io/badge/License-MIT-blue.svg) ![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?color=blue) ![PyPI rai_core_flask](https://img.shields.io/pypi/v/rai_core_flask?color=blue) ![npm fairness](https://img.shields.io/npm/v/@responsible-ai/fairness?label=npm%20%40responsible-ai%2Ffairness) ![npm interpret](https://img.shields.io/npm/v/@responsible-ai/interpret?label=npm%20%40responsible-ai%2Finterpret) ![npm mlchartlib](https://img.shields.io/npm/v/@responsible-ai/mlchartlib?label=npm%20%40responsible-ai%2Fmlchartlib) ![npm core-ui](https://img.shields.io/npm/v/@responsible-ai/core-ui?label=npm%20%40responsible-ai%2Fcore-ui) ![npm dataset-explorer](https://img.shields.io/npm/v/@responsible-ai/dataset-explorer?label=npm%20%40responsible-ai%2Fdataset-explorer) ![npm causality](https://img.shields.io/npm/v/@responsible-ai/causality?label=npm%20%40responsible-ai%2Fcausality) ![npm counterfactuals](https://img.shields.io/npm/v/@responsible-ai/counterfactuals?label=npm%20%40responsible-ai%2Fcounterfactuals)

# Responsible AI Toolbox
Responsible AI is an approach to assessing, developing, and deploying AI systems in a safe, trustworthy, and ethical manner, and take responsible decisions and actions.

Responsible AI Toolbox is a suite of tools provides a collection of model and data exploration and assessment user interfaces that enable a better understanding of AI systems. These interfaces empower developers and stakeholders of AI systems to develop and monitor AI more responsibly, and take better data-driven actions.


<p align="center">
<img src="https://raw.githubusercontent.com/microsoft/responsible-ai-widgets/main/img/responsible-ai-toolbox.png" alt="Model Assessment" width="250"/>


The Toolbox consists of four dashboards: 
-	[Error Analysis dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/erroranalysis-dashboard-README.md), for identifying model errors and discovering cohorts of data for which the model underperforms. 
-	[Interpretability dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/explanation-dashboard-README.md), for understanding model predictions. This dashboard is powered by InterpretML.
-	[Fairness dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/fairness-dashboard-README.md), for understanding model’s fairness issues using various group-fairness metrics across sensitive features and cohorts. This dashboard is powered by Fairlearn.
-	[Responsible AI dashboard](https://github.com/microsoft/responsible-ai-toolbox#introducing-responsible-ai-dashboard), a single pane of glass bringing together several mature Responsible AI tools from the toolbox for a holistic responsible assessment and debugging of models and making informed business decisions. With this dashboard, you can identify model errors, diagnose why those errors are happening, and mitigate them. Moreover, the causal decision-making capabilities provide actionable insights to your stakeholders and customers.


## Introducing Responsible AI dashboard

[Responsible AI dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaidashboard/tour.ipynb) is a single pane of glass, enabling you to easily flow through different stages of model debugging and decision-making. This customizable experience can be taken in a multitude of directions, from analyzing the model or data holistically, to conducting a deep dive or comparison on cohorts of interest, to explaining and perturbing model predictions for individual instances, and to informing users on business decisions and actions.



<p align="center">
<img src="https://raw.githubusercontent.com/microsoft/responsible-ai-widgets/main/img/responsible-ai-dashboard-intro.png" alt="Model Assessment" width="200"/>




In order to achieve these capabilities, the dashboard integrates together ideas and technologies from several open-source toolkits in the areas of



- <b>Error Analysis</b> powered by [Error Analysis](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/erroranalysis-dashboard-README.md), which identifies cohorts of data with higher error rate than the overall benchmark. These discrepancies might occur when the system or model underperforms for specific demographic groups or infrequently observed input conditions in the training data.

- <b>Model Interpretability</b> powered by [InterpretML](https://github.com/interpretml/interpret-community), which explains blackbox models, helping users understand their model's global behavior, or the reasons behind individual predictions.

- <b>Counterfactual Analysis</b> powered by [DiCE](https://github.com/interpretml/DiCE), which shows feature-perturbed versions of the same datapoint who would have received a different prediction outcome, e.g., Taylor's loan has been rejected by the model. But they would have received the loan if their income was higher by $10,000.

- <b>Causal Analysis</b> powered by [EconML](https://github.com/microsoft/EconML), which focuses on answering What If-style questions to apply data-driven decision-making – how would revenue be affected if a corporation pursues a new pricing strategy? Would a new medication improve a patient’s condition, all else equal?


Responsible AI dashboard is designed to achieve the following goals:

- To help further accelerate engineering processes in machine learning by enabling practitioners to design customizable workflows and tailor Responsible AI dashboards that best fit with their model assessment and data-driven decision making scenarios.
- To help model developers create end to end and fluid debugging experiences and navigate seamlessly through error identification and diagnosis by using interactive visualizations that identify errors, inspect the data, generate global and local explanations models, and potentially inspect problematic examples.
- To help business stakeholders explore causal relationships in the data and take informed decisions in the real world.

This repository contains the Jupyter notebooks with examples to showcase how to use this widget. Get started [here](https://github.com/microsoft/responsible-ai-widgets/blob/main/notebooks/responsibleaidashboard/getting-started.ipynb).


### Installation

Use the following pip command to install the Responsible AI Toolbox.

If running in jupyter, please make sure to restart the jupyter kernel after installing.

```
pip install raiwidgets
```


### Responsible AI dashboard Customization

The Responsible AI Toolbox’s strength lies in its customizability. It empowers users to design tailored, end-to-end model debugging and decision-making workflows that address their particular needs. Need some inspiration? Here are some examples of how Toolbox components can be put together to analyze scenarios in different ways:
 
| Responsible AI Dashboard Flow| Use Case  |
|--|--|
| Model Overview -> Error Analysis -> Data Explorer| To identify model erros and diagnose them by understanding the underlying data distribution
| Model Overview -> Error Analysis -> Counterfactuals Analysis and What-If | To diagnose errors in individual instances with counterfactual analysis (minimum change to lead to a different model prediction)
| Model Overview -> Data Explorer | To understand the root cause of errors and fairness issues introduced via data imbalances or lack of representation of a particular data cohort
 | Model Overview -> Interpretability | To diagnose model errors through understanding how the model has made its predictions
 | Data Explorer -> Causal Inference | To distinguish between correlations and causations in the data or decide the best treatments to apply to see a positive outcome
  | Interpretability -> Causal Inference | To learn whether the factors that model has used for decision making has any causal effect on the real-world outcome.
 | Data Explorer -> Counterfactuals Analysis and What-If | To address customer questions about what they can do next time to get a different outcome from an AI.


### Useful Links

- [Take a tour of Responsible AI Dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaidashboard/tour.ipynb)
- [Get started](https://github.com/microsoft/responsible-ai-widgets/blob/main/notebooks/responsibleaidashboard/getting-started.ipynb)

Model Debugging Examples:
- [Try the tool: model debugging of a census income prediction model (classification)](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/responsibleaidashboard/responsibleaidashboard-census-classification-model-debugging.ipynb)
- [Try the tool: model debugging of a housing price prediction model (classification)](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/responsibleaidashboard/responsibleaidashboard-housing-classification-model-debugging.ipynb)
- [Try the tool: model debugging of a diabetes progression prediction model (regression)](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/responsibleaidashboard/responsibleaidashboard-diabetes-regression-model-debugging.ipynb)

 Responsible Decision Making Examples:
- [Try the tool: make decisions for house improvements](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/responsibleaidashboard/responsibleaidashboard-housing-decision-making.ipynb)
- [Try the tool: provide recommendations to patients using diabetes data](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/responsibleaidashboard/responsibleaidashboard-diabetes-decision-making.ipynb)



## Supported Models

This Responsible AI Toolbox API supports models that are trained on datasets in Python `numpy.ndarray`, `pandas.DataFrame`, `iml.datatypes.DenseData`, or `scipy.sparse.csr_matrix` format.

The explanation functions of [Interpret-Community](https://github.com/interpretml/interpret-community) accept both models and pipelines as input as long as the model or pipeline implements a `predict` or `predict_proba` function that conforms to the Scikit convention. If not compatible, you can wrap your model's prediction function into a wrapper function that transforms the output into the format that is supported (predict or predict_proba of Scikit), and pass that wrapper function to your selected interpretability techniques.

If a pipeline script is provided, the explanation function assumes that the running pipeline script returns a prediction. The repository also supports models trained via **PyTorch**, **TensorFlow**, and **Keras** deep learning frameworks.

## Other Use Cases

Tools within the Responsible AI Toolbox can also be used with AI models offered as APIs by providers such as [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/). To see example use cases, see the folders below:

- [Cognitive Services Speech to Text Fairness testing](https://github.com/microsoft/responsible-ai-widgets/tree/main/notebooks/cognitive-services-examples/speech-to-text)
- [Cognitive Services Face Verification Fairness testing](https://github.com/microsoft/responsible-ai-widgets/tree/main/notebooks/cognitive-services-examples/face-verification)

## Maintainers

- [Ke Xu](https://github.com/KeXu444)
- [Roman Lutz](https://github.com/romanlutz)
- [Ilya Matiach](https://github.com/imatiach-msft)
- [Dawei Li](https://github.com/chnldw)
- [Bo Zhang](https://github.com/zhb000)
- [Gaurav Gupta](https://github.com/gaugup)
- [Richard Edgar](https://github.com/riedgar-ms)
- [Vinutha Karanth](https://github.com/vinuthakaranth)
- [Tong Yu](https://github.com/tongyu-microsoft)
- [Ruby Zhu](https://github.com/RubyZ10)

![Responsible AI Widgets Python Build](https://github.com/microsoft/responsible-ai-widgets/workflows/Responsible%20AI%20Widgets/badge.svg) ![CD](https://github.com/microsoft/responsible-ai-widgets/workflows/CD/badge.svg) ![MIT license](https://img.shields.io/badge/License-MIT-blue.svg) ![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?color=blue) ![PyPI rai_core_flask](https://img.shields.io/pypi/v/rai_core_flask?color=blue) ![npm fairness](https://img.shields.io/npm/v/@responsible-ai/fairness?label=npm%20%40responsible-ai%2Ffairness) ![npm interpret](https://img.shields.io/npm/v/@responsible-ai/interpret?label=npm%20%40responsible-ai%2Finterpret) ![npm mlchartlib](https://img.shields.io/npm/v/@responsible-ai/mlchartlib?label=npm%20%40responsible-ai%2Fmlchartlib) ![npm core-ui](https://img.shields.io/npm/v/@responsible-ai/core-ui?label=npm%20%40responsible-ai%2Fcore-ui) ![npm dataset-explorer](https://img.shields.io/npm/v/@responsible-ai/dataset-explorer?label=npm%20%40responsible-ai%2Fdataset-explorer) ![npm causality](https://img.shields.io/npm/v/@responsible-ai/causality?label=npm%20%40responsible-ai%2Fcausality) ![npm counterfactuals](https://img.shields.io/npm/v/@responsible-ai/counterfactuals?label=npm%20%40responsible-ai%2Fcounterfactuals)

# Responsible-AI-Widgets

Responsible AI is an approach to assessing, developing, and deploying AI systems in a safe, trustworthy, and ethical manner, and take responsible decisions and actions.

Responsible-AI-Widgets provides a collection of model and data exploration and assessment user interfaces that enable a better understanding of AI systems. These interfaces empower developers and stakeholders of AI systems to develop and monitor AI more responsibly, and take better data-driven actions.

## Introducing Responsible AI Toolbox

The [Responsible AI Toolbox](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaitoolbox-dashboard/tour.ipynb) is an open-source framework for helping data scientists and machine learning developers build machine learning powered products that are responsible and reliable. The toolkit supports the following activities:

- Model Assessment, which involves determining how and why AI systems behave the way they do, understanding and diagnosing their issues, and using that knowledge to take targeted steps to improve their performance. Such steps can be encapsulated in the following workflow:

<p align="center">
<img src="https://raw.githubusercontent.com/microsoft/responsible-ai-widgets/main/img/model-assessment.png" alt="Model Assessment" width="600"/>

- Decision-making, which involves explorations such as estimating how a real-world outcome changes in the presence of an intervention, or “interrogating” a model to determine what feature perturbations of a particular datapoint would change the output of a machine learning model.

In order to achieve these capabilities, the toolbox integrates together ideas and technologies from several open-source toolkits in the areas of

- <b>Error Analysis</b> powered by [Error Analysis](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/erroranalysis-dashboard-README.md), which identifies cohorts of data with higher error rate than the overall benchmark. These discrepancies might occur when the system or model underperforms for specific demographic groups or infrequently observed input conditions in the training data.

- <b>Model Interpretability</b> powered by [InterpretML](https://github.com/interpretml/interpret-community), which explains blackbox models, helping users understand their model's global behavior, or the reasons behind individual predictions.

- <b>Counterfactual Example Analysis</b> powered by [InterpretML DiCE](https://github.com/interpretml/DiCE), which shows feature-perturbed versions of the same datapoint who would have received a different prediction outcome, e.g., Taylor's loan has been rejected by the model. But they would have received the loan if their income was higher by $10,000.

- <b>Causal Analysis</b> powered by [EconML](https://github.com/microsoft/EconML), which focuses on answering What If-style questions to apply data-driven decision-making – how would revenue be affected if a corporation pursues a new pricing strategy? Would a new medication improve a patient’s condition, all else equal?

<p align="center">
<img src="https://raw.githubusercontent.com/microsoft/responsible-ai-widgets/main/img/responsibleai-toolbox.png" alt="responsible-ai-toolbox" width="500"/>

Responsible AI Toolbox is designed to achieve the following goals:

- To help further accelerate engineering processes in machine learning by enabling practitioners to design customizable workflows and tailor Responsible AI dashboards that best fit with their model assessment and data-driven decision making scenarios.
- To help model developers create end to end and fluid debugging experiences and navigate seamlessly through error identification and diagnosis by using interactive visualizations that identify errors, inspect the data, generate global and local explanations models, and potentially inspect problematic examples.
- To help business stakeholders explore causal relationships in the data and take informed decisions in the real world.

This repository contains the Jupyter notebooks with examples to showcase how to use this widget. Get started [here](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/getting-started.ipynb).

### Useful Links

- [Take a tour of Responsible AI Toolbox](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaitoolbox-dashboard/tour.ipynb)
- [Get started](https://github.com/microsoft/responsible-ai-widgets/blob/main/notebooks/responsibleaitoolbox-dashboard/getting-started.ipynb)

- [Try the tool: model assessment of a census income prediction model (classification)](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaitoolbox-dashboard/responsibleaitoolbox-classification-model-assessment.ipynb)
- [Try the tool: model assessment of a diabetes progression prediction model (regression)](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaitoolbox-dashboard/responsibleaitoolbox-regression-model-assessment.ipynb)
- [Try the tool: make decisions based on diabetes progression data](https://github.com/microsoft/responsible-ai-widgets/blob/master/notebooks/responsibleaitoolbox-dashboard/responsibleaitoolbox-regression-decision-making.ipynb)

## Individual Dashboards

Besides the customizable and modular Responsible AI Toolbox, Responsible-AI-Widgets is hosts three individual dashboards that are specifically focused on error analysis, interpretability, and fairness assessment. Learn more: [Error Analysis dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/erroranalysis-dashboard-README.md), [Fairness dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/fairness-dashboard-README.md), and [Explanation dashboard](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/explanation-dashboard-README.md).

## Supported Models

This Responsible AI Toolbox API supports models that are trained on datasets in Python `numpy.array`, `pandas.DataFrame`, `iml.datatypes.DenseData`, or `scipy.sparse.csr_matrix` format.

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

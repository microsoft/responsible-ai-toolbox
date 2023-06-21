![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)

![Responsible AI Widgets Python Build](https://img.shields.io/github/actions/workflow/status/microsoft/responsible-ai-toolbox/CI-raiwidgets-pytest.yml?branch=main&label=Responsible%20AI%20Widgets%20Python%20Build)
![UI deployment to test environment](https://img.shields.io/github/actions/workflow/status/microsoft/responsible-ai-toolbox/CD.yml?branch=main&label=UI%20deployment%20to%20test%20environment)

![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?label=PyPI%20raiwidgets)
![PyPI responsibleai](https://img.shields.io/pypi/v/responsibleai?label=PyPI%20responsibleai)
![PyPI erroranalysis](https://img.shields.io/pypi/v/erroranalysis?label=PyPI%20erroranalysis)
![PyPI raiutils](https://img.shields.io/pypi/v/raiutils?label=PyPI%20raiutils)
![PyPI rai_test_utils](https://img.shields.io/pypi/v/rai_test_utils?label=PyPI%20rai_test_utils)

![npm model-assessment](https://img.shields.io/npm/v/@responsible-ai/model-assessment?label=npm%20%40responsible-ai%2Fmodel-assessment)

# Responsible AI Toolbox
Responsible AI is an approach to assessing, developing, and deploying AI systems in a safe, trustworthy, and ethical manner, and take responsible decisions and actions.

Responsible AI Toolbox is a suite of tools providing a collection of model and data exploration and assessment user interfaces and libraries that enable a better understanding of AI systems. These interfaces and libraries empower developers and stakeholders of AI systems to develop and monitor AI more responsibly, and take better data-driven actions.


<p align="center">
<img src="https://raw.githubusercontent.com/microsoft/responsible-ai-widgets/main/img/responsible-ai-toolbox.png" alt="ResponsibleAIToolboxOverview" width="750"/>


The Toolbox consists of three repositories: 

 
| Repository| Tools Covered  |
|--|--|
| [Responsible-AI-Toolbox Repository](https://github.com/microsoft/responsible-ai-toolbox) (Here) |This repository contains four visualization widgets for model assessment and decision making:<br>1. [Responsible AI dashboard](https://github.com/microsoft/responsible-ai-toolbox#introducing-responsible-ai-dashboard), a single pane of glass bringing together several mature Responsible AI tools from the toolbox for a holistic responsible assessment and debugging of models and making informed business decisions. With this dashboard, you can identify model errors, diagnose why those errors are happening, and mitigate them. Moreover, the causal decision-making capabilities provide actionable insights to your stakeholders and customers.<br>2. [Error Analysis dashboard](https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/erroranalysis-dashboard-README.md), for identifying model errors and discovering cohorts of data for which the model underperforms. 	<br>3. [Interpretability dashboard](https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/explanation-dashboard-README.md), for understanding model predictions. This dashboard is powered by InterpretML.<br>4. [Fairness dashboard](https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/fairness-dashboard-README.md), for understanding model’s fairness issues using various group-fairness metrics across sensitive features and cohorts. This dashboard is powered by Fairlearn. 
| [Responsible-AI-Toolbox-Mitigations Repository](https://github.com/microsoft/responsible-ai-toolbox-mitigations) | The Responsible AI Mitigations Library helps AI practitioners explore different measurements and mitigation steps that may be most appropriate when the model underperforms for a given data cohort. The library currently has two modules: <br>1. DataProcessing, which offers mitigation techniques for improving model performance for specific cohorts. <br>2. DataBalanceAnalysis, which provides metrics for diagnosing errors that originate from data imbalance either on class labels or feature values. <br> 3. Cohort: provides classes for handling and managing cohorts, which allows the creation of custom pipelines for each cohort in an easy and intuitive interface. The module also provides techniques for learning different decoupled estimators (models) for different cohorts and combining them in a way that optimizes different definitions of group fairness.|  
[Responsible-AI-Tracker Repository](https://github.com/microsoft/responsible-ai-toolbox-tracker) |Responsible AI Toolbox Tracker is a JupyterLab extension for managing, tracking, and comparing results of machine learning experiments for model improvement. Using this extension, users can view models, code, and visualization artifacts within the same framework enabling therefore fast model iteration and evaluation processes. Main functionalities include: <br>1. Managing and linking model improvement artifacts<br> 2. Disaggregated model evaluation and comparisons<br>3. Integration with the Responsible AI Mitigations library<br>4. Integration with mlflow|
 [Responsible-AI-Toolbox-GenBit Repository](https://github.com/microsoft/responsible-ai-toolbox-genbit) | The Responsible AI Gender Bias (GenBit) Library helps AI practitioners measure gender bias in Natural Language Processing (NLP) datasets. The main goal of GenBit is to analyze your text corpora and compute metrics that give insights into the gender bias present in a corpus.|

  


## Introducing Responsible AI dashboard

[Responsible AI dashboard](https://github.com/microsoft/responsible-ai-toolbox/blob/main/notebooks/responsibleaidashboard/tour.ipynb) is a single pane of glass, enabling you to easily flow through different stages of model debugging and decision-making. This customizable experience can be taken in a multitude of directions, from analyzing the model or data holistically, to conducting a deep dive or comparison on cohorts of interest, to explaining and perturbing model predictions for individual instances, and to informing users on business decisions and actions.


<p align="center">
<img src="https://raw.githubusercontent.com/microsoft/responsible-ai-widgets/main/img/responsible-ai-dashboard.png" alt="ResponsibleAIDashboard" width="750"/>




In order to achieve these capabilities, the dashboard integrates together ideas and technologies from several open-source toolkits in the areas of



- <b>Error Analysis</b> powered by [Error Analysis](https://github.com/microsoft/responsible-ai-widgets/blob/main/docs/erroranalysis-dashboard-README.md), which identifies cohorts of data with higher error rate than the overall benchmark. These discrepancies might occur when the system or model underperforms for specific demographic groups or infrequently observed input conditions in the training data.
- <b>Fairness Assessment</b> powered by [Fairlearn](https://github.com/fairlearn/fairlearn), which identifies which groups of people may be disproportionately negatively impacted by an AI system and in what ways.

- <b>Model Interpretability</b> powered by [InterpretML](https://github.com/interpretml/interpret-community), which explains blackbox models, helping users understand their model's global behavior, or the reasons behind individual predictions.

- <b>Counterfactual Analysis</b> powered by [DiCE](https://github.com/interpretml/DiCE), which shows feature-perturbed versions of the same datapoint who would have received a different prediction outcome, e.g., Taylor's loan has been rejected by the model. But they would have received the loan if their income was higher by $10,000.

- <b>Causal Analysis</b> powered by [EconML](https://github.com/microsoft/EconML), which focuses on answering What If-style questions to apply data-driven decision-making – how would revenue be affected if a corporation pursues a new pricing strategy? Would a new medication improve a patient’s condition, all else equal?

- <b>Data Balance</b> powered by [Responsible AI](https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/databalance-README.md), which helps users gain an overall understanding of their data, identify features receiving the positive outcome more than others, and visualize feature distributions.

Responsible AI dashboard is designed to achieve the following goals:

- To help further accelerate engineering processes in machine learning by enabling practitioners to design customizable workflows and tailor Responsible AI dashboards that best fit with their model assessment and data-driven decision making scenarios.
- To help model developers create end to end and fluid debugging experiences and navigate seamlessly through error identification and diagnosis by using interactive visualizations that identify errors, inspect the data, generate global and local explanations models, and potentially inspect problematic examples.
- To help business stakeholders explore causal relationships in the data and take informed decisions in the real world.

This repository contains the Jupyter notebooks with examples to showcase how to use this widget. Get started [here](https://github.com/microsoft/responsible-ai-toolbox/blob/main/notebooks/responsibleaidashboard/getting-started.ipynb).


### Installation

Use the following pip command to install the Responsible AI Toolbox.

If running in jupyter, please make sure to restart the jupyter kernel after installing.

```
pip install raiwidgets
```


### Responsible AI dashboard Customization

The Responsible AI Toolbox’s strength lies in its customizability. It empowers users to design tailored, end-to-end model debugging and decision-making workflows that address their particular needs. Need some inspiration? Here are some examples of how Toolbox components can be put together to analyze scenarios in different ways:

Please note that model overview (including fairness analysis) and data explorer components are activated by default!
 
| Responsible AI Dashboard Flow| Use Case  |
|--|--|
| Model Overview -> Error Analysis -> Data Explorer | To identify model errors and diagnose them by understanding the underlying data distribution
| Model Overview -> Fairness Assessment -> Data Explorer | To identify model fairness issues and diagnose them by understanding the underlying data distribution
| Model Overview -> Error Analysis -> Counterfactuals Analysis and What-If | To diagnose errors in individual instances with counterfactual analysis (minimum change to lead to a different model prediction)
| Model Overview -> Data Explorer -> Data Balance | To understand the root cause of errors and fairness issues introduced via data imbalances or lack of representation of a particular data cohort
 | Model Overview -> Interpretability | To diagnose model errors through understanding how the model has made its predictions
 | Data Explorer -> Causal Inference | To distinguish between correlations and causations in the data or decide the best treatments to apply to see a positive outcome
  | Interpretability -> Causal Inference | To learn whether the factors that model has used for decision making has any causal effect on the real-world outcome.
 | Data Explorer -> Counterfactuals Analysis and What-If | To address customer questions about what they can do next time to get a different outcome from an AI.
  | Data Explorer -> Data Balance | To gain an overall understanding of the data, identify features receiving the positive outcome more than others, and visualize feature distributions


### Useful Links

- [Take a tour of Responsible AI Dashboard](https://github.com/microsoft/responsible-ai-toolbox/blob/main/notebooks/responsibleaidashboard/tour.ipynb)
- [Get started](https://github.com/microsoft/responsible-ai-toolbox/blob/main/notebooks/responsibleaidashboard/getting-started.ipynb)

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

- [Cognitive Services Speech to Text Fairness testing](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/cognitive-services-examples/speech-to-text)
- [Cognitive Services Face Verification Fairness testing](https://github.com/microsoft/responsible-ai-toolbox/tree/main/notebooks/cognitive-services-examples/face-verification)

## Maintainers

- [Ke Xu](https://github.com/KeXu444)
- [Roman Lutz](https://github.com/romanlutz)
- [Ilya Matiach](https://github.com/imatiach-msft)
- [Gaurav Gupta](https://github.com/gaugup)
- [Vinutha Karanth](https://github.com/vinuthakaranth)
- [Tong Yu](https://github.com/tongyu-microsoft)
- [Ruby Zhu](https://github.com/RubyZ10)
- [Mehrnoosh Sameki](https://github.com/mesameki)
- [Hannah Westra](https://github.com/hawestra)
- [Ziqi Ma](https://github.com/ziqi-ma)
- [Kin Chan](https://github.com/kicha0)

# Responsible AI Model Analysis SDK for Python

### This package has been tested with Python 3.7, 3.8, 3.9 and 3.10

The Responsible AI Model Analysis SDK enables users to analyze their machine learning models in one API. Users will be able to analyze errors, explain the most important features, compute counterfactuals and run causal analysis using a single API.

Highlights of the package include:

- `explainer.add()` explains the model
- `counterfactuals.add()` computes counterfactuals
- `error_analysis.add()` runs error analysis
- `causal.add()` runs causal analysis

### Supported scenarios, models and datasets

`responsibleai` supports computation of Responsible AI insights for `scikit-learn` models that are trained on `pandas.DataFrame`. The `responsibleai` accept both models and pipelines as input as long as the model or pipeline implements a `predict` or `predict_proba` function that conforms to the `scikit-learn` convention. If not compatible, you can wrap your model's prediction function into a wrapper class that transforms the output into the format that is supported (`predict` or `predict_proba` of `scikit-learn`), and pass that wrapper class to modules in `responsibleai`.

Currently, we support datasets having numerical and categorical features. The following table provides the scenarios supported for each of the four responsible AI insights:-

| RAI insight | Binary classification | Multi-class classification | Multilabel classification | Regression | Timeseries forecasting | Categorical features | Text features | Image Features | Recommender Systems | Reinforcement Learning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | -- |
| Explainability | Yes | Yes | No | Yes | No | Yes | No | No | No | No |
| Error Analysis | Yes | Yes | No | Yes | No | Yes | No | No | No | No |
| Causal Analysis | Yes | No | No | Yes | No | Yes (max 5 features due to expensiveness) | No | No | No | No |
| Counterfactual | Yes | Yes | No | Yes | No | Yes | No | No | No | No |


The source code can be found here:
https://github.com/microsoft/responsible-ai-toolbox/tree/main/responsibleai

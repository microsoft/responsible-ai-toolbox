# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
import shap
import sklearn

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

from raiwidgets import ModelAnalysisDashboard
from responsibleai import ModelAnalysis

# %% [markdown]
# ### Use adult census dataset

# %%
X, y = shap.datasets.adult()
target_feature = 'income'
categorical_features = ['Workclass', 'Education-Num', 'Marital Status',
                        'Occupation', 'Relationship', 'Race', 'Sex', 'Country']

y = [1 if x else 0 for x in y]

n_samples = 10000
X, y = sklearn.utils.resample(
    X, y, n_samples=n_samples, random_state=7, stratify=y)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=7, stratify=y)

full_data = X.copy()
test_data = X_test.copy()
full_data[target_feature] = y
test_data[target_feature] = y_test

# %% [markdown]
# ### Train a model

# %%
model = LogisticRegression(solver='liblinear')
model.fit(X_train, y_train)

# %% [markdown]
# ### Compute Responsible AI model and dataset insights

# %%
model_analysis = ModelAnalysis(model, full_data, test_data, target_feature,
                               'classification',
                               categorical_features=categorical_features)

# Queue Responsible AI insights
model_analysis.explainer.add()
model_analysis.counterfactual.add(10, desired_class='opposite')
model_analysis.error_analysis.add()
model_analysis.causal.add(
    treatment_features=['Hours per week', 'Capital Gain'])

# Compute insights
model_analysis.compute()

# %% [markdown]
# ### Visualize insights in the model analysis dashboard

# %%
ModelAnalysisDashboard(model_analysis)

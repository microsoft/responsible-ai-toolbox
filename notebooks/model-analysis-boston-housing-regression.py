# To add a new cell, type '# %%'
# To add a new markdown cell, type '# %% [markdown]'
# %%
import sklearn
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

from raiwidgets import ModelAnalysisDashboard
from responsibleai import ModelAnalysis

# %% [markdown]
# ### Use boston housing dataset

# %%
data = sklearn.datasets.load_boston()
target_feature = 'y'
continuous_features = data.feature_names
data_df = pd.DataFrame(data.data, columns=data.feature_names)

X_train, X_test, y_train, y_test = train_test_split(
    data_df, data.target, test_size=0.2, random_state=7)

train_data = X_train.copy()
test_data = X_test.copy()
train_data[target_feature] = y_train
test_data[target_feature] = y_test
data.feature_names

# %% [markdown]
# ### Train a model

# %%
model = RandomForestRegressor()
model.fit(X_train, y_train)

# %% [markdown]
# ### Compute Responsible AI model and dataset insights

# %%
model_analysis = ModelAnalysis(model, train_data, test_data, target_feature,
                               'regression', categorical_features=[])

# Queue Responsible AI insights
model_analysis.explainer.add()
model_analysis.counterfactual.add(10, desired_range=[10, 20])
model_analysis.error_analysis.add()
model_analysis.causal.add(treatment_features=['ZN', 'NOX'])

# Compute insights
model_analysis.compute()

# %% [markdown]
# ### Visualize insights in the model analysis dashboard

# %%
ModelAnalysisDashboard(model_analysis)

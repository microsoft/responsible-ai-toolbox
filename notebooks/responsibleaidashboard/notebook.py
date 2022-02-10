# %% [markdown]
# # Assess income level predictions on adult census data

# %% [markdown]
# This notebook demonstrates the use of the `responsibleai` API to assess a model trained on census data. It walks through the API calls necessary to create a widget with model analysis insights, then guides a visual analysis of the model.

# %% [markdown]
# * [Launch Responsible AI Toolbox](#Launch-Responsible-AI-Toolbox)
#     * [Train a Model](#Train-a-Model)
#     * [Create Model and Data Insights](#Create-Model-and-Data-Insights)
# * [Assess Your Model](#Assess-Your-Model)
#     * [Aggregate Analysis](#Aggregate-Analysis)
#     * [Individual Analysis](#Individual-Analysis)

# %% [markdown]
# ## Launch Responsible AI Toolbox

# %% [markdown]
# The following section examines the code necessary to create datasets and a model. It then generates insights using the `responsibleai` API that can be visually analyzed.

# %% [markdown]
# ### Train a Model
# *The following section can be skipped. It loads a dataset and trains a model for illustrative purposes.*

# %%
import sklearn
import zipfile

from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split

import pandas as pd
from lightgbm import LGBMClassifier

# %% [markdown]
# First, load the census dataset and specify the different types of features. Then, clean the target feature values to include only 0 and 1.

# %%
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

def split_label(dataset, target_feature):
    X = dataset.drop([target_feature], axis=1)
    y = dataset[[target_feature]]
    return X, y

def clean_data(X, y, target_feature):
    features = X.columns.values.tolist()
    classes = y[target_feature].unique().tolist()
    pipe_cfg = {
        'num_cols': X.dtypes[X.dtypes == 'int64'].index.values.tolist(),
        'cat_cols': X.dtypes[X.dtypes == 'object'].index.values.tolist(),
    }
    num_pipe = Pipeline([
        ('num_imputer', SimpleImputer(strategy='median')),
        ('num_scaler', StandardScaler())
    ])
    cat_pipe = Pipeline([
        ('cat_imputer', SimpleImputer(strategy='constant', fill_value='?')),
        ('cat_encoder', OneHotEncoder(handle_unknown='ignore', sparse=False))
    ])
    feat_pipe = ColumnTransformer([
        ('num_pipe', num_pipe, pipe_cfg['num_cols']),
        ('cat_pipe', cat_pipe, pipe_cfg['cat_cols'])
    ])
    X = feat_pipe.fit_transform(X)
    print(pipe_cfg['cat_cols'])
    return X, feat_pipe, features, classes

outdirname = 'responsibleai.12.28.21'
try:
    from urllib import urlretrieve
except ImportError:
    from urllib.request import urlretrieve
zipfilename = outdirname + '.zip'
urlretrieve('https://publictestdatasets.blob.core.windows.net/data/' + zipfilename, zipfilename)
with zipfile.ZipFile(zipfilename, 'r') as unzip:
    unzip.extractall('.')

target_feature = 'income'
categorical_features = ['workclass', 'education', 'marital-status',
                        'occupation', 'relationship', 'race', 'gender', 'native-country']
sensitive_features = ['race', 'gender', 'native-country']

train_data = pd.read_csv('adult-train.csv')
test_data = pd.read_csv('adult-test.csv')


X_train_original, y_train = split_label(train_data, target_feature)
X_test_original, y_test = split_label(test_data, target_feature)


X_train, feat_pipe, features, classes = clean_data(X_train_original.drop(columns=sensitive_features), y_train, target_feature)
y_train = y_train[target_feature].to_numpy()

X_test = feat_pipe.transform(X_test_original.drop(columns=sensitive_features))
y_test = y_test[target_feature].to_numpy()

train_data[target_feature] = y_train
test_data[target_feature] = y_test

test_data_sample = test_data.sample(n=100, random_state=5)
train_data_sample = train_data.sample(n=8000, random_state=5)

# %% [markdown]
# Train a LightGBM classifier on the training data.

# %%
clf = LGBMClassifier(n_estimators=5)
model = clf.fit(X_train, y_train)

# %% [markdown]
# ### Create Model and Data Insights

# %%
from raiwidgets import ResponsibleAIDashboard
from responsibleai import RAIInsights

# %% [markdown]
# To use Responsible AI Toolbox, initialize a RAIInsights object upon which different components can be loaded.
# 
# RAIInsights accepts the model, the full dataset, the test dataset, the target feature string, the task type string, and a list of strings of categorical feature names as its arguments.

# %%
dashboard_pipeline = Pipeline(steps=[('preprocess', feat_pipe), ('model', model)])

rai_insights = RAIInsights(dashboard_pipeline, train_data_sample, test_data_sample, target_feature, 'classification',
                               categorical_features=categorical_features, metadata_columns=sensitive_features)

# %% [markdown]
# Add the components of the toolbox that are focused on model assessment.

# %%
# Interpretability
rai_insights.explainer.add()
# Error Analysis
rai_insights.error_analysis.add()
# Counterfactuals: accepts total number of counterfactuals to generate, the label that they should have, and a list of 
                # strings of categorical feature names
rai_insights.counterfactual.add(total_CFs=10, desired_class='opposite')

# %% [markdown]
# Once all the desired components have been loaded, compute insights on the test set.

# %%
rai_insights.compute()

# %% [markdown]
# Finally, visualize and explore the model insights. Use the resulting widget or follow the link to view this in a new tab.

# %%
ResponsibleAIDashboard(rai_insights)

# %% [markdown]
# ## Assess Your Model

# %% [markdown]
# ### Aggregate Analysis

# %% [markdown]
# The Error Analysis component is displayed at the top of the dashboard widget. To visualize how error is broken down across cohorts, use the tree map view to understand how it filters through the nodes.

# %% [markdown]
# ![Error Analysis tree map with "Marital Status == 2," "Capital Gain <= 1287.5," "Capital Loss <= 1494.5" path selected](./img/classification-assessment-1.png)

# %% [markdown]
# Over 40% of the error in this model is concentrated in datapoints of people who are married, have higher education and minimal capital gain. 
# 
# Let's see what else we can discover about this cohort.
# 
# First, save the cohort by clicking "Save as a new cohort" on the right side panel of the Error Analysis component.

# %% [markdown]
# ![Cohort creation sidebar and tree map cohort creation popup](./img/classification-assessment-2.png)

# %% [markdown]
# To switch to this cohort for analysis, click "Switch global cohort" and select the recently saved cohort from the dropdown.

# %% [markdown]
# ![Popup with dropdown to shift cohort from "All data" to "Married, Low Capital Loss/Gain" accompanied by cohort statistics](./img/classification-assessment-3.png)

# %% [markdown]
# The Model Overview component allows the comparison of statistics across multiple saved cohorts.
# 
# The diagram indicates that the model is misclassifying datapoints of married individuals with low capital gains and high education as lower income (false negative).

# %% [markdown]
# ![Bar chart of classification outcomes (true negative, true positive, false negative, false positive) compared across cohorts](./img/classification-assessment-4.png)

# %% [markdown]
# Looking at the ground truth statistics of the overall data and the erroneous cohort, we realize there are opposite patterns in terms of high income representation in ground truth. While the overall data is representing more individuals with actual income of <= 50K, the married individuals with low capital gains and high education represent more individuals with actual income of > 50K. Given the small size of the dataset and this reverse pattern, the model makes more mistakes in predicting high income individuals. One action item is to collect a lot more data in both cohorts and retrain the model.

# %% [markdown]
# ![image-3.png](./img/classification-assessment-5.png)

# %% [markdown]
# ![image.png](./img/classification-assessment-6.png)

# %% [markdown]
# The Interpretability component displays feature importances for model predictions at an individual and aggregate level. The plot below indicates that the `marital-status` attribute influence model predictions the most on average.

# %% [markdown]
# ![Top 5 features of the cohort, in descending importance: relationship, age, capital gain, education-num, hours per week](./img/classification-assessment-7.png)

# %% [markdown]
# The lower half of this tab specifies how marita status affects model prediction. Being a husband or wife (married-civ-spouse) is more likely to pull the prediction away from <=50k, possibly because couples have a higher cumulative income.

# %% [markdown]
# ![Feature importance stratified by relationship](./img/classification-assessment-8.png)

# %% [markdown]
# ### Individual Analysis

# %% [markdown]
# Let's revisit Data Explorer. In the "Individual datapoints" view, we can see the prediction probabilities of each point. Point 510 is one that was just above the threshold to be classified as income of > 50K.

# %% [markdown]
# ![Scatter plot of prediction probabilities (rounded to 0.2) on the y-axis and index on the x-axis](./img/classification-assessment-9.png)

# %% [markdown]
# What factors led the model to make this decision?
# 
# The "Individual feature importance" tab in the Interpretability component's Feature Importances section let you select points for further analysis.

# %% [markdown]
# ![Table of datapoints with row 510 selected](./img/classification-assessment-10.png)

# %% [markdown]
# Under this, the feature importance plot shows `capital-gain` and `native-country` as the most significant factors leading to the <= 50K classification. Changing these may cause the threshold to be crossed and the model to predict the opposite class. Please note that depending on the context, the high importance of `native-country` might be considered as a fairness issue.

# %% [markdown]
# ![Feature importance plot for classification of 0 (descending, positive to negative): age, hours per week, capital gain, race, education-num, workclass, sex, country, occupation, marital status, relationship, capital loss](./img/classification-assessment-11.png)

# %% [markdown]
# The What-If Counterfactuals component focuses on how to change features slightly in order to change model predictions. As seen in its top ranked features bar plot, changing this person's marital-status, capital-loss, and education-num have the highest impact on flipping the prediction to > 50K.

# %% [markdown]
# ![Top-ranked features (descending) for datapoint 510 to perturb to flip model prediction: age, hours per week, capital gain, capital loss, marital status, occupation, education-num, workclass, relationship, race, sex, country](./img/classification-assessment-12.png)



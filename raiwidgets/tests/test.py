# Copyright (c) Microsoft Corporation and Fairlearn contributors.
# Licensed under the MIT License.

"""
===========================
GridSearch with Census Data
===========================
"""
# %%
# This notebook shows how to use Fairlearn and the Fairness dashboard to generate predictors
# for the Census dataset.
# This dataset is a classification problem - given a range of data about 32,000 individuals,
# predict whether their annual income is above or below fifty thousand dollars per year.
#
# For the purposes of this notebook, we shall treat this as a loan decision problem.
# We will pretend that the label indicates whether or not each individual repaid a loan in
# the past.
# We will use the data to train a predictor to predict whether previously unseen individuals
# will repay a loan or not.
# The assumption is that the model predictions are used to decide whether an individual
# should be offered a loan.
#
# We will first train a fairness-unaware predictor and show that it leads to unfair
# decisions under a specific notion of fairness called *demographic parity*.
# We then mitigate unfairness by applying the :code:`GridSearch` algorithm from the
# Fairlearn package.

# %%
# Load and preprocess the data set
# --------------------------------
# We download the data set using `fetch_adult` function in `fairlearn.datasets`.
# We start by importing the various modules we're going to use:

from sklearn.model_selection import train_test_split

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
import pandas as pd

# %%
# We can now load and inspect the data by using the `fairlearn.datasets` module:

from sklearn.datasets import fetch_openml
data = fetch_openml(data_id=1590, as_frame=True)
X_raw = data.data
Y = (data.target == '>50K') * 1
X_raw

# %%
# We are going to treat the sex of each individual as a sensitive
# feature (where 0 indicates female and 1 indicates male), and in
# this particular case we are going separate this feature out and drop it
# from the main data.
# We then perform some standard data preprocessing steps to convert the
# data into a format suitable for the ML algorithms

A = X_raw["sex"]
X = X_raw.drop(labels=['sex'], axis=1)
X = pd.get_dummies(X)

sc = StandardScaler()
X_scaled = sc.fit_transform(X)
X_scaled = pd.DataFrame(X_scaled, columns=X.columns)

le = LabelEncoder()
Y = le.fit_transform(Y)

# %%
# Finally, we split the data into training and test sets:

X_train, X_test, Y_train, Y_test, A_train, A_test = train_test_split(X_scaled,
                                                                     Y,
                                                                     A,
                                                                     test_size=0.2,
                                                                     random_state=0,
                                                                     stratify=Y)

# Work around indexing bug
X_train = X_train.reset_index(drop=True)
A_train = A_train.reset_index(drop=True)
X_test = X_test.reset_index(drop=True)
A_test = A_test.reset_index(drop=True)

# %%
# Training a fairness-unaware predictor
# -------------------------------------
#
# To show the effect of Fairlearn we will first train a standard ML predictor
# that does not incorporate fairness.
# For speed of demonstration, we use the simple
# :class:`sklearn.linear_model.LogisticRegression` class:

unmitigated_predictor = LogisticRegression(solver='liblinear', fit_intercept=True)

unmitigated_predictor.fit(X_train, Y_train)

# %%
# We can load this predictor into the Fairness dashboard, and assess its fairness:
from raiwidgets import FairnessDashboard
FairnessDashboard(sensitive_features=A_test, sensitive_feature_names=['sex'],
                   y_true=Y_test,
                   y_pred={"unmitigated": unmitigated_predictor.predict(X_test)})


input("Press Enter to continue...")
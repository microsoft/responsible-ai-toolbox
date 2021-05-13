from responsibleai import ModelAnalysis
import sklearn
import shap
import pandas as pd

x, y = shap.datasets.adult()
# x.columns = ['Age', 'Workclass', 'EducationNum', 'Marital Status', 'Occupation',
#              'Relationship', 'Race', 'Sex', 'Capital Gain', 'Capital Loss', 'Hours per week', 'Country']

x_display, y_display = shap.datasets.adult(display=True)
x_train, x_test, y_train, y_test = sklearn.model_selection.train_test_split(
    x, y, test_size=0.2, random_state=7)


knn = sklearn.neighbors.KNeighborsClassifier()
knn.fit(x_train, y_train)


train = pd.merge(x, pd.DataFrame(
    y, columns=["income"]), left_index=True, right_index=True)
test = pd.merge(x_test, pd.DataFrame(y_test, columns=[
                "income"]), left_index=True, right_index=True)

print(train)
print(test)


ma = ModelAnalysis(knn, train, test, "income", "classification")
ma.explainer.add()
ma.counterfactual.add(["Age", "Capital Gain", "Capital Loss",
                       "Hours per week", "Country"], 10, desired_class="opposite")
ma.error_analysis.add()
# ma.causal.add()
ma.compute()


from raiwidgets import ModelAnalysisDashboard

ModelAnalysisDashboard(ma)

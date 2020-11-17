# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from .explanation_constants import \
    ExplanationDashboardInterface, WidgetRequestResponseConstants
from scipy.sparse import issparse
import numpy as np
import pandas as pd
from sklearn import tree
from sklearn.tree import _tree
from enum import Enum
import traceback
from .constants import SKLearn
from .error_handling import _format_exception

BIN_THRESHOLD = 8
CATEGORY1 = "category1"
CATEGORY2 = "category2"
FALSE_COUNT = "falseCount"
COUNT = "count"
INTERVAL_MIN = "intervalMin"
INTERVAL_MAX = "intervalMax"
METHOD = "method"
METHOD_GREATER = "greater"
METHOD_LESS_AND_EQUAL = "less and equal"
METHOD_RANGE = "in the range of"
TRUE_Y = "true_y"


class TreeSide(str, Enum):
    """Provide model task constants.
    Can be 'classification', 'regression', or 'unknown'.

    By default the model domain is inferred if 'unknown',
    but this can be overridden if you specify
    'classification' or 'regression'.
    """

    RightChild = 'RightChild'
    LeftChild = 'LeftChild'
    Unknown = 'Unknown'


class ErrorAnalysisDashboardInput:
    def __init__(
            self,
            explanation,
            model,
            dataset,
            true_y,
            classes,
            features,
            locale):
        """Initialize the Error Analysis Dashboard Input.

        :param explanation: An object that represents an explanation.
        :type explanation: ExplanationMixin
        :param model: An object that represents a model.
        It is assumed that for the classification case
            it has a method of predict_proba() returning
            the prediction probabilities for each
            class and for the regression case a method of predict()
            returning the prediction value.
        :type model: object
        :param dataset: A matrix of feature vector examples
        (# examples x # features), the same samples
            used to build the explanation.
            Will overwrite any set on explanation object already.
            Must have fewer than
            10000 rows and fewer than 1000 columns.
        :type dataset: numpy.array or list[][]
        :param true_y: The true labels for the provided dataset.
            Will overwrite any set on
            explanation object already.
        :type true_y: numpy.array or list[]
        :param classes: The class names.
        :type classes: numpy.array or list[]
        :param features: Feature names.
        :type features: numpy.array or list[]
        """
        self._model = model
        self._dataset = dataset
        self._true_y = true_y
        self._is_classifier = model is not None\
            and hasattr(model, SKLearn.PREDICT_PROBA) and \
            model.predict_proba is not None
        self._dataframeColumns = None
        self.dashboard_input = {}
        # List of explanations, key of explanation type is "explanation_type"
        self._mli_explanations = explanation.data(-1)["mli"]
        local_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_LOCAL_EXPLANATION_KEY)
        global_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_GLOBAL_EXPLANATION_KEY)
        ebm_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EBM_GLOBAL_EXPLANATION_KEY)
        dataset_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EXPLANATION_DATASET_KEY)

        if hasattr(explanation, 'method'):
            self.dashboard_input[
                ExplanationDashboardInterface.EXPLANATION_METHOD
            ] = explanation.method

        predicted_y = None
        feature_length = None
        if dataset_explanation is not None:
            if dataset is None:
                dataset = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_X_KEY
                ]
            if true_y is None:
                true_y = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_Y_KEY
                ]

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
        try:
            list_dataset = self._convert_to_list(dataset)
        except Exception as ex:
            ex_str = _format_exception(ex)
            raise ValueError(
                "Unsupported dataset type, inner error: {}".format(ex_str))
        if dataset is not None and model is not None:
            try:
                predicted_y = model.predict(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                msg = "Model does not support predict method for given"
                "dataset type, inner error: {}".format(
                    ex_str)
                raise ValueError(msg)
            try:
                predicted_y = self._convert_to_list(predicted_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Model prediction output of unsupported type,"
                    "inner error: {}".format(ex_str))
        if predicted_y is not None:
            self.dashboard_input[
                ExplanationDashboardInterface.PREDICTED_Y
            ] = predicted_y
        row_length = 0
        if list_dataset is not None:
            row_length, feature_length = np.shape(list_dataset)
            if row_length > 100000:
                raise ValueError(
                    "Exceeds maximum number of rows"
                    "for visualization (100000)")
            if feature_length > 1000:
                raise ValueError("Exceeds maximum number of features for"
                                 " visualization (1000). Please regenerate the"
                                 " explanation using fewer features or"
                                 " initialize the dashboard without passing a"
                                 " dataset.")
            self.dashboard_input[
                ExplanationDashboardInterface.TRAINING_DATA
            ] = list_dataset
            self.dashboard_input[
                ExplanationDashboardInterface.IS_CLASSIFIER
            ] = self._is_classifier

        local_dim = None

        if true_y is not None and len(true_y) == row_length:
            self.dashboard_input[
                ExplanationDashboardInterface.TRUE_Y
            ] = self._convert_to_list(
                true_y)

        if local_explanation is not None:
            try:
                local_explanation["scores"] = self._convert_to_list(
                    local_explanation["scores"])
                if np.shape(local_explanation["scores"])[-1] > 1000:
                    raise ValueError("Exceeds maximum number of features for "
                                     "visualization (1000). Please regenerate"
                                     " the explanation using fewer features.")
                local_explanation["intercept"] = self._convert_to_list(
                    local_explanation["intercept"])
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted to python,
                # otherwise serialization fails.
                local_explanation["perf"] = None
                self.dashboard_input[
                    ExplanationDashboardInterface.LOCAL_EXPLANATIONS
                ] = local_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported local explanation type,"
                    "inner error: {}".format(ex_str))
            if list_dataset is not None:
                local_dim = np.shape(local_explanation["scores"])
                if len(local_dim) != 2 and len(local_dim) != 3:
                    raise ValueError(
                        "Local explanation expected to be a 2D or 3D list")
                if len(local_dim) == 2 and (local_dim[1] != feature_length or
                                            local_dim[0] != row_length):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        "length differs from dataset")
                if len(local_dim) == 3 and (local_dim[2] != feature_length or
                                            local_dim[1] != row_length):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        " length differs from dataset")
        if local_explanation is None and global_explanation is not None:
            try:
                global_explanation["scores"] = self._convert_to_list(
                    global_explanation["scores"])
                if 'intercept' in global_explanation:
                    global_explanation["intercept"] = self._convert_to_list(
                        global_explanation["intercept"])
                self.dashboard_input[
                    ExplanationDashboardInterface.GLOBAL_EXPLANATION
                ] = global_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Unsupported global explanation type,"
                                 "inner error: {}".format(ex_str))
        if ebm_explanation is not None:
            try:
                self.dashboard_input[
                    ExplanationDashboardInterface.EBM_EXPLANATION
                ] = ebm_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported ebm explanation type: {}".format(ex_str))

        if features is None and hasattr(explanation, 'features')\
                and explanation.features is not None:
            features = explanation.features
        if features is not None:
            features = self._convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            self.dashboard_input[
                ExplanationDashboardInterface.FEATURE_NAMES
            ] = features
        if classes is None and hasattr(explanation, 'classes')\
                and explanation.classes is not None:
            classes = explanation.classes
        if classes is not None:
            classes = self._convert_to_list(classes)
            if local_dim is not None and len(classes) != local_dim[0]:
                raise ValueError("Class vector length mismatch:"
                                 "class names length differs from"
                                 "local explanations dimension")
            self.dashboard_input[
                ExplanationDashboardInterface.CLASS_NAMES
            ] = classes
        if model is not None and hasattr(model, SKLearn.PREDICT_PROBA) \
                and model.predict_proba is not None and dataset is not None:
            try:
                probability_y = model.predict_proba(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Model does not support predict_proba method"
                                 " for given dataset type,"
                                 " inner error: {}".format(ex_str))
            try:
                probability_y = self._convert_to_list(probability_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Model predict_proba output of unsupported type,"
                    "inner error: {}".format(ex_str))
            self.dashboard_input[
                ExplanationDashboardInterface.PROBABILITY_Y
            ] = probability_y
        if locale is not None:
            self.dashboard_input[ExplanationDashboardInterface.LOCALE] = locale

    def build_query(self, filters):
        queries = []
        for filter in filters:
            if METHOD in filter:
                method = filter[METHOD]
                arg0 = str(filter['arg'][0])
                colname = filter['column']
                if method == METHOD_GREATER:
                    queries.append("`" + colname + "` > " + arg0)
                elif method == METHOD_LESS_AND_EQUAL:
                    queries.append("`" + colname + "` <= " + arg0)
                elif method == METHOD_RANGE:
                    arg1 = str(filter['arg'][1])
                    queries.append("`" + colname + "` >= " + arg0 +
                                   ' & `' + colname + "` <= " + arg1)
            else:
                cqueries = []
                for composite_filter in filter['compositeFilters']:
                    cqueries.append(self.build_query([composite_filter]))
                if filter['operation'] == 'and':
                    queries.append(' & '.join(cqueries))
                else:
                    queries.append(' | '.join(cqueries))
        return ' & '.join(queries)

    def apply_recursive_filter(self, df, filters):
        if filters:
            return df.query(self.build_query(filters))
        else:
            return df

    def filter_from_cohort(self, filters, composite_filters, feature_names):
        df = pd.DataFrame(self._dataset, columns=feature_names)
        df[TRUE_Y] = self._true_y
        df = self.apply_recursive_filter(df, filters)
        df = self.apply_recursive_filter(df, composite_filters)
        true_y = df[TRUE_Y]
        df = df.drop(columns=TRUE_Y)
        return df.to_numpy(), true_y.to_numpy()

    def debug_ml(self, features, filters, composite_filters):
        try:
            interface = ExplanationDashboardInterface
            # Fit a surrogate model on errors
            surrogate = tree.DecisionTreeClassifier(max_depth=3)
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            filtered_df, true_y = self.filter_from_cohort(filters,
                                                          composite_filters,
                                                          feature_names)
            diff = self._model.predict(filtered_df) != true_y
            indexes = []
            for feature in features:
                indexes.append(feature_names.index(feature))
            dataset_sub_features = filtered_df[:, indexes]
            dataset_sub_names = np.array(feature_names)[np.array(indexes)]
            surrogate.fit(dataset_sub_features, diff)
            json_tree = self.traverse(surrogate.tree_, 0, [],
                                      dataset_sub_names)
            return {
                WidgetRequestResponseConstants.DATA: json_tree
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json tree representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def matrix(self, features, filters, composite_filters):
        try:
            if features[0] is None:
                return {WidgetRequestResponseConstants.DATA: []}
            interface = ExplanationDashboardInterface
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            filtered_df, true_y = self.filter_from_cohort(filters,
                                                          composite_filters,
                                                          feature_names)
            diff = self._model.predict(filtered_df) != self._true_y
            indexes = []
            for feature in features:
                if feature is None:
                    continue
                indexes.append(feature_names.index(feature))
            dataset_sub_features = filtered_df[:, indexes]
            dataset_sub_names = np.array(feature_names)[np.array(indexes)]
            df = pd.DataFrame(dataset_sub_features, columns=dataset_sub_names)
            df_err = df.copy()
            diff_col = 'diff'
            df_err[diff_col] = diff
            df_err = df_err[df_err[diff_col]]
            # construct json matrix
            json_matrix = []
            if len(dataset_sub_names) == 2:
                feat1 = dataset_sub_names[0]
                feat2 = dataset_sub_names[1]
                unique_count1 = len(df[feat1].unique())
                unique_count2 = len(df[feat2].unique())
                if unique_count1 > BIN_THRESHOLD:
                    tabdf1, bins = pd.cut(df[feat1], BIN_THRESHOLD,
                                          retbins=True)
                    tabdf1_err = pd.cut(df_err[feat1], bins)
                    categories1 = tabdf1.cat.categories
                else:
                    tabdf1 = df[feat1]
                    tabdf1_err = df_err[feat1]
                    categories1 = np.unique(tabdf1.to_numpy(),
                                            return_counts=True)[0]
                if unique_count2 > BIN_THRESHOLD:
                    tabdf2, bins = pd.cut(df[feat2], BIN_THRESHOLD,
                                          retbins=True)
                    tabdf2_err = pd.cut(df_err[feat2], bins)
                    categories2 = tabdf2.cat.categories
                else:
                    tabdf2 = df[feat2]
                    tabdf2_err = df_err[feat2]
                    categories2 = np.unique(tabdf2.to_numpy(),
                                            return_counts=True)[0]
                matrix_total = pd.crosstab(tabdf1, tabdf2, rownames=[feat1],
                                           colnames=[feat2])
                matrix_error = pd.crosstab(tabdf1_err, tabdf2_err,
                                           rownames=[feat1], colnames=[feat2])
                json_matrix = self.json_matrix_2d(categories1, categories2,
                                                  matrix_total, matrix_error)
            else:
                feat1 = dataset_sub_names[0]
                unique_count1 = len(df[feat1].unique())
                if unique_count1 > BIN_THRESHOLD:
                    cutdf, bins = pd.cut(df[feat1], BIN_THRESHOLD,
                                         retbins=True)
                    bin_range = range(BIN_THRESHOLD)
                    catr = cutdf.cat.rename_categories(bin_range)
                    counts = np.unique(catr.to_numpy(), return_counts=True)[1]
                    cutdf_err = pd.cut(df_err[feat1], bins)
                    catr_err = cutdf_err.cat.rename_categories(bin_range)
                    val_err, counts_err = np.unique(catr_err.to_numpy(),
                                                    return_counts=True)
                    val_err = cutdf_err.cat.categories[val_err]
                    json_matrix = self.json_matrix_1d(cutdf.cat.categories,
                                                      val_err, counts,
                                                      counts_err)
                else:
                    values, counts = np.unique(df[feat1].to_numpy(),
                                               return_counts=True)
                    val_err, counts_err = np.unique(df_err[feat1].to_numpy(),
                                                    return_counts=True)
                    json_matrix = self.json_matrix_1d(values, val_err, counts,
                                                      counts_err)
            return {
                WidgetRequestResponseConstants.DATA: json_matrix
            }
        except Exception as e:
            print(e)
            import traceback
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json matrix representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def json_matrix_2d(self, categories1, categories2, matrix_counts,
                       matrix_err_counts):
        json_matrix = []
        for row_index in range(len(categories1)):
            json_matrix_category = []
            cat1 = categories1[row_index]
            categoryData = {CATEGORY1: str(cat1)}
            if isinstance(categories1, pd.IntervalIndex):
                categoryData[INTERVAL_MIN] = cat1.left
                categoryData[INTERVAL_MAX] = cat1.right
            json_matrix_category.append(categoryData)
            for col_index in range(len(categories2)):
                cat2 = categories2[col_index]
                index_exists_err = cat1 in matrix_err_counts.index
                col_exists_err = cat2 in matrix_err_counts.columns
                false_count = 0
                if index_exists_err and col_exists_err:
                    false_count = int(matrix_err_counts.loc[cat1, cat2])
                index_exists = cat1 in matrix_counts.index
                col_exists = cat2 in matrix_counts.columns
                total_count = 0
                if index_exists and col_exists:
                    total_count = int(matrix_counts.loc[cat1, cat2])
                json_matrix_category.append({
                    FALSE_COUNT: false_count,
                    COUNT: total_count
                })
            json_matrix.append(json_matrix_category)

        json_matrix_category_end = []
        json_matrix_category_end.append({
            CATEGORY1: len(categories1)
        })
        for cat2 in categories2:
            categoryData = {CATEGORY2: str(cat2)}
            if isinstance(categories2, pd.IntervalIndex):
                categoryData[INTERVAL_MIN] = cat2.left
                categoryData[INTERVAL_MAX] = cat2.right
            json_matrix_category_end.append(categoryData)
        json_matrix.append(json_matrix_category_end)
        return json_matrix

    def json_matrix_1d(self, categories, values_err, counts, counts_err):
        json_matrix = []
        json_matrix_category0 = []
        json_matrix_category0.append({
            CATEGORY1: 0
        })
        for index, count in enumerate(counts):
            false_count = 0
            if categories[index] in values_err:
                index_err = list(values_err).index(categories[index])
                false_count = int(counts_err[index_err])
            json_matrix_category0.append({
                FALSE_COUNT: false_count,
                COUNT: int(counts[index])
            })
        json_matrix.append(json_matrix_category0)
        json_matrix_category1 = []
        json_matrix_category1.append({
            CATEGORY1: 1
        })
        for cat2 in categories:
            categoryData = {CATEGORY2: str(cat2)}
            if isinstance(categories, pd.IntervalIndex):
                categoryData[INTERVAL_MIN] = cat2.left
                categoryData[INTERVAL_MAX] = cat2.right
            json_matrix_category1.append(categoryData)
        json_matrix.append(json_matrix_category1)
        return json_matrix

    def traverse(self, tree, nodeid, json, feature_names, parent=None,
                 side=TreeSide.Unknown):
        children_left = tree.children_left[nodeid]
        children_right = tree.children_right[nodeid]

        # write current node to json
        json = self.node_to_json(tree, nodeid, json, feature_names, parent,
                                 side)

        # write children to json
        if children_left != _tree.TREE_LEAF:
            json = self.traverse(tree, children_left, json, feature_names,
                                 nodeid, TreeSide.LeftChild)
            json = self.traverse(tree, children_right, json, feature_names,
                                 nodeid, TreeSide.RightChild)
        return json

    def node_to_json(self, tree, nodeid, json, feature_names, parent=None,
                     side=TreeSide.Unknown):
        values = tree.value[nodeid][0]
        success = values[0]
        if len(values.shape) == 1 and values.shape[0] == 1:
            error = 0
        else:
            error = values[1]
        parent_node_name = None
        condition = None
        arg = None
        method = None
        if parent is not None:
            parent = int(parent)
            parent_node_name = feature_names[tree.feature[parent]]
            parent_threshold = float(tree.threshold[parent])
            if side == TreeSide.RightChild:
                method = METHOD_GREATER
                arg = parent_threshold
                condition = "{} > {:.2f}".format(parent_node_name,
                                                 parent_threshold)
            elif side == TreeSide.LeftChild:
                method = METHOD_LESS_AND_EQUAL
                arg = parent_threshold
                condition = "{} <= {:.2f}".format(parent_node_name,
                                                  parent_threshold)
        json.append({
            "arg": arg,
            "badFeaturesRowCount": 0,
            "condition": condition,
            "error": float(error),
            "id": int(nodeid),
            METHOD: method,
            "nodeIndex": int(nodeid),
            "nodeName": feature_names[tree.feature[int(nodeid)]],
            "parentId": parent,
            "parentNodeName": parent_node_name,
            "pathFromRoot": "",
            "size": float(success + error),
            "sourceRowKeyHash": "hashkey",
            "success": float(success)
        })
        return json

    def on_predict(self, data):
        try:
            if self._dataframeColumns is not None:
                data = pd.DataFrame(data, columns=self._dataframeColumns)
            if (self._is_classifier):
                model_pred_proba = self._model.predict_proba(data)
                prediction = self._convert_to_list(model_pred_proba)
            else:
                model_predict = self._model.predict(data)
                prediction = self._convert_to_list(model_predict)
            return {
                WidgetRequestResponseConstants.DATA: prediction
            }
        except Exception:
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Model threw exception while predicting...",
                WidgetRequestResponseConstants.DATA: []
            }

    def _convert_to_list(self, array):
        if issparse(array):
            if array.shape[1] > 1000:
                raise ValueError("Exceeds maximum number of "
                                 "features for visualization (1000)")
            return array.toarray().tolist()
        if (isinstance(array, pd.DataFrame)):
            return array.values.tolist()
        if (isinstance(array, np.ndarray)):
            return array.tolist()
        return array

    def _find_first_explanation(self, key):
        interface = ExplanationDashboardInterface
        explanation_type_key = interface.MLI_EXPLANATION_TYPE_KEY
        new_array = [explanation for explanation
                     in self._mli_explanations
                     if explanation[explanation_type_key] == key]
        if len(new_array) > 0:
            return new_array[0]["value"]
        return None

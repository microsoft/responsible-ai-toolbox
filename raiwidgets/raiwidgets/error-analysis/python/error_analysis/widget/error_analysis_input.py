# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explanation dashboard class."""

from ._internal.constants import ErrorAnalysisDashboardInterface, \
    WidgetRequestResponseConstants
from ..common.error_handling import _format_exception
from scipy.sparse import issparse
import numpy as np
import pandas as pd
from sklearn import tree
from sklearn.tree import _tree
from enum import Enum

BIN_THRESHOLD = 8
CATEGORY1 = "category1"
CATEGORY2 = "category2"
FALSE_COUNT = "falseCount"
COUNT = "count"


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
    """Represents an explanation as all the pieces that can be
    serialized and passed to JavaScript.

    :param explanation: An object that represents an explanation.
    :type explanation: ExplanationMixin
    :param model: An object that represents a model.
        It is assumed that for the classification case
        it has a method of predict_proba() returning
        the prediction probabilities for each
        class and for the regression case a method
        of predict() returning the prediction value.
    :type model: object
    :param dataset: A matrix of feature vector examples
        (# examples x # features), the same samples
        used to build the explanation. Will overwrite
        any set on explanation object already
    :type dataset: numpy.array or list[][]
    :param true_y: The true labels for the provided
        dataset. Will overwrite any set on
        explanation object already.
    :type true_y: numpy.array or list[]
    :param classes: The class names.
    :type classes: numpy.array or list[]
    :param features: Feature names.
    :type features: numpy.array or list[]
    """

    def __init__(
            self,
            explanation,
            model=None,
            dataset=None,
            true_y=None,
            classes=None,
            features=None,
            predict_url=None,
            tree_url=None,
            matrix_url=None,
            local_url=None,
            locale=None):
        """Initialize the Explanation Dashboard Input.

        :param explanation: An object that represents an explanation.
        :type explanation: ExplanationMixin
        :param model: An object that represents a model.
            It is assumed that for the classification case
            it has a method of predict_proba() returning
            the prediction probabilities for each
            class and for the regression case a method of
            predict() returning the prediction value.
        :type model: object
        :param dataset: A matrix of feature vector examples
            (# examples x # features), the same samples
            used to build the explanation. Will overwrite
            any set on explanation object already
        :type dataset: numpy.array or list[][]
        :param true_y: The true labels for the provided
            dataset. Will overwrite any set on
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
        self._is_classifier = model is not None and \
            hasattr(model, 'predict_proba') and \
            model.predict_proba is not None
        self._dataframeColumns = None
        self.dashboard_input = {}
        self._predict_url = predict_url
        self._tree_url = tree_url
        self._matrix_url = matrix_url
        self._local_url = local_url
        # List of explanations, key of explanation type is "explanation_type"
        self._mli_explanations = explanation.data(-1)["mli"]
        find_first_explanation = self._find_first_explanation
        interface = ErrorAnalysisDashboardInterface
        local_explanation_key = interface.MLI_LOCAL_EXPLANATION_KEY
        local_explanation = find_first_explanation(local_explanation_key)
        global_explanation_key = interface.MLI_GLOBAL_EXPLANATION_KEY
        global_explanation = find_first_explanation(global_explanation_key)
        ebm_global_explanation_key = interface.MLI_EBM_GLOBAL_EXPLANATION_KEY
        ebm_explanation = find_first_explanation(ebm_global_explanation_key)
        explanation_dataset_key = interface.MLI_EXPLANATION_DATASET_KEY
        dataset_explanation = find_first_explanation(explanation_dataset_key)

        predicted_y = None
        feature_length = None
        if dataset_explanation is not None:
            if dataset is None:
                dataset_x_key = interface.MLI_DATASET_X_KEY
                dataset = dataset_explanation[dataset_x_key]
            if true_y is None:
                dataset_y_key = interface.MLI_DATASET_Y_KEY
                true_y = dataset_explanation[dataset_y_key]

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
                raise ValueError(("Model does not support predict method "
                                  "for given dataset type, "
                                  "inner error: {}").format(ex_str))
            try:
                predicted_y = self._convert_to_list(predicted_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(("Model prediction output of unsupported "
                                  "type, inner error: {}").format(ex_str))
        if predicted_y is not None:
            self.dashboard_input[interface.PREDICTED_Y] = predicted_y
        if list_dataset is not None:
            row_length, feature_length = np.shape(list_dataset)
            if row_length > 100000:
                raise ValueError("Exceeds maximum number of "
                                 "rows for visualization (100000)")
            if feature_length > 1000:
                raise ValueError("Exceeds maximum number of "
                                 "features for visualization (1000)")
            self.dashboard_input[interface.TRAINING_DATA] = list_dataset
            self.dashboard_input[interface.IS_CLASSIFIER] = \
                self._is_classifier

        local_dim = None

        if true_y is not None and len(true_y) == row_length:
            self.dashboard_input[interface.TRUE_Y] = \
                self._convert_to_list(true_y)

        if local_explanation is not None:
            try:
                local_explanation["scores"] = \
                    self._convert_to_list(local_explanation["scores"])
                local_explanation["intercept"] = \
                    self._convert_to_list(local_explanation["intercept"])
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted
                # to python, otherwise serialization fails.
                local_explanation["perf"] = None
                self.dashboard_input[interface.LOCAL_EXPLANATIONS] = \
                    local_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(("Unsupported local explanation "
                                  "type, inner error: {}").format(ex_str))
            if list_dataset is not None:
                dim = np.shape(local_explanation["scores"])
                if len(dim) != 2 and len(dim) != 3:
                    raise ValueError("Local explanation expected "
                                     "to be a 2D or 3D list")
                if len(dim) == 2 and \
                        (dim[1] != feature_length or dim[0] != row_length):
                    raise ValueError("Shape mismatch: local explanation "
                                     "length differs from dataset")
                if len(dim) == 3 and \
                        (dim[2] != feature_length or dim[1] != row_length):
                    raise ValueError("Shape mismatch: local explanation "
                                     "length differs from dataset")
        if local_explanation is None and global_explanation is not None:
            try:
                global_explanation["scores"] = \
                    self._convert_to_list(global_explanation["scores"])
                if 'intercept' in global_explanation:
                    global_explanation["intercept"] = \
                        self._convert_to_list(global_explanation["intercept"])
                self.dashboard_input[interface.GLOBAL_EXPLANATION] = \
                    global_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported global explanation type, inner error: {}"
                    .format(ex_str))
        if ebm_explanation is not None:
            try:
                self.dashboard_input[interface.EBM_EXPLANATION] = \
                    ebm_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported ebm explanation type: {}".format(ex_str))

        if features is None and hasattr(explanation, 'features') \
                and explanation.features is not None:
            features = explanation.features
        if features is not None:
            features = self._convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch: "
                                 "feature names length differs from "
                                 "local explanations dimension")
            self.dashboard_input[interface.FEATURE_NAMES] = features
        if classes is None and hasattr(explanation, 'classes') \
                and explanation.classes is not None:
            classes = explanation.classes
        if classes is not None:
            classes = self._convert_to_list(classes)
            if local_dim is not None and len(classes) != local_dim[0]:
                raise ValueError("Class vector length mismatch: "
                                 "class names length differs from "
                                 "local explanations dimension")
            self.dashboard_input[interface.CLASS_NAMES] = classes
        if model is not None and hasattr(model, 'predict_proba') \
                and model.predict_proba is not None and dataset is not None:
            try:
                probability_y = model.predict_proba(dataset)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Model does not support predict_proba "
                                 "method for given dataset "
                                 "type, inner error: {}".format(ex_str))
            try:
                probability_y = self._convert_to_list(probability_y)
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Model predict_proba output of "
                                 "unsupported type, "
                                 "inner error: {}".format(ex_str))
            self.dashboard_input[interface.PROBABILITY_Y] = probability_y
        if locale is not None:
            self.dashboard_input[interface.LOCALE] = locale

    def enable_predict_url(self):
        if self._model is not None:
            interface = ErrorAnalysisDashboardInterface
            self.dashboard_input[interface.PREDICTION_URL] = self._predict_url
            self.dashboard_input[interface.TREE_URL] = self._tree_url
            self.dashboard_input[interface.MATRIX_URL] = self._matrix_url
            self.dashboard_input[interface.LOCAL_URL] = self._local_url

    def debug_ml(self, features):
        try:
            interface = ErrorAnalysisDashboardInterface
            # Fit a surrogate model on errors
            surrogate = tree.DecisionTreeClassifier(max_depth=3)
            diff = self._model.predict(self._dataset) != self._true_y
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            indexes = []
            for feature in features:
                indexes.append(feature_names.index(feature))
            dataset_sub_features = self._dataset[:, indexes]
            dataset_sub_names = np.array(feature_names)[np.array(indexes)]
            surrogate.fit(dataset_sub_features, diff)
            json_tree = self.traverse(surrogate.tree_, 0, [],
                                      dataset_sub_names)
            print(json_tree)
            print(self.dashboard_input[interface.FEATURE_NAMES])
            return {
                WidgetRequestResponseConstants.DATA: json_tree
            }
        except Exception as e:
            print(e)
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json tree representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def matrix(self, features):
        try:
            if features[0] is None:
                return {WidgetRequestResponseConstants.DATA: []}
            interface = ErrorAnalysisDashboardInterface
            diff = self._model.predict(self._dataset) != self._true_y
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            indexes = []
            for feature in features:
                if feature is None:
                    continue
                indexes.append(feature_names.index(feature))
            dataset_sub_features = self._dataset[:, indexes]
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
            traceback.print_stack()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json matrix representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def json_matrix_2d(self, categories1, categories2, matrix_counts,
                       matrix_err_counts):
        json_matrix = []
        for row_index in range(matrix_counts.shape[0]):
            json_matrix_category = []
            cat1 = categories1[row_index]
            json_matrix_category.append({
                CATEGORY1: str(cat1)
            })
            for col_index in range(matrix_counts.shape[1]):
                cat2 = categories2[col_index]
                index_exists = cat1 in matrix_err_counts.index
                col_exists = cat2 in matrix_err_counts.columns
                false_count = 0
                if index_exists and col_exists:
                    false_count = int(matrix_err_counts.loc[cat1, cat2])
                json_matrix_category.append({
                    FALSE_COUNT: false_count,
                    COUNT: int(matrix_counts.iloc[row_index, col_index])
                })
            json_matrix.append(json_matrix_category)

        json_matrix_category_end = []
        json_matrix_category_end.append({
            CATEGORY1: matrix_counts.shape[0]
        })
        for category in categories2:
            json_matrix_category_end.append({
                CATEGORY2: str(category)
            })
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
        for category in categories:
            json_matrix_category1.append({
                CATEGORY2: str(category)
            })
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
                method = "less and equal"
                arg = parent_threshold
                condition = "{} <= {:.2f}".format(parent_node_name,
                                                  parent_threshold)
            elif side == TreeSide.LeftChild:
                method = "greater"
                arg = parent_threshold
                condition = "{} > {:.2f}".format(parent_node_name,
                                                 parent_threshold)
        json.append({
            "arg": arg,
            "badFeaturesRowCount": 0,
            "condition": condition,
            "error": float(error),
            "id": int(nodeid),
            "method": method,
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
                    "Model threw exeption while predicting...",
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
        interface = ErrorAnalysisDashboardInterface
        explanation_type_key = interface.MLI_EXPLANATION_TYPE_KEY
        new_array = [explanation for explanation
                     in self._mli_explanations
                     if explanation[explanation_type_key] == key]
        if len(new_array) > 0:
            return new_array[0]["value"]
        return None

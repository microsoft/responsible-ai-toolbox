# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from .explanation_constants import \
    ExplanationDashboardInterface, WidgetRequestResponseConstants
from scipy.sparse import issparse
from sklearn.feature_selection import mutual_info_classif
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from enum import Enum
import traceback
from .constants import SKLearn
from .error_handling import _format_exception
from ._input_processing import _serialize_json_safe


BIN_THRESHOLD = 8
CATEGORY1 = "category1"
CATEGORY2 = "category2"
MATRIX = "matrix"
VALUES = "values"
FALSE_COUNT = "falseCount"
COUNT = "count"
INTERVAL_MIN = "intervalMin"
INTERVAL_MAX = "intervalMax"
METHOD = "method"
METHOD_GREATER = "greater"
METHOD_LESS_AND_EQUAL = "less and equal"
METHOD_RANGE = "in the range of"
METHOD_EXCLUDES = "excludes"
METHOD_INCLUDES = "includes"
TRUE_Y = "true_y"
DIFF = "diff"
SPLIT_INDEX = "split_index"
SPLIT_FEATURE = "split_feature"
FEATURE_NAMES = ExplanationDashboardInterface.FEATURE_NAMES
ROW_INDEX = "row_index"
LEAF_INDEX = "leaf_index"
METHOD_EQUAL = "equal"


class TreeSide(str, Enum):
    """Provide model task constants.
    Can be 'classification', 'regression', or 'unknown'.

    By default the model domain is inferred if 'unknown',
    but this can be overridden if you specify
    'classification' or 'regression'.
    """

    RIGHT_CHILD = 'right_child'
    LEFT_CHILD = 'left_child'
    UNKNOWN = 'unknown'


class ErrorAnalysisDashboardInput:
    def __init__(
            self,
            explanation,
            model,
            dataset,
            true_y,
            classes,
            features,
            locale,
            categorical_features,
            true_y_dataset):
        """Initialize the ErrorAnalysis Dashboard Input.

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
        :type dataset: numpy.array or list[][] or pandas.DataFrame
        :param true_y: The true labels for the provided explanation.
            Will overwrite any set on explanation object already.
        :type true_y: numpy.array or list[]
        :param classes: The class names.
        :type classes: numpy.array or list[]
        :param features: Feature names.
        :type features: numpy.array or list[]
            :param categorical_features: The categorical feature names.
        :type categorical_features: list[str]
        :param true_y_dataset: The true labels for the provided dataset.
        Only needed if the explanation has a sample of instances from the
        original dataset.  Otherwise specify true_y parameter only.
        :type true_y_dataset: numpy.array or list[]
        """
        self._model = model
        original_dataset = dataset
        if isinstance(dataset, pd.DataFrame):
            self._dataset = dataset.to_json()
        else:
            self._dataset = dataset
        if true_y_dataset is None:
            self._true_y = true_y
        else:
            self._true_y = true_y_dataset
        self._categorical_features = categorical_features
        self._categories = []
        self._categorical_indexes = []
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
            if dataset is None or len(dataset) != len(true_y):
                dataset = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_X_KEY
                ]
            if true_y is None:
                true_y = dataset_explanation[
                    ExplanationDashboardInterface.MLI_DATASET_Y_KEY
                ]
        elif len(dataset) != len(true_y):
            dataset = explanation._eval_data

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

        if classes is None and hasattr(explanation, 'classes')\
                and explanation.classes is not None:
            classes = explanation.classes
        if classes is not None:
            classes = self._convert_to_list(classes)
            self.dashboard_input[
                ExplanationDashboardInterface.CLASS_NAMES
            ] = classes
            class_to_index = {k: v for v, k in enumerate(classes)}

        if predicted_y is not None:
            # If classes specified, convert predicted_y to
            # numeric representation
            if classes is not None and predicted_y[0] in class_to_index:
                for i in range(len(predicted_y)):
                    predicted_y[i] = class_to_index[predicted_y[i]]
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
            ] = _serialize_json_safe(list_dataset)
            self.dashboard_input[
                ExplanationDashboardInterface.IS_CLASSIFIER
            ] = self._is_classifier

        if true_y is not None and len(true_y) == row_length:
            list_true_y = self._convert_to_list(true_y)
            # If classes specified, convert true_y to numeric representation
            if classes is not None and list_true_y[0] in class_to_index:
                for i in range(len(list_true_y)):
                    list_true_y[i] = class_to_index[list_true_y[i]]
            self.dashboard_input[
                ExplanationDashboardInterface.TRUE_Y
            ] = list_true_y

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
                if classes is not None and len(classes) != local_dim[0]:
                    raise ValueError("Class vector length mismatch:"
                                     "class names length differs from"
                                     "local explanations dimension")
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
            self.dashboard_input[FEATURE_NAMES] = features
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
        if self._categorical_features:
            category_dictionary = {}
            features = self.dashboard_input[FEATURE_NAMES]
            self._categorical_indexes = [features.index(feature) for feature
                                         in self._categorical_features]
            from sklearn.compose import ColumnTransformer
            from sklearn.preprocessing import OrdinalEncoder
            ordinal_enc = OrdinalEncoder()
            ct = ColumnTransformer([('ord', ordinal_enc,
                                     self._categorical_indexes)],
                                   remainder='drop')
            self.string_ind_data = ct.fit_transform(original_dataset)
            transformer_categories = ct.transformers_[0][1].categories_
            for category_arr, category_index in zip(transformer_categories,
                                                    self._categorical_indexes):
                category_values = category_arr.tolist()
                self._categories.append(category_values)
                category_dictionary[category_index] = category_values
            self.dashboard_input[
                ExplanationDashboardInterface.CATEGORICAL_MAP
            ] = category_dictionary

    def build_cat_bounds_query(self, filter, colname, method):
        bounds = []
        if method == METHOD_EXCLUDES:
            operator = " != "
        else:
            operator = " == "
        for arg in filter['arg']:
            cat_idx = self._categorical_features.index(colname)
            arg_cat = "'{}'".format(str(self._categories[cat_idx][arg]))
            bounds.append("`{}`{}{}".format(colname, operator, arg_cat))
        if method == METHOD_EXCLUDES:
            return ' & '.join(bounds)
        else:
            return ' | '.join(bounds)

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
                elif method == METHOD_INCLUDES or method == METHOD_EXCLUDES:
                    query = self.build_cat_bounds_query(filter,
                                                        colname,
                                                        method)
                    queries.append(query)
                elif method == METHOD_EQUAL:
                    is_categorical = False
                    if self._categorical_features:
                        is_categorical = colname in self._categorical_features
                    if is_categorical:
                        cat_idx = self._categorical_features.index(colname)
                        arg0i = filter['arg'][0]
                        arg_cat = str(self._categories[cat_idx][arg0i])
                        queries.append("`{}` == '{}'".format(colname, arg_cat))
                    else:
                        queries.append("`" + colname + "` == " + arg0)
                else:
                    raise ValueError(
                        "Unsupported method type: {}".format(method))
            else:
                cqueries = []
                for composite_filter in filter['compositeFilters']:
                    cqueries.append(self.build_query([composite_filter]))
                if filter['operation'] == 'and':
                    queries.append('(' + ') & ('.join(cqueries) + ')')
                else:
                    queries.append('(' + ') | ('.join(cqueries) + ')')
        return '(' + ') & ('.join(queries) + ')'

    def apply_recursive_filter(self, df, filters):
        if filters:
            return df.query(self.build_query(filters))
        else:
            return df

    def filter_from_cohort(self, filters, composite_filters,
                           feature_names, is_pandas, true_y):
        if is_pandas:
            df = pd.read_json(self._dataset)
        else:
            df = pd.DataFrame(self._dataset, columns=feature_names)
        df[TRUE_Y] = true_y
        df[ROW_INDEX] = np.arange(0, len(true_y))
        df = self.apply_recursive_filter(df, filters)
        df = self.apply_recursive_filter(df, composite_filters)
        return df

    def debug_ml(self, features, filters, composite_filters):
        try:
            interface = ExplanationDashboardInterface
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            # Fit a surrogate model on errors
            surrogate = LGBMClassifier(n_estimators=1, max_depth=3)
            is_pandas = False
            if isinstance(self._dataset, str):
                is_pandas = True
            true_y = self._true_y
            filtered_df = self.filter_from_cohort(filters,
                                                  composite_filters,
                                                  feature_names,
                                                  is_pandas,
                                                  true_y)
            row_index = filtered_df[ROW_INDEX]
            true_y = filtered_df[TRUE_Y]
            input_data = filtered_df.drop(columns=[TRUE_Y, ROW_INDEX])
            if is_pandas:
                true_y = true_y.to_numpy()
            else:
                input_data = input_data.to_numpy()
            diff = self._model.predict(input_data) != true_y
            if not isinstance(diff, np.ndarray):
                diff = np.array(diff)
            indexes = []
            for feature in features:
                indexes.append(feature_names.index(feature))
            if is_pandas:
                input_data = input_data.to_numpy()
            cat_ind_reindexed = []
            categories_reindexed = []
            if self._categorical_features:
                # Inplace replacement of columns
                for idx, c_i in enumerate(self._categorical_indexes):
                    input_data[:, c_i] = self.string_ind_data[row_index, idx]
            dataset_sub_features = input_data[:, indexes]
            dataset_sub_names = np.array(feature_names)[np.array(indexes)]
            dataset_sub_names = list(dataset_sub_names)
            if self._categorical_features:
                for c_index, feature in enumerate(self._categorical_features):
                    try:
                        index_sub = dataset_sub_names.index(feature)
                    except ValueError:
                        continue
                    cat_ind_reindexed.append(index_sub)
                    categories_reindexed.append(self._categories[c_index])
                surrogate.fit(dataset_sub_features, diff,
                              categorical_feature=cat_ind_reindexed)
            else:
                surrogate.fit(dataset_sub_features, diff)
            filtered_indexed_df = pd.DataFrame(dataset_sub_features,
                                               columns=dataset_sub_names)
            filtered_indexed_df[DIFF] = diff
            model_json = surrogate._Booster.dump_model()
            tree_structure = model_json["tree_info"][0]['tree_structure']
            max_split_index = self.get_max_split_index(tree_structure) + 1
            json_tree = self.traverse(filtered_indexed_df,
                                      tree_structure,
                                      max_split_index,
                                      (categories_reindexed,
                                       cat_ind_reindexed),
                                      [], dataset_sub_names)
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
            if features[0] is None and features[1] is None:
                return {WidgetRequestResponseConstants.DATA: []}
            interface = ExplanationDashboardInterface
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            is_pandas = False
            if isinstance(self._dataset, str):
                is_pandas = True
            true_y = self._true_y
            filtered_df = self.filter_from_cohort(filters,
                                                  composite_filters,
                                                  feature_names,
                                                  is_pandas,
                                                  true_y)
            true_y = filtered_df[TRUE_Y]
            input_data = filtered_df.drop(columns=[TRUE_Y, ROW_INDEX])
            if is_pandas:
                true_y = true_y.to_numpy()
            else:
                input_data = input_data.to_numpy()
            diff = self._model.predict(input_data) != true_y
            if not isinstance(diff, np.ndarray):
                diff = np.array(diff)
            indexes = []
            for feature in features:
                if feature is None:
                    continue
                indexes.append(feature_names.index(feature))
            if is_pandas:
                input_data = input_data.to_numpy()
            dataset_sub_features = input_data[:, indexes]
            dataset_sub_names = np.array(feature_names)[np.array(indexes)]
            df = pd.DataFrame(dataset_sub_features, columns=dataset_sub_names)
            df_err = df.copy()
            df_err[DIFF] = diff
            df_err = df_err[df_err[DIFF]]
            # construct json matrix
            json_matrix = []
            if len(dataset_sub_names) == 2:
                feat1 = dataset_sub_names[0]
                feat2 = dataset_sub_names[1]
                unique_count1 = len(df[feat1].unique())
                unique_count2 = len(df[feat2].unique())
                f1_is_cat = False
                f2_is_cat = False
                if self._categorical_features is not None:
                    f1_is_cat = feat1 in self._categorical_features
                    f2_is_cat = feat2 in self._categorical_features
                if unique_count1 > BIN_THRESHOLD and not f1_is_cat:
                    tabdf1, bins = pd.cut(df[feat1], BIN_THRESHOLD,
                                          retbins=True)
                    tabdf1_err = pd.cut(df_err[feat1], bins)
                    categories1 = tabdf1.cat.categories
                else:
                    tabdf1 = df[feat1]
                    tabdf1_err = df_err[feat1]
                    categories1 = np.unique(tabdf1.to_numpy(),
                                            return_counts=True)[0]
                if unique_count2 > BIN_THRESHOLD and not f2_is_cat:
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
                f1_is_cat = False
                if self._categorical_features is not None:
                    f1_is_cat = feat1 in self._categorical_features
                if unique_count1 > BIN_THRESHOLD and not f1_is_cat:
                    cutdf, bins = pd.cut(df[feat1], BIN_THRESHOLD,
                                         retbins=True)
                    bin_range = range(BIN_THRESHOLD)
                    catr = cutdf.cat.rename_categories(bin_range)
                    catn, counts = np.unique(catr.to_numpy(),
                                             return_counts=True)
                    # fix counts to include skipped categories
                    fix_counts = []
                    counts_idx = 0
                    for idx, catdf in enumerate(cutdf.cat.categories):
                        if idx not in catn:
                            fix_counts.append(0)
                        else:
                            fix_counts.append(counts[counts_idx])
                            counts_idx += 1
                    counts = fix_counts
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
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate json matrix representation",
                WidgetRequestResponseConstants.DATA: []
            }

    def importances(self):
        try:
            interface = ExplanationDashboardInterface
            feature_names = self.dashboard_input[interface.FEATURE_NAMES]
            is_pandas = False
            if isinstance(self._dataset, str):
                is_pandas = True
            if is_pandas:
                input_data = pd.read_json(self._dataset)
            else:
                input_data = pd.DataFrame(self._dataset,
                                          columns=feature_names)
            diff = self._model.predict(input_data) != self._true_y
            if is_pandas:
                input_data = input_data.to_numpy()
            if self._categorical_features:
                # Inplace replacement of columns
                for idx, c_i in enumerate(self._categorical_indexes):
                    input_data[:, c_i] = self.string_ind_data[:, idx]
            # compute the feature importances using mutual information
            scores = mutual_info_classif(input_data, diff).tolist()
            return {
                WidgetRequestResponseConstants.DATA: scores
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.ERROR:
                    "Failed to generate feature importances",
                WidgetRequestResponseConstants.DATA: []
            }

    def json_matrix_2d(self, categories1, categories2, matrix_counts,
                       matrix_err_counts):
        json_matrix = []
        json_category1 = []
        json_category1_min_interval = []
        json_category1_max_interval = []
        for row_index in range(len(categories1)):
            json_matrix_row = []
            cat1 = categories1[row_index]
            if isinstance(categories1, pd.IntervalIndex):
                json_category1_min_interval.append(cat1.left)
                json_category1_max_interval.append(cat1.right)
            json_category1.append(str(cat1))
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
                json_matrix_row.append({
                    FALSE_COUNT: false_count,
                    COUNT: total_count
                })
            json_matrix.append(json_matrix_row)

        json_category2 = []
        json_category2_min_interval = []
        json_category2_max_interval = []
        for cat2 in categories2:
            if isinstance(categories2, pd.IntervalIndex):
                json_category2_min_interval.append(cat2.left)
                json_category2_max_interval.append(cat2.right)
            json_category2.append(str(cat2))
        category1 = {VALUES: json_category1,
                     INTERVAL_MIN: json_category1_min_interval,
                     INTERVAL_MAX: json_category1_max_interval}
        category2 = {VALUES: json_category2,
                     INTERVAL_MIN: json_category2_min_interval,
                     INTERVAL_MAX: json_category2_max_interval}
        return {MATRIX: json_matrix, CATEGORY1: category1,
                CATEGORY2: category2}

    def json_matrix_1d(self, categories, values_err, counts, counts_err):
        json_matrix = []
        json_matrix_row = []
        for col_idx in range(len(categories)):
            cat = categories[col_idx]
            false_count = 0
            if cat in values_err:
                index_err = list(values_err).index(cat)
                false_count = int(counts_err[index_err])
            json_matrix_row.append({
                FALSE_COUNT: false_count,
                COUNT: int(counts[col_idx])
            })
        json_matrix.append(json_matrix_row)
        json_category = []
        json_category_min_interval = []
        json_category_max_interval = []
        for cat in categories:
            if isinstance(categories, pd.IntervalIndex):
                json_category_min_interval.append(cat.left)
                json_category_max_interval.append(cat.right)
            json_category.append(str(cat))
        category1 = {VALUES: json_category,
                     INTERVAL_MIN: json_category_min_interval,
                     INTERVAL_MAX: json_category_max_interval}
        return {MATRIX: json_matrix, CATEGORY1: category1}

    def get_max_split_index(self, tree):
        if SPLIT_INDEX in tree:
            max_index = tree[SPLIT_INDEX]
            index1 = self.get_max_split_index(tree[TreeSide.LEFT_CHILD])
            index2 = self.get_max_split_index(tree[TreeSide.RIGHT_CHILD])
            return max(max(max_index, index1), index2)
        else:
            return 0

    def traverse(self, df, tree, max_split_index,
                 categories, json, feature_names, parent=None,
                 side=TreeSide.UNKNOWN):
        if SPLIT_INDEX in tree:
            nodeid = tree[SPLIT_INDEX]
        elif LEAF_INDEX in tree:
            nodeid = max_split_index + tree[LEAF_INDEX]
        else:
            nodeid = 0

        # write current node to json
        json, df = self.node_to_json(df, tree, nodeid, categories,
                                     json, feature_names, parent,
                                     side)

        # write children to json
        if 'leaf_value' not in tree:
            left_child = tree[TreeSide.LEFT_CHILD]
            right_child = tree[TreeSide.RIGHT_CHILD]
            json = self.traverse(df, left_child, max_split_index,
                                 categories, json, feature_names,
                                 tree, TreeSide.LEFT_CHILD)
            json = self.traverse(df, right_child, max_split_index,
                                 categories, json, feature_names,
                                 tree, TreeSide.RIGHT_CHILD)
        return json

    def node_to_json(self, df, tree, nodeid, categories, json,
                     feature_names, parent=None,
                     side=TreeSide.UNKNOWN):
        p_node_name = None
        condition = None
        arg = None
        method = None
        parentid = None
        if parent is not None:
            parentid = int(parent[SPLIT_INDEX])
            p_node_name = feature_names[parent[SPLIT_FEATURE]]
            parent_threshold = parent['threshold']
            parent_decision_type = parent['decision_type']
            if side == TreeSide.RIGHT_CHILD:
                if parent_decision_type == '<=':
                    method = "less and equal"
                    arg = float(parent_threshold)
                    condition = "{} <= {:.2f}".format(p_node_name,
                                                      parent_threshold)
                    query = "`" + p_node_name + "` <= " + str(parent_threshold)
                    df = df.query(query)
                elif parent_decision_type == '==':
                    method = METHOD_INCLUDES
                    arg = [float(i) for i in parent_threshold.split('||')]
                    categorical_values = categories[0]
                    categorical_indexes = categories[1]
                    thresholds = []
                    catcoli = categorical_indexes.index(parent[SPLIT_FEATURE])
                    catvals = categorical_values[catcoli]
                    for argi in arg:
                        encoded_val = catvals[int(argi)]
                        thresholds.append(encoded_val)
                    threshold_str = " | ".join(thresholds)
                    condition = "{} == {}".format(p_node_name,
                                                  threshold_str)
                    query = []
                    for argi in arg:
                        query.append("`" + p_node_name + "` == " + str(argi))
                    df = df.query(" | ".join(query))
            elif side == TreeSide.LEFT_CHILD:
                if parent_decision_type == '<=':
                    method = "greater"
                    arg = float(parent_threshold)
                    condition = "{} > {:.2f}".format(p_node_name,
                                                     parent_threshold)
                    query = "`" + p_node_name + "` > " + str(parent_threshold)
                    df = df.query(query)
                elif parent_decision_type == '==':
                    method = METHOD_EXCLUDES
                    arg = [float(i) for i in parent_threshold.split('||')]
                    categorical_values = categories[0]
                    categorical_indexes = categories[1]
                    thresholds = []
                    catcoli = categorical_indexes.index(parent[SPLIT_FEATURE])
                    catvals = categorical_values[catcoli]
                    for argi in arg:
                        encoded_val = catvals[int(argi)]
                        thresholds.append(encoded_val)
                    threshold_str = " | ".join(thresholds)
                    condition = "{} != {}".format(p_node_name,
                                                  threshold_str)
                    query = []
                    for argi in arg:
                        query.append("`" + p_node_name + "` != " + str(argi))
                    df = df.query(" & ".join(query))
        error = df[DIFF].values.sum()
        total = df.shape[0]
        success = total - error
        if SPLIT_FEATURE in tree:
            node_name = feature_names[tree[SPLIT_FEATURE]]
        else:
            node_name = None
        json.append({
            "arg": arg,
            "badFeaturesRowCount": 0,
            "condition": condition,
            "error": float(error),
            "id": int(nodeid),
            METHOD: method,
            "nodeIndex": int(nodeid),
            "nodeName": node_name,
            "parentId": parentid,
            "parentNodeName": p_node_name,
            "pathFromRoot": "",
            "size": float(success + error),
            "sourceRowKeyHash": "hashkey",
            "success": float(success)
        })
        return json, df

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

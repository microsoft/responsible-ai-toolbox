# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

from responsibleai import ModelAnalysis
from ._input_processing import _serialize_json_safe
from .error_handling import _format_exception
from .constants import SKLearn
import pandas as pd
import numpy as np
from scipy.sparse import issparse
from .interfaces import WidgetRequestResponseConstants,\
    ModelAnalysisDashboardData, Dataset, ModelExplanationData,\
    PrecomputedExplanations, FeatureImportance, EBMGlobalExplanation,\
    ErrorAnalysisConfig, CausalData
from .explanation_constants import ExplanationDashboardInterface
import traceback
from responsibleai._internal.constants import ErrorAnalysisManagerKeys
from raiwidgets.interfaces import CounterfactualData
import json


class ModelAnalysisDashboardInput:
    def __init__(
            self,
            analysis: ModelAnalysis):
        """Initialize the Explanation Dashboard Input.

        :param analysis:
            An ModelAnalysis object that represents an explanation.
        :type analysis: ModelAnalysis
        """
        self._analysis = analysis
        model = analysis.model
        self._is_classifier = model is not None\
            and hasattr(model, SKLearn.PREDICT_PROBA) and \
            model.predict_proba is not None
        self._dataframeColumns = None
        self.dashboard_input = ModelAnalysisDashboardData()
        self.dashboard_input.dataset = self._get_dataset()
        self._feature_length = len(self.dashboard_input.dataset.featureNames)
        self._row_length = len(self.dashboard_input.dataset.features)
        self.dashboard_input.modelExplanationData = [
            self._get_interpret(i) for i in self._analysis.explainer.get()]
        self.dashboard_input.errorAnalysisConfig = [
            self._get_error_analysis(i)
            for i in self._analysis.error_analysis.list()["reports"]]
        self.dashboard_input.causalAnalysisData = [
            self._get_causal(i)
            for i in self._analysis.causal.get()]
        self.dashboard_input.counterfactualData = [
            self._get_counterfactual(i)
            for i in self._analysis.counterfactual.get()]
        self._error_analyzer = analysis.error_analysis.analyzer

    def on_predict(self, data):
        try:
            if self._dataframeColumns is not None:
                data = pd.DataFrame(data, columns=self._dataframeColumns)
            if (self._is_classifier):
                prediction = self._convert_to_list(
                    self._analysis.model.predict_proba(data))
            else:
                prediction = self._convert_to_list(
                    self._analysis.model.predict(data))
            return {
                WidgetRequestResponseConstants.data: prediction
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error: "Model threw exception"
                " while predicting...",
                WidgetRequestResponseConstants.data: []
            }

    def debug_ml(self, data):
        try:
            features, filters, composite_filters, max_depth, num_leaves = data
            json_tree = self._error_analyzer.compute_error_tree(
                features, filters, composite_filters,
                max_depth, num_leaves)
            return {
                WidgetRequestResponseConstants.data: json_tree
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate json tree representation",
                WidgetRequestResponseConstants.data: []
            }

    def matrix(self, data):
        try:
            features, filters, composite_filters = data
            if features[0] is None and features[1] is None:
                return {WidgetRequestResponseConstants.data: []}
            json_matrix = self._error_analyzer.compute_matrix(
                features, filters, composite_filters)
            return {
                WidgetRequestResponseConstants.data: json_matrix
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate json matrix representation",
                WidgetRequestResponseConstants.data: []
            }

    def importances(self):
        try:
            scores = self._error_analyzer.compute_importances()
            return {
                WidgetRequestResponseConstants.data: scores
            }
        except Exception as e:
            print(e)
            traceback.print_exc()
            return {
                WidgetRequestResponseConstants.error:
                    "Failed to generate feature importances",
                WidgetRequestResponseConstants.data: []
            }

    def _get_dataset(self):
        dashboard_dataset = Dataset()
        dashboard_dataset.classNames = self._convert_to_list(
            self._analysis._classes)

        predicted_y = None
        feature_length = None

        dataset: pd.DataFrame = self._analysis.test.drop(
            [self._analysis.target_column], axis=1)

        if isinstance(dataset, pd.DataFrame) and hasattr(dataset, 'columns'):
            self._dataframeColumns = dataset.columns
        try:
            list_dataset = self._convert_to_list(dataset)
        except Exception as ex:
            ex_str = _format_exception(ex)
            raise ValueError(
                "Unsupported dataset type, inner error: {}".format(ex_str))
        if dataset is not None and self._analysis.model is not None:
            try:
                predicted_y = self._analysis.model.predict(dataset)
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
            if(self._analysis.task_type == "classification" and
                    dashboard_dataset.classNames is not None):
                predicted_y = [dashboard_dataset.classNames.index(
                    y) for y in predicted_y]
            dashboard_dataset.predictedY = predicted_y
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
            dashboard_dataset.features = _serialize_json_safe(
                list_dataset)

        true_y = self._analysis.test[self._analysis.target_column]

        if true_y is not None and len(true_y) == row_length:
            if(self._analysis.task_type == "classification" and
               dashboard_dataset.classNames is not None):
                true_y = [dashboard_dataset.classNames.index(
                    y) for y in true_y]
            dashboard_dataset.trueY = self._convert_to_list(true_y)

        features = dataset.columns

        if features is not None:
            features = self._convert_to_list(features)
            if feature_length is not None and len(features) != feature_length:
                raise ValueError("Feature vector length mismatch:"
                                 " feature names length differs"
                                 " from local explanations dimension")
            dashboard_dataset.featureNames = features

        if (self._analysis.model is not None and
                hasattr(self._analysis.model, SKLearn.PREDICT_PROBA) and
                self._analysis.model.predict_proba is not None and
                dataset is not None):
            try:
                probability_y = self._analysis.model.predict_proba(dataset)
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
            dashboard_dataset.probabilityY = probability_y

        return dashboard_dataset

    def _get_interpret(self, explanation):
        interpretation = ModelExplanationData()

        # List of explanations, key of explanation type is "explanation_type"
        if explanation is not None:
            mli_explanations = explanation.data(-1)["mli"]
        else:
            mli_explanations = None
        local_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_LOCAL_EXPLANATION_KEY,
            mli_explanations)
        global_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_GLOBAL_EXPLANATION_KEY,
            mli_explanations)
        ebm_explanation = self._find_first_explanation(
            ExplanationDashboardInterface.MLI_EBM_GLOBAL_EXPLANATION_KEY,
            mli_explanations)

        if explanation is not None and hasattr(explanation, 'method'):
            interpretation.method = explanation.method

        local_dim = None

        if local_explanation is not None or global_explanation is not None\
                or ebm_explanation is not None:
            interpretation.precomputedExplanations = PrecomputedExplanations()

        if local_explanation is not None:
            try:
                local_feature_importance = FeatureImportance()
                local_feature_importance.scores = self._convert_to_list(
                    local_explanation["scores"])
                if np.shape(local_feature_importance.scores)[-1] > 1000:
                    raise ValueError("Exceeds maximum number of features for "
                                     "visualization (1000). Please regenerate"
                                     " the explanation using fewer features.")
                local_feature_importance.intercept = self._convert_to_list(
                    local_explanation["intercept"])
                # We can ignore perf explanation data.
                # Note if it is added back at any point,
                # the numpy values will need to be converted to python,
                # otherwise serialization fails.
                local_explanation["perf"] = None
                interpretation.precomputedExplanations.localFeatureImportance\
                    = local_feature_importance
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported local explanation type,"
                    "inner error: {}".format(ex_str))
            if self._analysis.test is not None:
                local_dim = np.shape(local_feature_importance.scores)
                if len(local_dim) != 2 and len(local_dim) != 3:
                    raise ValueError(
                        "Local explanation expected to be a 2D or 3D list")
                if (len(local_dim) == 2 and
                    (local_dim[1] != self._feature_length or
                     local_dim[0] != self._row_length)):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        "length differs from dataset")
                if(len(local_dim) == 3 and
                   (local_dim[2] != self._feature_length or
                        local_dim[1] != self._row_length)):
                    raise ValueError(
                        "Shape mismatch: local explanation"
                        " length differs from dataset")
        if global_explanation is not None:
            try:
                global_feature_importance = FeatureImportance()
                global_feature_importance.scores = self._convert_to_list(
                    global_explanation["scores"])
                if 'intercept' in global_explanation:
                    global_feature_importance.intercept\
                        = self._convert_to_list(
                            global_explanation["intercept"])
                interpretation.precomputedExplanations.globalFeatureImportance\
                    = global_explanation
            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError("Unsupported global explanation type,"
                                 "inner error: {}".format(ex_str))
        if ebm_explanation is not None:
            try:
                ebm_feature_importance = EBMGlobalExplanation()
                ebm_feature_importance.feature_list\
                    = ebm_explanation["feature_list"]
                interpretation.precomputedExplanations.ebmGlobalExplanation\
                    = ebm_feature_importance

            except Exception as ex:
                ex_str = _format_exception(ex)
                raise ValueError(
                    "Unsupported ebm explanation type: {}".format(ex_str))
        return interpretation

    def _get_error_analysis(self, report):
        error_analysis = ErrorAnalysisConfig()
        error_analysis.maxDepth = report[ErrorAnalysisManagerKeys.MAX_DEPTH]
        error_analysis.numLeaves = report[ErrorAnalysisManagerKeys.NUM_LEAVES]
        return error_analysis

    def _get_causal(self, causal):
        causal_data = CausalData()
        causal_data.globalCausalEffects = causal["global_effects"]\
            .reset_index().to_dict(orient="records")
        causal_data.localCausalEffects = causal["local_effects"]\
            .groupby("sample").apply(
                lambda x: x.reset_index().to_dict(
                    orient='records')).values
        return causal_data

    def _get_counterfactual(self, counterfactual):
        counterfactual_data = CounterfactualData()
        json_data = json.loads(counterfactual.to_json())
        counterfactual_data.cfsList = json_data["cfs_list"]
        counterfactual_data.featureNames = json_data[
            "feature_names_including_target"]
        return counterfactual_data

    def _convert_to_list(self, array):
        if issparse(array):
            if array.shape[1] > 1000:
                raise ValueError("Exceeds maximum number of features"
                                 " for visualization (1000). Please regenerate"
                                 " the explanation using fewer features"
                                 " or initialize the dashboard without passing"
                                 " a dataset.")
            return array.toarray().tolist()
        if (isinstance(array, pd.DataFrame)):
            return array.values.tolist()
        if (isinstance(array, pd.Series)):
            return array.values.tolist()
        if (isinstance(array, np.ndarray)):
            return array.tolist()
        if (isinstance(array, pd.Index)):
            return array.tolist()
        return array

    def _find_first_explanation(self, key, mli_explanations):
        if mli_explanations is None:
            return None
        new_array = [explanation for explanation
                     in mli_explanations
                     if explanation[
                         ExplanationDashboardInterface.MLI_EXPLANATION_TYPE_KEY
                     ] == key]
        if len(new_array) > 0:
            return new_array[0]["value"]
        return None

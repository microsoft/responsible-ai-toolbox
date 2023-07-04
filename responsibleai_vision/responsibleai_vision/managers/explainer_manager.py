# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

"""Defines the Explainer Manager class."""

import base64
import io
import json
import pickle
import warnings
from pathlib import Path
from typing import Any, List, Optional

import cv2
import matplotlib.pyplot as pl
import numpy as np
import pandas as pd
import shap
from ml_wrappers import wrap_model
from ml_wrappers.common.constants import Device
from ml_wrappers.model.image_model_wrapper import (MLflowDRiseWrapper,
                                                   PytorchDRiseWrapper)
from PIL import Image, ImageDraw, ImageFont
from shap.plots import colors
from shap.utils._legacy import kmeans
from vision_explanation_methods.DRISE_runner import get_drise_saliency_map

from responsibleai._interfaces import ModelExplanationData
from responsibleai._internal.constants import ExplainerManagerKeys as Keys
from responsibleai._internal.constants import (ListProperties, ManagerNames,
                                               Metadata)
from responsibleai._tools.shared.state_directory_management import \
    DirectoryManager
from responsibleai.exceptions import UserConfigValidationException
from responsibleai.managers.base_manager import BaseManager
from responsibleai_vision.common.constants import (CommonTags,
                                                   ExplainabilityDefaults,
                                                   ExplainabilityLiterals,
                                                   MLFlowSchemaLiterals,
                                                   ModelTask,
                                                   XAIPredictionLiterals)
from responsibleai_vision.utils.image_reader import (
    get_base64_string_from_path, get_image_from_path, is_automl_image_model)

IS_RUN = 'is_run'
IS_ADDED = 'is_added'
CLASSES = 'classes'
U_EVALUATION_EXAMPLES = '_evaluation_examples'
FEATURES = 'features'
META_JSON = Metadata.META_JSON
MODEL = Metadata.MODEL
EXPLANATION = '_explanation'
TASK_TYPE = 'task_type'
_MAX_EVALS = '_max_evals'
_NUM_MASKS = '_num_masks'
_MASK_RES = '_mask_res'
_DEVICE = '_device'
DEFAULT_MAX_EVALS = ExplainabilityDefaults.DEFAULT_MAX_EVALS
DEFAULT_MASK_RES = ExplainabilityDefaults.DEFAULT_MASK_RES
DEFAULT_NUM_MASKS = ExplainabilityDefaults.DEFAULT_NUM_MASKS


class ExplainerManager(BaseManager):

    """Defines the ExplainerManager for explaining an image-based model."""

    def __init__(self, model: Any,
                 evaluation_examples: pd.DataFrame,
                 target_column: str,
                 task_type: str,
                 classes: Optional[List] = None,
                 image_mode: str = None,
                 max_evals: Optional[int] = DEFAULT_MAX_EVALS,
                 num_masks: Optional[int] = DEFAULT_NUM_MASKS,
                 mask_res: Optional[int] = DEFAULT_MASK_RES,
                 device: Optional[str] = Device.AUTO.value):
        """Creates an ExplainerManager object.

        :param model: The model to explain.
            A model that implements sklearn.predict or sklearn.predict_proba
            or function that accepts a 2d ndarray.
        :type model: object
        :param evaluation_examples: A matrix of feature vector
            examples (# examples x # features) on which to explain the
            model's output, with an additional label column.
        :type evaluation_examples: pandas.DataFrame
        :param target_column: The name of the label column.
        :type target_column: str
        :param task_type: The task to run.
        :type task_type: str
        :param classes: Class names as a list of strings.
            The order of the class names should match that of the model
            output. Only required if explaining classifier.
        :type classes: list
        :param image_mode: The mode to open the image in.
            See pillow documentation for all modes:
            https://pillow.readthedocs.io/en/stable/handbook/concepts.html
        :type image_mode: str
        :param max_evals: The maximum number of evaluations to run.
            Used by shap hierarchical image explainer.
            If not specified defaults to 100.
        :type max_evals: int
        :param num_masks: The number of masks to use for the
            DRISE image explainer for object detection.
            If not specified defaults to 50.
        :type num_masks: int
        :param mask_res: The resolution of the masks to use for the
            DRISE image explainer for object detection.
            If not specified defaults to 4.
        :type mask_res: int
        :param device: The device to run the model on.
            If not specified defaults to Device.AUTO.
        :type device: str
        """
        self._image_mode = image_mode
        if task_type == ModelTask.OBJECT_DETECTION:
            if is_automl_image_model(model):
                self._model = MLflowDRiseWrapper(model._model, classes)
            else:
                self._model = PytorchDRiseWrapper(
                    model._model, len(classes), device=device)
        else:
            self._model = model
        self._target_column = target_column
        if not isinstance(target_column, list):
            target_column = [target_column]
        self._evaluation_examples = \
            evaluation_examples.drop(columns=target_column)
        self._is_run = False
        self._is_added = False
        self._features = list(self._evaluation_examples.columns)
        self._classes = classes
        self._explanation = None
        self._task_type = task_type
        self._max_evals = max_evals
        self._num_masks = num_masks
        self._mask_res = mask_res
        self._device = device

    def add(self):
        """Add an explainer to be computed later."""
        if self._model is None:
            raise UserConfigValidationException(
                'Model is required for model explanations')

        if self._is_added:
            warnings.warn(("DUPLICATE-EXPLAINER-CONFIG: Ignoring. "
                           "Explanation has already been added, "
                           "currently limited to one explainer type."),
                          UserWarning)
            return
        self._is_added = True

    def compute(self, **kwargs):
        """Creates an explanation by running the explainer on the model."""
        if not self._is_added:
            return
        if self._is_run:
            return
        self._explanation = []
        if self._is_classification_task:
            for i in range(len(self._evaluation_examples)):
                self._explanation.append(
                    self.compute_single_explanation(i, **kwargs)
                )
        elif self._is_object_detection_task:
            for i in range(len(self._evaluation_examples)):
                self._explanation.append(
                    self.compute_single_explanation(i, object_index=None)
                )
        else:
            raise ValueError('Unknown task type: {}'.format(self._task_type))

        self._is_run = True

    def compute_single_explanation(self,
                                   index,
                                   max_evals=None,
                                   object_index=0,
                                   **kwargs):
        """Creates an explanation for a single image in the dataset

        :param index: The index of the image to create the explanation for
        :type index: int
        :param max_evals: the maximum number of evalutions
        :type max_evals: int
        :param object_index: The index of the object within the image we are
        looking to create the explanation for. Note that saliency maps are
        created one object per image. The default value for this is 0 to
        ensure a modular development process (so this function won't fail
        without an updated frontend). This parameter is only for the object
        detection scenario using the DRISE functionality.
        :type object_index: Optional[int]
        :return: The explanation for the image, which is a saliency map.
            For object detection, this can be a list of saliency maps if
            object index is not specified.
        :rtype: str or list[str]
        """
        if max_evals is None:
            # if not specified use global max_evals value
            max_evals = self._max_evals
        self.automl_image_model = is_automl_image_model(self._model)
        if self.automl_image_model:
            # get xai algorithm name
            xai_algo_name = kwargs.get(
                ExplainabilityLiterals.XAI_ALGORITHM,
                ExplainabilityDefaults.XAI_ALGORITHM
            )
        else:
            xai_algo_name = ExplainabilityLiterals.SHAP

        if not self._is_added:
            self.add()
        if index < 0 or index > len(self._evaluation_examples) - 1:
            raise ValueError('Index out of range')
        if self._explanation is not None and index < len(self._explanation):
            if self._task_type == ModelTask.OBJECT_DETECTION:
                return self._explanation[index][object_index]
            else:
                return self._explanation[index]
        if self._is_classification_task:
            ex = self._evaluation_examples
            image = ex.iloc[index:index + 1, 0].values[0]
            if isinstance(image, str):
                if not self.automl_image_model:
                    image = get_image_from_path(image, self._image_mode)
            if xai_algo_name == ExplainabilityLiterals.SHAP:
                if not self.automl_image_model:
                    explanation = self.get_shap_explanations(image, max_evals)
                    return self.image(explanation, 0)
                else:
                    raise ValueError(
                        '{} is not supported for the model type: {}'.format(
                            xai_algo_name, type(self._model)
                        )
                    )
            else:
                if self.automl_image_model:
                    visualization = self.get_automl_explanations(
                        image, xai_algo_name, **kwargs
                    )
                    return visualization
                else:
                    raise ValueError(
                        '{} is not supported for the model type: {}'.format(
                            xai_algo_name, type(self._model)
                        )
                    )
        if self._is_object_detection_task:
            ex = self._evaluation_examples
            img = ex.iloc[index:index + 1, 0].values[0]
            try:
                if (type(self._model) is not MLflowDRiseWrapper and
                   type(self._model) is not PytorchDRiseWrapper):
                    if is_automl_image_model(self._model):
                        self._model = MLflowDRiseWrapper(self._model._model,
                                                         self._classes)
                    else:
                        self._model = PytorchDRiseWrapper(self._model._model,
                                                          len(self._classes),
                                                          self._device)

                # calling DRISE to generate saliency maps for all objects
                mask_res_tuple = (self._mask_res, self._mask_res)
                device = self._device
                # get_drise_saliency_map only recognizes GPU and CPU
                if device == Device.AUTO.value:
                    device = None
                fl, _, _, = get_drise_saliency_map(img,
                                                   self._model,
                                                   len(self._classes),
                                                   savename=str(index),
                                                   nummasks=self._num_masks,
                                                   maskres=mask_res_tuple,
                                                   devicechoice=device,
                                                   max_figures=5000)
                if object_index is None:
                    return fl
                b64_string = fl[object_index]
            except BaseException:
                if object_index is None:
                    return [self._get_fail_str()]
                b64_string = self._get_fail_str()
            return b64_string
        else:
            raise ValueError('Unknown task type: {}'.format(self._task_type))

    def get_shap_explanations(self, image, max_evals):
        """Generates an explanation using shap method.

        :param image: Input image in numpy format
        :type image: numpy.ndarray
        :param max_evals: Max evaluations needed for shap explainer
        :type max_evals: int
        :return: The computed explanation
        :rtype: numpy.array
        """
        masker = shap.maskers.Image('inpaint_telea', image.shape)
        explainer = shap.Explainer(self._model.predict_proba,
                                   masker,
                                   output_names=self._classes)
        image_shape = list(image.shape)
        image_shape.insert(0, -1)
        image = image.reshape(tuple(image_shape))
        exp = shap.Explanation
        explanation = explainer(image, max_evals=max_evals,
                                outputs=exp.argsort.flip[:4])
        return explanation

    def get_automl_explanations(self, image, xai_algo_name, **kwargs):
        """Generates an explanation using automl images XAI methods.

        :param image: Input image path
        :type image: str
        :param xai_algo_name: Input xai algorithm name
        :type xai_algo_name: str
        :return: The computed explanation
        :rtype: base64 string
        """
        model_explainability = True
        xai_parameters = {
            ExplainabilityLiterals.XAI_ALGORITHM: xai_algo_name,
            XAIPredictionLiterals.VISUALIZATIONS_KEY_NAME: True,
            XAIPredictionLiterals.ATTRIBUTIONS_KEY_NAME: False,
        }
        xai_parameters.update(kwargs)
        image_df = pd.DataFrame(
            data=[
                json.dumps(
                    {
                        MLFlowSchemaLiterals.INPUT_IMAGE_KEY:
                        get_base64_string_from_path(image),

                        ExplainabilityLiterals.MODEL_EXPLAINABILITY:
                        model_explainability,

                        ExplainabilityLiterals.XAI_PARAMETERS: xai_parameters,
                    }
                )
            ],
            columns=[MLFlowSchemaLiterals.INPUT_COLUMN_IMAGE],
        )

        response_df = self._model._mlflow_predict(image_df)
        visualization, _ = response_df.loc[
            0,
            [
                XAIPredictionLiterals.VISUALIZATIONS_KEY_NAME,
                XAIPredictionLiterals.ATTRIBUTIONS_KEY_NAME,
            ],
        ].values

        return visualization

    def image(self, explanation, index):
        """ Plots SHAP values for image inputs.

        :param explanation: Computed explanation
        :type explanation: numpy.array
        :param index: Index value
        :type index: int
        :return: The computed explanation
        :rtype: base64 string
        """
        width = 20
        aspect = 0.2
        hspace = 0.2
        labelpad = None

        shap_exp = explanation[index]
        shap_values = shap_exp.values
        shape_len = range(shap_values.shape[-1])
        if len(shap_exp.output_dims) == 1:
            shap_values = [shap_values[..., i] for i in shape_len]
        elif len(shap_exp.output_dims) == 0:
            shap_values = shap_exp.values
        else:
            raise Exception('Number of outputs needs to have support added')

        pixel_values = shap_exp.data
        labels = shap_exp.output_names

        multi_output = True
        if not isinstance(shap_values, list):
            multi_output = False
            shap_values = [shap_values]

        if len(shap_values[0].shape) == 3:
            shap_values = [v.reshape(1, *v.shape) for v in shap_values]
            pixel_values = pixel_values.reshape(1, *pixel_values.shape)

        # make sure labels
        if labels is not None:
            labels = np.array(labels)
            if (labels.shape[0] != shap_values[0].shape[0] and
               labels.shape[0] == len(shap_values)):
                labels = np.tile(np.array([labels]), shap_values[0].shape[0])
            assert labels.shape[0] == shap_values[0].shape[0], \
                "Labels must have same row count as shap_values arrays"
            if multi_output:
                assert labels.shape[1] == len(shap_values), \
                    "Labels must have a column for each output in shap_values"
            else:
                assert len(labels.shape) == 1, \
                    "Labels must be a vector for single output shap_values"

        label_kwargs = {} if labelpad is None else {'pad': labelpad}

        # plot our explanations
        x = pixel_values
        fig_size = np.array([3 * (len(shap_values) + 1),
                            2.5 * (x.shape[0] + 1)])
        if fig_size[0] > width:
            fig_size *= width / fig_size[0]
        fig, axes = pl.subplots(nrows=x.shape[0],
                                ncols=len(shap_values) + 1,
                                figsize=fig_size)
        if len(axes.shape) == 1:
            axes = axes.reshape(1, axes.size)
        for row in range(x.shape[0]):
            x_curr = x[row].copy()

            # make sure we have a 2D array for grayscale
            if len(x_curr.shape) == 3 and x_curr.shape[2] == 1:
                x_curr = x_curr.reshape(x_curr.shape[:2])
            if x_curr.max() > 1:
                try:
                    x_curr /= 255.
                except Exception:
                    # In-place divide can fail for certain types
                    x_curr = x_curr / 255.

            # get a grayscale version of the image
            if len(x_curr.shape) == 3 and x_curr.shape[2] == 3:
                x_curr_gray = (0.2989 * x_curr[:, :, 0] +
                               0.5870 * x_curr[:, :, 1] +
                               0.1140 * x_curr[:, :, 2])  # rgb to gray
                x_curr_disp = x_curr
            elif len(x_curr.shape) == 3:
                x_curr_gray = x_curr.mean(2)

                # for non-RGB multi-channel data
                flat_vals = x_curr.reshape([x_curr.shape[0] * x_curr.shape[1],
                                            x_curr.shape[2]]).T
                flat_vals = (flat_vals.T - flat_vals.mean(1)).T
                means = kmeans(flat_vals, 3, round_values=False)
                means = means.data.T.reshape([x_curr.shape[0],
                                              x_curr.shape[1], 3])
                x_curr_disp = ((means - np.percentile(means, 0.5, (0, 1))) /
                               (np.percentile(means, 99.5, (0, 1)) -
                                np.percentile(means, 1, (0, 1))))
                x_curr_disp[x_curr_disp > 1] = 1
                x_curr_disp[x_curr_disp < 0] = 0
            else:
                x_curr_gray = x_curr
                x_curr_disp = x_curr

            axes[row, 0].imshow(x_curr_disp, cmap=pl.get_cmap('gray'))
            axes[row, 0].axis('off')
            s_vals = shap_values
            s_range = range(len(s_vals))
            if len(shap_values[0][row].shape) == 2:
                abs_vals = np.stack([np.abs(s_vals[i]) for i in s_range], 0)
            else:
                abs_vals = np.stack([np.abs(s_vals[i].sum(-1))
                                     for i in s_range], 0)
            abs_vals = abs_vals.flatten()
            max_val = np.nanpercentile(abs_vals, 99.9)
            for i in s_range:
                if labels is not None:
                    axes[row, i + 1].set_title(labels[row, i], **label_kwargs)
                sv = (s_vals[i][row]
                      if len(s_vals[i][row].shape) == 2
                      else s_vals[i][row].sum(-1))
                axes[row, i + 1].imshow(x_curr_gray, cmap=pl.get_cmap('gray'),
                                        alpha=0.15,
                                        extent=(-1, sv.shape[1],
                                        sv.shape[0], -1))
                im = axes[row, i + 1].imshow(sv,
                                             cmap=colors.red_transparent_blue,
                                             vmin=-max_val,
                                             vmax=max_val)
                axes[row, i + 1].axis('off')
        if hspace == 'auto':
            fig.tight_layout()
        else:
            fig.subplots_adjust(hspace=hspace)
        cb = fig.colorbar(im,
                          ax=np.ravel(axes).tolist(),
                          label='SHAP value',
                          orientation='horizontal',
                          aspect=fig_size[0] / aspect)
        cb.outline.set_visible(False)
        s = io.BytesIO()
        pl.savefig(s, format='jpg')
        s.seek(0)
        b64 = base64.b64encode(s.read())
        b64 = b64.decode(CommonTags.IMAGE_DECODE_UTF_FORMAT)
        pl.clf()
        return b64

    def get(self):
        """Get the computed explanation.

        Must be called after add and compute methods.

        :return: The computed explanations.
        :rtype:
            list[interpret_community.explanation.explanation.BaseExplanation]
        """
        if self._explanation:
            return [self._explanation]
        else:
            return []

    def list(self):
        """List information about the ExplainerManager.

        :return: A dictionary of properties.
        :rtype: dict
        """
        props = {ListProperties.MANAGER_TYPE: self.name}
        if self._explanation:
            props[Keys.IS_COMPUTED] = True
        else:
            props[Keys.IS_COMPUTED] = False
        return props

    def get_data(self):
        """Get explanation data

        :return: A array of ModelExplanationData.
        :rtype: List[ModelExplanationData]
        """
        return [self._get_interpret(i) for i in self.get()]

    def _get_interpret(self, explanation):
        interpretation = ModelExplanationData()
        return interpretation

    @property
    def name(self):
        """Get the name of the explainer manager.

        :return: The name of the explainer manager.
        :rtype: str
        """
        return ManagerNames.EXPLAINER

    @property
    def _is_multilabel_task(self):
        """Check if the task is a multilabel classification task.

        :return: True if the task is a multilabel classification task.
        :rtype: bool
        """
        return self._task_type == ModelTask.MULTILABEL_IMAGE_CLASSIFICATION

    @property
    def _is_classification_task(self):
        """Check if the task is a classification task.

        :return: True if the task is a classification task.
        :rtype: bool
        """
        is_onelabel_task = self._task_type == ModelTask.IMAGE_CLASSIFICATION
        is_multilabel_task = self._is_multilabel_task
        return is_onelabel_task or is_multilabel_task

    @property
    def _is_object_detection_task(self):
        """Check if the task is an object detection task.

        :return: True if the task is an object detection task.
        :rtype: bool
        """
        return self._task_type == ModelTask.OBJECT_DETECTION

    def _get_fail_str(self):
        fail = Image.new('RGB', (100, 100))
        draw = ImageDraw.Draw(fail)
        font = ImageFont.load_default()
        text = "saliency map could not be created"
        textwidth, textheight = draw.textsize(text, font)
        x = (fail.width - textwidth) // 2
        y = (fail.height - textheight) // 2
        draw.text((x, y), text, fill="white", font=font)
        fail.show()
        fail.save('fail.jpg')
        image = get_image_from_path("fail.jpg", "RGB")
        jpg_img = cv2.imencode('.jpg', image)
        return base64.b64encode(jpg_img[1]).decode('utf-8')

    def _save(self, path):
        """Save the ExplainerManager to the given path.

        :param path: The directory path to save the ExplainerManager to.
        :type path: str
        """
        top_dir = Path(path)
        top_dir.mkdir(parents=True, exist_ok=True)
        if self._is_added:
            directory_manager = DirectoryManager(parent_directory_path=path)
            data_directory = directory_manager.create_data_directory()

            # save the explanation
            if self._explanation:
                with open(data_directory / ManagerNames.EXPLAINER, 'wb') as f:
                    pickle.dump(self._explanation, f, protocol=4)

            meta = {IS_RUN: self._is_run,
                    IS_ADDED: self._is_added}
            with open(data_directory / META_JSON, 'w') as file:
                json.dump(meta, file)

    @staticmethod
    def _load(path, rai_insights):
        """Load the ExplainerManager from the given path.

        :param path: The directory path to load the ExplainerManager from.
        :type path: str
        :param rai_insights: The loaded parent RAIInsights.
        :type rai_insights: RAIInsights
        :return: The ExplainerManager manager after loading.
        :rtype: ExplainerManager
        """
        # create the ExplainerManager without any properties using the __new__
        # function, similar to pickle
        inst = ExplainerManager.__new__(ExplainerManager)

        all_cf_dirs = DirectoryManager.list_sub_directories(path)
        if len(all_cf_dirs) != 0:
            directory_manager = DirectoryManager(
                parent_directory_path=path,
                sub_directory_name=all_cf_dirs[0])
            data_directory = directory_manager.get_data_directory()

            with open(data_directory / META_JSON, 'r') as meta_file:
                meta = meta_file.read()
            meta = json.loads(meta)
            inst.__dict__['_' + IS_RUN] = meta[IS_RUN]
            inst.__dict__['_' + IS_ADDED] = meta[IS_ADDED]

            inst.__dict__[EXPLANATION] = None
            explanation_path = data_directory / ManagerNames.EXPLAINER
            if explanation_path.exists():
                with open(explanation_path, 'rb') as f:
                    explanation = pickle.load(f)
                inst.__dict__[EXPLANATION] = explanation
        else:
            inst.__dict__['_' + IS_RUN] = False
            inst.__dict__['_' + IS_ADDED] = False
            inst.__dict__[EXPLANATION] = None

        wrapped_model = wrap_model(rai_insights.model, rai_insights.test,
                                   rai_insights.task_type,
                                   classes=rai_insights._classes,
                                   device=rai_insights.device)
        inst.__dict__['_' + MODEL] = wrapped_model
        inst.__dict__['_' + CLASSES] = rai_insights._classes
        inst.__dict__[_MAX_EVALS] = rai_insights.max_evals
        inst.__dict__[_NUM_MASKS] = rai_insights.num_masks
        inst.__dict__[_MASK_RES] = rai_insights.mask_res
        inst.__dict__[_DEVICE] = rai_insights.device
        target_column = rai_insights.target_column
        if not isinstance(target_column, list):
            target_column = [target_column]
        test = rai_insights.test.drop(columns=target_column)
        inst.__dict__[U_EVALUATION_EXAMPLES] = test
        inst.__dict__['_' + FEATURES] = list(test.columns)
        inst.__dict__['_' + TASK_TYPE] = rai_insights.task_type

        return inst

# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os
import nbformat as nbf
import papermill as pm
import pytest
import scrapbook as sb


RACE_GROUP_SIZES_ADULT = {
    'White': 41762,
    'Black': 4685,
    'Asian-Pac-Islander': 1519,
    'Amer-Indian-Eskimo': 470,
    'Other': 406
}


class ScrapSpec:
    def __init__(self, code, expected):
        self.code = code
        self.expected = expected

    @property
    def code(self):
        """The code to be inserted (string)."""  # noqa:D401
        return self._code

    @code.setter
    def code(self, value):
        self._code = value

    @property
    def expected(self):
        """The expected evaluation of the code (Python object)."""  # noqa:D401
        return self._expected

    @expected.setter
    def expected(self, value):
        self._expected = value


def append_scrapbook_commands(input_nb_path, output_nb_path, scrap_specs):
    notebook = nbf.read(input_nb_path, as_version=nbf.NO_CONVERT)

    scrapbook_cells = []
    # Always need to import nteract-scrapbook
    scrapbook_cells.append(
        nbf.v4.new_code_cell(source="import scrapbook as sb"))

    # Create a cell to store each key and value in the scrapbook
    for k, v in scrap_specs.items():
        source = "sb.glue(\"{0}\", {1})".format(k, v.code)
        scrapbook_cells.append(nbf.v4.new_code_cell(source=source))

    # Append the cells to the notebook
    [notebook['cells'].append(c) for c in scrapbook_cells]

    # Write out the new notebook
    nbf.write(notebook, output_nb_path)


def assay_one_notebook(notebook_name, test_values):
    """Test a single notebook.

    This uses nbformat to append `nteract-scrapbook` commands to the
    specified notebook. The content of the commands and their expected
    values are stored in the `test_values` dictionary. The keys of this
    dictionary are strings to be used as scrapbook keys. They corresponding
    value is a `ScrapSpec` tuple. The `code` member of this tuple is
    the code (as a string) to be run to generate the scrapbook value. The
    `expected` member is a Python object which is checked for equality with
    the scrapbook value

    Makes certain assumptions about directory layout.
    """
    processed_dir_name = "./notebooks/processed/"

    if not os.path.exists(processed_dir_name):
        os.makedirs(processed_dir_name)

    input_notebook = "notebooks/" + notebook_name + ".ipynb"
    processed_notebook = f"{processed_dir_name}{notebook_name}.processed.ipynb"
    output_notebook = f"{processed_dir_name}{notebook_name}.output.ipynb"

    append_scrapbook_commands(input_notebook, processed_notebook, test_values)
    pm.execute_notebook(processed_notebook, output_notebook)
    nb = sb.read_notebook(output_notebook)

    for k, v in test_values.items():
        assert nb.scraps[k].data == v.expected


@pytest.mark.notebooks
def test_fairness_dashboard_loan_allocation():
    nb_name = "fairness-dashboard-loan-allocation"

    test_values = {}

    test_values["race_group_sizes"] = ScrapSpec(
        "X_raw['race'].value_counts().to_dict()",
        RACE_GROUP_SIZES_ADULT
    )

    test_values["dominant_models"] = ScrapSpec(
        "list(dominant_all.keys())",
        [
            'unmitigated', 'grid_28', 'grid_29', 'grid_30', 'grid_31',
            'grid_32', 'grid_33', 'grid_34', 'grid_35'
        ])

    assay_one_notebook(nb_name, test_values)


@pytest.mark.notebooks
def test_fairness_interpretability_dashboard_loan_allocation():
    nb_name = "fairness-interpretability-dashboard-loan-allocation"

    test_values = {}

    test_values["race_group_sizes"] = ScrapSpec(
        "X_raw['race'].value_counts().to_dict()",
        RACE_GROUP_SIZES_ADULT
    )

    test_values["local_explanation_feature_names"] = ScrapSpec(
        "sorted_local_importance_names[0]",
        [
            'marital-status', 'occupation', 'hours-per-week', 'age',
            'capital-gain', 'capital-loss', 'education', 'workclass',
            'native-country', 'race', 'fnlwgt', 'relationship', 'sex',
            'education-num'
        ]
    )

    test_values["dominant_models"] = ScrapSpec(
        "list(dominant_all.keys())",
        [
            'unmitigated', 'grid_29', 'grid_30', 'grid_31', 'grid_32',
            'grid_33', 'grid_34', 'grid_35'
        ])

    assay_one_notebook(nb_name, test_values)


@pytest.mark.notebooks
def test_interpretability_dashboard_employee_attrition():
    nb_name = "interpretability-dashboard-employee-attrition"

    test_values = {}
    assay_one_notebook(nb_name, test_values)


@pytest.mark.notebooks
def test_erroranalysis_interpretability_dashboard_census():
    nb_name = "erroranalysis-interpretability-dashboard-census"

    test_values = {}
    assay_one_notebook(nb_name, test_values)


@pytest.mark.notebooks
def test_erroranalysis_interpretability_dashboard_breast_cancer():
    nb_name = "erroranalysis-interpretability-dashboard-breast-cancer"

    test_values = {}
    assay_one_notebook(nb_name, test_values)

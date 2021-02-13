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
    test_values["accuracies"] = ScrapSpec(
        "accuracies",
        [
            0.4704271491822998, 0.47377984797686384, 0.4780794922324879,
            0.4830189645023418, 0.48770250556650374, 0.4931794333683106,
            0.4992194098226397, 0.5056432830855067, 0.5121439357100811,
            0.5185678089729481, 0.5252476134415069, 0.5322089422363269,
            0.5398868784070842, 0.548307015074348, 0.5565735930181968,
            0.5649425434443222, 0.5752821641542754, 0.5875156757863487,
            0.6018734164256648, 0.6316126225270647, 0.6554910040181199,
            0.6741483889130602, 0.6955186445883347, 0.7164538172139329,
            0.7394876257262047, 0.7708903846646021, 0.8072326158728533,
            0.8235098405548589, 0.8308550661582167, 0.8356409797046553,
            0.8409899419036163, 0.8448545031095641, 0.8486166918332352,
            0.8510224451667392, 0.852609218642029, 0.8527883704860134,
            0.8527627773654441, 0.8507921070816165, 0.849256519847465,
            0.8461853453791621, 0.8412970593504466, 0.8360760627543317,
            0.8282957541012975, 0.8193893481432191, 0.8091009136744043,
            0.7985053617587592, 0.788549637857344, 0.7781076446651141,
            0.7669746372175159, 0.7551762086351189, 0.7442735392726435,
            0.7341898497683823, 0.725181071328027, 0.7193202467176822,
            0.7137665395541678, 0.7075218181352853, 0.6989481227446063,
            0.6887108745169298, 0.6791390474240524, 0.6718194149412637,
            0.6656258797635196, 0.6609167455787884, 0.6557981214649502,
            0.6521383052235559, 0.6494766206843601, 0.6475315435211015,
            0.6458168044429657, 0.6437949479179996, 0.6423361400455557,
            0.6410564840170963
        ]
    )
    test_values["disparities"] = ScrapSpec(
        "disparities",
        [
            0.6848116395126026, 0.6825511736030443, 0.6791310191272215,
            0.6746277662892471, 0.6706263418060066, 0.6656195497441556,
            0.6609156967604707, 0.6562501388788423, 0.6509278613651117,
            0.6442961366151764, 0.6371248586981652, 0.629565497153161,
            0.6203486107151586, 0.6100452041767191, 0.5992799752547451,
            0.5887079327121962, 0.5734999873531607, 0.5553209921457218,
            0.5337121475373177, 0.48467465769615714, 0.44120706634460954,
            0.4067860723314105, 0.3657314713167322, 0.3192247942583823,
            0.26568559106598905, 0.18127469088524567, 0.08486487738712047,
            0.0356361395605897, 0.008303388691030839, 0.01674999101719829,
            0.0436906662307644, 0.06909611562378704, 0.09610425640603777,
            0.12180637169036945, 0.14731073827756197, 0.17242930239561868,
            0.19731011184533692, 0.22457548283741174, 0.25136477420309544,
            0.2797670221728641, 0.30696615386688336, 0.33596629593698424,
            0.36691321502510693, 0.397088529174958, 0.42983931008773363,
            0.45646181978324973, 0.4826996675890586, 0.5078646822475726,
            0.5308457355094407, 0.5529488528725819, 0.5712950582061912,
            0.5876121934205232, 0.6011640972307913, 0.6098182200058341,
            0.6192416665602914, 0.6272402102826604, 0.6370260774279686,
            0.6496086276028259, 0.6616973334789493, 0.6701462937905674,
            0.6758345850158357, 0.6814954166436187, 0.6858828149783964,
            0.6893185386589055, 0.6922987131427372, 0.6931320807525508,
            0.6938894284479658, 0.6952983631680545, 0.6971348171976212,
            0.6981647929251453
        ]
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
    test_values["global_explanation_feature_importances"] = ScrapSpec(
        "global_explanation.get_feature_importance_dict()",
        {
            'marital-status': 1.3551568632448603,
            'education-num': 0.5845953756316911,
            'capital-gain': 0.34329537262655013,
            'occupation': 0.2558973161276488,
            'age': 0.20699697677114032,
            'hours-per-week': 0.19817890519457287,
            'relationship': 0.19625124690436996,
            'sex': 0.17679013092665619,
            'capital-loss': 0.09513711902053526,
            'workclass': 0.05915969829159882,
            'race': 0.03963394518659944,
            'native-country': 0.037249329798364816,
            'fnlwgt': 0.03276143204151372,
            'education': 0.007603300780866324
        }
    )
    test_values["local_explanation_feature_importances"] = ScrapSpec(
        "sorted_local_importance_values[0]",
        [
            1.3558894814267013,
            0.7697103843087915,
            0.3553867570296758,
            0.24572952584066943,
            0.2222962785192042,
            0.05630382413459738,
            0.01995133337382276,
            -0.0036970726445150885,
            -0.016442321277371046,
            -0.02054896489696156,
            -0.07601526553800697,
            -0.1705289997515244,
            -0.17358268874305868,
            -0.9231412456472325
        ]
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
    test_values["accuracies"] = ScrapSpec(
        "accuracies",
        [
            0.5018810943618356, 0.5018810943618356, 0.5018810943618356,
            0.5018810943618356, 0.5018810943618356, 0.5018810943618356,
            0.5018810943618356, 0.5018810943618356, 0.5018810943618356,
            0.5018810943618356, 0.5018810943618356, 0.5018810943618356,
            0.5018810943618356, 0.5018810943618356, 0.5018810943618356,
            0.5018810943618356, 0.5018810943618356, 0.5018810943618356,
            0.5133468123768331, 0.5213062728738516, 0.5279604842218412,
            0.5327975840094182, 0.5370204489033348, 0.54160161748522,
            0.5474880352161339, 0.552197169400865, 0.5574949453586876,
            0.7732193586363986, 0.8156527525401173, 0.8296777826120338,
            0.836664704527423, 0.8421416323292299, 0.8459294141734701,
            0.8494100785708801, 0.8511504107695851, 0.8519693906277992,
            0.8515599006986921, 0.8501522790673867, 0.8474394082870524,
            0.8439843370102117, 0.8390704578609269, 0.8332096332505823,
            0.8244311928953497, 0.8151920763698718, 0.8034704271491823,
            0.7918511504107696, 0.7788498451616206, 0.7643385457988893,
            0.7476262380672075, 0.7262815755125023, 0.7015586210426638,
            0.6671358738771018, 0.6074271235891793, 0.49811890563816447,
            0.49811890563816447, 0.49811890563816447, 0.49811890563816447,
            0.49811890563816447, 0.49811890563816447, 0.49811890563816447,
            0.49811890563816447, 0.49811890563816447, 0.49811890563816447,
            0.49811890563816447, 0.49811890563816447, 0.49811890563816447,
            0.49811890563816447, 0.49811890563816447, 0.49811890563816447,
            0.49811890563816447
        ]
    )
    test_values["disparities"] = ScrapSpec(
        "disparities",
        [
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0, 1.0, 0.9827672040745988, 0.9703212959062536,
            0.9594454869222226, 0.9507524987554092, 0.9423658714050474,
            0.932141079155976, 0.9196568758855742, 0.9077088040439628,
            0.8934613152098217, 0.23158803701197975, 0.08321328291617677,
            0.018949169989121356, 0.02101965259723529, 0.05727963887245982,
            0.08868592780285872, 0.12043059946490868, 0.1507097920339569,
            0.1800539340416509, 0.20801032773988454, 0.2366988906949048,
            0.26401632943337905, 0.2919904878039556, 0.32376384533412006,
            0.35590361548313526, 0.3907274645143874, 0.4256942287390085,
            0.46327247366975344, 0.4977449089971269, 0.5300659751327681,
            0.5634975992280463, 0.5996498864384752, 0.6396333947236913,
            0.6842134558351098, 0.7412748687683586, 0.8355602614799025,
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, 1.0
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

![Responsible AI Widgets Python Build](https://github.com/microsoft/responsible-ai-widgets/workflows/Responsible%20AI%20Widgets/badge.svg) ![CD](https://github.com/microsoft/responsible-ai-widgets/workflows/CD/badge.svg) ![MIT license](https://img.shields.io/badge/License-MIT-blue.svg) ![PyPI raiwidgets](https://img.shields.io/pypi/v/raiwidgets?color=blue) ![PyPI rai_core_flask](https://img.shields.io/pypi/v/rai_core_flask?color=blue) ![npm fairness](https://img.shields.io/npm/v/@responsible-ai/fairness?label=npm%20%40responsible-ai%2Ffairness) ![npm interpret](https://img.shields.io/npm/v/@responsible-ai/interpret?label=npm%20%40responsible-ai%2Finterpret) ![npm mlchartlib](https://img.shields.io/npm/v/@responsible-ai/mlchartlib?label=npm%20%40responsible-ai%2Fmlchartlib) ![npm core-ui](https://img.shields.io/npm/v/@responsible-ai/core-ui?label=npm%20%40responsible-ai%2Fcore-ui) ![npm dataset-explorer](https://img.shields.io/npm/v/@responsible-ai/dataset-explorer?label=npm%20%40responsible-ai%2Fdataset-explorer) ![npm causality](https://img.shields.io/npm/v/@responsible-ai/causality?label=npm%20%40responsible-ai%2Fcausality) ![npm counterfactuals](https://img.shields.io/npm/v/@responsible-ai/counterfactuals?label=npm%20%40responsible-ai%2Fcounterfactuals)

# CanvasTools

The Object Detection dashboard supports image loading and bounding box rendering with the CanvasTools-vott library in typescript.

![CanvasTools - boxes](./img/CanvasTools-Boxes.png)

The annotations for smaller boxes are automatically truncated by piggybacking on the exiting functionality.

![CanvasTools - annotations](./img/CanvasTools-Annotations.png)

Compared to FluentUI’s `<Image>` tag for loading the image in the Flyout (utilized for all other image scenarios), CanvasTools has the following advantages:

1. Reusability with Data Labeling team's work, which unlocks loading and overlaying elements on images for CV tasks.

2. Enables drawing bounding boxes in the frontend, which can enable future functionality of filtering/displaying bounding boxes based on user inputs on-the-fly related to error types, classes etc.

3. Piggybacks on CanvasTools' accessibility standards

4. Unlike bounding boxes drawn in the backend using opencv, CanvasTools enables usage of FluentUI color palette references.

5. Higher resolution display

Source Repo - ![microsoft/CanvasTools-for-VOTT: CanvasTools for VOTT (github.com)](https://github.com/microsoft/CanvasTools-for-VOTT)

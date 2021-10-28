# Cognitive Services Examples

This folder provides Jupyter notebooks that demonstrate the usage of Responsible AI tools with Cognitive Services. Combined with [Responsible Use of AI Overview](https://docs.microsoft.com/en-us/azure/cognitive-services/responsible-use-of-ai-overview), these notebooks empower developers and AI system stakeholders to use Cognitive Services more responsibly.


## Face Verification

This folder contains an example notebook of assessing a facial validation system for intersectional performance disparity using `Fairlearn` and the `FairnessDashboard`. The notebook is run using a provided dataset. If you wish to run with assessment using your own data, you can run the `run_face_verify.py` with your dataset to get `matching_scores` from the system.

## Speech to Text

This folder contains an example notebook of assessing a fspeech-to-text system for fairness-related performance disparity using `Fairlearn`. The notebook is run using a provided dataset. If you wish to run with assessment using your own data, you can run the `run_stt.py` with your dataset to get automated transcriptions from the system. Ideally, these automated transcriptions would be evaluated against a human transcriber.

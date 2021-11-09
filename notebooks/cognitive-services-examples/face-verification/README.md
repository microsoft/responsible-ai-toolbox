## Main files
The following files are intended to be used directly, to test the provided sample notebook. 
This quickstart and example 
* **run_face_verify.py** – python script to compare faces in two images and returns the match confidence score for the images, using the [Face SDK](https://docs.microsoft.com/en-us/python/api/azure-cognitiveservices-vision-face/?view=azure-python) for Cognitive Services.
* **analyze_face_verify_fairness.ipynb**– Jupyter Notebook to generate:
  * Fairness comparison table for subgroup with different evaluation metrics: True Positive Rate (Recall), False Positive Rate, False Negative Rate.
  * Interactive fairness dashboard
* **face_verify_sample_rand_data.csv** – sample data representing results generated from the verify run on fairness dataset

## Sample files
The following files are intended to be replaced by the user. They are provided to illustrate how **run_face_verify.py** works. 
*	**golden_labels.csv** - ground truth for testing data (follow data format for your dataset)
*	**testing_data folder**: testing data including two persons with two images/person. 

## Prerequisites
  - [Install Anaconda](https://docs.anaconda.com/anaconda/install/)
  - In Anaconda run: pip install azure-cognitiveservices-vision-face to install Face SDK
      
## Procedures 
* Run face verify API
  * Replace the Subscription Key and regional Base URL in “run_face_verify.py” under “face_verify_demo" directory
  * In Anaconda, run “python run_face_verify.py" under “face_verify_demo" directory
  * Matching results “face_verify_testing_data.csv” will be generated based on “golden_labels.csv” and images in “testing_data” folder

  **Note:** All sample files are provided as examples. Users should replace them with their own testing data, and a corresponding golden_labels CSV files that point to their image file paths. 
  
* Run fairness analysis based on face verify results
  * Replace " face_verify_sample_rand_data.csv" in "analyze_face_verify_fairness.ipynb" under “face_verify_demo" directory with the data you generated from "run_face_verify.py" script. You can also use the default file to show complete fairness analysis on our provided sample data. 
  * In Anaconda, run “jupyter notebook”
  * In the pop-up browser, open “analyze_face_verify_fairness.ipynb" under “face_verify_demo " directory
  * Click “Run” button to run each cell or “>>” button to run the whole notebook.





    
## References
  - [Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/face/)
  - [Face SDK](https://docs.microsoft.com/en-us/python/api/azure-cognitiveservices-vision-face/azure.cognitiveservices.vision.face?view=azure-python)
  - [Face API Reference](https://docs.microsoft.com/en-us/azure/cognitive-services/face/APIReference)
  - [Fairlearn API Reference](https://fairlearn.org/v0.7.0/api_reference/index.html)
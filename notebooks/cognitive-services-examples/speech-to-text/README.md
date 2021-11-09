## Main files
The following files are intended to be used directly, to test the provided sample notebook. 
This quickstart and example 
* **run_stt.py** – python script to generate speech-to-text transcriptions on input audio files, using the [Speech SDK](https://docs.microsoft.com/en-us/python/api/azure-cognitiveservices-speech/azure.cognitiveservices.speech?view=azure-pythonn) for Cognitive Services.
* **analyze_stt_fairness.ipynb**– Jupyter Notebook to generate:
  * Fairness comparison table for different English-speaking countries using the *Word Error Rate*
* **stt_testing_data.csv** – sample speech transcription data representing results generated from the verify run on fairness dataset


## Prerequisites
  - [Install Anaconda](https://docs.anaconda.com/anaconda/install/)
  - In Anaconda run: pip install azure-cognitiveservices-speech-speech to install Speech SDK
      
## Procedures 
* Run Speech API
  * Replace the Subscription Key and regional Base URL in “run_stt.py”.
  * In Anaconda, run “python run_stt.py".
  * Transcription results “stt_testing_data.csv” will be generated based on the ground truth passeage in `speakers_all.csv`.

  **Note:** All sample files are provided as examples. Users should replace them with their own testing data, and a corresponding golden_labels CSV files that point to their image file paths. 
  
* Run fairness analysis based on face verify results
  * Replace " stt_testing_data.csv" in "analyze_stt_fairness.ipynb" with the data you generated from "run_stt.py" script. You can also use the default file to show complete fairness analysis on our provided sample data. 
  * In Anaconda, run `jupyter notebook`
  * In the pop-up browser, open “analyze_stt_fairness.ipynb".
  * Click “Run” button to run each cell or “>>” button to run the whole notebook.





    
## References
  - [Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/)
  - [Speech SDK](https://docs.microsoft.com/en-us/python/api/azure-cognitiveservices-speech/azure.cognitiveservices.speech?view=azure-pythonn)
  - [Speech API Reference](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/APIReference)
  - [Fairlearn API Reference](https://fairlearn.org/v0.7.0/api_reference/index.html)

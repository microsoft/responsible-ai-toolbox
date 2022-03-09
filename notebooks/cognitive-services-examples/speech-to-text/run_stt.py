# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""
Microsoft speech service
Refer to with `Microsoft Speech-to-text quickstart
<https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text?tabs=windowsinstall&pivots=programming-language-python#install-and-import-the-speech-sdk>`
"""
import azure.cognitiveservices.speech as speechsdk
import dask.dataframe as dd

# Set up the subscription info for the Speech Service:
speech_key, service_region = "4b69b69b6e664122ba95bf8fc86ce89f", "eastus"

# Create an instance of a Speech Config object
# Replace with your own subscription key and service region (e.g., "westus").
speech_config = speechsdk.SpeechConfig(
    subscription=speech_key,
    region=service_region)


# Define the from_file function
# audio_file: The audio file which will be transcribed
def speech_to_text(audio_file):
    print(audio_file)
    audio_input = speechsdk.AudioConfig(filename=audio_file)
    speech_recognizer = speechsdk.SpeechRecognizer(
        speech_config=speech_config,
        audio_config=audio_input)
    result = speech_recognizer.recognize_once_async().get()
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        print("Recognized: {}".format(result.text))
        return result.text
    elif result.reason == speechsdk.ResultReason.NoMatch:
        print(f"No speech could be recognized: {result.no_match_details}")
        return "ERROR_Rec"
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print(f"Speech Recognition canceled: {cancellation_details.reason}")
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print(f"Error details: {cancellation_details.error_details}")
        return "ERROR_Canc"
    return


# Replace with your input golden lables file
golden_label_file = 'speakers_all.csv'
ddf = dd.read_csv(
    golden_label_file,
    sep=",",
    header=0,
    dtype={'age': 'float64',
           'age_onset': 'float64'},
    names=[
        "age",
        "age_onset",
        "birthplace",
        "filename",
        "native_language",
        "sex",
        "speakerid",
        "country",
        "file_missing"],
)
pdf = ddf.compute()
filtered_pdf = pdf[(pdf.file_missing is False)]

# Show the transcription for each audio file

predicted_text = []
ground_truth_text = open("passage.txt", "r").read()
ground_truth = [ground_truth_text for i in range(len(filtered_pdf))]
filtered_pdf["ground_truth_text"] = ground_truth
recordings_location = "recordings/wav/"

file_paths = []
for index in filtered_pdf.index:
    file_index = filtered_pdf["filename"][index]
    source_audio = recordings_location + file_index + ".wav"
    file_paths.append(source_audio)
    print(index)
    print("SOURCE AUDIO", source_audio)
    predicted_asr = speech_to_text(source_audio)
    predicted_text.append(predicted_asr)
filtered_pdf["predicted_text"] = predicted_text
filtered_pdf["file_paths"] = file_paths


# Replace with your output results file
results_file = 'stt_testing_data.csv'
filtered_pdf.to_csv(results_file)
print("Transcription results are saved in ", results_file)

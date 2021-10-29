# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.
"""
Microsoft face verify service
Refer to with `Microsoft face verify quickstart
<https://docs.microsoft.com/en-us/azure/cognitive-services/face/quickstarts/python-sdk#verify-faces>`
"""
import dask.dataframe as dd
from azure.cognitiveservices.vision.face import FaceClient
from msrest.authentication import CognitiveServicesCredentials

# Replace with a valid Subscription Key here.
KEY = 'subscription key'
# Replace with your regional Base URL
ENDPOINT = 'https://westus2.api.cognitive.microsoft.com'

# Create an authenticated FaceClient.
face_client = FaceClient(ENDPOINT, CognitiveServicesCredentials(KEY))


# Define face_verify function
def face_verify(
    source_image,
    target_image,
    recognition_model='recognition_04',
    detection_model='detection_03',
):
    """
    Runs Cognitive Service Face detection client on two input images.

    Parameters:
    - Source_image: Source image file path
    - Target_image: Target image file path
    - Recognition_model: Model used for facial recognition
        Supported values:
            - 'recogntion_01',
            - 'recognition_02,
            - 'recognition_03',
            - 'recognition_04'
    - Detection_model: Model used for facial detection
        Supported values: 'detection_01', 'detection_02', 'detection_03'
    """
    # Detect all faces in the source image
    source_image_stream = open(source_image, "rb")
    source_detected_faces = face_client.face.detect_with_stream(
        image=source_image_stream,
        recognition_model=recognition_model,
        detection_model=detection_model,
    )
    if len(source_detected_faces) == 0:
        print("No face detected from ", source_image)
        return 0

    # Detect all faces in the target image
    target_image_stream = open(target_image, "rb")
    target_detected_faces = face_client.face.detect_with_stream(
        image=target_image_stream,
        recognition_model=recognition_model,
        detection_model=detection_model,
    )
    if len(target_detected_faces) == 0:
        print("No face detected from ", target_image)
        return 0

    # Verify the first/largest face in the source image
    # To each face in the target image.
    maxConfidence = 0
    for i in range(len(target_detected_faces)):
        target_face_id = target_detected_faces[i].face_id
        verify_result = face_client.face.verify_face_to_face(
            source_detected_faces[0].face_id,
            target_face_id,
        )
        if verify_result.confidence > maxConfidence:
            maxConfidence = verify_result.confidence
    # Return best confidence score as the matching score.
    return maxConfidence


# Replace with your input golden lables file
golden_label_file = 'golden_labels.csv'
ddf = dd.read_csv(
    golden_label_file,
    sep=",",
    header=0,
    names=["source_image", "target_image", "race", "gender", "golden_label"],
)
pdf = ddf.compute()

# Calculate matching score for each source and target images pair
matching_score = []
for index in range(len(pdf)):
    source_image = pdf["source_image"][index]
    target_image = pdf["target_image"][index]
    print("source image:", source_image)
    print("target image:", target_image)
    matching_score.append(face_verify(source_image, target_image))
pdf["matching score"] = matching_score

# Replace with your output results file
results_file = 'face_verify_testing_data.csv'
pdf.to_csv(results_file)
print("Matching results are saved in ", results_file)

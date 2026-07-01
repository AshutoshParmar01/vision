import sys
import json
import cv2
from insightface.app import FaceAnalysis

face_app = FaceAnalysis()

face_app.prepare(
    ctx_id=-1,         
    det_size=(640, 640)
)

image_path = sys.argv[1]

image = cv2.imread(image_path)

if image is None:
    raise FileNotFoundError(f"Could not read {image_path}")

detected_faces = face_app.get(image)

result = []

for face in detected_faces:

    result.append({

        "bbox": face.bbox.tolist(),

        "embedding": face.embedding.tolist()

    })

print("===JSON_START===")

print(
    json.dumps(
        {
            "count": len(result),
            "faces": result
        }
    )
)
